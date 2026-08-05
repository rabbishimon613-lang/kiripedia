#!/usr/bin/env node
// Usage: node tools/enrich-grep.mjs <slug> "<phrase>" [maxPassages]
// Prints transcript passages matching <phrase> from sources NOT already cited
// by the article, with the timestamp line plus surrounding context.
import fs from 'node:fs';
import path from 'node:path';

const [slug, phrase, maxArg] = process.argv.slice(2);
const max = Number(maxArg || 12);
const SRC = 'src/content/sources';
const art = `src/content/articles/${slug}.mdx`;
const cited = fs.existsSync(art)
  ? new Set([...fs.readFileSync(art, 'utf8').matchAll(/s="([^"]+)"/g)].map((m) => m[1]))
  : new Set();

const needle = phrase.toLowerCase();
let n = 0;
for (const f of fs.readdirSync(SRC).sort()) {
  if (n >= max) break;
  if (!f.endsWith('.md') || f.includes('.sponsors')) continue;
  const s = f.replace(/\.md$/, '');
  if (cited.has(s)) continue;
  const lines = fs.readFileSync(path.join(SRC, f), 'utf8').split('\n');
  for (let i = 0; i < lines.length && n < max; i++) {
    if (!lines[i].toLowerCase().includes(needle)) continue;
    if (!/^\[\d/.test(lines[i])) continue;
    console.log(`===== ${s} @ ${(lines[i].match(/^\[([^\]]+)\]/) || [, '?'])[1]}`);
    console.log(lines.slice(Math.max(0, i - 2), i + 4).filter(Boolean).join('\n') + '\n');
    n++;
    i += 3;
  }
}
console.log(`(${n} passages)`);
