#!/usr/bin/env node
// Build a date-pointer index from every transcript: every date Kiriakou
// utters, regardless of precision, captured as a searchable JSON artifact.
//
// Output: public/date-index.json — an array of
//   { source, timestamp, match, precision, snippet }
// precision is one of "day" | "month" | "year" | "vague".
//
// This is the data substrate for internal mining. The OTD calendar reads
// only the strict `events:` frontmatter blocks; this index is separate and
// preserves everything for "did Kiriakou ever mention X" lookups.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const SOURCES = 'src/content/sources';

const MONTHS = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december'
];
const MONTH_RX = MONTHS.join('|');

// Day must be 1-31 AND not the first two digits of a 4-digit year.
const DAY = '(?:3[01]|[12]?[0-9])(?!\\d{2})(?!\\d)';

const PATTERNS = [
  // day-precise: "August 2", "August 2 1990", "August 2nd 1990"
  { rx: new RegExp(`\\b(${MONTH_RX})\\s+${DAY}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?`, 'gi'), precision: 'day' },
  // day-precise: "2nd of August", "2nd of August 1990"
  { rx: new RegExp(`\\b${DAY}(?:st|nd|rd|th)?\\s+of\\s+(${MONTH_RX})(?:,?\\s+\\d{4})?`, 'gi'), precision: 'day' },
  // 9/11 special — implicit day
  { rx: /\b9[\/\-]11\b/gi, precision: 'day' },
  // numeric M/D/Y
  { rx: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, precision: 'day' },
  // month + year: "December 2007", "January 1990"
  { rx: new RegExp(`\\b(${MONTH_RX})\\s+\\d{4}\\b`, 'gi'), precision: 'month' },
  // bare year (1900-2099), only if standalone — too many false positives if
  // we catch every number, so require word boundaries.
  { rx: /\b(?:19|20)\d{2}\b/g, precision: 'year' },
  // seasons + year: "spring of 1988", "summer 2001"
  { rx: /\b(spring|summer|fall|autumn|winter)\s+(?:of\s+)?(?:19|20)\d{2}\b/gi, precision: 'vague' },
];

function snippet(text, idx, len = 200) {
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + len);
  return text
    .slice(start, end)
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function timestampFor(text, idx) {
  const before = text.slice(0, idx);
  const matches = [...before.matchAll(/\[\d{1,2}:\d{2}(?::\d{2})?\]/g)];
  return matches.length ? matches[matches.length - 1][0] : '[?]';
}

const all = [];
const sourceFiles = readdirSync(SOURCES).filter(x => x.endsWith('.md'));
for (const f of sourceFiles) {
  const slug = f.replace(/\.md$/, '');
  const text = readFileSync(`${SOURCES}/${f}`, 'utf8');
  // Strip the YAML frontmatter so it doesn't pollute the index.
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, '');
  for (const { rx, precision } of PATTERNS) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(body)) !== null) {
      all.push({
        source: slug,
        timestamp: timestampFor(body, m.index),
        match: m[0],
        precision,
        snippet: snippet(body, m.index),
      });
    }
  }
}

// Dedupe by (source, timestamp, match) — same paragraph often has the same
// date twice, no need to record both.
const seen = new Set();
const deduped = [];
for (const h of all) {
  const key = `${h.source}|${h.timestamp}|${h.match.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(h);
}

// Sort: source, then timestamp.
deduped.sort((a, b) => {
  if (a.source !== b.source) return a.source < b.source ? -1 : 1;
  return a.timestamp < b.timestamp ? -1 : 1;
});

writeFileSync('public/date-index.json', JSON.stringify(deduped, null, 2));

const counts = deduped.reduce((m, h) => ((m[h.precision] = (m[h.precision] || 0) + 1), m), {});
console.log(`Wrote public/date-index.json — ${deduped.length} entries across ${sourceFiles.length} sources.`);
console.log('Precision breakdown:', counts);
