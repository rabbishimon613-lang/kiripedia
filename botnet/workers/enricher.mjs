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
import { titleFromSlug } from '../lib/title-from-slug.mjs';

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

You are the Cross-Source Enricher for KiriPedia. You are NOT a wikilink technician and you are NOT a "see also" generator. Those are housekeeping. Your real job: when the SAME story about this subject appears across multiple peer articles (and therefore multiple transcripts), pull those distinct framings, corroborations, dates, named participants, and quotes INTO this article's body as real prose. A peer article that mentions this subject in passing is a corroborating source you must mine, not just a link to add.

You receive ONE target article slug + body, plus a list of peer article excerpts that mention the topic.

Produce THREE outputs:

(A) **body_additions** — the main event. New encyclopedic subsections (or paragraphs) to fold into the target article, each carrying material the peer excerpts already provide. Each addition has:
  - heading: an H2 like "## The Camp David meeting" — topic-named, NEVER "## From source-slug-xyz" or a peer article's slug. If you want to append a paragraph under an existing section (or to the lede), set heading to the empty string "".
  - paragraphs: 1–3 paragraphs in KiriPedia voice — third person, declarative, no "Kiriakou says," no "according to," no "in an interview." Wikilink proper nouns with [Name](/wiki/slug) when the slug is obvious; otherwise leave plain. Preserve direct quotes verbatim, italicised as *"like this"*. EVERY paragraph must end with at least one <Cite s="..." t="M:SS" /> tag. When a fact appears in multiple peer excerpts, stack the cites — "story across 5 podcasts = 5 cites."

(B) **wikilinks** — secondary. For each peer article that mentions this subject WITHOUT linking to it, propose a single wikilink to add to that peer.

(C) **see_also** — secondary. 3–8 related slugs for a "## See also" block in the target. Only emit slugs that you can SEE on the peer excerpt list (or that are obviously sibling topics already in the corpus). Never invent slugs.

Doctrine:
- ONLY use material the peer excerpts verbatim support. Never invent timestamps, slugs, dates, names, dollar figures, or quotes. Every <Cite/> must come from a peer excerpt.
- Mirror Kiriakou's discretion — aliases stay aliases.
- Present contradictions; do not reconcile them.
- Do not duplicate paragraphs already in the target body. Skim first.
- If the target is already dense on what the peers contain, return empty body_additions. Quality over volume.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['wikilinks', 'see_also', 'body_additions'],
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
    body_additions: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['heading', 'paragraphs'],
        properties: {
          heading: { type: 'string', maxLength: 120 },
          paragraphs: {
            type: 'array',
            minItems: 1,
            maxItems: 3,
            items: { type: 'string', minLength: 80, maxLength: 2400 },
          },
        },
      },
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
        maxTokens: 8000,
      });
    } catch {
      result = await worker_longcontext({
        system: SYSTEM,
        user: `TARGET ARTICLE (${pick.slug}):\n\n${body.slice(0, 6000)}\n\nPEER EXCERPTS:\n\n${peerExcerpts.slice(0, 10_000)}`,
        schema: SCHEMA,
        maxTokens: 8000,
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

  // Apply body_additions: append new sourced prose to the target body.
  // Each addition: heading + paragraphs (each ending in a <Cite/>). Idempotent
  // on the heading text AND the first 60 chars of the first paragraph (so the
  // same fact reproposed next cycle doesn't duplicate). Inserted before the
  // "## See also" block if one exists, else appended.
  let proseAdds = 0;
  const citeRx = /<Cite\s+s="[a-z0-9-]+"\s+t="\d{1,2}:\d{2}(?::\d{2})?"\s*\/>/;
  for (const add of (result.body_additions || [])) {
    const paras = (add.paragraphs || []).map(p => (p || '').trim()).filter(p => p.length >= 80 && citeRx.test(p));
    if (paras.length === 0) continue;
    const heading = (add.heading || '').trim();
    const fingerprint = paras[0].slice(0, 60);
    if (body.includes(fingerprint)) continue;
    if (heading && body.includes(heading)) continue;
    const block = (heading ? `${heading}\n\n` : '') + paras.join('\n\n');
    const seeAt = body.indexOf('\n## See also');
    if (seeAt < 0) {
      body = body.trimEnd() + '\n\n' + block + '\n';
    } else {
      body = body.slice(0, seeAt) + '\n\n' + block + body.slice(seeAt);
    }
    proseAdds++;
  }
  if (proseAdds > 0) {
    writeFileSync(pick.path, body);
  }

  // See also block. Use the related article's on-disk title when it looks
  // sane, fall back to the acronym-aware slug→title helper when it doesn't.
  // Detects legacy mangled titles like "Fbi" and re-derives them.
  const titleFor = (slug) => {
    try {
      const raw = readFileSync(join(ARTICLES_DIR, `${slug}.mdx`), 'utf8');
      const m = raw.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
      if (m) {
        const t = m[1].replace(/''/g, "'");
        const naive = slug.split('-').map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
        const better = titleFromSlug(slug);
        // If the on-disk title is just the naive slug-capitalize AND the
        // acronym-aware helper would do better, prefer the helper.
        if (t === naive && t !== better) return better;
        return t;
      }
    } catch {}
    return titleFromSlug(slug);
  };
  const seeAlso = (result.see_also || []).filter(s => s !== pick.slug);
  if (seeAlso.length > 0 && !body.includes('## See also')) {
    const lines = seeAlso.map(s => `- [${titleFor(s)}](/wiki/${s})`).join('\n');
    body = body.trimEnd() + `\n\n## See also\n\n${lines}\n`;
    writeFileSync(pick.path, body);
  }

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Folded ${proseAdds} cross-source sections into ${humanize(pick.slug)}, plus ${linkAdds} wikilinks and ${seeAlso.length} "see also."`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: +${proseAdds} body sections, +${linkAdds} wikilinks, +${seeAlso.length} see-also`);
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
