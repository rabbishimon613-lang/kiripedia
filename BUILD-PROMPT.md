# Full Build Prompt — Research Team, End to End

*Paste the block below into a fresh Sonnet 4.6 session opened in `/Volumes/EOS_DIGITAL/KiriPedia/`. This builds the entire four-phase research team in one sweep, with explicit pauses between phases so the session can report progress and you can spot-check before the next phase starts.*

---

```
Read these files first, in order:
1. RESEARCH-TEAM-BUILD.md — the spec, this is your contract
2. EDITORIAL-EVOLUTION.md — the Era-1 instincts the team must inherit
3. TEAM-REWORK.md — the long-form architectural reasoning
4. MARCHING-ORDERS.md — what the team must do this month
5. botnet/README.md + botnet/run-cycle.mjs — current state of the botnet

You are building the entire research team rework in a single session,
in four phases. Do not jump ahead. After each phase, write a one-screen
status report and stop for spot-check before continuing.

Working branch: research-team/build. Never touch main.

LLM fleet: 4 Cerebras + 3 Groq + 5 OpenRouter = 12 hot keys, 310 rpm
aggregate. Cerebras is primary on reasoning + code. Use llm-fleet MCP
workers (mcp__llm-fleet__worker_fast / worker_reasoning /
worker_longcontext). Do NOT call Anthropic APIs.

================================================================
PHASE 1 — WIRING (the plumbing)
================================================================

(1.1) SwarmBrief schema. Add to botnet/data/botnet.db:
    briefs(brief_id, worker, goal, why_now, scope_json,
           deliverables_json, constraints_json, status,
           created_at, claimed_by, claimed_at, completed_at)
    Status: pending | claimed | done | quarantined.

(1.2) Checkpoint schema:
    checkpoints(checkpoint_id, brief_id, state, files_changed_json,
                commands_run_json, result_json, blocker,
                next_action, created_at)
    State: DONE | BLOCKED | NEEDS_INPUT | HANDOFF | NEEDS_REVIEW.

(1.3) passage_verdicts schema:
    passage_verdicts(passage_id, worker, verdict, reason,
                     article_set_hash, prompt_version, created_at)
    Verdict: spawn_article | amend_article | tier_c_track | rejected.
    Upsert by (passage_id, article_set_hash).

(1.4) article_set_hash function in botnet/lib/hash.mjs.
    Deterministic SHA-256 of sorted (article_slug, grade) pairs
    from src/content/articles/. Default grade = "stub" if no grade
    stamped yet. Export bumpHash() that re-reads from disk.

(1.5) lib/briefs.mjs — issue(), claimNext(brief_id, worker),
    complete(brief_id, checkpoint), quarantine(brief_id, reason).
    Atomic claim via UPDATE ... WHERE status='pending' RETURNING.

(1.6) lib/checkpoints.mjs — write(brief_id, payload), latestFor(brief_id).

End of Phase 1: print row counts for each new table, the current
article_set_hash, and a one-paragraph "ready for Phase 2" note.
STOP and wait for "continue".

================================================================
PHASE 2 — TURN THE ENGINE OVER
================================================================

(2.1) Convert Cataloger (botnet/workers/cataloger-editor.mjs) to
    brief-receive / checkpoint-emit. Wrap LLM calls; quarantine on
    failure. Add second-pass behavior: when the brief's scope says
    "second-pass", the Cataloger re-walks an already-catalogued
    transcript hunting for missed claims (hedges, asides, throwaways).

(2.2) Convert remaining workers the same way:
    - scribe.mjs
    - reviewer.mjs
    - coordinator.mjs
    - deepener.mjs
    - enricher.mjs
    - weaver.mjs
    - reweaver.mjs
    - indexer.mjs
    Each one: pull brief → execute scope → emit checkpoint. Keep the
    workers small. Doctrine lives in prompts/<role>.md, not code.

(2.3) Triage Patroller (botnet/workers/triage-patroller.mjs).
    No LLM calls. Pure rules. Reads DB state, writes briefs:
    - For each transcript not yet second-passed: emit Cataloger brief,
      bias toward transcripts whose articles are <1,800 words.
    - For each article >5,000 words with TOC convergence risk: emit
      Weaver brief.
    - For each article with stale passage_verdicts (old hash) at high
      curriculum score: emit Re-Reader brief.
    - For each article that just got new claims this cycle: emit
      Enricher brief to fan out 1:N to every other article the
      passage mentions.
    Selection ≠ work. The Patroller writes briefs; the workers execute.

(2.4) Re-Reader (botnet/workers/re-reader.mjs). New worker.
    - Reads transcripts from src/content/sources/
    - Walks paragraph-timestamped passages
    - For each passage, emits one of four verdicts:
      spawn_article | amend_article | tier_c_track | rejected
    - Uses worker_longcontext via llm-fleet MCP, falls through to
      worker_reasoning if rate-limited.
    - Writes to passage_verdicts stamped with current article_set_hash.
    - Doctrine in prompts/re-reader.md — must encode the Era-1 instincts
      from EDITORIAL-EVOLUTION.md §"What the research team must inherit".

(2.5) Wire automatic article_set_hash bump:
    - Coordinator bumps after every commit
    - Re-Reader on every spawn_article verdict that lands
    - Promotion Committee on every grade flip (Phase 3)

End of Phase 2: run one full cycle. Print: briefs issued, checkpoints
written, articles touched, words added, hash flip count, first 5
Re-Reader verdicts with passage text. STOP and wait for "continue".

================================================================
PHASE 3 — DOCTRINE GUARDS + CEREMONY
================================================================

(3.1) Discretion Warden (botnet/workers/discretion-warden.mjs).
    Prompt already exists at prompts/discretion-warden.md.
    Reads claims with status=passed_grounding. For each claim about a
    third party, checks corpus-wide whether Kiriakou names this person
    in similar contexts. If he ducks the name, the claim must mirror
    his discretion. Lexical diff, no fabrication.

(3.2) First/Third Splitter (botnet/workers/first-third-splitter.mjs).
    Prompt at prompts/first-third-splitter.md. Tags each claim
    JK_witnessed vs JK_relayed. Coordinator uses this tag to format
    attribution downstream (witnessed = encyclopedic voice, no
    attribution prefix; relayed = "According to Kiriakou..." prefix).

(3.3) Promotion Committee (botnet/workers/promotion-committee.mjs).
    Prompt at prompts/promotion-committee.md. Runs daily at 23:00
    Pennsylvania time. For each article eligible for grade-up, requires
    concurrence from 2 of 3 different role-workers who touched it.
    Editor ≠ promoter (hard gate). Writes to article_grades table:
    article_grades(slug, grade, promoter, editor, prompt_version, at).
    On grade flip, bumps article_set_hash.

(3.4) Diff Sentinel (botnet/workers/diff-sentinel.mjs).
    Watches every commit. Reverts edits that remove cited claims
    without replacement. Tracks per-revision hedge density
    ("allegedly," "reportedly," "is said to" per 1k words).
    Three monotonic-rise revisions without new corpus input → rolls back
    to lowest-hedge version. Writes incidents to a new table:
    drift_incidents(slug, kind, from_rev, to_rev, reason, at).

(3.5) Shape Auditor (botnet/workers/shape-auditor.mjs).
    Computes TOC fingerprint (sorted H2 headers) per article. Flags
    articles whose TOC fingerprint matches >5 others. Nominates for
    structural rework via a Weaver brief tagged "shape-redesign".

(3.6) MoS Enforcer (botnet/workers/mos-enforcer.mjs).
    Mechanical style pass: date formats (YYYY-MM-DD only when JK uttered
    the precise date), infobox fields, section order, wikilink integrity
    (use existing tools/audit-wikilinks.mjs as the engine).

End of Phase 3: run one full cycle. Print: discretion redactions made,
first/third splits applied, articles promoted, drift incidents,
shape audits flagged. STOP and wait for "continue".

================================================================
PHASE 4 — DASHBOARD (replaces pixel office)
================================================================

(4.1) snapshot.json writer. Update botnet/lib/snapshot-writer.mjs to
    emit the schema described in RESEARCH-TEAM-BUILD.md §8:
    {
      cycle_id, started_at, ended_at,
      roster: [{role, lane, state, working_on, last_action_at}, ...],
      board: {backlog:[...], ready:[...], running:[...],
              review:[...], blocked:[...], done:[...]},
      activity: [{ts, worker, summary, link}...last 50],
      stats: {articles_touched_today, words_added,
              claims_filed, suspect_queue, cost_today,
              hot_keys: {cerebras: n, groq: n, openrouter: n}}
    }
    Written at end of every cycle to public/snapshot.json.

(4.2) Build the /research-team route in Astro. Replace pixel office
    entirely. Four panes, Vector 2022 wiki skin. Wikipedia conventions:
    - Roster pane = WikiProject roster table
    - Mission board = sortable status table, six lanes
    - Recent activity = Recent Changes styling (monospace, dense)
    - Statistics = Special:Statistics styling

    Use the mockup output from earlier as the visual reference if
    available. Otherwise design from RESEARCH-TEAM-BUILD.md §8.

(4.3) Polling: client-side fetch of /snapshot.json every 15s. No
    backend, no websocket. Astro island that hydrates on the route.

(4.4) Remove pixel office references from /about and homepage. Add
    "Watch the team work" link to /research-team.

(4.5) Verify with preview_start + preview_screenshot. Confirm all four
    panes render and the snapshot updates after a cycle runs.

End of Phase 4 (and full build): print a final report:
- All tables created, row counts
- All workers converted, with checkpoint counts
- First end-to-end cycle that produced a brief → claim → grounding →
  discretion → split → commit → hash flip → re-read pass
- Dashboard URL, screenshot path
- Words added across the cycle
- Anything quarantined, with reasons
- The one thing Pedro should test by hand before going 24/7

================================================================
GLOBAL RULES (apply across all phases)
================================================================

- Branch: research-team/build only. Never touch main.
- LLM access: llm-fleet MCP only. No Anthropic APIs.
- Idempotency: every worker safe to re-run on the same input.
- Quarantine, never crash. Wrap every LLM call.
- Prompts in prompts/<role>.md, never hardcoded strings.
- Doctrine is non-negotiable. Section 12 of RESEARCH-TEAM-BUILD.md.
- One process per role. Batch size scales the work, not process count.
- Selection ≠ work. Triage Patroller writes briefs; workers execute.
- The hash is the heartbeat. Bump it on every real article change.
- Stop and report at end of every phase. Wait for "continue".
```

---

## After the build

Once Phase 4 finishes clean and the dashboard is live, the team goes 24/7. Cron schedule at `*/10` minutes. Watch the four-pane dashboard for the first day, then ignore it for a week and let the loop run. Check back end of week to see the words-added curve and tune any worker tripping its "nothing to do" guard.

Target: **400k woven article words by 2026-07-31.**
