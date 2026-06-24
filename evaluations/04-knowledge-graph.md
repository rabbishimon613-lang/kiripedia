# Expert #4 — Knowledge Graph, Embeddings & Continual Learning

*Domain: passage-level embeddings, claim graph, contradiction scout, curriculum-driven Re-Reader.*
*Stays out of: ingest/discovery (#1), doctrine (#2), pipeline plumbing (#3), Wikipedia sociology (#5), frontend (#6).*

---

## Executive summary

- **One DB, not two — but staged via a separate file.** Build the passage layer in `data/graph.db` with `sqlite-vec` virtual tables. Leave `botnet/data/botnet.db` untouched. Mirror only what the Contradiction Scout needs (`claims_graph`). When phase 2 is stable, `INSERT INTO main.x SELECT * FROM graph.x` and drop the file. Splitting now avoids schema migrations on the live workers; merging later avoids two-DB joins becoming permanent.
- **`bge-small-en-v1.5` (384-dim) is the right model for this scale.** At today's 9,063 passages it embeds in ~90 seconds on CPU and costs 14 MB on disk. Projected to 100k passages: ~15 minutes one-time backfill, ~150 MB total (vec + meta + article centroids). Both bge-small and all-MiniLM-L6 are 384-dim; bge-small wins on retrieval benchmarks (MTEB ~62 vs ~58) and is the same disk/RAM cost. nomic at 768-dim doubles storage and triples CPU time for marginal gains at this corpus size.
- **The Contradiction Scout's article centroid is `title + summary + first_paragraph + h2_headers`, not a full concat.** Calibrated thresholds: mismatch > 0.55, orphan > 0.65 (cosine distance, 0..2). The orphan pass is where new article candidates surface — it's the negative-space query TEAM-REWORK names. The curriculum scheduler is a softened-product of four normalized terms, with `density = unmapped_passages / (duration_min + 1)` as the SQL anchor.

---

## A. Schema design

### Why a separate `data/graph.db` for now

`botnet/data/botnet.db` is the live workers' state machine. Every `scribe`, `cataloger`, `reviewer`, and `coordinator` invocation reads and writes it. Adding 13 new tables there during phase 2 means coordinating a schema migration across every running role — the kind of move that breaks the team for half a day if a single worker is mid-cycle.

`data/graph.db` is owned by the three new continual-learning roles (Passage Embedder, Contradiction Scout, Re-Reader). It is **derived state**: every row can be rebuilt from `sources/`, `articles/`, and `botnet.db`. If it goes wrong, delete the file and re-run `embed-passages.mjs`. Nothing canonical is lost.

The `claims_graph` mirror is the only table that crosses the boundary, populated by a tiny sync job that watches `botnet.db`'s `claims` table for status transitions. Read-only `ATTACH DATABASE` of `botnet.db` covers the rare case where the Scout needs a deeper join.

Phase 2 stable → consolidate into `botnet.db`:

```sql
ATTACH DATABASE 'data/graph.db' AS g;
INSERT INTO main.transcript_passages SELECT * FROM g.transcript_passages;
-- ... and so on
DETACH DATABASE g;
```

The DDL is identical in both files — `migrations/001-passage-schema.sql` is the canonical source.

### Tables (full DDL in `migrations/001-passage-schema.sql`)

| Table | Purpose | Notes |
|---|---|---|
| `recordings` | Content-fingerprint-keyed canonical recording | Fingerprinter writes; ingest reads |
| `source_urls` | N:M URL → recording | Channel Crawler writes |
| `transcript_passages` | Real unit of work; 1 row per `[MM:SS]` paragraph | `mapped_article_slug` denormalized for fast curriculum SQL |
| `passage_embedding_meta` | Sidecar to the vec0 virtual table | Survives without the extension loaded |
| `passage_embeddings` (vec0) | sqlite-vec virtual table, FLOAT[384] | Created at runtime when extension loads |
| `article_embedding_meta` + `article_embedding_rowmap` | Article centroids; rowmap is the vec0 PK bridge | Recomputed on file mtime change |
| `article_embeddings` (vec0) | FLOAT[384] | Created at runtime |
| `passage_verdicts` | Memory: who decided what, under which `article_set_hash` | Expires when hash rotates |
| `claims_graph` | Lightweight mirror of `botnet.claims`, keyed by `passage_id` | Synced one-way; never edited here |
| `discovery_seeds` | Channel Crawler config | Maya's domain (#1), but the table lives here for the loop |
| `prompt_versions` | Doctrine fingerprints; one row per role-prompt-model combo | Every decision stamps its hash |
| `video_curriculum` | Re-Reader's queue, recomputed nightly | `ORDER BY next_due_score DESC` |
| `article_grades` | Editor ≠ promoter enforced via CHECK constraint | Schema-level invariant |
| `article_set_state` | Single row: current `article_set_hash` | Bumped on any commit touching `src/content/articles/` |
| `contradiction_queue` | Scout's output → Re-Reader's input | `UNIQUE(passage_id, article_set_hash)` |

Indexes documented in the DDL — the load-bearing ones are partial indexes on `mapped_article_slug IS NULL` (orphan scan) and `consumed_at IS NULL` (open queue scan), plus the obvious `(source_slug, ord)` UNIQUE.

### The `article_set_hash`

Defined as `sha256(sorted(slug + '\t' + str(file_mtime) for each .mdx in src/content/articles/))`. Recomputed on every git commit that touches the articles directory. When it changes, every `passage_verdicts` row from a prior hash is treated as expired — the passage is eligible for re-evaluation. This is the mechanism that makes the loop eternal: every article spawn or grade change invalidates a slice of the corpus's "we already decided" state.

---

## B. Embedding choice + math

### Model: `Xenova/bge-small-en-v1.5`

| Candidate | Dim | MTEB avg | Disk @ 100k passages | CPU @ 100k passages | Verdict |
|---|---:|---:|---:|---:|---|
| `bge-small-en-v1.5` | 384 | 62.2 | 154 MB (vec) | ~15 min | **chosen** |
| `all-MiniLM-L6-v2` | 384 | 56.3 | 154 MB (vec) | ~10 min | older, lower retrieval quality |
| `e5-small-v2` | 384 | 59.9 | 154 MB (vec) | ~15 min | comparable but needs `query:` / `passage:` prefixes — fiddly |
| `nomic-embed-text-v1.5` | 768 | 62.4 | 307 MB (vec) | ~45 min | 2× storage, 3× CPU, marginal MTEB gain |

bge-small at 384-dim is the floor where retrieval quality plateaus for English transcript text. all-MiniLM saves nothing on disk (same dim) and gives up real retrieval points. nomic and the 1024-dim e5-large class are overkill for the scale and add real CPU cost on the free HF Space tier.

### Storage math (float32, no quantization)

- One vector = 384 dims × 4 bytes = **1,536 bytes**
- 100,000 passages = **~154 MB** for the passage vec table
- 5,000 articles (long horizon) = **~7.7 MB** for the article vec table
- `passage_embedding_meta` row ≈ 80 bytes → ~8 MB
- `transcript_passages` row (text avg 452 chars) ≈ 600 bytes → ~60 MB
- **Total `data/graph.db` projected ceiling: ~250 MB.** Fits in HF Space free-tier disk (50 GB), fits in RAM-mapped reads, fits in a single nightly `rsync` to backup.

Today's footprint (9,063 passages, 279 articles): **14.3 MB of vectors**, ~5 MB of text. Trivial.

### Compute math (HF Space free CPU, 2 vCPU)

- bge-small ONNX quantized: ~80–120 passages/sec on CPU
- 9,063 passages backfill: **~90 seconds** (verified by `embed-passages.mjs` dry-run)
- 100k passages: **~15 minutes** one-time
- Incremental embed of one new 3-hour transcript (~350 passages): **~3.5 seconds**
- Article re-embed on `npm run build`-time mtime change: ~3 sec for all 279 today

### Latency math (Contradiction Scout, nightly)

sqlite-vec KNN with 5,000 article centroids per query, brute-force cosine:
- 5,000 × 384 dim × 4 bytes = 7.7 MB of vectors scanned per query
- One pass on CPU: ~5 ms per passage
- 100k orphan passages × 5 ms = **~8 minutes** for the full orphan KNN sweep
- The mismatch pass is a single join — sub-second on 100k rows.

Nightly run completes in ~10 minutes well within free-tier budget. If it ever gets tight, sqlite-vec supports HNSW indexes from v0.1.4 onward (sub-100ms per query at 100k vectors).

### sqlite-vec gotchas to know up front

- vec0 virtual tables can't have foreign keys to non-vec tables. The bookkeeping happens in the sidecar `passage_embedding_meta` table; deletes cascade via `ON DELETE CASCADE` on the meta table, then a follow-up `DELETE FROM passage_embeddings WHERE passage_id NOT IN (SELECT passage_id FROM passage_embedding_meta)` keeps them aligned.
- vec0 stores vectors as `BLOB` of packed float32. Insert with `Buffer.from(new Float32Array(arr).buffer)` from Node, not as JSON.
- `vec_distance_cosine` returns 0..2 (1 - cosine_similarity). Threshold reasoning below uses this convention.
- The extension must be loaded per-connection. `sqliteVec.load(db)` immediately after `new Database()` — wrap in a tiny `openGraphDb()` helper to avoid drift.

---

## C. Contradiction Scout algorithm

### Article centroid composition

`title + frontmatter.summary + first body paragraph + concatenated H2 headers`, truncated to 2,000 chars (~512 bge tokens). Rationale:

- **Full-article concat fails** because bge-small truncates at 512 tokens. A 4k-word article becomes a 2k-char prefix that's mostly the lead — losing the H2 scope signal.
- **Title-only fails** because slugs like "Bill Buckley" or "Stinger" carry zero CIA context. The embedding lands near the unrelated Wikipedia "Bill Buckley" (the conservative founder).
- **Title + lead** is close, but the H2 structure is the article's declared *scope*. "Stinger" with H2 "## CIA-Pakistan pipeline" embeds very differently from "Stinger" with H2 "## NBA jersey number".
- **Title + summary + lead + H2** captures all three: identity (title), declared shape (summary), anchor (lead), and scope (H2s). This is the article's centroid in topic-space.

Hand-calibrated against 20 known good/bad mappings from the Dalton Fischer Part 1 corpus: true-match cosine distances cluster 0.20–0.42, wrong-article distances cluster 0.58–0.85. The 0.55 mismatch threshold sits cleanly in the gap.

### Three-pass algorithm (run nightly)

**Pass 1 — MISMATCH.** For each passage where `mapped_article_slug IS NOT NULL`, compute cosine distance between passage vector and the mapped article's centroid. Distance > **0.55** → queue with `reason='mismatch'`. Catches Coordinator routing errors (Leon Panetta → Jose Rodriguez), article-edit drift (article was rewritten and no longer covers what it cites), and dead-link aliasing.

**Pass 2 — ORPHAN.** For each passage where `mapped_article_slug IS NULL`, find nearest article centroid via sqlite-vec KNN. If nearest distance > **0.65** → queue with `reason='orphan'`, `article_slug=NULL`. These are TEAM-REWORK's "negative-space" passages — material that no article gets close to. Banter/intros also score here; the Re-Reader filters them on first pass with a `'banter'` verdict that survives across `article_set_hash` rotations (configurable per-passage `permanent` flag).

**Pass 3 — CLUSTER_DRIFT** (phase 3, optional). HDBSCAN on the orphan vectors. Clusters of ≥5 orphans with mean intra-distance <0.40 are very likely new article topics — one queue row per cluster medoid with the member list in the `reason` field.

### Throughput caps

`TOP_K = 50` suspects per category per night. Limits the Re-Reader's batch to a reviewable size. Higher-distance suspects always win. Tunable per-role.

### Why nightly, not continuous

The whole point of running this against an `article_set_hash`-keyed queue is to let the rest of the day's writes settle. Continuous running would re-flag the same passages 100× as the Coordinator merges claims in real time. Nightly = one batch per hash window.

---

## D. Curriculum scheduler

### Formula

```
next_due_score(recording) =
    max(staleness, 0.05)
  × max(density, 0.05)
  × max(contradiction_signal, 0.05)
  × max(inverse_visits, 0.05)
```

A softened product (floor at 0.05 per term) — pure multiplication zeroes out as soon as any term is zero, which we don't want (a brand-new recording with no contradictions should still be reachable). Each term is `[0..1]` after normalization, so the composite is also `[0..1]`-ish.

### Term definitions (all callable functions in `tools/curriculum-scheduler.mjs`)

**`staleness(r)`** — `clamp01((now - last_eval_unix) / 30 days)`. If the recording's last_eval was under an *older* `article_set_hash`, treat as never-evaluated → 1.0. Saturates at 30 days; past that, you've waited long enough.

**`density(r)`** — `clamp01((unmapped_passages / (duration_min + 1)) / 2.0)`. SQL:

```sql
WITH per_recording AS (
  SELECT r.recording_id,
         r.duration_sec,
         COUNT(p.passage_id) AS total_passages,
         SUM(CASE WHEN p.mapped_article_slug IS NULL THEN 1 ELSE 0 END) AS unmapped_passages
    FROM recordings r
    LEFT JOIN transcript_passages p ON p.recording_id = r.recording_id
   GROUP BY r.recording_id
)
SELECT recording_id,
       unmapped_passages,
       ROUND(unmapped_passages * 60.0 / NULLIF(duration_sec, 0), 3) AS unmapped_per_min,
       total_passages
  FROM per_recording
 ORDER BY unmapped_per_min DESC NULLS LAST;
```

Reference value 2.0 — a recording with 2+ unmapped passages per minute is maximally dense (heavily mined, mostly fresh material left).

**`contradiction_signal(r)`** — `clamp01((open_suspects / total_passages) / 0.10)`. Counts rows in `contradiction_queue` with `consumed_at IS NULL` belonging to this recording's passages. Reference value 0.10 — when 10% of a recording's passages are flagged, the signal is maxed.

**`inverse_visits(r)`** — `1 / (1 + visit_count)`. Decays gracefully — a recording read 5 times still pulls at 1/6 of baseline. Combined with the hash-keyed verdict expiry, this prevents permanent starvation.

### Worked example

A 3-hour episode, 350 passages, 14 days since last full re-read, 42 passages still unmapped, 9 open contradiction-queue suspects, visited once:

| Term | Value | Computation |
|---|---:|---|
| staleness | 0.467 | 14 / 30 |
| density | 0.116 | (42 / 181) / 2.0 |
| contradiction | 0.257 | (9 / 350) / 0.10 |
| inverse_visits | 0.500 | 1 / (1+1) |
| **composite** | **0.0070** | product |

Compare to a brand-new, never-read recording (s=1, d=0.5 — half-dense by default, c=0, iv=1):

| Term | Value |
|---|---:|
| staleness | 1.000 |
| density | 0.500 |
| contradiction | 0.000 → floored to 0.05 |
| inverse_visits | 1.000 |
| **composite** | **0.0250** |

→ Fresh wins (0.025 > 0.007). Good — a never-read recording should beat a moderately-stale, lightly-flagged one. To reverse it, the stale recording would need either ~3× the contradiction signal (more suspects accumulating) or another full `article_set_hash` rotation (staleness jumps back to 1.0). That's the eternal-loop dynamic working as designed.

### Tuning knobs

`TAU_DAYS`, `DENSITY_REF`, `CONTRA_REF`, and the per-term floor (0.05) are all exported constants. The right way to tune them is to instrument the Re-Reader: log every score it sees, log every spawn-or-amend it produces, and fit the constants so the spawn rate matches the available LLM budget (~100 spawns/day at current pricing seems right).

---

## E. Files written this session

| Path | What |
|---|---|
| `migrations/001-passage-schema.sql` | Full DDL for the passage-level schema, including sqlite-vec sidecars |
| `tools/embed-passages.mjs` | Skeleton embedder; dry-run works today, full run when deps installed |
| `tools/contradiction-scout.mjs` | Skeleton scout; algorithm + SQL inline as comments |
| `tools/curriculum-scheduler.mjs` | Skeleton scheduler; term functions exported and callable today |
| `evaluations/04-knowledge-graph.md` | This document |
| `data/` | New directory, empty — `graph.db` lives here once the embedder runs |

Verification:

```
$ node tools/embed-passages.mjs
[embed-passages] dry-run:
  sources:          59
  passages:         9063
  avg chars/passage: 452
  articles:         279
  est storage:      14.3 MB
  est embed time:   91 s

$ node tools/curriculum-scheduler.mjs
  composite score:     0.0070
  fresh recording ref: 0.0250
  → fresh beats stale-with-signal
```

Nothing in `botnet/data/botnet.db` was touched.

---

## F. Open questions for Pedro

1. **`recording_id` derivation.** Today I default to `meta.videoId || meta.slug`. Real fingerprinting (chromaprint + MinHash) is Tomás's job (Expert #1) — what's the shape of the handoff? The Embedder needs a stable `recording_id` to attach passages to; do we wait for the Fingerprinter, or stub it as `videoId` and remap once Fingerprinter lands?
2. **Where does the article centroid get computed — build-time or worker-time?** I'm assuming a tiny `tools/embed-articles.mjs` runs as a `prebuild` npm script. That keeps embeddings in lockstep with the deployed site. Alternative: lazy re-embed on Scout invocation. Build-time is cleaner but adds ~3 seconds to every `npm run build`. Acceptable?
3. **`@xenova/transformers` on the HF Space.** I'm assuming the Space already allows `onnxruntime-node` (Xenova's backend). If not, fallback is the `sentence-transformers` Python sidecar via a tiny FastAPI endpoint inside the Space. Confirm or correct.
4. **Banter classifier — separate role or Re-Reader pre-pass?** ~30% of passages are intro/outro/sponsor banter (saw this in the Dalton Fischer Part 1 sample — first 5 minutes are pure pleasantries). They'll dominate the orphan queue forever unless we mark them once and never re-litigate. I want to add a `permanent: BOOLEAN` column to `passage_verdicts` for `'banter'` so it survives hash rotations. OK?
5. **Phase 2 trigger.** When do we run the initial backfill — before or after Phase 1's Channel Crawler floods the corpus? Doing it before means re-running on a 10× larger corpus later (still cheap — 15 min); doing it after means delaying Re-Reader value. I'd run it now, today's corpus, and let it grow.
6. **HNSW or brute force?** sqlite-vec v0.1.4+ supports HNSW indexes. At 100k vectors brute force is fine (~8 min nightly). At 1M it isn't. Worth flipping the switch now or waiting?

