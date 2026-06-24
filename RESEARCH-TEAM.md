# Building a Research Team

*How to stand up an autonomous LLM research team that actually does work, drawn from the KiriPedia botnet build. Written 2026-06-22 after the cycle went live.*

---

## What "research team" means here

A pool of single-purpose LLM workers, running on a schedule, with persistent state, that read sources → extract facts → write/edit a corpus → publish. No human in the loop per task; humans set doctrine and review at the PR boundary.

This document covers the *team-building* part. Editorial doctrine, prompt design, and corpus shape are downstream of it.

---

## 1. Start with a pipeline, not a swarm

The temptation is to spawn N general-purpose agents and "let them collaborate." Don't. Collaboration is expensive; pipelines are cheap.

Draw the work as a directed graph from raw input to published output. For KiriPedia: `youtube link → triage → transcribe → extract claims → ground → draft MDX → review → merge`. Each node is a worker. Each edge is a queue. Workers only ever read from their input queue and write to their output queue.

The pipeline shape gives you four things for free:
- **Bottleneck visibility.** Throughput = slowest stage. You parallelize that stage and nothing else.
- **Failure isolation.** A bad scribe poisons one queue, not the world.
- **Cheap testing.** Each worker is a pure function of its input row.
- **Cheap upgrade path.** Swap a worker's model/prompt without touching anyone else.

---

## 2. One worker, one job, one prompt

Each worker is a small node script with a single role. The role fits in one sentence. If you can't write it in one sentence, split it.

Good role: "Pull auto-captions for one YouTube ID and normalize the VTT to paragraph-timestamped markdown."
Bad role: "Handle transcription and extraction."

Why: a one-sentence role gives you a tight system prompt, a tight output schema, and a tight eval. The moment a worker has two jobs, its prompt has to context-switch, its output schema bloats, and you lose the ability to swap models per role.

A KiriPedia worker is ~80 lines: claim a row, call the LLM, validate the output, write the result, mark the row done. That's it.

---

## 3. State lives in a database, not in agent memory

Workers are stateless processes. State is a SQLite file (or any DB).

Two tables do most of the work:
- A **work table** with a status column: `pending | claimed | done | quarantined`.
- An **events table** that logs every transition with `(ts, worker, row_id, event, metadata_json)`.

Atomic claim is the only non-trivial bit:

```sql
UPDATE clips SET status='claimed', claimed_by=?, claimed_at=?
WHERE id = (SELECT id FROM clips WHERE status='pending' ORDER BY id LIMIT 1)
RETURNING *;
```

That `RETURNING` (or a `WHERE status='pending'` guarded update + check rowcount) lets N workers race without locks. Crashed workers reset stale claims on the next cycle.

The events table is the activity log, the audit trail, and the snapshot source all in one. Don't invent a separate logging system.

---

## 4. Workers are dumb; doctrine lives in prompts

Workers don't decide policy. They execute a prompt that encodes the doctrine.

Keep prompts in `.md` files next to the worker, not in code. Three reasons:
1. Non-engineers (the person who owns the corpus) can read and edit them.
2. Git diff on a prompt change is meaningful — code-review the doctrine.
3. You can hot-reload prompts without redeploying workers.

When the work feels off, the fix is almost always in the prompt, not the code. Resist the urge to add Python heuristics around the LLM call.

---

## 5. Key rotation is non-optional

Free-tier LLM keys (Cerebras, Groq, etc.) hit rate limits within minutes of real work. Bake rotation in from day one.

A minimal rotator:
- Take a list of keys from env: `CEREBRAS_KEYS=key1,key2,key3`.
- Hold an index in memory. On 429 or auth error, advance the index and retry.
- On total exhaustion, mark the row `quarantined` with reason, move on.

Don't build a queue, don't build a scheduler, don't build a "cost optimizer." Just rotate.

---

## 6. Schedule it from outside, don't write a daemon

Two ways to run the pipeline:

**Cron (GitHub Actions, every 5–30 min).** Cold checkout, run one cycle, commit results, exit. Free. No infra. Limits: ~5 min granularity floor, no persistent in-memory state between runs, GH pauses cron on inactive repos after 60 days.

**Always-on worker ($5/mo VPS).** A loop that runs `run-cycle.mjs`, sleeps 20–60s, repeats. Persistent SQLite on disk. True 24/7. Snapshot pushed back to repo every 5–15 min so the static site has something to render.

Default to cron until throughput demands more. Migrating cron → VPS is a 10-minute change because workers are already stateless.

