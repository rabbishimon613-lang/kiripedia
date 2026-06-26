// snapshot-writer: emits webview-ui/public/snapshot.json for the pixel office.
// Reads recent activity from SQLite and translates per-role state.
//
// Run: node botnet/lib/snapshot-writer.mjs

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
// Writes to the KiriPedia public dir so the /meet-the-team page can fetch it.
const OUT_PATH = process.env.SNAPSHOT_PATH ||
  join(REPO_ROOT, 'public', 'botnet-snapshot.json');

// Bot keys must match office/server/snapshotWatcher.ts KIRI_BOTS exactly
// (underscored form). Roles map worker names (which are kebab-case) to one
// or more underscored bot keys via the prefix table below.
const BOT_KEYS = [
  'recent_changes', 'npp', 'source_auth',
  'scribe_1', 'scribe_2', 'scribe_3',
  'cataloger_1', 'cataloger_2',
  'reviewer', 'coordinator', 'indexer',
  'deepener', 'enricher', 'weaver',
  'reweaver', 'prospector', 'mouth_sentry',
];
const LABELS = {
  recent_changes: 'Recent Changes Bot',
  npp: 'New Page Patroller',
  source_auth: 'Source Authentication Clerk',
  scribe_1: 'Scribe (First Desk)',
  scribe_2: 'Scribe (Second Desk)',
  scribe_3: 'Scribe (Third Desk)',
  cataloger_1: 'Cataloger-Editor (First Desk)',
  cataloger_2: 'Cataloger-Editor (Second Desk)',
  reviewer: 'Grounding Reviewer',
  coordinator: 'WikiProject Coordinator',
  indexer: 'Indexer',
  deepener: 'Transcript Deepener',
  enricher: 'Cross-Source Enricher',
  weaver: 'Article Weaver',
  reweaver: 'Tapestry Reweaver',
  prospector: 'Transcript Prospector',
  mouth_sentry: 'Mouth Sentry',
};
// Worker name (from db.activity.role / worker fields) → bot key it occupies.
// Multi-instance roles use the worker name suffix to disambiguate (scribe-1 → scribe_1).
function workerToBotKey(workerName, role) {
  if (!workerName) return null;
  const norm = workerName.replace(/-/g, '_');
  if (BOT_KEYS.includes(norm)) return norm;
  // Try role with index suffix (e.g. role="scribe", worker="scribe-2" → scribe_2)
  const m = workerName.match(/^([a-z-]+)[- _]?(\d+)$/);
  if (m) {
    const candidate = `${m[1].replace(/-/g, '_')}_${m[2]}`;
    if (BOT_KEYS.includes(candidate)) return candidate;
  }
  // Fall back to first key starting with the role prefix
  const normRole = (role || '').replace(/-/g, '_');
  return BOT_KEYS.find(k => k === normRole || k.startsWith(normRole + '_')) ?? null;
}

// For each WORKER (not role), find the most recent activity in the last 5 min.
// One bot key per row of `bots` array, even when a role has N instances.
const recent = db.prepare(`
  SELECT * FROM activity
  WHERE ts > datetime('now', '-5 minutes')
  ORDER BY ts DESC
`).all();

const byBotKey = {};
for (const r of recent) {
  const key = workerToBotKey(r.worker, r.role);
  if (key && !byBotKey[key]) byBotKey[key] = r;
}

const bots = BOT_KEYS.map((key) => {
  const last = byBotKey[key];
  let action = 'idle';
  let handoff = null;
  if (last) {
    if (last.event === 'start')   action = last.detail || 'working';
    else if (last.event === 'finish') {
      action = `Done: ${last.detail || ''}`;
      // Workers carry the handoff target on finish events via handoff_to.
      // Accept that path so the office animates the baton-pass.
      if (last.handoff_to) {
        handoff = workerToBotKey(last.handoff_to, last.handoff_to) || last.handoff_to;
      }
    }
    else if (last.event === 'handoff') {
      handoff = workerToBotKey(last.handoff_to, last.handoff_to) || last.handoff_to;
      action = `Handoff to ${LABELS[handoff] || handoff}`;
    }
  }
  return {
    key,
    label: LABELS[key],
    action,
    handoff_to: handoff,
    ts: last?.ts || null,
  };
});

// Cycle stats
const lastCycle = db.prepare(`SELECT * FROM cycles ORDER BY id DESC LIMIT 1`).get();
const counts = {
  leads_pending: db.prepare(`SELECT COUNT(*) AS n FROM clips WHERE status='lead'`).get().n,
  triaged_on: db.prepare(`SELECT COUNT(*) AS n FROM clips WHERE status='triaged_on'`).get().n,
  transcribed: db.prepare(`SELECT COUNT(*) AS n FROM clips WHERE status='transcribed'`).get().n,
  catalogued: db.prepare(`SELECT COUNT(*) AS n FROM clips WHERE status='catalogued'`).get().n,
  published: db.prepare(`SELECT COUNT(*) AS n FROM clips WHERE status='published'`).get().n,
  quarantined_claims: db.prepare(`SELECT COUNT(*) AS n FROM quarantine WHERE kind='claim'`).get().n,
  quarantined_clips: db.prepare(`SELECT COUNT(*) AS n FROM quarantine WHERE kind='clip'`).get().n,
};

