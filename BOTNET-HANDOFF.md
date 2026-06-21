# KiriPedia Botnet — Handoff Document

*Captures the design + build state as of 2026-06-21. Read this first in any new Claude session that is continuing KiriPedia botnet or pixel-office work. The conversation that produced this is too long to reload; this MD is the source of truth going forward.*

---

## 0. Project at a glance

**KiriPedia** is a Wikipedia-style single-source-of-truth wiki built entirely from John Kiriakou's publicly available video/podcast/livestream appearances. The site is Astro static, deployed on Vercel free tier, lives at `/Volumes/EOS_DIGITAL/KiriPedia/`.

Two halves of the build:

1. **The autonomous botnet** — runs on GitHub Actions cron, ingests new clips, extracts grounded claims, drafts MDX patches, opens PRs, auto-merges. Cloud-hosted. **Not yet built.**
2. **The pixel office visualization** — about-page eye candy showing the bots working. Already built and running locally at `/Volumes/EOS_DIGITAL/KiriPedia/office/` — port 5178 currently.

This doc covers BOTH halves so a new session can finish the botnet AND ship the visualization onto the live KiriPedia site.

---

## 1. Editorial doctrine (non-negotiable)

Captured in `~/.claude/projects/-Volumes-EOS-DIGITAL/memory/feedback_kiripedia_doctrine.md`. Summary:

1. **Single-source canon.** Facts must come from John's publicly available video/podcast/livestream/short-form appearances. Not books. Not Wikipedia. Not news. Not court docs.
2. **Mirror John's discretion.** Aliases, "I can't say", redactions — the article mirrors them verbatim. No editorial inference.
3. **Encyclopedic voice.** No "according to John" in prose; sourcing is invisible via `<Cite s="..." t="..." />` footnotes. Reader knows from About page that every fact is John's.
4. **Capture density.** Every named person, dollar figure, weapon, date, quote preserved. Single-source facts are still canon.
5. **Direct quotes when striking.** Blockquotes for memorable phrasing. Clean auto-caption errors but never change meaning.

Voice calibration in `~/.claude/projects/-Volumes-EOS-DIGITAL/memory/feedback_kiripedia_voice_calibration.md`: `per Kiriakou` in summary frontmatter is fine; up to 2 body attributions per article is fine.

---

## 2. The 14-bot workforce — optimal for backfill

The botnet has a **pipeline shape**: clip → triage → vet → transcribe → extract → ground → draft → publish. Pipeline throughput = slowest stage. Slow stages get parallelized.

| # | Role (Wikipedia register) | Count | Purpose | API budget |
|---|---|---|---|---|
| 1 | **Acquisitions Librarian** *(new)* | 1 | Broad sweep for new shows/channels John appears on (Tavily) | 1 Tavily, weekly |
| 2 | **Recent Changes Bot** | 1 | Polls YouTube/podcast feeds for known channels | YouTube Data API, no LLM |
| 3 | **New Page Patroller** | 1 | Triages new clips: on-corpus / off-corpus | worker_fast |
| 4 | **Source Auth Clerk** | 1 | Verifies channel + adds to grounds.json | worker_reasoning, rare |
| 5 | **Scribe** *(was Transcription Bot)* | **3** | yt-dlp + VTT prep + segmentation | worker_longcontext (Groq), parallel |
| 6 | **Cataloger** *(was Stub Sorter)* | **3** | Atomic claim extraction with quote + timestamp | worker_reasoning (Cerebras), parallel |
| 7 | **Reviewer** *(was Citation Bot)* | **2** | 12-layer grounding stack (mostly code, some LLM) | worker_reasoning, parallel |
| 8 | **Copy Editor** *(was Editor)* | **2** | Routes claim to article slug, emits MDX patch | worker_reasoning, parallel |
| 9 | **WikiProject Coordinator** | 1 | Opens PR, runs CI, auto-merges. **Must serialize.** | Sonnet (Harbor Master pattern), local |
| 10 | **Indexer** *(new)* | 1 | Rebuilds search index + people-graph at cycle end | code only |

**Total: 14 bots.** Throughput estimate: **~100-150 clips/day** during backfill. Backfill estimate: ~5000 hours of John content × ~3 clips/hour = ~15,000 clips → **4 months to drain** at this rate vs 16 months with the original 8-bot serial pipeline.

### Daily-state distribution

During backfill (busy):
- ~50% of bots working at any given moment
- ~10% in handoff motion
- ~40% briefly idle between tasks

