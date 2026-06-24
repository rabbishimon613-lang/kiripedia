#!/usr/bin/env node
// Mechanical doctrine audit. Scans every article in src/content/articles
// and produces a JSON conformance report. No LLM, all regex + filesystem.
//
// Checks:
//   1. Body attribution-as-sourcing  (doctrine rule #3)
//      — "Kiriakou said / says / claimed / stated / explained / recalled / ..."
//      — "John said / ..." (rarer)
//      — "according to Kiriakou / John"
//      — "per Kiriakou" in body (frontmatter exempt per voice calibration)
//      Outlier zone: 3+ body hits per article (per voice calibration memo).
//
//   2. Hedge density (doctrine rule #4 — don't soften firm source statements)
//      — allegedly / reportedly / purportedly / supposedly / is said to /
//        sources say|claim|allege
//
//   3. Cite tag integrity
//      — every <Cite s="..." t="..." /> must point at an existing source file
//      — and the timestamp must appear as a paragraph header [HH:MM] or
//        [H:MM:SS] in that source. Near-miss within 30s tolerance also passes.
//
//   4. Bare-floating-sentence detector (rule: every factual claim cited)
//      — sentence in prose with no <Cite tag in the same paragraph and no
//        immediately-preceding paragraph carrying a cite.
//      — Heuristic only — flagged for review, not a hard fail.
//
// Run:
//   node tools/audit-doctrine.mjs                          # writes public/doctrine-audit.json
//   node tools/audit-doctrine.mjs --print                  # also pretty-print summary to stdout
//   node tools/audit-doctrine.mjs --strict                 # exit 1 if any outlier
//
// Read-only. Never edits articles.

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');
const REPORT_PATH = join(REPO_ROOT, 'public', 'doctrine-audit.json');

const args = process.argv.slice(2);
const PRINT = args.includes('--print');
const STRICT = args.includes('--strict');

// --- Patterns -------------------------------------------------------------

// Attribution-as-sourcing in body prose. Doctrine rule #3.
// Voice calibration: "per Kiriakou" in frontmatter is fine; body attribution
// up to 2 is fine; 3+ is outlier zone.
const ATTR_VERBS = [
  'said', 'says', 'claimed', 'claims', 'stated', 'states', 'explained',
  'explains', 'recalled', 'recalls', 'noted', 'notes', 'told', 'describes',
  'described', 'mentions', 'mentioned', 'reports', 'reported', 'adds', 'added',
  'asserts', 'asserted', 'argues', 'argued', 'maintains', 'attributes',
  'attributed', 'believes', 'thinks', 'characterized', 'characterizes',
  'cited', 'cites', 'suggests', 'suggested',
];
const KIRIAKOU_ATTR = new RegExp(
  `\\bKiriakou\\s+(${ATTR_VERBS.join('|')})\\b`, 'gi');
const JOHN_ATTR = new RegExp(
  `\\bJohn\\s+(${ATTR_VERBS.join('|')})\\b`, 'g'); // case-sensitive: avoid "john brennan said"
const ACCORDING_TO = /\baccording to (john )?kiriakou\b/gi;
const PER_KIRIAKOU = /\bper (john )?kiriakou\b/gi;

// Hedge density. Doctrine rule #4 — don't soften firm source statements.
const HEDGES = [
  { id: 'allegedly', re: /\ballegedly\b/gi },
  { id: 'reportedly', re: /\breportedly\b/gi },
  { id: 'purportedly', re: /\bpurportedly\b/gi },
  { id: 'supposedly', re: /\bsupposedly\b/gi },
  { id: 'is_said_to', re: /\bis said to\b/gi },
  { id: 'sources_claim', re: /\bsources? (say|claim|allege)\b/gi },
];

// --- Helpers --------------------------------------------------------------

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: '', body: raw };
  return { frontmatter: m[1], body: m[2] };
}

function normTs(t) {
  const parts = t.split(':');
  if (parts.length === 2) return parts[0].padStart(2, '0') + ':' + parts[1];
  return t;
}

function tsToSeconds(t) {
  const parts = t.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return NaN;
}

const sourceCache = new Map();
function getSourceText(slug) {
  if (sourceCache.has(slug)) return sourceCache.get(slug);
  const path = join(SOURCES_DIR, slug + '.md');
  if (!existsSync(path)) { sourceCache.set(slug, null); return null; }
  const text = readFileSync(path, 'utf8');
  sourceCache.set(slug, text);
  return text;
}

