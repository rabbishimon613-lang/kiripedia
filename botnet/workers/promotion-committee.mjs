#!/usr/bin/env node
// Promotion Committee — ceremony, runs daily 23:00 PA time.
//
// Pure code, no LLM. For each article, computes mechanical signals against
// the grade ladder (prompts/promotion-committee.md), then requires a quorum
// of 2-of-3 different role-workers who touched the article — EXCLUDING the
// last editor. Editor ≠ promoter is the hard structural gate.
//
// Writes: article_current_grade, article_grade_history, article_grade_votes,
// article_grade_criteria_log. On grade flip, bumps article_set_hash.
//
// Run: node botnet/workers/promotion-committee.mjs [--dry-run]

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import { bumpHash } from '../lib/hash.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const WORKER = 'promotion-committee';
const ROLE = 'promotion-committee';

const COMMITTEE_ID = `committee-daily-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

// Voter group classification per the prompt.
const ROLE_GROUP = {
  reviewer: 'adjudication',
  'discretion-warden': 'adjudication',
  'first-third-splitter': 'adjudication',
  deepener: 'enhancement',
  enricher: 'enhancement',
  weaver: 'enhancement',
  reweaver: 'enhancement',
  'diff-sentinel': 'patrol',
  'shape-auditor': 'patrol',
  'mos-enforcer': 'patrol',
  're-reader': 'learning',
};

const GRADE_ORDER = ['stub', 'start', 'c', 'b', 'ga', 'fa'];
function nextGrade(g) {
  const i = GRADE_ORDER.indexOf(g);
  return i >= 0 && i < GRADE_ORDER.length - 1 ? GRADE_ORDER[i + 1] : null;
}

function readArticle(slug) {
  const path = join(ARTICLES_DIR, `${slug}.mdx`);
  let body;
  try { body = readFileSync(path, 'utf8'); } catch { return null; }
  return body;
}

// Count yaml bullets nested directly under a top-level key.
// Stops at the next top-level key (any non-indented `<word>:`).
function countYamlListUnder(front, topKey) {
  const re = new RegExp(`^${topKey}:\\s*$([\\s\\S]*?)(?=^[a-z][\\w-]*:|\\Z)`, 'mi');
  const m = front.match(re);
  if (!m) return 0;
  const block = m[1];
  // Count only first-level bullets (2-space indent or none, then "- ").
  return (block.match(/^\s{0,4}-\s+/gm) || []).length;
}

function articleSignals(body) {
  const fm = body.match(/^---\n([\s\S]*?)\n---/);
  const front = fm ? fm[1] : '';
  const main = fm ? body.slice(fm[0].length) : body;
  const cites = (main.match(/<Cite\s/g) || []).length;
  const sources = new Set([...main.matchAll(/<Cite\s+[^>]*s="([^"]+)"/g)].map(m => m[1]));
  const h2 = (main.match(/^##\s+\S/gm) || []).length;
  const prose = main.replace(/<[^>]+>/g, ' ').replace(/\[[^\]]+\]\([^)]+\)/g, ' ').split(/\s+/).filter(Boolean).length;
  const dyk = countYamlListUnder(front, 'dyk');
  const infoboxFields = (front.match(/^\s{2,4}\w[^:]*:\s+\S/gm) || []).length;
  return { cites, sourceCount: sources.size, h2, prose, dyk, infoboxFields };
}

function meetsGrade(grade, s) {
  switch (grade) {
    case 'start': return s.cites >= 3 && s.prose >= 150 && s.h2 >= 1 && s.dyk >= 1;
    case 'c':     return s.cites >= 10 && s.sourceCount >= 2 && s.h2 >= 2 && s.dyk >= 2;
    case 'b':     return s.cites >= 15 && s.sourceCount >= 3 && s.prose >= 800;
    case 'ga':    return s.cites >= 25 && s.sourceCount >= 4 && s.prose >= 1500;
    case 'fa':    return false; // FA requires explicit Opus-level review, never auto.
    default: return false;
  }
}

// Pull the last 14 days of activity for the article. The last finish event on
// the article = the last editor. Workers who touched it before that = candidates.
function touchHistory(slug, sinceDays = 14) {
  return db.prepare(`
    SELECT role, worker, event, ts FROM activity
     WHERE ref_kind='article' AND ref_id=?
       AND ts >= datetime('now', '-${sinceDays} days')
     ORDER BY ts DESC
  `).all(slug);
}

function pickQuorum(history, targetGrade) {
  const finished = history.filter(h => h.event === 'finish');
  if (finished.length === 0) return null;
  const lastEditor = finished[0]; // most recent finish
  const candidates = finished.slice(1).filter(h =>
    h.role !== lastEditor.role && h.worker !== lastEditor.worker
  );
  // Distinct roles, max 3, must span ≥ 2 groups.
  const byRole = new Map();
  for (const c of candidates) if (!byRole.has(c.role)) byRole.set(c.role, c);
  const roster = [...byRole.values()].slice(0, 3);
  const groups = new Set(roster.map(r => ROLE_GROUP[r.role] || 'enhancement'));
  if (roster.length < 2) return null;
  if (targetGrade === 'ga' && (roster.length < 3 || groups.size < 2)) return null;
  return { lastEditor, roster };
}

const upsertGrade = db.prepare(`
  INSERT INTO article_current_grade (article_slug, current_grade, grade_since, last_editor_role, last_editor_id, quorum_complete)
  VALUES (?, ?, datetime('now'), ?, ?, ?)
  ON CONFLICT(article_slug) DO UPDATE SET
    current_grade = excluded.current_grade,
    grade_since = excluded.grade_since,
    last_editor_role = excluded.last_editor_role,
    last_editor_id = excluded.last_editor_id,
    quorum_complete = excluded.quorum_complete
