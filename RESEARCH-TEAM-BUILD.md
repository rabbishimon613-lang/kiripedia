# KiriPedia Research Team — The Build

*Plain-English build doc. Written 2026-06-27. The single document that captures the vision, the first-month mission, the mechanics of how the team runs, and the goal we're shooting for by end of July.*

---

## 1. The vision in one paragraph

KiriPedia is a Wikipedia that writes itself from one man's mouth. A standing team of small bots churns John Kiriakou's full body of public tape — every interview, podcast, livestream, short — into a dense, encyclopedic wiki, eternally. New tape comes in, old tape gets re-read every time the article set grows, nothing decays, nothing gets forgotten. No humans in the loop except for doctrine calls. The team is visible to anyone on the site — you watch the encyclopedia build itself in real time.

---

## 2. The long-run shape

Two crews feed one airlock. The Research Team drinks from the airlock and turns raw tape into articles.

- **Future Bureau** — watches for new Kiriakou appearances (live).
- **Past Bureau** — digs back through the archive.
- **Airlock** — the staging layer. Bureaus write in. Research Team reads out. Nothing skips it.
- **Research Team** — extract, ground, file, deepen, weave, patrol, promote. Never idle.

Every time an article spawns or gets promoted, the lens shifts and old tape becomes new gold. The loop never closes.

---

## 3. The first-month mission (June 27 → July 31)

**Stop hunting for new sources. Re-churn the 88 hours of tape already on the shelf.**

Numbers we're starting from:
- 88 hours of transcribed Kiriakou audio
- ~798,000 words of source transcript
- 279 articles, ~300,000 article words
- Discovery side is currently dead; steady-state workers are tripping "nothing to do" guards

The bureaus stay off for the month. The bureaus turning back on is a July 31 event, not a June event.

---

## 4. How the team runs (two engines)

The team has two engines that turn at the same time.

### Engine 1 — fresh-tape pipeline (always running)

Bureaus drop tape → Scribe transcribes → Cataloger extracts claims → Reviewer grounds → Discretion Warden mirrors silences → First/Third Splitter tags witnessed vs relayed → Coordinator files into MDX → Deepener/Enricher/Weaver enhance → Diff Sentinel patrols.

This chain reads and writes whatever lands in the airlock. No promotions required. Just water through the pipe.

### Engine 2 — the eternal re-churn (Re-Reader)

The Re-Reader walks old transcripts under a new lens. Every passage carries a stamp: "last evaluated under article-set hash ABC." When the hash flips, the stamp goes stale and the passage is eligible to be re-read.

The Re-Reader's three possible verdicts on a re-read passage:
1. **Spawn article** — this passage now justifies an article that didn't exist before.
2. **Amend article** — this passage adds detail to an article that now exists.
3. **Tier-C track** — note the entity for later, no article yet.

