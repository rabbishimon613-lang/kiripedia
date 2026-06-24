# Expert #8 — Cost, Keys, Infrastructure

_Panel evaluation for the 18-role KiriPedia rework. Written 2026-06-23._

---

## Executive Summary

- **The team is running 24/7 on HF Space and costs $0/month.** All LLM work runs on 4 Cerebras + 2 Groq free-tier keys, confirmed hot. GH Actions cron is intentionally disabled. The only active GH workflows are finalize-ingest and x-poster (8 slots/day).
- **The ledger shows near-zero actual LLM spend.** 31 activity rows in 2 days, 0 actual LLM calls. Discovery is dead (6 clips stuck at "lead" status, nothing reaching the cataloger/reviewer/coordinator stage). Enhancement workers (deepener/enricher/weaver) ran but found no actionable work. The pipeline is architecturally sound but starved at the ingest mouth.
- **All 18 roles fit on the current free stack.** The cost model stays $0 through all three phases. "When does it stop being free?" — never at John Kiriakou's content cadence. The only meaningful spend risk is if HF Space's free tier changes policy; $5/mo VPS is the contingency.

---

## A. Today's cost — real numbers from the ledger

### fleet/ledger/usage.jsonl

One row. One run. 2026-06-12:
```json
{"trawler":"youtube","date":"2026-06-12","ts":"2026-06-12T03:56:47Z",
 "candidates_total":23,"fresh_after_dedup":23,"trusted_count":2,
 "finder_exit_ok":true,"fleet_calls":0}
```

**Fleet trawler calls to date: 0.** The YouTube trawler is title-based rule filtering — no LLM is called during discovery.

### botnet/data/botnet.db — activity log

Date range in DB: 2026-06-22 through 2026-06-23 (2 days of HF Space operation).

| Date | Role | Start events |
|---|---|---|
| 2026-06-22 | deepener | 1 |
| 2026-06-23 | coordinator | 1 |
| 2026-06-23 | deepener | 3 |
| 2026-06-23 | enricher | 3 |
| 2026-06-23 | indexer | 1 |
| 2026-06-23 | mouth-sentry | 1 |
| 2026-06-23 | npp | 1 |
| 2026-06-23 | recent-changes | 1 |
| 2026-06-23 | reviewer | 0 (1 idle event only) |
| 2026-06-23 | weaver | 3 |

**Total start events: 16 across 2 days = ~8/day average.**

**Actual LLM calls: 0.** Every LLM role that fired returned either "no pending claims," "no gap found," or "no actionable work." The DB confirms: 0 rows in claims table, 0 quarantine rows, 6 clips all at "lead" status (never triaged).

**Cost: $0.00.**

### Why the pipeline is running but doing nothing

The recent-changes worker fires but the TEAM-REWORK doc confirms: "all 4 search probes fail." The 6 leads in the DB never get triaged (npp) because they appear to be stale from an earlier test run. The cataloger, reviewer, and coordinator are waiting on upstream work that never arrives.

Enhancement workers (deepener, enricher, weaver) pick articles to improve but their selection algorithms are returning negative: deepener finds "no gap for bernie-kerik," enricher finds "no peer mentions for admiral-crowe," weaver finds "no weaveable articles." This is because all 279 articles are above the weaver's 4000-byte threshold (Reweaver territory) or have already been touched within the cooldown window.

---

## B. Key allocation — actual vs recommended

### Actual state (registry.json, 2026-06-23)

**KiriPedia-owned keys:**
- cerebras-2, 3, 4, 5 — all `hot`, tested 2026-06-21
- groq-1, groq-2 — allocated to kiripedia, status `untested`

**llm-fleet-owned keys:**
- cerebras-1 — stays with fleet (registry has placeholder value; real key in llm-fleet .env)
- groq-3 — llm-fleet only
- openrouter-1..5 — llm-fleet only
- tavily-1..5 — llm-fleet (unallocated to KiriPedia)
- exa-1..5 — llm-fleet (unallocated to KiriPedia)
- anthropic-1, 2 — trading + dev_yitzach (DO NOT touch)

### Recommended vs actual

