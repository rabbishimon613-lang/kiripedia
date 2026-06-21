// snapshot-writer: emits webview-ui/public/snapshot.json for the pixel office.
// Reads recent activity from SQLite and translates per-role state.
//
// Run: node botnet/lib/snapshot-writer.mjs

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
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
    else if (last.event === 'finish')  action = `Done: ${last.detail || ''}`;
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

const snapshot = {
  generated_at: new Date().toISOString(),
  bots,
  last_cycle: lastCycle,
  counts,
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2));
console.log(`[snapshot] wrote ${OUT_PATH} (${bots.length} bots, ${recent.length} recent events)`);
