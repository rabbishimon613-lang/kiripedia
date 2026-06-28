#!/usr/bin/env node
// Discretion Warden — doctrine rule #2: mirror Kiriakou's discretion.
//
// Reads claims at status='passed' (Reviewer-grounded) that haven't been
// adjudicated yet (discretion_status IS NULL). For each claim about a third
// party, it builds a tiny corpus profile (how Kiriakou refers to that entity
// across the corpus), and the LLM decides APPROVE | REDACT | QUARANTINE.
//
// Prompt lives in prompts/discretion-warden.md.
// Run: node botnet/workers/discretion-warden.mjs [--batch N]

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity, quarantine as logQuarantine } from '../lib/db.mjs';
import { worker_reasoning } from '../lib/fleet-client.mjs';
import { arg, intArg } from '../lib/argv.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');
const PROMPT_PATH = join(REPO_ROOT, 'prompts', 'discretion-warden.md');

const WORKER = arg('--worker', 'discretion-warden-1');
const ROLE = 'discretion-warden';
const BATCH = intArg('--batch', 20);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['discretion_status', 'notes'],
  properties: {
    discretion_status: { type: 'string', enum: ['approved', 'redacted', 'quarantined'] },
    claim_text_revised: { type: ['string', 'null'] },
    notes: { type: 'string', minLength: 5, maxLength: 300 },
  },
};

const SYSTEM = (() => { try { return readFileSync(PROMPT_PATH, 'utf8'); } catch { return ''; } })();

function shellQuote(s) { return `'${s.replace(/'/g, "'\\''")}'`; }

// Cheap corpus profile: count how many transcripts contain the surface form.
function corpusProfileFor(surfaceForm) {
  if (!surfaceForm || surfaceForm.length < 3) return { mentions: 0 };
  let n = 0;
  try {
    const out = execSync(
      `grep -ril ${shellQuote(surfaceForm)} ${shellQuote(SOURCES_DIR)} || true`,
      { encoding: 'utf8' }
    );
    n = out.trim().split('\n').filter(Boolean).length;
  } catch { /* non-fatal */ }
  return { mentions: n };
}

function entitiesFromClaim(claim) {
  try { return JSON.parse(claim.named_entities || '[]'); } catch { return []; }
}

function passageFor(claim) {
  // The verbatim `quote` IS the raw passage (Cataloger extracts verbatim).
  return claim.quote || '';
}

async function adjudicate(claim) {
  const entities = entitiesFromClaim(claim);
  const profiles = entities.slice(0, 6).map(e => ({ entity: e, ...corpusProfileFor(e) }));
  const passage = passageFor(claim);

  const user = `CLAIM:\n${claim.claim_text}\n\nRAW PASSAGE:\n${passage}\n\nENTITY CORPUS PROFILES:\n${JSON.stringify(profiles, null, 2)}\n\nSource: ${claim.video_id} at ${claim.segment_start}.`;

  const out = await worker_reasoning({ system: SYSTEM, user, schema: SCHEMA, maxTokens: 800 });
  return out;
}

const pending = db.prepare(`
  SELECT * FROM claims
   WHERE status='passed' AND discretion_status IS NULL
   ORDER BY id ASC
   LIMIT ?
`).all(BATCH);

if (pending.length === 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'idle', detail: 'No claims awaiting discretion review.' });
  console.log('[discretion-warden] no pending claims.');
  process.exit(0);
}

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: `Mirroring discretion across ${pending.length} grounded claims.` });

const updateClaim = db.prepare(`
  UPDATE claims SET discretion_status=?, claim_text=?
   WHERE id=?
`);

let approved = 0, redacted = 0, quarantined = 0;
for (const c of pending) {
  try {
    const decision = await adjudicate(c);
    const newText = decision.discretion_status === 'redacted' && decision.claim_text_revised
      ? decision.claim_text_revised : c.claim_text;
    updateClaim.run(decision.discretion_status, newText, c.id);
    if (decision.discretion_status === 'approved') approved++;
    else if (decision.discretion_status === 'redacted') redacted++;
    else {
      quarantined++;
      logQuarantine({ kind: 'claim', videoId: c.video_id, claimId: c.id,
                      reasonCode: 'discretion_quarantine', reasonDetail: decision.notes.slice(0, 300) });
    }
  } catch (err) {
    console.error(`[${WORKER}] claim ${c.id}: ${err.message.slice(0, 200)}`);
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Discretion pass: ${approved} approved, ${redacted} redacted, ${quarantined} quarantined.`,
              handoffTo: 'first-third-splitter' });
console.log(`[${WORKER}] approved=${approved} redacted=${redacted} quarantined=${quarantined}`);
