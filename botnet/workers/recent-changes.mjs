#!/usr/bin/env node
// Recent Changes Bot.
// Wraps the existing tools/find-new-kiriakou-videos.mjs and writes leads
// into the SQLite truth store. No LLM cost — pure rule-based.
//
// Run: node botnet/workers/recent-changes.mjs [--limit N]

import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, registerLead, logActivity } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const FINDER = join(REPO_ROOT, 'tools', 'find-new-kiriakou-videos.mjs');

const WORKER = 'recent-changes-1';
const ROLE = 'recent-changes';

const args = process.argv.slice(2);
const LIMIT = parseInt(args[args.indexOf('--limit') + 1]) || 40;

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: `Polling YouTube for new Kiriakou videos (up to ${LIMIT}).` });

let raw;
try {
  raw = execSync(`node ${FINDER} --limit ${LIMIT}`, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
} catch (err) {
  console.error('[recent-changes] finder failed:', err.message);
  logActivity({ worker: WORKER, role: ROLE, event: 'finish', detail: 'YouTube poll failed — couldn\'t reach the site.' });
  process.exit(1);
}

// Parse the finder's output. It prints lines like:
//   "  • <title> | <channel> | <duration>min | https://youtu.be/<id>"
// We just want the URL + id. Detail can come from yt-dlp later.
const VIDEO_ID_RE = /(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/g;
const seen = new Set();
let added = 0;

for (const m of raw.matchAll(VIDEO_ID_RE)) {
  const videoId = m[1];
  if (seen.has(videoId)) continue;
  seen.add(videoId);

  // Find the surrounding line for metadata.
  const lineStart = raw.lastIndexOf('\n', m.index) + 1;
  const lineEnd = raw.indexOf('\n', m.index);
  const line = raw.slice(lineStart, lineEnd === -1 ? raw.length : lineEnd);

  // Soft parse: "  • <title> | <channel> | <duration>min | <url>"
  const parts = line.split('|').map(s => s.trim());
  let title = null, channel = null, durationSec = null;
  if (parts.length >= 4) {
    title = parts[0].replace(/^.*?[•·]\s*/, '');
    channel = parts[1];
    const dm = parts[2].match(/(\d+)\s*min/);
    if (dm) durationSec = parseInt(dm[1]) * 60;
  }

  const isNew = registerLead({
    videoId,
    url: `https://youtu.be/${videoId}`,
    channel,
    title,
    durationSec,
  });
  if (isNew) added++;
}

logActivity({
  worker: WORKER, role: ROLE, event: 'finish',
  detail: `Saw ${seen.size} videos on YouTube, kept ${added} new leads.`,
});
console.log(`[recent-changes] saw ${seen.size} videos, ${added} new leads written.`);