After backfill (steady state):
- ~5-15 min of work per bot per day (real John content cadence is 1-3 clips/week)
- 95% of office is sleeping
- Drama in bursts when a clip drops

---

## 3. The 12-layer grounding stack (Reviewer's job)

Single-source canon = the verification question is "did John say this in this clip at this timestamp?" Not "is this true." Most layers are pure code, no LLM.

1. **VTT phrase grep** — verbatim quote must appear in source `.vtt`. No fuzzy.
2. **Timestamp window** — `[start, end]` cue must contain the quote.
3. **Off-corpus contamination** — every named entity must appear ±90s of the quote *somewhere* in any John transcript. If it appears nowhere → smuggled from model training → quarantine.
4. **Discretion mirror** — if John used alias / "I can't say" in cited window, claim mirrors it. Lexical diff.
5. **Citation integrity** — `<Cite s t />` round-trips to a real cue.
6. **Cross-clip restatement** — said 3+ times → `RESTATEMENT` (append cite only). Contradicts prior → `CONTRADICTION-WITH-PRIOR` → suspect.
7. **Voice contamination** — regex bans "according to John" / "Kiriakou said" / attribution-as-sourcing per doctrine rule #3.
8. **Density floor** — patches without entity/figure/date → filler → reject.
9. **Channel provenance** — clip's channel must be in `grounds.json` (Reliable Sources List).
10. **Second-pass re-extract** — different fleet model re-extracts same segment; disagreement → quarantine.
11. **Confidence score** — ≥90 auto-merge, 50–89 merge-flagged, <50 quarantine.
12. **Bio gate** — `is_about_kiriakou_himself: true` always → quarantine for Opus review.

Quarantine never deletes. Quarantine reasons aggregate weekly → become "do not" clauses in prompts (self-improvement loop).

---

## 4. Airlocked operation

User decision: **no Opus, no human intervention** at steady state.

- **No GA/FA Reviewer.** Suspect queue = dead-letter, not inbox. Anything that would have gone to Opus instead quarantines with a reason. Stays there. Site never sees it. Nobody is paged.
- **New articles auto-create** if grounding stack passes ≥90 confidence.
- **Contradictions** don't escalate; both claims stay cited with `{{disputed}}` banner on article. Reader sees the tension.
- **Stricter gates to compensate:** confidence ≥90 (not 80), second-pass agreement mandatory, biographical claims auto-quarantine forever.
- **Weekly self-audit:** Coordinator dumps quarantine reasons to `fleet/audit/YYYY-WW.md` in the repo. Nobody reads it unless they want to.

The bureau runs itself. You can ignore it for a year.

---

## 5. API keys — see `/keyring`

All keys now managed via the **`/keyring` slash skill** (`~/.claude/skills/keyring/`). In any new session, type `/keyring list` to see current state.

### As of 2026-06-21:

| Provider | Total keys | Owner allocation |
|---|---|---|
| **Cerebras** | 5 | `cerebras-1` → llm-fleet; `cerebras-2..5` → **unassigned, earmarked for KiriPedia** |
| **Groq** | 3 | all → llm-fleet (can share with KiriPedia) |
| **OpenRouter** | 5 | all → llm-fleet |
| **Tavily** | 5 | shared between llm-fleet and chabad-tracker |
| **Exa** | 5 | shared between llm-fleet and chabad-tracker |
| **Anthropic** | 2 | paid: trading + dev_yitzach (DO NOT poach for bots) |

### Recommended KiriPedia allocation (14-bot workforce):

- **Cerebras × 3** (`cerebras-2,3,4`) — Catalogers + Reviewers reasoning
- **Cerebras × 1** (`cerebras-5`) — Copy Editors reasoning
- **Groq × 2** — Scribes long-context (share with fleet)
- **OpenRouter × 3** — Patroller fast + fallback
- **Tavily × 1** — Acquisitions Librarian (share existing)
- **Exa × 1** — backup search (share existing)
- **YouTube Data API × 1** — Recent Changes Bot (need to provision; free tier 10k units/day)

Net new keys needed: 1 (YouTube Data API).

Use `/keyring allocate cerebras-2 kiripedia` etc. to claim them.

---

## 6. Layout & infrastructure

