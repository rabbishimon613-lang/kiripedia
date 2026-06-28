-- Phase 3: doctrine guards + ceremony.

CREATE TABLE IF NOT EXISTS drift_incidents (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL,
  kind            TEXT NOT NULL,         -- cite_removed | hedge_rise | reverted
  from_rev        TEXT,
  to_rev          TEXT,
  reason          TEXT,
  at              TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_drift_slug ON drift_incidents(slug, at);
CREATE INDEX IF NOT EXISTS idx_drift_kind ON drift_incidents(kind, at);

-- Two new columns on claims for the doctrine guards.
-- Older sqlite-cli builds may emit "duplicate column" if rerun; harmless.
ALTER TABLE claims ADD COLUMN discretion_status TEXT;
ALTER TABLE claims ADD COLUMN perspective TEXT;

CREATE INDEX IF NOT EXISTS idx_claims_discretion ON claims(discretion_status);
CREATE INDEX IF NOT EXISTS idx_claims_perspective ON claims(perspective);
