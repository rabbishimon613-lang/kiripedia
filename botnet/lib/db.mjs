// SQLite truth store for the botnet.
// Workers `import { db } from './db.mjs'` and write directly.
// Only the Coordinator commits rendered files to git.

import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BOTNET_DIR = join(HERE, '..');
const DB_PATH = process.env.BOTNET_DB || join(BOTNET_DIR, 'data', 'botnet.db');
const SCHEMA = join(HERE, 'schema.sql');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(readFileSync(SCHEMA, 'utf8'));

// --- Activity log: drives the pixel office ---------------------------------
export function logActivity({ worker, role, event, detail, refKind, refId, handoffTo }) {
  db.prepare(`
    INSERT INTO activity (worker, role, event, detail, ref_kind, ref_id, handoff_to)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(worker, role, event, detail ?? null, refKind ?? null, refId ?? null, handoffTo ?? null);
}

// --- Worker claim (atomic): grab the next free clip in a status ------------
// Returns a clip row or null. Sets worker=<id>, worker_since=now.
export function claimNextClip({ status, worker }) {
  const tx = db.transaction(() => {
    const row = db.prepare(`
      SELECT * FROM clips
      WHERE status = ? AND worker IS NULL
      ORDER BY discovered_at ASC
      LIMIT 1
    `).get(status);
    if (!row) return null;
    db.prepare(`UPDATE clips SET worker = ?, worker_since = datetime('now') WHERE video_id = ?`)
      .run(worker, row.video_id);
    return row;
  });
  return tx();
}

export function releaseClip(videoId, { newStatus } = {}) {
  if (newStatus) {
    db.prepare(`UPDATE clips SET worker = NULL, worker_since = NULL, status = ? WHERE video_id = ?`)
      .run(newStatus, videoId);
  } else {
    db.prepare(`UPDATE clips SET worker = NULL, worker_since = NULL WHERE video_id = ?`)
      .run(videoId);
  }
}

export function quarantine({ kind, videoId, claimId, reasonCode, reasonDetail, payload }) {
  db.prepare(`
    INSERT INTO quarantine (kind, video_id, claim_id, reason_code, reason_detail, payload)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(kind, videoId ?? null, claimId ?? null, reasonCode, reasonDetail ?? null,
         payload ? JSON.stringify(payload) : null);
}

// --- Discover seed: register a new lead, no-op on duplicate ----------------
export function registerLead({ videoId, url, channel, title, uploadDate, durationSec }) {
  const result = db.prepare(`
    INSERT OR IGNORE INTO clips (video_id, url, channel, title, upload_date, duration_sec)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(videoId, url, channel ?? null, title ?? null, uploadDate ?? null, durationSec ?? null);
  return result.changes > 0;
}

export default db;