### Repo
- `/Volumes/EOS_DIGITAL/KiriPedia/` — Astro site (the wiki itself; lives now)
- `/Volumes/EOS_DIGITAL/KiriPedia/fleet/` — old harbor-master architecture (Sonnet local + plant workers). **To be replaced** by GitHub Actions cron pipeline.
- `/Volumes/EOS_DIGITAL/KiriPedia/office/` — pixel office visualization (this convo's build)

### Public repo
- Mirror `chabad-tracker` pattern: public GitHub repo, GH Actions on cron, API keys in Actions secrets.
- Vercel auto-deploys on push to `main`.
- `snapshot.json` written by bots, read by the about page poller.

### Vercel free tier
- 100GB bandwidth/mo, 1M edge invocations
- 8KB gzipped `snapshot.json` polled every 15s → 1.9MB/visitor/hr
- Wall hits at ~50k visitor-hours/mo (~700 concurrent sustained) — we won't.

---

## 7. The pixel office — current state (port 5178)

### Fork base
`rolandal/pixel-agents-standalone` — MIT, React + HTML5 Canvas2D, ~3k LOC, ships with A* pathfinder + tile map loader + sprite animator + speech bubbles.

### What we changed (vs upstream)

**Server** (`server/`):
- Replaced `JsonlWatcher` with **`SnapshotWatcher`** (chokidar polling) that reads `webview-ui/public/snapshot.json` and translates per-bot state changes to WS messages (`agentToolStart`, `agentStatus:idle`, `agentToolsClear`, **new: `agentHandoff`**).
- Bot roster is fixed: 8 bots IDs 1..8, hardcoded labels + role-locked seat IDs (`seat-<key>`).
- Each bot has a `toolPrefix` ("Reading" / "Editing") prepended to action text so the engine picks the right idle sprite (reading vs typing pose).

**Layout** (`webview-ui/public/assets/default-layout.json` — generated by `scripts/build-library-layout.mjs`):
- 26×26 grid, **fully open-plan** (no interior walls, no doors — just outer border)
- 8 themed areas with role-specific furniture mixes (Recent Changes = PC+lamp; Source Auth = bookshelves; Editor = whiteboard+plant; etc.)
- Each area uses a distinct floor-color tint (slate, ochre, lilac, warm wood, sage, navy, burgundy, gold)
- Central open meeting plaza (kept for occasional all-hands) with table + 4 chairs + whiteboard as Kiriakou portrait placeholder + lamps + plant
- Bot's owned chair tile = `seat-<key>` — engine auto-assigns each bot to their themed alcove via `existingAgents.agentMeta.seatId`

**Mock generator** (`scripts/mock-snapshot.mjs`):
- Rewrites snapshot.json every 25s
- 30% chance any bot is "working", 70% idle (leaves headroom for scheduler)
- Per-bot action verb pool **trimmed of fictional props** ("Wire Desk", "pigeonhole", "Card Catalog" — all removed)
- 35% of working ticks emit a **handoff** (`handoff_to: <key>`) that triggers a visit

**Scheduler** (`webview-ui/src/office/kiripediaScheduler.ts`):
- **Snapshot-driven visits**: listens for `agentHandoff` WS messages, fires visits immediately when the mock emits one
- **Fallback errand timer (5s)**: idle bots wander to MR tile or corridor crossing
- **Fallback meeting timer (15s)**: random pipeline-pair visit if no snapshot-driven one is firing
- Visit choreography: visitor walks to host's **visitor spot** (1 tile from host's chair), waits, bubble pops on both, visitor returns home after 10s
- Skips bots already in WALK state

**MeetingCard** (`webview-ui/src/components/MeetingCard.tsx`):
- Scene caption anchored to **host's chair tile** (fixed coords — no fragile moving-bot math)
- Shows handoff title in gold caps + blurb in monospace + downward arrow pointing at host
- Reads from `useActiveMeeting()` hook backed by `meetingFeed.ts`

**EventLog** (`webview-ui/src/components/EventLog.tsx`):
- Block element below the canvas (NOT floating overlay anymore)
- Timestamps in Eastern Time (`Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' })`)
- Capped at 200 entries, autoscrolls, monospace

**Action label override** (`webview-ui/src/office/components/ToolOverlay.tsx`):
- During an active meeting, both visitor & host's labels show `In meeting: <title>` instead of snapshot action text — prevents contradiction.

### Pipeline-pair definitions
```js
RC → NPP        — "New Page Triage"
NPP → SourceAuth — "Channel Vetting"
SourceAuth → Transcription — "Channel Approved"
Transcription → StubSorter — "Transcript Handoff"
StubSorter → Citation — "Claims for Grounding"
Citation → Editor — "Verified Facts"
Editor → Coordinator — "PR Review"
```
Direction always **upstream → downstream**.

