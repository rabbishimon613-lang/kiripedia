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
run('Cataloger-Editor (1/2)', `node ${W('cataloger-editor')} --worker cataloger-1 --batch 1`);
run('Cataloger-Editor (2/2)', `node ${W('cataloger-editor')} --worker cataloger-2 --batch 1`);
run('Reviewer', `node ${W('reviewer')}`);
run('Coordinator', `node ${W('coordinator')}${PUSH ? ' --push' : ''}`);
run('Indexer', `node ${W('indexer')}`);

// Backlog mode: when discovery is enabled and finds nothing new, the team
// pivots to mining the existing corpus harder. Otherwise default backlog pace.
const backlogMode = !SKIP_DISCOVERY && discoveryOk && leadsFound === 0;
const backlogBatch = backlogMode ? 5 : 3;
if (backlogMode) console.log(`\n[run-cycle] no new leads — backlog mode (batch=${backlogBatch})`);
run('Deepener', `node ${W('deepener')} --batch ${backlogBatch}`);
run('Enricher', `node ${W('enricher')} --batch ${backlogBatch}`);
run('Weaver', `node ${W('weaver')} --batch ${backlogBatch}`);
run('Snapshot writer', `node ${LIB('snapshot-writer')}`);

console.log('\n=== cycle complete ===');