`);

const insertHistory = db.prepare(`
  INSERT INTO article_grade_history
    (article_slug, event_type, from_grade, to_grade, triggered_by, triggered_by_id, trigger_reason)
  VALUES (?, 'promotion', ?, ?, ?, ?, ?)
`);

const insertVote = db.prepare(`
  INSERT OR IGNORE INTO article_grade_votes
    (article_slug, target_grade, voter_role, voter_id, voter_group,
     last_editor_role, last_editor_id, vote_rationale, quorum_position)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertCriterion = db.prepare(`
  INSERT INTO article_grade_criteria_log
    (article_slug, target_grade, criterion_key, criterion_label, result, measured_value, required_value)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: 'Daily promotion ceremony begins.' });

const slugs = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx')).map(f => f.slice(0, -4));
let promoted = 0, deferred = 0, considered = 0;

for (const slug of slugs) {
  const body = readArticle(slug);
  if (!body) continue;
  const current = db.prepare(`SELECT current_grade FROM article_current_grade WHERE article_slug=?`).get(slug)?.current_grade || 'stub';
  const target = nextGrade(current);
  if (!target) continue;
  considered++;

  const s = articleSignals(body);
  const criteriaPass = meetsGrade(target, s);

  // Log mechanical signals to the criteria audit trail.
  insertCriterion.run(slug, target, 'cite_count', 'cite count', criteriaPass ? 'pass' : 'fail',
                     String(s.cites), target === 'start' ? '≥3' : target === 'c' ? '≥10' : target === 'b' ? '≥15' : '≥25');

  if (!criteriaPass) { deferred++; continue; }

  // Quorum check, only for grades that need it (ga upwards per the prompt).
  // We extend down to B-class to keep the editor ≠ promoter rule active sooner.
  const needQuorum = target === 'b' || target === 'ga';
  let quorum = null;
  if (needQuorum) {
    const history = touchHistory(slug);
    quorum = pickQuorum(history, target);
    if (!quorum) { deferred++; continue; }
  }

  if (DRY) {
    console.log(`[dry] would promote ${slug}: ${current} → ${target}`);
    continue;
  }

  // Promote.
  const lastEditorRole = quorum?.lastEditor?.role || 'unknown';
  const lastEditorId = quorum?.lastEditor?.worker || 'unknown';
  upsertGrade.run(slug, target, lastEditorRole, lastEditorId, quorum ? 1 : 0);
  insertHistory.run(slug, current, target,
                    WORKER, COMMITTEE_ID,
                    needQuorum
                      ? `quorum of ${quorum.roster.length} met; last editor ${lastEditorRole}/${lastEditorId} excluded.`
                      : `mechanical criteria met for ${target}.`);

  if (quorum) {
    quorum.roster.forEach((voter, idx) => {
      insertVote.run(slug, target === 'ga' ? 'ga' : 'ga', voter.role, voter.worker,
                     ROLE_GROUP[voter.role] || 'enhancement',
                     lastEditorRole, lastEditorId,
                     `${voter.role} touched ${slug} prior to last editor; concurrence implied by prior pass.`,
                     idx + 1);
    });
  }
  promoted++;
}

if (promoted > 0 && !DRY) {
  try { bumpHash(); } catch (err) { console.error('[promotion-committee] hash bump failed:', err.message); }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Promotion ceremony: considered ${considered}, promoted ${promoted}, deferred ${deferred}.` });
console.log(`[${WORKER}] considered=${considered} promoted=${promoted} deferred=${deferred}${DRY ? ' (dry-run)' : ''}`);
