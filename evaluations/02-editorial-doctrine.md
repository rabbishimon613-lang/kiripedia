# Expert #2 — Editorial Doctrine: Audit & Enforcement

Conformance audit of the 279-article corpus against the five-rule doctrine,
plus a gap analysis of existing enforcement code and concrete proposals
for the next three editorial-discipline workers.

Read-only on the article corpus. Two new files written this session:
`tools/audit-doctrine.mjs` and `prompts/first-third-splitter.md`.

---

## Executive summary

1. **The corpus is in much better shape than the doctrine docs imply.**
   87.1% of articles are inside the voice-calibration envelope (0–2 body
   attributions, no hedge inflation). Citation integrity is essentially
   perfect: zero dead source slugs, 99.67% of `<Cite>` timestamps round-trip
   to a source paragraph within a 31-second window. The doctrine spine is
   load-bearing — the enforcement gaps are real but the inheritance from the
   hand-fed Era 1 ingests is mostly clean.

2. **The drift surface is concentrated, not diffuse.** 36 articles (12.9%)
   sit in the outlier zone — 3+ body attribution-as-sourcing hits. 16 of
   those are severe (6+ hits). The same handful of high-traffic articles
   appear repeatedly: `john-kiriakou` (42), `cia` (41), `mossad` (18),
   `iran-nuclear-assessment` (17), `fci-loretto` (15), `jeffrey-epstein`
   (14), `john-brennan` (14). These are also the most-recent ingests —
   the drift is forward-in-time, not historical. Rule #3 was being applied
   more strictly in Era 1.

3. **Enforcement is partly built but mostly passive.** The 12-layer
   grounding stack exists as a spec; only 5 layers are actually implemented
   (`botnet/lib/grounding/layers.mjs`: verbatim, cite-roundtrip, channel,
   voice, bio gate). The Mouth Sentry worker scans for prose attribution
   but **only on articles touched in the last 30 minutes** — i.e., it
   prevents new drift but never sweeps the existing 279. The Discretion
   Warden prompt is written but no worker invokes it. First/Third Splitter
   doesn't exist. Diff Sentinel doesn't exist. The new
   `tools/audit-doctrine.mjs` (this session) closes the corpus-wide
   mechanical-audit gap.

---

## Conformance scoreboard (279 articles)

Output of `node tools/audit-doctrine.mjs --print` against the live corpus,
2026-06-23. Body prose only; frontmatter `per Kiriakou` excluded per the
voice-calibration memo.

### Rule #3 — Attribution-as-sourcing tiers

| Tier | Definition | Articles | % |
|---|---|---:|---:|
| Clean | 0 body attributions | 111 | 39.8% |
| Within calibration | 1–2 body attributions | 132 | 47.3% |
| Outlier | 3–5 body attributions | 20 | 7.2% |
| Severe outlier | 6+ body attributions | 16 | 5.7% |

Combined outlier zone: **36 of 279 articles (12.9%)**. Voice-calibration
memo names *curveball*, *chalabi*, *afghan-heroin* as the "3–5" outliers
it expects; the current scan finds those plus 33 more, indicating drift
since the memo was written 19 days ago.

### Rule #4 — Hedge density

Articles using *allegedly / reportedly / purportedly / supposedly / is
said to / sources say*: **9 of 279 (3.2%)**. Total hits: **11**. Trivial
in volume — easy to clean by hand if Pedro wants — but worth a regression
guard because each hedge is a doctrine signal that the source said
something firmly and the editor softened it.

Top hedge offenders (body only, counts in parens):
`joshua-schulte (2)`, `john-kiriakou (2)`, `john-kerry (1)`,
`jfk-assassination (1)`, `jeffrey-sterling (1)`, `jeffrey-epstein (1)`,
`giuliani-pardon-solicitation (1)`, `cia (1)`, `black-cube (1)`.

### Citation integrity

| Check | Count | % |
|---|---:|---:|
| Total `<Cite>` tags in corpus | 3,633 | — |
| Pointing at a missing source file (dead) | 0 | 0% |
| Timestamp present at paragraph header (exact or ≤31s near-miss) | 3,621 | 99.67% |
| Strict miss (no paragraph within 31s window) | 12 | 0.33% |

The 12 strict misses are all in articles citing transcripts at finer
granularity than the ~30s normalize-vtt paragraphizer produces. Not dead
refs; just rounding artifacts. The pipeline's invariant ("every citation
round-trips") holds in spirit.

### Top 12 attribution outliers (this is the patrol queue)

