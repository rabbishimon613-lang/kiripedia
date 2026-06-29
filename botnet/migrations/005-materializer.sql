-- 005-materializer.sql
-- Tracks which passage_verdicts have been turned into actual claims.
-- Without this column, the Materializer would either re-process the same
-- verdict every cycle or have no way to know what's already filed.

ALTER TABLE passage_verdicts ADD COLUMN materialized_at TEXT;
ALTER TABLE passage_verdicts ADD COLUMN materialized_claim_id INTEGER;
ALTER TABLE passage_verdicts ADD COLUMN materialize_error TEXT;

CREATE INDEX IF NOT EXISTS idx_verdicts_pending_materialize
  ON passage_verdicts(verdict, materialized_at);
