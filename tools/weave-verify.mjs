#!/usr/bin/env node
// weave-verify.mjs <before.mdx> <after.mdx>
// Verifies a weave was lossless: every unique <Cite s= t= /> pair in `before`
// still appears in `after`. Reports any lost pairs (fatal) and any new ones.
import fs from 'node:fs';

const cites = (p) => {
  const s = fs.readFileSync(p, 'utf8');
  const out = new Map();
  for (const m of s.matchAll(/<Cite\s+s="([^"]*)"\s+t="([^"]*)"\s*\/>/g)) {
    const k = `${m[1]}@${m[2]}`;
    out.set(k, (out.get(k) || 0) + 1);
  }
  return out;
};

const [a, b] = process.argv.slice(2);
const A = cites(a), B = cites(b);
const lost = [...A.keys()].filter((k) => !B.has(k));
const added = [...B.keys()].filter((k) => !A.has(k));

console.log(`before: ${[...A.values()].reduce((x, y) => x + y, 0)} tags, ${A.size} unique`);
console.log(`after:  ${[...B.values()].reduce((x, y) => x + y, 0)} tags, ${B.size} unique`);
if (lost.length) {
  console.log(`\nLOST ${lost.length}:`);
  for (const k of lost) console.log('  - ' + k);
}
if (added.length) {
  console.log(`\nNEW ${added.length}:`);
  for (const k of added) console.log('  + ' + k);
}
if (!lost.length) console.log('\nOK — no citations lost.');
process.exit(lost.length ? 1 : 0);
