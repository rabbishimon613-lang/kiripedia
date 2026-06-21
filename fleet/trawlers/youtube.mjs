#!/usr/bin/env node
// YouTube trawler — runs at sea.
//
// Wraps tools/find-new-kiriakou-videos.mjs (which already does rule-based
// title triage + dedup against src/content/sources) and writes the catch
// into fleet/catch/YYYY-MM-DD.jsonl.
//
// NO fleet calls happen here. Pure rule-based filtering. Cost = yt-dlp probes,
// capped in fleet/config/budget.json.
//
// Catch record schema:
//   { id, ts, catch_type, video_id, url, title, channel, date,
//     duration_sec, trusted, status, notes }
//
// Status lifecycle:
//   fresh    → just caught
//   greenlit → user said process this (Harbor Master flips it)
//   suspect  → flagged for Opus
//   trashed  → user said no
//   processed → plant has run on it
//
// Usage:
//   node fleet/trawlers/youtube.mjs [--limit N]

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const REPO_ROOT = join(dirname(new URL(import.meta.url).pathname), '..', '..');
const FLEET_DIR = join(REPO_ROOT, 'fleet');
const CATCH_DIR = join(FLEET_DIR, 'catch');
const LEDGER_DIR = join(FLEET_DIR, 'ledger');

const TODAY = new Date().toISOString().slice(0, 10);
const CATCH_FILE = join(CATCH_DIR, `${TODAY}.jsonl`);
const LEDGER_FILE = join(LEDGER_DIR, 'usage.jsonl');

// ---- Budget check ----------------------------------------------------------
const budget = JSON.parse(readFileSync(join(FLEET_DIR, 'config', 'budget.json'), 'utf8'));
const ytBudget = budget.at_sea.youtube_trawler;

const todayRuns = existsSync(LEDGER_FILE)
  ? readFileSync(LEDGER_FILE, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(JSON.parse)
      .filter(r => r.trawler === 'youtube' && r.date === TODAY)
  : [];

if (todayRuns.length >= ytBudget.max_runs_per_day) {
  console.error(`[trawler:youtube] Budget reached: ${todayRuns.length}/${ytBudget.max_runs_per_day} runs today. Idle.`);
  process.exit(0);
}

console.error(`[trawler:youtube] Run ${todayRuns.length + 1}/${ytBudget.max_runs_per_day} for ${TODAY}.`);

// ---- Run existing finder ---------------------------------------------------
const findCmd = `node ${join(REPO_ROOT, 'tools', 'find-new-kiriakou-videos.mjs')} --limit ${ytBudget.max_yt_dlp_probes_per_run}`;
let rawOutput = '';
let exitOk = true;
try {
  rawOutput = execSync(findCmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
} catch (e) {
  exitOk = false;
  rawOutput = e.stdout || '';
  console.error(`[trawler:youtube] finder exited non-zero — parsing what we got.`);
}

// ---- Parse candidate block -------------------------------------------------
// Lines look like:
//   ★ [2026-05-25]   1h12  https://www.youtube.com/watch?v=ID
//      ChannelName
//      Title text (up to 100 chars)
const lines = rawOutput.split('\n');
const candidates = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^(\s*[★ ]\s*)\[(\d{4}-\d{2}-\d{2})\]\s+(\S+)\s+https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/);
  if (!m) continue;
  const trusted = lines[i].includes('★');
  const date = m[2];
  const durStr = m[3];
  const videoId = m[4];
  const channel = (lines[i + 1] || '').trim();
  const title = (lines[i + 2] || '').trim();
  candidates.push({
    id: `yt:${videoId}`,
    ts: new Date().toISOString(),
    catch_type: 'youtube_longform',
    video_id: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title,
    channel,
    date,
    duration_str: durStr,
    duration_sec: parseDur(durStr),
    trusted,
    status: 'fresh',
    notes: null,
  });
}

// ---- Dedup against today's catch file --------------------------------------
const seenToday = new Set();
if (existsSync(CATCH_FILE)) {
  for (const line of readFileSync(CATCH_FILE, 'utf8').split('\n').filter(Boolean)) {
    try { seenToday.add(JSON.parse(line).id); } catch {}
  }
}
const fresh = candidates.filter(c => !seenToday.has(c.id));

// ---- Write catch -----------------------------------------------------------
if (!existsSync(CATCH_DIR)) mkdirSync(CATCH_DIR, { recursive: true });
for (const c of fresh) appendFileSync(CATCH_FILE, JSON.stringify(c) + '\n');

// ---- Update ledger ---------------------------------------------------------
if (!existsSync(LEDGER_DIR)) mkdirSync(LEDGER_DIR, { recursive: true });
appendFileSync(LEDGER_FILE, JSON.stringify({
  trawler: 'youtube',
  date: TODAY,
  ts: new Date().toISOString(),
  candidates_total: candidates.length,
  fresh_after_dedup: fresh.length,
  trusted_count: fresh.filter(c => c.trusted).length,
  finder_exit_ok: exitOk,
  fleet_calls: 0,
}) + '\n');

// ---- Report ----------------------------------------------------------------
console.log(`[trawler:youtube] Caught ${fresh.length} fresh (${candidates.length - fresh.length} dup, ${fresh.filter(c => c.trusted).length} ★).`);
console.log(`[trawler:youtube] Catch file: ${CATCH_FILE}`);

function parseDur(s) {
  const h = s.match(/(\d+)h/);
  const m = s.match(/(\d+)m/);
  return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0);
}
