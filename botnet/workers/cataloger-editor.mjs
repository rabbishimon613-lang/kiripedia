#!/usr/bin/env node
// Cataloger-Editor (merged). Reads a transcribed source, extracts atomic
// claims AND routes each to a target article slug with an MDX patch — all
// in one structured-output Cerebras call per ~6000-token segment.
//
// Run: node botnet/workers/cataloger-editor.mjs [--worker cataloger-1] [--batch N]

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, claimNextClip, releaseClip, logActivity, quarantine } from '../lib/db.mjs';
import { worker_reasoning } from '../lib/fleet-client.mjs';
import { arg, intArg } from '../lib/argv.mjs';
import { marchingOrdersFor } from '../lib/marching-orders.mjs';
import { lastWorked, markWorked } from '../lib/last-worked.mjs';
import { drainBriefs } from '../lib/brief-runner.mjs';

// June–July push: when no transcribed clips are waiting, walk the oldest
// already-catalogued clip and do a SECOND-PASS extraction. The first pass
// is biased toward headline claims; a second pass with the marching-orders
// directive surfaces hedges, asides, throwaway names — the long tail.
function pickSecondPassClip() {
  const cooldown = 7 * 24 * 60 * 60; // 7d per clip
  const nowSec = Math.floor(Date.now() / 1000);
  const rows = db.prepare(`
    SELECT video_id, slug FROM clips
    WHERE status='catalogued' AND worker IS NULL
    ORDER BY upload_date ASC NULLS LAST
    LIMIT 50
  `).all();
  for (const r of rows) {
    const key = `clip:${r.video_id}`;
    if (nowSec - lastWorked(key, 'cataloger-pass2') < cooldown) continue;
    db.prepare(`UPDATE clips SET worker=?, worker_since=datetime('now') WHERE video_id=?`).run(WORKER, r.video_id);
    markWorked(key, 'cataloger-pass2', nowSec);
    return db.prepare(`SELECT * FROM clips WHERE video_id=?`).get(r.video_id);
  }
  return null;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');

const WORKER = arg('--worker', 'cataloger-1');
const ROLE = 'cataloger';
const BATCH = intArg('--batch', 2);
const SEGMENT_CHARS = 18_000; // ~5k tokens; Cerebras handles up to 128k but smaller = better extraction

// Existing article slugs — used to bias routing toward enrichment over new-article creation.
function existingSlugs() {
  return new Set(
    readdirSync(ARTICLES_DIR)
      .filter(f => f.endsWith('.mdx'))
      .map(f => f.replace(/\.mdx$/, ''))
  );
}

const CLAIM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['claims'],
  properties: {
    claims: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['quote', 'timestamp', 'claim_text', 'article_slug',
                   'is_new_article', 'is_about_kiriakou_himself',
                   'patch_kind', 'named_entities'],
        properties: {
          quote: { type: 'string', minLength: 10, maxLength: 500 },
          timestamp: { type: 'string', pattern: '^\\d{1,2}:\\d{2}(?::\\d{2})?$' },
          claim_text: { type: 'string', minLength: 20, maxLength: 600 },
          article_slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          is_new_article: { type: 'boolean' },
          is_about_kiriakou_himself: { type: 'boolean' },
          patch_kind: { type: 'string', enum: ['body_append', 'new', 'dyk_append', 'events_append'] },
          named_entities: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const SYSTEM = `${marchingOrdersFor('cataloger')}

You are the Cataloger-Editor for KiriPedia, a Wikipedia-style wiki of John Kiriakou's publicly available video appearances.

Your job: read a transcript segment and emit ATOMIC CLAIMS. Each claim has:
  - quote: VERBATIM text from the transcript (copy-paste from the segment; do NOT paraphrase, do NOT clean up)
  - timestamp: the [h:mm:ss] cue immediately preceding the quote
  - claim_text: encyclopedic third-person rephrasing (e.g. "Kiriakou described X as Y")
  - article_slug: kebab-case slug of the target wiki article
  - is_new_article: true if the slug is not in the existing slug list provided
  - is_about_kiriakou_himself: true if the claim is biographical (Kiriakou's own life)
  - patch_kind: 'body_append' (default, adds prose), 'events_append' (only for explicit YYYY-MM-DD dates Kiriakou utters), 'new' (whole new stub), or 'dyk_append'
  - named_entities: distinct proper nouns mentioned in the quote

Doctrine rules — VIOLATIONS WILL BE REJECTED DOWNSTREAM:
- The quote MUST appear verbatim in the segment text. If you cannot find the exact phrasing, omit the claim.
- Encyclopedic voice in claim_text: NO "according to Kiriakou", NO "Kiriakou said". Third-person factual prose.
- Prefer enriching existing articles over creating new ones. Use is_new_article=true only when the topic is clearly notable.
- Mirror Kiriakou's discretion: if he hedges or refuses to name someone, do NOT smooth that over.
- One quote = one claim. Don't combine multiple facts.

If the segment has nothing claim-worthy (small talk, sponsor reads, intros), return claims: [].`;

async function catalogSegment({ slug, segment, segmentIdx, existingSlugSet, videoId }) {
  const slugListSample = [...existingSlugSet].slice(0, 200).join(', ');
  const user = `EXISTING ARTICLE SLUGS (partial sample for routing): ${slugListSample}\n\nTRANSCRIPT SEGMENT (source: ${slug}, segment ${segmentIdx}):\n\n${segment}`;

  let out;
  try {
    out = await worker_reasoning({
      system: SYSTEM,
      user,
      schema: CLAIM_SCHEMA,
      maxTokens: 6000,
    });
  } catch (err) {
    console.error(`[${WORKER}] segment ${segmentIdx} failed:`, err.message);
    return [];
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO claims
      (video_id, segment_start, segment_end, quote, claim_text, article_slug,
       is_new_article, is_about_kiriakou_himself, patch_kind, patch_payload, named_entities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let added = 0;
  for (const c of (out.claims || [])) {
    const isNewBool = c.is_new_article && !existingSlugSet.has(c.article_slug);
    const payload = {
      kind: c.patch_kind,
      quote: c.quote,
      timestamp: c.timestamp,
      claim_text: c.claim_text,
      named_entities: c.named_entities,
    };
    const r = insert.run(
      videoId,
      c.timestamp, c.timestamp,
      c.quote, c.claim_text, c.article_slug,
      isNewBool ? 1 : 0,
      c.is_about_kiriakou_himself ? 1 : 0,
      c.patch_kind,
      JSON.stringify(payload),
      JSON.stringify(c.named_entities || []),
    );
    if (r.changes > 0) added++;
  }
  return added;
}

async function catalogOne(clip, { isSecondPass = false } = {}) {
  const sourcePath = join(REPO_ROOT, clip.source_path);
  const text = readFileSync(sourcePath, 'utf8');

  // Strip frontmatter
  const body = text.replace(/^---[\s\S]*?---\n/, '');
  const existingSlugSet = existingSlugs();

  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: isSecondPass
                  ? `Second-pass walk through ${clip.slug} — hunting hedges and asides the first read missed.`
                  : `Cataloging the ${clip.slug} transcript for atomic claims.`,
                refKind: 'clip', refId: clip.video_id });

  // Split into segments by character budget, on paragraph boundaries.
  const segments = [];
  let buf = '';
  for (const para of body.split(/\n\n+/)) {
    if ((buf + '\n\n' + para).length > SEGMENT_CHARS && buf.length > 0) {
      segments.push(buf);
      buf = para;
    } else {
      buf = buf ? buf + '\n\n' + para : para;
    }
  }
  if (buf) segments.push(buf);

  let totalClaims = 0;
  for (let i = 0; i < segments.length; i++) {
    const added = await catalogSegment({
      slug: clip.slug,
      segment: segments[i],
      segmentIdx: i + 1,
      existingSlugSet,
      videoId: clip.video_id,
    });
    totalClaims += added;
  }

  // Second-pass keeps status='catalogued'; first pass advances it.
  if (isSecondPass) {
    db.prepare(`UPDATE clips SET worker=NULL, worker_since=NULL WHERE video_id=?`).run(clip.video_id);
  } else {
    db.prepare(`UPDATE clips SET status='catalogued', worker=NULL, worker_since=NULL WHERE video_id=?`)
      .run(clip.video_id);
  }

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: isSecondPass
                  ? `Second pass on ${clip.slug}: ${totalClaims} additional claims surfaced.`
                  : `Extracted ${totalClaims} claims from ${clip.slug}.`,
                refKind: 'clip', refId: clip.video_id, handoffTo: 'reviewer' });
  return totalClaims;
}

// PHASE 2: drain pending cataloger briefs first.
// Brief scope: { kind: 'first-pass'|'second-pass', video_id, source_slug? }
const briefDrain = await drainBriefs({
  role: 'cataloger',
  workerId: WORKER,
  max: BATCH,
  handler: async ({ scope }) => {
    const isSecondPass = scope.kind === 'second-pass';
    const clip = db.prepare(`SELECT * FROM clips WHERE video_id = ?`).get(scope.video_id);
    if (!clip) throw new Error(`no clip for video_id=${scope.video_id}`);
    if (!clip.source_path) throw new Error(`clip ${scope.video_id} has no source_path`);
    // Take ownership for the duration of the run.
    db.prepare(`UPDATE clips SET worker=?, worker_since=datetime('now') WHERE video_id=?`).run(WORKER, clip.video_id);
    try {
      const added = await catalogOne(clip, { isSecondPass });
      return { result: { video_id: clip.video_id, slug: clip.slug, isSecondPass, claims: added } };
    } catch (err) {
      releaseClip(clip.video_id, isSecondPass ? { newStatus: 'catalogued' } : undefined);
      throw err;
    }
  },
});

// Legacy path: keep the cycle moving when no briefs are pending.
let ok = briefDrain.done, fail = briefDrain.failed, secondPass = 0;
for (let i = ok + fail; i < BATCH; i++) {
  let clip = claimNextClip({ status: 'transcribed', worker: WORKER });
  let isSecondPass = false;
  if (!clip) {
    clip = pickSecondPassClip();
    if (clip) isSecondPass = true;
  }
  if (!clip) break;
  try {
    await catalogOne(clip, { isSecondPass });
    ok++;
    if (isSecondPass) secondPass++;
  } catch (err) {
    console.error(`[${WORKER}] error:`, err.message);
    releaseClip(clip.video_id, isSecondPass ? { newStatus: 'catalogued' } : undefined);
    fail++;
  }
}
console.log(`[${WORKER}] catalogued=${ok} (second-pass=${secondPass}) failed=${fail}`);