// Last 30 actions across the whole bureau, newest first. Drives the
// page-level activity log on /meet-the-team — independent of the per-bot
// office snapshot, so multiple consecutive events from the same worker
// each get their own row.
// Patterns that indicate a finish event produced zero real work.
// These clutter the visible activity log without conveying progress.
const NULL_RESULT = [
  /imported 0 new.*0 existing/i,
  /marked 0 air-?dates/i,
  /pinned 0 dates/i,
  /0 jumped to/i,
  /no new clips today/i,
  /no passed claims waiting/i,
  /empty, all caught up/i,
  /every gap was already filled/i,
  /they all got drafted this round/i,
  /none read raggy this round/i,
  /^0\b/,
  /skipped \d+\.\s*$/i,
];
function isNullResult(detail) {
  if (!detail) return true;
  return NULL_RESULT.some(re => re.test(detail));
}

const recentEvents = db.prepare(`
  SELECT ts, worker, role, event, detail, handoff_to
  FROM activity
  WHERE event != 'idle'
  ORDER BY ts DESC, id DESC
  LIMIT 120
`).all().reduce((acc, r) => {
  if (acc.length >= 30) return acc;
  // Drop finish events that report zero real work
  if (r.event === 'finish' && isNullResult(r.detail)) return acc;
  const botKey = workerToBotKey(r.worker, r.role);
  let action = r.detail || r.event;
  if (r.event === 'finish') action = `Done: ${r.detail || ''}`;
  else if (r.event === 'handoff') {
    const target = workerToBotKey(r.handoff_to, r.handoff_to) || r.handoff_to;
    action = `Handoff to ${LABELS[target] || target || ''}`;
  }
  acc.push({
    ts: r.ts,
    key: botKey || r.worker,
    label: LABELS[botKey] || r.worker,
    event: r.event,
    action,
  });
  return acc;
}, []);

// Words written per day for the last 7 days (merged claims, word count from claim_text).
// Word count approximation: number of whitespace-separated tokens.
const wordsByDay = db.prepare(`
  SELECT date(reviewed_at) AS day,
         SUM(LENGTH(TRIM(claim_text)) - LENGTH(REPLACE(TRIM(claim_text), ' ', '')) + 1) AS words
  FROM claims
  WHERE status = 'merged'
    AND reviewed_at >= date('now', '-6 days')
  GROUP BY day
  ORDER BY day ASC
`).all();

// Build a dense 7-entry array (oldest → today), filling missing days with 0.
const wordsMap = {};
for (const r of wordsByDay) wordsMap[r.day] = r.words || 0;
const words7d = [];
for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - i);
  const key = d.toISOString().slice(0, 10);
  words7d.push({ date: key, words: wordsMap[key] || 0 });
}
const wordsToday = words7d[words7d.length - 1].words;

// Office manager state — provider health, calls today, cost today
const OFFICE_STATE_PATH = join(REPO_ROOT, 'botnet', 'data', 'office-state.json');
let officeState = null;
try {
  if (existsSync(OFFICE_STATE_PATH)) {
    const raw = JSON.parse(readFileSync(OFFICE_STATE_PATH, 'utf8'));
    officeState = {
      day: raw.day,
      last_probe: raw.last_probe,
      calls_today: raw.calls_today || 0,
      cost_today: raw.cost_today || 0,
      dead_keys: Object.keys(raw.dead_keys || {}).length,
    };
  }
} catch {}

// Daily orders from the orders-of-day worker
const ORDERS_PATH = join(REPO_ROOT, 'botnet', 'state', 'orders-today.json');
let ordersToday = null;
try {
  if (existsSync(ORDERS_PATH)) {
    const o = JSON.parse(readFileSync(ORDERS_PATH, 'utf8'));
    const today = new Date().toISOString().slice(0, 10);
    if (o.date === today) ordersToday = o;
  }
} catch {}

const snapshot = {
  generated_at: new Date().toISOString(),
  bots,
  recent_events: recentEvents,
  last_cycle: lastCycle,
  counts,
  words_today: wordsToday,
  words_7d: words7d,
  orders_today: ordersToday,
  office_state: officeState,
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2));
console.log(`[snapshot] wrote ${OUT_PATH} (${bots.length} bots, ${recent.length} recent events)`);