| Articles | Body attributions |
|---|---:|
| john-kiriakou | 42 |
| cia | 41 |
| mossad | 18 |
| iran-nuclear-assessment | 17 |
| fci-loretto | 15 |
| jeffrey-epstein | 14 |
| john-brennan | 14 |
| abu-zubaydah | 11 |
| asset-acquisition-cycle | 11 |
| enhanced-interrogation | 8 |
| mk-ultra | 7 |
| afghan-heroin-policy | 6 |

Pattern: these are the **most-edited articles in the corpus**. Every new
ingest enriches them, and the enricher's habit is to introduce a soft
attribution prefix on the new claim. A 42-hit article like `john-kiriakou`
likely accreted ~1–2 attributions per ingest across the last 30+ ingests.

---

## Specific doctrine violations (quoted)

### Pattern A — opener-attribution as section signposting

`iran-nuclear-assessment.mdx` line 28 (a fresh ingest, 2026-03-25):

> *"Kiriakou stated that the [CIA](/wiki/cia) produced two National
> Intelligence Estimates — the highest-level publication of the U.S.
> intelligence community — both concluding that Iran did not have a
> nuclear weapons program."*

Doctrine-conformant rewrite:

> *"The [CIA](/wiki/cia) produced two National Intelligence Estimates —
> the highest-level publication of the U.S. intelligence community —
> both concluding that Iran did not have a nuclear weapons program."*<Cite ... />

The same article has eight sections, every one of which opens with
"Kiriakou stated / Kiriakou described / Kiriakou reported." The attribution
is functioning as section-signposting — the writer's mental model is
"each section restates Kiriakou" — but doctrine rule #3 says the
encyclopedia voice is invisible; the Cite is the receipt. This is the
single most common rewrite pattern needed.

### Pattern B — "Kiriakou described X as Y" inside Concept articles

`asset-acquisition-cycle.mdx`:

> *"Kiriakou described the asset acquisition cycle as a five-stage process
> — spot, assess, develop, recruit, handle."*

The cycle is the article's subject. Saying "Kiriakou described it as…" is
attribution-as-definition, the most ageing-badly form. If a second source
later restates it differently, the article becomes structurally
incoherent. Rewrite: *"The asset acquisition cycle is a five-stage
process — spot, assess, develop, recruit, handle.<Cite … />"*

### Pattern C — analysis-flagging done with attribution rather than blockquote

`mossad.mdx` line 41:

> *"Unlike the [CIA](/wiki/cia), which Kiriakou describes as having moved
> away from coercive recruitment methods in the 1970s, [Mossad](/wiki/mossad)
> uses coercion as a standard tool."*

Here the editor sensed correctly that the *Mossad-uses-coercion* claim is
analysis, not witnessed fact, and reached for an attribution to flag the
distinction. That's the right instinct — exactly what the First/Third
Splitter is for — but rule #3 says the prefix shouldn't be in prose.
Proper treatment: tag the claim `JK-analysis` at the adjudication stage,
have the Coordinator emit it as a blockquote or with one stable
attribution per article. Repeatedly sprinkling "Kiriakou describes" is the
failure mode.

### Discretion-mirror examples that are correctly handled

The corpus has 11 articles built around aliased entities
(`mahmud.mdx`, `bob-cia-hr.mdx`, `bojinka-plot.mdx`,
`double-agent-marriott-trap.mdx`, `tora-bora.mdx`, etc.). Spot-check of
`mahmud.mdx` and `bob-cia-hr.mdx` confirms they're exemplary: hatnote
flags the alias, frontmatter declares "Real name: Not disclosed,"
prose stays inside the alias throughout, no editorial inference. The
discretion-mirror rule was applied perfectly when the article was *about*
the alias. The risk surface is the opposite case — an article on a fully
named entity that wraps around a passage where Kiriakou aliased a
secondary figure. That's the case the Discretion Warden specifically
targets.

---

## Existing enforcement code — inventory and gaps

### What lives in `botnet/`

| File | Role | Status |
|---|---|---|
| `workers/reviewer.mjs` (87 lines) | Runs grounding stack on pending claims | Live |
| `workers/mouth-sentry.mjs` (109 lines) | Passive doctrine-violation scan on recently-touched articles | Live, **30-min window only** |
| `workers/source-auth.mjs` (82 lines) | Channel allowlist gate | Live |
| `workers/coordinator.mjs` (191 lines) | Merges grounded claims into MDX | Live |
| `workers/deepener.mjs`, `enricher.mjs`, `weaver.mjs` | Article-quality workers | Live (selection thrash per TEAM-REWORK) |
| `lib/grounding/layers.mjs` | The grounding stack | **5 of 12 layers** |

The 5 implemented grounding layers (`layers.mjs`):

1. `layer_verbatim` — quote must appear in source. ✅
5. `layer_cite_roundtrip` — Cite t= present and parseable. ✅
9. `layer_channel` — channel in `grounds.json`. ✅
*(unnumbered)* `layer_voice` — bans "Kiriakou said" inside `claim_text` itself.
*(unnumbered)* `gate_bio` — biographical claims about Kiriakou → quarantine.

