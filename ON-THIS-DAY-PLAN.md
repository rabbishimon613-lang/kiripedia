# On This Day — population plan

## The current state (measured)
- OTD shows events from article `events:` arrays, strict same-day (mm-dd) match.
- Articles currently hold **38 day-precise events across 26 distinct calendar days**. → 339 days empty.
- The date-index finds **275 day-precise date mentions** Kiriakou utters across 63 transcripts — but they cluster on the same recurring dates.
- Fully extracting every day-precise date Kiriakou utters reaches only **~39 distinct calendar days.** That's the ceiling of strict canon.

## The core tension
Doctrine = "only dates Kiriakou actually utters, YYYY-MM-DD." That keeps OTD pure but caps it at ~39 days/year. To make OTD feel alive (most days populated) requires a deliberate decision to broaden the source of dates.

## Three lanes (stackable)

### Lane 1 — Strict extraction (pure canon, do now)
Harvest the ~275 day-precise mentions from the date-index and attach the missing ones to the right article's `events:`.
- Resolve year from surrounding context where Kiriakou establishes it; skip if genuinely ambiguous.
- Quality rules unchanged: description names a wikilinked entity; Kiriakou-uttered only.
- **Payoff: 26 → ~39 days.** Free, zero doctrine risk. Worth doing regardless.

### Lane 2 — Historical-anchor dates (needs your OK)
For events Kiriakou *explicitly discusses in an article* but doesn't date to the day, add the established public date, clearly tagged as a historical anchor (e.g. `date_source: historical`).
- Examples already in articles: Welch killed Dec 23 1975 (he says it), FOB Chapman Dec 30 2009, Bay of Pigs, the OPEC raid, Iran-Contra, etc.
- Each anchor still ties to an article that cites Kiriakou on the event — so it's "a date for something Kiriakou talks about," not foreign content.
- **Payoff: potentially 100+ days.** Cost: small dilution of strict single-source purity. This is the real unlock and the decision is yours.

### Lane 3 — KiriPedia calendar metadata (mechanical, low-risk)
Surface dates the encyclopedia inherently knows:
- **Source publication dates** — "On this day in 2024, Kiriakou appeared on Julian Dorey #249." 63 sources = up to 63 more days, each linking to a source page (drives video views).
- **Birth/death dates of people he discusses** — only where stated or uncontroversially public, tagged.
- **Payoff: dozens more days**, and it reinforces the "living archive" feel.

## Recommended build order
1. **Lane 1 now** — pure win, I can script the extraction + propose `events:` additions for review.
2. **Lane 3 (source pub dates)** — cheap, mechanical, immediately doubles coverage with safe content.
3. **Lane 2** — only if you approve the historical-anchor relaxation; biggest payoff, needs a doctrine call.

## Open decision for the user
Do we keep OTD strictly Kiriakou-uttered (cap ~39 days), or allow historical-anchor + source-date lanes (most days filled, slight purity tradeoff)? Everything in Lanes 2/3 stays tethered to an article/source that cites Kiriakou — nothing free-floating.
