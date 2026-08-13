#!/usr/bin/env node
// Build the public KiriPedia offline archive.
//
// Layout inside the zip:
//   kiripedia-YYYY-MM-DD/
//     README.txt
//     articles/
//       People/        one file per article, plain text
//       Agencies/
//       Operations/
//       Events/
//       Concepts/
//       Cases/
//       Places/
//       Other/         articles whose only categories are non-canonical
//     transcripts/
//       <Show Name>/   one folder per show with 5+ transcripts
//       _other-shows/  everything from smaller shows, flat
//
// Output: KiriPedia/public/kiripedia-YYYY-MM-DD.zip
//
// Run: node tools/build-public-zip.mjs [YYYY-MM-DD]
// (date argument optional; defaults to today per system clock)

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = '/Volumes/EOS_DIGITAL/KiriPedia';
const ARTICLES_DIR = path.join(ROOT, 'src/content/articles');
const SOURCES_DIR = path.join(ROOT, 'src/content/sources');
const OUT_DIR = path.join(ROOT, 'public');

const CANONICAL = ['People', 'Agencies', 'Operations', 'Events', 'Concepts', 'Cases', 'Places'];
const SHOW_MIN_FOR_FOLDER = 5;

const today = process.argv[2] || new Date().toISOString().slice(0, 10);
const ARCHIVE_NAME = `kiripedia-${today}`;
const STAGE_ROOT = fs.mkdtempSync('/tmp/kp-archive-');
const STAGE = path.join(STAGE_ROOT, ARCHIVE_NAME);
const OUT_ZIP = path.join(OUT_DIR, `${ARCHIVE_NAME}.zip`);

function humanize(t) {
  return t
    .replace(/\s+—\s+/g, ', ')
    .replace(/\s+–\s+/g, ', ')
    .replace(/—/g, ',')
    .replace(/–/g, ',')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/…/g, '...');
}

