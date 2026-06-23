#!/usr/bin/env node
// HF Space loop wrapper. Runs run-cycle.mjs continuously, exposes a tiny
// /health endpoint so cron-job.org pings can prevent 48h idle pause.

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const REPO = '/app/repo';
const CYCLE = 'botnet/run-cycle.mjs';
const SLEEP_MS = parseInt(process.env.LOOP_SLEEP_MS || '30000', 10);
const PORT = parseInt(process.env.PORT || '7860', 10);

const state = {
  startedAt: new Date().toISOString(),
  lastCycleAt: null,
  lastCycleStatus: null,
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

function runCycle() {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn('node', [CYCLE, '--push'], { cwd: REPO, stdio: 'inherit' });
    child.on('exit', (code) => {
      state.cycles += 1;
      state.lastCycleAt = new Date().toISOString();
      state.lastCycleStatus = code === 0 ? 'ok' : `exit ${code}`;
      console.log(`[loop] cycle ${state.cycles} done in ${Math.round((Date.now() - t0) / 1000)}s (${state.lastCycleStatus})`);
      resolve();
    });
  });
}

(async function main() {
  while (true) {
    try {
      await runCycle();
    } catch (err) {
      console.error('[loop] cycle threw', err);
      state.lastCycleStatus = `threw: ${err.message}`;
    }
    await new Promise((r) => setTimeout(r, SLEEP_MS));
  }
})();
