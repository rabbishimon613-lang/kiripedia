#!/usr/bin/env node
// Research-team dashboard snapshot writer.
//
// Emits the schema described in RESEARCH-TEAM-BUILD.md §8 to
// public/snapshot.json. Pure read-only; safe to run at the end of every
// cycle. The /research-team Astro route polls this file every 15s.

import './env.mjs';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.mjs';
import { articleSetHash } from './hash.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const OUT = join(REPO_ROOT, 'public', 'snapshot.json');

const ROSTER = [
  // Discovery — off for month one.
  { role: 'channel-crawler',    lane: 'discovery',      live: false },
  { role: 'seed-gardener',      lane: 'discovery',      live: false },
  { role: 'podcast-sweeper',    lane: 'discovery',      live: false },
  { role: 'archive-diver',      lane: 'discovery',      live: false },
  // Acquisition.
  { role: 'scribe',             lane: 'acquisition',    live: true },
  { role: 'fingerprinter',      lane: 'acquisition',    live: false },
  // Extraction.
  { role: 'cataloger',          lane: 'extraction',     live: true },
  { role: 'passage-embedder',   lane: 'extraction',     live: false },
  // Adjudication.
  { role: 'reviewer',           lane: 'adjudication',   live: true },
  { role: 'discretion-warden',  lane: 'adjudication',   live: true },
  { role: 'first-third-splitter', lane: 'adjudication', live: true },
  // Filing.
  { role: 'coordinator',        lane: 'filing',         live: true },
  { role: 'triage-patroller',   lane: 'filing',         live: true },
  // Enhancement.
  { role: 'deepener',           lane: 'enhancement',    live: true },
  { role: 'enricher',           lane: 'enhancement',    live: true },
  { role: 'weaver',             lane: 'enhancement',    live: true },
  { role: 'reweaver',           lane: 'enhancement',    live: true },
  // Patrol.
  { role: 'diff-sentinel',      lane: 'patrol',         live: true },
  { role: 'shape-auditor',      lane: 'patrol',         live: true },
  { role: 'mos-enforcer',       lane: 'patrol',         live: true },
  // Continual learning.
  { role: 're-reader',          lane: 'learning',       live: true },
  { role: 'contradiction-scout', lane: 'learning',      live: false },
  // Ceremony.
  { role: 'promotion-committee', lane: 'ceremony',      live: true },
];

const LATEST_ACTIVITY = db.prepare(`
  SELECT a.* FROM activity a
   WHERE role = ?
   ORDER BY ts DESC LIMIT 1
`);

function rosterRow(r) {
  const last = LATEST_ACTIVITY.get(r.role);
  let state = r.live ? 'idle' : 'off';
  let workingOn = null;
  if (last) {
    if (last.event === 'start') state = 'working';
    else if (last.event === 'finish') state = 'idle';
    else if (last.event === 'handoff') state = 'handoff';
    workingOn = (last.detail || '').slice(0, 120);
  }
  return {
    role: r.role,
    lane: r.lane,
    state,
    working_on: workingOn,
    last_action_at: last?.ts || null,
  };
}

function boardLanes() {
  const briefs = db.prepare(`SELECT * FROM briefs ORDER BY created_at DESC LIMIT 200`).all();
  const cardOf = (b) => {
    let scope = {};
    try { scope = JSON.parse(b.scope_json); } catch {}
    return {
      brief_id: b.brief_id.slice(0, 8),
      worker: b.worker,
      goal: b.goal,
      slug: scope.slug || scope.source_slug || scope.video_id || null,
      created_at: b.created_at,
      claimed_by: b.claimed_by,
    };
  };
  return {
    backlog: briefs.filter(b => b.status === 'pending' && !b.claimed_by).slice(0, 50).map(cardOf),
    ready:   [], // we don't currently distinguish ready vs backlog
    running: briefs.filter(b => b.status === 'claimed').slice(0, 50).map(cardOf),
    review:  [],
    blocked: briefs.filter(b => b.status === 'quarantined').slice(0, 25).map(cardOf),
    done:    briefs.filter(b => b.status === 'done').slice(0, 25).map(cardOf),
  };
}

