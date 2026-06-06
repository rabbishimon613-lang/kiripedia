# KiriPedia X (Twitter) automation — plan

Goal: an automated X account that posts a few times/day to promote kiripedia.org.
**Constraint: must be entirely free. Text-only to start.**

## Stack (all $0)

- **GitHub Actions** — free cron scheduler. Runs a Node script on a schedule.
- **X API free tier** — write-only, ~500–1,500 posts/month allowed. We need ~90/month. Posting (POST /2/tweets) works on free tier.
- No paid services, no media hosting. **Text + link only** for v1.

## Content source

The encyclopedia already contains the content:
- ~250 articles, each with 2–3 `dyk:` entries in frontmatter.
- = 500+ pre-written one-liners, already in "… that John Kiriakou says X?" form, already cited, already fact-checked.
- 1 post/day from this pool = ~1.4 years before any repeat.

DYK is the primary stream. On This Day is too thin (already audited) — add later, skip empty days.

## Post format (text-only v1)

Strip the `[name](/wiki/slug)` wikilink syntax down to plain text, prepend "Did you know…", append the article URL.

```
Did you know…

…that John Kiriakou says the FBI has no federal jurisdiction in
the Charlie Kirk shooting — it's entirely a Utah state case?

https://www.kiripedia.org/wiki/john-kiriakou
```

Most DYKs fit under 280 chars once wikilink syntax is stripped. Skip any that don't (or truncate at a sentence boundary).

## Cadence (v1)

- 1 post/day, ~1pm ET.
- Later: add featured-article (9am) and OTD (5pm, only when a same-day event exists). Cap at 3/day.

## State tracking (avoid repeats)

- A committed JSON file (e.g. `tools/x-posted-log.json`) lists DYK IDs already posted.
- Script picks a random unused DYK, posts it, appends its ID to the log, commits the log back to the repo via the Action.
- When the pool is exhausted, reset the log.

## Filters (don't post these)

- Skip DYKs from articles flagged DEFERRED / containing "ATTRIBUTION NOTE" (Israel/JFK/conspiracy-sensitive material we've editorially deferred).
- Skip DYKs over 280 chars after stripping + URL.

## Manual override

- A `--featured-slug` flag so that when something Kiriakou-adjacent breaks (Iran, Epstein docs), we can force the most relevant article instead of a random pull.

## Secrets needed (stored in GitHub repo secrets, free)

X API free-tier credentials (4 values):
- API key
- API key secret
- Access token
- Access token secret

User creates the X dev account + generates these. Claude writes all code.

## Account setup notes

- Bio should disclose: "Automated posts from kiripedia.org — the free encyclopedia of John Kiriakou's world. Not affiliated with Mr. Kiriakou."
- Post-only. No replies, no engagement (avoids rate-limit cliff + rage cycle).
- Voice = same as site: encyclopedic, "per John Kiriakou," no editorializing from the account.

## Build order

1. **v1 (MVP):** 1 text-only DYK post/day via GitHub Actions. Validates the whole pipeline.
2. v2: add featured-article post + image attachment (test free-tier media upload).
3. v3: add On This Day (strict same-day only).

## Open risks

- Free-tier media upload may not work → that's why v1 is text-only.
- Free-tier caps could change → 90/month gives wide margin under any reported cap.
- X could revoke free posting → fallback is a cheap scheduler (Buffer/Typefully) but that's not free, so cross that bridge only if forced.
