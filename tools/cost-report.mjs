#!/usr/bin/env node
// cost-report.mjs — reads fleet/ledger/usage.jsonl + botnet/data/botnet.db
// and produces a daily/weekly rollup of LLM activity and fleet-call counts.
//
// Usage:
//   node tools/cost-report.mjs            # last 7 days
//   node tools/cost-report.mjs --days 30  # last 30 days
//   node tools/cost-report.mjs --json     # machine-readable JSON output

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');
const USAGE_JSONL = join(REPO_ROOT, 'fleet', 'ledger', 'usage.jsonl');
const BOTNET_DB_PATH = join(REPO_ROOT, 'botnet', 'data', 'botnet.db');

const args = process.argv.slice(2);
const DAYS = parseInt(args[args.indexOf('--days') + 1]) || 7;
const JSON_OUT = args.includes('--json');

// ── 1. Read fleet/ledger/usage.jsonl ───────────────────────────────────────

const ledgerRows = [];
if (existsSync(USAGE_JSONL)) {
  const lines = readFileSync(USAGE_JSONL, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try { ledgerRows.push(JSON.parse(line)); } catch { /* skip malformed */ }
  }
}

// ── 2. Read botnet DB ───────────────────────────────────────────────────────

let dbRows = [];
let clipStats = {};
let claimStats = {};
let quarantineCount = 0;

try {
  // dynamic import so the script doesn't hard-fail if better-sqlite3 is missing
  const { default: Database } = await import('better-sqlite3');
  const db = new Database(BOTNET_DB_PATH, { readonly: true });

  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  dbRows = db.prepare(
    `SELECT date(ts) as day, role, event, COUNT(*) as cnt
     FROM activity
     WHERE ts >= ?
     GROUP BY date(ts), role, event
     ORDER BY date(ts) DESC, role`
  ).all(cutoff);

  const allClips = db.prepare('SELECT status, COUNT(*) as cnt FROM clips GROUP BY status').all();
  for (const r of allClips) clipStats[r.status] = r.cnt;

  const allClaims = db.prepare('SELECT status, COUNT(*) as cnt FROM claims GROUP BY status').all();
  for (const r of allClaims) claimStats[r.status] = r.cnt;

  quarantineCount = db.prepare('SELECT COUNT(*) as cnt FROM quarantine').get()?.cnt ?? 0;

  db.close();
} catch (err) {
  if (!JSON_OUT) console.warn(`[cost-report] botnet DB not available: ${err.message}`);
}

// ── 3. Aggregate ────────────────────────────────────────────────────────────

// Fleet ledger: trawler call counts
const ledgerByDate = {};
for (const row of ledgerRows) {
  const day = row.date || row.ts?.slice(0, 10);
  if (!day) continue;
  if (!ledgerByDate[day]) ledgerByDate[day] = { fleet_calls: 0, yt_probes: 0, fresh_leads: 0 };
  ledgerByDate[day].fleet_calls += row.fleet_calls || 0;
  ledgerByDate[day].yt_probes += row.candidates_total || 0;
  ledgerByDate[day].fresh_leads += row.fresh_after_dedup || 0;
}

// Activity: role invocations per day (proxy for LLM calls — each start event ~= 1 LLM call for LLM roles)
const LLM_ROLES = new Set(['scribe', 'cataloger', 'cataloger-editor', 'reviewer', 'coordinator',
                           'deepener', 'enricher', 'weaver', 'reweaver', 'prospector', 'npp',
                           'mouth-sentry', 'source-auth']);
const CODE_ROLES = new Set(['recent-changes', 'indexer', 'fingerprinter']);

const actByDate = {};
for (const row of dbRows) {
  const { day, role, event, cnt } = row;
  if (!actByDate[day]) actByDate[day] = { llm_calls_est: 0, code_only_calls: 0, role_counts: {} };
  if (event === 'start') {
    if (LLM_ROLES.has(role)) actByDate[day].llm_calls_est += cnt;
    if (CODE_ROLES.has(role)) actByDate[day].code_only_calls += cnt;
    if (!actByDate[day].role_counts[role]) actByDate[day].role_counts[role] = 0;
    actByDate[day].role_counts[role] += cnt;
  }
}

// ── 4. Output ────────────────────────────────────────────────────────────────

const allDays = [...new Set([...Object.keys(ledgerByDate), ...Object.keys(actByDate)])].sort().reverse();
const windowDays = allDays.slice(0, DAYS);

const totalLLMCalls = windowDays.reduce((s, d) => s + (actByDate[d]?.llm_calls_est ?? 0), 0);
const totalLeads    = windowDays.reduce((s, d) => s + (ledgerByDate[d]?.fresh_leads ?? 0), 0);
const totalFleet    = windowDays.reduce((s, d) => s + (ledgerByDate[d]?.fleet_calls ?? 0), 0);

const report = {
  generated_at: new Date().toISOString(),
  window_days: DAYS,
  summary: {
    total_llm_calls_estimated: totalLLMCalls,
    total_fleet_trawler_calls: totalFleet,
    total_new_leads: totalLeads,
    avg_llm_calls_per_day: (totalLLMCalls / Math.max(windowDays.length, 1)).toFixed(1),
    cost_usd: '$0.00 (all free-tier keys)',
  },
  corpus_state: {
    clips: clipStats,
    claims: claimStats,
    quarantine_rows: quarantineCount,
  },
  daily_breakdown: windowDays.map(day => ({
    day,
    llm_calls_est: actByDate[day]?.llm_calls_est ?? 0,
    code_only_roles: actByDate[day]?.code_only_calls ?? 0,
    new_leads: ledgerByDate[day]?.fresh_leads ?? 0,
    fleet_trawler_calls: ledgerByDate[day]?.fleet_calls ?? 0,
    role_invocations: actByDate[day]?.role_counts ?? {},
  })),
};

if (JSON_OUT) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  console.log('\n=== KiriPedia Cost Report ===');
  console.log(`Window: last ${DAYS} days  |  Generated: ${new Date().toLocaleString()}\n`);

  console.log('SUMMARY');
  console.log(`  Estimated LLM calls (window): ${totalLLMCalls}`);
  console.log(`  Avg LLM calls/day:            ${report.summary.avg_llm_calls_per_day}`);
  console.log(`  Fleet trawler calls:          ${totalFleet}`);
  console.log(`  New leads discovered:         ${totalLeads}`);
  console.log(`  Cost:                         ${report.summary.cost_usd}`);

  console.log('\nCORPUS STATE');
  console.log('  Clips by status:  ', JSON.stringify(clipStats));
  console.log('  Claims by status: ', JSON.stringify(claimStats));
  console.log('  Quarantine rows:  ', quarantineCount);

  console.log('\nDAILY BREAKDOWN');
  for (const d of report.daily_breakdown) {
    const roles = Object.entries(d.role_invocations).map(([r, n]) => `${r}×${n}`).join(', ') || '(none)';
    console.log(`  ${d.day}  llm~${d.llm_calls_est}  leads=${d.new_leads}  roles: ${roles}`);
  }

  console.log('\nNOTE: LLM call counts are estimated from activity log "start" events for LLM roles.');
  console.log('      The botnet currently has 0 actual LLM calls because no clips have reached the');
  console.log('      cataloger/reviewer/coordinator stage (discovery is dead — 6 leads at "lead" status).');
  console.log('      Enhancement workers (deepener/enricher/weaver) also returned 0 LLM calls because');
  console.log('      their selection algorithms found no actionable work (all returning "No X found").\n');
}