### Gap table vs the 12-layer BOTNET-HANDOFF spec

| # | Layer | Spec'd | Implemented | Gap |
|---:|---|:---:|:---:|---|
| 1 | VTT phrase grep | ✅ | ✅ | — |
| 2 | Timestamp window contains quote | ✅ | ⚠️ partial | `cite_roundtrip` only checks t= parseable; doesn't verify the **window** contains the quote. |
| 3 | Off-corpus contamination | ✅ | ❌ | No "entity must appear ±90s in some John transcript" check. |
| 4 | Discretion mirror | ✅ | ❌ | Prompt exists at `prompts/discretion-warden.md`; no worker calls it. |
| 5 | Citation integrity | ✅ | ⚠️ partial | Doesn't verify `s` is a real source file. (Audit tool now does corpus-wide.) |
| 6 | Cross-clip restatement (3+ → RESTATEMENT) | ✅ | ❌ | No restatement detector. |
| 7 | Voice contamination | ✅ | ⚠️ partial | Bans only inside `claim_text`. Mouth Sentry catches **drafted article prose** but only in a 30-min window. |
| 8 | Density floor | ✅ | ❌ | No "rejects patches with zero entities/dates/figures" check. |
| 9 | Channel provenance | ✅ | ✅ | — |
| 10 | Second-pass re-extract | ✅ | ❌ | No second model run + agreement gate. |
| 11 | Confidence score ≥90 | ✅ | ✅ | Implemented in reviewer.mjs. |
| 12 | Bio gate | ✅ | ✅ | — |

Plus the **TEAM-REWORK Editorial cluster roles** that aren't workers yet:

| Role | Spec'd | Implemented |
|---|:---:|:---:|
| Discretion Warden | ✅ prompt | ❌ no worker |
| First/Third Splitter | ❌ → **added this session** | ❌ no worker |
| Diff Sentinel | ✅ in TEAM-REWORK | ❌ |
| Shape Auditor | ✅ in TEAM-REWORK | ❌ |
| MoS Enforcer | ✅ in TEAM-REWORK | ❌ |
| Promotion Committee | ✅ prompt at `prompts/promotion-committee.md` | ❌ no worker |
| Triage Patroller | ✅ in TEAM-REWORK | ❌ |

---

## Designed enforcement additions

### 1. Discretion Warden — already specced

`prompts/discretion-warden.md` is a complete system prompt. It just needs
a worker that wraps it: reads `claims` rows at `status='passed_grounding'`,
fetches each entity's corpus profile (named vs aliased mentions), calls
the model with the prompt, writes back to `claims.discretion_status` and
optional `claim_text_revised`.

**Acceptance tests** (regression set the worker must pass):

| Input passage | Claim text under review | Expected verdict |
|---|---|---|
| Kiriakou says "an asset called Mahmud" | "Mahmud was recruited at a coffee shop" | APPROVE (alias preserved) |
| Kiriakou says "an asset called Mahmud" | "Ahmed Hassan was recruited at a coffee shop" | REDACT — replace with "Mahmud" |
| Kiriakou says "an unnamed Middle Eastern country" | "Mahmud was recruited in Bahrain" | REDACT — replace with "an unnamed Middle Eastern country" |
| Kiriakou says "Bob said you blew the doors off" | "Bob, the CIA's HR director, said you blew the doors off" | APPROVE (alias is what JK uses) |
| Kiriakou says "Cofer Black" in passage; corpus has 50 named mentions of Cofer Black | "Cofer Black ordered the operation" | APPROVE |
| Kiriakou says "I can't get into who that was" | "John Brennan ordered the operation" | QUARANTINE — claim should not exist |

### 2. First/Third Splitter — added this session at `prompts/first-third-splitter.md`

Tags every claim with one of four perspectives — `JK-witnessed`,
`JK-relayed`, `JK-analysis`, `JK-quoting-another` — and writes to
`claims.perspective`. The Coordinator reads this tag to decide whether to
write the claim in declarative encyclopedic voice (witnessed) or with a
controlled attribution prefix (analysis, relayed, quoting).

**Acceptance tests** in the prompt file (8 worked passages from the live
corpus, with expected tags).

### 3. Diff Sentinel

Runs as a post-commit hook in the botnet cycle (or in CI on push):

1. For every article touched in this cycle, compute hedge-density delta
   from the prior commit:
   `Δhedge = hedges_post / words_post − hedges_prior / words_prior`.
2. If `Δhedge > 0` for the **third consecutive commit** without a
   corresponding new `<Cite>` tag justifying the hedge, **roll back** the
   working tree to the lowest-hedge revision in the last N commits.
