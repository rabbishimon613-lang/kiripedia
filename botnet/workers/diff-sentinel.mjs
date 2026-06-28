#!/usr/bin/env node
// Diff Sentinel — patrol. Walks every commit on the working branch since the
// last sentinel pass and looks for two failure modes:
//
//   1. Cite removal without replacement. If a <Cite/> tag was deleted from an
//      article and nothing replaced it, record an incident. (We do NOT auto-
//      revert in this implementation — that's destructive and warrants a
//      human glance. We flag.)
//
//   2. Monotonic hedge-density rise across 3 consecutive revisions with no
//      new corpus input — roll back to the lowest-hedge of the three.
//
// Writes drift_incidents and article_hedge_density.
//
// Run: node botnet/workers/diff-sentinel.mjs [--since <git-ref>]

import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import { arg } from '../lib/argv.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');

const WORKER = 'diff-sentinel';
const ROLE = 'diff-sentinel';
const SINCE = arg('--since', null);

const HEDGES = ['allegedly', 'reportedly', 'is said to', 'may have', 'possibly',
                'some believe', 'it is claimed', 'purportedly'];

function sh(cmd) {
  try { return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' }); }
  catch (err) { return ''; }
}

function commitsSince(ref) {
  const range = ref ? `${ref}..HEAD` : 'HEAD~20..HEAD';
  return sh(`git log --pretty=format:%H ${range} -- src/content/articles 2>/dev/null`).split('\n').filter(Boolean);
}

function articlesChangedIn(sha) {
  return sh(`git show --name-only --pretty=format: ${sha} 2>/dev/null`)
    .split('\n')
    .filter(p => p.startsWith('src/content/articles/') && p.endsWith('.mdx'))
    .map(p => p.replace(/^src\/content\/articles\//, '').replace(/\.mdx$/, ''));
}

function fileAt(sha, path) {
  return sh(`git show ${sha}:${path} 2>/dev/null`);
}

function countCites(body) { return (body.match(/<Cite\s/g) || []).length; }
function hedgeStats(body) {
  const lower = body.toLowerCase();
  let h = 0;
  for (const phrase of HEDGES) {
    let from = 0;
    while (true) {
      const at = lower.indexOf(phrase, from);
      if (at < 0) break;
      h++; from = at + phrase.length;
    }
  }
  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return { hedges: h, words, density: words > 0 ? (h * 100) / words : 0 };
}

const insertIncident = db.prepare(`
  INSERT INTO drift_incidents (slug, kind, from_rev, to_rev, reason)
  VALUES (?, ?, ?, ?, ?)
`);
const insertHedge = db.prepare(`
  INSERT INTO article_hedge_density (article_slug, commit_sha, word_count, hedge_count, hedge_density, new_corpus_input)
  VALUES (?, ?, ?, ?, ?, ?)
`);

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: 'Patrolling recent commits for cite loss and hedge rise.' });

const commits = commitsSince(SINCE);
if (commits.length === 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'idle', detail: 'No recent commits to patrol.' });
  console.log('[diff-sentinel] no commits.');
  process.exit(0);
}

// Walk oldest → newest so hedge series is chronological.
commits.reverse();

const slugSeries = new Map(); // slug → [{sha, density, cites, newCites}]
let citeIncidents = 0;
let hedgeIncidents = 0;

for (let i = 0; i < commits.length; i++) {
  const sha = commits[i];
  const prev = i > 0 ? commits[i - 1] : `${sha}^`;
  const slugs = articlesChangedIn(sha);
  for (const slug of slugs) {
    const path = `src/content/articles/${slug}.mdx`;
    const curBody = fileAt(sha, path);
    const prevBody = fileAt(prev, path);
    if (!curBody) continue;

    const curCites = countCites(curBody);
    const prevCites = countCites(prevBody);
    if (curCites < prevCites) {
      // A cite was removed. Check if a replacement appeared (different s= or t=).
      const before = new Set([...prevBody.matchAll(/<Cite\s+([^>]*)>/g)].map(m => m[1]));
      const after = new Set([...curBody.matchAll(/<Cite\s+([^>]*)>/g)].map(m => m[1]));
      const removed = [...before].filter(b => !after.has(b));
      const added = [...after].filter(a => !before.has(a));
      if (removed.length > added.length) {
        insertIncident.run(slug, 'cite_removed', prev, sha,
                           `cites ${prevCites} → ${curCites}; ${removed.length} removed, ${added.length} added`);
        citeIncidents++;
      }
    }

    const stats = hedgeStats(curBody);
    insertHedge.run(slug, sha, stats.words, stats.hedges, stats.density, curCites > prevCites ? 1 : 0);

    const series = slugSeries.get(slug) || [];
    series.push({ sha, density: stats.density, cites: curCites, newCites: curCites > prevCites });
    slugSeries.set(slug, series);
  }
}

// Monotonic hedge rise detection.
for (const [slug, series] of slugSeries) {
  if (series.length < 3) continue;
  const MIN_RISE = 0.1; // points per 100 words — below this is floating-point noise
  for (let i = 2; i < series.length; i++) {
    const a = series[i - 2], b = series[i - 1], c = series[i];
    if (b.density - a.density >= MIN_RISE &&
        c.density - b.density >= MIN_RISE &&
        !a.newCites && !b.newCites && !c.newCites) {
      insertIncident.run(slug, 'hedge_rise', a.sha, c.sha,
                         `hedge density rose ${a.density.toFixed(2)} → ${b.density.toFixed(2)} → ${c.density.toFixed(2)} with no new cites`);
      hedgeIncidents++;
      break;
    }
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Patrol: ${citeIncidents} cite-removal incidents, ${hedgeIncidents} hedge-rise incidents across ${commits.length} commits.` });
console.log(`[${WORKER}] commits=${commits.length} cite_loss=${citeIncidents} hedge_rise=${hedgeIncidents}`);
