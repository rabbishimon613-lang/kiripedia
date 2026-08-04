#!/usr/bin/env node
// Mechanical half of the daily 7pm SEO run.
//
// Everything in here is deterministic and needs no login: it audits the corpus
// on disk and prints a report. The agent half of the routine supplies the parts
// that require a signed-in browser (Search Console queries, Vercel analytics)
// and the parts that require judgement (writing a title that earns the click).
//
// Splitting it this way keeps the routine cheap and keeps its findings
// reproducible: two runs over the same corpus print the same numbers.
//
// Usage: node tools/seo-daily.mjs [--json]

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = join(ROOT, 'src/content/articles');
const STATE = join(ROOT, '.kir-seo-state.json');

const THIN_WORDS = 300;
const asJson = process.argv.includes('--json');

function splitFm(text) {
  if (!text.startsWith('---')) return ['', text];
  const end = text.indexOf('\n---', 3);
  return end === -1 ? ['', text] : [text.slice(3, end), text.slice(end + 4)];
}
const has = (fm, key) => new RegExp(`^${key}:\\s*\\S`, 'm').test(fm);
const val = (fm, key) => {
  const m = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm);
  return m ? m[1].trim().replace(/^["'](.*)["']$/, '$1') : '';
};

const files = (await readdir(ARTICLES)).filter((f) => f.endsWith('.mdx'));
const slugs = new Set(files.map((f) => f.slice(0, -4)));

const arts = [];
const inbound = new Map([...slugs].map((s) => [s, 0]));
for (const f of files) {
  const slug = f.slice(0, -4);
  const raw = await readFile(join(ARTICLES, f), 'utf8');
  const [fm, body] = splitFm(raw);
  const links = new Set(
    [...body.matchAll(/\]\(\/wiki\/([a-z0-9-]+)\/?\)/g)].map((m) => m[1]).filter((s) => slugs.has(s) && s !== slug),
  );
  for (const l of links) inbound.set(l, inbound.get(l) + 1);
  arts.push({
    slug,
    words: body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
    seoTitle: has(fm, 'seoTitle'),
    deck: has(fm, 'deck'),
    noindex: has(fm, 'noindex'),
    grounded: has(fm, 'wikidata') || has(fm, 'wikipedia'),
    summaryLen: val(fm, 'summary').length,
    outbound: links.size,
  });
}
for (const a of arts) a.inbound = inbound.get(a.slug);

// Related-articles coverage: the block is what keeps the long tail reachable,
// so a drop here is a regression worth catching the day it happens.
let relatedCovered = 0;
let relatedInbound = new Map();
const relPath = join(ROOT, 'src/data/related.json');
if (existsSync(relPath)) {
  const rel = JSON.parse(await readFile(relPath, 'utf8'));
  relatedInbound = new Map([...slugs].map((s) => [s, 0]));
  for (const [, list] of Object.entries(rel)) {
    if (list.length) relatedCovered++;
    for (const r of list) relatedInbound.set(r.slug, (relatedInbound.get(r.slug) ?? 0) + 1);
  }
}

const report = {
  date: new Date().toISOString().slice(0, 10),
  articles: arts.length,
  orphans: arts.filter((a) => a.inbound === 0).length,
  thin: arts.filter((a) => a.words < THIN_WORDS).length,
  veryThin: arts.filter((a) => a.words < 150).length,
  noindexed: arts.filter((a) => a.noindex).length,
  withSeoTitle: arts.filter((a) => a.seoTitle).length,
  withDeck: arts.filter((a) => a.deck).length,
  grounded: arts.filter((a) => a.grounded).length,
  relatedBlocksRendered: relatedCovered,
  relatedOrphans: [...relatedInbound].filter(([, n]) => n === 0).length,
  // Long summaries get truncated into a mid-word snippet unless a deck overrides
  // them, so these are the pages whose SERP text is currently being cut off.
  clampedSnippets: arts.filter((a) => !a.deck && a.summaryLen > 155).length,
};

// Candidate queue for the judgement half: substantial pages that are search-
// visible in principle but have no purpose-written title or description yet.
// Ranked by inbound links, as a rough proxy for which ones the corpus itself
// treats as important. Search Console impressions, when the agent has them,
// should override this ordering.
const candidates = arts
  .filter((a) => !a.noindex && !a.seoTitle && !a.deck && a.words >= THIN_WORDS)
  .sort((x, y) => y.inbound - x.inbound || y.words - x.words)
  .slice(0, 25)
  .map((a) => ({ slug: a.slug, inbound: a.inbound, words: a.words }));

let previous = null;
if (existsSync(STATE)) {
  try {
    previous = JSON.parse(await readFile(STATE, 'utf8'));
  } catch { /* first clean run after a corrupt write */ }
}

const delta = {};
if (previous) {
  for (const k of Object.keys(report)) {
    if (typeof report[k] === 'number' && typeof previous[k] === 'number' && report[k] !== previous[k]) {
      delta[k] = report[k] - previous[k];
    }
  }
}

await mkdir(dirname(STATE), { recursive: true });
await writeFile(STATE, JSON.stringify(report, null, 2) + '\n');

if (asJson) {
  console.log(JSON.stringify({ report, delta, candidates }, null, 2));
} else {
  console.log(`KiriPedia corpus SEO audit — ${report.date}`);
  for (const [k, v] of Object.entries(report)) {
    if (k === 'date') continue;
    const d = delta[k];
    console.log(`  ${k.padEnd(24)} ${String(v).padStart(5)}${d ? `  (${d > 0 ? '+' : ''}${d} since last run)` : ''}`);
  }
  console.log('\nTop pages with no purpose-written title or description yet:');
  for (const c of candidates.slice(0, 15)) {
    console.log(`  ${c.slug.padEnd(44)} ${String(c.inbound).padStart(3)} inbound, ${c.words} words`);
  }
}
