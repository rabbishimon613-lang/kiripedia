#!/usr/bin/env node
// Reweaver. Turns "pile of rags" articles (multi-pass enrichment dumps
// with no narrative spine) into unified tapestries — under a hard
// citation-preservation constraint.
//
// Scope: 800-2500 word articles (Weaver owns smaller; the very-largest
// are usually already cohesive and FA-class).
//
// Rag-pile signal: bullet density, micro-section count, low coherence.
//
// Cite preservation: every <Cite/> tag that existed in the input must
// exist in the output. Drop one → reject.
//
// LLM-optional: if no keys, skips cleanly.
//
// Run: node botnet/workers/reweaver.mjs [--batch N]

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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
const WORKER = args[args.indexOf('--worker') + 1] || 'reweaver';
const ROLE = 'reweaver';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 1;
const COOLDOWN_SEC = 14 * 24 * 60 * 60; // 14d — heavy rewrites don't re-stage
const MIN_SIZE = 4000;   // ~800 words
const MAX_SIZE = 12500;  // ~2500 words

function shellQuote(s) {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function extractCites(body) {
  return [...body.matchAll(/<Cite\s+[^/]*\/>/g)].map(m => m[0]);
}

function ragScore(body) {
  // Cheap signal for "pile of rags":
  //   bullet density + many micro-H2s + multiple recent enrichment markers
  const lines = body.split('\n');
  const bullets = lines.filter(l => /^\s*[-*]\s/.test(l)).length;
  const h2Lines = lines.filter(l => /^##\s/.test(l));
  const seeAlsoIdx = lines.findIndex(l => /^## See also$/i.test(l));
  const proseLines = lines.filter(l => l.trim() && !/^[#-*>|]/.test(l) && !/^\s*\d+\.\s/.test(l)).length;
  const bulletRatio = proseLines > 0 ? bullets / proseLines : bullets;
  const microSections = h2Lines.length > 0 && (seeAlsoIdx >= 0 ? h2Lines.length - 1 : h2Lines.length) >= 4
    ? h2Lines.length : 0;
  return Math.round(bulletRatio * 100) + microSections * 5;
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
    let size, body;
    try {
      size = statSync(path).size;
      if (size < MIN_SIZE || size > MAX_SIZE) continue;
      body = readFileSync(path, 'utf8');
    } catch { continue; }
    const score = ragScore(body);
    if (score < 8) continue; // not raggy enough
    const cites = extractCites(body).length;
    candidates.push({ slug, path, size, score, cites, body });
  }
  // Highest rag score first; ties broken by more citations (more material to weave).
  candidates.sort((a, b) => b.score - a.score || b.cites - a.cites);
  return candidates[0] || null;
}

const SYSTEM = `You are the Reweaver for KiriPedia, a Wikipedia-style wiki of John Kiriakou's video appearances.

You receive ONE article body that has been heavily enriched and is now a pile of bullet lists, micro-sections, and disjointed prose. Rewrite it into a unified narrative tapestry of 1200-2200 words in encyclopedic third-person voice.

HARD CONSTRAINTS (rejection if violated):
- Every <Cite ... /> tag in the input MUST appear in the output, verbatim. You may move them; you may not drop any or alter their attributes.
- Output is a complete MDX body (no frontmatter).
- No "Kiriakou said", "according to John", "He recalls/notes/explained" attribution prose. Sourcing is invisible via the citations.
- Mirror Kiriakou's discretion: if the input redacts a name or country, do not de-redact.
- No bullet lists in body prose. Bullets are allowed only in a "## See also" tail section.

Section structure: a small spine of 3-5 H2 headers based on the natural topics of the article. No micro-sections (every H2 has at least one full paragraph).

Output must be substantially longer and more coherent than the input. Preserve every named person, dollar figure, date, weapon model, and direct quote.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['body'],
  properties: {
    body: { type: 'string', minLength: 1500, maxLength: 30_000 },
  },
};

async function run(pick) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Reweaving ${pick.slug} (size=${pick.size}b, rag=${pick.score}, cites=${pick.cites})` });
  console.log(`[${WORKER}] picked ${pick.slug} (size=${pick.size}b, rag=${pick.score}, cites=${pick.cites})`);

  const fmMatch = pick.body.match(/^---\n[\s\S]*?\n---\n/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  const body = fmMatch ? pick.body.slice(fmMatch[0].length) : pick.body;

  const inputCites = extractCites(body);
  const inputCiteSet = new Set(inputCites);

  // Pull corpus excerpts to give the LLM more raw material than the input alone.
  const slugTerm = pick.slug.split('-').filter(t => t.length >= 4)[0] || pick.slug;
  let excerpts = '';
  try {
    excerpts = execSync(
      `grep -rnB1 -A4 --include='*.md' ${shellQuote(slugTerm)} ${shellQuote(SOURCES_DIR)} | head -200 || true`,
      { encoding: 'utf8' }
    );
  } catch {}

  let result;
  try {
    result = await worker_longcontext({
      system: SYSTEM,
      user: `EXISTING RAG-PILE BODY (${pick.slug}):\n\n${body}\n\nCORPUS EXCERPTS:\n\n${excerpts.slice(0, 35_000)}`,
      schema: SCHEMA,
      maxTokens: 8000,
    });
  } catch (err) {
    console.warn(`[${WORKER}] LLM unavailable (${err.message.slice(0, 120)}); skipping reweave`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Skipped ${pick.slug} (no LLM)`, handoffTo: 'coordinator' });
    return;
  }

  const newBody = (result.body || '').trim();
  // Hard preservation check.
  const outputCites = extractCites(newBody);
  const outputCiteSet = new Set(outputCites);
  const missing = [...inputCiteSet].filter(c => !outputCiteSet.has(c));
  if (missing.length > 0) {
    console.warn(`[${WORKER}] reweave dropped ${missing.length}/${inputCites.length} citations; rejecting`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Reweave rejected for ${pick.slug} (lost ${missing.length} cites)`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }
  if (newBody.length < body.length * 1.1) {
    console.warn(`[${WORKER}] reweave didn't grow body enough (${body.length} → ${newBody.length}); rejecting`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Reweave rejected for ${pick.slug} (insufficient growth)`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  writeFileSync(pick.path, frontmatter + newBody + '\n');

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Rewove ${pick.slug} (${body.length} → ${newBody.length} chars, ${inputCites.length} cites preserved)`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: ${body.length} → ${newBody.length} chars, ${inputCites.length} cites preserved`);
}

const touched = new Set();
for (let i = 0; i < BATCH; i++) {
  const pick = pickArticle(touched);
  if (!pick) {
    if (i === 0) {
      logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                    detail: 'No rag-pile candidates (all on cooldown or below threshold)',
                    handoffTo: 'coordinator' });
    }
    break;
  }
  touched.add(pick.slug);
  markWorked(pick.slug, ROLE);
  await run(pick);
}
