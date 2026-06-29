#!/usr/bin/env node
// Nonstop loop runner — keeps the botnet pipeline pumping 24/7.
//
// Unlike run-cycle.mjs (which runs one sequential pass and exits),
// run-forever.mjs is a long-lived supervisor: it manages a set of
// independent "lanes", each scheduled at its own cadence, with
// per-lane concurrency caps, retry/backoff, a daily fleet-call
// budget guard, and graceful shutdown.
//
// Lanes (cadence):
//   trawler   — pull new YouTube material   (every ~6h)
//   catch-import — drain fleet/catch into clips (every 10 min, --auto-trust)
//   triage    — NPP triage of fresh leads   (every 10 min when leads waiting)
//   plant     — scribe pool (transcribe)    (continuous while clips await)
//   plant2    — cataloger-editor pool        (continuous while transcripts await)
//   reviewer  — grounding pass               (every 5 min when claims pending)
//   coord     — coordinator commit pass      (every 15 min)
//   indexer   — rebuild indexes              (every 30 min when coord ran)
//   mining    — deepener/enricher/weaver     (round-robin, ~20 min)
//   weaver2   — reweaver                     (every 45 min)
//   prospect  — prospector                   (every 30 min)
//   calendar  — calendar-keeper (OTD filler) (every 25 min, no fleet)
//   sentry    — mouth-sentry                 (every hour)
//   snapshot  — snapshot writer              (every 5 min)
//
// Run:
//   node botnet/run-forever.mjs               # default lanes
//   node botnet/run-forever.mjs --no-push     # never push commits
//   node botnet/run-forever.mjs --dry         # show plan, exit
//   node botnet/run-forever.mjs --only=trawler,plant
//   node botnet/run-forever.mjs --skip=trawler
//
// Safety:
//   - PID lock at botnet/data/forever.lock prevents double-runs.
//   - Daily fleet-call counter (fleet/ledger/usage.jsonl) hard-stops
//     enrichment lanes at budget.tripwires.daily_fleet_calls_hard_stop_at.
//   - SIGINT / SIGTERM = drain (wait for running tasks, then exit clean).
//   - Each lane has its own retry/backoff; one crashed lane does not
//     bring down the supervisor.
//
// What this DOES NOT touch (per handoff):
//   - Worker internals (Expert A's lane)
//   - src/content/articles, src/pages, astro.config.mjs
//   - Cron registration on the host (no daemon install here)

import { spawn } from 'node:child_process';
import {
  existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, appendFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');
const W = (name) => join(HERE, 'workers', `${name}.mjs`);
const LIB = (name) => join(HERE, 'lib', `${name}.mjs`);
const DATA_DIR = join(HERE, 'data');
const LOCK_PATH = join(DATA_DIR, 'forever.lock');
const LOG_DIR = join(REPO_ROOT, 'fleet', 'ledger');
const SUPERVISOR_LOG = join(LOG_DIR, 'forever.log');
const BUDGET_PATH = join(REPO_ROOT, 'fleet', 'config', 'budget.json');
const USAGE_PATH = join(LOG_DIR, 'usage.jsonl');

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(LOG_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const FLAG = (name) => argv.includes(`--${name}`);
const VAL = (name) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

const PUSH = !FLAG('no-push');           // commit & push by default
const DRY = FLAG('dry');                 // print plan and exit
const ONLY = (VAL('only') || '').split(',').filter(Boolean);
const SKIP = (VAL('skip') || '').split(',').filter(Boolean);

// ---------------------------------------------------------------------------
// Lock file: prevent two supervisors at once
// ---------------------------------------------------------------------------
function acquireLock() {
  if (existsSync(LOCK_PATH)) {
    const pid = parseInt(readFileSync(LOCK_PATH, 'utf8').trim(), 10);
    let alive = false;
    try { process.kill(pid, 0); alive = true; } catch {}
    if (alive) {
      console.error(`[forever] already running as pid ${pid} (lock: ${LOCK_PATH}). Exiting.`);
      process.exit(1);
    }
    console.warn(`[forever] stale lock from pid ${pid}; clearing.`);
    try { unlinkSync(LOCK_PATH); } catch {}
  }
  writeFileSync(LOCK_PATH, String(process.pid));
}
function releaseLock() {
  try { if (readFileSync(LOCK_PATH, 'utf8').trim() === String(process.pid)) unlinkSync(LOCK_PATH); } catch {}
}

// ---------------------------------------------------------------------------
// Supervisor log (newline JSON for grep-ability)
// ---------------------------------------------------------------------------
function logLine(obj) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...obj });
  console.log(line);
  try { appendFileSync(SUPERVISOR_LOG, line + '\n'); } catch {}
}

