#!/usr/bin/env node
// Shape Auditor — patrol. Computes a TOC fingerprint per article and flags
// articles whose fingerprint matches more than N peers. Nominates flagged
// articles for structural rework via a Weaver brief tagged "shape-redesign".
//
// TOC fingerprint = canonical-ordered list of H2 headers, lowercased and
// stripped of trailing punctuation. Hashed with SHA-256.
//
// Run: node botnet/workers/shape-auditor.mjs [--threshold 5]

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import { intArg } from '../lib/argv.mjs';
import * as briefs from '../lib/briefs.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');

const WORKER = 'shape-auditor';
const ROLE = 'shape-auditor';
const THRESHOLD = intArg('--threshold', 5);

function tocOf(body) {
  const main = body.replace(/^---[\s\S]*?---\n/, '');
  const headers = [...main.matchAll(/^##\s+(.+?)\s*$/gm)].map(m =>
    m[1].toLowerCase().replace(/[.:!?]+$/, '').trim()
  );
  // Exclude generic boilerplate sections that almost every article has;
  // their convergence isn't meaningful.
  const ignored = new Set(['see also', 'references', 'external links', 'notes', 'sources']);
  return headers.filter(h => !ignored.has(h));
}

function fingerprint(toc) {
  if (toc.length === 0) return null;
  return createHash('sha256').update([...toc].sort().join('|')).digest('hex').slice(0, 16);
}

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: 'Auditing TOC shapes across the corpus.' });

const insertAudit = db.prepare(`
  INSERT INTO article_shape_audit (article_slug, toc_hash, converging_peers, convergence_count, flagged)
  VALUES (?, ?, ?, ?, ?)
`);

const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
const groups = new Map(); // fingerprint → [slugs]

for (const f of files) {
  const slug = f.replace(/\.mdx$/, '');
  let body;
  try { body = readFileSync(join(ARTICLES_DIR, f), 'utf8'); } catch { continue; }
  const fp = fingerprint(tocOf(body));
  if (!fp) continue;
  const arr = groups.get(fp) || [];
  arr.push(slug);
  groups.set(fp, arr);
}

let flagged = 0, briefsIssued = 0;
const cap = parseInt(process.env.SHAPE_BRIEFS_PER_RUN) || 5;

for (const [fp, slugs] of groups) {
  if (slugs.length <= THRESHOLD) continue;
  for (const slug of slugs) {
    const peers = slugs.filter(s => s !== slug);
    insertAudit.run(slug, fp, JSON.stringify(peers), peers.length, 1);
    flagged++;
  }
  // Issue at most `cap` redesign briefs per run so we don't flood the queue.
  // Pick the largest/most-converged group first by emission order.
  for (const slug of slugs.slice(0, 1)) {
    if (briefsIssued >= cap) break;
    // Skip if a pending shape-redesign brief for this slug already exists.
    const dupe = db.prepare(`
      SELECT 1 FROM briefs WHERE worker='weaver' AND status='pending'
       AND scope_json LIKE ? LIMIT 1
    `).get(`%"slug":"${slug}"%`);
    if (dupe) continue;
    briefs.issue({
      worker: 'weaver',
      goal: `Shape-redesign for ${slug}: TOC fingerprint shared with ${slugs.length - 1} peers.`,
      whyNow: 'shape-auditor flagged convergent TOC',
      scope: { kind: 'shape-redesign', slug, peers: slugs.filter(s => s !== slug).slice(0, 10) },
      deliverables: { rewrite: `src/content/articles/${slug}.mdx` },
      constraints: { token_budget: 40000 },
    });
    briefsIssued++;
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Audit: ${flagged} articles flagged for TOC convergence; ${briefsIssued} weaver briefs issued.` });
console.log(`[${WORKER}] flagged=${flagged} briefs=${briefsIssued} groups=${groups.size}`);
