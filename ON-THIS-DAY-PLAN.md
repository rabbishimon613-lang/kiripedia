# On This Day — population plan

*Rewritten 2026-08-20 (run 4). The original version of this file was written before any
enrichment run had happened and was stale from run 2 onward; it is superseded entirely.*

## Current state (measured 2026-08-20)

- **371 day-precise events across 318 distinct calendar days.** 48 days empty.
- OTD shows events from article `events:` arrays, strict same-day (mm-dd) match.
- Coverage by run: 26 days → 42 (run 1) → 107 (run 2) → 205 (run 3) → 318 (run 4).

## What actually filled the calendar

Not the date index. The method that produced almost everything since run 2 is the
**source-publication-date lane**: for an empty day, take the source published on it with the
most citations across the corpus, read the passages in the highest-citing article that carry a
`<Cite>` to that source, and write the event from what Kiriakou said there. The claim, the
citation and the verified timestamp all already exist in the article — nothing is written from
metadata or from a bare date-index hit.

The **article prose sweep** — full dates present in an article's body but missing from its own
`events:` — paid in runs 1–3 and returned nothing but old rejections in run 4. Re-run it anyway;
it costs seconds.

## The remaining 48 days

Only four have any cited source landing on them, and all four are standing rejections
(re-uploads, aggregator channels, or a ceremony where Kiriakou is not the speaker). The other
44 have no source in the corpus published on that calendar day at all.

**Lane 3 is therefore effectively exhausted.** Filling the rest requires one of:

1. **Uncited sources** — three empty days have a source no article cites yet. Read the
   transcript, write the article, then the event. Real work, pure canon, feeds the enricher too.
2. **New intake landing on an empty day** — passive. The intake and mining routines will
   occasionally hand OTD a day for free. Check the empty list against new sources each run.
3. **Lane 2, historical anchors** — for events Kiriakou discusses in an article but does not
   date to the day, add the established public date tagged `date_source: historical`. Every
   anchor stays tethered to an article that cites him on the event. This is the only route to a
   genuinely full calendar, it is worth roughly a hundred days, and **it has never been
   approved.** It remains a doctrine call for Pedro, not for a routine.

## Quality bar (unchanged, do not relax)

Day-precise `YYYY-MM-DD` only — month- and year-precise dates stay in prose. Kiriakou's own
voice, with the timestamped citation already established in the article body. Past tense. At
least one wikilink. Hung off an article the appearance genuinely anchors, not the biography as
a dumping ground. No duplicates: check what the calendar holds before adding.
