#!/usr/bin/env node
// diff-sentinel.mjs — detect cited-claim removal and hedge density drift
//                     across git history.
//
// Two detection modes:
//
// MODE A — Cited-claim removal check (per commit)
//   For every commit that touches an article .mdx file:
//     1. Diff the old vs new version
//     2. Find removed lines (lines starting with "-" in the diff that are
//        NOT frontmatter, NOT import statements)
//     3. For each removed line containing a <Cite ... /> tag: flag as
//        "cited-claim removal" — a cited fact was deleted
//     4. Check whether the same source+timestamp appears anywhere in the
//        new version (replacement). If not → ALERT.
//
// MODE B — Hedge density drift (per article, across revisions)
//   Walk the git log for each .mdx file.
//   Compute hedge density (hedges/1000w) at each revision.
//   If density is MONOTONICALLY INCREASING across N consecutive revisions
//   without ANY new <Cite> tags being added → flag for rollback.
//   "Monotonic increase" = each revision has strictly higher density than
//   the previous, and no new Cite s= slug was introduced.
//
// State: this script is stateless — it re-derives from git log on each run.
//        A production version would persist scan state in SQLite to avoid
//        re-walking the full history each run.
//
// Usage:
//   node tools/diff-sentinel.mjs                       # last 50 commits, all articles
//   node tools/diff-sentinel.mjs --commits 20          # last N commits
//   node tools/diff-sentinel.mjs --slug abu-zubaydah   # single article
//   node tools/diff-sentinel.mjs --mode a              # cited-claim removal only
//   node tools/diff-sentinel.mjs --mode b              # hedge drift only
//   node tools/diff-sentinel.mjs --drift-window 3      # N revisions for monotonic check
//   node tools/diff-sentinel.mjs --json

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');

const args = process.argv.slice(2);
const COMMITS = parseInt(args[args.indexOf('--commits') + 1]) || 50;
const SLUG_FILTER = args[args.indexOf('--slug') + 1] || null;
const MODE = (args[args.indexOf('--mode') + 1] || 'ab').toLowerCase();
const DRIFT_WINDOW = parseInt(args[args.indexOf('--drift-window') + 1]) || 3;
const JSON_OUT = args.includes('--json');

const RUN_A = MODE.includes('a');
const RUN_B = MODE.includes('b');

// ── Hedge lexicon (same as hedge-density.mjs) ────────────────────────────────
const HEDGE_PATTERNS = [
  /\ballegedly\b/gi, /\breportedly\b/gi, /\bpurportedly\b/gi, /\bsupposedly\b/gi,
  /\bis said to\b/gi, /\bare said to\b/gi, /\bit is claimed\b/gi,
  /\bclaimed that\b/gi, /\bsources? (?:claim|say|allege|report)\b/gi,
  /\bsome (?:say|claim|suggest|believe)\b/gi, /\bappears? to\b/gi,
  /\bseems? to\b/gi, /\bmay have\b/gi, /\bmight have\b/gi, /\bcould have\b/gi,
  /\bpossibly\b/gi, /\bperhaps\b/gi, /\baccording to\b/gi,
];