// ---------------------------------------------------------------------------
// Daily fleet-call budget guard
//   Reads fleet/ledger/usage.jsonl for today and compares against
//   budget.tripwires.daily_fleet_calls_hard_stop_at.
//   If over hard stop, enrichment lanes are paused (trawler+coord still run
//   because they don't burn the fleet).
// ---------------------------------------------------------------------------
let budget = { warn: 200, hardStop: 800 };
try {
  const b = JSON.parse(readFileSync(BUDGET_PATH, 'utf8'));
  budget.warn = b.tripwires?.daily_fleet_calls_warn_at ?? 200;
  budget.hardStop = b.tripwires?.daily_fleet_calls_hard_stop_at ?? 800;
} catch (err) {
  logLine({ event: 'budget_load_failed', detail: err.message });
}

function todaysFleetCalls() {
  if (!existsSync(USAGE_PATH)) return 0;
  const today = new Date().toISOString().slice(0, 10);
  let n = 0;
  try {
    const lines = readFileSync(USAGE_PATH, 'utf8').split('\n');
    for (const ln of lines) {
      if (!ln.trim()) continue;
      try {
        const r = JSON.parse(ln);
        const ts = r.ts || r.timestamp || '';
        if (typeof ts === 'string' && ts.startsWith(today)) n += r.calls || 1;
      } catch {}
    }
  } catch {}
  return n;
}

function budgetState() {
  const used = todaysFleetCalls();
  if (used >= budget.hardStop) return { level: 'stop', used };
  if (used >= budget.warn) return { level: 'warn', used };
  return { level: 'ok', used };
}

// ---------------------------------------------------------------------------
// Run a single child task with timeout and capture.
// Returns { code, stdoutTail, stderrTail, ms }.
// ---------------------------------------------------------------------------
function runChild(cmd, args, { timeoutMs = 30 * 60 * 1000, env = {} } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(cmd, args, {
      cwd: REPO_ROOT,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '', err = '';
    const cap = (buf, s) => (buf + s).slice(-4000);
    child.stdout.on('data', (d) => { out = cap(out, d.toString()); });
    child.stderr.on('data', (d) => { err = cap(err, d.toString()); });

    const killer = setTimeout(() => {
      try { child.kill('SIGTERM'); } catch {}
      setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 5000);
    }, timeoutMs);

    child.on('exit', (code) => {
      clearTimeout(killer);
      resolve({ code: code ?? -1, stdoutTail: out, stderrTail: err, ms: Date.now() - started });
    });
    child.on('error', (e) => {
      clearTimeout(killer);
      resolve({ code: -1, stdoutTail: out, stderrTail: e.message, ms: Date.now() - started });
    });
  });
}

// ---------------------------------------------------------------------------
// Lane: a recurring task. Each lane runs serially against itself (one in
// flight at a time per lane). Multiple lanes run concurrently with each other.
// ---------------------------------------------------------------------------
let shuttingDown = false;
const lanes = [];

function defineLane({
  name,
  cmd,             // returns { bin, args } or array of steps
  intervalMs,      // base interval between runs (after success)
  jitterMs = 0,    // +/- jitter to desync lanes
  timeoutMs = 30 * 60 * 1000,
  burnsFleet = true,   // skip when budget hard-stop reached
  maxBackoffMs = 30 * 60 * 1000,
}) {
  if (ONLY.length && !ONLY.includes(name)) return;
  if (SKIP.includes(name)) return;
  lanes.push({ name, cmd, intervalMs, jitterMs, timeoutMs, burnsFleet, maxBackoffMs });
}

