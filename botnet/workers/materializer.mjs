#!/usr/bin/env node
// Materializer — the bridge between Engine 2's verdicts and Engine 1's hands.
//
// The Re-Reader stamps a verdict on each transcript passage: spawn_article,
// amend_article, tier_c_track, or rejected. Until this worker existed, those
// verdicts went nowhere — Engine 2 saw work, Engine 1 had no work to do.
//
// What this worker does, in order, per pending verdict:
//
//   1. Resolve passage_id ("source_slug@hh:mm") back to the source MD file
//      and the paragraph at that timestamp. The text we extract IS the quote
//      we'll cite — grounding by construction.
//   2. Look up the clip (video_id) for the source slug.
//   3. In batches, ask Gemini to assign:
//         { target_slug, entity, claim_text, verbatim_quote }
//      For amend: target_slug must be an existing article slug. For spawn:
//      target_slug is a new kebab-case slug. Both get a one-sentence
//      encyclopedic claim_text and a short verbatim_quote snippet.
//   4. Insert one claim row per verdict with status='passed' and patch_kind
//      ('new' for spawn, 'body_append' for amend). The Coordinator's existing
//      commit path picks it up on its next cycle.
//   5. Stamp materialized_at + materialized_claim_id on the verdict so we
//      never double-process.
//
// Run: node botnet/workers/materializer.mjs [--worker materializer-1] [--batch N]

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import { worker_longcontext } from '../lib/fleet-client.mjs';
import { arg, intArg } from '../lib/argv.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');

const WORKER = arg('--worker', 'materializer-1');
const ROLE = 'materializer';
const BATCH = intArg('--batch', 20);
const PROMPT_VERSION = 'materializer@2026-06-29';

// claims.prompt_version is a FK into prompt_versions(hash). Make sure our
// version row exists before the first insert.
db.prepare(`INSERT OR IGNORE INTO prompt_versions (hash, role, doctrine_notes)
            VALUES (?, ?, ?)`)
  .run(PROMPT_VERSION, ROLE, 'Materializer v1: turn Re-Reader spawn/amend verdicts into claims.');

const SLUG_RE = /^[a-z][a-z0-9-]{1,80}[a-z0-9]$/;

// Same parser as the Re-Reader — pull paragraph-timestamped passages.
function parsePassages(text) {
  const body = text.replace(/^---[\s\S]*?---\n/, '');
  const re = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s+/g;
  const passages = [];
  let m, last = null;
  while ((m = re.exec(body)) !== null) {
    if (last) passages.push({ ts: last.ts, text: body.slice(last.end, m.index).trim() });
    last = { ts: m[1], end: re.lastIndex };
  }
  if (last) passages.push({ ts: last.ts, text: body.slice(last.end).trim() });
  return passages.filter(p => p.text.length > 30);
}

function existingSlugs() {
  return readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx')).map(f => f.slice(0, -4));
}

function kebab(s) {
  return s.toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function splitPassageId(pid) {
  const at = pid.lastIndexOf('@');
  if (at < 0) return null;
  return { slug: pid.slice(0, at), ts: pid.slice(at + 1) };
}

function tsToHHMMSS(ts) {
  // Accepts "h:mm", "hh:mm", "h:mm:ss". Returns "hh:mm:ss" for the claims schema.
  const parts = ts.split(':').map(p => p.padStart(2, '0'));
  if (parts.length === 2) parts.push('00');
  return parts.join(':');
}

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: 'Walking pending Re-Reader verdicts and turning them into claims.' });

// ---------------------------------------------------------------------------
// 1. Pull pending spawn/amend verdicts that haven't been materialized yet.
// ---------------------------------------------------------------------------
const pending = db.prepare(`
  SELECT passage_id, verdict, reason
    FROM passage_verdicts
   WHERE verdict IN ('spawn_article', 'amend_article')
     AND materialized_at IS NULL
     AND (materialize_error IS NULL OR materialize_error = '')
   ORDER BY created_at ASC
   LIMIT ?
`).all(BATCH);

if (pending.length === 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'idle',
                detail: 'No pending Re-Reader verdicts to materialize.' });
  console.log('[materializer] nothing to do');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 2. For each verdict, locate the source MD + paragraph + clip.
// ---------------------------------------------------------------------------
const resolved = [];
const cantFind = [];
const slugCache = new Map(); // sourceSlug → { videoId, passagesByTs }

