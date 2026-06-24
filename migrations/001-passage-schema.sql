-- KiriPedia migration 001 — passage-level schema + embeddings + curriculum
--
-- Target DB: /Volumes/EOS_DIGITAL/KiriPedia/data/graph.db
-- DO NOT apply to botnet/data/botnet.db. The graph DB is a separate file
-- that ATTACHes botnet.db read-only when joins are needed. Rationale:
--  - botnet.db is the live workers' state — schema changes there block
--    every running role. graph.db is owned by the continual-learning roles
--    (Passage Embedder, Re-Reader, Contradiction Scout) and can be rebuilt
--    from sources/ + articles/ + botnet.db at any time without losing
--    canonical work.
--  - sqlite-vec virtual tables can live in their own DB and be ATTACHed.
--  - When phase 2 is stable, the tables here can be migrated *into*
--    botnet.db with `INSERT INTO main.x SELECT * FROM graph.x` and the
--    file dropped. Schema is the same either way.
--
-- Load order (idempotent):
--   sqlite3 data/graph.db < migrations/001-passage-schema.sql
--   (sqlite-vec extension is loaded by the runtime, not here.)

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ─────────────────────────────────────────────────────────────────────
-- 1. RECORDINGS — the deduped "thing on tape." Many URLs, one recording.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recordings (
  recording_id      TEXT PRIMARY KEY,         -- audio chromaprint hash or sha256 of the canonical transcript text
  canonical_slug    TEXT UNIQUE,              -- the slug we publish under in src/content/sources/
  title             TEXT,
  show              TEXT,                     -- canonicalized via show-aliases.mjs
  recorded_date     TEXT,                     -- YYYY-MM-DD
  duration_sec      INTEGER,
  caption_source    TEXT,                     -- 'auto' | 'manual' | 'whisper-small' | 'whisper-large-v3'
  fingerprint_audio TEXT,                     -- chromaprint
  fingerprint_text  TEXT,                     -- MinHash signature of normalized transcript
  ingested_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_recordings_date  ON recordings(recorded_date);
CREATE INDEX IF NOT EXISTS idx_recordings_show  ON recordings(show);
CREATE INDEX IF NOT EXISTS idx_recordings_fp_t  ON recordings(fingerprint_text);

-- ─────────────────────────────────────────────────────────────────────
-- 2. SOURCE_URLS — every URL pointing at the same recording.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS source_urls (
  url               TEXT PRIMARY KEY,
  recording_id      TEXT REFERENCES recordings(recording_id) ON DELETE CASCADE,
  platform          TEXT,                     -- 'youtube' | 'rumble' | 'spotify' | 'apple_podcasts' | 'archive_org' | 'rss' | ...
  external_id       TEXT,                     -- platform-native id (videoId, episode guid)
  discovered_via    TEXT,                     -- 'channel_crawl' | 'seed_gardener' | 'podcast_rss' | 'archive_diver' | 'manual'
  discovered_at     TEXT NOT NULL DEFAULT (datetime('now')),
  status            TEXT NOT NULL DEFAULT 'new'  -- new | fetched | duplicate | dead | quarantined
);
CREATE INDEX IF NOT EXISTS idx_source_urls_rec  ON source_urls(recording_id);
CREATE INDEX IF NOT EXISTS idx_source_urls_stat ON source_urls(status);

-- ─────────────────────────────────────────────────────────────────────
-- 3. TRANSCRIPT_PASSAGES — the real unit of work.
-- One row per paragraph in src/content/sources/<slug>.md.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transcript_passages (
  passage_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  recording_id      TEXT NOT NULL REFERENCES recordings(recording_id) ON DELETE CASCADE,
  source_slug       TEXT NOT NULL,            -- denormalized for fast joins to articles (which cite slug+timestamp)
  ord               INTEGER NOT NULL,         -- 0-based paragraph index within the source
  start_ts          TEXT NOT NULL,            -- 'MM:SS' or 'H:MM:SS' — same format <Cite t=""> uses
  end_ts            TEXT,                     -- inferred from next passage; null on last paragraph
  start_sec         INTEGER NOT NULL,         -- normalized seconds for math
  end_sec           INTEGER,
  text              TEXT NOT NULL,            -- the paragraph body, no timestamp prefix
  token_count       INTEGER,                  -- char_len / 4 approx; null until computed
  -- continual-learning state
  last_eval_prompt_version  TEXT,             -- which prompt_versions.hash last evaluated this passage
  last_eval_decision        TEXT,             -- 'spawn_article:<slug>' | 'amend:<slug>' | 'reject:<reason>' | 'banter'
  last_eval_at              TEXT,
  -- mapping (denormalized for fast curriculum queries; rebuilt from claims+articles by Contradiction Scout)
  mapped_article_slug       TEXT,             -- NULL if no article cites this (s,t) pair
  mapped_at                 TEXT,
  UNIQUE(source_slug, ord)
);
CREATE INDEX IF NOT EXISTS idx_passages_rec       ON transcript_passages(recording_id);
CREATE INDEX IF NOT EXISTS idx_passages_slug      ON transcript_passages(source_slug);
CREATE INDEX IF NOT EXISTS idx_passages_st        ON transcript_passages(source_slug, start_ts);
CREATE INDEX IF NOT EXISTS idx_passages_mapped    ON transcript_passages(mapped_article_slug);
CREATE INDEX IF NOT EXISTS idx_passages_unmapped  ON transcript_passages(source_slug) WHERE mapped_article_slug IS NULL;
CREATE INDEX IF NOT EXISTS idx_passages_stale     ON transcript_passages(last_eval_prompt_version);

-- ─────────────────────────────────────────────────────────────────────
-- 4. PASSAGE_EMBEDDINGS — sqlite-vec virtual table.
-- Created in code (not DDL) because sqlite-vec requires the extension
-- loaded. The DDL the runtime emits is:
--
--   CREATE VIRTUAL TABLE passage_embeddings USING vec0(
--     passage_id INTEGER PRIMARY KEY,
--     embedding  FLOAT[384]
--   );
--
-- 384 dims = bge-small-en-v1.5 (the chosen model — see evaluation doc).
-- Stored as float32; vec0 packs to 1536 bytes per row.
-- ─────────────────────────────────────────────────────────────────────

-- A non-vec sidecar so we can join + bookkeep without the extension loaded.
CREATE TABLE IF NOT EXISTS passage_embedding_meta (
  passage_id        INTEGER PRIMARY KEY REFERENCES transcript_passages(passage_id) ON DELETE CASCADE,
  model             TEXT NOT NULL,            -- 'bge-small-en-v1.5'
  model_version     TEXT NOT NULL,            -- huggingface revision sha
  dim               INTEGER NOT NULL,         -- 384
  embedded_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────
-- 5. ARTICLE_EMBEDDINGS — one embedding per article (title + lead + section headers).
-- Recomputed when the article file mtime changes. Used by the
-- Contradiction Scout to compare passage embeddings against the article
-- they're supposedly covered by.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS article_embedding_meta (
  article_slug      TEXT PRIMARY KEY,
  file_mtime        INTEGER NOT NULL,         -- unix epoch of mdx file mtime at embed time
  model             TEXT NOT NULL,
  model_version     TEXT NOT NULL,
  dim               INTEGER NOT NULL,
  embedded_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vec table (created at runtime):
--   CREATE VIRTUAL TABLE article_embeddings USING vec0(
--     rowid INTEGER PRIMARY KEY,
--     embedding FLOAT[384]
--   );
-- rowid maps to article_embedding_meta via a separate mapping table:
CREATE TABLE IF NOT EXISTS article_embedding_rowmap (
  rowid             INTEGER PRIMARY KEY,
  article_slug      TEXT UNIQUE NOT NULL REFERENCES article_embedding_meta(article_slug) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────
-- 6. PASSAGE_VERDICTS — memory: who decided what about this passage.
-- Expires when article_set_hash changes. Without this the Re-Reader
-- re-litigates the same banter every cycle.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS passage_verdicts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  passage_id        INTEGER NOT NULL REFERENCES transcript_passages(passage_id) ON DELETE CASCADE,
  worker            TEXT NOT NULL,            -- 're-reader' | 'cataloger' | 'contradiction-scout' | ...
  verdict           TEXT NOT NULL,            -- 'banter' | 'spawn:<slug>' | 'amend:<slug>' | 'duplicate' | 'redact'
  reason            TEXT,
  model             TEXT,
  prompt_version    TEXT NOT NULL,            -- references prompt_versions.hash
  article_set_hash  TEXT NOT NULL,            -- the article-set the verdict was made under
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(passage_id, worker, prompt_version, article_set_hash)
);
CREATE INDEX IF NOT EXISTS idx_verdicts_passage ON passage_verdicts(passage_id);
CREATE INDEX IF NOT EXISTS idx_verdicts_hash    ON passage_verdicts(article_set_hash);

-- ─────────────────────────────────────────────────────────────────────
-- 7. CLAIMS (graph-DB mirror) — references source_passage_id.
-- The canonical claims table stays in botnet.db. graph.db gets a
-- lightweight mirror keyed by passage_id so the Contradiction Scout
-- can join in one DB. Rebuilt by a sync job (cataloger writes
-- botnet.db; sync writes graph.db).
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claims_graph (
  claim_id          INTEGER PRIMARY KEY,      -- mirrors botnet.db claims.id
  passage_id        INTEGER NOT NULL REFERENCES transcript_passages(passage_id) ON DELETE CASCADE,
  article_slug      TEXT NOT NULL,
  is_witnessed      INTEGER DEFAULT 0,        -- JK-witnessed vs JK-relayed (first/third splitter)
  prompt_version    TEXT NOT NULL,
  confidence        INTEGER,
  status            TEXT,                     -- mirror of botnet claims.status at sync time
  synced_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_claims_passage  ON claims_graph(passage_id);
CREATE INDEX IF NOT EXISTS idx_claims_article  ON claims_graph(article_slug);

-- ─────────────────────────────────────────────────────────────────────
-- 8. DISCOVERY_SEEDS — Channel Crawler config.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discovery_seeds (
  seed_id           INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id        TEXT NOT NULL,            -- YT channel id or RSS URL
  channel_name      TEXT,
  platform          TEXT NOT NULL,            -- 'youtube' | 'rss' | 'archive_org'
  tier              INTEGER NOT NULL DEFAULT 2,  -- 1 = Kiriakou himself, 2 = known host, 3 = guest co-appearance
  cadence_hours     INTEGER NOT NULL DEFAULT 24,
  last_swept_at     TEXT,
  active            INTEGER NOT NULL DEFAULT 1,
  added_at          TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(platform, channel_id)
);
CREATE INDEX IF NOT EXISTS idx_seeds_due ON discovery_seeds(active, last_swept_at);

-- ─────────────────────────────────────────────────────────────────────
-- 9. PROMPT_VERSIONS — doctrine fingerprints.
-- Every worker reads its current hash and stamps every decision with it.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prompt_versions (
  hash              TEXT PRIMARY KEY,         -- sha256 of role + prompt body + model id
  role              TEXT NOT NULL,            -- 'cataloger' | 're-reader' | ...
  model             TEXT NOT NULL,
  prompt_body       TEXT NOT NULL,
  doctrine_notes    TEXT,                     -- what changed vs prior version
  active            INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_prompt_role ON prompt_versions(role, active);

-- ─────────────────────────────────────────────────────────────────────
-- 10. VIDEO_CURRICULUM — Re-Reader's priority queue, recomputed nightly.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_curriculum (
  recording_id      TEXT PRIMARY KEY REFERENCES recordings(recording_id) ON DELETE CASCADE,
  staleness_score   REAL NOT NULL DEFAULT 0,  -- f(time since last_eval_at; current article_set_hash)
  density_score     REAL NOT NULL DEFAULT 0,  -- unmapped passages per minute of runtime
  contradiction_score REAL NOT NULL DEFAULT 0,-- mean cosine distance of mapped passages to their article
  visit_count       INTEGER NOT NULL DEFAULT 0,
  inverse_visits    REAL NOT NULL DEFAULT 1,
  last_spawn_rate   REAL NOT NULL DEFAULT 0,  -- articles spawned per re-read, EWMA
  next_due_score    REAL NOT NULL DEFAULT 0,  -- the composite score the Re-Reader sorts by
  scored_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_curriculum_due ON video_curriculum(next_due_score DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 11. ARTICLE_GRADES — current grade + history. Editor ≠ promoter enforced.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS article_grades (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  article_slug      TEXT NOT NULL,
  grade             TEXT NOT NULL,            -- 'Stub' | 'Start' | 'C' | 'B' | 'GA' | 'FA'
  promoter          TEXT NOT NULL,            -- role-worker name
  last_editor       TEXT NOT NULL,            -- role-worker name (must != promoter)
  promoted_at       TEXT NOT NULL DEFAULT (datetime('now')),
  notes             TEXT,
  CHECK(promoter != last_editor)
);
CREATE INDEX IF NOT EXISTS idx_grades_slug ON article_grades(article_slug, promoted_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 12. ARTICLE_SET — the global state hash the Re-Reader cares about.
-- One row, updated on every commit that touches src/content/articles/.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS article_set_state (
  id                INTEGER PRIMARY KEY CHECK (id = 1),
  article_set_hash  TEXT NOT NULL,            -- sha256 of sorted list of (slug, file_mtime)
  article_count     INTEGER NOT NULL,
  computed_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────
-- 13. CONTRADICTION_QUEUE — Scout's output, Re-Reader's input.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contradiction_queue (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  passage_id        INTEGER NOT NULL REFERENCES transcript_passages(passage_id) ON DELETE CASCADE,
  article_slug      TEXT,                     -- NULL if the passage is unmapped (orphan suspect)
  distance          REAL NOT NULL,            -- cosine distance, 0..2
  reason            TEXT NOT NULL,            -- 'orphan' | 'mismatch' | 'cluster_drift'
  article_set_hash  TEXT NOT NULL,
  queued_at         TEXT NOT NULL DEFAULT (datetime('now')),
  consumed_at       TEXT,
  UNIQUE(passage_id, article_set_hash)
);
CREATE INDEX IF NOT EXISTS idx_contraq_open  ON contradiction_queue(consumed_at) WHERE consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contraq_dist  ON contradiction_queue(distance DESC);

-- ─────────────────────────────────────────────────────────────────────
-- End of migration 001
-- ─────────────────────────────────────────────────────────────────────
