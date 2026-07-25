# KiriPedia editorial — what it was, what it became, what the research team must inherit

*Plain-English brief. Written 2026-06-22 to give the autonomous research team the same instincts the original hand-fed pipeline had.*

---

## The original move (Era 1 — "churn the gold")

The whole project started as one motion, repeated:

1. Pedro pastes a YouTube link in chat.
2. Opus pulls the captions, reads the **entire** transcript end-to-end in one pass.
3. Opus then writes new articles AND enriches existing ones from that single transcript — every named person, dollar figure, weapon model, street name, date, quote that Kiriakou utters gets a home somewhere on the wiki.
4. Every claim ends with a footnote pointing back to that source at the timestamp where Kiriakou said it.

This was the "gold churn." A 3-hour podcast, end-to-end, became 4–8 new article stubs and 10–30 enrichments to existing articles. Nothing was thrown away. Single-source = canon. If only one transcript said it, it still went in.

That motion is what built the corpus. Everything since has been trying to scale it without losing its character.

---

## The doctrine that crystallized during Era 1

Locked in early, never softened:

- **Single-source canon — publicly available online appearances only.** Interviews, podcasts, livestreams, short-form. **Not** his books, **not** Wikipedia, **not** news articles, **not** court documents, **not** general knowledge. If he didn't say it on tape that anyone can pull up, it doesn't exist for the wiki.
- **Mirror his discretion.** If he says "an unnamed Middle Eastern country" or "an asset called Mahmud," the article uses those words. We do not fill in the blanks even when the blank is obvious from context.
- **Encyclopedic voice — not "according to John."** Articles read declarative and present-tense, Wikipedia-style. Sourcing is invisible, via the footnote tag. The reader knows from the About page that everything is John's perspective; hedging "Kiriakou says" every sentence kills the encyclopedia feel and ages badly.
- **Capture density.** Every detail. Better to over-include than to leave a piece of gold on the floor.
- **Direct quotes when he's striking.** Blockquotes or inline. Clean obvious auto-caption errors (case, punctuation, misheard words) — never change meaning.

A small calibration arrived later: *summary frontmatter using "per Kiriakou" is fine — that's a long-standing convention across the live corpus. Body prose attributions should stay rare (1 per article is fine, 3+ is the outlier zone).*

---

## Era 2 — the playbook gets written down

The hand-fed motion got formalized as a per-ingest checklist so we'd stop re-deriving it every transcript. Three things that became mechanical:

- **Did You Know** — every new article ships with ≥2 DYK lines, each containing ≥2 internal wikilinks. The homepage shuffles them on every visit. The DYK box is navigation, not trivia.
- **Events** — only dates Kiriakou actually utters in the transcript, only `YYYY-MM-DD` precision, only "on this day" content. Month-only or year-only goes into prose, not the events array.
- **Wikilink integrity** — visible text that looks like a person's name must point at that person's article. The "Leon Panetta → jose-rodriguez" mistake fails the build now.

Tools were added so doctrine became enforceable: `audit-frontmatter`, `audit-wikilinks`, `scaffold-articles`, `fetch-images`, `wire-images`, `build-date-index`. The character of the work was unchanged — it was still Opus reading one transcript end-to-end, writing everything. The boilerplate just got automated.

---

## Era 3 — slim v2 (the same gold churn, cheaper)

Tokens started to matter. Two changes preserved the motion while cutting cost ~50%:

- **Subagent outliner.** A throwaway agent reads the 30k-token transcript in its own context and writes a structured outline (timestamp ranges → topics → new articles → enrich targets → key cites → quotes to preserve). Opus then reads only the outline (~3–5k tokens) and does targeted re-reads of specific timestamps when confirming quotes.
- **Scaffolder shorthand.** One JSON spec covers all new articles + all enrichments for the ingest. The scaffolder writes the MDX, enforces DYK and events rules, escapes YAML.

Crucially: **the editorial output looked identical.** Same density, same single-source discipline, same enrichments of existing articles. The compression happened in *how the transcript was read*, not in what got written.

---

## Era 4 — the fleet (autonomous ingest)

Discovery + acquisition went autonomous. Trawlers find new Kiriakou videos via channel walks (no search API). A Harbor Master session coordinates. llm-fleet plant workers — Sonnet, Groq Llama — do filleting (read transcript, propose topic map) and canning (write spec). Opus only weighs in on the suspect queue or for high-judgment merges.

This kept the gold-churn motion alive but reduced Opus's role to *editorial review of work proposed by cheaper models*. The doctrine ran through prompts at every plant station.

---

## Era 5 — the research team (eternal loop, current)

The team is now ~18 single-role workers, one process each, unlimited batch size. The full graph: Channel Crawler → Fingerprinter → Scribe → Cataloger → Embedder → Reviewer → Discretion Warden → First/Third Splitter → Coordinator → Triage Patroller → {Deepener, Enricher, Weaver} → {Diff Sentinel, Shape Auditor, MoS Enforcer} → Promotion Committee, with Re-Reader and Contradiction Scout closing the loop.

What this team can do that Era 1 couldn't:

- **Crawl backwards** across a decade of Kiriakou appearances (channel-anchored, not search-based).
- **Dedupe** the same Rogan clip uploaded 15 times into one `recording_id`.
- **Re-read** old transcripts when the article set has grown — because a passage rejected as "no article exists" in 2024 might be gold in 2026 when a relevant article spawns.
- **Patrol** for drift — diff hedge density across revisions and roll back monotonic softening; flag articles whose TOC has converged with too many peers.

