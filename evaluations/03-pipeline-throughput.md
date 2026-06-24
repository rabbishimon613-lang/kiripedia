# Expert #3 — Pipeline Throughput & Architecture Consolidation

*Filed 2026-06-23. Scope: thrash bug post-mortem, botnet-vs-fleet verdict, real numbers off `botnet/data/botnet.db`, plan for the Triage Patroller and passage-level migration.*

---

## Executive summary

- **Fleet is dead, long live the botnet.** `fleet/` (Sonnet Harbor Master + plant) is sound as the *manual seed* path that built the existing 279-article / 63-transcript corpus, but it is a Sonnet-attended workflow with no place in the autonomous loop. `botnet/` is the right home for everything going forward; the only piece of `fleet/` that should survive in code form is the 12-layer grounding stack design — most of which is already mirrored in `botnet/lib/grounding/`. Verdict: **absorb, then archive `fleet/` under `fleet/_archive/`** so the docs stay readable but the directory stops looking like a parallel runtime.

- **The "deepener picks the same article 5×" bug as TEAM-REWORK described it is fixed in code, but the structural variant survives.** The literal in-batch thrash was killed by commit `9bafb9a` (added `exclude` + 2h cooldown) and `616c1f0` (replaced mtime cooldown with the sidecar JSON, because HF Space cold-starts reset mtime). The bug that still survives is **cross-cycle**: when an article surfaces, the LLM step lands zero insertions, and the (mentions − cites) delta doesn't change — so 2 hours later the same article wins the global rank again. Triage Patroller is the structural cure (selection separated from work + per-article backoff signals).

- **Real throughput today is roughly zero in the autonomous lane.** The live `botnet/data/botnet.db` shows **1 cycle ever committed, 0 claims merged, 0 articles touched**, 6 leads sitting in `lead` status, and the most recent end-to-end ingest activity dates to ~2h before this evaluation. The corpus (279 articles, 63 transcripts) is **fleet/Sonnet output**, not botnet output. Phase 1 of TEAM-REWORK (Channel Crawler + Fingerprinter + Triage Patroller) is what actually unblocks the autonomous lane; without it the rest of TEAM-REWORK is decoration.

---

## A. Thrash bug — pinpoint

### What TEAM-REWORK says

> "deepener/enricher/weaver picking the same article 5× per batch"

### Empirical confirmation in the DB

```
sqlite> SELECT role, ref_id, COUNT(*) n FROM activity
        WHERE role IN ('deepener','enricher','weaver','reweaver')
          AND ref_id IS NOT NULL GROUP BY role, ref_id ORDER BY n DESC;
deepener  bernie-kerik    4
enricher  admiral-crowe   3
```

Activity rows 12–17 show `bernie-kerik` picked on three consecutive 35-second start→finish iterations inside one process. Detail strings ("No gap for bernie-kerik") trace to a version of `deepener.mjs` from before commit `9bafb9a` — i.e. this is **historical evidence** of the bug TEAM-REWORK is describing, captured in the activity log before the fix landed.

### The pre-fix code — where the bug lived

`botnet/workers/deepener.mjs` at git `9bafb9a^` (now superseded):

```js
function pickArticle() {                       // no exclude arg
  let best = null;
  let bestDelta = -Infinity;
  for (const f of files) {
    ...
    if (delta > bestDelta) {                   // global max, recomputed every iter
      bestDelta = delta;
      best = { ... };
    }
  }
  return best;                                 // returns same slug every BATCH iter
}
```

The picker took no `exclude` parameter and the BATCH loop in the same file called it `N` times. With `N=10` (the inward-mode default in `run-cycle.mjs:78`), the loop ran ten LLM calls against `bernie-kerik`, the global max-delta article. That is the precise 5-picks-per-batch behaviour the rework names.

### The fix already in tree

`botnet/workers/deepener.mjs:68–87` (current, commits `9bafb9a` + `616c1f0` + `acada26`):

```js
function pickArticle(exclude = new Set()) {
  const nowSec = Math.floor(Date.now() / 1000);
  ...
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    if (exclude.has(slug)) continue;                                      // in-batch guard
    if (nowSec - lastWorked(slug, ROLE) < COOLDOWN_SEC) continue;         // cross-cycle guard
    ...
    if (delta <= 0) continue;                                             // no zero-gap re-picks
    candidates.push({ slug, ... });
  }
  candidates.sort((a, b) => b.delta - a.delta || a.cites - b.cites);
  return candidates[0] || null;
}
```

Combined with the BATCH loop at lines 169–183 which calls `touched.add(pick.slug); markWorked(pick.slug, ROLE);` **before** awaiting `run(pick)`, in-batch repicks are now impossible. `botnet/lib/last-worked.mjs` keeps the cooldown state in `botnet/state/last-worked.json` (survives HF Space clone-resets, as flagged in the `616c1f0` commit message).