for (const v of pending) {
  const parts = splitPassageId(v.passage_id);
  if (!parts) { cantFind.push({ ...v, reason_missing: 'bad passage_id' }); continue; }

  let cached = slugCache.get(parts.slug);
  if (!cached) {
    const path = join(SOURCES_DIR, `${parts.slug}.md`);
    if (!existsSync(path)) {
      cantFind.push({ ...v, reason_missing: `no source MD: ${parts.slug}` });
      continue;
    }
    const text = readFileSync(path, 'utf8');
    const passages = parsePassages(text);
    const byTs = new Map(passages.map(p => [p.ts, p.text]));
    const clip = db.prepare(`SELECT video_id FROM clips WHERE slug = ?`).get(parts.slug);
    if (!clip) {
      cantFind.push({ ...v, reason_missing: `no clip row: ${parts.slug}` });
      continue;
    }
    cached = { videoId: clip.video_id, passagesByTs: byTs };
    slugCache.set(parts.slug, cached);
  }
  const passageText = cached.passagesByTs.get(parts.ts);
  if (!passageText) {
    cantFind.push({ ...v, reason_missing: `timestamp ${parts.ts} not in source` });
    continue;
  }
  resolved.push({
    passage_id: v.passage_id,
    verdict: v.verdict,
    reason: v.reason,
    source_slug: parts.slug,
    ts: parts.ts,
    video_id: cached.videoId,
    passage_text: passageText,
  });
}

// Mark cant-find verdicts with their error so we don't retry them every cycle.
const markErr = db.prepare(`
  UPDATE passage_verdicts SET materialize_error = ? WHERE passage_id = ?
`);
for (const c of cantFind) markErr.run(c.reason_missing.slice(0, 240), c.passage_id);

