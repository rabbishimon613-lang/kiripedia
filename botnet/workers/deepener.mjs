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
import { worker_reasoning } from '../lib/fleet-client.mjs';
import { lastWorked, markWorked } from '../lib/last-worked.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');

const args = process.argv.slice(2);
const WORKER = args[args.indexOf('--worker') + 1] || 'deepener';
const ROLE = 'deepener';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 1;

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

const COOLDOWN_SEC = 2 * 60 * 60; // 2h — don't re-touch within this window
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

const SYSTEM = `You are the Transcript Deepener for KiriPedia, a Wikipedia-style wiki of John Kiriakou's video appearances.

You receive ONE article body and a list of corpus excerpts (with source slug + timestamp). Your job: identify substantive uncited claims in the article that the excerpts support, and emit a list of citation insertions. Each insertion: the exact substring of the article to anchor on, plus the <Cite s="..." t="..."/> tag to place immediately after it.

Doctrine: only cite if the excerpt verbatim supports the claim. If unsure, omit. Never invent timestamps. Never paraphrase the article — only annotate.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['insertions'],
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
    result = await worker_reasoning({
      system: SYSTEM,
      user: `ARTICLE (${pick.slug}):\n\n${pick.body.slice(0, 12_000)}\n\nCORPUS EXCERPTS (sample):\n\n${excerpts.slice(0, 8_000)}`,
      schema: SCHEMA,
      maxTokens: 3000,
    });
  } catch (err) {
    console.warn(`[${WORKER}] LLM unavailable (${err.message.slice(0, 120)}); skipping deepen pass`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Set ${humanize(pick.slug)} aside — pen ran dry.`, refKind: 'article', refId: pick.slug,
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
  if (added > 0) {
    writeFileSync(pick.path, body);
  }

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Pinned ${added} new footnotes onto ${humanize(pick.slug)}.`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: +${added} cites`);
}

const touched = new Set();
for (let i = 0; i < BATCH; i++) {
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