async function laneLoop(lane) {
  let backoff = 0;
  while (!shuttingDown) {
    const bud = budgetState();
    if (lane.burnsFleet && bud.level === 'stop') {
      logLine({ lane: lane.name, event: 'budget_pause', used: bud.used, hardStop: budget.hardStop });
      await sleep(10 * 60 * 1000);
      continue;
    }

    let steps = lane.cmd();
    if (!Array.isArray(steps)) steps = [steps];

    let anyFail = false;
    for (const step of steps) {
      if (shuttingDown) break;
      logLine({ lane: lane.name, event: 'start', step: step.label || null, bin: step.bin, args: step.args });
      const res = await runChild(step.bin, step.args, { timeoutMs: lane.timeoutMs });
      logLine({
        lane: lane.name,
        event: 'done',
        step: step.label || null,
        code: res.code,
        ms: res.ms,
        stderr: res.code !== 0 ? res.stderrTail.slice(-500) : undefined,
      });
      if (res.code !== 0) anyFail = true;
    }

    if (anyFail) {
      backoff = Math.min(lane.maxBackoffMs, backoff ? backoff * 2 : 30_000);
      logLine({ lane: lane.name, event: 'backoff', ms: backoff });
      await sleep(backoff);
    } else {
      backoff = 0;
      const jitter = lane.jitterMs ? Math.floor((Math.random() * 2 - 1) * lane.jitterMs) : 0;
      await sleep(Math.max(1000, lane.intervalMs + jitter));
    }
  }
  logLine({ lane: lane.name, event: 'lane_exit' });
}

function sleep(ms) {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    // Allow the supervisor to wake sleeping lanes during shutdown.
    process.once('drain', () => { clearTimeout(t); resolve(); });
  });
}

// ---------------------------------------------------------------------------
// Lane definitions
// ---------------------------------------------------------------------------

// Trawler: fetch new YouTube material. Pure rule-based, no fleet calls.
// Cadence: budget says max 4 runs/day → every 6h with jitter.
defineLane({
  name: 'trawler',
  burnsFleet: false,
  intervalMs: 6 * 60 * 60 * 1000,
  jitterMs: 15 * 60 * 1000,
  timeoutMs: 20 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [join(REPO_ROOT, 'fleet/trawlers/youtube.mjs')] }),
});

// Catch-import: drain fleet/catch/*.jsonl into the botnet clips table.
// Bridges Harbor Master output → botnet pipeline. Trusted catches skip NPP.
// Cheap, local, no LLM — safe to run often.
defineLane({
  name: 'catch-import',
  burnsFleet: false,
  intervalMs: 10 * 60 * 1000,
  jitterMs: 30 * 1000,
  timeoutMs: 5 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [W('catch-importer'), '--auto-trust'] }),
});

// Office: probe LLM provider/key health and refresh routing state.
// Cheap, just tiny test calls. Keeps the broker honest.
defineLane({
  name: 'office',
  burnsFleet: false,
  intervalMs: 10 * 60 * 1000,
  jitterMs: 45 * 1000,
  timeoutMs: 3 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [W('office-manager')] }),
});

// Triage: NPP on fresh leads. Cheap worker_fast calls.
defineLane({
  name: 'triage',
  intervalMs: 10 * 60 * 1000,
  jitterMs: 60 * 1000,
  timeoutMs: 10 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [W('npp')] }),
});

// Plant — scribe pool. Three workers run as separate steps so SQLite
// claimNextClip() naturally serializes them; each takes one clip.
defineLane({
  name: 'plant',
  intervalMs: 90 * 1000,
  jitterMs: 15 * 1000,
  timeoutMs: 25 * 60 * 1000,
  burnsFleet: false,           // scribe = yt-dlp, no LLM
  cmd: () => [
    { label: 'scribe-1', bin: 'node', args: [W('scribe'), '--worker', 'scribe-1', '--batch', '1'] },
    { label: 'scribe-2', bin: 'node', args: [W('scribe'), '--worker', 'scribe-2', '--batch', '1'] },
    { label: 'scribe-3', bin: 'node', args: [W('scribe'), '--worker', 'scribe-3', '--batch', '1'] },
  ],
});

// Plant2 — cataloger-editor pool (extracts claims from transcripts).
defineLane({
  name: 'plant2',
  intervalMs: 120 * 1000,
  jitterMs: 20 * 1000,
  timeoutMs: 20 * 60 * 1000,
  cmd: () => [
    { label: 'cat-1', bin: 'node', args: [W('cataloger-editor'), '--worker', 'cataloger-1', '--batch', '1'] },
    { label: 'cat-2', bin: 'node', args: [W('cataloger-editor'), '--worker', 'cataloger-2', '--batch', '1'] },
  ],
});