### The structural bug that still survives

The fix closes in-batch picks but **not** cross-cycle picks of articles where the work itself is a no-op. Concretely:

1. Cycle T: deepener picks `bernie-kerik` (highest delta). LLM call returns `result.insertions = []` because the anchors don't match. No file is written.
2. `markWorked('bernie-kerik', 'deepener')` is called → cooldown set for 2h.
3. Cycle T+2h: cooldown expired. `mentions − cites` is unchanged (no insertions landed). `bernie-kerik` is *still* the global max. Picked again. Same LLM call, same empty result.

This is the cross-cycle variant of the same disease and it consumes one LLM call per cycle for nothing. The structural cure is **Triage Patroller**, which separates selection from work and gives the work step a way to feed back into selection (a backoff register the patroller reads next cycle).

### Secondary bug spotted while reading

`botnet/workers/deepener.mjs:46–53` and `weaver.mjs:48–55` use:

```js
const out = execSync(`grep -ric ${shellQuote(term)} ${shellQuote(SOURCES_DIR)} || true`, ...)
                .trim();
const n = parseInt(out, 10);
```

`grep -rc <pat> <dir>` emits one `<path>:<count>` line per file. `parseInt(multiLineString, 10)` parses only the first number it finds, so `mentionCount` is wildly under-counted — it's effectively "mention count in whichever file `grep -r` happens to walk first." This isn't a thrash bug (it's deterministic so picks are stable), but it does mean the entire deepener ranking is built on bad data. The Triage Patroller in `botnet/workers/triage-patroller.mjs` ships with a corrected node-side mention counter that sums across all source files (one pass, no shell), so the ranking question gets fixed as a side effect of the cutover.

---

## B. Architecture verdict — botnet vs fleet

### What each is

**`KiriPedia/fleet/`** — designed for the old "Sonnet local Harbor Master + llm-fleet plant workers" model. `HARBOR-MASTER.md` is a standing-orders doc for a Sonnet session. The plant prompts live under `fleet/plant/prompts/`. It has trawlers, ledgers, catch files, suspect queues. **No autonomous loop, no cron, no SQLite truth store, no GH Actions story.** Throughput requires a human (you) to read briefings and say "process 1, 3, 5."

**`KiriPedia/botnet/`** — the autonomous design: SQLite truth, role-locked workers, atomic claims, HF Space loop running `run-cycle.mjs` every 5 min, snapshot pushed to repo, public site polls it. **All the autonomous infrastructure is here.** `botnet/lib/grounding/` already exists; the 12-layer stack is being implemented incrementally per `botnet/README.md`.

### Concrete code differences

| Dimension | `fleet/` | `botnet/` |
|---|---|---|
| Coordination | Sonnet conversation reading `catch/*.jsonl` | `run-cycle.mjs` shell-spawns workers sequentially |
| State | JSONL append files (`fleet/catch/`, `fleet/ledger/`) | SQLite `botnet/data/botnet.db` + sidecar JSON |
| Discovery | `tools/find-new-kiriakou-videos.mjs` wrapped by `fleet/trawlers/youtube.mjs`, cron entry under `fleet/trawlers/run-all.sh` | `botnet/workers/recent-changes.mjs` calls the same underlying tool but writes to SQLite |
| LLM dispatch | `mcp__llm-fleet__*` MCP tools from a Sonnet session | `botnet/lib/fleet-client.mjs` — direct HTTP to Cerebras/Groq with key rotation |
| Grounding | Conceptual in `HARBOR-MASTER.md` §"12-layer grounding stack" | Five layers implemented (`botnet/lib/grounding/`), seven still ⏳ per `botnet/README.md` table |
| Operator UI | Briefing-in-chat | `botnet/cli.mjs` + pixel office |
| Production target | Local Sonnet sessions | HF Space + `botnet/hf-space/loop.mjs` + GH Actions cron |
| Doctrine binding | Reads `ARTICLE-WORKFLOW.md` + `INGEST.md` on every session | Doctrine baked into worker system prompts in `botnet/workers/*.mjs` |

### Verdict

`fleet/` is the **scaffold that built the existing corpus**. It is the *historical* pipeline that took the 63 transcripts from raw VTT → 279 articles, supervised. It is not a production runtime; it is a Sonnet workflow doc. The botnet is the production runtime.

**Recommendation:**

1. **Archive `fleet/` under `fleet/_archive/`** (or move it out of the repo root entirely into `docs/history/`). Keep the directory readable as a doctrine reference — the Harbor Master pattern is good prose — but stop carrying it as if it's a parallel runtime. Anything currently shelling into `fleet/trawlers/run-all.sh` from cron should be turned off.

2. **Promote `fleet/HARBOR-MASTER.md`'s 12-layer grounding stack** verbatim into `botnet/README.md` (it's already partially there). Then the canonical doctrine reference is in the botnet tree.

