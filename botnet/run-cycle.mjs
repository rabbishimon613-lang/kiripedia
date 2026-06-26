#!/usr/bin/env node
// Orchestrator: runs one full pipeline cycle, sequentially.
// In production this becomes the body of cron-cycle.yml on GH Actions.
//
// Order:
//   1. recent-changes (find new leads)
//   2. npp (triage)
//   3. scribe ×N (transcribe; parallel-able in real runs, sequential here)
//   4. cataloger ×N (extract claims)
//   5. reviewer (ground)
//   6. coordinator (commit)
//   7. indexer (rebuild indexes)
//   8. snapshot writer
//
// Run: node botnet/run-cycle.mjs [--skip-discovery] [--push]

import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const W = (name) => join(HERE, 'workers', `${name}.mjs`);
const LIB = (name) => join(HERE, 'lib', `${name}.mjs`);

const args = process.argv.slice(2);
// Discovery is off by default. The team works the existing 88h corpus
// (~798k transcript words) until we hit our 500k woven-prose goal.
// Re-enable per cycle with `--with-discovery` once acquisition is solved.
const SKIP_DISCOVERY = !args.includes('--with-discovery');
const PUSH = args.includes('--push');

let discoveryOk = false;
let leadsFound = 0;

function run(label, cmd, { capture = false } = {}) {
  console.log(`\n=== ${label} ===`);
  try {
    if (capture) {
      const out = execSync(cmd, { encoding: 'utf8' });
      process.stdout.write(out);
      return { ok: true, out };
    }
    execSync(cmd, { stdio: 'inherit' });
    return { ok: true, out: '' };
  } catch (err) {
    console.error(`[run-cycle] ${label} exited ${err.status}; continuing`);
    return { ok: false, out: '' };
  }
}

// Orders of the Day — re-compute daily targets on first cycle of the day.
// Checks whether the orders file exists and is dated today; if not, regenerates.
{
  const { existsSync, readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const ordersPath = join(HERE, 'state', 'orders-today.json');
  const today = new Date().toISOString().slice(0, 10);
  let needsOrders = true;
  try {
    if (existsSync(ordersPath)) {
      const o = JSON.parse(readFileSync(ordersPath, 'utf8'));
      if (o.date === today) needsOrders = false;
    }
  } catch {}
  if (needsOrders) run('Orders of the Day', `node ${W('orders-of-day')}`);
}

if (!SKIP_DISCOVERY) {
  const rc = run('Recent Changes', `node ${W('recent-changes')}`, { capture: true });
  if (rc.ok) {
    const m = rc.out.match(/(\d+)\s+new\s+leads?/i);
    if (m) {
      discoveryOk = true;
      leadsFound = parseInt(m[1], 10) || 0;
    }
  }
  run('NPP triage', `node ${W('npp')}`);
}
run('Scribe pool (1/3)', `node ${W('scribe')} --worker scribe-1 --batch 1`);
run('Scribe pool (2/3)', `node ${W('scribe')} --worker scribe-2 --batch 1`);
run('Scribe pool (3/3)', `node ${W('scribe')} --worker scribe-3 --batch 1`);
// Second-pass mode unlocks the cataloger when no transcribed clips wait:
// it re-walks already-catalogued clips hunting for missed claims. Bigger
// batch because each call is small.
run('Cataloger-Editor (1/2)', `node ${W('cataloger-editor')} --worker cataloger-1 --batch 5`);
run('Cataloger-Editor (2/2)', `node ${W('cataloger-editor')} --worker cataloger-2 --batch 5`);
run('Reviewer', `node ${W('reviewer')}`);
run('Coordinator', `node ${W('coordinator')}${PUSH ? ' --push' : ''}`);
run('Indexer', `node ${W('indexer')}`);

// Inward-focus mode (current default per project decision 2026-06-22):
// discovery is off, team mines the existing 88h corpus to weave the 279
// articles up to ~1800w each (Wikipedia C-class). Batches cranked higher
// because the picker cooldown (2h deepener/enricher, 4h weaver) prevents
// any single article from being touched more than once per cycle.
const inwardMode = SKIP_DISCOVERY;
const backlogMode = !SKIP_DISCOVERY && discoveryOk && leadsFound === 0;
// June–July push: batch sizes upped sharply. The steady-state crew now owns
// the cycle, and cooldowns were cut from hours to ~30m, so the picker has
// real candidate sets again.
const miningBatch = inwardMode ? 30 : backlogMode ? 15 : 5;
if (inwardMode) console.log(`\n[run-cycle] inward mode (mining batch=${miningBatch})`);
else if (backlogMode) console.log(`\n[run-cycle] no new leads — backlog mode (batch=${miningBatch})`);
run('Prospector', `node ${W('prospector')} --worker prospector-1 --batch 5`);
run('Deepener', `node ${W('deepener')} --worker deepener-1 --batch ${miningBatch}`);
run('Enricher', `node ${W('enricher')} --worker enricher-1 --batch ${miningBatch}`);
run('Weaver', `node ${W('weaver')} --worker weaver-1 --batch ${miningBatch}`);
run('Reweaver', `node ${W('reweaver')} --worker reweaver-1 --batch 10`);
run('Mouth Sentry', `node ${W('mouth-sentry')}`);
run('Snapshot writer', `node ${LIB('snapshot-writer')}`);

console.log('\n=== cycle complete ===');
