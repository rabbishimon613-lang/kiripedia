#!/usr/bin/env node
// Re-Reader — Engine 2 of the team. Walks old transcripts under a new lens.
//
// Every passage carries a stamp: the article_set_hash it was last evaluated
// under. When the hash flips, the stamp is stale and the passage is eligible
// to be re-read. The Re-Reader emits one of four verdicts per passage:
//
//   spawn_article | amend_article | tier_c_track | rejected
//
// Doctrine lives in prompts/re-reader.md.
// Runs from a brief (scope.source_slug). Falls back to walking stale sources
// when no brief is pending.
//
// Run: node botnet/workers/re-reader.mjs [--worker re-reader-1] [--batch N]

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import { worker_longcontext, worker_reasoning } from '../lib/fleet-client.mjs';
import { arg, intArg } from '../lib/argv.mjs';
import { articleSetHash, bumpHash } from '../lib/hash.mjs';
import { drainBriefs } from '../lib/brief-runner.mjs';
import * as briefs from '../lib/briefs.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const PROMPT_PATH = join(REPO_ROOT, 'prompts', 're-reader.md');

const WORKER = arg('--worker', 're-reader-1');
const ROLE = 're-reader';
const BATCH = intArg('--batch', 3);
const PROMPT_VERSION = 're-reader@2026-06-27';

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdicts'],
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['passage_idx', 'verdict', 'target_slug', 'entity', 'rationale', 'verbatim'],
        properties: {
          passage_idx: { type: 'integer', minimum: 0 },
          verdict: { type: 'string', enum: ['spawn_article', 'amend_article', 'tier_c_track', 'rejected'] },
          target_slug: { type: ['string', 'null'] },
          entity: { type: ['string', 'null'] },
          rationale: { type: 'string', minLength: 5, maxLength: 400 },
          verbatim: { type: ['string', 'null'] },
        },
      },
    },
  },
};

function readPrompt() {
  try { return readFileSync(PROMPT_PATH, 'utf8'); }
  catch { return '# Re-Reader\n(prompt file missing)'; }
}

function existingSlugSample() {
  return readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.slice(0, -4));
}

// Pull paragraph-timestamped passages out of a source MD file.
function parsePassages(text) {
  // Strip frontmatter
  const body = text.replace(/^---[\s\S]*?---\n/, '');
  // Split on [h:mm] or [hh:mm:ss] markers.
  const re = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s+/g;
  const passages = [];
  let m, last = null;
  while ((m = re.exec(body)) !== null) {
    if (last) {
      passages.push({ ts: last.ts, text: body.slice(last.end, m.index).trim() });
    }
    last = { ts: m[1], end: re.lastIndex };
  }
  if (last) passages.push({ ts: last.ts, text: body.slice(last.end).trim() });
  return passages.filter(p => p.text.length > 30);
}

function passageId(sourceSlug, ts) { return `${sourceSlug}@${ts}`; }

function staleSources(currentHash, limit) {
  // Pick sources where the latest verdict for any of their passages was
  // stamped under a stale hash — OR sources never re-read.
  const rows = db.prepare(`
    SELECT cl.slug AS slug
      FROM clips cl
     WHERE cl.status IN ('catalogued', 'published')
       AND cl.source_path IS NOT NULL
     ORDER BY cl.upload_date DESC
     LIMIT ?
  `).all(limit * 3);
  const out = [];
  for (const r of rows) {
    const hit = db.prepare(`
      SELECT 1 FROM passage_verdicts
       WHERE passage_id LIKE ? AND article_set_hash = ?
       LIMIT 1
    `).get(`${r.slug}@%`, currentHash);
    if (!hit) out.push(r.slug);
    if (out.length >= limit) break;
  }
  return out;
}

const upsertVerdict = db.prepare(`
  INSERT INTO passage_verdicts (passage_id, worker, verdict, reason, article_set_hash, prompt_version)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(passage_id, article_set_hash) DO UPDATE SET
    worker = excluded.worker,
    verdict = excluded.verdict,
    reason = excluded.reason,
    prompt_version = excluded.prompt_version,
    created_at = datetime('now')
`);

