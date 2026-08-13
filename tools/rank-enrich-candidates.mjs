#!/usr/bin/env node
// Strict starvation ranker for the daily enricher pass.
//
// `build-mentions-index.mjs` answers "which paragraphs mention this subject?"
// with a deliberately loose alias match — good for recall during an ingest,
// useless for ranking, because a one-word title like `hummus` or a common
// noun inside a sentence-shaped title matches thousands of paragraphs and
// floats to the top of the raw uncited count.
//
// This tool re-scores the same corpus strictly, so the enricher can pick the
// fifteen genuinely starving-but-fuelled articles instead of the fifteen
// noisiest ones:
//
//   1. Title → distinctive tokens. Stopwords dropped, and any token whose
//      document frequency across the transcript corpus exceeds --df-max
//      (default 20%) is treated as common and dropped too.
//   2. Articles yielding fewer than two distinctive tokens are SKIPPED
//      outright and reported separately — they cannot be scored honestly.
//   3. A paragraph counts as a hit only when two distinct distinctive tokens
//      appear within --window characters (default 90) of each other.
//   4. Caption noise ([Music], [Applause], [laughter], >> turn markers) is
//      stripped before matching.
//   5. Hits are deduplicated by source: the score is the number of DISTINCT
//      uncited sources, because the enrichment floor is stated in sources.
//   6. Sources already cited by the article are excluded, as are articles
//      previously fattened (parsed out of ENRICH-LOG.md) unless --all.
//
// Usage:
//   node tools/rank-enrich-candidates.mjs [--max-words 340] [--top 60]
//                                         [--window 90] [--df-max 0.2] [--all]

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';

const ARTICLES = 'src/content/articles';
const SOURCES = 'src/content/sources';
const LOG = 'ENRICH-LOG.md';

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? dflt : argv[i + 1];
};
const MAX_WORDS = Number(opt('max-words', 340));
const TOP = Number(opt('top', 60));
const WINDOW = Number(opt('window', 90));
const DF_MAX = Number(opt('df-max', 0.2));
const INCLUDE_DONE = argv.includes('--all');

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'at', 'as',
  'by', 'with', 'from', 'into', 'that', 'this', 'his', 'her', 'their', 'its',
  'was', 'were', 'is', 'are', 'be', 'been', 'not', 'no', 'but', 'it', 'he',
  'she', 'they', 'we', 'you', 'i', 'who', 'what', 'when', 'why', 'how',
  'kiriakou', 'john', 'cia', 'kiriakous',
]);

// ---- previously fattened -----------------------------------------------
const done = new Set();
if (existsSync(LOG)) {
  const log = readFileSync(LOG, 'utf8');
  // Table rows look like: | `slug` | 154 | 717 | 8 | 7 |
  for (const m of log.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)) done.add(m[1]);
}