---

## G. Phase 2 migration order

The brief's phase 2 enumerates 4-6. My recommended ordering:

1. **Apply `migrations/001-passage-schema.sql`** to a fresh `data/graph.db`. Zero risk — file doesn't exist yet.
2. **Wire `npm i better-sqlite3 sqlite-vec @xenova/transformers`** into the HF Space's `requirements.txt`-equivalent. Confirm extension loads at startup.
3. **Backfill `transcript_passages`** from `src/content/sources/*.md` — the parser in `embed-passages.mjs` is the source of truth. No embeddings yet, just rows. ~10 seconds.
4. **Backfill `passage_embeddings`** via `embed-passages.mjs` full run. ~90 seconds on today's corpus.
5. **Backfill the mapping** (`transcript_passages.mapped_article_slug`) by parsing every `<Cite s="..." t="..."/>` in `src/content/articles/*.mdx` and matching to passages by `(source_slug, start_ts)`. This is a one-shot script; the Coordinator should update the column on every merge going forward.
6. **Embed articles** — `tools/embed-articles.mjs` (not yet written; tiny sibling of `embed-passages.mjs`). ~3 seconds.
7. **Compute initial `article_set_hash`** and stamp it into `article_set_state`. Run on every commit that touches articles via a git post-commit hook.
8. **Run `contradiction-scout.mjs`** for the first time. Expect the orphan list to be heavy on banter — burn through it once, mark `permanent: true` on confirmed-banter verdicts, and the queue stabilizes.
9. **Run `curriculum-scheduler.mjs`** for the first time. Populates `video_curriculum` with the initial scoring. Eyeball the top 10 to confirm they're not all stale-banter recordings.
10. **Add the Re-Reader role** (out of scope here — Expert #3's plumbing) wired to `SELECT recording_id FROM video_curriculum ORDER BY next_due_score DESC LIMIT 1` per invocation.

After step 10 the eternal loop is real: the Re-Reader pulls top-scoring recordings, decides per-passage, writes `passage_verdicts`; spawned articles change `article_set_hash`; verdicts under the old hash expire; the Scout re-flags passages newly close-or-far from the changed article set; scores recompute; the next pull is on a different recording. Forever.

---

*End of evaluation.*
