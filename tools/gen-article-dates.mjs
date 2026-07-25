#!/usr/bin/env node
// Emit real per-article publish/modified dates from git history →
// src/data/article-dates.json. This replaces the old behaviour where every
// article's JSON-LD `dateModified` fell back to the build date, which stamped
// the WHOLE corpus as "modified today" on every rebuild — a low-trust,
// bot-farm-looking freshness signal.
//
// For each article file we take:
//   published = author date of its FIRST commit
//   modified  = author date of its LAST commit
// Both as YYYY-MM-DD. Fail soft: if git history is unavailable (shallow /
// gitless build), keep whatever src/data/article-dates.json is already there.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = 'src/content/articles';
const OUT_DIR = path.join(ROOT, 'src', 'data');
const OUT = path.join(OUT_DIR, 'article-dates.json');

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
}

let files;
try {
  files = readdirSync(path.join(ROOT, ARTICLES_DIR)).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
} catch (err) {
  console.warn(`article-dates: skipped (cannot read articles dir: ${err.message.split('\n')[0]})`);
  process.exit(0);
}

// One `git log` per file is slow across 600 files, so do a single pass over the
// whole directory and bucket author-dates per file path.
let log;
try {
  log = git([
    'log', '--no-merges', '--date=short', '--name-only',
    '--pretty=format:\x1e%ad', '--', ARTICLES_DIR,
  ]);
} catch (err) {
  console.warn(`article-dates: skipped (git history unavailable: ${err.message.split('\n')[0]}); keeping existing file`);
  process.exit(0);
}

// Log is newest-first. Walk it, remembering the current commit date, and for
// every file line record first/last seen dates.
const dates = new Map(); // slug -> { first, last }
let curDate = null;
for (const line of log.split('\n')) {
  if (line[0] === '\x1e') { curDate = line.slice(1).trim(); continue; }
  const m = line.match(/^src\/content\/articles\/(.+?)\.mdx?$/);
  if (!m || !curDate) continue;
  const slug = m[1];
  const rec = dates.get(slug) || { first: curDate, last: curDate };
  // newest-first: the first time we see a slug is its most-recent commit
  if (curDate > rec.last) rec.last = curDate;
  if (curDate < rec.first) rec.first = curDate;
  dates.set(slug, rec);
}

const out = {};
for (const f of files) {
  const slug = f.replace(/\.mdx?$/, '');
  const rec = dates.get(slug);
  if (rec) out[slug] = { published: rec.first, modified: rec.last };
}

if (Object.keys(out).length === 0 && existsSync(OUT)) {
  console.warn('article-dates: git pass produced 0 entries; keeping existing file');
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`article-dates: wrote ${Object.keys(out).length} entries → src/data/article-dates.json`);