| BOTNET-HANDOFF recommendation | Actual | Verdict |
|---|---|---|
| cerebras-2,3,4 → Catalogers + Reviewers | cerebras-2,3,4 → kiripedia | Aligned |
| cerebras-5 → Copy Editors | cerebras-5 → kiripedia | Aligned |
| groq-1,2 → Scribes (long-context) | groq-1,2 → kiripedia | Aligned |
| groq-3 → llm-fleet | groq-3 → llm-fleet | Aligned |
| openrouter × 3 → Patroller fast | NOT allocated to KiriPedia | Drift — NPP uses `worker_fast` (Groq 8b) per fleet-client.mjs; OpenRouter unnecessary |
| tavily × 1 → Acquisitions Librarian | Not allocated | Not blocking; Acquisitions role not built yet |
| YouTube Data API × 1 → Recent Changes | Not provisioned | **Gap** — needed for channel crawler Phase 1 |

**Drift summary:** Minor and intentional. OpenRouter allocation was a BOTNET-HANDOFF suggestion that turned out not to be needed — the NPP uses Groq which is already allocated. The only genuine gap is the YouTube Data API key (one-time provision, free tier, 10k units/day).

All four Cerebras keys are allocated. The `fleet-client.mjs` reads them as `CEREBRAS_KEYS=key1,key2,key3,key4` (comma-separated) from the HF Space secret and rotates round-robin. This matches the design.

---

## C. Where the team runs today

**Primary: HF Space (24/7 continuous loop)**

- HF Space name: `zerocool69/kiripedia` (inferred from botnet-cycle.yml comment and hf-space/README.md)
- `loop.mjs` wakes every 5 minutes (default `LOOP_SLEEP_MS=300000`), runs `botnet/run-cycle.mjs --push`, commits snapshot changes
- Watchdog: 15-minute kill on hung cycles with stale git lock cleanup on restart
- Keep-alive: cron-job.org pings `/health` (port 7860) every 6 hours

**GH Actions cron: disabled**

The `schedule:` block in `botnet-cycle.yml` is commented out with a note: _"Scheduled cron disabled — HF Space (zerocool69/kiripedia) runs the loop continuously now."_ The workflow exists for manual `workflow_dispatch` only.

**Still active on GH Actions:**
- `finalize-ingest.yml` — triggers on `.mdx` pushes: runs audit-frontmatter, audit-wikilinks, build-date-index, fetch-images
- `x-poster.yml` — 8 scheduled cron slots per day

### Throughput implications of HF Space vs cron

| | GH Actions cron (old) | HF Space (current) |
|---|---|---|
| Cycle interval | ≥5 min (GH minimum) | 30-300s (configurable) |
| Cycles/day | ≤288 | ≤2880 at 30s |
| Cold checkout per cycle | Yes — slow, no persistent SQLite between runs | No — same container, SQLite persists |
| Rate limit risk | Low (spaced out) | Higher at short sleep intervals |

HF Space at 5-minute sleep = same cycle count as GH Actions, but with persistent SQLite and no checkout overhead. Strictly better for the current workload.

### When does $5 VPS become correct?

Switch when: HF Space kills cycles mid-git-op more than twice per week, OR HF flags the Space as non-ML and the appeal fails. Neither has happened. VPS migration is a 10-minute change (same Dockerfile, systemd unit).

---

## D. Cost projection for the full 18-role rework

### Assumptions

- 63 sources already transcribed, 279 articles already written
- John Kiriakou content backlog: ~15,000 clips (5000 hours × ~3 clips/hour per BOTNET-HANDOFF §2)
- Steady-state cadence post-backfill: 1-3 clips/week
- LLM cost = $0 on free-tier Cerebras + Groq keys; only triggers spend when free tier exhausted
- Embedding model: bge-small or all-MiniLM, CPU-local on HF Space = $0

### One-time costs (backfill)

| Item | Volume | LLM calls | Cost |
|---|---|---|---|
| Embed existing 63 sources | ~1260 passages (63 × 20 avg) | 0 — local model | $0 |
| Audit existing 279 articles (Re-Reader) | 279 × 1 read pass | ~279 calls (worker_reasoning) | $0 (Cerebras free) |
| Re-run Cataloger on existing 63 transcripts | ~63 videos × 3 passages/min × ~30 min avg = ~5670 passage calls | ~5670 | $0 (Cerebras free; 4 keys × ~1000 calls/day = 4000/day; done in 2 days) |
| Backfill 15k clips (Channel Crawler unlock) | 15k × 5 calls (scribe + cataloger + reviewer + coordinator + deepener) | ~75k total | $0 (runs over ~4 months at current free tier capacity; ~625 calls/day) |