3. **`fleet/config/grounds.json` is the one live artifact in `fleet/`.** Move it to `botnet/config/grounds.json` and update the one reader (`botnet/lib/grounding/layers.mjs`, per the README table). One-line refactor.

4. **Do not absorb `fleet/`'s prompts.** They were written for Sonnet attention; the botnet prompts are tighter and role-locked. Reading `fleet/plant/prompts/filleting.md` etc. as inspiration is fine; importing them is not.

This is the consolidation TEAM-REWORK assumes but doesn't make explicit. Two parallel architectures with overlapping docs is the kind of debt that bites whichever Claude session opens the repo three months from now.

---

## C. Throughput math

### Current corpus

```
src/content/articles/  279 .mdx files
src/content/sources/   63 .md transcripts
sources/raw/           18 .vtt files
botnet/data/botnet.db  cycles=1, claims_merged=0, articles_touched=0
```

The 18-vs-63 gap means 45 transcripts were normalised from raws that no longer live in `sources/raw/` (or were normalised from third-party sources), which is fine but worth noting for any future fingerprinting work.

### Per-cycle work today (from the activity log)

`botnet/data/botnet.db` has **31 activity rows total** across **two distinct dates** (2026-06-22 and 2026-06-23). Per role:

```
deepener  8    weaver  6    enricher  6    indexer  2    coordinator  2
mouth-sentry  2    recent-changes  2    npp  2    reviewer  1
```

`cycles` table: **1 committed cycle ever, claims_merged=0, articles_touched=0**. All the activity counts above came from sub-process worker invocations, but no merge happened. The botnet is running but **not producing the corpus**. The corpus came from fleet.

The most recent ingest activity timeline (id 3 → id 11):
- `recent-changes` 01:06:42 → 01:12:12 = ~5m30s polling YouTube, surfaced 6 new leads
- `npp` 01:12:12 → 01:12:13 (1s): `on=0 off=0 err=20` — twenty triage errors, zero usable triage decisions. This is the choke point. Scribes/catalogers downstream have nothing to do because nothing came through triage.
- `coordinator` 01:12:14 — `idle, no passed claims`
- `reviewer` 01:12:14 — `idle, no pending claims`
- Mining workers (deepener/enricher/weaver) ran but on a stale state — see "structural bug" above.

**End-to-end latency for one new YouTube clip → live article:** undefined in production, because zero clips have made it through. The pipeline has never executed end-to-end against a real lead under the autonomous loop.

### What Phase 1 of TEAM-REWORK realistically achieves

Phase 1 = Channel Crawler + Fingerprinter + Triage Patroller.

- **Channel Crawler** unblocks discovery. `recent-changes` is currently the only ingest path and TEAM-REWORK names it as dead ("all 4 search probes fail"). The crawler walks `yt-dlp --flat-playlist` against ~40 seed channels and re-enumerates every Kiriakou appearance. Realistic backlog discovery: **thousands of historical video IDs** queued in a single run, mostly already-seen-elsewhere duplicates.
- **Fingerprinter** is the prerequisite that keeps the crawler from drowning the pipeline. Without it, ~15 dupes per Rogan-class appearance show up as 15 leads. With it, the lead count after dedup is likely **5–10× lower** than the raw discovery output but **still 10–100× what `recent-changes` was producing**.
- **Triage Patroller** fixes the cross-cycle thrash and the wrong-mentionCount bug, so the LLM budget the mining lane is currently spending on dead-end articles starts landing on a wider article surface. Order-of-magnitude estimate: mining-lane LLM calls today touch **2–3 articles per cycle, repeatedly**; after the patroller they should touch **`PER_ROLE=25` distinct articles per cycle**, distributed across deepener/enricher/weaver/reweaver.

These are the only Phase 1 changes that touch production throughput. Realistically Phase 1 takes the botnet from "0 articles/day output" to "first end-to-end clip flow working" — the throughput number you measure changes from **undefined** to **measurable**.

### Rate-limit ceilings

- **Cerebras** — 5 keys, `cerebras-2..5` earmarked for KiriPedia per `BOTNET-HANDOFF.md`. Each free-tier key gives ~30 reqs/min. With four KiriPedia keys at 30 rpm rotated, the **mining lane ceiling is ~120 LLM calls/min**, i.e. ~7k/hour, ~170k/day. Mining lane is nowhere near this.
- **Groq** — 3 keys shared with llm-fleet. Long-context use only (Scribe normalisation, Weaver). Lower rate ceilings (~14 rpm/key for free tier). Realistic ceiling **~40/min** if KiriPedia gets exclusive use during a cycle. **This is the actual ceiling Scribe will hit first** once the Channel Crawler turns on.
- **GH Actions** — public-repo minutes are unlimited (`chabad-tracker` pattern referenced in `BOTNET-HANDOFF.md` §6). The cycle runs on HF Space, not GH Actions, but the snapshot push uses Actions for nothing material. **Not a ceiling.**
- **HF Space CPU** — free tier is 2 vCPU, 16 GB RAM, no GPU. Whisper-small for fallback transcription (TEAM-REWORK §"Acquisition") runs at ~3× realtime on 2 vCPU, so a 3-hour podcast = ~60 min of CPU. With a 5-min cycle, fallback transcription has to be a separate worker that runs **at most a couple of clips per cycle**, otherwise it crowds out everything else. **This is the bottleneck for the Acquisition stage** once auto-CC starts failing 30% of the time as TEAM-REWORK predicts.

