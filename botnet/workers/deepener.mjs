#!/usr/bin/env node
// Transcript Deepener. Picks ONE article per invocation with the widest gap
// between transcript mentions and existing <Cite/> coverage, then drafts
// citation-augmented prose for the body.
//
// Selection: rank by (transcript_mention_count - cite_count_in_article).
// Highest delta wins — that's the article most under-cited relative to the
// volume of corpus material that could support it.
//
// LLM-optional: if no Cerebras/Groq keys are configured the worker logs the
// pick, emits the activity events, and exits cleanly. The cycle keeps moving.
//
// Run: node botnet/workers/deepener.mjs [--batch N]

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';
import { worker_reasoning, worker_longcontext } from '../lib/fleet-client.mjs';
import { lastWorked, markWorked } from '../lib/last-worked.mjs';
import { arg, intArg } from '../lib/argv.mjs';
import { marchingOrdersFor } from '../lib/marching-orders.mjs';
import { drainBriefs } from '../lib/brief-runner.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');

const WORKER = arg('--worker', 'deepener-1');
const ROLE = 'deepener';
const BATCH = intArg('--batch', 1);

// Title-cased phrase for log voice. "abu-zubaydah-capture" → "Abu Zubaydah Capture".
const humanize = s => s.replace(/-\d{4}$/, '').split('-').map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' ');

function shellQuote(s) {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function mentionCount(slug) {
  // Slug terms = the non-trivial words from the slug.
  const terms = slug.split('-').filter(t => t.length >= 4);
  if (terms.length === 0) return 0;
  let total = 0;
  for (const term of terms) {
    try {
      const out = execSync(
        `grep -ric ${shellQuote(term)} ${shellQuote(SOURCES_DIR)} || true`,
        { encoding: 'utf8' }
      ).trim();
      // grep -rc emits "<path>:<n>" per file; we summed via -c with one path.
      const n = parseInt(out, 10);
      if (!Number.isNaN(n)) total += n;
    } catch { /* non-fatal */ }
  }
  return total;
}

function citeCount(body) {
  const m = body.match(/<Cite\s/g);
  return m ? m.length : 0;
}

const COOLDOWN_SEC = 30 * 60; // 30m — June–July push: shelf must be walked often
// Use a sidecar JSON instead of file mtime, because mtime is "clone time"
// after an HF Space cold-start and would lock out every article.

function pickArticle(exclude = new Set()) {
  const nowSec = Math.floor(Date.now() / 1000);
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
  const candidates = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    if (exclude.has(slug)) continue;
    if (nowSec - lastWorked(slug, ROLE) < COOLDOWN_SEC) continue;
    const path = join(ARTICLES_DIR, f);
    let body;
    try { body = readFileSync(path, 'utf8'); } catch { continue; }
    const mentions = mentionCount(slug);
    const cites = citeCount(body);
    const delta = mentions - cites;
    if (delta <= 0) continue; // no gap to fill
    candidates.push({ slug, path, body, mentions, cites, delta });
  }
  candidates.sort((a, b) => b.delta - a.delta || a.cites - b.cites);
  return candidates[0] || null;
}