async function reReadSource(sourceSlug, hash) {
  // Find the source file. Convention: src/content/sources/<slug>.md
  const path = join(SOURCES_DIR, `${sourceSlug}.md`);
  if (!existsSync(path)) {
    return { skipped: true, reason: `source file missing: ${sourceSlug}.md` };
  }
  const text = readFileSync(path, 'utf8');
  const passages = parsePassages(text);
  if (passages.length === 0) {
    return { skipped: true, reason: 'no passages parsed', written: 0 };
  }

  // Chunk: 8 passages per LLM call. Keeps token use low and verdicts focused.
  const slugs = existingSlugSample().slice(0, 220).join(', ');
  const systemPrompt = readPrompt();
  let written = 0;
  const verdictsAll = [];
  const CHUNK = 8;

  for (let i = 0; i < passages.length; i += CHUNK) {
    const chunk = passages.slice(i, i + CHUNK);
    const numbered = chunk.map((p, idx) => `## passage ${idx}  [${p.ts}]\n${p.text}`).join('\n\n');
    const user = `ARTICLE_SET_HASH: ${hash}\n\nEXISTING SLUGS (partial sample for routing):\n${slugs}\n\nPASSAGES TO EVALUATE:\n\n${numbered}`;

    let out;
    try {
      out = await worker_longcontext({ system: systemPrompt, user, schema: VERDICT_SCHEMA, maxTokens: 4000 });
    } catch (err) {
      try {
        out = await worker_reasoning({ system: systemPrompt, user, schema: VERDICT_SCHEMA, maxTokens: 4000 });
      } catch (err2) {
        console.error(`[${WORKER}] chunk ${i} failed: ${err2.message}`);
        continue;
      }
    }

    let chunkSpawned = false;
    for (const v of (out.verdicts || [])) {
      const passage = chunk[v.passage_idx];
      if (!passage) continue;
      const pid = passageId(sourceSlug, passage.ts);
      upsertVerdict.run(pid, WORKER, v.verdict, v.rationale, hash, PROMPT_VERSION);
      written++;
      if (v.verdict === 'spawn_article') chunkSpawned = true;
      verdictsAll.push({ pid, ...v, ts: passage.ts, sourceSlug });
    }
    // §2.5: bump hash if a spawn_article verdict just landed. Cheap; if no
    // article file landed on disk yet, the hash is unchanged.
    if (chunkSpawned) bumpHash();
  }
  return { written, verdicts: verdictsAll, total: passages.length };
}

async function handleBrief({ scope }) {
  const hash = articleSetHash();
  const slug = scope.source_slug;
  if (!slug) throw new Error('brief scope missing source_slug');
  const r = await reReadSource(slug, hash);
  return {
    result: { source_slug: slug, hash, ...r },
    nextAction: r.written ? null : 'rejected or no passages — nothing further',
  };
}

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: 'Re-Reader walking stale passages under the current lens.' });

// Drain any pending Re-Reader briefs first.
const drained = await drainBriefs({ role: ROLE, workerId: WORKER, handler: handleBrief, max: BATCH });

// Fallback: if no briefs, pick stale sources directly so the engine keeps turning.
let fallbackProcessed = 0, fallbackWritten = 0;
if (drained.done + drained.failed === 0) {
  const hash = articleSetHash();
  const slugs = staleSources(hash, BATCH);
  for (const slug of slugs) {
    try {
      const r = await reReadSource(slug, hash);
      fallbackProcessed++;
      fallbackWritten += r.written || 0;
    } catch (err) {
      console.error(`[${WORKER}] fallback failed on ${slug}: ${err.message}`);
    }
  }
}

const summary = `briefs done=${drained.done} failed=${drained.failed} fallback_sources=${fallbackProcessed} verdicts_written=${fallbackWritten}`;
logActivity({ worker: WORKER, role: ROLE, event: 'finish', detail: `Re-Reader pass complete (${summary}).` });
console.log(`[${WORKER}] ${summary}`);
