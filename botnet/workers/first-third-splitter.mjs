#!/usr/bin/env node
// First/Third Splitter — perspective tag per claim.
// Reads claims at status='passed' AND discretion_status IN ('approved','redacted')
// that have no perspective tag yet. Tags as JK-witnessed | JK-relayed |
// JK-analysis | JK-quoting-another. The Coordinator uses the tag to format
// attribution downstream.
//
// Prompt lives in prompts/first-third-splitter.md.
// Run: node botnet/workers/first-third-splitter.mjs [--batch N]

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import { worker_reasoning } from '../lib/fleet-client.mjs';
import { arg, intArg } from '../lib/argv.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const PROMPT_PATH = join(REPO_ROOT, 'prompts', 'first-third-splitter.md');

const WORKER = arg('--worker', 'first-third-splitter-1');
const ROLE = 'first-third-splitter';
const BATCH = intArg('--batch', 30);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['perspective', 'evidence'],
  properties: {
    perspective: { type: 'string', enum: ['JK-witnessed', 'JK-relayed', 'JK-analysis', 'JK-quoting-another'] },
    evidence: { type: 'string', minLength: 3, maxLength: 240 },
    third_party_subject: { type: ['string', 'null'] },
  },
};

const SYSTEM = (() => { try { return readFileSync(PROMPT_PATH, 'utf8'); } catch { return ''; } })();

async function tag(claim) {
  const user = `CLAIM:\n${claim.claim_text}\n\nRAW PASSAGE (Kiriakou's words verbatim):\n${claim.quote}\n\nSource: ${claim.video_id} at ${claim.segment_start}.`;
  return worker_reasoning({ system: SYSTEM, user, schema: SCHEMA, maxTokens: 500 });
}

const pending = db.prepare(`
  SELECT * FROM claims
   WHERE status='passed'
     AND discretion_status IN ('approved','redacted')
     AND perspective IS NULL
   ORDER BY id ASC
   LIMIT ?
`).all(BATCH);

if (pending.length === 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'idle', detail: 'No claims awaiting perspective split.' });
  console.log('[first-third-splitter] no pending claims.');
  process.exit(0);
}

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: `Splitting witnessed vs relayed on ${pending.length} claims.` });

const update = db.prepare(`UPDATE claims SET perspective=? WHERE id=?`);

const tallies = { 'JK-witnessed': 0, 'JK-relayed': 0, 'JK-analysis': 0, 'JK-quoting-another': 0 };
for (const c of pending) {
  try {
    const out = await tag(c);
    update.run(out.perspective, c.id);
    tallies[out.perspective] = (tallies[out.perspective] || 0) + 1;
  } catch (err) {
    console.error(`[${WORKER}] claim ${c.id}: ${err.message.slice(0, 200)}`);
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Split done — witnessed:${tallies['JK-witnessed']} relayed:${tallies['JK-relayed']} analysis:${tallies['JK-analysis']} quoting:${tallies['JK-quoting-another']}.`,
              handoffTo: 'coordinator' });
console.log(`[${WORKER}] ${JSON.stringify(tallies)}`);
