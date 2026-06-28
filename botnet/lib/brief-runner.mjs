// Brief runner — the shim every worker uses to receive briefs and emit
// checkpoints. Lifts the contract away from individual workers so the
// "convert a worker to brief-receive" change stays small.
//
// Usage in a worker:
//   import { runBrief, drainBriefs } from '../lib/brief-runner.mjs';
//   await drainBriefs({ role: 'cataloger', workerId: WORKER, handler });
//
// `handler({ brief, scope })` does the work and returns { result, filesChanged }.
// Throws → checkpoint(BLOCKED) + brief quarantined.

import * as briefs from './briefs.mjs';
import * as checkpoints from './checkpoints.mjs';

export async function runBrief(brief, handler) {
  const scope = safeJson(brief.scope_json);
  try {
    const out = (await handler({ brief, scope })) || {};
    checkpoints.write(brief.brief_id, {
      state: 'DONE',
      filesChanged: out.filesChanged || [],
      commandsRun: out.commandsRun || [],
      result: out.result || null,
      nextAction: out.nextAction || null,
    });
    return { ok: true, result: out.result };
  } catch (err) {
    checkpoints.write(brief.brief_id, {
      state: 'BLOCKED',
      blocker: (err && err.message) || String(err),
      result: { stack: (err && err.stack) || null },
    });
    return { ok: false, error: err };
  }
}

// Claim and run every pending brief for this role, up to `max`.
export async function drainBriefs({ role, workerId, handler, max = 20 }) {
  let done = 0, failed = 0;
  for (let i = 0; i < max; i++) {
    const brief = briefs.claimNext(role, workerId);
    if (!brief) break;
    const r = await runBrief(brief, handler);
    if (r.ok) done++; else failed++;
  }
  return { done, failed };
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
