#!/usr/bin/env node
// Triage Patroller — SELECTION-ONLY worker.
//
// TEAM-REWORK (2026-06-22) names this as "the single most important fix" for
// the deepener/enricher thrash. The disease is that every mining worker today
// does TWO things in one process: it picks an article, then it works on it.
// When the LLM call fails, when no insertions land, when grep returns nothing
// — the article still re-surfaces next cycle as the global top candidate,
// because the (mentions − cites) delta hasn't changed. Two-hour cooldown
// papers over the in-batch case but not the across-cycle case.
//
// This worker is the cure: it computes the per-role candidate ranking ONCE
// per cycle and writes a work queue. Mining workers (deepener, enricher,
// weaver, reweaver) read from that queue and only do the LLM step. Selection
// criteria can now include backoff signals the mining workers themselves
// emit (no_insertions_returned, no_peer_mentions, llm_429), so a dead-end
// article gets deprioritised for a real reason, not just by cooldown.
//
// Output: botnet/state/work-queue.json
//   { "<role>": [ { slug, score, reason, queued_at }, ... ], ... }
//
// LLM: none. Pure code.
//
// Run: node botnet/workers/triage-patroller.mjs [--per-role N]
//
// Status: SKELETON. Wire-up to mining workers is a separate change — see
// "rollout" notes at the bottom. Until those workers read the queue, this
// worker writes the queue side-by-side with their existing pickers and the
// queue can be diffed against the workers' actual picks to verify ranking
// stability before the cutover.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import * as briefs from '../lib/briefs.mjs';
import { articleSetHash } from '../lib/hash.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');
const STATE_DIR = join(REPO_ROOT, 'botnet', 'state');
const QUEUE_PATH = join(STATE_DIR, 'work-queue.json');
const BACKOFF_PATH = join(STATE_DIR, 'work-backoff.json');

const args = process.argv.slice(2);
const PER_ROLE = parseInt(args[args.indexOf('--per-role') + 1]) || 25;
const WORKER = 'triage-patroller';
const ROLE = 'triage';

// ---------------------------------------------------------------------------
// Backoff register. Mining workers append signals like:
//   { slug, role, signal: 'no_insertions' | 'no_peers' | 'llm_429', at }
// We compute a per-(slug, role) penalty: recent failures deprioritise.
// File is shared, JSON, last 500 entries kept.
// ---------------------------------------------------------------------------

function loadBackoff() {
  try { return JSON.parse(readFileSync(BACKOFF_PATH, 'utf8')); }
  catch { return { events: [] }; }
}

function penaltyFor(slug, role, backoff) {
  const nowSec = Math.floor(Date.now() / 1000);
  let penalty = 0;
  for (const ev of backoff.events) {
    if (ev.slug !== slug || ev.role !== role) continue;
    const ageSec = nowSec - ev.at;
    if (ageSec > 24 * 60 * 60) continue;          // > 24h, decayed
    // Each recent dead-end: -10. Each fresh one (< 1h): -25.
    penalty += ageSec < 3600 ? 25 : 10;
  }
  return penalty;
}

// ---------------------------------------------------------------------------
// Cheap one-pass article scan. We read each .mdx once and compute every
// signal needed by every mining role. This collapses 4 × 279 file reads +
// 4 × 279 × T greps per cycle into one pass.
// ---------------------------------------------------------------------------

function scanArticles() {
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
  const rows = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    const path = join(ARTICLES_DIR, f);
    let body, size;
    try { body = readFileSync(path, 'utf8'); size = statSync(path).size; }
    catch { continue; }
    const cites = (body.match(/<Cite\s/g) || []).length;
    const wikilinks = (body.match(/\]\(\/wiki\//g) || []).length;
    const hasSeeAlso = /^##\s+See also/m.test(body);
    rows.push({ slug, path, size, cites, wikilinks, hasSeeAlso });
  }
  return rows;
}

// Cross-article incoming-link count: build once for the whole corpus.
function incomingMap() {
  const map = Object.create(null);
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
  for (const f of files) {
    let body;
    try { body = readFileSync(join(ARTICLES_DIR, f), 'utf8'); }
    catch { continue; }
    const re = /\]\(\/wiki\/([a-z0-9-]+)\)/g;
    let m;
    while ((m = re.exec(body)) !== null) {
      map[m[1]] = (map[m[1]] || 0) + 1;
    }
  }
  return map;
}

