-- 001 — Passage-level state migration (TEAM-REWORK §"Schema additions").
--
-- Safety rules (per project doctrine: never delete originals):
--   1. DO NOT run against the live botnet.db. Always copy first:
--        cp botnet/data/botnet.db botnet/data/botnet-pre-001.db
--      then run this script against botnet/data/botnet.db.
--   2. Every table is additive. No DROP, no ALTER on existing tables.
--   3. The existing `claims` table keeps `video_id`. The new
--      `claims.source_passage_id` column is OPTIONAL — old rows have NULL.
--   4. If the migration aborts, the pre-image is the recovery path.
--
-- Reversibility:
--   Down migration is "swap the .db file back to botnet-pre-001.db".
--   There is no DROP TABLE in this file by design.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- recordings — content-fingerprint-keyed identity for "the same thing".
-- One Rogan clip uploaded to 15 channels is ONE recording.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recordings (
  recording_id     TEXT PRIMARY KEY,            -- chromaprint hash or transcript MinHash
  canonical_url    TEXT,                        -- best URL we know of (highest-quality upload)
  duration_sec     INTEGER,
  fingerprint_kind TEXT NOT NULL DEFAULT 'minhash',  -- 'chromaprint' | 'minhash' | 'manual'
  fingerprint      TEXT,                        -- the actual hash, debug aid
  first_seen_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- N:M from URLs to recordings. The 15 Rogan dupes all point here.
CREATE TABLE IF NOT EXISTS source_urls (
  url           TEXT PRIMARY KEY,
  video_id      TEXT,                           -- YouTube id when applicable
  recording_id  TEXT NOT NULL REFERENCES recordings(recording_id),
  channel       TEXT,
  added_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_source_urls_recording ON source_urls(recording_id);

-- ---------------------------------------------------------------------------
-- transcript_passages — the real unit of work going forward.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transcript_passages (
  id                           INTEGER PRIMARY KEY AUTOINCREMENT,
  recording_id                 TEXT NOT NULL REFERENCES recordings(recording_id),
  start_ts                     TEXT NOT NULL,    -- hh:mm:ss
  end_ts                       TEXT NOT NULL,
  text                         TEXT NOT NULL,
  last_eval_prompt_version     TEXT,
  last_eval_decision           TEXT,             -- 'claim' | 'banter' | 'duplicate' | 'unclear' | NULL
  last_eval_at                 TEXT,
  article_set_hash_at_eval     TEXT,
  UNIQUE(recording_id, start_ts, end_ts)
);
CREATE INDEX IF NOT EXISTS idx_passages_recording ON transcript_passages(recording_id);
CREATE INDEX IF NOT EXISTS idx_passages_stale
  ON transcript_passages(last_eval_prompt_version, last_eval_at);

-- ---------------------------------------------------------------------------
-- prompt_versions — every worker stamps every decision with its prompt hash.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prompt_versions (
  hash          TEXT PRIMARY KEY,
  role          TEXT NOT NULL,
  doctrine_notes TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- passage_verdicts — memory; expires when article_set_hash rotates.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS passage_verdicts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  passage_id      INTEGER NOT NULL REFERENCES transcript_passages(id),
  worker          TEXT NOT NULL,
  verdict         TEXT NOT NULL,
  reason          TEXT,
  prompt_version  TEXT REFERENCES prompt_versions(hash),
  article_set_hash TEXT NOT NULL,
  decided_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_verdicts_passage
  ON passage_verdicts(passage_id, article_set_hash);

-- ---------------------------------------------------------------------------
-- claims gains an OPTIONAL link to the source passage. Old rows: NULL.
-- New rows: fill it in. Reviewer can backfill in a separate pass.
-- ---------------------------------------------------------------------------
ALTER TABLE claims ADD COLUMN source_passage_id INTEGER
  REFERENCES transcript_passages(id);
ALTER TABLE claims ADD COLUMN prompt_version TEXT
  REFERENCES prompt_versions(hash);

CREATE INDEX IF NOT EXISTS idx_claims_passage ON claims(source_passage_id);

-- ---------------------------------------------------------------------------
-- discovery_seeds — Maya's channel-anchored crawler config.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discovery_seeds (
  channel_id     TEXT PRIMARY KEY,
  channel_name   TEXT,
  tier           INTEGER NOT NULL DEFAULT 2,   -- 1 = Kiriakou himself, 2 = known host, 3 = derived
  last_swept_at  TEXT,
  cadence_hours  INTEGER NOT NULL DEFAULT 24,
  added_at       TEXT NOT NULL DEFAULT (datetime('now')),
  notes          TEXT
);

-- ---------------------------------------------------------------------------
-- video_curriculum — the Re-Reader's queue (cluster 8).
-- Computed off-line by a scheduler script; the Re-Reader just consumes.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_curriculum (
  recording_id   TEXT PRIMARY KEY REFERENCES recordings(recording_id),
  staleness_score REAL DEFAULT 0,
  density_score   REAL DEFAULT 0,
  visit_count     INTEGER DEFAULT 0,
  last_spawn_rate REAL DEFAULT 0,
  next_due_score  REAL DEFAULT 0,
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- article_grades — Promotion Committee's append-only ledger.
-- Editor ≠ promoter is enforced by application, not schema.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_grades (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug TEXT NOT NULL,
  grade        TEXT NOT NULL,   -- stub | start | c | b | ga | fa
  promoter     TEXT NOT NULL,   -- role key
  editor       TEXT,            -- last role to edit body before promotion
  at           TEXT NOT NULL DEFAULT (datetime('now')),
  notes        TEXT
);
CREATE INDEX IF NOT EXISTS idx_grades_slug ON article_grades(article_slug, at);
