# Marching orders — June 2026 → July 2026

*Issued 2026-06-25 by the publisher to the entire bureau. In force for the next month. The publisher will touch base with the next set of orders at the end of July.*

---

## The job, in one sentence

**Mine the corpus we already have. Turn every transcript we've ever pulled into more, deeper, better-cross-referenced articles — and weave the existing piles of enrichment into real prose.**

That's it. No new discovery. No new sources. No new acquisition. The shelf is full; the work is on the shelf.

---

## The state of the bureau (as of issue)

- **88 hours of transcribed Kiriakou audio**, roughly **798,000 words of source material**, already sitting in the truth store.
- **279 articles** on the wiki, most of them under-written for the amount of source we hold.
- **163 quarantined claims** — leave them dead. The quarantine is not an inbox.
- **The pipeline is drained**: 0 leads in flight, 0 transcribed clips pending, 0 claims awaiting review. Every active worker has been tripping a "nothing to do" guard and exiting.

The bureau is not idle because the work is done. It is idle because every worker has been told to look at *new* things, and there are no new things. **Look at old things now.**

---

## What every worker should do, by role

### Cataloger-Editor
You have been extracting 0 claims per transcript. Stop scanning transcripts for *unseen* clips only. Walk the entire transcript shelf — every catalogued transcript, regardless of when it was first ingested — and do a **second pass with the question: "what claim did I miss?"** Hedges, asides, throwaway names, parenthetical anecdotes. The grain you're picking up should be finer than the first pass.

Two transcripts is not enough work for a cycle. Take 5–10 per cycle and grind. Bias toward transcripts that touch articles currently shorter than 1,800 words.

### Transcript Deepener
You have been reporting "every gap was already filled this round" 132 times in 24 hours. That guard is lying to you. **Reset whatever cooldown table or "done" flag is making you skip articles** and re-walk the full 279-article shelf. For each article, pull the full transcript text of every clip it cites and look for *additional* sentences in those same transcripts that belong in the article. Subtler claims, related claims, claims about adjacent subjects mentioned in the same breath.

Goal per cycle: **5 articles deepened with new sourced paragraphs**, not 0.

### Cross-Source Enricher
You have been declaring every subject a "true orphan." That diagnosis is almost always wrong — the cross-source mentions index you depend on is stale or empty. **Rebuild the mentions index from a full transcript sweep before declaring orphan status.** Then for every subject, find every transcript that mentions it (not just the one the article was built from) and pull the additional context into the article as cross-source corroboration.

The hot pattern: **the same story told 5 times across 5 different podcasts.** When you find one of those, that's a flagship enrichment — the article should now carry all five framings, each cited to its source. This is the highest-value work in the bureau this month.

If a subject is mentioned across multiple transcripts but has no article yet, **create the article.** New articles are encouraged when the source material is already in hand.

### Article Weaver
You have been reporting "every stub got drafted this round." That's also a lie — most articles on the wiki are currently a pile of enrichment patches stacked under generic H2s, not woven prose. **Your real job this month is consolidation, not initial drafting.**

For every article that has more than ~10 stub sections or visibly reads as a pile of enrichments rather than an encyclopedia entry, run the full weave: collapse the stubs into a small spine of section headers, preserve every quote and citation verbatim, and produce real prose. The `article-weaving` skill describes how. Don't touch articles that are already well-woven.

Target: **at least 1 article fully rewoven per cycle.**

### Tapestry Reweaver
You have been picking an article and then saying *"Pinning [X] back on the corkboard. Not the moment."* for every single one. **The gate that's saying "not the moment" needs to open.** If an article is sitting on the corkboard with new enrichments since its last weave, the moment is now. The corkboard is not a holding pen — it's the inbox.

### Prospector
Stop prospecting for *new* transcripts. **Re-prospect the existing transcripts.** Walk back through clips marked "transcribed" or "catalogued" and ask whether they contain material we haven't surfaced yet — anecdotes, names, dates, places that never made it into an article.

### Mouth Sentry
Continue tone audits but lower the bar for what counts as an issue. The bureau is going to be writing a lot of new prose this month; voice drift is the highest risk.

### Discovery side (Recent Changes, NPP, Source Auth, Scribes, Catch-importer)
**Stand down on new acquisition for the month.** The discovery side has been spinning ~800 times per 24h finding nothing. That's wasted cycles. Run once per day to keep the pipes warm; otherwise the cycles belong to the steady-state crew.

### Coordinator
Run more frequently. Don't wait for a full pipeline cycle — if the steady-state crew has produced article diffs, commit them.

### Indexer
After every coordinator commit, rebuild the mentions graph. The enricher's "everything is an orphan" failure is downstream of a stale mentions index. The mentions graph is now load-bearing infrastructure for this month's work, not an afterthought.

---

## The week-over-week goal

Roughly: take the 798k transcript words and pull them into **at least 500k woven article words** by end of July. Currently the article corpus is far below that. This is the headline number the publisher will check at the next touch-base.

Subordinate metrics that should move every day:
- Words added to articles per cycle (target: hundreds, not zero)
- Articles touched per day (target: 20+, not 0)
- Cross-source corroborations added (target: 5+ per day)
- Articles fully rewoven from stub-piles to prose (target: 5+ per week)
- New articles created from existing transcript material (target: 2–3 per week)

If any of those is sitting at zero for more than a day, that worker's "nothing to do" guard is lying again. **Treat a zero as a bug, not a state.**

---

## What not to do this month

- **Don't go looking for new sources.** No new YouTube channels, no new podcasts, no new uploaders. The shelf is full.
- **Don't reopen the quarantine.** Dead letters stay dead.
- **Don't refactor the pipeline.** This is a content-production month, not an engineering month.
- **Don't drop coverage to chase length.** Every new sentence still needs a verbatim quote and a real timestamp. The grounding stack is non-negotiable.

---

## Reporting

The publisher is monitoring via `/meet-the-team` and the activity log. The bureau does not need to file reports. If a worker exits with "nothing to do" more than twice in a row, that worker should be *louder* about it in its log line so the publisher can see which guard tripped.

Next touch-base: **end of July 2026.**

— issued 2026-06-25
