#!/usr/bin/env node
// shape-auditor.mjs — flag articles whose TOC structure converges with peers
//
// Algorithm:
//   1. Extract section-header sequence from every article (H2 and H3 slugs)
//   2. Represent each article as a "shape string": comma-joined slugified H2 titles
//      (H3s are included in the fingerprint but at lower weight)
//   3. Compute pairwise Jaccard similarity on the H2 token set
//   4. Cluster articles that share ≥ SIMILARITY_THRESHOLD of their H2 tokens
//   5. Flag any cluster with ≥ MIN_CLUSTER_SIZE members
//
// Why H2 only for clustering? H3s are fine to share (they're subsections of different H2s).
// Convergence is a structural disease at the section level.
//
// Usage:
//   node tools/shape-auditor.mjs                  # full audit, all articles
//   node tools/shape-auditor.mjs --threshold 0.6  # Jaccard threshold (default 0.5)
//   node tools/shape-auditor.mjs --min-cluster 3  # min cluster size to flag (default 3)
//   node tools/shape-auditor.mjs --json           # machine-readable output
//   node tools/shape-auditor.mjs --toc-only       # just print TOC shapes without clustering

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(HERE, '..', 'src', 'content', 'articles');

const args = process.argv.slice(2);
const SIMILARITY = parseFloat(args[args.indexOf('--threshold') + 1]) || 0.5;
const MIN_CLUSTER = parseInt(args[args.indexOf('--min-cluster') + 1]) || 3;
const JSON_OUT = args.includes('--json');
const TOC_ONLY = args.includes('--toc-only');

// ── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[''*_`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function extractHeaders(raw) {
  // Strip frontmatter
  const prose = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
  // Strip MDX import lines
  const lines = prose.split('\n').filter(l => !l.startsWith('import '));
  const h2 = [];
  const h3 = [];
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)$/);
    if (m2) { h2.push(m2[1].trim()); continue; }
    const m3 = line.match(/^###\s+(.+)$/);
    if (m3) { h3.push(m3[1].trim()); }
  }
  return { h2, h3 };
}

// Shape string: ordered sequence of H2 slugs joined with "|"
// Used for exact structural duplicates.
function shapeString(h2Titles) {
  return h2Titles.map(slugify).join(' | ');
}

// Token set for Jaccard (unordered H2 slug tokens)
function tokenSet(h2Titles) {
  return new Set(h2Titles.map(slugify));
}

function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ── Load articles ────────────────────────────────────────────────────────────

const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
const articles = [];

for (const f of files) {
  const slug = f.replace(/\.mdx$/, '');
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  const { h2, h3 } = extractHeaders(raw);
  const shape = shapeString(h2);
  const tokens = tokenSet(h2);
  articles.push({ slug, h2, h3, shape, tokens });
}

if (TOC_ONLY) {
  for (const a of articles.sort((x, y) => x.slug.localeCompare(y.slug))) {
    console.log(`\n${a.slug}`);
    for (const s of a.h2) console.log(`  ## ${s}`);
    for (const s of a.h3) console.log(`    ### ${s}`);
  }
  process.exit(0);
}

// ── Exact shape duplicates ───────────────────────────────────────────────────
// Articles with identical ordered H2 sequence (≥2 H2s) are the most egregious.

const exactGroups = new Map();
for (const a of articles) {
  if (a.h2.length < 2) continue;
  const key = a.shape;
  if (!exactGroups.has(key)) exactGroups.set(key, []);
  exactGroups.get(key).push(a.slug);
}
const exactClusters = [...exactGroups.entries()]
  .filter(([, slugs]) => slugs.length >= 2)
  .sort((a, b) => b[1].length - a[1].length);

// ── Jaccard similarity clustering ───────────────────────────────────────────
// Greedy single-linkage: start a cluster with the first unassigned article,
// add any article whose Jaccard with ANY cluster member ≥ threshold.
// Only run on articles with ≥2 H2s (stubs naturally look alike).

const eligible = articles.filter(a => a.h2.length >= 2);
const assigned = new Set();
const jaccardClusters = [];

for (const anchor of eligible) {
  if (assigned.has(anchor.slug)) continue;
  const cluster = [anchor.slug];
  assigned.add(anchor.slug);
  for (const candidate of eligible) {
    if (assigned.has(candidate.slug)) continue;
    // Check against any cluster member
    let maxSim = 0;
    for (const memberSlug of cluster) {
      const member = eligible.find(a => a.slug === memberSlug);
      maxSim = Math.max(maxSim, jaccard(member.tokens, candidate.tokens));
    }
    if (maxSim >= SIMILARITY) {
      cluster.push(candidate.slug);
      assigned.add(candidate.slug);
    }
  }
  if (cluster.length >= MIN_CLUSTER) {
    jaccardClusters.push({ anchor: anchor.slug, members: cluster, size: cluster.length });
  }
}
jaccardClusters.sort((a, b) => b.size - a.size);

