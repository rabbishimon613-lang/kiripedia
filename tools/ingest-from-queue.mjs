#!/usr/bin/env node
// Reads a queue YAML, runs yt-dlp + normalize-vtt, writes the source
// markdown with full frontmatter, removes the queue entry. Designed to
// run inside the fetch-transcript GitHub Action.
//
// Queue file format:
//   url: https://www.youtube.com/watch?v=XYZ
//   title: optional override
//   show: optional override
//   date: optional override (YYYY-MM-DD)
//   slug: optional override (auto-generated from date + show otherwise)

import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';

const queuePath = process.argv[2];
if (!queuePath) {
  console.error('usage: ingest-from-queue.mjs <queue.yml>');
  process.exit(2);
}

const queue = yaml.load(readFileSync(queuePath, 'utf8'));
if (!queue?.url) {
  console.error(`queue file missing url: ${queuePath}`);
  process.exit(1);
}

// 1. Probe video metadata via yt-dlp --print
const probeFields = '%(id)s|%(title)s|%(upload_date)s|%(duration_string)s|%(uploader)s';
const probeOut = execSync(
  `yt-dlp --no-warnings --print "${probeFields}" ${JSON.stringify(queue.url)}`,
  { encoding: 'utf8' }
).trim();

const [videoId, ytTitle, uploadDate, durationStr, uploader] = probeOut.split('|');
if (!videoId) {
  console.error('failed to probe video');
  process.exit(1);
}

// 2. Derive slug
function slugify(s) {
  return String(s).toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}
const date = queue.date || `${uploadDate.slice(0,4)}-${uploadDate.slice(4,6)}-${uploadDate.slice(6,8)}`;
const show = queue.show || uploader;
const slug = queue.slug || `${date}-${slugify(show + ' ' + (queue.title || ytTitle)).slice(0, 80)}`;
const title = queue.title || ytTitle;

console.log(`video=${videoId} slug=${slug} date=${date}`);

// 3. yt-dlp --write-auto-sub
mkdirSync('sources/raw', { recursive: true });
const vttBase = `sources/raw/${date.replace(/-/g, '')}-${videoId}`;
execSync(
  `yt-dlp --no-warnings --write-auto-sub --sub-lang en --skip-download --output "${vttBase}.%(ext)s" ${JSON.stringify(queue.url)}`,
  { stdio: 'inherit' }
);

// yt-dlp writes either .en.vtt or .en-orig.vtt depending on caption availability.
const candidates = readdirSync('sources/raw').filter(f => f.startsWith(`${date.replace(/-/g, '')}-${videoId}`) && f.endsWith('.vtt'));
if (candidates.length === 0) {
  console.error('yt-dlp did not produce a VTT file');
  process.exit(1);
}
const vttPath = `sources/raw/${candidates[0]}`;

// 4. Normalize via existing tool
const outPath = `src/content/sources/${slug}.md`;
execSync(`node tools/normalize-vtt.mjs "${vttPath}" "${outPath}"`, { stdio: 'inherit' });

// 5. Patch frontmatter — normalize-vtt.mjs leaves placeholder frontmatter
const md = readFileSync(outPath, 'utf8');
const yqs = s => `'${String(s).replace(/'/g, "''")}'`;
const headerLines = [
  '---',
  `slug: ${yqs(slug)}`,
  `title: ${yqs(title)}`,
  `show: ${yqs(show)}`,
  `date: ${yqs(date)}`,
  `url: ${yqs(queue.url)}`,
  `videoId: ${yqs(videoId)}`,
  durationStr ? `duration: ${yqs(durationStr)}` : null,
  `captionSource: auto`,
].filter(Boolean);

// Preserve auto-generated fields (paragraphs, source_file) from normalize-vtt output
const existingMatch = md.match(/^---\n([\s\S]*?)\n---/);
if (existingMatch) {
  const existing = yaml.load(existingMatch[1]) || {};
  if (existing.paragraphs) headerLines.push(`paragraphs: ${existing.paragraphs}`);
  if (existing.source_file) headerLines.push(`source_file: ${yqs(existing.source_file)}`);
}
headerLines.push('---');

const body = md.replace(/^---\n[\s\S]*?\n---\n?/, '');
writeFileSync(outPath, headerLines.join('\n') + '\n' + body);
console.log(`wrote ${outPath}`);

// 6. Remove queue entry
unlinkSync(queuePath);
console.log(`removed ${queuePath}`);
