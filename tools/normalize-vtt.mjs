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
fmLines.push(`paragraphs: ${paragraphs.length}`);
fmLines.push(`source_file: ${basename(inFile)}`);
fmLines.push('---', '');

const body = paragraphs.map((p) => `[${mmss(p.start)}] ${clean(p.text)}`).join('\n\n');

writeFileSync(outFile, fmLines.join('\n') + body + '\n');

// --- Report --------------------------------------------------------------
const rawSize = raw.length;
const outSize = body.length;
console.log(`Cues parsed:     ${cues.length}`);
console.log(`After dedupe:    ${kept.length}`);
console.log(`Paragraphs:      ${paragraphs.length}`);
console.log(`Raw VTT:         ${(rawSize / 1024).toFixed(1)} KB`);
console.log(`Output MD:       ${(outSize / 1024).toFixed(1)} KB  (${((1 - outSize / rawSize) * 100).toFixed(0)}% smaller)`);
console.log(`Wrote:           ${outFile}`);
