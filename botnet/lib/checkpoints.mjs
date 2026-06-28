// Workers report checkpoints, not free-form status.
// State ∈ DONE | BLOCKED | NEEDS_INPUT | HANDOFF | NEEDS_REVIEW.

import { db } from './db.mjs';
import * as briefs from './briefs.mjs';

const J = v => (v == null ? null : JSON.stringify(v));
const VALID = new Set(['DONE', 'BLOCKED', 'NEEDS_INPUT', 'HANDOFF', 'NEEDS_REVIEW']);

export function write(brief_id, payload) {
  const { state, filesChanged, commandsRun, result, blocker, nextAction } = payload;
  if (!VALID.has(state)) throw new Error(`bad checkpoint state: ${state}`);
  const info = db.prepare(`
    INSERT INTO checkpoints
      (brief_id, state, files_changed_json, commands_run_json, result_json, blocker, next_action)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(brief_id, state, J(filesChanged), J(commandsRun), J(result), blocker ?? null, nextAction ?? null);

  if (state === 'DONE') briefs.complete(brief_id);
  if (state === 'BLOCKED') briefs.quarantine(brief_id, blocker || 'blocked');

  return info.lastInsertRowid;
}

export function latestFor(brief_id) {
  return db.prepare(`
    SELECT * FROM checkpoints
     WHERE brief_id = ?
     ORDER BY checkpoint_id DESC
     LIMIT 1
  `).get(brief_id) || null;
}

export function countByState() {
  return db.prepare(`SELECT state, COUNT(*) AS n FROM checkpoints GROUP BY state`).all();
}
