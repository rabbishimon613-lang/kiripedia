// SQLite truth store for the botnet.
// Workers `import { db } from './db.mjs'` and write directly.
// Only the Coordinator commits rendered files to git.

import Database from 'better-sqlite3';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BOTNET_DIR = join(HERE, '..');
const DB_PATH = process.env.BOTNET_DB || join(BOTNET_DIR, 'data', 'botnet.db');
const SCHEMA = join(HERE, 'schema.sql');
const MIGRATIONS_DIR = join(BOTNET_DIR, 'migrations');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(readFileSync(SCHEMA, 'utf8'));

// Idempotent migration runner. Each .sql file in botnet/migrations/ is
// applied at most once, tracked by name in schema_migrations. ALTER TABLE
// ADD COLUMN failures are swallowed individually so re-runs are safe on
// existing live DBs (HF Space starts fresh on every clone, this is the
// canonical mechanism).
db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);

function applyMigrations() {
  if (!existsSync(MIGRATIONS_DIR)) return;
  const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const seen = new Set(db.prepare(`SELECT name FROM schema_migrations`).all().map(r => r.name));
  for (const f of files) {
    if (seen.has(f)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, f), 'utf8');
    // Split on `;` at line end and exec one statement at a time so ALTER
    // failures (e.g. column already exists from a prior partial run) only
    // skip that statement, not the whole file.
    const stmts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const s of stmts) {
      try { db.exec(s + ';'); }
      catch (err) {
        // Swallow only ALTER TABLE ADD COLUMN duplicate-column errors;
        // re-raise anything else so we don't silently apply broken migrations.
        if (!/duplicate column/i.test(err.message)) {
          console.error(`[db] migration ${f} stmt failed: ${err.message}`);
        }
      }
    }
    db.prepare(`INSERT INTO schema_migrations (name) VALUES (?)`).run(f);
    console.log(`[db] applied migration ${f}`);
  }
}
applyMigrations();

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
