# Expert #5 — Wikipedia Sociology: Role Design & Governance

*Filed 2026-06-23. Domain: en.wiki role sociology imported into KiriPedia's bot architecture.*

---

## Executive Summary

1. **KiriPedia needs Wikipedia's role sociology, not its ideology.** en.wiki's power comes from narrow overlapping roles — each worker touches the same article from a different angle, creating cross-checks without explicit coordination. That architecture imports cleanly. The ideology (NPOV, consensus voting, RSN deliberation) does not import, because KiriPedia has one source and one POV by design.

2. **The Discretion Warden is the highest-leverage new role.** Rule #2 (mirror Kiriakou's discretion) is the doctrine most vulnerable to drift by cheaper models. A Cataloger that hallucinates a name from training data, or a Deepener that "fills in" an obvious country, destroys the project's core identity invisibly. The Warden's passage-is-an-island rule stops this at the claim level before anything reaches an article.

3. **The grade ladder needs a single enforcement primitive: promoter ≠ last editor.** Every other governance ceremony on en.wiki is downstream of this one social fact. In a bot world, this is a database constraint, not a norm. Add it to `article_grade_votes` as a hard `CHECK` and the most common failure mode — a worker promoting its own work, allowing grade inflation to paper over drift — is structurally impossible.

---

## en.wiki Role Imports Table

