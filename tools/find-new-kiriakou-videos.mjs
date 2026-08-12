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
//                                           [--since YYYYMMDD] [--tsv <path>]
//
// --since  drop anything uploaded before this date (the morning sweep's "what's new")
// --tsv    also write a churn.sh worklist (type/target/minutes/show/title) — this is
//          what makes the routine hands-off: discovery feeds the fetcher directly.

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };
const LIMIT = parseInt(flag('--limit')) || 40;
// Bumped from 30 → 60: real long-form podcast episodes are almost always >60min.
// Most "extended cuts" / sponsor-removed re-uploads / chapter clips fall under 60.
const MIN_MINUTES = parseInt(flag('--min-minutes')) || 60;
const SINCE = (flag('--since') || '').replace(/-/g, '');
const TSV_OUT = flag('--tsv');

// ---- Load already-ingested videoIds ----------------------------------------
const known = new Set();
for (const f of readdirSync('src/content/sources').filter(x => x.endsWith('.md'))) {
  const fm = readFileSync(`src/content/sources/${f}`, 'utf8').match(/^videoId:\s*['"]?([^'"\n]+)/m);
  if (fm) known.add(fm[1].trim());
}
const corpusCount = known.size;

// Every id the intake driver has already resolved — done, dup, failed, skipped. These files
// are untracked, so they survive branch switches and keep dedup honest even when the corpus
// on this branch is behind. Anything here has had its shot; don't spend the morning on it again.
let progressCount = 0;
for (const [file, col] of [['.kir-intake-progress.tsv', 0], ['.kir-exclude.txt', 0]]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const id = line.split('\t')[col]?.trim();
    if (id && !id.startsWith('#')) { known.add(id); progressCount++; }
  }
}
console.log(`Loaded ${corpusCount} ingested videoIds + ${progressCount} already-seen ids.\n`);

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
  'John Kiriakou torture',
  'John Kiriakou full episode',
];

// ---- Kiriakou's OWN channels ------------------------------------------------
// Keyword search cannot find these: he doesn't put his own name in his own episode titles
// ("Is It Over For Netanyahu? | Ep. 6"), so the off-topic filter below would bin every one.
// His show also runs 44–58 min, under the long-form floor tuned for guest podcasts.
// So own channels get enumerated directly and judged by their own rules — see OWN_* below.
const OWN_CHANNELS = ['@realjohnkiriakou'];
// His channel posts three things: full episodes (44–58 min), cut-downs of those same episodes
// (4–15 min, sometimes labelled HIGHLIGHT and sometimes not), and promos/shorts (<2 min).
// A 2026-08-03 overlap check found every sub-15-minute item was ≥76% duplicate text of an
// episode already in the corpus. 20 minutes cleanly separates the real thing from the offcuts.
const OWN_MIN_MINUTES = 20;

const candidates = new Map(); // videoId → {id, title, durationSec, uploader, date, queryFound}
const ownIds = new Set();     // ids that came from an own channel — exempt from title/floor rules

for (const ch of OWN_CHANNELS) {
  // Delimiter is @@|@@, not a bare pipe: his episode titles are all "Headline | Ep. N", and a
  // bare-pipe split put " Ep. 9" in the duration field, zeroing it. Every own-channel episode
  // then failed the length floor as "too short" and the whole lane silently returned nothing
  // for weeks (Eps 1-6 were only ever ingested by hand). Title goes last as a second belt.
  const cmd = `yt-dlp --flat-playlist --no-warnings --print "%(id)s@@|@@%(duration)s@@|@@%(uploader)s@@|@@%(title)s" ` +
              `"https://www.youtube.com/${ch}/videos" 2>&1`;
  let out;
  try { out = execSync(cmd, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }); }
  catch (e) {
    const tail = (e.stdout || e.stderr || e.message || '').toString().trim().split('\n').slice(-2).join(' | ');
    console.warn(`  own-channel sweep failed: ${ch} :: ${tail}`);
    continue;
  }
  let n = 0;
  for (const line of out.split('\n').filter(Boolean)) {
    if (line.startsWith('ERROR') || line.startsWith('WARNING')) continue;
    const [id, dur, uploader, ...titleParts] = line.split('@@|@@');
    const title = titleParts.join('@@|@@').trim();
    if (!id || !title) continue;
    // Unaired premieres come back with no duration. They'll be picked up the morning after.
    if (!dur || dur === 'NA') continue;
    ownIds.add(id);
    if (candidates.has(id)) continue;
    candidates.set(id, {
      id, title,
      durationSec: parseInt(dur) || 0,
      uploader: uploader || 'John Kiriakou',
      date: '',
      queryFound: `own:${ch}`,
    });
    n++;
  }
  console.log(`  own channel ${ch}: ${n} videos`);
}


// Search sweeps run --flat-playlist: no format selection (which errors out on search results),
// no player round-trip per hit, and it's fast. The trade is upload_date comes back NA — dates
// get filled in by the probe stage below, for survivors only.
// NOTE: `ytsearchdate:` is NOT supported by this yt-dlp build (Unsupported url scheme) — don't
// reintroduce it. Recency comes from probing + --since, not from search ordering.
const SEARCH_ARGS = ['--flat-playlist', '--sleep-requests', '1', '--no-warnings'].join(' ');

