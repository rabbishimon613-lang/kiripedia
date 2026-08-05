#!/usr/bin/env node
// Report articles that share the same infobox image.
//
// tools/fetch-images.sh maps each slug to a Wikipedia title and saves that
// page's lead image under the slug's own file name. Two slugs pointing at the
// same title therefore produce two identical files with different names, and
// nothing on the site makes that visible — which is how a dozen unrelated
// tradecraft articles all ended up illustrated with the same 1920s couple from
// the "Espionage" page.
//
// Some reuse is correct: the CIA seal belongs on several CIA articles, and
// Kiriakou's portrait belongs on articles about him. So this reports rather
// than fails, and sorts the worst offenders first.
//
// Usage: node tools/audit-duplicate-images.mjs [--min N] [--json]

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const IMAGES = 'public/images';
const ARTICLES = 'src/content/articles';
const CREDITS = path.join(IMAGES, 'credits.json');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const minIdx = args.indexOf('--min');
const MIN = minIdx >= 0 ? Number(args[minIdx + 1]) : 2;

let credits = {};
try {
  credits = JSON.parse(readFileSync(CREDITS, 'utf8'));
} catch {
  /* credits are a nicety here, not a requirement */
}

// Which slugs actually reference an image from their frontmatter — an unused
// file on disk is not a duplicate anyone can see.
const used = new Set();
for (const f of readdirSync(ARTICLES)) {
  if (!f.endsWith('.mdx')) continue;
  const head = readFileSync(path.join(ARTICLES, f), 'utf8').split('\n---', 1)[0];
  if (/^\s+image:\s*\/images\//m.test(head)) used.add(f.replace(/\.mdx$/, ''));
}

const byHash = new Map();
for (const f of readdirSync(IMAGES)) {
  const full = path.join(IMAGES, f);
  if (f === 'credits.json' || !statSync(full).isFile()) continue;
  const slug = f.replace(/\.[^.]+$/, '');
  if (!used.has(slug)) continue;
  const h = createHash('md5').update(readFileSync(full)).digest('hex');
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(slug);
}

const groups = [...byHash.entries()]
  .map(([hash, slugs]) => ({
    hash,
    count: slugs.length,
    source: credits[slugs[0]]?.source_article ?? '(unknown)',
    slugs: slugs.sort(),
  }))
  .filter((g) => g.count >= MIN)
  .sort((a, b) => b.count - a.count);

if (asJson) {
  console.log(JSON.stringify(groups, null, 2));
} else {
  for (const g of groups) {
    console.log(`${String(g.count).padStart(3)}×  ${g.source}`);
    console.log(`     ${g.slugs.join(', ')}`);
  }
  const shared = groups.reduce((n, g) => n + g.count, 0);
  console.log(
    `\n${groups.length} shared image${groups.length === 1 ? '' : 's'} across ${shared} articles ` +
      `(of ${used.size} with an image). Reuse of a subject's own portrait or seal is fine; ` +
      `a generic page reused across unrelated subjects is the bug.`
  );
}
