#!/usr/bin/env node
// Reads a queue YAML, fetches captions + metadata directly from YouTube's
// public endpoints (no yt-dlp — bot-flagged on GH runners), produces a
// normalized source markdown file, removes the queue entry.
//
// Queue file format:
//   url: https://www.youtube.com/watch?v=XYZ
//   title: optional override
//   show: optional override
//   date: optional override (YYYY-MM-DD); defaults to today (UTC)
//   slug: optional override
//   duration: optional override

import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
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

// 1. Parse video ID from URL.
function videoIdOf(url) {
  const m = String(url).match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
const videoId = videoIdOf(queue.url);
if (!videoId) {
  console.error(`could not parse video id from URL: ${queue.url}`);
  process.exit(1);
}
console.log(`videoId=${videoId}`);

// 2. Fetch title + uploader via oEmbed (no auth, no bot check).
async function fetchOembed() {
  const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(queue.url)}&format=json`);
  if (!r.ok) throw new Error(`oembed failed: ${r.status}`);
  return r.json();
}
const oembed = await fetchOembed();
console.log(`title="${oembed.title}" author="${oembed.author_name}"`);

// 3. Fetch captions via youtube-transcript-api (Python). Captions endpoint
// is NOT player-gated, so it works from GH runners.
function fetchCaptions(vid) {
  // Try to install the lib silently if not present.
  try {
    execSync(`python3 -c "import youtube_transcript_api"`, { stdio: 'ignore' });
  } catch {
    console.log('installing youtube-transcript-api…');
    execSync(`pip install --quiet --user youtube-transcript-api`, { stdio: 'inherit' });
  }
  // Updated API: YouTubeTranscriptApi must be instantiated (>= 1.0.0).
  const py = `
import json, sys
from youtube_transcript_api import YouTubeTranscriptApi
try:
    api = YouTubeTranscriptApi()
    transcript = api.fetch("${vid}", languages=["en", "en-US", "en-GB"])
    snippets = [{"text": s.text, "start": s.start, "duration": s.duration} for s in transcript.snippets]
    print(json.dumps(snippets))
except Exception as e:
    # Fallback for legacy API (< 1.0.0).
    try:
        snippets = YouTubeTranscriptApi.get_transcript("${vid}", languages=["en", "en-US", "en-GB"])
        print(json.dumps(snippets))
    except Exception as e2:
        print(f"ERROR: {e2}", file=sys.stderr)
        sys.exit(2)
`;
  return JSON.parse(execSync(`python3 -c '${py.replace(/'/g, "'\\''")}'`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
}
const segs = fetchCaptions(videoId);
console.log(`captions: ${segs.length} segments`);

// 4. Normalize: dedupe by text, group into ~30s paragraphs.
function fmtTs(sec) {
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
               : `${m}:${String(ss).padStart(2, '0')}`;
}
const cleaned = [];
let lastText = '';
for (const s of segs) {
  const t = (s.text || '').replace(/\s+/g, ' ').trim();
  if (!t) continue;
  if (t === lastText) continue;
  lastText = t;
  cleaned.push({ text: t, start: s.start });
}

const PARA_SECONDS = 30;
const paragraphs = [];
let cur = null;
for (const s of cleaned) {
  if (!cur || s.start - cur.start >= PARA_SECONDS) {
    if (cur) paragraphs.push(cur);
    cur = { start: s.start, lines: [s.text] };
  } else {
    cur.lines.push(s.text);
  }
}
if (cur) paragraphs.push(cur);
console.log(`paragraphs: ${paragraphs.length}`);

// 5. Derive slug, date, show.
function slugify(s) {
  return String(s).toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}
const date = queue.date || new Date().toISOString().slice(0, 10);
const title = queue.title || oembed.title;
const show = queue.show || oembed.author_name;
const slugBase = `${date}-${slugify(show + ' ' + title)}`.slice(0, 90).replace(/-+$/,'');
const slug = queue.slug || slugBase;
console.log(`slug=${slug} date=${date} show="${show}"`);

// 6. Write source markdown.
mkdirSync('src/content/sources', { recursive: true });
const yqs = s => `'${String(s).replace(/'/g, "''")}'`;
const lines = ['---'];
lines.push(`slug: ${yqs(slug)}`);
lines.push(`title: ${yqs(title)}`);
lines.push(`show: ${yqs(show)}`);
lines.push(`date: ${yqs(date)}`);
lines.push(`url: ${yqs(queue.url)}`);
lines.push(`videoId: ${yqs(videoId)}`);
if (queue.duration) lines.push(`duration: ${yqs(queue.duration)}`);
lines.push(`captionSource: auto`);
lines.push(`paragraphs: ${paragraphs.length}`);
lines.push(`source: youtube-transcript-api`);
lines.push('---');
lines.push('');
for (const p of paragraphs) {
  lines.push(`[${fmtTs(p.start)}] ${p.lines.join(' ')}`);
  lines.push('');
}
const outPath = `src/content/sources/${slug}.md`;
writeFileSync(outPath, lines.join('\n'));
console.log(`wrote ${outPath}`);

// 7. Remove queue entry.
unlinkSync(queuePath);
console.log(`removed ${queuePath}`);
