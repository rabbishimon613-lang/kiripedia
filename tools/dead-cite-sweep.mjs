#!/usr/bin/env node
// dead-cite-sweep.mjs — detect Cite tags pointing at non-existent source slugs
// or timestamps that exceed the source's known duration.
//
// What constitutes a "dead" Cite:
//   1. s= references a slug (e.g. "2023-11-12-dalton-fischer-kiriakou-part-1")
//      that has no corresponding file in src/content/sources/
//   2. t= timestamp (MM:SS or H:MM:SS) exceeds the source's `duration` field
//      from frontmatter (if present and parseable)
//
// Output: per-article list of dead cites with line numbers.
//
// Usage:
//   node tools/dead-cite-sweep.mjs
//   node tools/dead-cite-sweep.mjs --slug abu-zubaydah
//   node tools/dead-cite-sweep.mjs --json

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');

const args = process.argv.slice(2);
const SLUG_FILTER = args[args.indexOf('--slug') + 1] || null;
const JSON_OUT = args.includes('--json');

// ── Index sources ─────────────────────────────────────────────────────────────

const sourceFiles = readdirSync(SOURCES_DIR).filter(f => f.endsWith('.md'));
// slug = filename without .md
const existingSlugs = new Set(sourceFiles.map(f => f.replace(/\.md$/, '')));

// Parse duration field from source frontmatter if present.
// Duration in sources may be "H:MM:SS", "MM:SS", or a plain second count.
function parseDurationSecs(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  // HH:MM:SS or H:MM:SS
  const parts = s.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  const n = parseInt(s);
  return isNaN(n) ? null : n;
}

function parseTimestampSecs(t) {
  const s = String(t).trim();
  const parts = s.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

// Build slug → duration map from source frontmatter
const sourceDurations = {};
for (const f of sourceFiles) {
  const slug = f.replace(/\.md$/, '');
  const raw = readFileSync(join(SOURCES_DIR, f), 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  try {
    const fm = yaml.load(fmMatch[1]);
    const dur = parseDurationSecs(fm.duration);
    if (dur !== null) sourceDurations[slug] = dur;
  } catch {}
}

// ── Scan articles ─────────────────────────────────────────────────────────────

const CITE_RE = /<Cite\s+s="([^"]+)"\s+t="([^"]+)"\s*\/>/g;

const articleFiles = readdirSync(ARTICLES_DIR)
  .filter(f => f.endsWith('.mdx'))
  .filter(f => !SLUG_FILTER || f.replace(/\.mdx$/, '') === SLUG_FILTER);

const results = [];

for (const f of articleFiles) {
  const articleSlug = f.replace(/\.mdx$/, '');
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  const lines = raw.split('\n');

  const deadSlugs = [];     // Cite with non-existent source slug
  const oobTimestamps = []; // Cite with timestamp past source duration
  const seenCites = new Map(); // "slug|t" → first line

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineNum = lineIdx + 1;
    let m;
    CITE_RE.lastIndex = 0;
    // Process all Cite tags on this line
    const citeRe = /<Cite\s+s="([^"]+)"\s+t="([^"]+)"\s*\/>/g;
    while ((m = citeRe.exec(line)) !== null) {
      const sourceSlug = m[1];
      const timestamp = m[2];

      if (!existingSlugs.has(sourceSlug)) {
        deadSlugs.push({ lineNum, sourceSlug, timestamp });
        continue;
      }

      const tSecs = parseTimestampSecs(timestamp);
      const dur = sourceDurations[sourceSlug];
      if (tSecs !== null && dur !== null && tSecs > dur + 60) {
        // Allow 60-second grace for rounding/overshoot
        oobTimestamps.push({
          lineNum, sourceSlug, timestamp,
          tSecs, durSecs: dur,
          overBy: tSecs - dur,
        });
      }
    }
  }

  if (deadSlugs.length > 0 || oobTimestamps.length > 0) {
    results.push({ articleSlug, deadSlugs, oobTimestamps });
  }
}

// ── Output ────────────────────────────────────────────────────────────────────

if (JSON_OUT) {
  console.log(JSON.stringify({
    existingSources: existingSlugs.size,
    articlesWithIssues: results.length,
    results,
  }, null, 2));
  process.exit(0);
}

console.log(`\n=== DEAD CITE SWEEP — KiriPedia corpus ===`);
console.log(`Sources indexed: ${existingSlugs.size}`);
console.log(`Source duration data available for: ${Object.keys(sourceDurations).length}`);
console.log(`Articles scanned: ${articleFiles.length}`);
console.log(`Articles with dead/OOB Cites: ${results.length}`);

if (results.length === 0) {
  console.log('\nAll Cite tags resolve. No dead Cites found.');
  process.exit(0);
}

let totalDead = 0, totalOOB = 0;

for (const { articleSlug, deadSlugs, oobTimestamps } of results) {
  if (deadSlugs.length === 0 && oobTimestamps.length === 0) continue;
  console.log(`\n  ${articleSlug}`);
  if (deadSlugs.length > 0) {
    totalDead += deadSlugs.length;
    console.log(`    Dead source slugs (${deadSlugs.length}):`);
    // Group by slug
    const bySlug = {};
    for (const d of deadSlugs) {
      (bySlug[d.sourceSlug] ||= []).push(d.lineNum);
    }
    for (const [slug, lines] of Object.entries(bySlug)) {
      console.log(`      s="${slug}"  (lines: ${lines.slice(0, 5).join(', ')}${lines.length > 5 ? '...' : ''})`);
    }
  }
  if (oobTimestamps.length > 0) {
    totalOOB += oobTimestamps.length;
    console.log(`    Out-of-bounds timestamps (${oobTimestamps.length}):`);
    for (const o of oobTimestamps.slice(0, 5)) {
      console.log(`      line ${o.lineNum}: s="${o.sourceSlug}" t="${o.timestamp}" → ${Math.floor(o.tSecs/60)}m${o.tSecs%60}s but source is ${Math.floor(o.durSecs/60)}m${o.durSecs%60}s (over by ${o.overBy}s)`);
    }
    if (oobTimestamps.length > 5) console.log(`      … and ${oobTimestamps.length - 5} more`);
  }
}

console.log(`\nTotal: ${totalDead} dead-slug Cites, ${totalOOB} out-of-bounds timestamps`);
if (totalDead > 0) {
  console.log(`\nDead slugs by frequency:`);
  const freq = {};
  for (const { deadSlugs } of results) {
    for (const d of deadSlugs) freq[d.sourceSlug] = (freq[d.sourceSlug] || 0) + 1;
  }
  Object.entries(freq).sort((a, b) => b[1] - a[1]).forEach(([slug, n]) =>
    console.log(`  ${String(n).padStart(3)}×  ${slug}`)
  );
}
