#!/usr/bin/env node
// embed-passages.mjs
//
// SKELETON — does not run end-to-end until two deps are installed:
//   npm i better-sqlite3 sqlite-vec @xenova/transformers
//
// What it does when fully wired:
//   1. Loads src/content/sources/*.md, parses paragraphs by the `[MM:SS]`
//      / `[H:MM:SS]` prefix that normalize-vtt.mjs writes.
//   2. Upserts each paragraph as a row in transcript_passages.
//   3. For every passage missing in passage_embedding_meta, batches
//      through a local bge-small-en-v1.5 model (Xenova/bge-small-en-v1.5
//      via @xenova/transformers — runs in-process, no network).
//   4. Writes the 384-dim vector to the sqlite-vec virtual table.
//   5. Also embeds every src/content/articles/*.mdx whose file_mtime is
//      newer than article_embedding_meta.file_mtime — using
//      title + summary + first paragraph + h2 section headers as the
//      "article centroid" (see contradiction-scout.mjs for the why).
//
// Design notes:
//   - Embedding is CPU-only by default. bge-small-en-v1.5 is ~33M params;
//     ~80-120 passages/sec on the HF Space's free CPU. Full backfill of
//     9k passages = ~90 seconds. 100k passages = ~15 minutes.
//   - Batch size 64 is a sweet spot for bge-small ONNX on CPU.
//   - This script is idempotent — re-run it after any ingest and it
//     embeds only the deltas. Safe to put on a cron.
//   - The script NEVER writes to botnet/data/botnet.db. The graph DB at
//     data/graph.db is the only thing it touches.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import yaml from 'js-yaml';
// import Database from 'better-sqlite3';          // <-- uncomment when installed
// import * as sqliteVec from 'sqlite-vec';        // <-- uncomment when installed
// import { pipeline } from '@xenova/transformers';// <-- uncomment when installed

// ─────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────
const ROOT       = '/Volumes/EOS_DIGITAL/KiriPedia';
const SOURCES    = join(ROOT, 'src/content/sources');
const ARTICLES   = join(ROOT, 'src/content/articles');
const GRAPH_DB   = join(ROOT, 'data/graph.db');
const MODEL_ID   = 'Xenova/bge-small-en-v1.5';
const EMBED_DIM  = 384;
const BATCH_SIZE = 64;

// ─────────────────────────────────────────────────────────────────────
// 1. Source-MD parser — matches the normalize-vtt.mjs output exactly.
// ─────────────────────────────────────────────────────────────────────
const TS_LINE = /^\[(\d{1,2}:)?\d{1,2}:\d{2}\]\s+/;