3. Same monotonic-rise check for body attribution count.
4. Hard refusal: a commit that **removes a `<Cite>` tag** while keeping
   the surrounding sentence does not auto-merge — quarantines for human
   review. Citations are append-only by default.

**Acceptance tests:**

| Scenario | Expected behavior |
|---|---|
| Patch adds 1 attribution, prior had 0; ends with 1 cite added | accept (within calibration, cite justifies) |
| Patch adds 1 attribution, removes 1 cite | reject |
| Three consecutive commits each add "Kiriakou stated" to the lede paragraph | revert to commit before the third |
| Patch changes `<Cite t="2:00" />` to `<Cite t="2:30" />` on same source | accept (timestamp refinement) |
| Patch removes `<Cite s="..." t="..." />` entirely | reject (Cite-deletion gate) |

### 4. Density-floor gate (BOTNET layer 8)

A pure-code check on every patch payload before it reaches the
Coordinator:

- Count named entities (capitalized 2–4 word spans not in stop-list),
  dollar figures (`\$[\d,]+`), dates (`YYYY` or `MM/DD/YYYY` or month-name
  + year), and weapon / model-number tokens.
- Patch must contain ≥ 1 of these, OR a verbatim quote (which always
  passes density by definition).
- Patches that are pure connective prose ("In addition, the operation
  was important and well-coordinated.") — reject.

Trivial to implement; ~30 lines in `botnet/lib/grounding/layers.mjs`.

---

## Files written this session

| Path | Purpose |
|---|---|
| `tools/audit-doctrine.mjs` | Pure-code corpus-wide audit; outputs `public/doctrine-audit.json`. CLI: `--print` for summary, `--strict` to exit non-zero on outliers. |
| `prompts/first-third-splitter.md` | System prompt for the missing First/Third Splitter role; 4 tags + decision algorithm + 8 regression cases. |
| `evaluations/02-editorial-doctrine.md` | This document. |
| `public/doctrine-audit.json` | First snapshot of the conformance scoreboard. |

No article edits.

---

## Open doctrine questions only Pedro can resolve

1. **The "Kiriakou-the-protagonist" exception.** `john-kiriakou.mdx` has
   42 body attributions and is *about him*. The voice-calibration memo
   carves out *"Kiriakou recalls noticing the Rolodex card"* as
   biographical narration, not sourcing-attribution. The audit tool can't
   distinguish narration ("Kiriakou recalls") from sourcing
   ("Kiriakou recalls that the CIA was…"). Should the tool's outlier
   threshold for `john-kiriakou.mdx` and other biographical articles
   (Bob, Mahmud, the family articles) be relaxed — say, 10+ instead of
   3+? Or should the Mouth Sentry / First-Third Splitter solve this by
   tagging the verb's subject?

2. **The `JK-analysis` blockquote convention.** The First/Third Splitter
   produces a tag, but doctrine doesn't yet name a single canonical
   treatment for analysis claims. Three options on the table:
   (a) blockquote with no prefix, (b) inline italic with no prefix,
   (c) one attribution prefix per article, additional analyses cited
   without prefix. Voice-calibration leans toward (c). Is that the call?

3. **Restatement counting.** BOTNET layer 6 says "said 3+ times across
   clips → RESTATEMENT (append cite only)." But the corpus today has
   many claims with 2 cites — does the gate live at 2 (current behavior)
   or 3 (spec)?

4. **Discretion across the corpus vs. within the passage.** The
   Discretion Warden prompt enshrines "each citation is an island of
   discretion" — passage X aliases, passage Y names, the alias claim
   carries the alias and the name claim carries the name. That implies
   an article body that occasionally uses the alias and occasionally
   uses the name, with both cited. Is that the desired reading
   experience, or should the article default to one form (the dominant
   pattern) and footnote the others?

5. **Hedge-density rollback aggressiveness.** Diff Sentinel as designed
   reverts on monotonic rise over **three commits**. That's safe for
   high-traffic articles like `cia.mdx` (40+ ingests touch it) but may
   trap low-traffic articles where each commit is months apart. Should
   the window be by-commit-count or by-time-window?

6. **The 36 existing outliers.** The audit-doctrine tool surfaces them
   as a backlog. Strategy options: (a) hand-rework Pedro-led, batch by
   batch, like Era 1; (b) spawn a one-time **Reweaver** subagent run
   that ingests each outlier with the Discretion Warden + First/Third
   Splitter chain enabled; (c) leave them as canonical witnesses of the
   drift surface and use the audit as a guard against new drift only.
   Quality Patrol expert (#8) probably wants (a) or (b); I'm flagging the
   choice rather than pre-empting them.
