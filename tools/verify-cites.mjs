#!/usr/bin/env node
// Verify every <Cite s= t= /> and every /wiki/ link in the given articles.
//
//   node tools/verify-cites.mjs src/content/articles/foo.mdx [more...]
//
// Checks, per article:
//   * the source slug resolves to src/content/sources/<slug>.md
//   * the timestamp appears verbatim as a paragraph marker in that transcript
//     (leading-zero and h:mm:ss / hh:mm:ss variants are accepted)
//   * every /wiki/<slug> link points at an article that exists
// Exits non-zero if anything fails.

import { readFileSync, existsSync, readdirSync } from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: verify-cites.mjs <article.mdx>...'); process.exit(1); }

const known = new Set(readdirSync('src/content/articles').filter(f => f.endsWith('.mdx')).map(f => f.slice(0, -4)));
const tsCache = new Map();

function timestamps(srcSlug) {
  if (tsCache.has(srcSlug)) return tsCache.get(srcSlug);
  const p = `src/content/sources/${srcSlug}.md`;
  if (!existsSync(p)) { tsCache.set(srcSlug, null); return null; }
  const set = new Set();
  for (const m of readFileSync(p, 'utf8').matchAll(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]/gm)) {
    const t = m[1];
    set.add(t);
    set.add(t.replace(/^(\d):/, '0$1:'));   // 4:05 -> 04:05
    set.add(t.replace(/^0(\d):/, '$1:'));   // 04:05 -> 4:05
  }
  tsCache.set(srcSlug, set);
  return set;
}

let bad = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf8');
  const problems = [];
  for (const m of raw.matchAll(/<Cite\s+s=["']([^"']+)["']\s+t=["']([^"']+)["']/g)) {
    const [_, s, t] = m;
    const set = timestamps(s);
    if (!set) { problems.push(`missing source: ${s}`); continue; }
    if (!set.has(t)) problems.push(`timestamp not in ${s}: ${t}`);
  }
  for (const m of raw.matchAll(/\]\(\/wiki\/([a-z0-9-]+)\)/g)) {
    if (!known.has(m[1])) problems.push(`dead wikilink: /wiki/${m[1]}`);
  }
  const cites = [...raw.matchAll(/<Cite\s/g)].length;
  const srcs = new Set([...raw.matchAll(/<Cite\s+s=["']([^"']+)["']/g)].map(x => x[1])).size;
  if (problems.length) {
    bad += problems.length;
    console.log(`FAIL ${f}  (${cites} cites, ${srcs} sources)`);
    for (const p of [...new Set(problems)]) console.log(`   - ${p}`);
  } else {
    console.log(`ok   ${f}  (${cites} cites, ${srcs} sources)`);
  }
}
process.exit(bad ? 1 : 0);