for (const q of QUERIES) {
  // Same @@|@@ delimiter as the own-channel sweep — podcast titles are full of pipes too.
  const cmd = `yt-dlp ${SEARCH_ARGS} --print "%(id)s@@|@@%(duration)s@@|@@%(uploader)s@@|@@%(title)s" "ytsearch${LIMIT}:${q}" 2>&1`;
  let out;
  try { out = execSync(cmd, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }); }
  catch (e) {
    const tail = (e.stdout || e.stderr || e.message || '').toString().trim().split('\n').slice(-2).join(' | ');
    console.warn(`  search failed: ${q} :: ${tail}`);
    continue;
  }
  for (const line of out.split('\n').filter(Boolean)) {
    if (line.startsWith('ERROR')) continue;
    const [id, dur, uploader, ...titleParts] = line.split('@@|@@');
    const title = titleParts.join('@@|@@').trim();
    if (!id || !title) continue;
    if (candidates.has(id)) continue;
    candidates.set(id, {
      id, title,
      durationSec: parseInt(dur) || 0,
      uploader: uploader || '',
      date: '',
      queryFound: q,
    });
  }
}

console.log(`Found ${candidates.size} unique videos across ${QUERIES.length} searches.\n`);

// ---- Filter + classify -----------------------------------------------------
const seen = [];
const tooShort = [];
const offTopic = [];
const isClipChannel = [];
const tooOld = [];
let candidatesOut = [];

// Known "clip / cuts / highlights" channel patterns — these re-upload chunks
// from a main episode that almost always exists on a parent channel.
const CLIP_CHANNEL_PAT = /(\bclips?\b|\bcuts\b|\bhighlights?\b|\bshorts\b|\bdaily\b)/i;
// Clip-style title markers
const CLIP_TITLE_PAT = /(\bclip\b|\bhighlights?\b|\bbest moments\b|\bfull (?:episode|interview)\b is)/i;

for (const v of candidates.values()) {
  const own = ownIds.has(v.id);
  if (known.has(v.id)) { seen.push(v); continue; }
  if (v.durationSec < (own ? OWN_MIN_MINUTES : MIN_MINUTES) * 60) { tooShort.push(v); continue; }
  // Off-topic filter: title must mention Kiriakou. Skipped on his own channel, where every
  // video is him by definition and the titles are news headlines, not billing.
  if (!own && !/kiriakou|kiryaku|kiraku/i.test(v.title)) { offTopic.push(v); continue; }
  // Clip filter
  if (CLIP_CHANNEL_PAT.test(v.uploader) || CLIP_TITLE_PAT.test(v.title)) {
    isClipChannel.push(v); continue;
  }
  candidatesOut.push(v);
}

// ---- Probe stage: fill in upload dates for survivors only ------------------
// The flat sweep can't give us dates, and the date is what makes "posted recently" and the
// same-show-same-week dedupe work. Survivors are few (everything already seen got dropped
// above), so probing them one at a time is cheap. A probe failure is not fatal — the video
// keeps an empty date and still gets ingested; churn.sh reads the real date on fetch.
if (candidatesOut.length) {
  console.log(`Probing ${candidatesOut.length} survivors for upload dates...`);
  for (const v of candidatesOut) {
    try {
      const out = execSync(
        `yt-dlp --extractor-args "youtube:player_client=android_vr" --no-warnings ` +
        `--skip-download --print "%(upload_date)s@@%(view_count)s" "https://www.youtube.com/watch?v=${v.id}" 2>/dev/null`,
        { encoding: 'utf8', maxBuffer: 1024 * 1024 }
      ).trim().split('\n')[0] || '';
      const [d, views] = out.split('@@');
      if (/^\d{8}$/.test(d || '')) v.date = d;
      v.views = parseInt(views) || 0;
    } catch { /* leave date empty; not a reason to drop the video */ }
  }
  if (SINCE) {
    const kept = [];
    for (const v of candidatesOut) {
      if (v.date && v.date < SINCE) tooOld.push(v); else kept.push(v);
    }
    candidatesOut = kept;
  }
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
  // Own channel is exempt: he legitimately posts a full episode and a separate standalone
  // segment in the same week, and the 20-minute floor has already removed the offcuts.
  // Without this, the "keep the longest" rule would silently bin one of two real sources.
  const match = ownIds.has(v.id) ? null : grouped.find(g =>
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

// ---- Worklist emit (hands-off path into churn.sh) --------------------------
if (TSV_OUT) {
  const rows = candidatesOut.map(v => [
    'youtube',
    v.id,
    String(Math.round(v.durationSec / 60)),
    (v.uploader || '').replace(/\t/g, ' '),
    (v.title || '').replace(/\t/g, ' '),
  ].join('\t'));
  writeFileSync(TSV_OUT, ['type\ttarget\tminutes\tshow\ttitle', ...rows].join('\n') + '\n');
  console.log(`\nWrote ${rows.length} rows → ${TSV_OUT}`);
}

console.log(`\n--- Filtered out ---`);
console.log(`  ${seen.length} already ingested or already seen`);
if (SINCE) console.log(`  ${tooOld.length} older than ${SINCE}`);
console.log(`  ${tooShort.length} too short (<${MIN_MINUTES}m)`);
console.log(`  ${offTopic.length} off-topic (title doesn't mention Kiriakou)`);
console.log(`  ${isClipChannel.length} clip/highlights channels or titles`);
if (typeof droppedAsClips !== 'undefined' && droppedAsClips.length) {
  console.log(`  ${droppedAsClips.length} same-uploader-and-week duplicates (kept the longest):`);
  for (const v of droppedAsClips.slice(0, 6)) {
    console.log(`    [${fmtDate(v.date)}] ${fmtDur(v.durationSec)}  ${v.uploader} — ${v.title.slice(0,80)}`);
  }
}
