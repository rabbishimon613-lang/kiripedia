#!/usr/bin/env node
// Autonomously discover new Kiriakou-interview videos on YouTube.
//
// Pattern we look for:
//   - Long-form (≥30 min, ideally ≥45 min)
//   - Title mentions Kiriakou (canonical or common mangling)
//   - Auto-captions available (we'll only know after pull, but most podcasts have them)
//   - NOT already in src/content/sources/
//
// Strategy: ytsearch across multiple query variants, dedupe, classify by
// "show channel we already trust" vs new. Output a ranked candidate list.
//
// Usage:
//   node tools/find-new-kiriakou-videos.mjs [--limit N] [--min-minutes M]

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const LIMIT = parseInt(args[args.indexOf('--limit') + 1]) || 40;
// Bumped from 30 → 60: real long-form podcast episodes are almost always >60min.
// Most "extended cuts" / sponsor-removed re-uploads / chapter clips fall under 60.
const MIN_MINUTES = parseInt(args[args.indexOf('--min-minutes') + 1]) || 60;

// ---- Load already-ingested videoIds ----------------------------------------
const known = new Set();
for (const f of readdirSync('src/content/sources').filter(x => x.endsWith('.md'))) {
  const fm = readFileSync(`src/content/sources/${f}`, 'utf8').match(/^videoId:\s*['"]?([^'"\n]+)/m);
  if (fm) known.add(fm[1].trim());
}
console.log(`Loaded ${known.size} already-ingested videoIds.\n`);

// ---- Trusted shows we've ingested from (signal that this is a real long-form pod) ----
const trustedShows = new Set([
  'Julian Dorey', 'PowerfulJRE', 'Joe Rogan',
  'Cleared Hot', 'Dalton Fischer', 'Carlos Watson',
  'Bidoun Waraq', 'Covert Operations Insight',
  'Tucker Carlson', 'Diary Of A CEO', 'Danny Jones',
  'John Kiriakou Podcast',
]);
const isTrustedShow = (uploader) => {
  if (!uploader) return false;
  return [...trustedShows].some(s => uploader.toLowerCase().includes(s.toLowerCase()));
};

// ---- Run searches across multiple query variants ----------------------------
const QUERIES = [
  'John Kiriakou interview',
  'John Kiriakou CIA podcast',
  'Kiriakou whistleblower',
  'John Kiriakou 2026',
];

const candidates = new Map(); // videoId → {id, title, durationSec, uploader, date, queryFound}

for (const q of QUERIES) {
  const cmd = `yt-dlp --print "%(id)s|%(title)s|%(duration)s|%(uploader)s|%(upload_date)s" "ytsearch${LIMIT}:${q}" 2>/dev/null`;
  let out;
  try { out = execSync(cmd, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }); }
  catch (e) { console.warn(`  search failed: ${q}`); continue; }
  for (const line of out.split('\n').filter(Boolean)) {
    const [id, title, dur, uploader, date] = line.split('|');
    if (!id || !title) continue;
    if (candidates.has(id)) continue;
    candidates.set(id, {
      id, title,
      durationSec: parseInt(dur) || 0,
      uploader: uploader || '',
      date: date || '',
      queryFound: q,
    });
  }
}

console.log(`Found ${candidates.size} unique videos across ${QUERIES.length} queries.\n`);

// ---- Filter + classify -----------------------------------------------------
const seen = [];
const tooShort = [];
const offTopic = [];
const isClipChannel = [];
let candidatesOut = [];

// Known "clip / cuts / highlights" channel patterns — these re-upload chunks
// from a main episode that almost always exists on a parent channel.
const CLIP_CHANNEL_PAT = /(\bclips?\b|\bcuts\b|\bhighlights?\b|\bshorts\b|\bdaily\b)/i;
// Clip-style title markers
const CLIP_TITLE_PAT = /(\bclip\b|\bhighlights?\b|\bbest moments\b|\bfull (?:episode|interview)\b is)/i;

for (const v of candidates.values()) {
  if (known.has(v.id)) { seen.push(v); continue; }
  if (v.durationSec < MIN_MINUTES * 60) { tooShort.push(v); continue; }
  // Off-topic filter: title must mention Kiriakou
  if (!/kiriakou|kiryaku|kiraku/i.test(v.title)) { offTopic.push(v); continue; }
  // Clip filter
  if (CLIP_CHANNEL_PAT.test(v.uploader) || CLIP_TITLE_PAT.test(v.title)) {
    isClipChannel.push(v); continue;
  }
  candidatesOut.push(v);
}

// Per-uploader-and-date-window dedupe: when same uploader posts multiple
// videos within 3 days, keep the LONGEST (= the main episode, not a cut).
const DAYS_WINDOW = 3;
function daysBetween(a, b) {
  if (!a || !b || a.length !== 8 || b.length !== 8) return 999;
  const ad = new Date(`${a.slice(0,4)}-${a.slice(4,6)}-${a.slice(6,8)}`).getTime();
  const bd = new Date(`${b.slice(0,4)}-${b.slice(4,6)}-${b.slice(6,8)}`).getTime();
  return Math.abs((ad - bd) / 86400000);
}
const grouped = []; // [{rep, members:[]}]
for (const v of candidatesOut) {
  const match = grouped.find(g =>
    g.rep.uploader === v.uploader && daysBetween(g.rep.date, v.date) <= DAYS_WINDOW
  );
  if (match) match.members.push(v);
  else grouped.push({ rep: v, members: [v] });
}
const winnowed = [];
const droppedAsClips = [];
for (const g of grouped) {
  if (g.members.length === 1) { winnowed.push(g.members[0]); continue; }
  g.members.sort((a, b) => b.durationSec - a.durationSec);
  winnowed.push(g.members[0]);
  droppedAsClips.push(...g.members.slice(1));
}
candidatesOut = winnowed;

// Sort: trusted-show first, then recent-date first
candidatesOut.sort((a, b) => {
  const at = isTrustedShow(a.uploader) ? 0 : 1;
  const bt = isTrustedShow(b.uploader) ? 0 : 1;
  if (at !== bt) return at - bt;
  return (b.date || '').localeCompare(a.date || '');
});

// ---- Report ----------------------------------------------------------------
function fmtDur(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}m`;
}
function fmtDate(d) {
  if (!d || d.length !== 8) return d;
  return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
}

console.log(`\n=== NEW CANDIDATES (${candidatesOut.length}) ===\n`);
if (candidatesOut.length === 0) {
  console.log('No new candidates found matching the pattern. Try widening --min-minutes or check back later.');
} else {
  for (const v of candidatesOut) {
    const trust = isTrustedShow(v.uploader) ? '★' : ' ';
    console.log(`${trust} [${fmtDate(v.date)}] ${fmtDur(v.durationSec).padStart(5)}  https://www.youtube.com/watch?v=${v.id}`);
    console.log(`   ${v.uploader}`);
    console.log(`   ${v.title.slice(0, 100)}`);
    console.log();
  }
  console.log('★ = uploader is a trusted show we already ingest from');
}

console.log(`\n--- Filtered out ---`);
console.log(`  ${seen.length} already ingested`);
console.log(`  ${tooShort.length} too short (<${MIN_MINUTES}m)`);
console.log(`  ${offTopic.length} off-topic (title doesn't mention Kiriakou)`);
console.log(`  ${isClipChannel.length} clip/highlights channels or titles`);
if (typeof droppedAsClips !== 'undefined' && droppedAsClips.length) {
  console.log(`  ${droppedAsClips.length} same-uploader-and-week duplicates (kept the longest):`);
  for (const v of droppedAsClips.slice(0, 6)) {
    console.log(`    [${fmtDate(v.date)}] ${fmtDur(v.durationSec)}  ${v.uploader} — ${v.title.slice(0,80)}`);
  }
}
