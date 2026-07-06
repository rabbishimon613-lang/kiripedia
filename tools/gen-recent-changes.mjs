#!/usr/bin/env node
// Build the Recent-changes feed (public/recent-changes.json) straight from the
// real git history of the article collection. This is the ONLY source of the
// feed now — it replaces the old botnet snapshot loop, which is frozen. Because
// it runs in the `npm run build` chain (and can be run by hand), the Recent
// changes page always reflects the actual commits, never a stale snapshot.
//
// One `git log -p` pass over src/content/articles gives us everything per
// commit+file: line delta (added/deleted) and the source recordings whose
// <Cite s="…"> citations were added in that commit.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = 'src/content/articles';
const OUT = path.join(ROOT, 'public', 'recent-changes.json');
const MAX_ROWS = 500;
const REC = '\x1e'; // record separator — won't appear in commit metadata

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
}

// Titles rarely change, so read them from the current working tree. Articles
// that no longer exist get a slug-derived title (and are dropped below anyway).
const titleCache = new Map();
function titleFor(slug) {
  if (titleCache.has(slug)) return titleCache.get(slug);
  let title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const f = path.join(ROOT, ARTICLES_DIR, slug + '.mdx');
  if (existsSync(f)) {
    const m = readFileSync(f, 'utf8').slice(0, 4000).match(/^title:\s*(.+)$/m);
    if (m) title = m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  titleCache.set(slug, title);
  return title;
}

// Which article slugs currently exist — we only surface changes to live
// articles so every row in the ledger links somewhere real.
const existing = new Set(
  readdirSync(path.join(ROOT, ARTICLES_DIR))
    .filter(x => x.endsWith('.mdx'))
    .map(x => x.slice(0, -4))
);

// Fail soft: if git history isn't available (e.g. a shallow/gitless build
// environment), keep whatever public/recent-changes.json is already committed
// rather than breaking the whole build.
let log;
try {
  log = git([
    'log', '--no-merges', '--date=iso-strict',
    `--pretty=format:${REC}%H|%an|%aI|%s`,
    '-p', '--', ARTICLES_DIR,
  ]);
} catch (err) {
  console.warn(`recent-changes: skipped (git history unavailable: ${err.message.split('\n')[0]}); keeping existing feed`);
  process.exit(0);
}

const raw = []; // newest-first, one entry per commit+file
let commit = null;
let file = null;

function flushFile() {
  if (commit && file && (file.added || file.deleted)) raw.push({ ...file, ...commit });
  file = null;
}

for (const line of log.split('\n')) {
  if (line[0] === REC) {
    flushFile();
    const [sha, author, ts, ...summ] = line.slice(1).split('|');
    commit = { sha, author, ts, summary: summ.join('|') };
    continue;
  }
  const dm = line.match(/^diff --git a\/src\/content\/articles\/(.+?)\.mdx b\//);
  if (dm) {
    flushFile();
    file = { slug: dm[1], added: 0, deleted: 0, sources: [] };
    continue;
  }
  if (!file) continue;
  if (line.startsWith('+++') || line.startsWith('---')) continue;
  if (line[0] === '+') {
    file.added++;
    for (const m of line.matchAll(/<Cite\s+s="([^"]+)"/g)) file.sources.push(m[1]);
  } else if (line[0] === '-') {
    file.deleted++;
  }
}
flushFile();

// The oldest commit that touches a slug is its "spawn" (article created);
// every later touch is an "amend". Log is newest-first, so the last index we
// see a slug at is the spawn.
const spawnIdx = new Map();
raw.forEach((r, i) => spawnIdx.set(r.slug, i));

// Most-cited source in the commit's added lines becomes the row's provenance.
function topSource(sources) {
  if (!sources.length) return null;
  const counts = new Map();
  for (const s of sources) counts.set(s, (counts.get(s) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

const rows = [];
for (let i = 0; i < raw.length && rows.length < MAX_ROWS; i++) {
  const r = raw[i];
  if (!existing.has(r.slug)) continue; // skip deleted/renamed-away articles
  const net = r.added - r.deleted;
  rows.push({
    ts: r.ts,
    sha: r.sha,
    sha_short: r.sha.slice(0, 7),
    author: r.author,
    summary: r.summary,
    slug: r.slug,
    title: titleFor(r.slug),
    added_lines: r.added,
    deleted_lines: r.deleted,
    net_lines: net,
    path: `${ARTICLES_DIR}/${r.slug}.mdx`,
    from_source: topSource(r.sources),
    kind: spawnIdx.get(r.slug) === i ? 'spawn' : 'amend',
  });
}

const payload = { generated_at: new Date().toISOString(), count: rows.length, rows };

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload));
console.log(`recent-changes: wrote ${rows.length} rows → public/recent-changes.json`);
