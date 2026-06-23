#!/usr/bin/env node
// Prospector. Mines already-ingested transcripts for unmapped material —
// passages where Kiriakou makes substantive claims that no existing article
// cites. Outputs a queue of suggestions: either enrich an existing slug,
// or propose a new slug.
//
// Treats the 88h corpus like fresh intake even though it's already been
// transcribed. The signal: which transcript chunks have ZERO incoming
// <Cite/> references from any article.
//
// LLM-optional: if no keys, skips cleanly.
//
// Run: node botnet/workers/prospector.mjs [--batch N]

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';
import { worker_reasoning } from '../lib/fleet-client.mjs';
import { lastWorked, markWorked } from '../lib/last-worked.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');
const QUEUE_PATH = join(REPO_ROOT, 'public', 'prospector-queue.json');

const args = process.argv.slice(2);
const WORKER = args[args.indexOf('--worker') + 1] || 'prospector';
const ROLE = 'prospector';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 1;
const COOLDOWN_SEC = 6 * 60 * 60; // 6h per transcript

const humanize = s => s.replace(/-\d{4}$/, '').split('-').map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' ');

function shellQuote(s) {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function citeCountForSource(slug) {
  // Count <Cite s="<slug>" .../> across all articles.
  try {
    const out = execSync(
      `grep -roh ${shellQuote(`s="${slug}"`)} ${shellQuote(ARTICLES_DIR)} 2>/dev/null | wc -l`,
      { encoding: 'utf8' }
    ).trim();
    const n = parseInt(out, 10);
    return Number.isNaN(n) ? 0 : n;
  } catch { return 0; }
}

function knownSlugs() {
  return readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''));
}

function pickSource(exclude = new Set()) {
  const nowSec = Math.floor(Date.now() / 1000);
  const files = readdirSync(SOURCES_DIR).filter(f => f.endsWith('.md'));
  const candidates = [];
  for (const f of files) {
    const slug = f.replace(/\.md$/, '');
    if (exclude.has(slug)) continue;
    if (nowSec - lastWorked(slug, ROLE) < COOLDOWN_SEC) continue;
    let body;
    try { body = readFileSync(join(SOURCES_DIR, f), 'utf8'); } catch { continue; }
    const words = body.split(/\s+/).length;
    if (words < 400) continue; // too short to mine
    const cites = citeCountForSource(slug);
    // Score: lots of words, few citations = under-mined.
    const score = words / Math.max(cites, 1);
    candidates.push({ slug, path: join(SOURCES_DIR, f), words, cites, score, body });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

const SYSTEM = `You are the Prospector for KiriPedia.

You receive ONE transcript (a public Kiriakou podcast/interview) and a list of existing article slugs. Identify the 1-5 most substantive standalone topics in this transcript where Kiriakou is the primary witness or commentator AND that aren't yet captured by an existing slug.

For each topic, decide:
- "enrich" — an existing slug should be deepened with this material (return the exact slug from the list)
- "new" — propose a new slug (lowercase-kebab) for a topic not yet in the list

Return a JSON object with a "proposals" array. Each proposal: {kind, slug, anchor_quote, why} where anchor_quote is a 30-90 word verbatim Kiriakou passage from the transcript and why is a one-sentence justification.

Doctrine:
- Only suggest topics where Kiriakou is the actual witness/source — not topics he merely name-drops.
- Skip intros, banter, ad reads.
- Never invent slugs not present in the list when kind="enrich".
- New slugs must be specific (e.g. "phoenix-program-vietnam", not "vietnam"); kebab-case; under 60 chars.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['proposals'],
  properties: {
    proposals: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'slug', 'anchor_quote', 'why'],
        properties: {
          kind: { type: 'string', enum: ['enrich', 'new'] },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$', maxLength: 60 },
          anchor_quote: { type: 'string', minLength: 30, maxLength: 600 },
          why: { type: 'string', minLength: 10, maxLength: 240 },
        },
      },
    },
  },
};

function appendProposals(sourceSlug, proposals) {
  let queue = [];
  if (existsSync(QUEUE_PATH)) {
    try { queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8')); }
    catch { queue = []; }
  }
  const now = new Date().toISOString();
  for (const p of proposals) {
    queue.push({ source: sourceSlug, found_at: now, ...p, status: 'pending' });
  }
  try {
    mkdirSync(dirname(QUEUE_PATH), { recursive: true });
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
  } catch {}
  return queue.length;
}

async function run(pick) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Opened the ${humanize(pick.slug)} transcript — hunting for unmined claims.` });
  console.log(`[${WORKER}] picked ${pick.slug} (words=${pick.words}, cites=${pick.cites})`);

  const slugs = knownSlugs();
  const slugList = slugs.join(', ');

  let result;
  try {
    result = await worker_reasoning({
      system: SYSTEM,
      user: `TRANSCRIPT (${pick.slug}):\n\n${pick.body.slice(0, 30_000)}\n\nEXISTING SLUGS:\n${slugList.slice(0, 12_000)}`,
      schema: SCHEMA,
      maxTokens: 2500,
    });
  } catch (err) {
    console.warn(`[${WORKER}] LLM unavailable (${err.message.slice(0, 120)}); skipping prospect`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Set the ${humanize(pick.slug)} transcript aside — keys are jammed.`, handoffTo: 'coordinator' });
    return;
  }

  const proposals = result.proposals || [];
  // Validate enrich proposals reference a real slug.
  const validProposals = proposals.filter(p => p.kind === 'new' || slugs.includes(p.slug));
  const total = appendProposals(pick.slug, validProposals);

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Pulled ${validProposals.length} fresh leads out of ${humanize(pick.slug)}. ${total} sitting in the tray.`,
                refKind: 'source', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: +${validProposals.length} proposals (queue: ${total})`);
}

const touched = new Set();
for (let i = 0; i < BATCH; i++) {
  const pick = pickSource(touched);
  if (!pick) {
    if (i === 0) {
      logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                    detail: 'Reviewed every transcript on the shelf — all mined this round.',
                    handoffTo: 'coordinator' });
    }
    break;
  }
  touched.add(pick.slug);
  markWorked(pick.slug, ROLE);
  await run(pick);
}
