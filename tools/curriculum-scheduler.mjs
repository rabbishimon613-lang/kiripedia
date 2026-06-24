#!/usr/bin/env node
// curriculum-scheduler.mjs
//
// SKELETON. Rebuilds the video_curriculum table — the Re-Reader's queue.
// Run nightly after contradiction-scout.mjs.
//
// Composite score (TEAM-REWORK):
//   next_due_score = staleness × density × contradiction_signal × inverse_visits
//
// Each term is a normalized [0..1] scalar so the product stays
// interpretable. The Re-Reader pulls ORDER BY next_due_score DESC.
//
// Term definitions:
//
//   staleness(r) = clamp01( (now - last_eval_at(r)) / TAU_DAYS ), where
//     last_eval_at(r) is MAX(last_eval_at) over r's passages under the
//     CURRENT article_set_hash. Passages evaluated under an older hash
//     count as never-evaluated (their staleness contribution is 1.0).
//     TAU_DAYS = 30 — past 30 days, staleness saturates at 1.
//
//   density(r) = unmapped_passages(r) / (duration_minutes(r) + 1).
//     Then normalized: density_norm = clamp01(density / DENSITY_REF),
//     where DENSITY_REF = 2.0 (a recording with 2+ unmapped passages
//     per minute is maximally dense — that's a heavily-mined episode
//     with mostly fresh material).
//
//   contradiction_signal(r) = (open_mismatch + open_orphan) / passages(r),
//     summed from contradiction_queue rows for r's passages where
//     consumed_at IS NULL. Normalized by CONTRA_REF = 0.10 (10% of
//     passages flagged = max signal).
//
//   inverse_visits(r) = 1 / (1 + visit_count(r)). Visits saturate
//     quickly so a recording read 5 times still gets 1/6 of its
//     baseline pull, never zero. Combined with article_set_hash-keyed
//     verdicts, this prevents permanent starvation of any recording.

import { join } from 'node:path';
// import Database from 'better-sqlite3';

const ROOT     = '/Volumes/EOS_DIGITAL/KiriPedia';
const GRAPH_DB = join(ROOT, 'data/graph.db');

const TAU_DAYS     = 30;
const DENSITY_REF  = 2.0;
const CONTRA_REF   = 0.10;

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

// ─── Term functions, callable for any (recording_id, now) ─────────────

export function staleness(lastEvalUnix, nowUnix, currentHash, lastEvalHash) {
  if (!lastEvalUnix || lastEvalHash !== currentHash) return 1.0;
  const days = (nowUnix - lastEvalUnix) / 86400;
  return clamp01(days / TAU_DAYS);
}

export function density(unmappedPassages, durationMinutes) {
  const raw = unmappedPassages / (durationMinutes + 1);
  return clamp01(raw / DENSITY_REF);
}

export function contradictionSignal(openSuspects, totalPassages) {
  if (totalPassages === 0) return 0;
  return clamp01((openSuspects / totalPassages) / CONTRA_REF);
}

export function inverseVisits(visitCount) {
  return 1.0 / (1 + visitCount);
}

export function composite(s, d, c, iv) {
  // Pure product is too punishing if any term is 0.
  // Use a softened product: each term floor at 0.05.
  const floor = 0.05;
  return Math.max(s, floor) * Math.max(d, floor) * Math.max(c, floor) * Math.max(iv, floor);
}

// ─── Density SQL — the heart of the scheduler ─────────────────────────
//
// "unmapped passages per minute of runtime" — what TEAM-REWORK calls out
// specifically. The SQL:
//
//   WITH per_recording AS (
//     SELECT r.recording_id,
//            r.duration_sec,
//            COUNT(p.passage_id) AS total_passages,
//            SUM(CASE WHEN p.mapped_article_slug IS NULL THEN 1 ELSE 0 END) AS unmapped_passages
//       FROM recordings r
//       LEFT JOIN transcript_passages p ON p.recording_id = r.recording_id
//      GROUP BY r.recording_id
//   )
//   SELECT recording_id,
//          unmapped_passages,
//          ROUND(unmapped_passages * 60.0 / NULLIF(duration_sec, 0), 3) AS unmapped_per_min,
//          total_passages
//     FROM per_recording
//    ORDER BY unmapped_per_min DESC NULLS LAST;
//
// ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[curriculum-scheduler] graph_db=${GRAPH_DB}`);
  console.log(`[curriculum-scheduler] TAU_DAYS=${TAU_DAYS}  DENSITY_REF=${DENSITY_REF}  CONTRA_REF=${CONTRA_REF}`);
  console.log(`[curriculum-scheduler] dry-run: term math demo for a hypothetical recording`);

  const now = Math.floor(Date.now() / 1000);
  const example = {
    last_eval_unix: now - 14 * 86400,   // 14 days stale
    duration_min:   180,                // 3-hour episode
    unmapped:       42,                 // 42 passages unmapped
    open_suspects:  9,                  // 9 contradiction-queue rows open
    total_passages: 350,
    visit_count:    1,
  };
  const s  = staleness(example.last_eval_unix, now, 'hash_v3', 'hash_v3');
  const d  = density(example.unmapped, example.duration_min);
  const c  = contradictionSignal(example.open_suspects, example.total_passages);
  const iv = inverseVisits(example.visit_count);
  const score = composite(s, d, c, iv);
  console.log(`  staleness:           ${s.toFixed(3)}   (14 days / 30 days)`);
  console.log(`  density:             ${d.toFixed(3)}   (42 unmapped / 181 min / DENSITY_REF=2.0)`);
  console.log(`  contradiction:       ${c.toFixed(3)}   (9 suspects / 350 passages / 0.10)`);
  console.log(`  inverse_visits:      ${iv.toFixed(3)}   (1 / (1+1))`);
  console.log(`  composite score:     ${score.toFixed(4)}`);

  // Compare against a freshly-ingested, never-read recording:
  const fresh = composite(1.0, 0.5, 0.0, 1.0);
  console.log(`  fresh recording ref: ${fresh.toFixed(4)} (s=1, d=0.5, c=0, iv=1)`);
  console.log(`  → ${score > fresh ? 'stale-with-signal beats fresh' : 'fresh beats stale-with-signal'}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