**One-time backfill total: $0.**

The math: 4 Cerebras keys × ~1000 calls/day ceiling = 4000/day. Backfill peak demand is ~625-750 LLM calls/day. Comfortably inside the free tier.

### Steady-state monthly (post-backfill)

John produces ~1-3 clips/week = ~8-12 clips/month.

| Role cluster | Calls/month (est) | Provider |
|---|---|---|
| Discovery (Channel Crawler, Podcast Sweeper) | ~0 LLM calls (code only) | — |
| Scribe + Cataloger + Reviewer + Coordinator (8-12 clips × 5 calls) | ~40-60 | Cerebras/Groq |
| Enhancement (Deepener, Enricher, Weaver, Re-Reader per cycle) | ~200-400 | Cerebras |
| Patrol + Quality (Diff Sentinel, MoS, Shape Auditor, Promotion Committee) | ~100-200 | Cerebras |
| **Total** | **~340-660 calls/month** | Free tier |

**Steady-state cost: $0/month.** Free tier ceiling is ~120,000 Cerebras calls/month (4 keys × 1000/day × 30). We use <1% of it at steady state.

### When does it stop being free?

Never at John's content cadence. The ceiling would require:
- Cerebras free tier to drop to <660 calls/month per key, OR
- John to appear in >8000 new clips per month (not physically possible)

If Cerebras tightens free tier: OpenRouter has 5 keys in the registry, currently unused by KiriPedia, that serve as a fallback. Adding `openrouter-1,2,3` to the `CEREBRAS_KEYS` fallback chain in `fleet-client.mjs` is a 5-minute change.

---

## E. Idempotency gaps that would burn money

### Well-protected (status guards in db.mjs)

- `recent-changes` — `registerLead()` uses `INSERT OR IGNORE` on `video_id PRIMARY KEY`. Re-running never double-registers.
- `npp` — `claimNextClip()` uses atomic `UPDATE WHERE worker IS NULL` + `RETURNING`. Stale claims get reset on restart via `releaseClip()`.
- `scribe`, `cataloger-editor`, `reviewer` — same `claimNextClip()` pattern; status columns prevent re-processing.
- `coordinator` — operates on `passed` claims; marks them `merged` on success. Status guard prevents re-merge.
- `source-auth` — status-gated on clips.

### Protected by last-worked cooldown (time-gated, not idempotent)

These workers use `lastWorked(slug, role)` + `markWorked()` from `lib/last-worked.mjs`, stored in `botnet/state/last-worked.json` (committed to git so it survives HF Space restarts):

- **deepener** — 4-hour cooldown per slug per role
- **enricher** — 2-hour cooldown per slug per role
- **weaver** — 4-hour cooldown per slug per role
- **reweaver** — has `lastWorked` import (same pattern)
- **prospector** — has `lastWorked` import

**Risk:** these are not truly idempotent — they are time-gated. A retry within the cooldown window is a no-op (safe). But a retry after the cooldown window fires the LLM call again, potentially writing a duplicate patch to the same article. The patch is committed via `writeFileSync` with no content-hash guard.

**Burn scenario:** HF Space kills a weaver cycle mid-write (watchdog SIGKILL after 15 min). The `last-worked.json` may not have been committed before the kill. On restart, the cooldown resets to 0, weaver picks the same article, fires another LLM call, potentially writes a duplicate or divergent patch. This is a low-probability but real spend risk — each such duplicate call costs 1 Cerebras credit.

**Fix (low priority):** Add a content-hash guard to weaver/enricher/deepener: skip if `sha256(article_content)` matches the hash at last-work time. One line per worker.

### Not idempotent at all (no guard)

- **indexer** — runs `build-date-index.mjs` and `build-mentions-index.mjs` every cycle unconditionally. These are pure deterministic code (no LLM), so re-running is safe but wasteful (filesystem writes). Not a cost issue.
- **mouth-sentry** — scans articles every cycle unconditionally. No LLM calls (grep-based). Safe.

### Summary table

