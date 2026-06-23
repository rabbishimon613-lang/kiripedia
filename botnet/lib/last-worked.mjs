// last-worked: cooldown state shared across worker invocations.
// Stored as JSON in the repo so it survives HF Space clone-resets.
// Shape: { "<slug>": { "<role>": <unixSeconds>, ... }, ... }

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const STATE_PATH = join(REPO_ROOT, 'botnet', 'state', 'last-worked.json');

let cache = null;

function load() {
  if (cache) return cache;
  try { cache = JSON.parse(readFileSync(STATE_PATH, 'utf8')); }
  catch { cache = {}; }
  return cache;
}

export function lastWorked(slug, role) {
  const s = load()[slug];
  return s && s[role] ? s[role] : 0;
}

export function markWorked(slug, role, when = Math.floor(Date.now() / 1000)) {
  const state = load();
  if (!state[slug]) state[slug] = {};
  state[slug][role] = when;
  try {
    mkdirSync(dirname(STATE_PATH), { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 0));
  } catch { /* non-fatal */ }
}