// Reviewer — grounding pass over pending claims.
defineLane({
  name: 'reviewer',
  intervalMs: 5 * 60 * 1000,
  jitterMs: 30 * 1000,
  cmd: () => ({ bin: 'node', args: [W('reviewer')] }),
});

// Coordinator — the ONLY git writer. Runs every 15min; commits if claims passed.
defineLane({
  name: 'coord',
  intervalMs: 15 * 60 * 1000,
  jitterMs: 60 * 1000,
  burnsFleet: false,
  cmd: () => ({
    bin: 'node',
    args: PUSH ? [W('coordinator'), '--push'] : [W('coordinator')],
  }),
});

// Indexer — rebuild date + mentions indexes.
defineLane({
  name: 'indexer',
  intervalMs: 30 * 60 * 1000,
  jitterMs: 2 * 60 * 1000,
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [W('indexer')] }),
});

// Mining — deepener / enricher / weaver round-robin. The pickers inside each
// worker have their own cooldowns (2h / 2h / 4h), so we just keep poking them.
defineLane({
  name: 'mining',
  intervalMs: 20 * 60 * 1000,
  jitterMs: 3 * 60 * 1000,
  cmd: () => [
    { label: 'deepener', bin: 'node', args: [W('deepener'), '--batch', '5'] },
    { label: 'enricher', bin: 'node', args: [W('enricher'), '--batch', '5'] },
    { label: 'weaver',   bin: 'node', args: [W('weaver'),   '--batch', '5'] },
  ],
});

// Weaver2 — reweaver (article-weaving skill, expensive).
defineLane({
  name: 'weaver2',
  intervalMs: 45 * 60 * 1000,
  jitterMs: 5 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [W('reweaver'), '--batch', '3'] }),
});

// Prospector — find Tier-C promotion candidates.
defineLane({
  name: 'prospect',
  intervalMs: 30 * 60 * 1000,
  jitterMs: 2 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [W('prospector'), '--batch', '2'] }),
});

// Orders of the Day — fires once per day at 2am UTC. Reads corpus state,
// calculates the gap to 500k words, and writes today's priority targets to
// botnet/state/orders-today.json so every worker has specific marching orders.
defineLane({
  name: 'orders',
  intervalMs: 24 * 60 * 60 * 1000, // once a day
  jitterMs: 0,
  burnsFleet: false,
  // Fire at 2am UTC: compute delay from now to next 2am.
  initialDelayMs: (() => {
    const now = new Date();
    const next2am = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + (now.getUTCHours() >= 2 ? 1 : 0), 2, 0, 0, 0));
    return Math.max(0, next2am.getTime() - now.getTime());
  })(),
  cmd: () => ({ bin: 'node', args: [W('orders-of-day')] }),
});

// Calendar-keeper — fill the "On this day" page from source transcripts and
// source publication dates. Pure regex + sqlite; no LLM. Proposes
// events_append claims that the reviewer and coordinator merge normally.
defineLane({
  name: 'calendar',
  intervalMs: 25 * 60 * 1000,
  jitterMs: 90 * 1000,
  timeoutMs: 5 * 60 * 1000,
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [W('calendar-keeper')] }),
});

// Sentry — mouth-sentry QA pass.
defineLane({
  name: 'sentry',
  intervalMs: 60 * 60 * 1000,
  jitterMs: 5 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [W('mouth-sentry')] }),
});

// Snapshot — emit snapshot.json for the pixel office.
defineLane({
  name: 'snapshot',
  intervalMs: 5 * 60 * 1000,
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [LIB('snapshot-writer')] }),
});

// ---------------------------------------------------------------------------
// Phase 2/3/4 lanes — new workers.
// ---------------------------------------------------------------------------

// Triage Patroller — pure code, no fleet. Selection ≠ work. Writes briefs.
defineLane({
  name: 'triage-patroller',
  intervalMs: 10 * 60 * 1000,
  jitterMs: 45 * 1000,
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [W('triage-patroller'), '--per-role', '25'] }),
});

// Re-Reader — Engine 2. Walks stale passages under the current hash.
defineLane({
  name: 're-reader',
  intervalMs: 20 * 60 * 1000,
  jitterMs: 2 * 60 * 1000,
  cmd: () => ({ bin: 'node', args: [W('re-reader'), '--worker', 're-reader-1', '--batch', '2'] }),
});

