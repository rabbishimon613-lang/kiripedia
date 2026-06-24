#!/usr/bin/env node
// Channel Crawler — walks the upload history of known host channels via
// `yt-dlp --flat-playlist`. Replaces the dead `recent-changes` ytsearch worker.
//
// Strategy:
//   - Iterate fleet/config/discovery-seeds.json youtube[] entries.
//   - For each channel whose cadence has elapsed, walk its /videos page
//     with --flat-playlist (1 request per channel, no captions, no media).
//   - Filter for Kiriakou-likely titles (rule-based; canonical + common mangles).
//   - Dedup against src/content/sources/ (by videoId) and against today's catch.
//   - Write fresh leads to fleet/catch/YYYY-MM-DD.jsonl with status=fresh.
//   - Update fleet/ledger/usage.jsonl with per-channel stats.
//
// NO LLM calls. NO YouTube search API. Pure yt-dlp + rule-based filtering.
//
// Usage:
//   node fleet/trawlers/channel-crawler.mjs [--tier 1|2|3] [--channel <handle>] [--dry-run] [--max-channels N]
//
// Status: SKELETON. Tested locally against 6 channels (counts confirmed:
// JudgingFreedom 1583, GlennGreenwald 1312, TheoVon 863, TuckerCarlson 491,
// DialogueWorks 56, TheRippleEffectPodcast 27). Not yet wired to a cron.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const FLEET_DIR = join(REPO_ROOT, 'fleet');
const CATCH_DIR = join(FLEET_DIR, 'catch');
const LEDGER_DIR = join(FLEET_DIR, 'ledger');
const STATE_FILE = join(FLEET_DIR, 'ledger', 'channel-crawler-state.json');
const SEEDS_FILE = join(FLEET_DIR, 'config', 'discovery-seeds.json');

const TODAY = new Date().toISOString().slice(0, 10);
const NOW_ISO = new Date().toISOString();
const CATCH_FILE = join(CATCH_DIR, `${TODAY}.jsonl`);
const LEDGER_FILE = join(LEDGER_DIR, 'channel-crawler.jsonl');

// ---- CLI args --------------------------------------------------------------
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : (args[i + 1] ?? true);
};
const ONLY_TIER = arg('--tier', null) && parseInt(arg('--tier', null));
const ONLY_CHANNEL = arg('--channel', null);
const DRY_RUN = args.includes('--dry-run');
const MAX_CHANNELS = parseInt(arg('--max-channels', 9999));

// ---- Kiriakou title filter --------------------------------------------------
// We crawl whole channels but only emit titles that look like Kiriakou
// appearances. Tolerate common auto-caption / lazy mangling.
const KIRIAKOU_TITLE_RE = /\b(kiriak[ou]+|kiriakou|kiraku|kyriakou|cia whistleblower)\b/i;
const MIN_DURATION_SEC = 20 * 60;  // 20 min — short enough to catch "Deep Focus Q&A" cuts but not Shorts.

