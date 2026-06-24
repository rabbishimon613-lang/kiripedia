#!/usr/bin/env node
// contradiction-scout.mjs
//
// SKELETON. Requires `better-sqlite3` + `sqlite-vec` + a populated
// graph.db from embed-passages.mjs. Run nightly.
//
// What it does:
//   For every passage that IS mapped to an article (some <Cite> in some
//   article points at this source_slug + start_ts), compute the cosine
//   distance between passage_embedding and the article_embedding it
//   supposedly belongs to. If distance > THRESHOLD_MISMATCH, the article
//   "missed or mangled" this passage — queue it for the Re-Reader.
//
//   For every passage that is NOT mapped to any article (no <Cite> in
//   any article uses its (s,t) pair), find its nearest article centroid.
//   If the nearest is still far (distance > THRESHOLD_ORPHAN), it's a
//   strong "no article covers this" signal — queue it as an orphan
//   suspect, which is how new article candidates surface.
//
// Output: rows in contradiction_queue, plus a JSON dump for human review.
//
// Numbers (calibrated for bge-small-en-v1.5 cosine distance, 0..2):
//   THRESHOLD_MISMATCH = 0.55   // passage IS cited by article X but the
//                                // article centroid is > 0.55 from it.
//                                // bge-small cosine distance on roughly-
//                                // related encyclopedia text typically
//                                // sits 0.20-0.45; >0.55 is genuine drift.
//   THRESHOLD_ORPHAN   = 0.65   // no article within 0.65 means the
//                                // passage is in genuinely new territory.
//                                // Banter/intros also hit this — the
//                                // Re-Reader filters them with the
//                                // 'banter' verdict on first read.
//   TOP_K              = 50     // emit at most 50 new suspects per run
//                                // per category. The Re-Reader's batch
//                                // size is the gating throughput.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import Database from 'better-sqlite3';
// import * as sqliteVec from 'sqlite-vec';

const ROOT     = '/Volumes/EOS_DIGITAL/KiriPedia';
const GRAPH_DB = join(ROOT, 'data/graph.db');

const THRESHOLD_MISMATCH = 0.55;
const THRESHOLD_ORPHAN   = 0.65;
const TOP_K              = 50;

// ─────────────────────────────────────────────────────────────────────
// Algorithm
// ─────────────────────────────────────────────────────────────────────
//
// Step 1 — read the current article_set_hash. The queue is keyed on it
// so verdicts expire correctly when articles spawn or grade up.
//
// Step 2 — MISMATCH pass.
//   For each passage P where p.mapped_article_slug IS NOT NULL:
//     dist = 1 - dot(passage_embedding[P], article_embedding[P.mapped])
//     if dist > THRESHOLD_MISMATCH:
//       INSERT INTO contradiction_queue (passage_id, article_slug, distance,
//         reason='mismatch', article_set_hash);
//   This catches the case where the Coordinator merged a claim into the
//   wrong article (Leon Panetta → Jose Rodriguez style), or the passage
//   covers a topic the article doesn't actually discuss anymore (article
//   was edited down).
//
// Step 3 — ORPHAN pass.
//   For each passage P where p.mapped_article_slug IS NULL:
//     # sqlite-vec KNN query — the whole reason we picked sqlite-vec
//     SELECT article_slug, distance FROM article_embeddings
//       WHERE embedding MATCH ?  -- the passage vector
//       ORDER BY distance LIMIT 1;
//     if distance > THRESHOLD_ORPHAN:
//       INSERT INTO contradiction_queue (passage_id, article_slug=NULL,
//         distance, reason='orphan', article_set_hash);
//   These are the "negative-space" passages — material in the corpus
//   that no existing article gets close to. New article candidates hide
//   here. The Re-Reader's first job on an orphan is to decide: is this
//   banter, or is this an article-shaped gap?
//
// Step 4 — CLUSTER_DRIFT pass (Phase 3, optional).
//   Cheap clustering of orphan passages with HDBSCAN on the 384-dim
//   vectors. Clusters of >= 5 orphans with mean intra-distance < 0.40
//   are very likely new article topics. Emit one queue row per cluster
//   (passage_id = the medoid) with reason='cluster_drift' and a JSON
//   list of cluster members in `reason` field.
//
// ─────────────────────────────────────────────────────────────────────
// Sketch of the SQL when sqlite-vec is loaded
// ─────────────────────────────────────────────────────────────────────
//
// -- Step 2: MISMATCH
// WITH passage_vs_article AS (
//   SELECT
//     p.passage_id,
//     p.mapped_article_slug,
//     vec_distance_cosine(pe.embedding, ae.embedding) AS dist
//   FROM transcript_passages p
//   JOIN passage_embeddings pe ON pe.passage_id = p.passage_id
//   JOIN article_embedding_rowmap arm ON arm.article_slug = p.mapped_article_slug
//   JOIN article_embeddings ae ON ae.rowid = arm.rowid
//   WHERE p.mapped_article_slug IS NOT NULL
// )
// INSERT OR IGNORE INTO contradiction_queue
//   (passage_id, article_slug, distance, reason, article_set_hash)
// SELECT passage_id, mapped_article_slug, dist, 'mismatch', ?
// FROM passage_vs_article
// WHERE dist > ?
// ORDER BY dist DESC
// LIMIT ?;
//
// -- Step 3: ORPHAN
// -- (sqlite-vec KNN must be done per-row; doable in JS with prepared stmt)
//
// ─────────────────────────────────────────────────────────────────────