const SYSTEM = `${marchingOrdersFor('deepener')}

You are the Transcript Deepener for KiriPedia, a Wikipedia-style wiki of John Kiriakou's video appearances. Your job is NOT cosmetic citation plumbing. Your job is to make the article *denser and more complete* using material the transcripts already contain. An article that lost a paragraph of real fact to you is an article you failed.

You receive ONE article body and a list of corpus excerpts (with source slug + timestamp).

Produce TWO outputs:

(A) **prose_additions** — the main event. Walk the excerpts. For every substantive fact, named entity, date, dollar figure, quote, place, or causal link that belongs in this article but is NOT yet in the body, draft a new sourced paragraph and emit it. Each addition has:
  - anchor: a verbatim ≥20-char substring from the existing body marking WHERE the new paragraph should be inserted (right after this anchor). Pick an anchor whose surrounding context flows into your new paragraph.
  - paragraph: a fully encyclopedic paragraph in KiriPedia voice — third person, declarative, no "Kiriakou says," no "according to," no "in an interview." Wikilink proper nouns with [Name](/wiki/slug) only if a slug seems obvious; otherwise leave plain. Preserve direct quotes verbatim, italicised as *"like this"*. The paragraph MUST end with at least one <Cite s="source_slug" t="M:SS" /> tag drawn from the excerpts. Use multiple <Cite/> tags inline when multiple transcripts corroborate the same fact ("the same story across 5 podcasts = 5 cites").

(B) **insertions** — pure footnote attachments for claims already in the body that the excerpts support but lack a cite. Each: anchor substring + source_slug + timestamp.

Doctrine:
- ONLY use material that the excerpts verbatim support. Never invent timestamps, slugs, dates, names, dollar figures, or quotes.
- Mirror Kiriakou's discretion — if he calls someone "an asset called Mahmud," you do too.
- Present contradictions; do not reconcile them. If two transcripts disagree on a date or number, surface both with separate cites.
- Prefer 1–4 strong prose_additions over a long list of trivial insertions. Density beats decoration.
- Do not duplicate paragraphs already in the body. Skim before drafting.
- If the body is already dense and the excerpts add nothing, return empty arrays. Silence is honest.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['insertions', 'prose_additions'],
  properties: {
    insertions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['anchor', 'source_slug', 'timestamp'],
        properties: {
          anchor: { type: 'string', minLength: 8, maxLength: 240 },
          source_slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          timestamp: { type: 'string', pattern: '^\\d{1,2}:\\d{2}(?::\\d{2})?$' },
        },
      },
    },
    prose_additions: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['anchor', 'paragraph'],
        properties: {
          anchor: { type: 'string', minLength: 20, maxLength: 240 },
          paragraph: { type: 'string', minLength: 80, maxLength: 2400 },
        },
      },
    },
  },
};

async function run(pick) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Opened ${humanize(pick.slug)} — looking for facts that need footnotes.` });
  console.log(`[${WORKER}] picked ${pick.slug} (mentions=${pick.mentions}, cites=${pick.cites}, delta=${pick.delta})`);

  // Pull a handful of supporting excerpts for the LLM.
  const slugTerm = pick.slug.split('-').filter(t => t.length >= 4)[0] || pick.slug;
  let excerpts = '';
  try {
    excerpts = execSync(
      `grep -rn --include='*.md' ${shellQuote(slugTerm)} ${shellQuote(SOURCES_DIR)} | head -40 || true`,
      { encoding: 'utf8' }
    );
  } catch { /* non-fatal */ }

  let result;
  try {
    try {
      result = await worker_reasoning({
        system: SYSTEM,
        user: `ARTICLE (${pick.slug}):\n\n${pick.body.slice(0, 12_000)}\n\nCORPUS EXCERPTS (sample):\n\n${excerpts.slice(0, 8_000)}`,
        schema: SCHEMA,
        maxTokens: 8000,
      });
    } catch {
      result = await worker_longcontext({
        system: SYSTEM,
        user: `ARTICLE (${pick.slug}):\n\n${pick.body.slice(0, 12_000)}\n\nCORPUS EXCERPTS (sample):\n\n${excerpts.slice(0, 8_000)}`,
        schema: SCHEMA,
        maxTokens: 8000,
      });
    }
  } catch (err) {
    console.warn(`[${WORKER}] all LLM paths failed (${err.message.slice(0, 120)}); skipping`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Set ${humanize(pick.slug)} aside — will retry next cycle.`, refKind: 'article', refId: pick.slug,
                  handoffTo: 'coordinator' });
    return;
  }

  // Apply insertions idempotently: only add a Cite if not already adjacent.
  let body = pick.body;
  let added = 0;
  for (const ins of (result.insertions || [])) {
    const tag = `<Cite s="${ins.source_slug}" t="${ins.timestamp}" />`;
    const at = body.indexOf(ins.anchor);
    if (at < 0) continue;
    const tail = body.slice(at + ins.anchor.length, at + ins.anchor.length + 200);
    if (tail.includes(tag)) continue;
    body = body.slice(0, at + ins.anchor.length) + ' ' + tag + body.slice(at + ins.anchor.length);
    added++;
  }

  // Apply prose_additions: drop a new sourced paragraph right after the
  // anchor's containing paragraph. Idempotent on the first 60 chars of the
  // new paragraph (so a re-run that produces the same prose doesn't double).
  let prose = 0;
  for (const add of (result.prose_additions || [])) {
    const para = (add.paragraph || '').trim();
    if (para.length < 80) continue;
    if (!/<Cite\s+s="[a-z0-9-]+"\s+t="\d{1,2}:\d{2}(?::\d{2})?"\s*\/>/.test(para)) continue; // must carry a cite
    const fingerprint = para.slice(0, 60);
    if (body.includes(fingerprint)) continue;
    const at = body.indexOf(add.anchor);
    if (at < 0) continue;
    // Insert at end of the anchor's enclosing paragraph (next blank line, or eof).
    const after = at + add.anchor.length;
    const nextBlank = body.indexOf('\n\n', after);
    const insertAt = nextBlank < 0 ? body.length : nextBlank;
    body = body.slice(0, insertAt) + '\n\n' + para + body.slice(insertAt);
    prose++;
  }

  if (added > 0 || prose > 0) {
    writeFileSync(pick.path, body);
  }

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Added ${prose} new sourced paragraphs and ${added} footnotes to ${humanize(pick.slug)}.`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: +${prose} prose, +${added} cites`);
}

// PHASE 2: drain deepener briefs first. scope: { slug }
const touched = new Set();
const briefDrain = await drainBriefs({
  role: 'deepener',
  workerId: WORKER,
  max: BATCH,
  handler: async ({ scope }) => {
    if (!scope.slug) throw new Error('brief scope missing slug');
    const path = join(ARTICLES_DIR, `${scope.slug}.mdx`);
    let body;
    try { body = readFileSync(path, 'utf8'); } catch { throw new Error(`article not found: ${scope.slug}`); }
    const mentions = mentionCount(scope.slug);
    const cites = citeCount(body);
    const pick = { slug: scope.slug, path, body, mentions, cites, delta: mentions - cites };
    touched.add(scope.slug);
    markWorked(scope.slug, ROLE);
    await run(pick);
    return { result: { slug: scope.slug, mentions, cites }, filesChanged: [path] };
  },
});

for (let i = briefDrain.done + briefDrain.failed; i < BATCH; i++) {
  const pick = pickArticle(touched);
  if (!pick) {
    if (i === 0) {
      logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                    detail: 'Swept the article shelf — every gap was already filled this round.',
                    handoffTo: 'coordinator' });
    }
    break;
  }
  touched.add(pick.slug);
  markWorked(pick.slug, ROLE);
  await run(pick);
}
