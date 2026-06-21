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
const SKIP_DISCOVERY = args.includes('--skip-discovery');
const PUSH = args.includes('--push');

function run(label, cmd) {
  console.log(`\n=== ${label} ===`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`[run-cycle] ${label} exited ${err.status}; continuing`);
  }
}

if (!SKIP_DISCOVERY) {
  run('Recent Changes', `node ${W('recent-changes')}`);
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
run('Snapshot writer', `node ${LIB('snapshot-writer')}`);

console.log('\n=== cycle complete ===');