function slugSanitize(s) {
  return s.replace(/[^a-z0-9._ -]+/gi, '-').replace(/^-+|-+$/g, '').trim();
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { fm: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end < 0) return { fm: {}, body: text };
  const raw = text.slice(3, end).replace(/^\n/, '');
  const body = text.slice(end + 4).replace(/^\n/, '');
  const fm = {};
  let currentKey = null;
  let inList = false;
  let listVals = [];
  for (const line of raw.split('\n')) {
    if (/^[a-zA-Z_][\w-]*:/.test(line)) {
      if (inList && currentKey) { fm[currentKey] = listVals; inList = false; listVals = []; }
      const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
      currentKey = m[1];
      const val = m[2].trim();
      fm[currentKey] = val === '' ? '' : val.replace(/^["']|["']$/g, '');
    } else if (/^\s+-\s+/.test(line) && currentKey) {
      if (!inList) { inList = true; listVals = []; }
      listVals.push(line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, ''));
    }
  }
  if (inList && currentKey) fm[currentKey] = listVals;
  return { fm, body };
}

function mdxToText(body) {
  return humanize(body
    .replace(/^import\s+.*?;$/gm, '')
    .replace(/^export\s+.*?;$/gm, '')
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, '')
    .replace(/<\/?[A-Z][A-Za-z0-9]*[^>]*>/g, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\[([^\]]+)\]\(\/wiki\/[^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n'
  );
}

function pickCategory(cats) {
  if (!Array.isArray(cats)) return 'Other';
  for (const c of cats) {
    const norm = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    const match = CANONICAL.find(x => x.toLowerCase() === norm.toLowerCase());
    if (match) return match;
  }
  return 'Other';
}

function sourceToText(fm, body) {
  body = humanize(body);
  const header = [
    fm.title ? `Title: ${fm.title}` : null,
    fm.show ? `Show: ${fm.show}` : null,
    fm.date ? `Date: ${fm.date}` : null,
    fm.url ? `URL: ${fm.url}` : null,
    fm.duration ? `Duration: ${fm.duration}` : null,
  ].filter(Boolean).join('\n');
  const bodyClean = body.replace(/\n{3,}/g, '\n\n').trim();
  return (header ? header + '\n\n---\n\n' : '') + bodyClean + '\n';
}

// --- staging ---
fs.mkdirSync(STAGE, { recursive: true });
fs.mkdirSync(path.join(STAGE, 'articles'), { recursive: true });
for (const c of [...CANONICAL, 'Other']) {
  fs.mkdirSync(path.join(STAGE, 'articles', c), { recursive: true });
}
fs.mkdirSync(path.join(STAGE, 'transcripts'), { recursive: true });

// --- articles ---
const articleFiles = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
const categoryCounts = {};
for (const f of articleFiles) {
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
  const { fm, body } = parseFrontmatter(raw);
  const cat = pickCategory(fm.categories);
  const slug = f.replace(/\.mdx$/, '');
  const title = fm.title || slug;
  const text = `${title}\n${'='.repeat(title.length)}\n\n${mdxToText(body)}`;
  fs.writeFileSync(path.join(STAGE, 'articles', cat, `${slug}.txt`), text);
  categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
}

// --- transcripts: pass 1, count per show ---
const sourceFiles = fs.readdirSync(SOURCES_DIR).filter(f => f.endsWith('.md') && !f.endsWith('.sponsors.md'));
const showCounts = {};
const parsed = [];
for (const f of sourceFiles) {
  const raw = fs.readFileSync(path.join(SOURCES_DIR, f), 'utf8');
  const { fm, body } = parseFrontmatter(raw);
  const show = (fm.show || 'Unknown').trim();
  showCounts[show] = (showCounts[show] || 0) + 1;
  parsed.push({ file: f, fm, body, show });
}

// pass 2, decide folders
const bigShows = new Set(Object.entries(showCounts).filter(([, n]) => n >= SHOW_MIN_FOR_FOLDER).map(([s]) => s));
for (const s of bigShows) {
  fs.mkdirSync(path.join(STAGE, 'transcripts', slugSanitize(s)), { recursive: true });
}
fs.mkdirSync(path.join(STAGE, 'transcripts', '_other-shows'), { recursive: true });

for (const { file, fm, body, show } of parsed) {
  const slug = file.replace(/\.md$/, '');
  const target = bigShows.has(show) ? slugSanitize(show) : '_other-shows';
  fs.writeFileSync(path.join(STAGE, 'transcripts', target, `${slug}.txt`), sourceToText(fm, body));
}

// --- readme ---
const catLines = CANONICAL.map(c => `  ${c.padEnd(12)} ${(categoryCounts[c] || 0)} articles`).join('\n');
const otherLine = `  ${'Other'.padEnd(12)} ${(categoryCounts['Other'] || 0)} articles`;
fs.writeFileSync(path.join(STAGE, 'README.txt'),
`KiriPedia offline archive
Snapshot: ${today}

articles/       ${articleFiles.length} articles, organized into folders by canonical category
${catLines}
${otherLine}

transcripts/    ${sourceFiles.length} source transcripts, one file per interview or talk
                shows with ${SHOW_MIN_FOR_FOLDER}+ transcripts get their own folder
                smaller shows are in _other-shows/

Each article is a single plain-text file. Each transcript begins with title,
show, date, and original URL, followed by timestamped body.

kiripedia.org
`);

// --- secret scan ---
console.log('Scanning for secrets...');
const patterns = [
  /sk-[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /AIza[0-9A-Za-z_-]{35}/,
  /ghp_[A-Za-z0-9]{30,}/,
  /Bearer\s+[A-Za-z0-9._-]{30,}/,
];
let hits = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else {
      const t = fs.readFileSync(p, 'utf8');
      for (const rx of patterns) {
        const m = t.match(rx);
        if (m) { console.log(`  HIT ${p}: ${m[0].slice(0, 20)}...`); hits++; }
      }
    }
  }
}
walk(STAGE);
if (hits > 0) { console.error('Aborting, potential secrets found.'); process.exit(1); }
console.log('Secret scan clean.');

// --- zip ---
fs.mkdirSync(OUT_DIR, { recursive: true });
try { fs.unlinkSync(OUT_ZIP); } catch {}
execSync(`cd "${STAGE_ROOT}" && zip -qr "${OUT_ZIP}" "${ARCHIVE_NAME}"`);
const size = fs.statSync(OUT_ZIP).size;
fs.rmSync(STAGE_ROOT, { recursive: true, force: true });

console.log('\n=== DONE ===');
console.log(`Articles: ${articleFiles.length}`);
for (const c of [...CANONICAL, 'Other']) console.log(`  ${c.padEnd(12)} ${categoryCounts[c] || 0}`);
console.log(`Transcripts: ${sourceFiles.length}`);
console.log(`Shows with own folder (>=${SHOW_MIN_FOR_FOLDER}): ${bigShows.size}`);
console.log(`Zip: ${OUT_ZIP}`);
console.log(`Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
