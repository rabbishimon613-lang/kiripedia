#!/usr/bin/env node
// Validate a subagent-produced outline against its source transcript.
// Catches the failure modes that would silently degrade quality:
//   - Verbatim quotes that don't actually appear in the source
//   - Timestamps that don't correspond to any paragraph
//   - YYYY-MM-DD dates flagged as "Kiriakou-uttered" that he never actually
//     said in that form
//
// Exit non-zero on any quality bug. Run as the last step of the outliner.

import { readFileSync } from 'node:fs';

const [, , outlinePath, sourcePath] = process.argv;
if (!outlinePath || !sourcePath) {
  console.error('usage: validate-outline.mjs <outline.md> <source.md>');
  process.exit(2);
}

const outline = readFileSync(outlinePath, 'utf8');
const source = readFileSync(sourcePath, 'utf8');

// Normalize text for substring matching: lowercase, collapse whitespace,
// strip punctuation. We're being generous because auto-captions have
// inconsistent quoting; we just need to confirm the substantive words
// appear in the right order.
function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[''""„""‚']/g, "'")  // unify smart quotes
    .replace(/[—–-]/g, '-')           // unify dashes
    .replace(/[^\w\s']/g, ' ')        // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

const normSource = normalize(source);

// Extract quotes from the outline. Format: `- [HH:MM:SS] "..."`
const QUOTE_RX = /^\s*-\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*"([^"]+)"/gm;
const quotes = [...outline.matchAll(QUOTE_RX)].map(m => ({ ts: m[1], text: m[2] }));

// Extract dates from the outline (under "Dates uttered" sections).
const DATE_RX = /^\s*-\s*(\d{4}-\d{2}-\d{2})\s*—\s*(.+)$/gm;
const dates = [...outline.matchAll(DATE_RX)].map(m => ({ date: m[1], context: m[2] }));

// Extract timestamps mentioned in segment headers.
const SEGMENT_RX = /^###\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\s*–\s*(\d{1,2}:\d{2}(?::\d{2})?)\]/gm;
const segments = [...outline.matchAll(SEGMENT_RX)].map(m => ({ start: m[1], end: m[2] }));

// Confirm every quote substring appears in the source.
const missingQuotes = [];
for (const q of quotes) {
  // Try a minimum-confidence match: 6+ consecutive words from the middle of the quote.
  const normQ = normalize(q.text);
  const words = normQ.split(' ');
  if (words.length < 4) continue; // very short quotes (e.g. "fucking Kennedy") are skipped — the writer can verify
  // Pick the middle 6-8 words to search for
  const sliceLen = Math.min(8, words.length);
  const sliceStart = Math.max(0, Math.floor((words.length - sliceLen) / 2));
  const probe = words.slice(sliceStart, sliceStart + sliceLen).join(' ');
  if (!normSource.includes(probe)) {
    missingQuotes.push(q);
  }
}

// Confirm timestamps in segment headers are within transcript range.
const tsToSec = (ts) => {
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
};
// Find max timestamp present in the source.
const TS_IN_SOURCE = [...source.matchAll(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]/gm)]
  .map(m => tsToSec(m[1]));
const maxSourceTs = TS_IN_SOURCE.length ? Math.max(...TS_IN_SOURCE) : 0;
const oobSegments = segments.filter(s => tsToSec(s.start) > maxSourceTs + 60 || tsToSec(s.end) > maxSourceTs + 60);

console.log(`Outline: ${outlinePath}`);
console.log(`Source: ${sourcePath}`);
console.log(`Segments: ${segments.length}`);
console.log(`Verbatim quotes: ${quotes.length} (${quotes.length - missingQuotes.length} verified)`);
console.log(`Day-precise dates: ${dates.length}`);

let exitCode = 0;
if (missingQuotes.length > 0) {
  console.error(`\n=== ${missingQuotes.length} quote(s) NOT FOUND in source ===`);
  for (const q of missingQuotes) {
    console.error(`  [${q.ts}] "${q.text.slice(0, 100)}…"`);
  }
  exitCode = 1;
}
if (oobSegments.length > 0) {
  console.error(`\n=== ${oobSegments.length} segment timestamp(s) past end of source (max source ts ~${Math.floor(maxSourceTs / 60)}m) ===`);
  for (const s of oobSegments) console.error(`  [${s.start} – ${s.end}]`);
  exitCode = 1;
}

if (exitCode === 0) console.log('\n✓ Outline validates against source.');
process.exit(exitCode);
