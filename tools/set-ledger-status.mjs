#!/usr/bin/env node
// Set the `status` column for one or more slugs in UNWRITTEN-LEDGER.md.
// Usage: node tools/set-ledger-status.mjs "<status>" <slug> [<slug>...]
import { readFileSync, writeFileSync } from 'node:fs';

const [, , status, ...slugs] = process.argv;
if (!status || slugs.length === 0) {
  console.error('usage: set-ledger-status.mjs "<status>" <slug> [<slug>...]');
  process.exit(1);
}

const path = 'UNWRITTEN-LEDGER.md';
const lines = readFileSync(path, 'utf8').split('\n');
const wanted = new Set(slugs);
const hit = new Set();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith('|')) continue;
  const cells = line.split('|');
  if (cells.length < 9) continue;
  const slug = cells[8].trim().replace(/^`|`$/g, '');
  if (!wanted.has(slug)) continue;
  cells[2] = ` ${status} `;
  lines[i] = cells.join('|');
  hit.add(slug);
}

writeFileSync(path, lines.join('\n'));
for (const s of slugs) if (!hit.has(s)) console.error(`  NOT FOUND: ${s}`);
console.log(`${hit.size}/${slugs.length} rows set to "${status}"`);
