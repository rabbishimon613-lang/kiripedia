-- KiriPedia botnet truth store.
-- Parallel workers write here; only the Coordinator commits to git.
-- MDX is rendered from this DB, never edited directly by workers.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Discovered video leads. Source = recent_changes | manual | source_auth.
CREATE TABLE IF NOT EXISTS clips (
  video_id        TEXT PRIMARY KEY,
  url             TEXT NOT NULL,
  channel         TEXT,
  title           TEXT,
  upload_date     TEXT,        -- YYYYMMDD
  duration_sec    INTEGER,
  discovered_at   TEXT NOT NULL DEFAULT (datetime('now')),
  status          TEXT NOT NULL DEFAULT 'lead',
                  -- lead | triaged_on | triaged_off | transcribed
                  -- | catalogued | quarantined | published
  triage_reason   TEXT,
  slug            TEXT,        -- assigned at transcription
  source_path     TEXT,        -- src/content/sources/<slug>.md once written
  worker          TEXT,        -- which bot owns it right now (NULL = free)
  worker_since    TEXT
);
CREATE INDEX IF NOT EXISTS idx_clips_status ON clips(status);
CREATE INDEX IF NOT EXISTS idx_clips_worker ON clips(worker, status);

-- Atomic claims extracted from a clip. One claim = one fact + verbatim quote.
CREATE TABLE IF NOT EXISTS claims (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id        TEXT NOT NULL REFERENCES clips(video_id),
  segment_start   TEXT NOT NULL,    -- hh:mm:ss
  segment_end     TEXT NOT NULL,
  quote           TEXT NOT NULL,    -- verbatim from VTT
  claim_text      TEXT NOT NULL,    -- encyclopedic rephrasing
  article_slug    TEXT NOT NULL,    -- target wiki article
  is_new_article  INTEGER NOT NULL DEFAULT 0,
  is_about_kiriakou_himself INTEGER NOT NULL DEFAULT 0,
  patch_kind      TEXT NOT NULL,    -- 'body_append' | 'new' | 'dyk_append' | 'events_append'
  patch_payload   TEXT NOT NULL,    -- JSON; the scaffolder-spec entry fragment
  named_entities  TEXT,             -- JSON array
  extracted_at    TEXT NOT NULL DEFAULT (datetime('now')),
  status          TEXT NOT NULL DEFAULT 'pending_review',
                  -- pending_review | passed | passed_low | quarantined | merged
  confidence      INTEGER,          -- 0-100, set by Reviewer
  review_notes    TEXT,             -- JSON: { layer_results: {...}, reasons: [...] }
  reviewed_at     TEXT,
  rendered_at     TEXT,
  UNIQUE(video_id, segment_start, claim_text)
);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_article ON claims(article_slug, status);
CREATE INDEX IF NOT EXISTS idx_claims_video ON claims(video_id);

-- The dead-letter. Forever. Never deleted.
CREATE TABLE IF NOT EXISTS quarantine (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  kind            TEXT NOT NULL,    -- 'clip' | 'claim'
  video_id        TEXT,
  claim_id        INTEGER,
  reason_code     TEXT NOT NULL,    -- layer name or 'bio_gate' | 'low_confidence' | etc
  reason_detail   TEXT,
  payload         TEXT,             -- frozen JSON snapshot of the rejected thing
  quarantined_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quarantine_kind ON quarantine(kind, reason_code);

-- Worker activity log → drives the pixel office snapshot.json.
-- Append-only, periodically trimmed.
CREATE TABLE IF NOT EXISTS activity (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ts              TEXT NOT NULL DEFAULT (datetime('now')),
  worker          TEXT NOT NULL,    -- 'scribe-1', 'cataloger-2', etc
  role            TEXT NOT NULL,    -- 'scribe', 'cataloger', 'reviewer', ...
  event           TEXT NOT NULL,    -- 'start' | 'finish' | 'handoff' | 'idle'
  detail          TEXT,             -- short human-readable
  ref_kind        TEXT,             -- 'clip' | 'claim'
  ref_id          TEXT,
  handoff_to      TEXT              -- role key, when event='handoff'
);
CREATE INDEX IF NOT EXISTS idx_activity_ts ON activity(ts);

-- Coordinator run log: one row per cycle.
CREATE TABLE IF NOT EXISTS cycles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at      TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at        TEXT,
  claims_merged   INTEGER DEFAULT 0,
  articles_touched INTEGER DEFAULT 0,
  commit_sha      TEXT,
  status          TEXT DEFAULT 'running'  -- running | committed | failed
);

-- Named-entity whitelist for the contamination check bootstrap.
-- During early backfill, entities in this table bypass cross-corpus presence.
CREATE TABLE IF NOT EXISTS entity_whitelist (
  entity          TEXT PRIMARY KEY,
  added_at        TEXT NOT NULL DEFAULT (datetime('now')),
  notes           TEXT
);