// ---- Load known videoIds (already in corpus) -------------------------------
function loadKnownVideoIds() {
  const known = new Set();
  const sourcesDir = join(REPO_ROOT, 'src', 'content', 'sources');
  if (!existsSync(sourcesDir)) return known;
  for (const f of readdirSync(sourcesDir).filter(x => x.endsWith('.md'))) {
    try {
      const fm = readFileSync(join(sourcesDir, f), 'utf8').match(/^videoId:\s*['"]?([^'"\n]+)/m);
      if (fm) known.add(fm[1].trim());
    } catch {}
  }
  return known;
}

// ---- Per-channel state (last-walked timestamps) -----------------------------
function loadState() {
  if (!existsSync(STATE_FILE)) return { channels: {} };
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch { return { channels: {} }; }
}
function saveState(s) {
  mkdirSync(LEDGER_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

// ---- Cadence check ----------------------------------------------------------
function isDueForCrawl(handle, cadenceDays, state) {
  const last = state.channels?.[handle]?.last_walked_at;
  if (!last) return true;
  const ageMs = Date.now() - new Date(last).getTime();
  return ageMs >= cadenceDays * 86400 * 1000;
}

// ---- yt-dlp flat-playlist walk ---------------------------------------------
// Returns array of { videoId, title, duration_sec | null }.
// Uses --flat-playlist — no per-video probes, one HTTP round-trip per channel.
function walkChannel(handle) {
  // SABR/mweb bypass + low rate-limit. duration is "NA" in flat-playlist for
  // most channels, so we fall back to a second pass with --print for hits only.
  const cmd = [
    'yt-dlp',
    '--flat-playlist',
    '--extractor-args', '"youtube:player_client=mweb;skip=hls,dash"',
    '--sleep-requests', '2',
    '--no-warnings',
    '--print', '"%(id)s\t%(title)s\t%(duration)s"',
    `"https://www.youtube.com/@${handle}/videos"`,
  ].join(' ');

  let out = '';
  try {
    out = execSync(cmd, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    return { ok: false, error: (e.stderr || e.message || '').toString().split('\n').slice(-3).join(' | '), items: [] };
  }

  const items = [];
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    const [videoId, title, durRaw] = line.split('\t');
    if (!videoId || !title) continue;
    const duration_sec = durRaw && durRaw !== 'NA' ? parseInt(durRaw) : null;
    items.push({ videoId, title, duration_sec });
  }
  return { ok: true, items };
}

// ---- Filter to Kiriakou hits -----------------------------------------------
function filterHits(items, known, seenToday) {
  return items.filter(it => {
    if (known.has(it.videoId)) return false;
    if (seenToday.has(`yt:${it.videoId}`)) return false;
    if (!KIRIAKOU_TITLE_RE.test(it.title)) return false;
    // Duration unknown? Keep it — Scribe will reject Shorts at fetch time.
    if (it.duration_sec !== null && it.duration_sec < MIN_DURATION_SEC) return false;
    return true;
  });
}

// ---- Main -------------------------------------------------------------------
function main() {
  const seeds = JSON.parse(readFileSync(SEEDS_FILE, 'utf8'));
  const channels = seeds.youtube || [];
  const filtered = channels.filter(c => {
    if (ONLY_TIER && c.tier !== ONLY_TIER) return false;
    if (ONLY_CHANNEL && c.handle !== ONLY_CHANNEL) return false;
    return true;
  });

  const state = loadState();
  const known = loadKnownVideoIds();
  const seenToday = new Set();
  if (existsSync(CATCH_FILE)) {
    for (const line of readFileSync(CATCH_FILE, 'utf8').split('\n').filter(Boolean)) {
      try { seenToday.add(JSON.parse(line).id); } catch {}
    }
  }

  console.error(`[channel-crawler] ${filtered.length} channels in scope (known videoIds: ${known.size}, already caught today: ${seenToday.size}).`);

  let walked = 0, skipped = 0, totalSeen = 0, totalHits = 0, totalFresh = 0, totalErrors = 0;
  const perChannel = [];

  for (const ch of filtered) {
    if (walked >= MAX_CHANNELS) break;
    if (!ONLY_CHANNEL && !isDueForCrawl(ch.handle, ch.cadence_days, state)) {
      skipped++;
      continue;
    }
    walked++;
    process.stderr.write(`  walking @${ch.handle} (tier ${ch.tier}, every ${ch.cadence_days}d)… `);

    const result = walkChannel(ch.handle);
    if (!result.ok) {
      totalErrors++;
      console.error(`ERROR: ${result.error}`);
      perChannel.push({ handle: ch.handle, tier: ch.tier, error: result.error, seen: 0, hits: 0, fresh: 0 });
      continue;
    }

    const hits = filterHits(result.items, known, seenToday);
    totalSeen += result.items.length;
    totalHits += hits.length;

    const fresh = [];
    for (const h of hits) {
      const rec = {
        id: `yt:${h.videoId}`,
        ts: NOW_ISO,
        catch_type: 'youtube_longform',
        video_id: h.videoId,
        url: `https://www.youtube.com/watch?v=${h.videoId}`,
        title: h.title,
        channel: ch.show,
        date: null,                  // unknown from flat-playlist; Scribe fills it.
        duration_sec: h.duration_sec,
        trusted: ch.tier === 1,
        status: 'fresh',
        source_trawler: 'channel-crawler',
        seed_handle: ch.handle,
        seed_tier: ch.tier,
        notes: null,
      };
      fresh.push(rec);
      seenToday.add(rec.id);
    }
    totalFresh += fresh.length;

    if (!DRY_RUN && fresh.length) {
      mkdirSync(CATCH_DIR, { recursive: true });
      for (const r of fresh) appendFileSync(CATCH_FILE, JSON.stringify(r) + '\n');
    }

    state.channels[ch.handle] = {
      last_walked_at: NOW_ISO,
      last_seen: result.items.length,
      last_hits: hits.length,
      last_fresh: fresh.length,
      tier: ch.tier,
    };

    perChannel.push({ handle: ch.handle, tier: ch.tier, seen: result.items.length, hits: hits.length, fresh: fresh.length });
    console.error(`${result.items.length} videos, ${hits.length} match Kiriakou, ${fresh.length} new.`);
  }

  if (!DRY_RUN) saveState(state);

  // Ledger row
  mkdirSync(LEDGER_DIR, { recursive: true });
  appendFileSync(LEDGER_FILE, JSON.stringify({
    trawler: 'channel-crawler',
    date: TODAY,
    ts: NOW_ISO,
    walked, skipped, total_seen: totalSeen, total_hits: totalHits, total_fresh: totalFresh, errors: totalErrors,
    per_channel: perChannel,
    dry_run: DRY_RUN,
  }) + '\n');

  console.log(`[channel-crawler] walked ${walked} / skipped ${skipped} / seen ${totalSeen} videos / ${totalHits} Kiriakou hits / ${totalFresh} fresh / ${totalErrors} errors`);
  console.log(`[channel-crawler] catch: ${CATCH_FILE}`);
}

main();