if (resolved.length === 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'idle',
                detail: `All ${pending.length} pending verdicts unresolvable; flagged.` });
  console.log(`[materializer] all ${pending.length} unresolvable, flagged with error`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 3. Ask Gemini to assign target_slug + claim_text + verbatim_quote per verdict.
// ---------------------------------------------------------------------------
const existing = new Set(existingSlugs());
const existingList = [...existing].slice(0, 240).join(', ');

const SYSTEM = `You are the Materializer for KiriPedia, an encyclopedic wiki built from John Kiriakou's recorded public statements. The Re-Reader has already evaluated transcript passages and stamped each one with a verdict (spawn_article = passage justifies a brand-new article; amend_article = passage adds material to an existing article). Your job is to convert each verdict into a publishable claim.

For each input verdict object, output:
- target_slug: a kebab-case slug. For verdict="amend_article" the slug MUST be in the EXISTING_SLUGS list. For verdict="spawn_article" the slug MUST NOT already be in EXISTING_SLUGS — invent a new one based on the entity the passage is primarily about.
- entity: the proper-noun subject of the passage (one short noun phrase).
- claim_text: one or two sentences in encyclopedic voice (third person, present tense for ongoing facts, past tense for events). NEVER first person. Begin with the subject — no "According to" / "Kiriakou says" prefixes unless the claim is explicitly hearsay about a third party. The claim_text should add real information to the wiki, not summarize the passage.
- verbatim_quote: a short (10-40 word) literal substring of the PASSAGE_TEXT, picked to support the claim. Must appear character-for-character in PASSAGE_TEXT.

Hard rules:
- Output strict JSON with shape: {"items":[{...}, {...}]}.
- Preserve the input order. One item per input verdict.
- If a passage is too thin to justify a real claim, set claim_text to "" — it will be skipped.
- target_slug uses only [a-z0-9-], no leading/trailing dashes, max 80 chars.`;

// Split resolved into chunks to keep individual LLM calls under a sane size.
const CHUNK = 8;
let materialized = 0;
let spawned = 0;
let amended = 0;
let skipped = 0;
const newSlugsSeen = new Set();

const insertClaim = db.prepare(`
  INSERT INTO claims (
    video_id, segment_start, segment_end, quote, claim_text,
    article_slug, is_new_article, is_about_kiriakou_himself,
    patch_kind, patch_payload, named_entities, status, confidence,
    discretion_status, perspective, prompt_version
  ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'passed', 92, 'passed', 'third', ?)
`);
const markDone = db.prepare(`
  UPDATE passage_verdicts SET materialized_at = datetime('now'), materialized_claim_id = ?
   WHERE passage_id = ?
`);
const markChunkErr = db.prepare(`
  UPDATE passage_verdicts SET materialize_error = ? WHERE passage_id = ?
`);

for (let i = 0; i < resolved.length; i += CHUNK) {
  const chunk = resolved.slice(i, i + CHUNK);
  const user = `EXISTING_SLUGS (subset of ~${existing.size} total):
${existingList}

INPUT VERDICTS (process in order, one output item per input):

${chunk.map((r, idx) => `### verdict ${idx}
verdict_type: ${r.verdict}
reader_reason: ${r.reason || '(none)'}
source_slug: ${r.source_slug}
timestamp: ${r.ts}
passage_text:
"""
${r.passage_text.slice(0, 1400)}
"""`).join('\n\n')}`;

  let out;
  try {
    out = await worker_longcontext({ system: SYSTEM, user, schema: undefined, maxTokens: 4000 });
    // worker_longcontext returns raw text when no schema is supplied.
    // Gemini sometimes wraps JSON in ```json fences — strip those before parsing.
    if (typeof out === 'string') {
      let txt = out.trim();
      const fence = txt.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fence) txt = fence[1].trim();
      const m = txt.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('no JSON object in response');
      out = JSON.parse(m[0]);
    }
  } catch (err) {
    console.error(`[materializer] chunk ${i} failed: ${err.message}`);
    for (const r of chunk) markChunkErr.run(`llm_call_failed: ${err.message}`.slice(0, 240), r.passage_id);
    continue;
  }

  const items = Array.isArray(out?.items) ? out.items : [];
  for (let j = 0; j < chunk.length; j++) {
    const v = chunk[j];
    const it = items[j];
    if (!it) { markChunkErr.run('no_item_returned', v.passage_id); continue; }

    const claim = (it.claim_text || '').trim();
    const slug  = (it.target_slug || '').trim().toLowerCase();
    const entity = (it.entity || '').trim();
    let quote = (it.verbatim_quote || '').trim();

    // Skip rules.
    if (!claim) { markChunkErr.run('skipped:thin_passage', v.passage_id); skipped++; continue; }
    if (!SLUG_RE.test(slug)) { markChunkErr.run(`bad_slug:${slug}`.slice(0, 80), v.passage_id); skipped++; continue; }

    // Spawn/amend consistency check. If the LLM picks an existing slug for a
    // spawn (or a new slug for an amend), trust the slug and rewrite the
    // patch_kind accordingly so we don't double-spawn.
    const slugExists = existing.has(slug) || newSlugsSeen.has(slug);
    const isNew = !slugExists;
    const patchKind = isNew ? 'new' : 'body_append';

    // Quote must actually be in the passage. If not, fall back to first
    // sentence of the passage as the quote so cite tags still point somewhere
    // valid.
    if (!quote || !v.passage_text.includes(quote)) {
      quote = v.passage_text.split(/(?<=[.!?])\s+/)[0].slice(0, 240);
    }

    const tsHHMMSS = tsToHHMMSS(v.ts);
    // Coordinator appends its own <Cite t="..." /> using payload.timestamp,
    // so claim_text here must be plain prose with no embedded cite tag.
    const payload = JSON.stringify({
      timestamp: tsHHMMSS,
      claim_text: claim,
    });

    try {
      const res = insertClaim.run(
        v.video_id, tsHHMMSS, tsHHMMSS, quote, claim,
        slug, isNew ? 1 : 0,
        patchKind, payload, JSON.stringify(entity ? [entity] : []),
        PROMPT_VERSION
      );
      markDone.run(res.lastInsertRowid, v.passage_id);
      if (isNew) { spawned++; newSlugsSeen.add(slug); }
      else amended++;
      materialized++;
    } catch (err) {
      // UNIQUE collision = we've already materialized this exact passage.
      // Mark it done anyway so we don't retry.
      if (/UNIQUE/.test(err.message)) {
        markDone.run(null, v.passage_id);
        skipped++;
      } else {
        markChunkErr.run(`insert_failed:${err.message}`.slice(0, 240), v.passage_id);
      }
    }
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
  detail: `Materialized ${materialized} verdicts → ${spawned} new articles + ${amended} amendments. ${skipped} skipped, ${cantFind.length} unresolvable.` });

console.log(`[materializer] done: materialized=${materialized} spawned=${spawned} amended=${amended} skipped=${skipped} cant_find=${cantFind.length}`);