### Running it
```bash
cd /Volumes/EOS_DIGITAL/KiriPedia/office
npm run dev                              # terminal 1 — concurrently runs server (3456) + vite (5178)
node scripts/mock-snapshot.mjs           # terminal 2 — fake botnet
open http://localhost:5178
```

Mock script writes `snapshot.json`; server's chokidar picks it up; broadcasts WS; engine animates.

---

## 8. What the pixel office still needs (deferred from this round)

### Beds + sleep state
- Real botnet activity is **95% idle** at steady state (post-backfill). User wants bots in beds, not aimlessly wandering.
- Need: top-down bed sprite (LimeZu Modern Interiors has one — free CC-BY)
- Add `bed` to furniture catalog (`furniture-catalog.json` + PNG)
- One bed per bot's area
- Engine state: if bot idle > 1 hour → walk to bed, lie down, stay until next snapshot work event
- During backfill: rarely seen. After backfill: most common state.

### Role-themed pixel art props
Senior dev rated this EXPENSIVE — needs new sprites. Asset scout brief:
- **Top 3 free packs to download**: LimeZu Modern Interiors (free CC-BY), Cainos Top Down Basic (best Penzilla style match), Ninja Adventure Pack (CC0 — scrolls/quills/seals)
- Items to commission or fleet-generate: card catalog cabinet, rolling library ladder, rubber stamp + ink pad, wax-seal stamps, quill+inkwell at desk scale, Kiriakou portrait
- Extending `furniture-catalog.json` schema is straightforward if dims/offset fields are honored — verify before adding

### Office visit destination per bot (already done)
Visitor spots and chair tiles are already defined in `kiripediaScheduler.ts`:
```js
BOT_CHAIR     = {1:(3,3), 2:(3,8), 3:(3,13), 4:(3,18), 5:(22,3), 6:(22,8), 7:(22,13), 8:(22,18)}
BOT_VISITOR_SPOT = same +1/-1 col toward corridor
```
If layout changes (especially if you scale to 14 bots), update these maps.

### 14-bot layout
Current layout has 8 alcoves (4 left, 4 right). Adding 6 more for the parallel Scribes/Catalogers/Reviewers/Copy Editors:
- Keep the 8 perimeter alcoves
- Add a **central "Scribe Pool"** of 3 desks in the corridor north of MR
- Add a **central "Cataloger Pool"** of 3 desks in the corridor south of MR
- Roles get sub-IDs (e.g. `scribe-1`, `scribe-2`, `scribe-3`)
- Server roster + KIRI_BOTS expanded to 14

### About-page integration
The office currently runs at `localhost:5178` as a standalone Vite app. To embed in the KiriPedia Astro site:
- Build to static (`npm run build`) — outputs to `dist/public/`
- Import as React island in Astro at `/about/` route
- Snapshot.json lives in the public repo (committed by GH Actions bots)
- Astro static deploy on Vercel reads it via fetch

### Anti-fake contract enforcement
Bots should ONLY animate when snapshot says something happened. The scheduler's fallback errand + meeting timers currently animate random idle bots even when no real work fired. For the real botnet (post-mock), consider:
- Disable fallback timers entirely once the real botnet is loud enough
- OR keep them as "background office life" but never animate work-related verbs (only idles like "sip coffee")

---

## 9. The real botnet — what to build next session

This is the work that hasn't started. The pixel office is the visualization; this is the engine that drives it.

### Repo shape (mirror chabad-tracker)
```
KiriPedia/
  src/                        # existing Astro site
  data/                       # SQLite truth (corpus index)
  fleet/                      # OLD harbor-master — to be deprecated
  botnet/                     # NEW
    workflows/                # GH Actions YAMLs
      cron-recent-changes.yml      # 6h
      cron-acquisitions.yml        # weekly
      cron-cycle.yml               # 15min, drains lead queue
    workers/                  # the actual bot logic
      recent-changes.mjs
      npp.mjs
      source-auth.mjs
      scribe.mjs              # parallel-instantiable
      cataloger.mjs           # parallel
      reviewer.mjs            # parallel
      copy-editor.mjs         # parallel
      coordinator.mjs         # serial
      indexer.mjs
      acquisitions.mjs
    lib/
      grounding/              # 12-layer stack (pure code, no LLM where possible)
      fleet-client.mjs        # llm-fleet API wrapper with key rotation
      snapshot-writer.mjs     # rewrites webview-ui/public/snapshot.json after each cycle
    schema.sql                # corpus tables
    grounds.json              # Reliable Sources List (channel → reviewed:true)
```

