#!/usr/bin/env node
// Usage: node tools/enrich-pull.mjs <slug> [maxPassages]
// Prints the article's uncited transcript passages with full surrounding context,
// so an editor can weave them in. Reads .kir-mentions-index.json.
import fs from 'node:fs';

const slug = process.argv[2];
const max = Number(process.argv[3] || 14);
const idx = JSON.parse(fs.readFileSync('.kir-mentions-index.json', 'utf8'));
const entry = idx[slug];
if (!entry) { console.error('no index entry for ' + slug); process.exit(1); }

console.log(`### ${entry.title} (${slug}) — aliases: ${(entry.aliases||[]).join(', ')}`);
console.log(`uncited: ${entry.uncited_mention_count}  cited sources: ${entry.cited_sources_count}\n`);

const seen = new Set();
let n = 0;
for (const m of entry.uncited_mentions || []) {
  if (n >= max) break;
  if (m.source.endsWith('.sponsors')) continue;      // excluded from canon
  const key = m.source + '#' + m.timestamp;
  if (seen.has(key)) continue;
  seen.add(key);
  const path = `src/content/sources/${m.source}.md`;
  if (!fs.existsSync(path)) continue;
  const lines = fs.readFileSync(path, 'utf8').split('\n');
  const at = lines.findIndex((l) => l.startsWith(`[${m.timestamp}]`));
  if (at < 0) continue;
  const chunk = lines.slice(Math.max(0, at - 2), at + 5).filter(Boolean).join('\n');
  console.log(`--- ${m.source} @ ${m.timestamp}`);
  console.log(chunk + '\n');
  n++;
}
console.log(`(printed ${n} passages)`);