function tsToSec(ts) {
  // 'MM:SS' or 'H:MM:SS' -> seconds
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export function parseSourceMd(path) {
  const raw = readFileSync(path, 'utf8');
  const fm  = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = fm ? yaml.load(fm[1]) : {};
  const body = fm ? raw.slice(fm[0].length) : raw;

  const passages = [];
  let ord = 0;
  for (const block of body.split(/\n\s*\n/)) {
    const m = block.match(/^\[((?:\d{1,2}:)?\d{1,2}:\d{2})\]\s+([\s\S]*)$/);
    if (!m) continue;
    const start_ts  = m[1];
    const text      = m[2].replace(/\s+/g, ' ').trim();
    if (!text) continue;
    passages.push({
      source_slug: meta.slug || basename(path, '.md'),
      ord,
      start_ts,
      start_sec: tsToSec(start_ts),
      text,
      token_count: Math.ceil(text.length / 4),
    });
    ord++;
  }
  // Fill end_ts/end_sec from the next passage
  for (let i = 0; i < passages.length - 1; i++) {
    passages[i].end_ts  = passages[i + 1].start_ts;
    passages[i].end_sec = passages[i + 1].start_sec;
  }
  return { meta, passages };
}

// ─────────────────────────────────────────────────────────────────────
// 2. Article centroid extractor — title + summary + first paragraph + h2s.
// Rationale in evaluations/04-knowledge-graph.md §"Article embedding strategy".
// ─────────────────────────────────────────────────────────────────────
export function extractArticleCentroidText(path) {
  const raw = readFileSync(path, 'utf8');
  const fm  = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = fm ? yaml.load(fm[1]) : {};
  const body = fm ? raw.slice(fm[0].length) : raw;

  // Strip MDX imports / JSX tags for a cleaner signal.
  const clean = body
    .replace(/^import\s+.+$/gm, '')
    .replace(/<Cite[^/]*\/>/g, '')
    .replace(/<\/?[A-Z][^>]*>/g, '');

  const firstPara = clean.split(/\n\s*\n/).find(p => p.trim().length > 40) || '';
  const h2s       = [...clean.matchAll(/^##\s+(.+)$/gm)].map(m => m[1]).join('. ');

  return [
    meta.title || '',
    meta.summary || '',
    firstPara,
    h2s,
  ].filter(Boolean).join('\n\n').slice(0, 2000); // bge-small max seq is 512 tokens (~2000 chars)
}

// ─────────────────────────────────────────────────────────────────────
// 3. Embed batch — wrapped so a CI run without deps can dry-run.
// ─────────────────────────────────────────────────────────────────────
let _embedder = null;
async function getEmbedder() {
  if (_embedder) return _embedder;
  // const { pipeline } = await import('@xenova/transformers');
  // _embedder = await pipeline('feature-extraction', MODEL_ID, { quantized: true });
  throw new Error('@xenova/transformers not installed. npm i @xenova/transformers');
}

async function embedBatch(texts) {
  const embedder = await getEmbedder();
  // bge-small-en-v1.5 expects a query prefix on *queries*, no prefix on
  // *passages*. Passages get nothing; articles get nothing. (See README.)
  const out = await embedder(texts, { pooling: 'cls', normalize: true });
  // out.data is a Float32Array of length texts.length * 384
  const vectors = [];
  for (let i = 0; i < texts.length; i++) {
    vectors.push(Array.from(out.data.slice(i * EMBED_DIM, (i + 1) * EMBED_DIM)));
  }
  return vectors;
}

// ─────────────────────────────────────────────────────────────────────
// 4. Main runner.
// ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[embed-passages] root=${ROOT}`);
  console.log(`[embed-passages] model=${MODEL_ID} dim=${EMBED_DIM}`);

  /* ─── WHAT THIS BLOCK WILL DO ONCE DEPS ARE WIRED ───────────────────
  const db = new Database(GRAPH_DB);
  sqliteVec.load(db);
  // ensure virtual vec table exists
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS passage_embeddings
      USING vec0(passage_id INTEGER PRIMARY KEY, embedding FLOAT[${EMBED_DIM}]);
    CREATE VIRTUAL TABLE IF NOT EXISTS article_embeddings
      USING vec0(rowid INTEGER PRIMARY KEY, embedding FLOAT[${EMBED_DIM}]);
  `);

  // — upsert passages —
  const upsertPassage = db.prepare(`
    INSERT INTO transcript_passages
      (recording_id, source_slug, ord, start_ts, end_ts, start_sec, end_sec, text, token_count)
    VALUES (@recording_id, @source_slug, @ord, @start_ts, @end_ts, @start_sec, @end_sec, @text, @token_count)
    ON CONFLICT(source_slug, ord) DO UPDATE SET
      text = excluded.text,
      end_ts = excluded.end_ts,
      end_sec = excluded.end_sec,
      token_count = excluded.token_count
    RETURNING passage_id;
  `);
  const needsEmbed = db.prepare(`
    SELECT p.passage_id, p.text
      FROM transcript_passages p
      LEFT JOIN passage_embedding_meta m ON m.passage_id = p.passage_id
     WHERE m.passage_id IS NULL
       OR m.model_version != ?
  `);
  const insertVec  = db.prepare(`INSERT OR REPLACE INTO passage_embeddings (passage_id, embedding) VALUES (?, ?)`);
  const insertMeta = db.prepare(`INSERT OR REPLACE INTO passage_embedding_meta (passage_id, model, model_version, dim) VALUES (?, ?, ?, ?)`);

  const sourceFiles = readdirSync(SOURCES).filter(f => f.endsWith('.md') && !f.endsWith('.sponsors.md'));
  for (const f of sourceFiles) {
    const { meta, passages } = parseSourceMd(join(SOURCES, f));
    const recId = meta.videoId || meta.slug;  // placeholder until Fingerprinter exists
    db.prepare(`INSERT OR IGNORE INTO recordings (recording_id, canonical_slug, title, show, recorded_date, duration_sec, caption_source)
                VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(recId, meta.slug, meta.title, meta.show, meta.date, null, meta.captionSource);
    for (const p of passages) {
      upsertPassage.run({ ...p, recording_id: recId });
    }
  }

  // — embed in batches —
  const todo = needsEmbed.all(MODEL_VERSION);
  console.log(`[embed-passages] ${todo.length} passages need embeddings`);
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const vecs  = await embedBatch(batch.map(r => r.text));
    db.transaction(() => {
      for (let j = 0; j < batch.length; j++) {
        insertVec .run(batch[j].passage_id, Buffer.from(new Float32Array(vecs[j]).buffer));
        insertMeta.run(batch[j].passage_id, 'bge-small-en-v1.5', MODEL_VERSION, EMBED_DIM);
      }
    })();
    console.log(`  embedded ${i + batch.length}/${todo.length}`);
  }

  // — article centroids (similar pattern, omitted for brevity) —

  db.close();
  ─────────────────────────────────────────────────────────────────── */

  // Dry-run: parse everything, report counts.
  let totalPassages = 0;
  let totalChars    = 0;
  const sourceFiles = readdirSync(SOURCES).filter(f => f.endsWith('.md') && !f.endsWith('.sponsors.md'));
  for (const f of sourceFiles) {
    const { passages } = parseSourceMd(join(SOURCES, f));
    totalPassages += passages.length;
    for (const p of passages) totalChars += p.text.length;
  }
  const totalArticles = readdirSync(ARTICLES).filter(f => f.endsWith('.mdx')).length;
  console.log(`[embed-passages] dry-run:`);
  console.log(`  sources:          ${sourceFiles.length}`);
  console.log(`  passages:         ${totalPassages}`);
  console.log(`  avg chars/passage: ${Math.round(totalChars / totalPassages)}`);
  console.log(`  total chars:      ${totalChars}`);
  console.log(`  articles:         ${totalArticles}`);
  console.log(`  est storage:      ${((totalPassages + totalArticles) * EMBED_DIM * 4 / 1e6).toFixed(1)} MB (float32, no quantization)`);
  console.log(`  est embed time:   ${(totalPassages / 100).toFixed(0)} s @ 100 passages/sec`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