Whichever you pick, the workflow YAML or the loop script is the *only* thing that knows about scheduling. Workers never call `setInterval`.

---

## 7. Give the team a heartbeat the human can see

Workers running invisibly is indistinguishable from workers not running. Build the heartbeat before you build the seventh worker.

Minimum viable heartbeat:
- A `snapshot.json` written at end of every cycle, containing per-worker last action + timestamp.
- A public page (or wiki section) that polls it every 15s.
- A "last cycle" block: started_at, ended_at, claims merged, articles touched.

If the snapshot timestamp is older than `2 × cron_interval`, something's broken. That single check is more valuable than any APM dashboard you'd buy.

(KiriPedia's pixel office is the same idea with sprites on top. Not required — a plain HTML table works.)

---

## 8. Quarantine, don't crash

When a worker can't do its job — bad transcript, claim fails grounding, LLM returns garbage — the row goes to a `quarantine` table with the reason. The pipeline keeps moving.

Quarantine is also the human's queue. Once a week, look at quarantined rows. Patterns emerge: a channel that always fails captions, a claim shape the extractor mishandles. Those patterns are how prompts (and occasionally code) get sharpened.

Workers that throw uncaught exceptions instead of quarantining are bugs. Wrap the LLM call, catch everything, write a row.

---

## 9. Idempotency or it doesn't ship

Every worker must be safe to run on the same input twice. Cron re-runs happen. Workflow_dispatch retries happen. A worker that double-publishes or double-claims is worse than a worker that doesn't run.

Patterns:
- Status guards: a `claimed` row is not re-claimable.
- Content hashes: skip work if the input hash matches the last completed output's input_hash.
- Upserts, not inserts, on the output side.

This is boring plumbing. Do it on day one or you'll do it on day fifteen after a duplicate-content incident.

---

## 10. Compose the team in three passes

You will not design the right team on a whiteboard. Three passes is the realistic shape:

**Pass 1 — do it manually, once.** Ingest one item from raw input to published output by hand, narrating each step in a markdown file. That file is your spec. KiriPedia's `ARTICLE-WORKFLOW.md` is exactly this.

**Pass 2 — automate the bottleneck.** The slowest manual step gets a worker. Run the rest by hand. Throughput moves; some downstream step becomes the new bottleneck.

**Pass 3 — fill in the pipeline.** Now you know which roles need to exist. Build them small, wire them through the same DB, deploy them under the same cron.

Skipping pass 1 produces a team that does the wrong work very efficiently.

---

## 11. What not to build

- **A custom orchestrator.** Cron + DB is the orchestrator.
- **A planner agent.** Pipelines don't need planning; they need executing.
- **Inter-agent chat.** Workers don't talk to each other. They write to queues.
- **A vector store**, until the corpus is big enough that grep stops working. For most projects that's never.
- **A control panel UI.** A static snapshot page and `gh run list` cover 95% of operations.
- **Backwards-compat shims** between worker versions. Workers are 80 lines; just rewrite.

Each of these is fun to build and uncorrelated with whether the corpus grows.

---

## 12. The honest cost model

A pipeline of ~10 workers, ~50–100 LLM calls per cycle, on free-tier keys with rotation, running every 10 minutes on GH Actions:

- **Compute:** $0 (GH free tier, well under monthly limits).
- **LLM:** $0 with free keys; cap at ~$20/mo if you outgrow them.
- **Storage:** SQLite + JSON snapshot in the repo. $0.
- **Human time:** ~1 hour/week reading quarantine + tuning prompts.

If your project can't afford that, the bottleneck isn't tooling — it's the corpus question itself.

---

## Appendix — Minimal file layout

```
research/
  README.md              ← this doc, project-specific edits
  ARTICLE-WORKFLOW.md    ← the manual spec from pass 1
  lib/
    db.mjs               ← claimNext, markDone, quarantine
    fleet-client.mjs     ← key rotation + LLM call
  workers/
    triage.mjs
    scribe.mjs
    extractor.mjs
    reviewer.mjs
    coordinator.mjs
  prompts/
    triage.md
    scribe.md
    ...
  run-cycle.mjs          ← runs each worker in order, writes snapshot
  data/
    work.db
.github/workflows/
  research-cycle.yml     ← */10 cron, runs run-cycle.mjs, commits snapshot
public/
  snapshot.json          ← heartbeat, polled by the site
```

That's the whole thing. Add roles, not infrastructure.