### Build order

1. **Phase 0 — Audit existing fleet.** What in `KiriPedia/fleet/` (HARBOR-MASTER, trawlers, plant) survives, what gets replaced. Most plant code can be promoted directly.

2. **Phase 1 — Stand up the 12-layer grounding stack.** Pure code. Test against existing transcript corpus. This is the load-bearing piece — get it right first.

3. **Phase 2 — Draftspace + Coordinator PR flow.** Local first. One beat (e.g. Torture Testimony). Auto-merge gate green-lit on small patches only.

4. **Phase 3 — Add NPP + Source Auth Clerk.** Automate the catch-bucket greenlight.

5. **Phase 4 — Add Cataloger with MDX patch emission.** Prove a clip → claim → patch → PR → merge → live article cycle end-to-end locally.

6. **Phase 5 — Add fallback "GA review" structured prompt** — but airlocked, no human in loop. Reviewer just enforces stricter gates.

7. **Phase 6 — Move to GH Actions** (public repo, free minutes). Clone chabad-tracker's workflow shape. Local fleet stays as parallel option.

8. **Phase 7 — Add second-pass re-extract + contamination registry.** Self-improvement loop.

9. **Phase 8 — Snapshot.json writer.** After each cycle, regenerate the file in the public repo. Push triggers Vercel rebuild → pixel office shows new state.

10. **Phase 9 — Walk away.** Trawlers fire, bureau works, site rebuilds. Quarantine queue grows silently.

### Key technical choices

- **No backend.** Site is static, JSON files committed to git, Vercel serves them.
- **No LLM in browser.** All LLM calls happen in GH Actions. Browser only polls snapshot.json.
- **Filter not block.** Bad rows quarantine, good rows always merge. PR never fails CI on content.
- **Free tier forever.** GH Actions public repo = unlimited minutes. Fleet keys (Cerebras + Groq + OR) cover all LLM work. Tavily/Exa optional for Acquisitions only.

---

## 10. Pointers / index

### Memories that matter
- `~/.claude/projects/-Volumes-EOS-DIGITAL/memory/MEMORY.md` — auto-loaded into every Claude session, contains the index
- `feedback_kiripedia_doctrine.md` — editorial rules
- `feedback_kiripedia_voice_calibration.md` — voice strictness
- `project_kiripedia_fleet.md` — old fleet architecture (being replaced)
- `project_chabad_tracker_doctrine.md` — sibling project this borrows from heavily
- `feedback_never_delete_originals.md` — quarantine table is forever

### Reference docs in repos
- `/Volumes/EOS_DIGITAL/chabad-tracker/notes/researchteam.md` — the original "research team" gameplan that this project is modeled after. Read it.
- `/Volumes/EOS_DIGITAL/KiriPedia/fleet/HARBOR-MASTER.md` — old fleet standing orders
- `/Volumes/EOS_DIGITAL/KiriPedia/office/` — entire pixel office (this convo's build)

### Skills
- `/keyring` — API key registry (built this session, see `~/.claude/skills/keyring/SKILL.md`)
- `/loop`, `/schedule` — for cron-style autonomous loops
- `claude-api` — reference for Anthropic SDK

---

## 11. The senior dev's stop-loss (carry forward)

The senior dev consulted multiple times in this convo. They flagged:
- **ERRAND global scheduler** — TRAP. Don't build a global "≥3 bots walking" scheduler. SnapshotWatcher is the authoritative state — anything that races it will cause oscillation/teleport bugs.
- **Token relay handoff sprite** — TRAP. Looks like a sprite, actually a 7-stage cross-agent state machine. Week minimum.
- **L/R prop variants** — EXPENSIVE. Sprites are monolithic, not layered. Pre-baking both directions multiplies frame count.
- **Real LEFT walk sprite** — EXPENSIVE. Current engine mirrors RIGHT at runtime, no true LEFT frames.

If user wants any of these later: budget accordingly, don't underquote.

---

## 12. What to type in the next session

```
/keyring list
/keyring allocate cerebras-2 kiripedia
/keyring allocate cerebras-3 kiripedia
/keyring allocate cerebras-4 kiripedia
/keyring allocate cerebras-5 kiripedia

cd /Volumes/EOS_DIGITAL/KiriPedia
# Read this doc top to bottom.
# Then start Phase 0 of the botnet build.
```

---

*Generated 2026-06-21. The conversation that produced this is in the Claude transcript log; this MD is the executive summary. Pixel office is alive on localhost:5178; botnet has not started.*
