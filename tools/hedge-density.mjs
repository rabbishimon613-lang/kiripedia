#!/usr/bin/env node
// hedge-density.mjs — measure hedge word density per article (hedges per 1000 words)
//
// Hedge lexicon covers the classic LLM-inserted softeners that violate
// KiriPedia's "encyclopedic voice / single-source declarative" doctrine.
// John's statements are cited facts; hedging them is a doctrine violation.
//
// Usage:
//   node tools/hedge-density.mjs                  # all articles, sorted by density desc
//   node tools/hedge-density.mjs --top 20         # top 20 offenders
//   node tools/hedge-density.mjs --threshold 5    # only articles above 5 hedges/1000w
//   node tools/hedge-density.mjs --slug foo       # single article
//   node tools/hedge-density.mjs --json           # machine-readable output

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(HERE, '..', 'src', 'content', 'articles');

const args = process.argv.slice(2);
const TOP = parseInt(args[args.indexOf('--top') + 1]) || Infinity;
const THRESHOLD = parseFloat(args[args.indexOf('--threshold') + 1]) || 0;
const SLUG_FILTER = args[args.indexOf('--slug') + 1] || null;
const JSON_OUT = args.includes('--json');

// ── Hedge lexicon ────────────────────────────────────────────────────────────
// Each entry: { id, re }. The regex is word-boundary aware and case-insensitive.
// Groups: attribution-as-hedge vs softener vs weasel-qualifier.
const HEDGES = [
  // Hard attribution violations (also caught by mouth-sentry, but we measure density here too)
  { id: 'allegedly',       re: /\ballegedly\b/gi },
  { id: 'reportedly',      re: /\breportedly\b/gi },
  { id: 'purportedly',     re: /\bpurportedly\b/gi },
  { id: 'supposedly',      re: /\bsupposedly\b/gi },
  { id: 'is-said-to',      re: /\bis said to\b/gi },
  { id: 'are-said-to',     re: /\bare said to\b/gi },
  { id: 'it-is-claimed',   re: /\bit is claimed\b/gi },
  { id: 'it-has-been-claimed', re: /\bit has been claimed\b/gi },
  { id: 'claimed-that',    re: /\bclaimed that\b/gi },
  { id: 'sources-claim',   re: /\bsources? (?:claim|say|allege|report)\b/gi },
  { id: 'observers-say',   re: /\bobservers? (?:say|note|suggest)\b/gi },
  { id: 'some-say',        re: /\bsome (?:say|claim|suggest|believe|argue)\b/gi },
  { id: 'many-believe',    re: /\bmany (?:believe|say|claim|suggest)\b/gi },
  // Weasel-qualifier softeners
  { id: 'appears-to',      re: /\bappears? to\b/gi },
  { id: 'seems-to',        re: /\bseems? to\b/gi },
  { id: 'may-have',        re: /\bmay have\b/gi },
  { id: 'might-have',      re: /\bmight have\b/gi },
  { id: 'could-have',      re: /\bcould have\b/gi },
  { id: 'possibly',        re: /\bpossibly\b/gi },
  { id: 'perhaps',         re: /\bperhaps\b/gi },
  { id: 'it-is-possible',  re: /\bit is possible\b/gi },
  { id: 'it-seems',        re: /\bit seems\b/gi },
  { id: 'it-appears',      re: /\bit appears\b/gi },
  // Attribution-as-sourcing phrases (should be in Cite tags, not prose)
  { id: 'according-to',    re: /\baccording to\b/gi },
  { id: 'per-kiriakou',    re: /\bper (?:Kiriakou|John|JK)\b/gi },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function stripFrontmatter(raw) {
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function stripMdxSyntax(prose) {
  return prose
    .replace(/<Cite[^/]*/g, ' ')   // strip Cite tags
    .replace(/<[^>]+>/g, ' ')      // strip all other tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) → text
    .replace(/```[\s\S]*?```/g, ' ')  // code blocks
    .replace(/`[^`]*`/g, ' ');     // inline code
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function scanArticle(slug, path) {
  const raw = readFileSync(path, 'utf8');
  const prose = stripMdxSyntax(stripFrontmatter(raw));
  const wordCount = countWords(prose);
  if (wordCount === 0) return null;

  const hedgeCounts = {};
  let totalHedges = 0;
  for (const { id, re } of HEDGES) {
    const matches = [...prose.matchAll(re)];
    if (matches.length > 0) {
      hedgeCounts[id] = matches.length;
      totalHedges += matches.length;
    }
  }

  const density = (totalHedges / wordCount) * 1000;
  return { slug, wordCount, totalHedges, density, hedgeCounts };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const files = readdirSync(ARTICLES_DIR)
  .filter(f => f.endsWith('.mdx'))
  .filter(f => !SLUG_FILTER || f.replace(/\.mdx$/, '') === SLUG_FILTER);

const results = [];
for (const f of files) {
  const slug = f.replace(/\.mdx$/, '');
  const result = scanArticle(slug, join(ARTICLES_DIR, f));
  if (result) results.push(result);
}

results.sort((a, b) => b.density - a.density);

const filtered = results
  .filter(r => r.density >= THRESHOLD)
  .slice(0, TOP);

if (JSON_OUT) {
  // Corpus-level stats
  const totalWords = results.reduce((s, r) => s + r.wordCount, 0);
  const totalHedges = results.reduce((s, r) => s + r.totalHedges, 0);
  const corpusDensity = (totalHedges / totalWords) * 1000;
  console.log(JSON.stringify({
    corpus: { articles: results.length, totalWords, totalHedges, corpusDensity },
    articles: filtered,
  }, null, 2));
  process.exit(0);
}

// ── Human-readable report ────────────────────────────────────────────────────

const totalWords = results.reduce((s, r) => s + r.wordCount, 0);
const totalHedges = results.reduce((s, r) => s + r.totalHedges, 0);
const corpusDensity = (totalHedges / totalWords) * 1000;

// Tally per-hedge-id across corpus
const hedgeTotals = {};
for (const r of results) {
  for (const [id, n] of Object.entries(r.hedgeCounts)) {
    hedgeTotals[id] = (hedgeTotals[id] || 0) + n;
  }
}
const topHedgeTypes = Object.entries(hedgeTotals)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log(`\n=== HEDGE DENSITY BASELINE — KiriPedia corpus ===`);
console.log(`Articles scanned:  ${results.length}`);
console.log(`Total words:       ${totalWords.toLocaleString()}`);
console.log(`Total hedges:      ${totalHedges}`);
console.log(`Corpus density:    ${corpusDensity.toFixed(2)} hedges/1000w`);
console.log(`\n--- Top hedge types (corpus-wide) ---`);
for (const [id, n] of topHedgeTypes) {
  console.log(`  ${id.padEnd(20)} ${n}`);
}
console.log(`\n--- Articles by hedge density (${filtered.length} shown${THRESHOLD > 0 ? ', threshold=' + THRESHOLD : ''}) ---`);
console.log(`${'Density'.padStart(8)}  ${'Hedges'.padStart(6)}  ${'Words'.padStart(7)}  Slug`);
console.log('-'.repeat(70));
for (const r of filtered) {
  const topTypes = Object.entries(r.hedgeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, n]) => `${id}×${n}`)
    .join(', ');
  console.log(`${r.density.toFixed(2).padStart(8)}  ${String(r.totalHedges).padStart(6)}  ${String(r.wordCount).padStart(7)}  ${r.slug}  [${topTypes}]`);
}

// Monotonic-softening check: compare current density across git revisions
// (this requires git log access; surfaced here as a note for the patrol daemon)
console.log(`\n--- Rollback rule ---`);
console.log(`Monotonic hedge density increase across ≥3 consecutive revisions`);
console.log(`without new Cite tags → revert to lowest-density revision.`);
console.log(`Run diff-sentinel.mjs for per-revision tracking.`);
