-- Grade governance tables (extracted from botnet/data/article-grades-schema.sql).
-- Example INSERTs from that file are intentionally NOT loaded.

CREATE TABLE IF NOT EXISTS article_current_grade (
  article_slug     TEXT PRIMARY KEY,
  current_grade    TEXT NOT NULL
                   CHECK (current_grade IN ('stub','start','c','b','ga','fa')),
  grade_since      TEXT NOT NULL,
  last_editor_role TEXT,
  last_editor_id   TEXT,
  quorum_complete  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS article_grade_history (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug     TEXT NOT NULL REFERENCES article_current_grade(article_slug),
  event_type       TEXT NOT NULL
                   CHECK (event_type IN ('promotion','demotion','revert')),
  from_grade       TEXT NOT NULL
                   CHECK (from_grade IN ('stub','start','c','b','ga','fa')),
  to_grade         TEXT NOT NULL
                   CHECK (to_grade IN ('stub','start','c','b','ga','fa')),
  triggered_by     TEXT NOT NULL,
  triggered_by_id  TEXT NOT NULL,
  trigger_reason   TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS article_grade_votes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug     TEXT NOT NULL,
  target_grade     TEXT NOT NULL
                   CHECK (target_grade IN ('ga','fa')),
  voter_role       TEXT NOT NULL,
  voter_id         TEXT NOT NULL,
  voter_group      TEXT NOT NULL
                   CHECK (voter_group IN ('adjudication','enhancement','patrol','learning')),
  last_editor_role TEXT NOT NULL,
  last_editor_id   TEXT NOT NULL,
  vote_rationale   TEXT NOT NULL,
  quorum_position  INTEGER NOT NULL
                   CHECK (quorum_position IN (1,2,3)),
  voted_at         TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (voter_id != last_editor_id),
  UNIQUE (article_slug, target_grade, voter_role, voter_id)
);

CREATE TABLE IF NOT EXISTS article_grade_criteria_log (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug     TEXT NOT NULL,
  evaluated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  target_grade     TEXT NOT NULL
                   CHECK (target_grade IN ('stub','start','c','b','ga','fa')),
  criterion_key    TEXT NOT NULL,
  criterion_label  TEXT NOT NULL,
  result           TEXT NOT NULL
                   CHECK (result IN ('pass','fail','skip')),
  measured_value   TEXT,
  required_value   TEXT,
  notes            TEXT
);

CREATE TABLE IF NOT EXISTS article_grade_deferrals (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug     TEXT NOT NULL,
  deferred_at      TEXT NOT NULL DEFAULT (datetime('now')),
  target_grade     TEXT NOT NULL,
  blocking_criteria TEXT NOT NULL,
  deferral_note    TEXT NOT NULL,
  next_check_after TEXT
);

CREATE TABLE IF NOT EXISTS article_hedge_density (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug     TEXT NOT NULL,
  commit_sha       TEXT NOT NULL,
  measured_at      TEXT NOT NULL DEFAULT (datetime('now')),
  word_count       INTEGER NOT NULL,
  hedge_count      INTEGER NOT NULL,
  hedge_density    REAL NOT NULL,
  new_corpus_input INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS article_shape_audit (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug     TEXT NOT NULL,
  audited_at       TEXT NOT NULL DEFAULT (datetime('now')),
  toc_hash         TEXT NOT NULL,
  converging_peers TEXT,
  convergence_count INTEGER NOT NULL DEFAULT 0,
  flagged          INTEGER NOT NULL DEFAULT 0,
  resolved         INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_grade_history_slug ON article_grade_history(article_slug, created_at);
CREATE INDEX IF NOT EXISTS idx_grade_votes_target ON article_grade_votes(article_slug, target_grade);
CREATE INDEX IF NOT EXISTS idx_hedge_density_slug ON article_hedge_density(article_slug, measured_at);
CREATE INDEX IF NOT EXISTS idx_shape_audit_flagged ON article_shape_audit(flagged, audited_at);
