// SwarmBrief layer: issue → claim → complete | quarantine.
// Briefs are the only thing workers receive. No polling, no idle-spin.

import { randomUUID } from 'node:crypto';
import { db } from './db.mjs';

const J = v => (v == null ? null : JSON.stringify(v));

export function issue({ worker, goal, whyNow, scope, deliverables, constraints }) {
  const brief_id = randomUUID();
  db.prepare(`
    INSERT INTO briefs
      (brief_id, worker, goal, why_now, scope_json, deliverables_json, constraints_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(brief_id, worker, goal, whyNow ?? null, J(scope) ?? '{}', J(deliverables) ?? '{}', J(constraints));
  return brief_id;
}

// Atomic claim. UPDATE...RETURNING in one statement so two workers can't grab
// the same brief. Returns the brief row or null.
export function claimNext(workerRole, workerId) {
  const row = db.prepare(`
    UPDATE briefs
       SET status = 'claimed', claimed_by = ?, claimed_at = datetime('now')
     WHERE brief_id = (
       SELECT brief_id FROM briefs
        WHERE status = 'pending' AND worker = ?
        ORDER BY created_at ASC
        LIMIT 1
     )
     RETURNING *
  `).get(workerId, workerRole);
  return row || null;
}

export function complete(brief_id) {
  db.prepare(`
    UPDATE briefs SET status = 'done', completed_at = datetime('now')
     WHERE brief_id = ?
  `).run(brief_id);
}

export function quarantine(brief_id, reason) {
  db.prepare(`
    UPDATE briefs SET status = 'quarantined', completed_at = datetime('now')
     WHERE brief_id = ?
  `).run(brief_id);
  db.prepare(`
    INSERT INTO quarantine (kind, video_id, claim_id, reason_code, reason_detail, payload)
    VALUES ('brief', NULL, NULL, 'brief_quarantined', ?, ?)
  `).run(reason || null, JSON.stringify({ brief_id, reason }));
}

export function get(brief_id) {
  return db.prepare(`SELECT * FROM briefs WHERE brief_id = ?`).get(brief_id) || null;
}

export function countByStatus() {
  return db.prepare(`SELECT status, COUNT(*) AS n FROM briefs GROUP BY status`).all();
}