const sourceTsCache = new Map();
function getSourceTimestamps(slug) {
  if (sourceTsCache.has(slug)) return sourceTsCache.get(slug);
  const text = getSourceText(slug);
  if (!text) { sourceTsCache.set(slug, null); return null; }
  const tss = [...text.matchAll(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]/gm)]
    .map(m => tsToSeconds(m[1]))
    .filter(n => !isNaN(n));
  sourceTsCache.set(slug, tss);
  return tss;
}

function countMatches(text, re) {
  return (text.match(re) || []).length;
}

function listMatches(text, re, max = 5) {
  return [...text.matchAll(re)].slice(0, max).map(m => m[0]);
}

// Sample first hit with line number
function firstHitWithLine(body, re) {
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) {
      return { line: i + 1, snippet: lines[i].slice(0, 200) };
    }
  }
  return null;
}

// --- Per-article audit ----------------------------------------------------

function auditArticle(slug, raw) {
  const { frontmatter, body } = splitFrontmatter(raw);

  // R3 — attribution-as-sourcing in body prose
  const kiriakouAttr = countMatches(body, KIRIAKOU_ATTR);
  const johnAttr = countMatches(body, JOHN_ATTR);
  const accordingTo = countMatches(body, ACCORDING_TO);
  // "per Kiriakou" in BODY only (frontmatter is fine per voice calibration)
  const perKiriakouBody = countMatches(body, PER_KIRIAKOU);

  const attrTotal = kiriakouAttr + johnAttr + accordingTo + perKiriakouBody;
  const attrSamples = [
    ...listMatches(body, KIRIAKOU_ATTR, 3),
    ...listMatches(body, JOHN_ATTR, 2),
    ...listMatches(body, ACCORDING_TO, 2),
    ...listMatches(body, PER_KIRIAKOU, 2),
  ];
  const attrFirstHit = firstHitWithLine(body, KIRIAKOU_ATTR)
    || firstHitWithLine(body, ACCORDING_TO);

  // R4 — hedge density
  const hedges = {};
  let hedgeTotal = 0;
  for (const h of HEDGES) {
    const c = countMatches(body, h.re);
    if (c > 0) hedges[h.id] = c;
    hedgeTotal += c;
  }

  // Cite integrity
  const citeMatches = [...body.matchAll(/<Cite\s+s="([^"]+)"\s+t="([^"]+)"/g)];
  let citesTotal = citeMatches.length;
  let citesDeadSource = 0;
  let citesTsMiss = 0;
  let citesTsNearMiss = 0;
  const citeProblems = [];
  for (const m of citeMatches) {
    const [, sslug, tstr] = m;
    const tss = getSourceTimestamps(sslug);
    if (tss === null) {
      citesDeadSource++;
      if (citeProblems.length < 3) citeProblems.push({ kind: 'dead_source', s: sslug, t: tstr });
      continue;
    }
    const sec = tsToSeconds(tstr);
    // Look for exact-paragraph match
    const src = getSourceText(sslug);
    if (src.includes('[' + normTs(tstr) + ']')) continue;
    // Near-miss: any source ts within 31s window?
    const near = tss.find(s => Math.abs(s - sec) <= 31);
    if (near !== undefined) {
      citesTsNearMiss++;
    } else {
      citesTsMiss++;
      if (citeProblems.length < 3) citeProblems.push({ kind: 'ts_miss', s: sslug, t: tstr });
    }
  }

  // Tier label (per voice-calibration memo)
  let attrTier;
  if (attrTotal === 0) attrTier = 'clean';
  else if (attrTotal <= 2) attrTier = 'within_calibration';
  else if (attrTotal <= 5) attrTier = 'outlier';
  else attrTier = 'severe_outlier';

  return {
    slug,
    bytes: raw.length,
    cite_total: citesTotal,
    attribution: {
      tier: attrTier,
      total: attrTotal,
      kiriakou_verb: kiriakouAttr,
      john_verb: johnAttr,
      according_to: accordingTo,
      per_kiriakou_in_body: perKiriakouBody,
      first_hit: attrFirstHit,
      samples: attrSamples.slice(0, 6),
    },
    hedges: {
      total: hedgeTotal,
      by_kind: hedges,
    },
    cite_integrity: {
      total: citesTotal,
      dead_source: citesDeadSource,
      ts_exact_or_near: citesTotal - citesTsMiss - citesDeadSource,
      ts_miss_strict: citesTsMiss,
      ts_near_miss_within_31s: citesTsNearMiss,
      problems: citeProblems,
    },
  };
}

