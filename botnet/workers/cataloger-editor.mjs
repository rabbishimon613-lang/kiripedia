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

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');

const args = process.argv.slice(2);
const WORKER = args[args.indexOf('--worker') + 1] || 'cataloger-1';
const ROLE = 'cataloger';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 2;
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

const SYSTEM = `You are the Cataloger-Editor for KiriPedia, a Wikipedia-style wiki of John Kiriakou's publicly available video appearances.

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

async function catalogOne(clip) {
  const sourcePath = join(REPO_ROOT, clip.source_path);
  const text = readFileSync(sourcePath, 'utf8');

  // Strip frontmatter
  const body = text.replace(/^---[\s\S]*?---\n/, '');
  const existingSlugSet = existingSlugs();

  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Cataloging ${clip.slug}`, refKind: 'clip', refId: clip.video_id });

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

  db.prepare(`UPDATE clips SET status='catalogued', worker=NULL, worker_since=NULL WHERE video_id=?`)
    .run(clip.video_id);

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `${totalClaims} claims from ${clip.slug}`,
                refKind: 'clip', refId: clip.video_id, handoffTo: 'reviewer' });
  return totalClaims;
}

let ok = 0, fail = 0;
for (let i = 0; i < BATCH; i++) {
  const clip = claimNextClip({ status: 'transcribed', worker: WORKER });
  if (!clip) break;
  try {
    await catalogOne(clip);
    ok++;
  } catch (err) {
    console.error(`[${WORKER}] error:`, err.message);
    releaseClip(clip.video_id); // retry later
    fail++;
  }
}
console.log(`[${WORKER}] catalogued=${ok} failed=${fail}`);
