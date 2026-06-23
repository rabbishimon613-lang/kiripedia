#!/usr/bin/env node
// Mouth Sentry. Runs last in the cycle, after weaver/deepener/enricher.
// Scans recently-touched articles for doctrine violations and logs them.
//
// Doctrine (per memory.feedback_kiripedia_doctrine.md):
//   - Encyclopedic voice. No "Kiriakou said", "according to John", etc.
//     in prose — sourcing is invisible via <Cite /> footnotes.
//   - Mirror John's discretion. If a source hedges, articles must too.
//   - No outside leakage. Everything traces to Kiriakou's recorded mouth.
//   - Capture density. Don't soften facts the source states firmly.
//
// v1 strategy: PASSIVE detection. Surface violations to the activity log
// and to public/sentry-report.json so the user can review before any auto-
// fix is enabled in v2. No file edits — read-only audit pass.
//
// Run: node botnet/workers/mouth-sentry.mjs [--window-min 30] [--max-files 50]

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const REPORT_PATH = join(REPO_ROOT, 'public', 'sentry-report.json');

const args = process.argv.slice(2);
const WORKER = 'mouth-sentry';
const ROLE = 'mouth-sentry';
const WINDOW_MIN = parseInt(args[args.indexOf('--window-min') + 1]) || 30;
const MAX_FILES = parseInt(args[args.indexOf('--max-files') + 1]) || 50;

// Forbidden attribution scaffolding in prose. Wikipedia-style articles
// don't say "according to X" — they cite. The reader knows from the About
// page that this whole wiki is Kiriakou's mouth.
const ATTRIBUTION_PATTERNS = [
  { id: 'kiriakou-said', re: /\bKiriakou\s+(said|says|claimed|claims|stated|states|explained|recalled|recalls|noted|notes|told|describes|described)\b/gi },
  { id: 'john-said', re: /\bJohn\s+(said|says|claimed|claims|stated|states|recalled|notes)\b/gi },
  { id: 'jk-said', re: /\bJK\s+(said|says|claimed|stated)\b/gi },
  { id: 'according-to-kiriakou', re: /according to (?:Kiriakou|John|JK)/gi },
  { id: 'he-recalls', re: /\b[Hh]e (?:recalls|recalled|claims|claimed|explained|notes|noted)\b/g },
];

// Hedge inflation — words an LLM tends to sprinkle in that soften firm
// source statements. Flag for review; doesn't auto-revert in v1.
const HEDGE_PATTERNS = [
  { id: 'allegedly', re: /\b(allegedly|reportedly|purportedly|supposedly)\b/gi },
  { id: 'is-said-to', re: /\bis said to\b/gi },
  { id: 'sources-claim', re: /\bsources? (?:say|claim|allege)\b/gi },
];

function scanFile(path) {
  let body;
  try { body = readFileSync(path, 'utf8'); } catch { return null; }
  // Strip frontmatter — doctrine applies to prose only.
  const prose = body.replace(/^---\n[\s\S]*?\n---\n/, '');

  const findings = [];
  for (const p of [...ATTRIBUTION_PATTERNS, ...HEDGE_PATTERNS]) {
    const matches = [...prose.matchAll(p.re)];
    if (matches.length === 0) continue;
    findings.push({
      kind: p.id,
      count: matches.length,
      samples: matches.slice(0, 3).map(m => m[0]),
    });
  }
  return findings.length > 0 ? findings : null;
}

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: `Reading through whatever the others changed in the last ${WINDOW_MIN} minutes.` });

const now = Date.now();
const cutoff = now - WINDOW_MIN * 60 * 1000;
const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));

const recent = [];
for (const f of files) {
  const path = join(ARTICLES_DIR, f);
  try {
    if (statSync(path).mtimeMs > cutoff) recent.push({ slug: f.replace(/\.mdx$/, ''), path });
  } catch {}
}
recent.sort((a, b) => statSync(b.path).mtimeMs - statSync(a.path).mtimeMs);
const scanned = recent.slice(0, MAX_FILES);

const violations = [];
for (const { slug, path } of scanned) {
  const findings = scanFile(path);
  if (findings) violations.push({ slug, findings });
}

// Persist a report regardless — empty is also a signal.
try { mkdirSync(dirname(REPORT_PATH), { recursive: true }); } catch {}
writeFileSync(REPORT_PATH, JSON.stringify({
  generated_at: new Date().toISOString(),
  window_min: WINDOW_MIN,
  scanned: scanned.length,
  violation_count: violations.length,
  violations,
}, null, 2));

const totalIssues = violations.reduce((acc, v) => acc + v.findings.reduce((a, f) => a + f.count, 0), 0);

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Went through ${scanned.length}. ${violations.length} of them need a word about their tone (${totalIssues} things to fix).` });
console.log(`[${WORKER}] scanned ${scanned.length} recent articles; ${violations.length} flagged (${totalIssues} total issues)`);
