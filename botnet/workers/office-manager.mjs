#!/usr/bin/env node
// office-manager worker: re-probes provider/key health on a cadence.
//
// Run by run-forever.mjs every ~10 minutes. Refreshes botnet/data/office-state.json
// so the next worker calls have an up-to-date health map.
//
// Exits 0 even when some providers fail — a dead Cerebras is information,
// not an error condition.

import { probeAll } from '../lib/office-manager.mjs';
import { logActivity } from '../lib/db.mjs';

const WORKER = 'office-manager-1';
const ROLE = 'manager';

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: 'Probing LLM providers, refreshing routing table.' });

try {
  const summary = await probeAll();
  const oks = summary.providers.filter(p => p.status === 'ok').map(p => p.id);
  const fails = summary.providers.filter(p => p.status !== 'ok')
    .map(p => `${p.id}(${p.status}${p.code ? ':' + p.code : ''})`);
  const deadKeyCount = Object.keys(summary.dead_keys || {}).length;
  const unsupCount = Object.keys(summary.unsupported_models || {}).length;

  const detail = `Working: ${oks.join(', ') || 'none'}. ` +
                 `Down: ${fails.join(', ') || 'none'}. ` +
                 `Dead keys: ${deadKeyCount}. Unsupported models: ${unsupCount}.`;
  logActivity({ worker: WORKER, role: ROLE, event: 'finish', detail });
  console.log(JSON.stringify(summary, null, 2));
} catch (err) {
  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Probe crashed: ${err.message.slice(0, 200)}` });
  console.error('[office-manager] probe failed:', err.message);
}
process.exit(0);