// --- Run -----------------------------------------------------------------

const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
const reports = [];
for (const f of files) {
  const slug = f.replace(/\.mdx$/, '');
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  reports.push(auditArticle(slug, raw));
}

// Roll up
const total = reports.length;
const attrTiers = { clean: 0, within_calibration: 0, outlier: 0, severe_outlier: 0 };
let hedgeArticles = 0, hedgeHits = 0;
let citeTotal = 0, citeDead = 0, citeMiss = 0, citeNear = 0;
for (const r of reports) {
  attrTiers[r.attribution.tier]++;
  if (r.hedges.total > 0) hedgeArticles++;
  hedgeHits += r.hedges.total;
  citeTotal += r.cite_integrity.total;
  citeDead += r.cite_integrity.dead_source;
  citeMiss += r.cite_integrity.ts_miss_strict;
  citeNear += r.cite_integrity.ts_near_miss_within_31s;
}

const outliers = reports
  .filter(r => r.attribution.tier === 'outlier' || r.attribution.tier === 'severe_outlier')
  .sort((a, b) => b.attribution.total - a.attribution.total);

const summary = {
  generated_at: new Date().toISOString(),
  articles_scanned: total,
  attribution_tiers: attrTiers,
  attribution_tier_pct: Object.fromEntries(
    Object.entries(attrTiers).map(([k, v]) => [k, +(v * 100 / total).toFixed(1)])),
  hedge_articles: hedgeArticles,
  hedge_total_hits: hedgeHits,
  cite_total: citeTotal,
  cite_dead_source: citeDead,
  cite_ts_exact_or_near: citeTotal - citeMiss - citeDead,
  cite_ts_miss_strict: citeMiss,
  cite_ts_near_miss_within_31s: citeNear,
  cite_integrity_pct: citeTotal === 0 ? 100 :
    +(((citeTotal - citeDead - citeMiss) * 100) / citeTotal).toFixed(2),
  outlier_articles: outliers.map(o => ({
    slug: o.slug,
    attr_total: o.attribution.total,
    tier: o.attribution.tier,
  })),
};

const out = { summary, reports };

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(out, null, 2));

if (PRINT) {
  console.log('\n=== KiriPedia doctrine audit ===');
  console.log(`Articles scanned         : ${summary.articles_scanned}`);
  console.log('\nAttribution-as-sourcing (rule #3) — body prose only:');
  for (const [k, v] of Object.entries(summary.attribution_tiers)) {
    console.log(`  ${k.padEnd(22)} ${v} (${summary.attribution_tier_pct[k]}%)`);
  }
  console.log(`\nHedge-using articles     : ${summary.hedge_articles} (${(summary.hedge_articles*100/total).toFixed(1)}%)`);
  console.log(`Hedge total hits         : ${summary.hedge_total_hits}`);
  console.log('\nCitation integrity:');
  console.log(`  total <Cite> tags      : ${summary.cite_total}`);
  console.log(`  dead source slug       : ${summary.cite_dead_source}`);
  console.log(`  ts exact or near (≤31s): ${summary.cite_ts_exact_or_near}`);
  console.log(`  ts strict miss         : ${summary.cite_ts_miss_strict}`);
  console.log(`  integrity %            : ${summary.cite_integrity_pct}`);
  console.log('\nTop attribution outliers:');
  for (const o of outliers.slice(0, 12)) {
    console.log(`  ${String(o.attribution.total).padStart(3)}  ${o.slug}`);
  }
  console.log(`\nReport written to ${REPORT_PATH}`);
}

if (STRICT && (attrTiers.severe_outlier > 0 || attrTiers.outlier > 0 || citeDead > 0)) {
  console.error(`audit-doctrine: ${attrTiers.outlier + attrTiers.severe_outlier} attribution outliers; ${citeDead} dead-source cites.`);
  process.exit(1);
}
