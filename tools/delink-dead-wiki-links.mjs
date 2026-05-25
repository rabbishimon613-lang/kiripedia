#!/usr/bin/env node
// Find every [text](/wiki/SLUG) link across all articles. For slugs that
// don't have a corresponding article file, replace the markdown link
// with just the visible text (delinking — equivalent to removing a
// Wikipedia red link). Print a per-article report.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ARTICLES_DIR = 'src/content/articles';
const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.mdx'));

// 1. Build set of existing article slugs.
const existing = new Set(files.map((f) => f.replace(/\.mdx$/, '')));

// 2. Walk every article. Find every [text](/wiki/SLUG) — including in
//    frontmatter strings. Group missing slugs by how many references.
const linkRe = /\[([^\]\n]+)\]\(\/wiki\/([a-z0-9-]+)(#[^)]*)?\)/g;
const missing = new Map(); // slug -> { count, files: Set<string> }
const perFileEdits = new Map(); // file -> { before, after, delinkedSlugs: Set }

for (const file of files) {
  const path = join(ARTICLES_DIR, file);
  const raw = readFileSync(path, 'utf8');
  let edited = raw;
  let madeChanges = false;
  const delinked = new Set();

  edited = edited.replace(linkRe, (match, text, slug, _anchor) => {
    if (existing.has(slug)) return match;
    // Track the missing slug
    if (!missing.has(slug)) missing.set(slug, { count: 0, files: new Set() });
    missing.get(slug).count += 1;
    missing.get(slug).files.add(file);
    madeChanges = true;
    delinked.add(slug);
    return text;
  });

  if (madeChanges) {
    writeFileSync(path, edited);
    perFileEdits.set(file, { delinkedSlugs: delinked, totalEdits: (raw.match(linkRe) || []).length });
  }
}

// 3. Report.
const totalMissingSlugs = missing.size;
const totalRefsRemoved = [...missing.values()].reduce((a, v) => a + v.count, 0);

console.log(`Existing articles: ${existing.size}`);
console.log(`Distinct dead-link slugs found: ${totalMissingSlugs}`);
console.log(`Total dead-link references removed: ${totalRefsRemoved}`);
console.log(`Articles modified: ${perFileEdits.size}`);
console.log('');
console.log('Top dead-link slugs (most referenced):');
const sorted = [...missing.entries()].sort((a, b) => b[1].count - a[1].count);
for (const [slug, info] of sorted.slice(0, 30)) {
  console.log(`  ${info.count.toString().padStart(3)}× /wiki/${slug}  (in ${info.files.size} article${info.files.size > 1 ? 's' : ''})`);
}
if (sorted.length > 30) console.log(`  …and ${sorted.length - 30} more.`);
console.log('');
console.log('All distinct dead slugs:');
console.log(sorted.map(([s]) => s).join('\n'));