| en.wiki Role / Process | Import? | KiriPedia Equivalent | Rationale |
|---|---|---|---|
| **New Page Patrol (NPP)** | YES | **Triage Patroller** (existing, fixing selection) | Core function identical: route new content to right downstream queue; gatekeep incoherent entries. |
| **Recent Changes Patrol** | YES | **Diff Sentinel** | Monitors every commit; reverts removal of cited claims; tracks hedge-density drift. Exact functional equivalent. |
| **BLP (Biographies of Living Persons) Noticeboard** | YES — reshaped | **Discretion Warden** | en.wiki BLP protects living subjects from harm. KiriPedia BLP protects *Kiriakou's discretion choices* — different goal, same structural role: a dedicated gate that runs on every claim touching a named third party. |
| **Manual of Style (MoS) enforcement** | YES | **MoS Enforcer** | Mechanical style: date formats, infobox field names, section order, wikilink syntax. Imports directly; rules differ (KiriPedia MoS) but the role is identical. |
| **Good Article (GA) review** | YES — quorum-only | **Promotion Committee (GA ceremony)** | en.wiki GA = one reviewer gives a structured pass. KiriPedia GA = 2-of-3 non-last-editor workers from the adjudication pipeline. Quorum replaces the single human's judgment. |
| **Featured Article (FA) review** | YES — quorum-only | **Promotion Committee (FA ceremony)** | en.wiki FA = FAC committee + delegate. KiriPedia FA = 3 workers from ≥2 role groups, none being last editor. |
| **Stub / Start / C / B grading** | YES — redefined criteria | **article_grades with single-corpus criteria** | Grades import directly. Criteria are redefined: no "external sources cited" (there are none), replaced by "source slugs cited" (depth within the corpus) and "transcript coverage audit" (completeness). |
| **WikiProject coordination** | YES — structural only | **Triage Patroller** handles routing | en.wiki WikiProjects coordinate who works on what. In KiriPedia, the Triage Patroller does this mechanically via per-role work queues. No inter-agent messaging. |
| **Article for Deletion (AfD)** | NO | Not needed | Articles cannot be wrong-source under this architecture (Reviewer blocks that at grounding). An article about a topic Kiriakou mentions zero times can't be created — the Cataloger won't have filed any claims. Deletion is impossible by design. |
| **Neutral Point of View (NPOV)** | NO | Deliberately excluded | KiriPedia is Kiriakou-POV by doctrine. NPOV would contradict the project's identity. The equivalent of "neutrality" here is *single-source fidelity*, which is handled by the grounding stack, not a separate role. |
| **Reliable Source Noticeboard (RSN)** | PARTIAL | **grounds.json / Source Auth Clerk** | en.wiki RSN deliberates on whether a source qualifies. KiriPedia equivalent: `grounds.json` is the pre-approved Reliable Sources List (known Kiriakou appearance channels). Source Auth Clerk adds new channels. No deliberation needed because the question has only one answer: is this a real Kiriakou appearance on a real channel? |
| **Arbitration Committee (ArbCom)** | PARTIAL | **Quarantine queue + Opus review** | en.wiki ArbCom resolves intractable disputes. KiriPedia's equivalent is the quarantine queue for genuine conflicts (Kiriakou names someone in one passage, aliases them in eight others). These go to Opus review with the full conflict record. Not a committee — Opus decides. The queue is the docket. |
| **Edit warring 3RR rule** | YES — renamed | **Role-based lockout (anti-stagnation rule #1)** | en.wiki 3RR prevents the same editor reverting endlessly. KiriPedia role-based lockout prevents the same role-worker touching an article it just touched within N cycles. Functionally equivalent. |
| **Talk page consensus** | NO | Not needed | Talk pages exist for multi-editor negotiation. KiriPedia workers don't negotiate; they read/write SQLite. Conflict resolution is: quarantine + escalate, not discuss. |
| **Semi-protection / Full-protection** | NO | Not needed | Protection prevents unconstructive edits by low-trust users. KiriPedia has no public editors. The 12-layer grounding stack and confidence threshold are the access gates. |
| **Did You Know (DYK) nomination** | YES — automated | **DYK rule (existing, locked into ingest playbook)** | en.wiki DYK = nominated, reviewed, scheduled. KiriPedia DYK = mandatory per-article frontmatter field populated by the Cataloger/Coordinator; homepage shuffles automatically. No nomination queue needed. |
| **Flagged Revisions** | PARTIAL | **Diff Sentinel** | en.wiki Flagged Revisions holds edits pending review. KiriPedia: Diff Sentinel watches every commit and can trigger rollback. The difference is KiriPedia doesn't hold edits in limbo — it merges and rolls back, rather than staging. |
| **Shape convergence audit** | en.wiki has no direct equivalent | **Shape Auditor** (KiriPedia-native) | No en.wiki equivalent. Invented to solve the specific LLM failure mode of all articles acquiring the same section-header skeleton. The problem doesn't exist in human editing because humans don't converge stylistically at scale. |

---

## Grade System: Full Criteria

### Stub
An article exists with at least one cited claim. Nothing more is required.

Checkable criteria (all must hold for Stub; below Stub = article should not exist):
- `cite_count >= 1`
- Article file exists in `src/content/articles/`
- Infobox MAY be absent; no penalty

Stub signals: no infobox, fewer than 3 cites, fewer than 150 words, or no section headings.

---

### Start
The article is a real entry: a lead, at least one section, and enough citations to be useful.

Checkable criteria (all must pass):
- `cite_count >= 3`
- `infobox_present = true` (frontmatter `infobox:` block with at least 2 `data:` fields)
- `prose_word_count >= 150` (excluding frontmatter, infobox, See also, References)
- `section_heading_count >= 1` (at least one `## H2` in body)
- `dyk_entry_count >= 1` (frontmatter `dyk:` array has at least 1 entry)
- Every `dyk:` entry contains `>= 2` internal `[wikilinks](/wiki/slug)`
- `build_pass = true` (no HIGH-confidence wikilink bugs from `audit-wikilinks.mjs`)

---

### C-class
The article has real breadth: multiple sources, multiple sections, and no uncited paragraphs.

Checkable criteria (all Start criteria, plus):
- `cite_count >= 10`
- `source_slug_count >= 2` (citations from at least 2 distinct source transcripts — depth signal, not corroboration gate)
- `section_heading_count >= 2`
- `dyk_entry_count >= 2`
- `uncited_factual_paragraphs = 0` (every paragraph with a substantive claim ends with a `<Cite>` tag; Diff Sentinel density audit passes)

Note: the 2-source requirement is a depth signal. An article with 15 cites all from one transcript is still canon — it means the Re-Reader hasn't processed other appearances yet. C-class flags that the article has been meaningfully cross-corpus enriched. It does not require that two sources agree.

---

### B-class
The article accounts for everything Kiriakou has said about this topic — either by filing it, explicitly excluding it, or tracking it for future promotion.

Checkable criteria (all C-class criteria, plus):
- **Transcript coverage audit passes:** for the article's subject slug, a corpus search finds zero passages that are uncovered (not cited, not excluded with reason in `passage_verdicts`, not tracked in `TODO-tier-c.md`)
- `hedge_density < 2.0` (fewer than 2 hedging phrases per 100 words: "allegedly," "reportedly," "is said to," "may have," "possibly," "some believe," "it is claimed," "purportedly")
- `shape_audit_clear = true` (Shape Auditor has not flagged this article's TOC as converging with >5 peers in last 30 days, or the flag has been resolved)
- `mos_pass = true` (no open MoS violations in `mos_violations` table)

---

### GA — Good Article
The article has passed all adjudication workers AND been shaped into readable narrative.

Checkable criteria (all B-class criteria, plus):
- `discretion_quarantine_clear = true` (no `quarantined` claims from this article pending Opus resolution)
- `splitter_tagged_all = true` (First/Third Splitter has tagged every claim `JK-witnessed` or `JK-relayed`)
- `relayed_attribution_pass = true` (all `JK-relayed` claims in article prose carry appropriate attribution format per Coordinator's last pass)
- `weaver_pass = true` (Weaver has produced at least one narrative pass; prose reads as flowing narrative sections, not a bullet list of claim fragments)
- `vtt_quotes_verified = true` (any direct quote blockquote in the article has `vtt_phrase_verified: true` on its source claim)
- `sentinel_stable_14d = true` (Diff Sentinel has not triggered a hedge-density rollback on this article in the last 14 days)
- **Quorum: 2 of 3 workers, none of whom is the last editor**

---

### FA — Featured Article
The article is complete by corpus standards and has been certified by a cross-role quorum.

Checkable criteria (all GA criteria, plus):
- **Quorum: 3 workers from at least 2 different role groups; none is the last editor** (see Promotion Committee prompt for group definitions)
- `corpus_completeness = true` (corpus search returns zero uncovered passages — every mention either cited, excluded with reason, or in Tier C with explicit deferral)
- `structural_originality = true` (Shape Auditor confirms TOC has not converged with >2 peers in last 90 days)
- `lede_standalone = true` (lede paragraph contains: entity category, primary fact Kiriakou associates with this entity, at least 1 citation; passes a standalone readability check)
- `disputed_banners = 0` (no `{{disputed}}` banners remain; any source contradictions are surfaced explicitly in prose)

---

## Discretion Warden — Full Operational Spec

**Purpose:** Enforce doctrine rule #2 (mirror Kiriakou's discretion) at the claim level, before any claim reaches an article.

**Pipeline position:** After Reviewer (grounding passes), before First/Third Splitter.

**Trigger:** Every `claim` row at status `passed_grounding` that contains an entity reference to a named or aliased third party.

---

### Input

The Warden receives: the claim text, the source passage, and a **corpus profile** for each entity reference in the claim. The profile is pre-fetched by the pipeline (not computed by the Warden at runtime):

- Total corpus mentions of this entity across all source passages
- Split into: named mentions (Kiriakou uses a full name or explicit identifier) vs. aliased mentions (alias, code name, "I can't say," "an unnamed country")
- The specific alias forms he uses
- The specific named forms he uses
- The dominant pattern (`named` if ≥70% named; `aliased` if ≥50% aliased; `mixed` otherwise)
- How he refers to the entity **in this specific cited passage**
- Any conflict passages (passages where his form differs from the dominant pattern)

---

### Decision logic

**APPROVE:** The claim's surface form for each entity matches how Kiriakou refers to them in the cited passage, and that passage form is consistent with the dominant corpus pattern. No aliased entity has been de-aliased in the claim text.

**REDACT:** The claim names or identifies an entity more specifically than Kiriakou does in the cited passage — even if he names them in other passages. Rule: each passage is an island of discretion. Replace the over-specific form with what he actually says in this passage. The Warden provides the suggested alias; the pipeline substitutes it and re-routes as `redacted`.

**QUARANTINE:** Four cases:
1. Genuine conflict: he names the entity in this passage but the dominant corpus pattern is `aliased` (≥3 aliased mentions). Needs Opus review.
2. Novel entity with no corpus profile AND alias-only in this passage. Cannot establish pattern; quarantine pending more mentions.
3. Sensitive category (asset, informant, undercover, family member) named with a full name. Escalate to Opus regardless.
4. Fabrication signal: claim contains identifying details not present in the raw passage. Second-layer catch (Reviewer should have blocked this).

---

### The passage-is-an-island rule

This is the Warden's most important operational constraint. If Kiriakou names someone in passage A and aliases them in passage B, the claim drawn from passage A may use the name; the claim drawn from passage B must use the alias. Both are correct. Both propagate to the article. The article prose, handled by the Coordinator, will then reflect whichever form Kiriakou used more often overall (dominant pattern), with footnotes containing both forms. The Warden never normalizes across passages — that is the Coordinator's scope.

---

### Edge case: the alias is itself identifying

Example: "Station X in a city with only one CIA station." The Warden approves the alias as Kiriakou used it. The Warden does not add the inference. The alias is the discretion; the inference would be editorial fabrication from outside the corpus. This is a hard constraint.

---

### Edge case: "I can't say" passages

If the cited passage is a refusal or redaction ("I can't say who authorized this") and the Cataloger still extracted a named claim, the Reviewer should have blocked it. If it reaches the Warden anyway, issue `QUARANTINE` with reason `passed_grounding_in_error — no extractable claim in refusal`. This is a second safety net, not the primary catch.

---

### Output

Three fields: `discretion_status` (`approved|redacted|quarantined`), `entities_reviewed` (per-entity decision + suggested alias if redacted), and `claim_text_revised` (substituted text if redacted, null otherwise). Plus a one-sentence `notes` entry for the audit log.

Full system prompt: `/Volumes/EOS_DIGITAL/KiriPedia/prompts/discretion-warden.md`

---

## Promotion Ceremony Policy

### Who can promote

A promotion requires workers who:
1. Are not the worker that last edited the article (enforced as a database `CHECK` on `article_grade_votes`)
2. Come from different role groups for FA (2+ groups required; GA does not require group diversity, only non-last-editor)

Role groups:
- Adjudication: Reviewer, Discretion Warden, First/Third Splitter
- Enhancement: Deepener, Enricher, Weaver
- Patrol: Diff Sentinel, Shape Auditor, MoS Enforcer
- Learning: Re-Reader, Contradiction Scout

### Grade-by-grade ceremony

- **Stub → Start, Start → C, C → B:** Promotion Committee checks mechanical criteria only. No quorum vote. Single daily pass. Promotion is automatic if criteria pass.
- **B → GA:** Promotion Committee checks mechanical + adjudication criteria, then solicits 2-of-3 quorum votes. Quorum members must not be the last editor. No role-group diversity requirement.
- **GA → FA:** Promotion Committee checks all GA criteria plus completeness, then solicits 3 quorum votes from ≥2 role groups, none being last editor.

### Cadence

Promotion Committee runs once per day. It does not run per-commit. This prevents grade thrashing (an article that is edited and promoted in the same pipeline cycle, before patrol workers have run).

### Demotion

Demotion is triggered by the Diff Sentinel, not by the Promotion Committee. Demotion requires no quorum — it is a single automated rollback. Demotions go down one grade at a time. The article then requires a fresh full ceremony to re-promote.

Demotion triggers:
1. Hedge density has risen monotonically across 3 consecutive revisions AND none of those revisions added new `<Cite>` tags
2. A revision removed ≥1 cited claim without replacing it

### No grade-skipping

An article cannot promote from C directly to GA in one ceremony. Each grade step is a separate daily ceremony. This prevents a fast-moving Deepener from inflating an article's grade before Patrol workers have reviewed it.

Full system prompt: `/Volumes/EOS_DIGITAL/KiriPedia/prompts/promotion-committee.md`

---

## Anti-Stagnation Rules with Thresholds

### Rule 1 — Role-Based Lockout (anti-thrash)

**The problem:** The same worker role touches the same article repeatedly within a single cron cycle — the "deepener picks same article 5× per batch" bug from TEAM-REWORK.

**The rule:** A worker may not select an article for work if any worker of the same role has touched that article within the last **N cron cycles**, where N is:
- Enhancement workers (Deepener, Enricher, Weaver): lockout for **3 cycles**
- Patrol workers (Diff Sentinel, Shape Auditor, MoS Enforcer): lockout for **1 cycle** (they need to run every cycle; just not the same article twice in a row)
- Adjudication workers: no lockout (they work claims, not articles directly)

**Implementation:** `last-worked.mjs` already exists in `botnet/lib/`. Extend it to track per-role-per-article timestamps. Each worker, before selecting an article, queries: "did any worker of my role touch this article in the last N cycles?" If yes, skip to next candidate.

**Threshold:** Lockout measured in cycles, not wall-clock time, so it adapts to cron cadence changes without reconfiguration.

---

### Rule 2 — Hedge Density Rollback (anti-softening)

**The problem:** Workers accumulate hedging language ("allegedly," "reportedly," "is said to") across revisions, softening the encyclopedia voice without any single revision being obviously wrong.

**The rule:** The Diff Sentinel measures hedge phrase density (hedge count / word count × 100) on every commit that touches an article. If density has risen monotonically across **3 consecutive revisions** AND none of those revisions added new `<Cite>` tags, the Sentinel triggers a rollback to the lowest-hedge version in that sequence and records a demotion in `article_grade_history`.

**Threshold:**
- Detection: 3 consecutive revisions with rising hedge density and no new citations
- Rollback target: the revision in the sequence with the lowest hedge density
- After rollback: the article is flagged in `mos_violations` as "hedge-density drift detected" until the MoS Enforcer reviews it and either clears the flag or escalates

**Hedge phrase list (locked):** "allegedly," "reportedly," "is said to," "may have," "possibly," "some believe," "it is claimed," "purportedly," "according to some," "it appears that," "it seems that," "it has been suggested"

**Note:** a single revision with a high hedge count is not a trigger. Only the monotonic-rise-across-3 pattern is. A single outlier revision may be a legitimate quote or a MoS error — the Sentinel only fires on the trend.

---

### Rule 3 — Shape Convergence Audit (anti-homogenization)

**The problem:** LLM workers, drawing on similar prompts and the same corpus, tend to produce articles with similar section-header sequences. Over time, all articles about People end up with Intro / Early Life / CIA Career / Legacy. This reduces the encyclopedia's navigational value and signals prompt monoculture.

**The rule:** The Shape Auditor runs after every Weaver pass. It computes a `toc_hash` (hash of the ordered sequence of `## H2` headings, normalized to lowercase with punctuation stripped). It then queries `article_shape_audit` for other articles with the same or highly similar hash. If **≥5 other articles share the same toc_hash**, the article is flagged in `article_shape_audit.flagged = 1` and added to the Triage Patroller's structural-rework queue. It cannot be promoted above C-class until the flag is resolved.

**Threshold:**
- Flag trigger: 5 or more articles with the same toc_hash
- FA completeness standard: toc_hash not shared by >2 other articles in the last 90 days
- Resolution: Weaver must produce a revised structure with a distinct toc_hash; Shape Auditor then re-audits

**Escape hatch:** some convergence is correct (all "Case" articles legitimately need Background / Trial / Verdict / Aftermath). The Shape Auditor does not flag within a single category unless convergence exceeds 5 within that category. Cross-category convergence (People articles that look like Case articles) is always flagged at threshold 2.

---

## Files Written This Session

| File | Purpose |
|---|---|
| `/Volumes/EOS_DIGITAL/KiriPedia/prompts/discretion-warden.md` | Full system prompt for the Discretion Warden worker |
| `/Volumes/EOS_DIGITAL/KiriPedia/prompts/promotion-committee.md` | Full system prompt for the Promotion Committee daily ceremony |
| `/Volumes/EOS_DIGITAL/KiriPedia/botnet/data/article-grades-schema.sql` | SQL schema for `article_current_grade`, `article_grade_history`, `article_grade_votes`, `article_grade_criteria_log`, `article_grade_deferrals`, `article_hedge_density`, `article_shape_audit` with example records |
| `/Volumes/EOS_DIGITAL/KiriPedia/evaluations/05-wikipedia-sociology.md` | This evaluation document |

---

## Open Governance Calls for Pedro

1. **Quorum bootstrapping problem.** The first 100 articles will mostly have only one or two workers that have touched them (Coordinator + maybe Deepener). GA/FA promotion requires non-last-editor voters. In early corpus life, most articles will be stuck at B-class because the voter pool is too thin. Decision needed: should the Promotion Committee be allowed to cast a vote itself (acting as a neutral auditor), or should the quorum requirement be relaxed to 1-of-2 until the corpus has been touched by ≥3 distinct role-workers per article?

2. **Discretion Warden and the Deepener ordering.** EDITORIAL-EVOLUTION.md is explicit: "ship the Discretion Warden before the Deepener gets prolific." The current botnet has a Deepener running (`botnet/workers/deepener.mjs`). Is the Deepener currently airlocked (disabled) or actively running? If running, the Warden needs to be shipped before the next Deepener cycle, not as part of Phase 3.

3. **Quarantine queue routing.** The BOTNET-HANDOFF.md says the current architecture is "airlocked" — no Opus, suspects stay in quarantine, nobody is paged. The Discretion Warden's `QUARANTINE` verdict (especially for conflict patterns and sensitive categories) is the natural exception. Decision needed: keep true airlocked (conflicts stay in quarantine indefinitely), or wire one weekly Opus review of the quarantine queue?

4. **Source slug count for C-class.** The threshold is "≥2 distinct source slugs cited." The current corpus has very few articles with more than one transcript citing them — most early articles came from Dalton Fischer Part 1 alone. This means almost no article can reach C-class until the Re-Reader churns through more transcripts. Is this threshold right, or should it be ≥1 source slug (essentially removing the depth signal requirement at C-class and pushing it to B)?

5. **Hedge phrase list ownership.** The hedge density rollback rule uses a locked phrase list. That list will need to evolve as LLM workers develop new hedging patterns. Decision needed: who owns the list update? Option A: hardcoded in `diff-sentinel.mjs`, updated manually by Pedro when a new pattern is spotted. Option B: the quarantine audit log auto-proposes new hedge patterns when the same non-canonical phrase appears in 3+ rollback events.

6. **Shape Auditor category exemptions.** The anti-homogenization rule allows cross-category convergence to be flagged at threshold 2 rather than 5. The seven article categories (People, Agencies, Operations, Events, Concepts, Cases, Places) each have legitimate canonical structures. Should the Shape Auditor maintain a per-category "blessed structure" allowlist (e.g., Cases always have Background / Trial / Verdict / Aftermath and that's fine), or should the threshold remain purely numeric?