---

## What the research team must inherit from Era 1 — the part that matters now

This is the user's current ask: **re-churn the stuff already in the corpus, the way Pedro and Opus used to when feeding YT links in by hand.**

The hand-fed motion had four properties the autonomous team does not yet fully replicate. Each maps to a specific worker.

### 1. Density — "every drop is gold"

When Opus read a transcript end-to-end, *every* named entity, dollar figure, weapon, date, street name was either filed into a new article, used to enrich an existing one, or queued in the Tier C tracker. Nothing was left lying around.

The current team extracts atomic claims at passage granularity, but only files what passes grounding into an article. Passages that mention an entity that doesn't yet have an article are dropped — they don't even leave a breadcrumb.

**Fix:** the Re-Reader, on every pass over an old transcript under a new `article_set_hash`, must emit one of three verdicts per passage: *spawn article X*, *amend article Y*, or *Tier-C-track entity Z for later promotion*. The third verdict is the one that's missing. Without it, density bleeds.

### 2. Cross-fertilization — one transcript touches many articles

A single Era-1 ingest typically wrote 4–8 new articles AND enriched 10–30 existing ones. The Cataloger today does fan out claims correctly, but the Coordinator's filing pass and the Deepener/Enricher pass are decoupled — the Coordinator merges a claim into one article and the Enricher proposes wikilinks downstream as a separate step.

**Fix:** when the Re-Reader queues a passage, the Triage Patroller should route it not just to whatever article it most-obviously belongs to, but to **every article whose subject is mentioned in the passage**. One passage → N enrichment candidates, not one. The 1:N fan-out is the gold-churn signature.

### 3. The single-source heuristic — "told once is still canon"

Era 1 wrote articles even on single-source material. The "told twice = enriched" model is about *enrichment*, not gating: a single transcript reference is enough to start an article, and a second transcript reference deepens it. The team must NOT wait for two sources before filing.

**Fix:** if the Reviewer ever introduces a "needs corroboration" gate, it must be removed. Grounding means "Kiriakou actually said this in the cited passage," not "two transcripts agree." The whole project's identity is that single-source IS canon when the source is John's mouth.

### 4. Discretion mirroring — preserve the silences

Era 1 Opus would deliberately *not* fill in a country name, a code name, or a redacted relationship when Kiriakou had chosen not to. The Discretion Warden role exists for this in the rework but isn't live yet.

**Fix:** ship the Discretion Warden before the Deepener gets prolific. A Deepener that pulls "augmented prose" from a passage where Kiriakou ducked a name will fabricate the name from training data nine times out of ten. The Warden has to run upstream of the Deepener, not after.

---

## The concrete re-churn cycle the team should run

Operationally, "re-churn what's already in the corpus" means a continuously-running loop with one new entry point: the Re-Reader. The cycle:

1. **Article set changes** (Promotion Committee grades an article up, or a new stub spawns). The `article_set_hash` rotates.
2. **Passage verdicts expire** — every `passage_verdict` row stamped with the old hash is now eligible for re-evaluation.
3. **Re-Reader picks the highest-scoring stale recording** from the `video_curriculum`: weighted by `staleness × density × contradiction_signal × inverse_visits`. Density = unmapped-passages-per-minute. Contradiction = embedding distance between a passage and the article supposedly covering it.
4. **Re-Reader streams the passages**, emitting one of: *spawn article*, *amend article*, *Tier-C-track entity*, *rejected with reason*.
5. **Spawned/amended passages flow into the normal Reviewer → Discretion Warden → Splitter → Coordinator chain** — same downstream as a fresh ingest.
6. **Triage Patroller fans the resulting commit out to every other article mentioned in the passage** (the 1:N rule from §2 above).
7. **Diff Sentinel watches for hedge-density rise and removed citations.** If a re-read pass starts softening articles instead of densifying them, the Sentinel rolls it back and flags the prompt for review.

The loop never closes. Every promotion changes the hash. Every hash change re-opens the corpus. The team finds new gold in the same 200 transcripts because the lens has shifted — exactly what Pedro and Opus did when revisiting an old transcript after a new article had spawned, except now it runs without a human pasting the link.

---

## The one-line summary

**Era 1 was a single Opus reading one transcript end-to-end and filing every detail somewhere — new article, enrichment, or tracker. The research team must do the same thing eternally, across the whole corpus, with the article-set hash as the trigger that re-opens previously-finished transcripts.**

That is the editorial inheritance. Workers are dumb; doctrine lives in prompts; the prompts must encode this motion or the gold stops getting churned.

---

## Pointers

- Doctrine (locked in): `ARTICLE-WORKFLOW.md` §"Doctrine constraints", §"STRICT events: rule", §"Wikilink integrity".
- Per-ingest playbook (current automation): `INGEST.md`.
- Fleet roles (Era 4) and the research-team rework (Era 5): the code, prompts and
  planning docs for both were retired and removed from the repo. They survive only
  in git history — see the commit that removed `botnet/`, `fleet/` and `evaluations/`.
- Voice calibration: see the project memory on "per Kiriakou" being acceptable in summaries; ≤2 body attributions per article.
