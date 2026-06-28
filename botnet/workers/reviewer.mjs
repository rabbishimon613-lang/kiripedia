#!/usr/bin/env node
// Reviewer. Runs the grounding stack on each pending claim.
// Confidence ≥90 → passed (auto-merge eligible)
// Confidence 70-89 → passed_low (merge with {{disputed}} banner)
// Confidence <70 OR any fatal failure → quarantined
//
// Run: node botnet/workers/reviewer.mjs [--worker reviewer-1] [--batch N]

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity, quarantine } from '../lib/db.mjs';
import { runGrounding } from '../lib/grounding/layers.mjs';
import { drainBriefs } from '../lib/brief-runner.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');

const args = process.argv.slice(2);
const WORKER = args[args.indexOf('--worker') + 1] || 'reviewer-1';
const ROLE = 'reviewer';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 50;

// Cache source text per clip so we don't re-read for every claim.
const sourceCache = new Map();
function getSourceText(clip) {
  if (sourceCache.has(clip.video_id)) return sourceCache.get(clip.video_id);
  const text = readFileSync(join(REPO_ROOT, clip.source_path), 'utf8');
  sourceCache.set(clip.video_id, text);
  return text;
}

// PHASE 2: helper that grounds a fixed set of pending claims.
const updatePass = db.prepare(`
  UPDATE claims SET status=?, confidence=?, review_notes=?, reviewed_at=datetime('now')
  WHERE id=?
`);

function groundBatch(rows, counters) {
  for (const claim of rows) {
    const clip = { video_id: claim.video_id, channel: claim.channel,
                   slug: claim.clip_slug, source_path: claim.source_path };
    const sourceText = getSourceText(clip);
    const { confidence, fatalFail, results, reasons } = runGrounding({ claim, clip, sourceText });
    const notes = JSON.stringify({ confidence, fatalFail, layer_results: results, reasons });
    if (fatalFail || confidence < 70) {
      quarantine({
        kind: 'claim', videoId: claim.video_id, claimId: claim.id,
        reasonCode: fatalFail || 'low_confidence',
        reasonDetail: reasons.join('; ').slice(0, 500),
        payload: { quote: claim.quote, claim_text: claim.claim_text,
                   article_slug: claim.article_slug, confidence },
      });
      updatePass.run('quarantined', confidence, notes, claim.id);
      counters.quarantined++;
    } else if (confidence >= 90) {
      updatePass.run('passed', confidence, notes, claim.id);
      counters.passed++;
    } else {
      updatePass.run('passed_low', confidence, notes, claim.id);
      counters.low++;
    }
  }
}

// PHASE 2: drain reviewer briefs first. scope: { video_id } narrows to that clip's claims.
let passed = 0, low = 0, quarantined = 0;
const briefDrain = await drainBriefs({
  role: 'reviewer',
  workerId: WORKER,
  max: 10,
  handler: async ({ scope }) => {
    const counters = { passed: 0, low: 0, quarantined: 0 };
    let rows;
    if (scope.video_id) {
      rows = db.prepare(`
        SELECT c.*, cl.channel, cl.slug AS clip_slug, cl.source_path
          FROM claims c JOIN clips cl ON cl.video_id = c.video_id
         WHERE c.status='pending_review' AND c.video_id=?
         ORDER BY c.extracted_at ASC LIMIT ?
      `).all(scope.video_id, BATCH);
    } else if (Array.isArray(scope.claim_ids)) {
      const placeholders = scope.claim_ids.map(() => '?').join(',');
      rows = db.prepare(`
        SELECT c.*, cl.channel, cl.slug AS clip_slug, cl.source_path
          FROM claims c JOIN clips cl ON cl.video_id = c.video_id
         WHERE c.status='pending_review' AND c.id IN (${placeholders})
      `).all(...scope.claim_ids);
    } else {
      throw new Error('reviewer brief needs scope.video_id or scope.claim_ids');
    }
    groundBatch(rows, counters);
    passed += counters.passed; low += counters.low; quarantined += counters.quarantined;
    return { result: counters };
  },
});

const pending = db.prepare(`
  SELECT c.*, cl.channel, cl.slug AS clip_slug, cl.source_path
  FROM claims c
  JOIN clips cl ON cl.video_id = c.video_id
  WHERE c.status = 'pending_review'
  ORDER BY c.extracted_at ASC
  LIMIT ?
`).all(BATCH);

if (pending.length === 0 && briefDrain.done + briefDrain.failed === 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'idle', detail: 'Checked the claim queue — empty, all caught up.' });
  console.log('[reviewer] no pending claims.');
  process.exit(0);
}

if (pending.length > 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Working through ${pending.length} pending claims.` });
  const counters = { passed: 0, low: 0, quarantined: 0 };
  groundBatch(pending, counters);
  passed += counters.passed; low += counters.low; quarantined += counters.quarantined;
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Passed ${passed} claims, weak-passed ${low}, quarantined ${quarantined}.`,
              handoffTo: 'coordinator' });
console.log(`[${WORKER}] pass=${passed} low=${low} quarantined=${quarantined}`);
