#!/usr/bin/env node
// Usage: node tools/dupe-check.mjs <slug>
// Reports the highest five-word-shingle overlap between a candidate transcript
// and every other transcript in the corpus. High overlap = re-upload/re-cut.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src/content/sources';
const target = process.argv[2];
const norm = (s) => s.toLowerCase().replace(/\[[^\]]*\]/g, ' ').replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean);
const shingles = (t) => {
  const w = norm(t), s = new Set();
  for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' '));
  return s;
};

const a = shingles(fs.readFileSync(path.join(SRC, target + '.md'), 'utf8'));
const rows = [];
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.md') || f.includes('.sponsors')) continue;
  const slug = f.replace(/\.md$/, '');
  if (slug === target) continue;
  const b = shingles(fs.readFileSync(path.join(SRC, f), 'utf8'));
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  const pct = (100 * n) / a.size;
  if (pct > 8) rows.push({ slug, pct });
}
rows.sort((x, y) => y.pct - x.pct);
if (!rows.length) console.log('no meaningful overlap — original material');
for (const r of rows.slice(0, 5)) console.log(`${r.pct.toFixed(1)}%  ${r.slug}`);