(The third verdict is the one that's missing from the current implementation. Without it, density bleeds.)

### The flywheel

Engine 1 produces article changes. Article changes flip the hash. Hash flips refill Engine 2's queue. Engine 2 produces more article changes. Loop.

```
Engine 1 (steady churn) → articles change → hash flips → Engine 2 wakes up
                                    ↑                            ↓
                                    └──── new claims, stubs ─────┘
```

---

## 5. The hash and promotions, plainly

### The hash

Think of all 279 articles as one big fingerprint. As long as nothing changes, the fingerprint stays the same. The moment anything real happens — a stub spawns, an article gets promoted, a major enrichment changes shape — the fingerprint flips.

Every passage in every transcript has a tiny stamp saying which fingerprint version it was last judged under. When the fingerprint flips, every passage stamped with the old version is now stale.

That's the whole magic. The team finds new gold in the same 88 hours because the lens keeps shifting.

### What flips the hash

Lots of things, not just promotions:
- New article spawns (stub created)
- Existing article grades up (Stub → Start → C → B → GA → FA)
- Major enrichment changes an article's shape
- Article gets re-woven from stub-pile into prose

So the hash is flipping all day, every day, as a natural side effect of the team doing its normal work. Nobody has to "promote on purpose."

### How promotions actually fire

A small worker walks every article periodically and asks: "does this article now meet the threshold for the next grade?"

If yes, the Promotion Committee nominates it. The hard rule: **the editor cannot be the promoter.** Two of three different workers who touched the article (Deepener, Discretion Warden, Reviewer, etc.) must independently sign off. 2-of-3 yes = grade flips. Grade history records who promoted, who edited, when, under which prompt versions.

Then the hash flips. Stale verdicts expire. Re-Reader's queue refills.

### Grade thresholds (single-source canon)

- **Stub** — fewer than 3 cites
- **Start** — one section grounded
- **C** — multiple sections, ≥10 cites
- **B** — every transcript mention of the subject is cited or explicitly excluded with reason
- **GA** — passed Discretion Warden + first-person/relayed split + a full Weaver pass
- **FA** — committee quorum, top of the hill

---

## 6. The roster (18 roles, one process each)

Grouped by stage. **Bold** = new role to build. Plain = exists in the botnet.

### Discovery (off for month one)
- **Channel Crawler** — seed list of channels; walks each with yt-dlp; writes leads
- **Seed Gardener** — every catalogued co-guest becomes a candidate new seed
- **Podcast Sweeper** — pulls RSS feeds for audio-first appearances
- **Archive Diver** — periodic sweep of archive.org for dead RT content

### Acquisition
- **Scribe** — pulls auto-CC, falls back to manual subs, then Whisper-small on audio
- **Fingerprinter** — audio chromaprint + transcript MinHash; collapses duplicate uploads into one recording_id

### Extraction
- **Cataloger-Editor** — extracts atomic claims at passage granularity (with second-pass behavior — "what claim did I miss?")
- **Passage Embedder** — generates passage embeddings, sqlite-vec, incremental

### Adjudication
- **Reviewer** — grounds each claim against its source passage
- **Discretion Warden** — preserves Kiriakou's silences (aliases, "unnamed country," "I can't say")
- **First/Third Splitter** — tags claims as witnessed vs relayed

### Filing
- **Coordinator** — merges grounded claims into MDX (the Filer; unlimited batch)
- **Triage Patroller** — routes commits to the right downstream queue; **separates selection from work**

### Enhancement
- **Deepener** — under-cited articles → citation-augmented prose
- **Enricher** — orphan articles → cross-source wikilinks and "See also"
- **Weaver** — stub-pile articles → sectional narrative prose

### Patrol
- **Diff Sentinel** — reverts edits that remove cited claims; rolls back monotonic hedge-density rise
- **Shape Auditor** — flags articles whose TOC converges with too many peers
- **MoS Enforcer** — mechanical style: date formats, infobox fields, section order

### Continual learning
- **Re-Reader** — pulls top-scoring stale recording; emits spawn / amend / Tier-C-track / reject
- **Contradiction Scout** — nightly sweep of high-distance passage↔article pairs; queues suspects for Re-Reader

### Ceremony
- **Promotion Committee** — daily; quorum-gated grade flips

---

## 7. The contract (Swarm Brief + Checkpoint)

Adopted from Hermes Workspace. The single most important wiring change.

### Workers don't poll. Workers receive briefs.

Every unit of work is a **Swarm Brief** — a small contract:

- **brief_id** — identity
- **worker** — who's doing it
- **goal** — one sentence
- **why_now** — what triggered this brief
- **scope** — bounded items (this transcript, this article slug)
- **deliverables** — exact artifact paths and verdict shape
- **constraints** — token budget, wall-clock cap
- **escalation route** — what to do if blocked

No brief = no work. This kills the "nothing to do" idle-spin failure mode.

### Workers report checkpoints, not free-form status

When a worker finishes (or pauses), it returns:

```
STATE: DONE | BLOCKED | NEEDS_INPUT | HANDOFF | NEEDS_REVIEW
FILES_CHANGED: [...]
COMMANDS_RUN: [...]
RESULT: structured payload
BLOCKER: if blocked, why
NEXT_ACTION: what should happen next
```

The orchestrator reads the checkpoint and decides: **continue, repair, escalate, or queue for human.**

### The Triage Patroller is the orchestrator

It writes the briefs. It reads the checkpoints. It routes the work. It's the missing piece between "marching orders" (human intent) and "worker scripts" (execution).

---

## 7b. Fleet capacity (as of 2026-06-27)

The inference pool the team draws from. All keys verified live.

| Provider | Hot keys | Per-key rpm | Aggregate rpm | Primary role |
|---|---|---|---|---|
| Cerebras | 4 | 30 | 120 | reasoning (primary), code (primary) |
| Groq | 3 | 30 | 90 | fast (primary), final fallback |
| OpenRouter | 5 | 20 | 100 | longcontext (primary), reasoning fallback |
| **Total** | **12** | — | **310 rpm aggregate** | — |

Search keys (Tavily, Exa) are loaded but **not used in month one** — bureaus are off.

Role chains in `llm-fleet/roles.py`:
- **fast** → Groq Llama 3.3 → OpenRouter GLM 4.5 Air → OpenRouter GPT-OSS 20B
- **reasoning** → Cerebras GPT-OSS 120B → Cerebras GLM 4.7 → OpenRouter GPT-OSS 120B → OpenRouter Nemotron → Groq Llama
- **code** → Cerebras GPT-OSS 120B → OpenRouter Qwen3 Coder → OpenRouter GPT-OSS 120B → Groq Llama
- **longcontext** → OpenRouter Kimi K2.6 → OpenRouter Qwen3-Next 80B → Cerebras GPT-OSS 120B → Groq Llama

No new keys needed before bureaus turn back on (July 31).

---

## 8. The dashboard (replaces the pixel office)

Four panes, all rendered in Vector 2022 wiki skin so it reads as part of the encyclopedia, not bolted on.

### Pane 1 — Roster (Wikipedia project-page styling)
Table of all 18 roles. Lane, state (working/reviewing/idle/blocked), what they're working on right now. Updates live from snapshot.json.

### Pane 2 — Mission board (kanban as a sortable WikiProject table)
Six lanes: Backlog · Ready · Running · Review · Blocked · Done. Each card is a Swarm Brief tied to a real article slug.

### Pane 3 — Recent activity (Wikipedia Recent Changes styling)
Monospace stream of checkpoints. "Coordinator staged patch +38/−2 to admiral-crowe · 1 new cite · DONE." One line per event.

### Pane 4 — Statistics (Special:Statistics styling)
Articles touched today. Words added. Claims filed. Suspect queue depth. Updated at the bottom: Pennsylvania time, cycle number, cost today, hot key counts.

### Why this matters
Replaces sprite-decoration with real work made visible. Reinforces project identity ("a wiki made by bots, not decorated like one"). Single JSON file (snapshot.json) drives it all — no backend change.

---

## 9. The build order (month one)

### Week 1 — wiring
- Build the Re-Reader (the missing keystone)
- Add Tier-C-track verdict to Cataloger output (close the density bleed)
- Wire up Triage Patroller as the orchestrator
- Stand up SwarmBrief schema in the DB
- Convert one existing worker to checkpoint format as proof

### Week 2 — turn the engine over
- Convert remaining workers to brief-receive / checkpoint-emit
- Re-Reader starts walking the existing shelf
- Dashboard pane 1 (Roster) goes up on /research-team
- First hash flips happen as Cataloger second-pass fires

### Week 3 — full throttle
- Dashboard panes 2-4 (Mission board, Recent activity, Statistics) ship
- Discretion Warden activates (prompt exists; wire it up)
- Promotion Committee runs first ceremony

### Week 4 — patrol + polish
- Diff Sentinel activates
- Shape Auditor activates
- Tune for end-of-month sprint

---

## 10. The goal (the number)

By end of July:

| Outcome | Wiki size | What it means |
|---|---|---|
| Floor | 350k words | Team ran, didn't sprint |
| **Real goal** | **400k words** | Team hit the contract most days |
| Great | 450k | Full throttle from week 2 |
| Stretch | 500k | Marching-orders target, every metric green |

Article count: 279 → ~290–295.

**Locked target: 400k woven article words by 2026-07-31.**

If we hit 400k, we've proven the shelf-churn engine works without new intake. That's the whole point of the month. After July 31, bureaus turn back on, fresh tape adds to the workload, the loop keeps spinning.

---

## 11. What we are explicitly NOT building this month

- No new sources. The shelf is full.
- No custom orchestrator beyond the Triage Patroller. SwarmBrief + Checkpoint is the orchestrator.
- No inter-agent chat. Briefs in, checkpoints out, DB as the bus.
- No vector DB beyond sqlite-vec. The corpus isn't big enough to need anything more.
- No pixel office. Replaced by the four-pane wiki-skinned dashboard.
- No backwards-compat shims. Workers are small; rewrite when needed.

---

## 12. Doctrine that flows through every worker (non-negotiable)

1. **Single-source canon** — only what John said on public tape
2. **Mirror his discretion** — aliases, "I can't say," redactions preserved verbatim
3. **Encyclopedic voice** — no "according to John"; sourcing lives in footnotes
4. **Capture density** — every named entity, dollar figure, weapon, date, quote preserved
5. **Direct quotes when striking** — blockquotes for memorable phrasing, never change meaning

Voice calibration: "per Kiriakou" in summary frontmatter is fine; ≤2 body attributions per article.

Every prompt encodes this. Every worker stamps decisions with its prompt_version so we can re-evaluate when doctrine shifts.

---

## 13. One-line summary

**Build the SwarmBrief layer, ship the Re-Reader, replace the pixel office with the four-pane wiki dashboard, and re-churn the 88-hour shelf to 400k woven words by July 31.**

After that, the bureaus open the tap and the loop keeps turning. Forever.
