#!/usr/bin/env node
// Mine source transcripts for day-precise date mentions from Kiriakou's mouth.
//
// Output is grouped by source; each hit shows the timestamp + a window of
// surrounding text so an editor can decide whether the date is
// (a) attached to an event already covered by an article, in which case
//     add an events: entry; or (b) attached to something not yet covered,
//     in which case open a new article.
//
// Doctrine: events: entries come ONLY from these mined quotes. No external
// date lookups. If Kiriakou doesn't utter the day, the event doesn't get
// an events: entry — its date stays in prose.

import { readFileSync, readdirSync } from 'node:fs';

const SOURCES = 'src/content/sources';

const MONTHS = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december'
];
const MONTH_RX = MONTHS.join('|');

// Patterns to flag (case-insensitive):
//   "August 2nd, 1990", "August 2 1990", "the 2nd of August", "2nd of August 1990",
//   "April 22 2000", "Sept 11", "9/11" (treat as special case for 2001-09-11)
// Day must be 1-31 AND NOT be immediately followed by two more digits
// (which would mean we're catching "August 1990" as "August 19").
// Day must also not be a four-digit number.
const DAY = '(?:3[01]|[12]?[0-9])(?!\\d{2})(?!\\d)';
const PATTERNS = [
  // "August 2", "August 2nd", "August 2 1990", "August 2nd, 1990"
  new RegExp(`\\b(${MONTH_RX})\\s+${DAY}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?`, 'gi'),
  // "2nd of August", "the 2nd of August 1990"
  new RegExp(`\\b${DAY}(?:st|nd|rd|th)?\\s+of\\s+(${MONTH_RX})(?:,?\\s+\\d{4})?`, 'gi'),
  // 9/11 special
  /\b9[\/\-]11\b/gi,
  // numeric M/D/Y
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
];

// Drop hits where the matched day is followed by two more digits — the
// regex above tries to prevent this but JS lookaheads with quantifiers are
// fragile, so we belt-and-suspenders here.
function isClean(match, text, idx) {
  // For "Month DD" form, find the DD and check the character that follows.
  const m = match.match(/^(\w+)\s+(\d+)/);
  if (m) {
    const dayLen = m[2].length;
    const after = text[idx + m[1].length + 1 + dayLen];
    if (after && /\d/.test(after)) return false;
  }
  return true;
}

// Skip months that only refer to a season/general month with no day.
function isSubstantive(match) {
  return /\d/.test(match);
}

function* hits(text) {
  for (const rx of PATTERNS) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(text)) !== null) {
      if (isSubstantive(m[0])) yield { match: m[0], idx: m.index };
    }
  }
}

function snippet(text, idx, len = 220) {
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + len);
  return text
    .slice(start, end)
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Each transcript paragraph starts with a [hh:mm:ss] or [mm:ss] timestamp.
// Find the timestamp at or before the hit's position.
function timestampFor(text, idx) {
  const before = text.slice(0, idx);
  const matches = [...before.matchAll(/\[\d{1,2}:\d{2}(:\d{2})?\]/g)];
  return matches.length ? matches[matches.length - 1][0] : '[?]';
}

const args = process.argv.slice(2);
const onlySlug = args[0]; // optional: limit to one source slug

let total = 0;
for (const f of readdirSync(SOURCES).filter(x => x.endsWith('.md'))) {
  if (onlySlug && !f.includes(onlySlug)) continue;
  const text = readFileSync(`${SOURCES}/${f}`, 'utf8');
  const all = [...hits(text)];
  // Dedupe by (timestamp, match) so we don't print the same paragraph twice
  // when the date appears more than once.
  const seen = new Set();
  const uniq = [];
  for (const h of all) {
    const ts = timestampFor(text, h.idx);
    const key = `${ts}|${h.match.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push({ ts, match: h.match, snippet: snippet(text, h.idx) });
  }
  if (uniq.length === 0) continue;
  console.log(`\n=== ${f} (${uniq.length} hits) ===`);
  for (const h of uniq) {
    console.log(`  ${h.ts}  ${h.match}`);
    console.log(`     … ${h.snippet} …`);
  }
  total += uniq.length;
}

console.log(`\nTotal date mentions: ${total} across ${readdirSync(SOURCES).filter(x => x.endsWith('.md')).length} transcripts.`);
console.log(`(Usage: node tools/find-dated-quotes.mjs [source-slug-substring])`);
