#!/usr/bin/env node
// MoS Enforcer — mechanical style pass.
//
// Runs the existing audit tools (audit-frontmatter, audit-wikilinks,
// audit-events, audit-doctrine) and records violations against the
// article_grade_criteria_log so promotion is gated on style compliance.
//
// We do not auto-fix here. The existing audit scripts emit human-readable
// reports; the Coordinator and human reviewers act on them. The Enforcer's
// job is to keep the signal in the database so the Promotion Committee can
// gate B-class and above on a clean MoS pass.
//
// Run: node botnet/workers/mos-enforcer.mjs

import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');

const WORKER = 'mos-enforcer';
const ROLE = 'mos-enforcer';

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: 'Running MoS audits.' });

const tools = [
  { name: 'frontmatter', path: 'tools/audit-frontmatter.mjs', criterion: 'mos_frontmatter' },
  { name: 'wikilinks',   path: 'tools/audit-wikilinks.mjs',   criterion: 'mos_wikilinks' },
  { name: 'events',      path: 'tools/audit-events.mjs',      criterion: 'mos_events' },
  { name: 'doctrine',    path: 'tools/audit-doctrine.mjs',    criterion: 'mos_doctrine' },
];

const insertCriterion = db.prepare(`
  INSERT INTO article_grade_criteria_log
    (article_slug, target_grade, criterion_key, criterion_label, result, measured_value, required_value, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let passed = 0, failed = 0;

for (const tool of tools) {
  let out = '';
  let ok = true;
  try {
    out = execSync(`node ${tool.path}`, { cwd: REPO_ROOT, encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    ok = false;
    out = (err.stdout?.toString() || '') + '\n' + (err.stderr?.toString() || '');
  }

  // Per-tool slug attribution.
  //
  // audit-wikilinks emits "  <slug>.mdx:<line>  [text] → ..." — the offender
  // is the SOURCE article (the one carrying the suspicious link).
  // audit-frontmatter prints "<count> files clean" when happy; offenders
  // are named with a leading "✖ <slug>" or "<slug>.mdx" path in error mode.
  // audit-events / audit-doctrine are summary-style; we only mark
  // tool-level failure (no per-slug attribution) when they exit non-zero.
  const offenders = new Set();
  if (tool.name === 'wikilinks') {
    for (const line of out.split('\n')) {
      const m = line.match(/^\s+([a-z0-9][a-z0-9-]+)\.mdx:\d+/);
      if (m) offenders.add(m[1]);
    }
  } else if (tool.name === 'frontmatter') {
    for (const line of out.split('\n')) {
      const m = line.match(/(?:✖|✗|FAIL)\s+([a-z0-9][a-z0-9-]+)\.mdx/);
      if (m) offenders.add(m[1]);
    }
  }
  // For events/doctrine we keep tool-level signal only.

  if (!ok || offenders.size > 0) {
    failed++;
    if (offenders.size > 0) {
      for (const slug of offenders) {
        insertCriterion.run(slug, 'b', tool.criterion, `MoS — ${tool.name}`, 'fail',
                            '1', '0', `audit ${tool.name} reported issue for ${slug}`);
      }
    } else {
      // Tool-level failure with no per-slug attribution — log a synthetic row
      // against a sentinel slug so the criterion log still tracks it.
      insertCriterion.run('*all*', 'b', tool.criterion, `MoS — ${tool.name}`, 'fail',
                          '1', '0', `audit ${tool.name} exited non-zero`);
    }
  } else {
    passed++;
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `MoS audits: ${passed} clean, ${failed} reporting violations.` });
console.log(`[${WORKER}] passed=${passed} failed=${failed}`);
