#!/usr/bin/env node
// Indexer. End-of-cycle: rebuild date index, mentions index. Pure code.
// Run: node botnet/workers/indexer.mjs

import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');

const WORKER = 'indexer';
const ROLE = 'indexer';
logActivity({ worker: WORKER, role: ROLE, event: 'start' });

const tools = ['build-date-index.mjs', 'build-mentions-index.mjs'];
for (const t of tools) {
  try {
    execSync(`node tools/${t}`, { cwd: REPO_ROOT, stdio: 'pipe' });
    console.log(`[indexer] ran ${t}`);
  } catch (err) {
    console.error(`[indexer] ${t} failed:`, err.stderr?.toString() || err.message);
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish' });
