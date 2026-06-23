#!/usr/bin/env node
// HF Space loop wrapper. Runs run-cycle.mjs continuously, exposes /health
// for cron-job.org pings (prevents 48h idle pause).
//
// Hardening:
//   - Per-cycle watchdog kills hung cycles after CYCLE_TIMEOUT_MS.
//   - Hard-syncs the local clone to origin/main before each cycle so we
//     never push from a divergent base (the GH Actions cron also commits).
//   - /health surfaces `stuck:true` when last cycle was killed by watchdog.
//   - Default sleep tuned for free LLM tier rate limits.

import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';

const REPO = '/app/repo';
const CYCLE = 'botnet/run-cycle.mjs';
const SLEEP_MS = parseInt(process.env.LOOP_SLEEP_MS || '300000', 10); // 5 min default
const CYCLE_TIMEOUT_MS = parseInt(process.env.CYCLE_TIMEOUT_MS || '900000', 10); // 15 min
const PORT = parseInt(process.env.PORT || '7860', 10);
const BRANCH = process.env.REPO_BRANCH || 'main';

const state = {
  startedAt: new Date().toISOString(),
  lastCycleAt: null,
  lastCycleStatus: null,
  lastCycleMs: null,
  stuck: false,
  cycles: 0,
};

createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(state, null, 2));
    return;
  }
  res.writeHead(404).end();
}).listen(PORT, () => console.log(`[loop] health on :${PORT}`));

function git(args) {
  const r = spawnSync('git', args, { cwd: REPO, encoding: 'utf8' });
  if (r.status !== 0) console.error(`[loop] git ${args.join(' ')} failed: ${r.stderr?.trim()}`);
  return r.status === 0;
}

function syncToRemote() {
  // Hard-reset to origin/<branch>. The GH Actions cron may have committed
  // since our last cycle; if we tried to push from our stale base we'd hit
  // non-fast-forward forever. Snapshot/article state lives in the repo, so
  // remote is canonical — local diff between cycles is throwaway.
  if (state.stuck) {
    // Previous cycle was SIGKILLed mid-git op. Clean stale locks before fetch,
    // otherwise fetch/reset will fail until manual intervention.
    spawnSync('sh', ['-c', 'rm -f .git/index.lock .git/refs/**/*.lock .git/HEAD.lock'], { cwd: REPO });
  }
  if (!git(['fetch', '--depth', '1', 'origin', BRANCH])) return false;
  if (!git(['reset', '--hard', `origin/${BRANCH}`])) return false;
  git(['clean', '-fd']);
  return true;
}

function runCycle() {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn('node', [CYCLE, '--push'], { cwd: REPO, stdio: 'inherit' });
    let killed = false;
    let settled = false;
    const finish = (status) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      state.cycles += 1;
      state.lastCycleAt = new Date().toISOString();
      state.lastCycleMs = Date.now() - t0;
      state.stuck = killed;
      state.lastCycleStatus = status;
      console.log(`[loop] cycle ${state.cycles} done in ${Math.round(state.lastCycleMs / 1000)}s (${status})`);
      resolve();
    };
    const watchdog = setTimeout(() => {
      killed = true;
      console.error(`[loop] cycle ${state.cycles + 1} exceeded ${CYCLE_TIMEOUT_MS}ms — killing`);
      try { child.kill('SIGKILL'); } catch {}
    }, CYCLE_TIMEOUT_MS);
    child.on('exit', (code) => {
      finish(killed ? 'killed (timeout)' : code === 0 ? 'ok' : `exit ${code}`);
    });
    child.on('error', (err) => {
      finish(`spawn error: ${err.message}`);
    });
  });
}

(async function main() {
  while (true) {
    try {
      if (!syncToRemote()) {
        state.lastCycleStatus = 'sync failed';
      } else {
        await runCycle();
      }
    } catch (err) {
      console.error('[loop] cycle threw', err);
      state.lastCycleStatus = `threw: ${err.message}`;
    }
    await new Promise((r) => setTimeout(r, SLEEP_MS));
  }
})();