Short version: the autonomous pipeline is currently **rate-limited by zero discovery throughput**, not by any API/CPU ceiling. The ceilings start to matter after Phase 1.

---

## D. Files written this session

- `botnet/workers/triage-patroller.mjs` — **selection-only worker**. Scans `src/content/articles/` once per cycle, computes per-role ranked work queues (deepener, enricher, weaver, reweaver), and writes `botnet/state/work-queue.json`. Backoff-aware: reads `botnet/state/work-backoff.json` so dead-end articles get deprioritised for real reasons, not just by cooldown. Includes the corrected mention counter that fixes the `parseInt(multiLineString)` bug shipped in `deepener.mjs:53` and `weaver.mjs:55`. Wire-up phased so it's safe to ship today and cut over per-worker later (Phases A→D in the file's tail comment).

- `botnet/migrations/001-passage-level-state.sql` — DDL for the Phase 2 schema additions (`recordings`, `source_urls`, `transcript_passages`, `prompt_versions`, `passage_verdicts`, `discovery_seeds`, `video_curriculum`, `article_grades`). Strictly additive. Adds two nullable columns to `claims` so old rows keep working. **Does not touch the live botnet.db** — script header makes the `cp ... pre-001.db` requirement explicit, per project doctrine that originals are never deleted.

- `evaluations/03-pipeline-throughput.md` — this document.

I did **not** modify `botnet/data/botnet.db`, `botnet/workers/deepener.mjs`, `botnet/workers/enricher.mjs`, or anything in `fleet/`. The thrash fix that's already in tree is correct as far as in-batch goes; touching it would be churn for no gain. The Triage Patroller is the right altitude for the *remaining* (cross-cycle) variant.

---

## E. Open decisions for Pedro

1. **Archive `fleet/` or leave it?** The doc value is real and the directory is small. I'd vote `mv fleet/ docs/history/fleet/` and update the one cron reference in `fleet/trawlers/run-all.sh` to no-op. Counter-argument: `fleet/config/grounds.json` is read by `botnet/lib/grounding/`, so the move requires one path update. Five-minute change either way.

2. **Triage Patroller cutover schedule.** Ship Phase A (the skeleton) immediately — it writes a queue file and nothing else, zero risk. Phase B (workers read the queue) is one ~20-LOC PR per worker. Suggestion: deepener first because it has the most documented thrash, observe for a week, then cut the other three over together. Asking now because Phase B depends on whether you want backoff signals appended to `work-backoff.json` from the worker (Phase B has it) or computed deterministically from the activity log by the patroller (cleaner, but loses the worker-side context of *why* the dead-end happened).

3. **HF Space vs GH Actions for the autonomous loop.** Currently HF Space runs `loop.mjs` every 5 min. `BOTNET-HANDOFF.md` §9 step 6 says "Phase 6 — Move to GH Actions." If Phase 1 of TEAM-REWORK is happening, this is the cycle where the migration would happen too, since the Channel Crawler is the first non-trivial worker that benefits from GH's unlimited free minutes vs HF's CPU ceiling. Either we move now or we accept HF Space as the long-run home.

4. **Passage-level state migration timing.** Phase 2 of TEAM-REWORK is meaningful work — embeddings backfill on 63 transcripts at ~30 paragraphs each = ~1900 passages × 384-dim ≈ trivial in storage but a one-time `bge-small` pass that takes ~10 min on HF Space CPU. Should this run as a one-shot script invoked by hand, or as a new worker (`embedder.mjs`) that the cycle picks up and idles after the backfill drains? I'd run the backfill as a script, ship `embedder.mjs` as the incremental top-up worker.

5. **The `mentionCount` bug in `weaver.mjs:48–55`.** Same `parseInt(multiLineString)` shape as deepener. Weaver's `MENTION_THRESHOLD = 1` makes the bug less consequential (any non-zero count passes), but it does mean the tie-break `b.mentions - a.mentions` ranks on garbage. Worth fixing in the same PR that does the deepener cutover, or skip if Triage Patroller is going to own mention counts in the next 1–2 weeks anyway. I'd skip and let the patroller absorb it.
