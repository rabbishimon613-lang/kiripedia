#!/usr/bin/env node
// Normalize a YouTube auto-caption VTT into clean, timestamped Markdown.
// Usage: node tools/normalize-vtt.mjs <input.vtt> <output.md> [--meta key=val ...]

import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: normalize-vtt.mjs <input.vtt> <output.md> [--meta key=val ...]');
  process.exit(1);
}

const [inFile, outFile, ...rest] = args;
const meta = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--meta' && rest[i + 1]) {
    const [k, ...v] = rest[i + 1].split('=');
    meta[k] = v.join('=');
    i++;
  }
}

const raw = readFileSync(inFile, 'utf8');

// --- Parse VTT cues -------------------------------------------------------
const blocks = raw.split(/\r?\n\r?\n/);
const cues = [];
const TS = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
const stripTags = (s) => s
  .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')
  .replace(/<\/?c[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

for (const block of blocks) {
  const lines = block.split(/\r?\n/);
  const tsIdx = lines.findIndex((l) => TS.test(l));
  if (tsIdx === -1) continue;
  const m = lines[tsIdx].match(TS);
  const start = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000;
  const textLines = lines.slice(tsIdx + 1).map(stripTags).filter(Boolean);
  if (textLines.length) cues.push({ start, lines: textLines });
}

// --- Dedupe YouTube rolling auto-captions --------------------------------
// YouTube rolls 2 lines per cue: cue N = [A, B], cue N+1 = [B, C], etc.
// Walk line-by-line in order; emit a line only if it differs from the last emitted.
const kept = [];
let lastLine = null;
for (const cue of cues) {
  for (let i = 0; i < cue.lines.length; i++) {
    const ln = cue.lines[i];
    if (ln === lastLine) continue;
    // Assign timestamp of the cue this line first appears in.
    kept.push({ start: cue.start, text: ln });
    lastLine = ln;
  }
}

// --- Merge into ~PARAGRAPH-second chunks ---------------------------------
const PARAGRAPH = 30; // seconds
const paragraphs = [];
let cur = null;
for (const line of kept) {
  if (!cur || line.start - cur.start >= PARAGRAPH) {
    if (cur) paragraphs.push(cur);
    cur = { start: line.start, text: line.text };
  } else {
    cur.text += ' ' + line.text;
  }
}
if (cur) paragraphs.push(cur);

// --- Sponsor / ad detection (strips mid-roll reads from main body) -------
// Sponsors are NEVER canon material; they bloat the transcript without
// adding signal. We detect a paragraph as a sponsor-start if it matches
// a known pattern, then continue marking until we see a topic-shift
// signal (a question, name, or a "back to the show" / "anyway" marker).
const SPONSOR_START_PATTERNS = [
  /today'?s (episode|show|segment) (is brought to you by|sponsor)/i,
  /brought to you by ([A-Z][a-zA-Z]+|black rifle|brunt|quince|helix|manscaped|aura|liquid iv|athletic greens|ag1|hims|hers|betterhelp|magic mind|cash app|stamps\.com|squarespace|shopify|surfshark|nordvpn|expressvpn)/i,
  /use (code|promo code|the code) [\w'-]+/i,
  /go to ([\w.-]+\.com|www\.[\w.-]+) (slash|\/) ?[\w-]+/i,
  /(discount|off your first|free trial|free shipping|sign up at|head to|visit)\s+[\w.-]+/i,
  /^this episode is sponsored by/i,
  /^a (huge|big) thank you to (our|today'?s) sponsor/i,
];
const SPONSOR_END_PATTERNS = [
  /back to (the|our) (show|episode|conversation|interview)/i,
  /\b(anyway|alright|okay)[,.]?\s+(so|let'?s|back to)/i,
  /^\s*(now|so) back to/i,
  /\bthat'?s all I got\b/i,
];
const sponsorParagraphs = [];
const mainParagraphs = [];
let inSponsor = false;
let sponsorRunLen = 0;
for (const p of paragraphs) {
  const text = p.text;
  if (!inSponsor) {
    if (SPONSOR_START_PATTERNS.some((rx) => rx.test(text))) {
      inSponsor = true;
      sponsorRunLen = 1;
      sponsorParagraphs.push(p);
      continue;
    }
    mainParagraphs.push(p);
  } else {
    sponsorParagraphs.push(p);
    sponsorRunLen++;
    // Exit conditions: explicit "back to the show" / "anyway", OR after
    // ~12 paragraphs (6 minutes max for a single mid-roll).
    if (SPONSOR_END_PATTERNS.some((rx) => rx.test(text)) || sponsorRunLen >= 12) {
      inSponsor = false;
      sponsorRunLen = 0;
    }
  }
}

// --- Light cleanup -------------------------------------------------------
const clean = (s) => s
  .replace(/\s+/g, ' ')
  .replace(/\s+([,.!?;:])/g, '$1')
  .trim();

const pad = (n) => String(n).padStart(2, '0');
const mmss = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

// --- Frontmatter ---------------------------------------------------------
const fmLines = ['---'];
// Always quote values to avoid YAML pitfalls (colons, special chars, dates).
for (const [k, v] of Object.entries(meta)) fmLines.push(`${k}: ${JSON.stringify(String(v))}`);
fmLines.push(`captionSource: auto`);
fmLines.push(`paragraphs: ${mainParagraphs.length}`);
fmLines.push(`sponsor_paragraphs_stripped: ${sponsorParagraphs.length}`);
fmLines.push(`source_file: ${basename(inFile)}`);
fmLines.push('---', '');

const body = mainParagraphs.map((p) => `[${mmss(p.start)}] ${clean(p.text)}`).join('\n\n');

writeFileSync(outFile, fmLines.join('\n') + body + '\n');

// Also dump stripped sponsor content to a sidecar file for audit.
if (sponsorParagraphs.length > 0) {
  const sponsorPath = outFile.replace(/\.md$/, '.sponsors.md');
  const sponsorBody = '# Stripped sponsor / ad reads\n\n' +
    'These paragraphs were detected as sponsor reads and excluded from the main transcript.\n' +
    'Preserved here for audit; not part of the canon corpus.\n\n' +
    sponsorParagraphs.map((p) => `[${mmss(p.start)}] ${clean(p.text)}`).join('\n\n');
  writeFileSync(sponsorPath, sponsorBody + '\n');
}

// --- Report --------------------------------------------------------------
const rawSize = raw.length;
const outSize = body.length;
console.log(`Cues parsed:     ${cues.length}`);
console.log(`Sponsors stripped: ${sponsorParagraphs.length} paragraph(s)`);
console.log(`After dedupe:    ${kept.length}`);
console.log(`Paragraphs:      ${paragraphs.length}`);
console.log(`Raw VTT:         ${(rawSize / 1024).toFixed(1)} KB`);
console.log(`Output MD:       ${(outSize / 1024).toFixed(1)} KB  (${((1 - outSize / rawSize) * 100).toFixed(0)}% smaller)`);
console.log(`Wrote:           ${outFile}`);