// ---- articles ------------------------------------------------------------
function prose(body) {
  return body
    .replace(/<Cite[^>]*\/>/g, ' ')
    .replace(/<References[^>]*\/?>/g, ' ')
    .replace(/^import .*$/gm, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`|-]/g, ' ');
}

const articles = [];
for (const f of readdirSync(ARTICLES).filter(x => x.endsWith('.mdx'))) {
  const slug = f.replace(/\.mdx$/, '');
  const raw = readFileSync(`${ARTICLES}/${f}`, 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  let fm;
  try { fm = yaml.load(fmMatch[1]); } catch { continue; }
  const body = raw.slice(fmMatch[0].length);
  const words = prose(body).split(/\s+/).filter(Boolean).length;
  const citedSources = new Set(
    [...body.matchAll(/<Cite\s+s=["']([^"']+)["']/g)].map(m => m[1])
  );
  articles.push({ slug, title: String(fm.title || slug), words, citedSources });
}

// ---- sources -------------------------------------------------------------
function clean(text) {
  return text
    .replace(/\[(music|applause|laughter|laughs|inaudible)\]/gi, ' ')
    .replace(/>>/g, ' ')
    .toLowerCase();
}

const sources = [];
for (const f of readdirSync(SOURCES).filter(x => x.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  const raw = readFileSync(`${SOURCES}/${f}`, 'utf8');
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const paras = [];
  let cur = null;
  for (const line of body.split('\n')) {
    const m = line.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/);
    if (m) {
      if (cur) paras.push(cur);
      cur = { t: m[1], text: m[2] };
    } else if (cur && line.trim()) {
      cur.text += ' ' + line.trim();
    }
  }
  if (cur) paras.push(cur);
  sources.push({ slug, paras: paras.map(p => ({ t: p.t, text: clean(p.text) })) });
}

// ---- document frequency of every token across the corpus -----------------
const df = new Map();
for (const s of sources) {
  const seen = new Set();
  for (const p of s.paras) {
    for (const w of p.text.match(/[a-z][a-z'-]{2,}/g) || []) seen.add(w);
  }
  for (const w of seen) df.set(w, (df.get(w) || 0) + 1);
}
const N = sources.length;

function distinctiveTokens(title) {
  const toks = (title.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [])
    .filter(t => !STOP.has(t));
  return [...new Set(toks)].filter(t => (df.get(t) || 0) / N <= DF_MAX);
}

// ---- score ---------------------------------------------------------------
const scored = [];
const unscorable = [];
for (const a of articles) {
  if (a.words > MAX_WORDS) continue;
  if (!INCLUDE_DONE && done.has(a.slug)) continue;
  const toks = distinctiveTokens(a.title);
  if (toks.length < 2) { unscorable.push(a); continue; }

  const hitSources = new Map(); // source -> [timestamps]
  for (const s of sources) {
    if (a.citedSources.has(s.slug)) continue;
    for (const p of s.paras) {
      // positions of each distinctive token in this paragraph
      const pos = [];
      for (const t of toks) {
        const rx = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        let m;
        while ((m = rx.exec(p.text))) pos.push({ t, i: m.index });
      }
      if (pos.length < 2) continue;
      pos.sort((x, y) => x.i - y.i);
      let ok = false;
      for (let i = 0; i < pos.length && !ok; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          if (pos[j].i - pos[i].i > WINDOW) break;
          if (pos[j].t !== pos[i].t) { ok = true; break; }
        }
      }
      if (!ok) continue;
      if (!hitSources.has(s.slug)) hitSources.set(s.slug, []);
      if (hitSources.get(s.slug).length < 6) hitSources.get(s.slug).push(p.t);
    }
  }
  if (hitSources.size < 2) continue;
  scored.push({
    ...a,
    tokens: toks,
    fuelSources: hitSources.size,
    hits: [...hitSources.entries()].map(([src, ts]) => ({ src, ts })),
  });
}

scored.sort((x, y) =>
  (y.fuelSources - x.fuelSources) || (x.words - y.words)
);

console.log(`\nStrict starvation ranking — ${scored.length} candidates ` +
  `(<${MAX_WORDS} words, >=2 uncited fuel sources, ${done.size} already-fattened excluded).\n`);
console.log(`${'slug'.padEnd(42)} ${'words'.padStart(6)} ${'fuelsrc'.padStart(8)}  tokens`);
console.log('-'.repeat(96));
for (const c of scored.slice(0, TOP)) {
  console.log(
    `${c.slug.padEnd(42)} ${String(c.words).padStart(6)} ${String(c.fuelSources).padStart(8)}  ${c.tokens.join(',')}`
  );
}
console.log(`\nUnscorable (fewer than two distinctive title tokens): ${unscorable.length}`);

if (argv.includes('--json')) {
  const out = Object.fromEntries(scored.slice(0, TOP).map(c => [c.slug, c]));
  console.log('\n---JSON---\n' + JSON.stringify(out, null, 1));
}