// ── Structural entropy per category ─────────────────────────────────────────
// Count distinct H2 sequences per category. Low entropy = structural ruts.

import yaml from 'js-yaml';

const categoryShapes = {};
for (const f of files) {
  const slug = f.replace(/\.mdx$/, '');
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  const fm_match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm_match) continue;
  let fm;
  try { fm = yaml.load(fm_match[1]); } catch { continue; }
  const cats = fm.categories || [];
  const art = articles.find(a => a.slug === slug);
  if (!art) continue;
  for (const cat of cats) {
    if (!categoryShapes[cat]) categoryShapes[cat] = { total: 0, shapes: {} };
    categoryShapes[cat].total++;
    const key = art.shape || '(no sections)';
    categoryShapes[cat].shapes[key] = (categoryShapes[cat].shapes[key] || 0) + 1;
  }
}

// Entropy = -Σ p*log2(p)
function entropy(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return -Object.values(counts).reduce((sum, c) => {
    const p = c / total;
    return sum + (p > 0 ? p * Math.log2(p) : 0);
  }, 0);
}

const categoryStats = Object.entries(categoryShapes).map(([cat, { total, shapes }]) => ({
  category: cat,
  total,
  distinctShapes: Object.keys(shapes).length,
  entropy: entropy(shapes),
  mostCommon: Object.entries(shapes).sort((a, b) => b[1] - a[1])[0],
})).sort((a, b) => a.entropy - b.entropy);

// ── Output ───────────────────────────────────────────────────────────────────

if (JSON_OUT) {
  console.log(JSON.stringify({
    exactClusters,
    jaccardClusters,
    categoryStats,
  }, null, 2));
  process.exit(0);
}

console.log(`\n=== SHAPE AUDITOR — KiriPedia corpus ===`);
console.log(`Articles analysed: ${articles.length}`);
console.log(`Articles with ≥2 H2s: ${eligible.length}`);
console.log(`Jaccard threshold: ${SIMILARITY}`);
console.log(`Min cluster size to flag: ${MIN_CLUSTER}`);

console.log(`\n--- Exact structural duplicates (identical ordered H2 sequence) ---`);
if (exactClusters.length === 0) {
  console.log('  None.');
} else {
  for (const [shape, slugs] of exactClusters) {
    console.log(`\n  Shape: "${shape}"`);
    console.log(`  ${slugs.length} articles:`);
    for (const s of slugs) console.log(`    ${s}`);
  }
}

console.log(`\n--- Jaccard similarity clusters (≥${MIN_CLUSTER} members, sim≥${SIMILARITY}) ---`);
if (jaccardClusters.length === 0) {
  console.log('  None at this threshold.');
} else {
  for (const cluster of jaccardClusters) {
    console.log(`\n  Cluster (${cluster.size} articles, anchor: ${cluster.anchor}):`);
    // Show shared tokens
    const anchorObj = eligible.find(a => a.slug === cluster.anchor);
    const sharedTokens = [...anchorObj.tokens].filter(t =>
      cluster.members.every(s => {
        const m = eligible.find(a => a.slug === s);
        return m?.tokens.has(t);
      })
    );
    if (sharedTokens.length) console.log(`    Shared H2 tokens: ${sharedTokens.join(', ')}`);
    for (const s of cluster.members) {
      const art = articles.find(a => a.slug === s);
      console.log(`    ${s}  [${art?.h2.join(' | ')}]`);
    }
  }
}

console.log(`\n--- Structural entropy by category ---`);
console.log(`  Category       Articles  Distinct shapes  Entropy  Most common shape`);
console.log('  ' + '-'.repeat(80));
for (const { category, total, distinctShapes, entropy: e, mostCommon } of categoryStats) {
  const mc = mostCommon ? `"${mostCommon[0].slice(0, 40)}" (×${mostCommon[1]})` : '-';
  console.log(
    `  ${category.padEnd(14)} ${String(total).padStart(8)}  ${String(distinctShapes).padStart(15)}  ${e.toFixed(2).padStart(7)}  ${mc}`
  );
}
console.log(`\n  (Low entropy = structural rut within a category.)`);
