-- Phase 1: SwarmBrief layer.
-- briefs = unit of work. checkpoints = unit of report. passage_verdicts = re-read state.

CREATE TABLE IF NOT EXISTS briefs (
  brief_id        TEXT PRIMARY KEY,
  worker          TEXT NOT NULL,            -- role key the brief targets
  goal            TEXT NOT NULL,            -- one sentence
  why_now         TEXT,                     -- what triggered this brief
  scope_json      TEXT NOT NULL,            -- bounded items (transcript, slug, batch)
  deliverables_json TEXT NOT NULL,          -- exact artifact paths and verdict shape
  constraints_json TEXT,                    -- token budget, wall-clock cap
  status          TEXT NOT NULL DEFAULT 'pending',
                  -- pending | claimed | done | quarantined
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  claimed_by      TEXT,
  claimed_at      TEXT,
  completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON briefs(status, worker);
CREATE INDEX IF NOT EXISTS idx_briefs_worker ON briefs(worker, status, created_at);

CREATE TABLE IF NOT EXISTS checkpoints (
  checkpoint_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  brief_id        TEXT NOT NULL REFERENCES briefs(brief_id),
  state           TEXT NOT NULL,            -- DONE|BLOCKED|NEEDS_INPUT|HANDOFF|NEEDS_REVIEW
  files_changed_json TEXT,
  commands_run_json TEXT,
  result_json     TEXT,
  blocker         TEXT,
  next_action     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_checkpoints_brief ON checkpoints(brief_id, created_at);

CREATE TABLE IF NOT EXISTS passage_verdicts (
  passage_id      TEXT NOT NULL,
  worker          TEXT NOT NULL,
  verdict         TEXT NOT NULL,            -- spawn_article|amend_article|tier_c_track|rejected
  reason          TEXT,
  article_set_hash TEXT NOT NULL,
  prompt_version  TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (passage_id, article_set_hash)
);
CREATE INDEX IF NOT EXISTS idx_verdicts_verdict ON passage_verdicts(verdict, article_set_hash);
CREATE INDEX IF NOT EXISTS idx_verdicts_hash ON passage_verdicts(article_set_hash);