function activityStream() {
  return db.prepare(`
    SELECT ts, worker, role, event, detail, ref_kind, ref_id, handoff_to
      FROM activity
     WHERE event != 'idle'
     ORDER BY ts DESC, id DESC
     LIMIT 50
  `).all().map(r => ({
    ts: r.ts,
    worker: r.worker,
    role: r.role,
    summary: r.detail || r.event,
    link: r.ref_kind === 'article' && r.ref_id ? `/wiki/${r.ref_id}` :
          r.ref_kind === 'clip' && r.ref_id ? `/sources/${r.ref_id}` : null,
  }));
}

function stats() {
  const articlesToday = db.prepare(`
    SELECT COUNT(DISTINCT ref_id) AS n FROM activity
     WHERE ref_kind='article' AND ts >= date('now')
  `).get().n;
  const wordsAdded = db.prepare(`
    SELECT COALESCE(SUM(LENGTH(TRIM(claim_text)) - LENGTH(REPLACE(TRIM(claim_text), ' ', '')) + 1), 0) AS n
      FROM claims
     WHERE status='merged' AND date(reviewed_at) = date('now')
  `).get().n;
  const claimsFiled = db.prepare(`
    SELECT COUNT(*) AS n FROM claims WHERE date(extracted_at) = date('now')
  `).get().n;
  const suspectQueue = db.prepare(`
    SELECT COUNT(*) AS n FROM claims WHERE status IN ('pending_review','passed','passed_low') AND discretion_status IS NULL
  `).get().n;
  const grades = db.prepare(`
    SELECT current_grade, COUNT(*) AS n FROM article_current_grade GROUP BY current_grade
  `).all().reduce((acc, r) => (acc[r.current_grade] = r.n, acc), {});
  const driftToday = db.prepare(`SELECT COUNT(*) AS n FROM drift_incidents WHERE date(at) = date('now')`).get().n;

  // Hot key counts come from llm-fleet/.env (loaded at process start)
  const hot_keys = {
    cerebras: (process.env.CEREBRAS_API_KEYS || process.env.CEREBRAS_KEYS || '').split(',').filter(Boolean).length,
    groq:     (process.env.GROQ_API_KEYS || process.env.GROQ_KEYS || '').split(',').filter(Boolean).length,
    openrouter: (process.env.OPENROUTER_API_KEYS || '').split(',').filter(Boolean).length,
  };

  // Cost today from office-state if available
  let cost_today = 0;
  const stPath = join(REPO_ROOT, 'botnet', 'data', 'office-state.json');
  try {
    if (existsSync(stPath)) cost_today = JSON.parse(readFileSync(stPath, 'utf8')).cost_today || 0;
  } catch {}

  return {
    articles_touched_today: articlesToday,
    words_added: wordsAdded,
    claims_filed: claimsFiled,
    suspect_queue: suspectQueue,
    drift_today: driftToday,
    grades,
    cost_today,
    hot_keys,
  };
}

const lastCycle = db.prepare(`SELECT * FROM cycles ORDER BY id DESC LIMIT 1`).get() || {};

const snapshot = {
  cycle_id: lastCycle.id || null,
  started_at: lastCycle.started_at || null,
  ended_at: lastCycle.ended_at || null,
  article_set_hash: (() => { try { return articleSetHash(); } catch { return null; } })(),
  roster: ROSTER.map(rosterRow),
  board: boardLanes(),
  activity: activityStream(),
  stats: stats(),
  generated_at: new Date().toISOString(),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
console.log(`[research-team-snapshot] wrote ${OUT} — roster=${snapshot.roster.length} board.backlog=${snapshot.board.backlog.length} activity=${snapshot.activity.length}`);
