#!/usr/bin/env node
// Cross-Source Enricher. Picks the most orphaned article (fewest incoming
// wikilinks from peer articles) and proposes:
//   1. Wikilinks in peer articles where this topic is mentioned but un-linked.
//   2. A "## See also" block in the target.
//
// LLM-optional: skips cleanly if no Cerebras/Groq keys.
//
// Run: node botnet/workers/enricher.mjs [--batch N]

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, utimesSync, writeFileSync } from 'node:fs';
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

const WORKER = arg('--worker', 'enricher-1');
const ROLE = 'enricher';
const BATCH = intArg('--batch', 1);

const humanize = s => s.replace(/-\d{4}$/, '').split('-').map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' ');

function shellQuote(s) {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function incomingLinks(slug) {
  try {
    const out = execSync(
      `grep -rl ${shellQuote(`](/wiki/${slug})`)} ${shellQuote(ARTICLES_DIR)} || true`,
      { encoding: 'utf8' }
    );
    return out.split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
}

const COOLDOWN_SEC = 30 * 60; // 30m — June–July push: shelf must be walked often

function pickArticle(exclude = new Set()) {
  const nowSec = Math.floor(Date.now() / 1000);
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
  const candidates = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    if (exclude.has(slug)) continue;
    if (nowSec - lastWorked(slug, ROLE) < COOLDOWN_SEC) continue;
    const links = incomingLinks(slug);
    candidates.push({ slug, path: join(ARTICLES_DIR, f), incoming: links });
  }
  candidates.sort((a, b) => a.incoming - b.incoming || a.slug.localeCompare(b.slug));
  return candidates[0] || null;
}

const SYSTEM = `${marchingOrdersFor('enricher')}

You are the Cross-Source Enricher for KiriPedia.

You receive ONE target article slug + body, plus a list of peer article excerpts that mention the topic but don't link to it. Your job:
1. For each peer mention, return the verbatim phrase to wikilink and the link target.
2. Optionally suggest 3-8 related slugs for a "## See also" section in the target.

Doctrine: only wikilink phrases that unambiguously refer to the target topic. Never invent slugs. Never modify wording beyond wrapping with [text](/wiki/slug).`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['wikilinks', 'see_also'],
  properties: {
    wikilinks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['peer_slug', 'anchor', 'target_slug'],
        properties: {
          peer_slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          anchor: { type: 'string', minLength: 2, maxLength: 120 },
          target_slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
        },
      },
    },
    see_also: {
      type: 'array',
      items: { type: 'string', pattern: '^[a-z0-9-]+$' },
    },
  },
};

async function run(pick) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Opened ${humanize(pick.slug)} — looking for peer articles to cross-link.` });
  console.log(`[${WORKER}] picked ${pick.slug} (incoming=${pick.incoming})`);

  // Gather peer mentions: grep article files for terms from the slug.
  const term = pick.slug.replace(/-/g, ' ');
  let mentions = '';
  try {
    mentions = execSync(
      `grep -rln --include='*.mdx' ${shellQuote(term)} ${shellQuote(ARTICLES_DIR)} | head -30 || true`,
      { encoding: 'utf8' }
    );
  } catch { /* non-fatal */ }
  const peerFiles = mentions.split('\n').filter(Boolean).filter(f => !f.endsWith(`${pick.slug}.mdx`));

  if (peerFiles.length === 0) {
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Searched the shelf for ${humanize(pick.slug)} — it's a true orphan so far.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  let body;
  try { body = readFileSync(pick.path, 'utf8'); } catch {
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Couldn't open ${humanize(pick.slug)} — file's stuck.`, handoffTo: 'coordinator' });
    return;
  }

  const peerExcerpts = peerFiles.slice(0, 8).map(p => {
    const slug = p.split('/').pop().replace(/\.mdx$/, '');
    try {
      const txt = readFileSync(p, 'utf8').slice(0, 2000);
      return `=== ${slug} ===\n${txt}`;
    } catch { return ''; }
  }).filter(Boolean).join('\n\n');

  let result;
  try {
    try {
      result = await worker_reasoning({
        system: SYSTEM,
        user: `TARGET ARTICLE (${pick.slug}):\n\n${body.slice(0, 6000)}\n\nPEER EXCERPTS:\n\n${peerExcerpts.slice(0, 10_000)}`,
        schema: SCHEMA,
        maxTokens: 2500,
      });
    } catch {
      result = await worker_longcontext({
        system: SYSTEM,
        user: `TARGET ARTICLE (${pick.slug}):\n\n${body.slice(0, 6000)}\n\nPEER EXCERPTS:\n\n${peerExcerpts.slice(0, 10_000)}`,
        schema: SCHEMA,
        maxTokens: 2500,
      });
    }
  } catch (err) {
    console.warn(`[${WORKER}] all LLM paths failed (${err.message.slice(0, 120)}); skipping`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Pausing on ${humanize(pick.slug)} until the phone line clears.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  // Apply wikilinks to peer files, idempotently.
  let linkAdds = 0;
  for (const wl of (result.wikilinks || [])) {
    const peerPath = join(ARTICLES_DIR, `${wl.peer_slug}.mdx`);
    let peer;
    try { peer = readFileSync(peerPath, 'utf8'); } catch { continue; }
    if (peer.includes(`](/wiki/${wl.target_slug})`)) continue;
    const at = peer.indexOf(wl.anchor);
    if (at < 0) continue;
    const before = peer.slice(0, at);
    const after = peer.slice(at + wl.anchor.length);
    // Avoid linking inside an existing markdown link.
    if (/\[[^\]]*$/.test(before)) continue;
    peer = before + `[${wl.anchor}](/wiki/${wl.target_slug})` + after;
    writeFileSync(peerPath, peer);
    linkAdds++;
  }

  // See also block.
  const seeAlso = (result.see_also || []).filter(s => s !== pick.slug);
  if (seeAlso.length > 0 && !body.includes('## See also')) {
    const lines = seeAlso.map(s => `- [${s.replace(/-/g, ' ')}](/wiki/${s})`).join('\n');
    body = body.trimEnd() + `\n\n## See also\n\n${lines}\n`;
    writeFileSync(pick.path, body);
  }

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Cross-linked ${humanize(pick.slug)} to ${linkAdds} other folks, added ${seeAlso.length} "see also."`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: +${linkAdds} wikilinks, +${seeAlso.length} see-also`);
}

// PHASE 2: drain pending enricher briefs first.
// Brief scope: { kind: 'fan-out' | 'standard', slug }
const touched = new Set();
const briefDrain = await drainBriefs({
  role: 'enricher',
  workerId: WORKER,
  max: BATCH,
  handler: async ({ scope }) => {
    if (!scope.slug) throw new Error('brief scope missing slug');
    const path = join(ARTICLES_DIR, `${scope.slug}.mdx`);
    let size;
    try { size = statSync(path).size; } catch { throw new Error(`article not found: ${scope.slug}`); }
    const pick = { slug: scope.slug, path, size };
    touched.add(scope.slug);
    markWorked(scope.slug, ROLE);
    await run(pick);
    return { result: { slug: scope.slug, kind: scope.kind || 'standard' }, filesChanged: [path] };
  },
});

for (let i = briefDrain.done + briefDrain.failed; i < BATCH; i++) {
  const pick = pickArticle(touched);
  if (!pick) {
    if (i === 0) {
      logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                    detail: 'Reviewed every article — all are well-introduced this round.',
                    handoffTo: 'coordinator' });
    }
    break;
  }
  touched.add(pick.slug);
  markWorked(pick.slug, ROLE);
  await run(pick);
}
