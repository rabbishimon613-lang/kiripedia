# KiriPedia — Team Rework Brief

*Brainstorm-only document. No code changes yet. Drafted 2026-06-22 after the HF Space migration went live and the team started running 24/7 but in permanent backlog mode (discovery search dead, deepener/enricher/weaver picking the same article 5× per batch).*

---

## The core idea (one paragraph)

KiriPedia's universe is **John Kiriakou on tape**. Every article, every footnote, every redaction must trace to a video or podcast where he spoke. The team's job is to build and maintain a Wikipedia-style encyclopedia of that universe, **eternally** — find every video he's ever appeared in (decade-plus backlog plus every new drop), get the captions, decide what's a claim, file it into the right article, cross-link, re-read old transcripts when the article set changes, and never stop. Wikipedia works because hundreds of narrow-role volunteers touch the same article from different angles. We get the same effect with one LLM-driven worker per role, each tireless, each capable of unbounded batch size — **one Scribe is "all the scribes," one Filer is "all the filers"**. The team is not large in processes. It is large in *roles*.

---

## One worker = unlimited workload

Critical reframing the user clarified after the panels reported:

> *"One guy can do the work of 100 guys… we can have unlimited scribes and be one guy and need only 3 filers and it's also one guy."*

This collapses a lot of complexity:
- **No worker pools.** The current `scribe-1`, `scribe-2`, `scribe-3` setup is a leftover from cron-cadence thinking. On a 24/7 loop, one Scribe process that pulls `--batch N` (where N is whatever fits the LLM rate limit per cycle) replaces three.
- **No per-process state.** Each role-worker is stateless across invocations. State lives in SQLite.
- **Per-role parallelism is just `--batch`.** Want more transcription throughput? Bump `scribe --batch 1 → 5`. Don't spawn `scribe-4`.
- **Total worker count = total roles, not total parallelism.** Currently we have ~10 roles spread across ~13 process invocations per cycle. After rework, roles go up (≈ 18), processes per cycle go *down* (one per role).

The team is a **directed graph of roles**, not a swarm of identical agents.

---

## What's working now

| Worker | What it does | Health |
|---|---|---|
| `recent-changes` | Search YT for new Kiriakou videos | 🚨 dead — all 4 search probes fail |
| `npp` | Triage `triaged_on` vs `triaged_off` | ✅ runs |
| `scribe` (×3 pool) | Pull auto-CC, normalize → markdown | ✅ runs, starved |
| `cataloger-editor` (×2) | Extract atomic claims | ✅ runs, starved |
| `reviewer` | Ground claims against transcript | ✅ runs |
| `coordinator` | Merge grounded claims into MDX | ✅ runs |
| `indexer` | Rebuild date/mentions indexes | ✅ runs |
| `deepener` | Citation gaps → augmented prose | ⚠️ picks same article 5× per batch |
| `enricher` | Orphan articles → wikilinks + "See also" | ⚠️ picks same article 5× per batch |
| `weaver` | Stub articles → sectional narrative | ⚠️ rarely picks anything |

Pipeline is **architecturally sound** but the ingest fuel is cut off (broken discovery), the selection algorithms thrash on the same article, and there's no path for the team to re-read past transcripts when doctrine shifts.

---

## The 10-expert panel verdict (condensed)