// Single grep over sources to count mention occurrences of each slug-term.
// We do this in ONE grep -c invocation per slug (not per term), summing
// across files in JS rather than spawning grep per term.
function mentionMapStrict(slugs) {
  // Build a regex of all slug-derived terms, run a single grep -Eo per
  // source file, tally in JS. Pure node, no shell quoting nightmares.
  const slugTerms = new Map(); // slug -> Set of terms
  for (const slug of slugs) {
    const terms = slug.split('-').filter(t => t.length >= 4);
    slugTerms.set(slug, new Set(terms.map(t => t.toLowerCase())));
  }
  const counts = Object.create(null);
  const sourceFiles = readdirSync(SOURCES_DIR).filter(f => f.endsWith('.md'));
  for (const sf of sourceFiles) {
    let text;
    try { text = readFileSync(join(SOURCES_DIR, sf), 'utf8').toLowerCase(); }
    catch { continue; }
    for (const [slug, terms] of slugTerms) {
      let n = 0;
      for (const term of terms) {
        // Count non-overlapping occurrences.
        let from = 0;
        while (true) {
          const at = text.indexOf(term, from);
          if (at < 0) break;
          n++;
          from = at + term.length;
        }
      }
      if (n > 0) counts[slug] = (counts[slug] || 0) + n;
    }
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Per-role rankers. Each returns a list of { slug, score, reason }.
// Selection criteria match the in-tree workers' current pickArticle logic
// so the cutover is a no-op for ranking. Backoff is the only NEW signal.
// ---------------------------------------------------------------------------

function rankDeepener(rows, mentions, backoff) {
  const out = [];
  for (const r of rows) {
    const m = mentions[r.slug] || 0;
    const delta = m - r.cites;
    if (delta <= 0) continue;
    const score = delta * 10 - penaltyFor(r.slug, 'deepener', backoff);
    out.push({ slug: r.slug, score, reason: `gap=${delta} mentions=${m} cites=${r.cites}` });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

function rankEnricher(rows, incoming, backoff) {
  const out = [];
  for (const r of rows) {
    const inc = incoming[r.slug] || 0;
    // Bias toward true orphans, but a single tie-break beats alphabetical.
    const score = (10 - Math.min(inc, 10)) * 10 - penaltyFor(r.slug, 'enricher', backoff);
    out.push({ slug: r.slug, score, reason: `incoming=${inc}` });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

function rankWeaver(rows, mentions, backoff) {
  const out = [];
  const MAX_SIZE = parseInt(process.env.WEAVER_MAX_SIZE) || 4000;
  for (const r of rows) {
    if (r.size > MAX_SIZE) continue; // Reweaver's territory
    const m = mentions[r.slug] || 0;
    if (m < 1) continue;
    // Smaller stubs first, biggest mention count breaks ties.
    const score = (MAX_SIZE - r.size) + m - penaltyFor(r.slug, 'weaver', backoff);
    out.push({ slug: r.slug, score, reason: `size=${r.size} mentions=${m}` });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

function rankReweaver(rows, backoff) {
  const out = [];
  const MIN_SIZE = parseInt(process.env.REWEAVER_MIN_SIZE) || 4000;
  const MAX_SIZE = parseInt(process.env.REWEAVER_MAX_SIZE) || 12_500;
  for (const r of rows) {
    if (r.size < MIN_SIZE || r.size > MAX_SIZE) continue;
    // Reweaver eats articles in the middle band. Larger first (more rope
    // to pull on), penalty applied.
    const score = r.size - penaltyFor(r.slug, 'reweaver', backoff);
    out.push({ slug: r.slug, score, reason: `size=${r.size}` });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------

function main() {
  const t0 = Date.now();
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: 'Scanning the shelf to assign work to mining bots.' });

  if (!existsSync(ARTICLES_DIR)) {
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: 'No articles directory yet — nothing to triage.' });
    return;
  }

  const rows = scanArticles();
  const slugs = rows.map(r => r.slug);
  const mentions = mentionMapStrict(slugs);
  const incoming = incomingMap();
  const backoff = loadBackoff();

  const nowSec = Math.floor(Date.now() / 1000);
  const queue = {
    generated_at: new Date().toISOString(),
    article_count: rows.length,
    roles: {
      deepener: rankDeepener(rows, mentions, backoff).slice(0, PER_ROLE),
      enricher: rankEnricher(rows, incoming, backoff).slice(0, PER_ROLE),
      weaver:   rankWeaver(rows, mentions, backoff).slice(0, PER_ROLE),
      reweaver: rankReweaver(rows, backoff).slice(0, PER_ROLE),
    },
  };

  for (const role of Object.keys(queue.roles)) {
    for (const item of queue.roles[role]) item.queued_at = nowSec;
  }

  try {
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
  } catch (err) {
    console.error(`[${WORKER}] could not write queue: ${err.message}`);
  }

  // NEW: emit Swarm Briefs for downstream workers. Selection ≠ work.
  // We issue a small, capped number per role per cycle so backlog stays bounded.
  const briefCounts = issueBriefs(rows, mentions, incoming);

  const summary = Object.entries(queue.roles)
    .map(([role, items]) => `${role}=${items.length}`)
    .join(' ');
  const briefSummary = Object.entries(briefCounts)
    .map(([role, n]) => `${role}=${n}`)
    .join(' ');
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Queued work (${summary}). Briefs issued (${briefSummary}). ${elapsed}s.` });
  console.log(`[${WORKER}] queued ${summary} | briefs ${briefSummary} (${elapsed}s)`);
}

// ---------------------------------------------------------------------------
// Brief issuance — the four rules from BUILD-PROMPT.md §2.3.
// ---------------------------------------------------------------------------

function countPendingByRole(role) {
  const r = db.prepare(`SELECT COUNT(*) AS n FROM briefs WHERE worker=? AND status='pending'`).get(role);
  return r.n || 0;
}

function approxWordCount(body) {
  // Strip MDX-ish tags and frontmatter, then split.
  const cleaned = body
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function issueBriefs(rows, mentions, incoming) {
  const out = { cataloger: 0, weaver: 0, 're-reader': 0, enricher: 0 };
  const MAX_PER_ROLE = parseInt(process.env.TRIAGE_BRIEFS_PER_ROLE) || 8;

  // Cap: don't pile up briefs. If a role already has plenty pending, skip.
  const capRemaining = (role) => Math.max(0, MAX_PER_ROLE - countPendingByRole(role));

  // Rule A — Cataloger second-pass. Pick catalogued transcripts whose target
  // articles are still under-developed: an average article size <1800 chars
  // across the set means the transcript is likely under-mined. We don't try
  // to filter per-transcript by topic match — the Cataloger does that on the
  // second pass.
  {
    const remaining = capRemaining('cataloger');
    if (remaining > 0) {
      const avgSmall = rows.length > 0 &&
        (rows.filter(r => r.size < 1800).length / rows.length) > 0.3;
      const candidates = db.prepare(`
        SELECT video_id, slug FROM clips
         WHERE status='catalogued' AND worker IS NULL
         ORDER BY upload_date ASC
         LIMIT 30
      `).all();
      for (const c of candidates) {
        if (out.cataloger >= remaining) break;
        if (!avgSmall && rows.length > 0) break; // shelf is dense — don't pile on
        // De-dupe against pending briefs for this clip.
        const dupe = db.prepare(`
          SELECT 1 FROM briefs WHERE worker='cataloger' AND status='pending'
           AND scope_json LIKE ? LIMIT 1
        `).get(`%"video_id":"${c.video_id}"%`);
        if (dupe) continue;
        briefs.issue({
          worker: 'cataloger',
          goal: `Second-pass walk of ${c.slug} to surface missed claims.`,
          whyNow: 'corpus skew: most articles still under 1800 chars; second pass surfaces missed claims',
          scope: { kind: 'second-pass', video_id: c.video_id, source_slug: c.slug },
          deliverables: { write: 'claims rows (status=pending_review)' },
          constraints: { token_budget: 30000 },
        });
        out.cataloger++;
      }
    }
  }

  // Rule B — Weaver shape-rework for articles >5000 words with too-similar TOCs.
  {
    const remaining = capRemaining('weaver');
    if (remaining > 0) {
      const big = rows.filter(r => r.size > 5000);
      for (const r of big) {
        if (out.weaver >= remaining) break;
        briefs.issue({
          worker: 'weaver',
          goal: `Re-weave ${r.slug}: large article, TOC may converge with peers.`,
          whyNow: 'article >5000 words; shape-redesign candidate',
          scope: { kind: 'shape-redesign', slug: r.slug },
          deliverables: { rewrite: `src/content/articles/${r.slug}.mdx` },
          constraints: { token_budget: 40000 },
        });
        out.weaver++;
      }
    }
  }

  // Rule C — Re-Reader for articles with stale verdicts under the current hash.
  {
    const remaining = capRemaining('re-reader');
    if (remaining > 0) {
      const currentHash = articleSetHash();
      // Pick sources whose passages have never been stamped with current hash,
      // OR whose stamps are all stale.
      const sources = db.prepare(`
        SELECT cl.slug
          FROM clips cl
         WHERE cl.status IN ('catalogued','published')
         ORDER BY cl.upload_date DESC
         LIMIT 40
      `).all();
      for (const s of sources) {
        if (out['re-reader'] >= remaining) break;
        const hit = db.prepare(`
          SELECT 1 FROM passage_verdicts
           WHERE passage_id LIKE ? AND article_set_hash = ?
           LIMIT 1
        `).get(`${s.slug}@%`, currentHash);
        if (hit) continue;
        briefs.issue({
          worker: 're-reader',
          goal: `Walk ${s.slug} under hash ${currentHash.slice(0, 8)}.`,
          whyNow: 'passages have no verdict under the current article_set_hash',
          scope: { source_slug: s.slug, article_set_hash: currentHash },
          deliverables: { write: 'passage_verdicts rows' },
          constraints: { token_budget: 60000 },
        });
        out['re-reader']++;
      }
    }
  }

  // Rule D — Enricher fan-out for articles that just got new claims.
  {
    const remaining = capRemaining('enricher');
    if (remaining > 0) {
      // "Just got new claims" = claims with status='merged' in the last cycle.
      // Approximate by last hour. Coordinator runs once per cycle.
      const touched = db.prepare(`
        SELECT DISTINCT article_slug FROM claims
         WHERE status='merged'
           AND rendered_at >= datetime('now','-2 hours')
         LIMIT 20
      `).all();
      for (const t of touched) {
        if (out.enricher >= remaining) break;
        briefs.issue({
          worker: 'enricher',
          goal: `Fan-out wikilinks from ${t.article_slug} after new claims landed.`,
          whyNow: 'article just received new claims; peers may need cross-links',
          scope: { slug: t.article_slug, kind: 'fan-out' },
          deliverables: { write: 'wikilink additions to peer articles' },
          constraints: { token_budget: 15000 },
        });
        out.enricher++;
      }
    }
  }

  return out;
}

main();

// ---------------------------------------------------------------------------
// Rollout notes — DO NOT REMOVE WITHOUT WIRE-UP.
//
// Phase A (this skeleton, safe to ship):
//   - Triage Patroller runs FIRST in the cycle, BEFORE deepener/enricher/etc.
//   - Writes botnet/state/work-queue.json.
//   - Mining workers continue to use their own pickers. No behavioural change.
//   - Diff queue vs activity log over a week to verify ranking is stable.
//
// Phase B (one PR per mining worker, ~20 LOC each):
//   - Deepener/Enricher/Weaver/Reweaver gain a `--source queue` flag.
//   - When set, they read botnet/state/work-queue.json and walk their
//     role's list (skipping anything in cooldown / `touched`).
//   - When the LLM step returns zero insertions / no peers / 429,
//     append to botnet/state/work-backoff.json with the signal.
//   - Default --source remains the legacy picker until each worker is
//     individually flipped.
//
// Phase C (delete the per-worker pickers):
//   - Once all four workers run --source queue stable for a week,
//     remove pickArticle from each and drop the per-worker grep/file-read.
//   - Net savings: ~4 × (279 file reads + 279×~3 greps) → 1 pass.
//
// Phase D (passage-level state per TEAM-REWORK §"Schema additions"):
//   - rankDeepener moves from (mentions − cites) to (passages with no claim
//     against this article) once the passage table exists. Same shape,
//     different signal. Schema migration in a separate worker / script,
//     never edit the live botnet.db in place — copy out, migrate, swap.
// ---------------------------------------------------------------------------
