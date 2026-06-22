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
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';
import { worker_longcontext } from '../lib/fleet-client.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');

const args = process.argv.slice(2);
const WORKER = args[args.indexOf('--worker') + 1] || 'weaver';
const ROLE = 'weaver';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 1;
const MENTION_THRESHOLD = 8;

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

function pickArticle() {
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
  let best = null;
  let bestSize = Infinity;
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    const path = join(ARTICLES_DIR, f);
    let size;
    try { size = statSync(path).size; } catch { continue; }
    if (size >= bestSize) continue;
    const mentions = mentionCount(slug);
    if (mentions < MENTION_THRESHOLD) continue;
    bestSize = size;
    best = { slug, path, size, mentions };
  }
  return best;
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

async function run() {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: 'Scanning for thin articles with rich coverage' });

  const pick = pickArticle();
  if (!pick) {
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: 'No weaveable articles found', handoffTo: 'coordinator' });
    return;
  }
  console.log(`[${WORKER}] picked ${pick.slug} (size=${pick.size}b, mentions=${pick.mentions})`);

  let orig;
  try { orig = readFileSync(pick.path, 'utf8'); } catch {
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Read failed for ${pick.slug}`, handoffTo: 'coordinator' });
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
                  detail: `Skipped ${pick.slug} (no LLM)`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  const newBody = (result.body || '').trim();
  if (newBody.length < body.length) {
    console.warn(`[${WORKER}] weave produced shorter body (${newBody.length} < ${body.length}); skipping write`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Weave rejected for ${pick.slug} (shrunk)`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  writeFileSync(pick.path, frontmatter + newBody + '\n');

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Wove ${pick.slug} (${body.length} → ${newBody.length} chars)`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: ${body.length} → ${newBody.length} chars`);
}

for (let i = 0; i < BATCH; i++) {
  await run();
}