function countHedges(text) {
  let total = 0;
  for (const re of HEDGE_PATTERNS) {
    const matches = [...text.matchAll(re)];
    total += matches.length;
  }
  return total;
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function hedgeDensity(text) {
  const words = countWords(text);
  if (words === 0) return 0;
  return (countHedges(text) / words) * 1000;
}

function stripFrontmatter(raw) {
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function stripMdx(prose) {
  return prose
    .replace(/<Cite[^>]*\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ');
}

// ── Git helpers ───────────────────────────────────────────────────────────────

function git(cmd, opts = {}) {
  try {
    return execSync(`git -C "${REPO_ROOT}" ${cmd}`, {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      ...opts,
    }).trim();
  } catch (e) {
    return '';
  }
}

function getFileAtCommit(commitHash, filePath) {
  try {
    return execSync(`git -C "${REPO_ROOT}" show ${commitHash}:${filePath}`, {
      encoding: 'utf8',
      maxBuffer: 5 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

// Extract all <Cite s="..." t="..." /> from text → Set of "slug|ts" keys
function extractCiteKeys(text) {
  const keys = new Set();
  const re = /<Cite\s+s="([^"]+)"\s+t="([^"]+)"\s*\/>/g;
  let m;
  while ((m = re.exec(text)) !== null) keys.add(`${m[1]}|${m[2]}`);
  return keys;
}

// ── Get commits touching articles ─────────────────────────────────────────────

const pathFilter = SLUG_FILTER
  ? `src/content/articles/${SLUG_FILTER}.mdx`
  : 'src/content/articles/';

const logOutput = git(`log --format="%H %s" -${COMMITS} -- "${pathFilter}"`);
if (!logOutput) {
  console.log('No commits found. Make sure you are in a git repository.');
  process.exit(0);
}

const commits = logOutput.split('\n').filter(Boolean).map(line => {
  const [hash, ...rest] = line.split(' ');
  return { hash, subject: rest.join(' ') };
});

// For each commit, find which article files changed
function getChangedArticles(commit) {
  const out = git(`diff-tree --no-commit-id -r --name-only ${commit.hash}`);
  return out.split('\n')
    .filter(f => f.startsWith('src/content/articles/') && f.endsWith('.mdx'))
    .filter(f => !SLUG_FILTER || f === `src/content/articles/${SLUG_FILTER}.mdx`);
}

// ── MODE A: Cited-claim removal ───────────────────────────────────────────────

const claimRemovals = [];

if (RUN_A) {
  for (const commit of commits) {
    const changedFiles = getChangedArticles(commit);
    for (const filePath of changedFiles) {
      const slug = filePath.replace('src/content/articles/', '').replace('.mdx', '');
      // Get parent commit hash
      const parentHash = git(`rev-parse ${commit.hash}^`);
      if (!parentHash) continue;
      const oldContent = getFileAtCommit(parentHash, filePath);
      const newContent = getFileAtCommit(commit.hash, filePath);
      if (!oldContent || !newContent) continue;

      const oldCiteKeys = extractCiteKeys(oldContent);
      const newCiteKeys = extractCiteKeys(newContent);

      // Find Cite keys that were in old version but absent from new version
      const removedCiteKeys = [...oldCiteKeys].filter(k => !newCiteKeys.has(k));
      if (removedCiteKeys.length === 0) continue;

      // For each removed Cite key, find the line(s) in old content that contained it
      const removedLines = [];
      const oldLines = oldContent.split('\n');
      for (const key of removedCiteKeys) {
        const [s, t] = key.split('|');
        const citePattern = new RegExp(`<Cite\\s+s="${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+t="${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*\\/>`);
        for (let i = 0; i < oldLines.length; i++) {
          if (citePattern.test(oldLines[i])) {
            // Get the prose context (strip Cite tags from this line for readability)
            const prose = oldLines[i]
              .replace(/<Cite[^>]*\/>/g, '')
              .replace(/<[^>]+>/g, '')
              .trim()
              .slice(0, 100);
            removedLines.push({ lineNum: i + 1, citeKey: key, prose });
            break;
          }
        }
      }

      if (removedLines.length > 0) {
        claimRemovals.push({
          slug,
          commitHash: commit.hash.slice(0, 8),
          subject: commit.subject,
          removedCount: removedLines.length,
          removed: removedLines,
          addedCites: [...newCiteKeys].filter(k => !oldCiteKeys.has(k)).length,
        });
      }
    }
  }
}

// ── MODE B: Hedge density drift ───────────────────────────────────────────────

const driftAlerts = [];

if (RUN_B) {
  // Get all distinct article files touched across examined commits
  const allSlugs = new Set();
  for (const commit of commits) {
    for (const f of getChangedArticles(commit)) {
      allSlugs.add(f.replace('src/content/articles/', '').replace('.mdx', ''));
    }
  }

  for (const slug of allSlugs) {
    const filePath = `src/content/articles/${slug}.mdx`;
    // Get all commits that touched this file (within our window)
    const fileLog = git(`log --format="%H" -${COMMITS} -- "${filePath}"`);
    if (!fileLog) continue;
    const fileCommits = fileLog.split('\n').filter(Boolean);
    if (fileCommits.length < DRIFT_WINDOW) continue;

    // Compute density at each revision (most recent first)
    const revisions = [];
    for (const hash of fileCommits) {
      const content = getFileAtCommit(hash, filePath);
      if (!content) continue;
      const prose = stripMdx(stripFrontmatter(content));
      const density = hedgeDensity(prose);
      const citeKeys = extractCiteKeys(content);
      revisions.push({ hash: hash.slice(0, 8), density, citeCount: citeKeys.size });
    }

    // Revisions are most-recent-first. Check for monotonic increase going
    // backward (i.e., density increased over successive edits to this file).
    // We reverse so index 0 = oldest in window.
    const window = revisions.slice(0, DRIFT_WINDOW).reverse();

    let monotonic = true;
    let citesAdded = false;

    for (let i = 1; i < window.length; i++) {
      if (window[i].density <= window[i - 1].density) {
        monotonic = false;
        break;
      }
      // Check if cite count grew between any pair of revisions
      if (window[i].citeCount > window[i - 1].citeCount) {
        citesAdded = true;
      }
    }

    if (monotonic && !citesAdded) {
      // Rollback recommendation: lowest density revision in window
      const lowestRev = window.reduce((best, r) => r.density < best.density ? r : best, window[0]);
      driftAlerts.push({
        slug,
        window: window.map(r => ({ hash: r.hash, density: r.density.toFixed(2), citeCount: r.citeCount })),
        currentDensity: window[window.length - 1].density.toFixed(2),
        lowestDensityRev: lowestRev.hash,
        lowestDensity: lowestRev.density.toFixed(2),
      });
    }
  }
}

// ── Output ────────────────────────────────────────────────────────────────────

if (JSON_OUT) {
  console.log(JSON.stringify({ claimRemovals, driftAlerts }, null, 2));
  process.exit(0);
}

console.log(`\n=== DIFF SENTINEL — KiriPedia corpus ===`);
console.log(`Commits examined: ${commits.length}`);
if (SLUG_FILTER) console.log(`Article filter: ${SLUG_FILTER}`);

if (RUN_A) {
  console.log(`\n--- MODE A: Cited-claim removals ---`);
  if (claimRemovals.length === 0) {
    console.log('  No cited-claim removals detected in this window.');
  } else {
    console.log(`  ${claimRemovals.length} commits removed cited claims:\n`);
    for (const r of claimRemovals) {
      console.log(`  [${r.commitHash}] ${r.slug}`);
      console.log(`    Subject: ${r.subject}`);
      console.log(`    Removed ${r.removedCount} Cite keys (added ${r.addedCites} new)`);
      for (const line of r.removed) {
        const [s, t] = line.citeKey.split('|');
        console.log(`    Line ${line.lineNum}: <Cite s="${s}" t="${t}" />  "${line.prose}"`);
      }
    }
  }
}

if (RUN_B) {
  console.log(`\n--- MODE B: Hedge density drift (window=${DRIFT_WINDOW} revisions) ---`);
  if (driftAlerts.length === 0) {
    console.log('  No monotonic hedge drift detected.');
  } else {
    console.log(`  ${driftAlerts.length} articles with monotonic hedge increase:\n`);
    for (const a of driftAlerts) {
      console.log(`  ${a.slug}`);
      console.log(`    Density progression: ${a.window.map(r => r.density).join(' → ')}`);
      console.log(`    Current: ${a.currentDensity} hedges/1000w`);
      console.log(`    Recommend rollback to: ${a.lowestDensityRev} (${a.lowestDensity} hedges/1000w)`);
      console.log(`    Git: git revert ${a.lowestDensityRev}  # or: git checkout ${a.lowestDensityRev} -- src/content/articles/${a.slug}.mdx`);
    }
  }
}

// ── Note on persistence ────────────────────────────────────────────────────────
if (!JSON_OUT) {
  console.log(`\n--- Notes ---`);
  console.log(`State: stateless scan. For production use, persist scan results to SQLite`);
  console.log(`       (table: sentinel_scan_log) and use --since <last_scanned_commit>`);
  console.log(`       to avoid re-walking the full history each run.`);
  console.log(`Run with --mode a for cited-claim removal only.`);
  console.log(`Run with --mode b for hedge drift only.`);
}