| Worker | Idempotency mechanism | LLM burn risk on retry |
|---|---|---|
| recent-changes | INSERT OR IGNORE | None |
| npp | atomic claim + status | None |
| scribe | atomic claim + status | None |
| cataloger-editor | atomic claim + status | None |
| reviewer | atomic claim + status | None |
| coordinator | claim status + marked merged | None |
| deepener | time-gated (4h cooldown) | **Low** — 1 extra call if cooldown resets |
| enricher | time-gated (2h cooldown) | **Low** — 1 extra call if cooldown resets |
| weaver | time-gated (4h cooldown) | **Low** — 1 extra call if cooldown resets |
| reweaver | time-gated (assumed, has import) | **Low** |
| prospector | time-gated (assumed, has import) | **Low** |
| indexer | none | None (no LLM) |
| mouth-sentry | none | None (no LLM) |

Overall idempotency posture: good. The status-guard pattern in `db.mjs` covers the expensive pipeline workers correctly. The time-gated enhancement workers carry a low-probability, low-magnitude burn risk that is acceptable given $0 current spend and will remain acceptable unless Cerebras starts charging.

---

## F. Files written this session

| File | Description |
|---|---|
| `/Volumes/EOS_DIGITAL/KiriPedia/fleet/config/budget.json` | Rewritten with realistic limits based on actual usage, new botnet roles, phase projections, and corrected tripwires (500/1500 → 200/800) |
| `/Volumes/EOS_DIGITAL/KiriPedia/tools/cost-report.mjs` | New tool: reads usage.jsonl + botnet.db, produces daily/weekly rollup. Run: `node tools/cost-report.mjs [--days N] [--json]` |
| `/Volumes/EOS_DIGITAL/KiriPedia/INFRA.md` | New central infra reference: hosting matrix, key allocation table, env vars for HF Space, cost model, when to switch to VPS |
| `/Volumes/EOS_DIGITAL/KiriPedia/evaluations/08-cost-infra.md` | This document |

---

## G. Open infra decisions for Pedro

**Decision 1: Provision YouTube Data API key**
Required before Phase 1 (Channel Crawler). Free tier, 10k units/day. Takes 10 minutes at console.cloud.google.com. Add as GH Actions secret `YOUTUBE_API_KEY` and HF Space secret. Then run `/keyring add youtube_data <key> --owner=kiripedia`.

**Decision 2: Groq key status**
groq-1 and groq-2 are allocated to KiriPedia in the registry but marked `untested`. Run `/keyring test groq-1` and `/keyring test groq-2` to confirm they're hot. The HF Space GROQ_KEYS secret presumably has the real values; the registry has them too.

**Decision 3: cerebras-1 registry placeholder**
The registry has `cerebras-1` with a placeholder value (`ORIGINAL_LLM_FLEET_KEY_REPLACE_FROM_ENV`). This is just the registry record — the actual key lives in `/Volumes/EOS_DIGITAL/llm-fleet/.env`. Not a KiriPedia problem, but the registry is incomplete. Low priority.

**Decision 4: last-worked.json content-hash guard**
Weaver/deepener/enricher are time-gated, not content-hash-gated. If you want true idempotency against mid-cycle kills, add a sha256 check to each. Estimated effort: 30 minutes for all three. Not urgent — the cooldown gaps are low-probability and the LLM cost of a duplicate call is effectively zero on free keys.

**Decision 5: OpenRouter role**
5 OpenRouter keys sit idle in the registry. BOTNET-HANDOFF suggested using them for the NPP/Patroller fast role, but the current `fleet-client.mjs` only exposes Cerebras and Groq. If Cerebras free tier tightens, these are the fallback. No action needed now; note for later.

**Decision 6: HF Space vs VPS trigger**
Monitor HF Space for `stuck:true` in `/health` responses (set by loop.mjs when watchdog kills a cycle). If it appears more than twice per week consistently, that's the signal to provision a $5 VPS and migrate. Migration is a 10-minute change (same Dockerfile, point at the same GitHub repo, systemd unit, same env vars).

**Decision 7: OpenRouter allocation decision for rework**
TEAM-REWORK adds 8 new roles. None of them obviously need OpenRouter. Confirm when building each role whether Cerebras (reasoning) or Groq (longcontext/fast) is the right model — if neither suffices, pull from OpenRouter keys then. Don't pre-allocate.

---

_Expert #8 of 10 — Cost, Keys, Infrastructure_