### Ingest cluster (4)
- **Discovery (Maya):** Kill the search API. Build a **channel-anchored crawler** — seed Kiriakou's channel + ~40 known host channels (Rogan, Tucker, Scheer, Grayzone, Judging Freedom, RT archive, Useful Idiots…). Walk each channel's full upload history via `yt-dlp --flat-playlist`. No API key, no quota. Decade-long backlog opens overnight. Layer 2: every confirmed guest co-appearance becomes a new seed channel. Layer 3: podcast RSS feeds (half his appearances are audio-first). Layer 4: archive.org for dead RT content post-2022.
- **Acquisition (Tomás):** Auto-CC fails ~30% of the time. **Tiered fallback**: yt-dlp auto-CC → yt-dlp manual subs → Whisper-small on the audio (only escalate to large-v3 once `triaged_on`). Most importantly: **content-fingerprint dedup**. The same Rogan clip exists as 15 YT uploads. Use audio chromaprint + transcript MinHash shingles to collapse them into one `recording_id`. Without this, the channel crawler floods the pipeline with duplicates.
- **Re-processing (Wren):** State must move from **video-level to passage-level**. Every passage carries `(prompt_version, last_decision, last_eval_at)`. When doctrine changes, only stale-version passages get re-queued. Anti-thrash: per-passage cooldown (don't re-evaluate within N days unless prompt hash changed).
- **Storage (Idris):** New tables — `recordings` (keyed by content fingerprint, N:M to `source_urls`), `transcript_passages`, `prompt_versions`, `discovery_seeds`. Claims reference `source_passage_id` not `source_video_id`.

### Editorial cluster (4)
- **Wikipedian (sociology of collab):** The mistake is that every worker is a *generalist author*. en.wiki works because roles are *narrow and overlapping*. Need: **Newpage Patroller** (triage + route), **Diff Sentinel** (revert removal of cited claims), **MoS Enforcer** (mechanical style), **Discretion Warden** (Kiriakou-specific BLP), **Promotion Committee** (FA/GA ceremony).
- **Doctrine expert:** POV problem is inverted. There's no NPOV, only **Kiriakou-POV**. Two checkable rules:
  1. **First-person split** — claims tagged `JK-witnessed` vs `JK-relayed`. Relayed claims must use attribution prefix ("According to Kiriakou…"); witnessed claims don't.
  2. **Discretion mirror** — if the corpus declines to name someone across N mentions of a topic, the article must also not name them. Worker can check this mechanically.
- **Article lifecycle:** Grades redefined for single-corpus: **Stub** (<3 cites) → **Start** (one section grounded) → **C** (sectional, ≥10 cites) → **B** (every transcript mention either cited or explicitly excluded with reason) → **GA** (Discretion + first/third split + weaver pass) → **FA** (committee quorum). **Critical rule: promoter ≠ last editor.** Kills half the thrash by design.
- **Anti-stagnation:** Three failure modes —
  1. **Thrash** → role-based lockout (worker can't edit an article another worker of same role touched in last N cycles).
  2. **Drift/softening** → measure hedge density ("allegedly," "reportedly," "is said to") per revision. Monotonic rise across 3 revisions without new corpus input → roll back to lowest-hedge version.
  3. **Shape convergence** → **Shape Auditor** computes section-header entropy; flags articles whose TOC matches >5 others. Forces structural diversity.

### Continual-learning cluster (2)
- **Embeddings:** Passage-level embeddings are non-negotiable. ~100k chunks × 384-dim with local `bge-small` or `all-MiniLM` ≈ 150MB — trivial on the HF Space. Store in sqlite-vec extension. Real index is a **claim graph**: each article links back to source passages; the negative-space query *"which passages cite no article yet?"* is where new articles hide.
- **Curriculum:** Random sampling reaches the long tail but wastes compute. Use weighted scheduler: `score = staleness × density × contradiction_signal × inverse_visits`. Density = passages-per-minute that haven't been mapped to any article. Contradiction signal = embedding distance between a passage and the article supposedly covering it (high = article missed/mangled something). Memory table `passage_verdicts` is essential or workers re-litigate the same boring intro banter forever — but verdicts expire when the *article set* changes (a passage rejected because no article existed might be gold once a relevant stub spawns).

---

## The reworked team (one worker per role, tireless)

Grouped by stage of the pipeline. **Bold** = new role. Plain = exists today.

### 1. Discovery
- **Channel Crawler** *(new)* — seed list of channels in `discovery_seeds` table; walks each with `yt-dlp --flat-playlist`; writes new uploads as leads.
- **Seed Gardener** *(new)* — every catalogued claim mentioning a new host or co-guest gets a new seed channel proposed (human or auto-approval).
- **Podcast Sweeper** *(new)* — pulls RSS feeds from Listen Notes / Podcast Index for audio-first appearances.
- **Archive Diver** *(new)* — periodic sweep of archive.org for dead RT / takedown content.
- *Replaces:* `recent-changes` (search-API based, currently dead).

### 2. Acquisition
- **Scribe** (one process, unlimited batch) — pulls auto-CC; on failure, falls back to yt-dlp manual subs, then Whisper-small on audio.
- **Fingerprinter** *(new)* — computes audio chromaprint + transcript MinHash; collapses duplicate uploads into one `recording_id`.

### 3. Extraction
- **Cataloger-Editor** (one process, unlimited batch) — extracts atomic claims at passage granularity.
- **Passage Embedder** *(new)* — generates and stores embeddings for new passages; runs incrementally.

### 4. Adjudication
- **Reviewer** — grounds each extracted claim against its source passage.
- **Discretion Warden** *(new)* — for each claim about a third party, checks corpus-wide whether Kiriakou names this person in similar contexts. Redacts where his pattern says so.
- **First/Third Splitter** *(new)* — tags each claim `JK-witnessed` vs `JK-relayed`; coordinator uses this to format attribution.

### 5. Filing
- **Coordinator** (one process, unlimited batch) — merges grounded claims into MDX. *This is "the filer." One process, can handle thousands of merges.*
- **Triage Patroller** *(new)* — routes newly-created stubs and recently-touched articles into the right downstream queue (deepener, enricher, weaver, shape-auditor). Separates **selection** from **work** — single most important fix for the "same article 5× per batch" bug.

### 6. Enhancement
- **Deepener** (selection fixed by Triage) — picks under-cited articles; drafts citation-augmented prose.
- **Enricher** (selection fixed by Triage) — proposes wikilinks and "See also" blocks.
- **Weaver** (selection fixed by Triage) — rewrites stubs into sectional narrative.

### 7. Quality / Patrol
- **Diff Sentinel** *(new)* — diffs every commit against prior version; reverts edits that remove cited claims without replacement; tracks per-revision hedge density and rolls back monotonic-softening sequences.
- **Shape Auditor** *(new)* — flags articles whose TOC structure converges with too many peers; nominates for structural rework.
- **MoS Enforcer** *(new)* — mechanical style pass: date formats, infobox fields, section order.

### 8. Continual learning
- **Re-Reader** *(new)* — pulls the top-scoring video from `video_curriculum`, streams passages it hasn't verdicted under the current article-set hash. Emits: "spawn article X," "amend article Y," or "rejected: reason."
- **Contradiction Scout** *(new)* — nightly sweep of high-distance passage↔article pairs from the embedding index; queues suspects for the Re-Reader.

### 9. Promotion (ceremony, not always-on)
- **Promotion Committee** *(new)* — runs daily. For each article eligible for grade-up, requires concurrence from 2 of 3 different role-workers (e.g. Deepener + Discretion Warden + Reviewer). Editor ≠ promoter is a hard gate.

**Total: 9 existing roles → 18 roles after rework. All still ≤ 1 process per role.** Per-cycle work distributed by batch size, not process count.

---

## Schema additions (concept, not DDL)

- `recordings` — content-fingerprint-keyed; N:M to `source_urls`. The actual indexed "thing."
- `source_urls` — every URL that points at the same `recording_id` (the 15 Rogan re-uploads).
- `transcript_passages` — (`recording_id`, `start_ts`, `end_ts`, `text`, `last_eval_prompt_version`, `last_eval_decision`, `last_eval_at`). The real unit of work.
- `passage_embeddings` — sqlite-vec table keyed to `passage_id`.
- `passage_verdicts` — memory: (`passage_id`, `worker`, `verdict`, `reason`, `model_version`, `article_set_hash`). Expires when `article_set_hash` changes.
- `claims` — references `source_passage_id` (not `source_video_id`), gains `prompt_version` for provenance.
- `discovery_seeds` — (`channel_id`, `tier`, `last_swept_at`, `cadence`). Maya's crawler config lives in DB.
- `prompt_versions` — (`hash`, `role`, `doctrine_notes`, `created_at`). Every worker reads its current hash and stamps decisions with it.
- `video_curriculum` — (`recording_id`, `staleness_score`, `density_score`, `visit_count`, `last_spawn_rate`, `next_due_score`). The Re-Reader's queue.
- `article_grades` — current grade + history of (`grade`, `promoter`, `editor`, `at`). Editor ≠ promoter enforced here.

---

## The eternal re-learn loop (text diagram)

```
                      ┌────────────────────────┐
                      │  Channel Crawler /     │
                      │  Seed Gardener /       │
                      │  Podcast Sweeper /     │
                      │  Archive Diver         │
                      └───────────┬────────────┘
                                  │ new URLs
                                  ▼
                      ┌────────────────────────┐
                      │  Fingerprinter         │  ◄── dedup before any LLM call
                      └───────────┬────────────┘
                                  │ recording_id
                                  ▼
              ┌───────────────────────────────────┐
              │  Scribe → Cataloger → Embedder    │
              │  (passage-level, prompt_version)  │
              └───────────────┬───────────────────┘
                              │ claims + passages
                              ▼
              ┌───────────────────────────────────┐
              │  Reviewer + Discretion + Splitter │
              └───────────────┬───────────────────┘
                              ▼
                       ┌─────────────┐
                       │ Coordinator │  ← single Filer, unlimited batch
                       └──────┬──────┘
                              │ MDX commits
                              ▼
              ┌───────────────────────────────────┐
              │  Triage Patroller (routes work)   │
              └─┬──────────┬───────────┬──────────┘
                │          │           │
                ▼          ▼           ▼
            Deepener   Enricher     Weaver
                │          │           │
                └──────────┴───────────┘
                              │
                              ▼
              ┌───────────────────────────────────┐
              │  Diff Sentinel · Shape Auditor    │
              │  · MoS Enforcer                   │
              └───────────────┬───────────────────┘
                              ▼
                  ┌────────────────────────┐
                  │  Promotion Committee   │  ← daily ceremony
                  └───────────┬────────────┘
                              │
       ┌──────────────────────┴──────────────────────┐
       │       FEEDBACK INTO THE LEARN LOOP          │
       ▼                                             ▼
┌──────────────────┐                  ┌──────────────────────────┐
│ article_set_hash │ ← changes when   │ Re-Reader picks stalest  │
│ rotates          │   articles spawn │ high-density video       │
└────────┬─────────┘   or grade up    └────────────┬─────────────┘
         │                                         │
         ▼                                         ▼
┌─────────────────────────────┐    ┌──────────────────────────────┐
│ passage_verdicts EXPIRE     │    │ Contradiction Scout flags    │
│ → all passages eligible for │    │ high-distance passage↔article │
│   re-evaluation             │    │ pairs nightly                │
└─────────────┬───────────────┘    └────────────┬─────────────────┘
              └──────────────┬────────────────────┘
                             ▼
                  back to Cataloger / Coordinator
                  with re-queued passages
```

**The loop never closes.** Every article promotion changes the `article_set_hash`. Every hash change invalidates stale verdicts. The Re-Reader is *always* finding new work in the same 200 transcripts because the lens through which it reads has shifted.

---

## What we explicitly are NOT building

- **No planner agent.** Pipelines don't need plans. The directed graph IS the plan.
- **No inter-agent chat.** Workers don't message each other; they read/write SQLite tables.
- **No custom orchestrator.** The loop is the orchestrator.
- **No vector DB.** sqlite-vec or a flat embedding table is enough for ~100k passages.
- **No worker pools.** One process per role; batch size scales the work.
- **No multi-model A/B per claim.** Pick one model per role per `prompt_version`. Compare across versions if you want, not within.
- **No real-time UI.** The pixel office heartbeat at `/meet-the-team` is the dashboard. Anything fancier is a distraction.

---

## Migration plan (3 phases, weeks not days)

### Phase 1 — unlock the ingest (highest leverage, lowest cost)
1. Kill `recent-changes` search API. Replace with **Channel Crawler** seeded from `discovery_seeds` (Kiriakou's channel + ~40 known hosts), driven by `yt-dlp --flat-playlist`. Decade-long backlog opens.
2. Add **Fingerprinter** before extraction. Without it, the crawler floods the pipeline with duplicates.
3. Add **Triage Patroller**. Single biggest fix for the "deepener picks same article 5× per batch" bug — solves it by separating selection from work.

**Outcome of Phase 1:** Backlog flowing in, dedup'd, routed to the right worker. No new schema yet beyond `recordings`, `source_urls`, `discovery_seeds`.

### Phase 2 — passage-level state + doctrine versioning
4. Migrate state from video-level to passage-level. Add `transcript_passages`, `prompt_versions`, `passage_verdicts`. Existing workers gain `--prompt-version` stamping.
5. Add **Passage Embedder** and `passage_embeddings` (sqlite-vec). One-time backfill on existing corpus.
6. Add **Re-Reader** and `video_curriculum`. The eternal loop becomes real.

**Outcome of Phase 2:** Team is now re-reading the entire corpus on a curriculum, finding articles it missed the first time.

### Phase 3 — editorial discipline
7. Add **Discretion Warden**, **First/Third Splitter** to adjudication.
8. Add **Diff Sentinel**, **Shape Auditor**, **MoS Enforcer** to patrol.
9. Add **Promotion Committee** + `article_grades`. Roll out FA/GA grades retroactively over the existing corpus.
10. Add **Contradiction Scout** — closes the feedback loop between embeddings and editorial.

**Outcome of Phase 3:** Articles have grades, promotions are quorum-gated, drift gets rolled back, structural variety gets enforced.

---

## Appendix — role-to-role handoffs (who hands off to whom)

| From | To | Via |
|---|---|---|
| Channel Crawler | Fingerprinter | `source_urls` table, status=`new` |
| Fingerprinter | Scribe | `recordings` table, status=`unfetched` |
| Scribe | Cataloger | `transcript_passages`, status=`uncatalogued` |
| Cataloger | Reviewer | `claims`, status=`pending_review` |
| Cataloger | Embedder | `transcript_passages`, status=`unembedded` |
| Reviewer | Discretion Warden | `claims`, status=`passed_grounding` |
| Discretion Warden | First/Third Splitter | `claims`, status=`passed_discretion` |
| First/Third Splitter | Coordinator | `claims`, status=`passed_split` |
| Coordinator | Triage Patroller | git commit event → `articles_touched` queue |
| Triage Patroller | {Deepener, Enricher, Weaver, Shape Auditor} | per-role work queues |
| Deepener/Enricher/Weaver | Diff Sentinel | git commit event |
| Diff Sentinel | MoS Enforcer | passed articles |
| Re-Reader | Cataloger | re-queued `transcript_passages` with stale `prompt_version` |
| Contradiction Scout | Re-Reader | high-distance passage list |
| Promotion Committee | `article_grades` | daily ceremony |

Every handoff is a SQLite status transition. No agent ever calls another agent directly.

---

*End of brief. This document is the spec — not a commitment. Next step is for the human to pick a phase, then this turns into tasks.*
