#!/usr/bin/env node
// Canonical show-name aliases.
//
// Hosts often publish across multiple channels (clips, daily, live, shorts)
// or the YouTube channel name drifts over time. From KiriPedia's perspective
// — the encyclopedia of John Kiriakou's world — all of these are the same
// editorial show and should collapse into one entry on /sources.
//
// Usage:
//   node tools/show-aliases.mjs                 # audit all sources, report drifts
//   node tools/show-aliases.mjs --fix           # rewrite show: field to canonical
//
// New aliases get added to the map below as we encounter them.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

// Map of regex pattern → canonical show name.
// Patterns are tested case-insensitively against the raw show: value.
const ALIASES = [
  [/^julian dorey/i,                 'Julian Dorey Podcast'],
  [/^joe rogan/i,                    'The Joe Rogan Experience'],
  [/^(the )?dalton fischer/i,        'Dalton Fischer Podcast'],
  [/^carlos watson/i,                'Carlos Watson Conversations'],
  [/^cleared hot/i,                  'Cleared Hot Podcast'],
  [/^bidoun waraq/i,                 'Bidoun Waraq Podcast'],
  [/^democracy now/i,                'Democracy Now!'],
  [/^covert operations/i,            'Covert Operations Insight'],
  // Add new shows here as ingests surface them.
];

function canonical(showRaw) {
  const s = String(showRaw || '').trim();
  for (const [rx, canon] of ALIASES) {
    if (rx.test(s)) return canon;
  }
  return s; // unknown show — leave as-is
}

const fix = process.argv.includes('--fix');
const dir = 'src/content/sources';
let drifts = 0, fixed = 0;
for (const f of readdirSync(dir).filter(x => x.endsWith('.md'))) {
  const path = `${dir}/${f}`;
  const content = readFileSync(path, 'utf8');
  const m = content.match(/^show:\s*['"]?([^'"\n]+)['"]?$/m);
  if (!m) continue;
  const current = m[1].trim();
  const want = canonical(current);
  if (current === want) continue;
  drifts++;
  console.log(`  ${f}:  "${current}"  →  "${want}"`);
  if (fix) {
    const next = content.replace(
      /^show:\s*['"]?[^'"\n]+['"]?$/m,
      `show: "${want}"`
    );
    writeFileSync(path, next);
    fixed++;
  }
}

if (drifts === 0) console.log('All source show names canonical.');
else if (fix) console.log(`\nFixed ${fixed} of ${drifts} drifts.`);
else console.log(`\n${drifts} drift(s) found. Re-run with --fix to canonicalize.`);
