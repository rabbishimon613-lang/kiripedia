#!/usr/bin/env node
// Article Weaver. Picks the thinnest article (fewest paragraphs / smallest
// file) that also has rich corpus coverage (mention count above threshold),
// then rewrites it from stub-grade into Wikipedia-style sectional narrative
// using existing transcript material.
//
// LLM-optional: skips cleanly if no Cerebras/Groq keys.
//
// Run: node botnet/workers/weaver.mjs [--batch N]

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';
import { worker_longcontext } from '../lib/fleet-client.mjs';
import { lastWorked, markWorked } from '../lib/last-worked.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');

const args = process.argv.slice(2);
const WORKER = args[args.indexOf('--worker') + 1] || 'weaver';
const ROLE = 'weaver';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 1;

const humanize = s => s.replace(/-\d{4}$/, '').split('-').map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
// Lowered from 8 → 1: with ~798k transcript words spread across ~63
// transcripts, even a single grep hit means there's corpus material to draw
// on. The old threshold rejected most stubs from ever being woven.
const MENTION_THRESHOLD = 1;
const COOLDOWN_SEC = 4 * 60 * 60; // 4h — weaves are heavy, longer cooldown
// Per panel verdict: Weaver scoped to true stubs only; Reweaver owns the
// 800-2500w "pile of rags" band.
const MAX_SIZE = parseInt(process.env.WEAVER_MAX_SIZE) || 4000; // ~800 words

function shellQuote(s) {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function mentionCount(slug) {
  const terms = slug.split('-').filter(t => t.length >= 4);
  if (terms.length === 0) return 0;
  let total = 0;
  for (const term of terms) {
    try {
      const out = execSync(
        `grep -ric ${shellQuote(term)} ${shellQuote(SOURCES_DIR)} || true`,
        { encoding: 'utf8' }
      ).trim();
      const n = parseInt(out, 10);
      if (!Number.isNaN(n)) total += n;
    } catch { /* non-fatal */ }
  }
  return total;
}

function pickArticle(exclude = new Set()) {
  const nowSec = Math.floor(Date.now() / 1000);
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
  const candidates = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    if (exclude.has(slug)) continue;
    if (nowSec - lastWorked(slug, ROLE) < COOLDOWN_SEC) continue;
    const path = join(ARTICLES_DIR, f);
    let size;
    try { size = statSync(path).size; } catch { continue; }
    if (size > MAX_SIZE) continue; // Reweaver's territory
    const mentions = mentionCount(slug);
    if (mentions < MENTION_THRESHOLD) continue;
    candidates.push({ slug, path, size, mentions });
  }
  // Smallest stub first (biggest growth potential); high mention count breaks ties.
  candidates.sort((a, b) => a.size - b.size || b.mentions - a.mentions);
  return candidates[0] || null;
}

const SYSTEM = `You are the Article Weaver for KiriPedia, a Wikipedia-style wiki of John Kiriakou's video appearances.

You receive ONE article stub plus rich corpus excerpts. Rewrite the article into Wikipedia-style sectional narrative using ONLY material grounded in the excerpts.

Doctrine:
- Encyclopedic third-person voice. No "according to Kiriakou", no "Kiriakou said" (use sparingly only when the source is itself the subject).
- Preserve EVERY existing <Cite/> tag and quote verbatim. Do not invent timestamps.
- Section structure: a small spine of 3-6 H2 headers. No stub sub-stubs.
- Mirror Kiriakou's discretion. If a source hedges, do not smooth that over.
- Output MUST be a complete MDX article body (no frontmatter — that stays intact).`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['body'],
  properties: {
    body: { type: 'string', minLength: 200, maxLength: 30_000 },
  },
};

async function run(pick) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Pulled up ${humanize(pick.slug)} — drafting it from the transcripts.` });
  console.log(`[${WORKER}] picked ${pick.slug} (size=${pick.size}b, mentions=${pick.mentions})`);

  let orig;
  try { orig = readFileSync(pick.path, 'utf8'); } catch {
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Can't get the draft for ${humanize(pick.slug)} open.`, handoffTo: 'coordinator' });
    return;
  }

  // Split frontmatter from body so we only rewrite the body.
  const fmMatch = orig.match(/^---\n[\s\S]*?\n---\n/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  const body = fmMatch ? orig.slice(fmMatch[0].length) : orig;

  // Pull corpus excerpts.
  const slugTerm = pick.slug.split('-').filter(t => t.length >= 4)[0] || pick.slug;
  let excerpts = '';
  try {
    excerpts = execSync(
      `grep -rnB1 -A4 --include='*.md' ${shellQuote(slugTerm)} ${shellQuote(SOURCES_DIR)} | head -200 || true`,
      { encoding: 'utf8' }
    );
  } catch { /* non-fatal */ }

  let result;
  try {
    result = await worker_longcontext({
      system: SYSTEM,
      user: `EXISTING ARTICLE BODY (${pick.slug}):\n\n${body}\n\nCORPUS EXCERPTS:\n\n${excerpts.slice(0, 40_000)}`,
      schema: SCHEMA,
      maxTokens: 6000,
    });
  } catch (err) {
    console.warn(`[${WORKER}] LLM unavailable (${err.message.slice(0, 120)}); skipping weave`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Putting ${humanize(pick.slug)} back in the inbox for now.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  const newBody = (result.body || '').trim();
  if (newBody.length < body.length) {
    console.warn(`[${WORKER}] weave produced shorter body (${newBody.length} < ${body.length}); skipping write`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Threw out my draft of ${humanize(pick.slug)} — came out shorter than I started.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  writeFileSync(pick.path, frontmatter + newBody + '\n');

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Finished ${humanize(pick.slug)}. Grew it from ${body.length} to ${newBody.length} characters.`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: ${body.length} → ${newBody.length} chars`);
}

const touched = new Set();
for (let i = 0; i < BATCH; i++) {
  const pick = pickArticle(touched);
  if (!pick) {
    if (i === 0) {
      logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                    detail: 'Checked every stub — they all got drafted this round.',
                    handoffTo: 'coordinator' });
    }
    break;
  }
  touched.add(pick.slug);
  markWorked(pick.slug, ROLE);
  await run(pick);
}