// Materializer — bridges Re-Reader verdicts into the claims pipeline so
// spawn/amend decisions actually become article writes. Runs more often than
// the Re-Reader so verdicts don't pile up.
defineLane({
  name: 'materializer',
  intervalMs: 8 * 60 * 1000,
  jitterMs: 30 * 1000,
  cmd: () => ({ bin: 'node', args: [W('materializer'), '--worker', 'materializer-1', '--batch', '20'] }),
});

// Discretion Warden — mirrors Kiriakou's discretion before claims propagate.
defineLane({
  name: 'discretion',
  intervalMs: 7 * 60 * 1000,
  jitterMs: 30 * 1000,
  cmd: () => ({ bin: 'node', args: [W('discretion-warden'), '--batch', '20'] }),
});

// First/Third Splitter — perspective tag (witnessed vs relayed).
defineLane({
  name: 'splitter',
  intervalMs: 7 * 60 * 1000,
  jitterMs: 30 * 1000,
  cmd: () => ({ bin: 'node', args: [W('first-third-splitter'), '--batch', '30'] }),
});

// Diff Sentinel — patrol git history for cite removal + hedge drift.
defineLane({
  name: 'diff-sentinel',
  intervalMs: 30 * 60 * 1000,
  jitterMs: 90 * 1000,
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [W('diff-sentinel')] }),
});

// Shape Auditor — TOC convergence flags + weaver shape-redesign briefs.
defineLane({
  name: 'shape-auditor',
  intervalMs: 60 * 60 * 1000,
  jitterMs: 2 * 60 * 1000,
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [W('shape-auditor'), '--threshold', '5'] }),
});

// MoS Enforcer — runs the four audit scripts, logs failures.
defineLane({
  name: 'mos-enforcer',
  intervalMs: 60 * 60 * 1000,
  jitterMs: 2 * 60 * 1000,
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [W('mos-enforcer')] }),
});

// Promotion Committee — daily ceremony at 23:00 UTC (PA-ish). Quorum-gated.
defineLane({
  name: 'promotion',
  intervalMs: 24 * 60 * 60 * 1000,
  jitterMs: 0,
  burnsFleet: false,
  initialDelayMs: (() => {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
      now.getUTCDate() + (now.getUTCHours() >= 23 ? 1 : 0), 23, 0, 0, 0));
    return Math.max(0, next.getTime() - now.getTime());
  })(),
  cmd: () => ({ bin: 'node', args: [W('promotion-committee')] }),
});

// Research-team snapshot — drives /research-team dashboard.
defineLane({
  name: 'rt-snapshot',
  intervalMs: 60 * 1000,        // refresh every minute for a live feel
  burnsFleet: false,
  cmd: () => ({ bin: 'node', args: [LIB('research-team-snapshot')] }),
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
if (DRY) {
  console.log('Lanes that would run:');
  for (const l of lanes) {
    console.log(`  - ${l.name.padEnd(10)} every ${Math.round(l.intervalMs / 1000)}s` +
                (l.burnsFleet ? '' : ' (no-fleet)'));
  }
  console.log('\nBudget tripwires:');
  console.log(`  warn at ${budget.warn} fleet calls/day, hard stop at ${budget.hardStop}.`);
  console.log(`  current today: ${todaysFleetCalls()}.`);
  console.log('\nPush mode:', PUSH ? 'on (coordinator will git push)' : 'off (commits stay local)');
  process.exit(0);
}

acquireLock();
logLine({ event: 'boot', pid: process.pid, lanes: lanes.map((l) => l.name), push: PUSH });

let drainTimer = null;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logLine({ event: 'shutdown_begin', signal });
  process.emit('drain');
  // Give in-flight children up to 60s to finish their step.
  drainTimer = setTimeout(() => {
    logLine({ event: 'shutdown_force' });
    releaseLock();
    process.exit(0);
  }, 60_000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Launch all lanes; await none — they run forever.
const finished = lanes.map((l) => laneLoop(l).catch((err) => {
  logLine({ lane: l.name, event: 'lane_crashed', detail: err?.message || String(err) });
}));

Promise.all(finished).then(() => {
  logLine({ event: 'all_lanes_exited' });
  if (drainTimer) clearTimeout(drainTimer);
  releaseLock();
  process.exit(0);
});
