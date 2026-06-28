// Shared env loader. Pulls keys from ../llm-fleet/.env if not already in
// process.env. Idempotent — safe to import from any worker.

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const FLEET_ENV_PATH = join(REPO_ROOT, '..', 'llm-fleet', '.env');

let _loaded = false;

export function loadFleetEnv() {
  if (_loaded) return;
  _loaded = true;
  if (!existsSync(FLEET_ENV_PATH)) return;
  try {
    const text = readFileSync(FLEET_ENV_PATH, 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (process.env[k]) continue;
      process.env[k] = vRaw.replace(/^["']|["']$/g, '');
    }
  } catch {}
}

loadFleetEnv();
