#!/usr/bin/env node
// recent-changes-writer: emits public/recent-changes.json for the /recent-changes
// page. Reads the last N git commits that touched src/content/articles/*.mdx
// and produces a Wikipedia-style change feed: per article, per commit, with
// byte delta, commit sha, author, and the commit's edit summary.
//
// Wikipedia's Special:RecentChanges shape (what we mirror):
//   HH:MM  (diff | hist)  Article Title  (+N) ..  bot  summary
//
// Run: node botnet/lib/recent-changes-writer.mjs

import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const OUT_PATH = process.env.RECENT_CHANGES_PATH ||
  join(REPO_ROOT, 'public', 'recent-changes.json');

const COMMIT_LIMIT = Number(process.env.RECENT_CHANGES_COMMITS || 60);

const titleCache = new Map();
function titleFor(slug) {
  if (titleCache.has(slug)) return titleCache.get(slug);
  let title = slug;
  try {
    const path = join(REPO_ROOT, 'src', 'content', 'articles', `${slug}.mdx`);
    if (existsSync(path)) {
      const text = readFileSync(path, 'utf8');
      const m = text.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
      if (m) title = m[1].replace(/''/g, "'");
    }
  } catch {}
  if (title === slug) {
    title = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  }
  titleCache.set(slug, title);
  return title;
}

// Pull the last N commits that touched any article file, with numstat.
// numstat lines look like:  "ADDED\tDELETED\tpath"
// commit headers look like: "@@ <sha>\t<isoDate>\t<author>\t<subject>"
let raw = '';
try {
  raw = execSync(
    `git log -n ${COMMIT_LIMIT} --no-merges --numstat ` +
    `--pretty=format:"@@%H%x09%aI%x09%an%x09%s" -- 'src/content/articles/*.mdx'`,
    { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }
  );
} catch (err) {
  console.error('[recent-changes] git log failed:', err.message);
  process.exit(1);
}

const commits = [];
let current = null;
for (const line of raw.split('\n')) {
  if (line.startsWith('@@')) {
    if (current) commits.push(current);
    const [sha, iso, author, ...rest] = line.slice(2).split('\t');
    current = {
      sha,
      sha_short: sha.slice(0, 7),
      ts: iso,
      author,
      summary: rest.join('\t'),
      changes: [],
    };
  } else if (line.trim() && current) {
    const [addStr, delStr, path] = line.split('\t');
    if (!path || !path.startsWith('src/content/articles/') || !path.endsWith('.mdx')) continue;
    const added = parseInt(addStr, 10);
    const deleted = parseInt(delStr, 10);
    if (!Number.isFinite(added) || !Number.isFinite(deleted)) continue;
    const slug = path.slice('src/content/articles/'.length, -'.mdx'.length);
    current.changes.push({
      slug,
      title: titleFor(slug),
      added_lines: added,
      deleted_lines: deleted,
      net_lines: added - deleted,
      path,
      // The "## From <source-slug>" section in the diff tells us which
      // recording the new claims came from. Best-effort extraction.
      from_source: null,
      kind: deleted === 0 && added >= 8 ? 'spawn' : 'amend',
    });
  }
}
if (current) commits.push(current);

// Backfill from_source via a second pass per commit (only if there's at least
// one amend that we want to attribute). Cheap enough — one git show per commit.
for (const c of commits) {
  if (!c.changes.length) continue;
  let body = '';
  try {
    body = execSync(`git show ${c.sha} -- 'src/content/articles/*.mdx'`, {
      cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    });
  } catch { continue; }
  const sources = new Set();
  const m = body.matchAll(/\+## From ([0-9a-z][0-9a-z-]+)/g);
  for (const x of m) sources.add(x[1]);
  if (sources.size === 1) {
    const only = [...sources][0];
    for (const ch of c.changes) if (ch.from_source === null) ch.from_source = only;
  } else if (sources.size > 1) {
    // Multiple sources in one commit — leave per-change source null but stamp
    // the commit-level list so the UI can show "(from N sources)" badge.
    c.sources_in_commit = [...sources];
  }
}

// Pre-flatten: one row per (commit, article). Newest first. Cap to a
// generous limit so the UI doesn't get a huge JSON payload.
const rows = [];
for (const c of commits) {
  for (const ch of c.changes) {
    rows.push({
      ts: c.ts,
      sha: c.sha,
      sha_short: c.sha_short,
      author: c.author,
      summary: c.summary,
      ...ch,
    });
  }
}
rows.sort((a, b) => (a.ts < b.ts ? 1 : -1));

const payload = {
  generated_at: new Date().toISOString(),
  commit_count: commits.length,
  change_count: rows.length,
  rows: rows.slice(0, 400),
};

writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
console.log(`[recent-changes] wrote ${rows.length} changes across ${commits.length} commits → ${OUT_PATH}`);