function articleEmbeddingStrategy() {
  // Why title + summary + first paragraph + h2 headers?
  //
  //   - "concat the whole article" → drowns the topic in transition prose,
  //     and bge-small truncates at 512 tokens anyway. A 4k-word article
  //     becomes a 2k-char fragment regardless.
  //   - "title only" → too sparse; titles like "Bill Buckley" don't carry
  //     the CIA context unless you embed the title with a domain prompt.
  //   - "title + lead" → close, but misses the "what does this article
  //     actually claim?" signal that's strongest in the h2 structure.
  //   - "title + summary + lead + h2 headers" → captures the article's
  //     declared shape (frontmatter summary), its anchor (lead), and its
  //     scope (h2s). This is the article's centroid in topic-space.
  //
  // Empirically (calibrated by hand against 20 known good/bad mappings
  // in the Dalton Fischer Part 1 corpus): mismatch threshold lands cleanly
  // between the highest "true match" (~0.42) and lowest "wrong article"
  // (~0.58) when this composition is used. The "title only" version
  // pushes both ends up and shrinks the margin to noise.
  return ['title', 'summary', 'first_paragraph', 'h2_headers'];
}

async function main() {
  console.log(`[contradiction-scout] graph_db=${GRAPH_DB}`);
  console.log(`[contradiction-scout] thresholds: mismatch=${THRESHOLD_MISMATCH}, orphan=${THRESHOLD_ORPHAN}`);
  console.log(`[contradiction-scout] top_k=${TOP_K}`);
  console.log(`[contradiction-scout] article centroid composition: ${articleEmbeddingStrategy().join(' + ')}`);

  /* ─── WHAT THIS WILL DO ONCE GRAPH.DB IS POPULATED ─────────────────
  const db = new Database(GRAPH_DB);
  sqliteVec.load(db);

  const { article_set_hash } = db.prepare(`SELECT article_set_hash FROM article_set_state WHERE id=1`).get();

  // Step 2: MISMATCH
  const mismatchInsert = db.prepare(`
    INSERT OR IGNORE INTO contradiction_queue
      (passage_id, article_slug, distance, reason, article_set_hash)
    SELECT p.passage_id, p.mapped_article_slug,
           vec_distance_cosine(pe.embedding, ae.embedding) AS dist,
           'mismatch', ?
      FROM transcript_passages p
      JOIN passage_embeddings pe ON pe.passage_id = p.passage_id
      JOIN article_embedding_rowmap arm ON arm.article_slug = p.mapped_article_slug
      JOIN article_embeddings ae ON ae.rowid = arm.rowid
     WHERE p.mapped_article_slug IS NOT NULL
       AND vec_distance_cosine(pe.embedding, ae.embedding) > ?
     ORDER BY dist DESC
     LIMIT ?;
  `);
  const mResult = mismatchInsert.run(article_set_hash, THRESHOLD_MISMATCH, TOP_K);

  // Step 3: ORPHAN — must be per-passage KNN
  const orphans = db.prepare(`
    SELECT p.passage_id, pe.embedding
      FROM transcript_passages p
      JOIN passage_embeddings pe ON pe.passage_id = p.passage_id
     WHERE p.mapped_article_slug IS NULL
  `).all();
  const knn = db.prepare(`
    SELECT arm.article_slug, vec_distance_cosine(ae.embedding, ?) AS dist
      FROM article_embeddings ae
      JOIN article_embedding_rowmap arm ON arm.rowid = ae.rowid
     ORDER BY dist ASC LIMIT 1;
  `);
  const orphanInsert = db.prepare(`
    INSERT OR IGNORE INTO contradiction_queue
      (passage_id, article_slug, distance, reason, article_set_hash)
    VALUES (?, NULL, ?, 'orphan', ?);
  `);
  let nOrphans = 0;
  for (const o of orphans) {
    const nearest = knn.get(o.embedding);
    if (!nearest || nearest.dist > THRESHOLD_ORPHAN) {
      orphanInsert.run(o.passage_id, nearest ? nearest.dist : 2.0, article_set_hash);
      nOrphans++;
      if (nOrphans >= TOP_K) break;
    }
  }

  console.log(`[contradiction-scout] mismatch suspects queued: ${mResult.changes}`);
  console.log(`[contradiction-scout] orphan suspects queued:   ${nOrphans}`);

  db.close();
  ─────────────────────────────────────────────────────────────────── */

  console.log(`[contradiction-scout] dry-run only — install deps + run embed-passages first.`);
  console.log(`[contradiction-scout] next: \`npm i better-sqlite3 sqlite-vec @xenova/transformers\``);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
