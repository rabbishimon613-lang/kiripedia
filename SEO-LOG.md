# SEO log — KiriPedia

One dated section per nightly sweep. Read the most recent entry before starting
the next sweep so the routine builds on itself instead of re-auditing the same
ground. Anything found but deliberately left alone is written down with the
reason.

---

## 2026-08-02 — first sweep

Baseline run. No prior log existed, so this entry doubles as the starting state.

### Checked

- **Corpus size:** 748 articles, 1,622 URLs in the sitemap (748 articles + 48
  redirect stubs excluded + category/source/browse pages).
- **Search Console:** no credentials of any kind on this machine — no service
  account, no gcloud config, no stored token, and nothing Google-related in the
  keyring registry (28 entries, all inference/search-API providers). **Blocked.**
- **robots.txt:** correct. Opens the whole site to search and AI crawlers by
  design, blocks only `/search`. Sitemap declared.
- **Canonical tags:** emitted site-wide from `SEO.astro`, absolute, on
  `https://www.kiripedia.org`. No conflicts found.
- **noindex:** 48 pages carry `noindex` — all of them are the Astro-generated
  redirect stubs for merged/typo slugs. Correct, and they are kept out of the
  sitemap. No accidental noindex on a real article.
- **Titles / meta descriptions:** 0 missing, 0 duplicated. The `seoTitle` /
  `deck` / clamped-summary chain in `SEO.astro` is doing its job — descriptions
  are trimmed to a word boundary at 155 chars rather than being cut mid-word.
- **Structured data:** Article schema present, with `sameAs` grounding from the
  `wikidata` / `wikipedia` frontmatter.
- **Build gate:** `npm run build` reaches `Total: 0 bugs, 460 suspicious, 0 dead`.

### Changed

- **40 degenerate meta descriptions rewritten.** 40 articles carried an
  auto-generated summary of the literal form `Per Kiriakou, <Title>.` — e.g.
  Julian Assange, a 3,355-word article and almost certainly the most-searched
  page on the site, was serving `Per Kiriakou, Julian Assange.` as both its
  search snippet and its on-page subtitle. Each was replaced with a real
  one-sentence description written from that article's own sourced content
  (110–155 chars, front-loaded). Others in the batch: Daniel Ellsberg, NSA
  Surveillance, Mass Surveillance, Charlie Kirk shooting, Elon Musk, CIA
  Training Doctrine, Joe Kent, Pam Bondi, Trump, FBI, Senate Foreign Relations
  Committee. No new facts were introduced — every line summarises material
  already in the article.
- **76 dead internal links removed.** Every one pointed at an article that does
  not exist and has no redirect, so each was a live 404 in the corpus:
  - 19 were `[KiriPedia](/wiki/kiripedia)` inside auto-generated "Did you know"
    filler (see below).
  - 57 were red links in article bodies, delinked to plain text (Wikipedia's
    own convention for a red link we cannot honour): `kgb`, `pakistan`,
    `israel`, `iran`, `united-nations`, `abc-news`, `gaza-administrative-history`,
    `al-qaeda`, `afghanistan`, `lebanon`, `bahrain`, `athens`, and 26 others.
- **37 contentless "Did you know" entries removed** across 21 articles, and the
  now-empty `dyk:` key dropped from 10 of them. Two auto-generated filler
  patterns said nothing about their subject and were feeding the homepage DYK
  pool: `… that X features in John Kiriakou's public appearances?` and `… that X
  appears in the KiriPedia corpus?`.
- **45 internal cross-links added, wiring in 24 orphan articles.** Only placed
  where another article already named the target in plain prose — the link
  replaces that existing mention, so no sentence was invented and no link farm
  created. Examples: `cia → mary-margaret-graham` (the budget-leak passage
  already named her), `daniel-ellsberg → watergate`, `jfk-assassination →
  felix-rodriguez`, `houthis → somali-land`.
- **1 redirect hop removed.** `julian-assange` linked to
  `/wiki/wikileaks-arab-spring`, which 301s to `/wiki/wikileaks-as-a-system`.
  Repointed at the canonical target.
- **IndexNow submission added** (`tools/indexnow-submit.mjs`). The key file has
  been live at the site root for some time but nothing ever submitted to it.
  Since Search Console is unavailable, this is the only submission channel we
  have. State is kept in `.kir-indexnow-state.json` (gitignored) keyed on each
  URL's sitemap `lastmod`, so subsequent sweeps push only what actually changed.
  First run submitted all 1,622 URLs.

### Blocked — needs the user, once

- **Search Console is not connected for kiripedia.org.** Nothing on this machine
  can read indexed-vs-excluded counts, coverage errors, top queries, or
  impression trends, so **no indexing or ranking numbers are reported in this
  entry — none were measurable.** To unblock, one of:
  1. Verify `www.kiripedia.org` in Search Console (the site already serves a
     verification-style file at the root, so the DNS or HTML-file method is
     quick), then create a Google Cloud service account, enable the Search
     Console API, add the service-account email as a *full* user on the
     property, and drop the JSON key somewhere this routine can read it; or
  2. export Performance and Coverage as CSV into the repo periodically.

  Until then this line repeats in every sweep.

### Found, not changed — with reasons

- **460 "suspicious" wikilinks** flagged by `tools/audit-wikilinks.mjs` (link
  text not matching the target slug). Spot-checked a sample: these are almost
  all legitimate — e.g. `[non-official cover]` pointing at `/wiki/aldrich-ames`
  is intentional prose. Fixing them requires editorial judgement per link, not a
  sweep. Left alone.
- **118 orphan articles remain** after this run's wiring. They are orphans
  because no other article mentions them in prose at all — linking them would
  mean writing new sentences, which is editorial work under the single-source
  doctrine, not an SEO fix. The nightly sweep should keep picking these up as
  the corpus grows and natural mentions appear.
- **424 articles have no `wikidata` / `wikipedia` grounding.** Adding `sameAs`
  helps Google and LLMs reconcile the entity, but each one needs a verified
  match — a wrong Q-id is worse than none. Candidate for a dedicated pass.
- **60 thin articles under 120 words** (`belmarsh-prison` 34w,
  `zbigniew-brzezinski` 28w, `ethan-mccord-collateral-murder` 35w). These are
  thin because that is genuinely all Kiriakou has said on the subject. The
  schema supports `noindex: true` for consolidation candidates and nothing
  currently uses it. Flagging rather than acting: deciding which thin entries
  should drop out of the index is an editorial call.
- **Redirects are meta-refresh HTML stubs, not 301s** — a consequence of Astro's
  static output. They carry `noindex` and a correct canonical, so they behave
  acceptably, but real 301s in `vercel.json` would pass link equity properly.
  Not changed: it touches deploy config, and the current behaviour is not
  broken.

### Deployed

Yes — one commit, one push, `vercel build --prod` + `vercel deploy --prebuilt
--prod`, per the project's deploy doctrine, after the build reached
`Total: 0 bugs`.

---

## 2026-08-03 — catch-up sweep (run after midnight on 08-04)

The internet was down all day and none of the four daily routines fired, so this
sweep ran late, immediately after the intake and weaving passes.

**Note: a second session was working in this repo concurrently** (the Dead Drop
podcast lane). See "Collision" below — it constrained what this sweep could
safely do.

### Fixed — the sitemap was poisoning IndexNow

The real finding of this sweep. `astro.config.mjs` set a blanket
`lastmod: new Date()` and then overrode it with a genuine per-article date only
for `/wiki/` pages that had an entry in `article-dates.json`. Everything else —
861 source pages, the category and browse pages, and any article missing a date
entry — was stamped with the **build timestamp**.

That is a false freshness signal to every crawler, and it had a concrete cost
here: `tools/indexnow-submit.mjs` decides what to resubmit by diffing `lastmod`
against its own state file, so **876 unchanged URLs were being resubmitted to
Bing, Yandex and DuckDuckGo on every single deploy**. The one submission channel
available to this project without Search Console was ~94% noise.

Changed `serialize()` to delete `lastmod` first and then set it only where a
real date exists:

- `/wiki/` — last-commit date from `article-dates.json`, as before.
- `/sources/` — the publication date parsed out of the slug. Source pages are
  immutable transcripts; that date is the only one they will ever have. Also
  dropped their `changefreq` from `daily` to `yearly`, which is the truth.
- everything else — no `lastmod` at all. Omitting it is valid sitemap XML and
  reads as "unknown", which is honest, rather than "changed just now".

After the fix, 1,656 of 1,685 URLs carry a real date and 29 (category/browse
pages with no natural date) carry none. Zero carry a build timestamp.

**This fix is committed but NOT yet deployed** — see Collision.

### IndexNow

Submitted **57 URLs**, HTTP 200. These were chosen deliberately rather than by
running the tool's own diff: with the state file still holding the old
build-timestamp values, the tool wanted to send 1,103 URLs, almost all of them
unchanged. Instead the sweep took the 70 URLs that had never been submitted at
all, checked every one with a live HEAD request, and sent only the 57 that
returned 200.

The 13 that were skipped are the other session's new articles, which exist on
disk but are not deployed and would have 404'd. They are deliberately left out
of the state file so the next sweep picks them up once they ship.

State was then resynced to the corrected `lastmod` values for the other 1,672
URLs, so the next sweep starts from a clean baseline and sends only genuine
changes.

### Checked

- **Corpus:** 810 articles (up from 748 at the first sweep), 1,685 sitemap URLs.
  29 new articles came from this night's intake catch-up.
- **Search Console:** still **blocked**, unchanged from the first sweep. No
  service account, no stored token, nothing Google-related in the keyring. To
  unblock, Pedro needs to verify `kiripedia.org` in Search Console once, create
  a Google Cloud service account with the Search Console API enabled, add that
  service-account email as a full user on the property, and drop the JSON key
  where this routine can read it. **This line repeats every sweep until fixed.**
- **robots.txt / canonicals / noindex:** unchanged and correct.
- **New articles:** all 29 are in the sitemap, all resolve 200 live, all carry
  summaries, categories, ≥2 DYK entries and ≥1 citation (the build audits
  enforce this — `Total: 0 bugs`).
- **Internal linking:** the 29 new articles are not orphans. Each was created
  alongside enrichments to existing articles that link to it, which is a better
  outcome than the retro-fitted wiring earlier sweeps had to do.

### Collision — why this sweep stopped short

Partway through, `git status` showed 23 modified and 14 new articles that this
session did not write: Dead Drop podcast enrichments (prison material — Loretto,
diesel therapy, Charles Samuels, prison phone monitoring) sourced from
`2026-07-13-dead-drop-s2e9-killing-fascism` and three later episodes. File
mtimes put them at 00:23–00:29, i.e. written *during* this session. A second
Claude session is running the Dead Drop lane in the same working directory.

Two of this session's commits used `git add -A` before that was known and
therefore swept up some of that session's in-flight work:

- `319d67b` (intake) included `src/content/articles/fci-loretto.mdx`.
- `321e5cc` (weaving) included 8 Dead Drop source files and
  `tools/unstrip-sponsors.mjs`.

Nothing was lost or overwritten — it is all committed and pushed — but it is
attributed to the wrong commit messages, and both production deploys shipped
that lane's partial state.

Consequently this sweep **did not deploy**. The sitemap fix is committed and
will go live with whatever deploy comes next. Nothing further was staged with
`git add -A`; the config fix was committed by explicit path only, and the other
session's 37 uncommitted files were left untouched.

### Not done this sweep

- **Bilbo Data and Cyberputa were not swept.** This run spent its time on the
  three KiriPedia routines that had also been missed and on the sitemap defect.
  Both sites carry over to the next sweep, and Bilbo's Search Console
  verification is still outstanding.
- The standing items from the first sweep — suspicious wikilinks, orphan
  articles, missing wikidata grounding, thin articles, meta-refresh redirects —
  were not revisited and their reasoning is unchanged.

---

## 2026-08-04 — third sweep

Ran clean. The sitemap `lastmod` fix from the last sweep **is live** — the
production sitemap now carries a real per-article date on 1,682 of 1,698 URLs
and a build timestamp on none, so IndexNow is no longer being flooded with
unchanged URLs. That was the previous sweep's main open item and it is closed.

### Checked

- **Corpus:** 822 articles (up from 810), 1,698 sitemap URLs.
- **Live vs local:** the production sitemap and a fresh local build agree
  exactly — same 1,698 URLs, no additions, no stale entries. Everything on disk
  before this sweep is already deployed.
- **Search Console:** still **blocked**, third sweep running. Re-checked this
  run: no service account, no `gcloud` config, no Google environment variables,
  and none of the keyring's 28 entries is a Google credential. **No indexing,
  impression or ranking figures appear in this entry because none were
  measurable.**
- **Build gate:** `Total: 0 bugs, 558 suspicious, 0 dead`. Zero dead internal
  links across the whole corpus.
- **robots.txt / canonicals / noindex:** unchanged and correct. 48 `noindex`
  pages, all of them the redirect stubs, none in the sitemap.
- **Structured data:** Article schema on all 822 article pages; a random sample
  of 40 pages parsed 145 JSON-LD blocks with zero errors.
- **IndexNow:** dry run reported **0 new or changed URLs**. Nothing was sent,
  correctly — the 01:16 run had already covered the whole set.

### Changed

- **21 high-traffic pages got a purpose-written title and/or description.**
  These were the top of the corpus by inbound links and every one of them was
  still falling back to an auto-derived snippet:
  - `john-kiriakou` — **783 inbound links, 29,115 words, the single most
    important page on the site** — was serving the bare title
    `John Kiriakou — KiriPedia` and an 85-character résumé line. It now reads
    `John Kiriakou, CIA torture whistleblower` with a description naming the
    Abu Zubaydah capture and the 2007 disclosure.
  - `cia` (283 inbound), `abu-zubaydah`, `enhanced-interrogation`,
    `fci-loretto`, `mossad`, `donald-trump`, `benjamin-netanyahu`,
    `john-brennan`, `espionage-act`, `george-tenet`, `aipac`, `jeffrey-epstein`,
    `bureau-of-prisons`, `cofer-black`, `edward-snowden`, `guantanamo-bay`,
    `letter-from-loretto`, `senate-torture-report`,
    `cia-torture-program-whistleblowing`, `john-kerry`.
  - Several of these had summaries that were being cut hard: `edward-snowden`
    725 characters, `cia-torture-program-whistleblowing` 612,
    `bureau-of-prisons` 581, `john-kerry` 476, `jeffrey-epstein` 396. All now
    serve a clean sentence under 155 characters.
  - Every line compresses material already in that article's own summary or
    lede. No new facts, per the single-source doctrine. Verified in the built
    HTML: 21 of 21 serve an untruncated description.
  - Four candidates in the same list — `fbi`, `julian-assange`,
    `revolutionary-organization-17-november`, `asset-acquisition-cycle` — were
    **deliberately left alone**: their existing summaries already fit inside the
    snippet window, so a rewrite would have been churn.
- **6 orphan articles wired in.** `beirut`, `china-djibouti-base`, `jim-moran`,
  `marjorie-taylor-greene`, `roy-cohn`, `tony-blinken`. Each link replaces a
  plain-prose mention that already existed in the linking article, so no
  sentence was invented. Each was inspected in context before applying — e.g.
  `bab-al-mandab` already read "nine miles of water across from Djibouti", and
  the `china-djibouti-base` article is titled "Djibouti" and is Kiriakou's
  account of the country, so the target matches the mention.

### Blocked — needs the user, once

- **Search Console is not connected for kiripedia.org.** Unchanged for three
  sweeps. To unblock: verify `www.kiripedia.org` in Search Console, create a
  Google Cloud service account, enable the Search Console API, add the
  service-account email as a *full* user on the property, and drop the JSON key
  where this routine can read it. Until then, no sweep can report a single real
  indexing or ranking number for this site.

### NOT deployed — and why

**This sweep did not deploy, deliberately.** A second session is running an
image lane in this working directory right now: `tools/fetch-images.sh` was
live throughout the sweep (still writing at 03:29), `public/images/` grew past
689 files during the run, and that session also has uncommitted changes to
`astro.config.mjs`, `vercel.json`, `src/layouts/ArticleLayout.astro` and
`package.json` — a trailing-slash canonicalization that is mid-rollout.

Deploying would have shipped that lane's half-finished state to production,
which is exactly the mistake recorded in the previous entry. The conservative
choice was to commit and stop.

As before, **nothing was staged with `git add -A`.** This sweep's 25 article
files were committed by explicit path. The other session's 9 modified articles
and its config changes were not touched, and its files were excluded from the
orphan-wiring pass by name so no edit could land in a file it had open.

The 21 metadata fixes and 6 links will go live with whatever deploy comes next.

### Found, not changed — with reasons

- **700 article pages still serve a description that ends in an ellipsis.** This
  is the corpus-wide version of the problem fixed above: the summary is longer
  than the snippet window and there is no `deck` to override it. Fixing them
  properly means writing 700 grounded sentences, which is editorial work, not a
  sweep. The sensible pattern is what this sweep did — take the top slice by
  inbound links each night and work down. At ~21 a night this closes in about a
  month, and the highest-traffic pages are already done.
- **113 orphan articles remain** (was 118, and the corpus has grown by 74 since
  that count). Only 6 were wireable this run because the rest are not named in
  prose anywhere in the corpus. Unchanged reasoning: linking them means writing
  new sentences.
- **558 "suspicious" wikilinks** (was 460 — the rise tracks corpus growth, not a
  regression). Still overwhelmingly legitimate prose links. Unchanged.
- **498 articles have no `wikidata` / `wikipedia` grounding** (324 of 822 are
  grounded). Still a candidate for a dedicated verified pass; a wrong Q-id is
  worse than none.
- **359 articles under 300 words, 124 under 150.** Unchanged reasoning: they are
  thin because that is all Kiriakou has said. Deciding which should carry
  `noindex` is an editorial call.
- **Redirects are still meta-refresh stubs rather than 301s.** Unchanged: it
  touches deploy config, and the other session is currently editing exactly that
  file. Left well alone this run.

**Late note, same run:** the other session's image lane finished shortly after
this sweep ended, but its work is still uncommitted — the config changes, the
trailing-slash rollout, ~700 images and 9 modified articles. So the position is
unchanged: the next deploy, whoever runs it, will carry that lane's work and
this sweep's 21 metadata fixes and 6 links together. Nothing here is live yet.

---

## 2026-08-04 — analytics pass (manual, 7am; separate from the 3am sweep)

First run where **real numbers were readable**. The three prior sweeps all
recorded Search Console as blocked and reported no indexing or ranking figures.
That entry can now be closed: `kiripedia.org` is a verified property and both
dashboards are reachable through the signed-in browser. No service account or
API key was needed — the earlier sweeps were looking for the wrong kind of
credential.

This pass is analytics-driven and is now armed as a daily 7pm routine
(`kiripedia-7pm-seo`), deliberately offset from the 3am crawl-hygiene sweep so
the two don't collide on the working tree.

### Measured

**Vercel Analytics, last 30 days:** 778 visitors (+174%), 3,830 page views
(+163%), bounce rate 77% (+22%). Traffic is almost entirely search — Google 345,
DuckDuckGo 81, Bing 19, Reddit 9, ChatGPT 6. 73% United States, 62% desktop.
Top landing pages: homepage 168, bob-grenier 70, nordstream-pipeline-sabotage
38, alan-dershowitz 32, /category/people 27, hummus 25.

Worth a look on a future run: 33% of visitors report GNU/Linux, high for a
general-audience wiki, and possibly scraper traffic that still runs JavaScript.

**Search Console, last 3 months:** 112 clicks, 5,540 impressions, 2.0% CTR,
average position 16.6. Impressions climbed from roughly 25/day in late May to
roughly 180/day at the end of July; clicks stayed flat near 3/day. Against the
2026-07-09 baseline (46 clicks / 2,003 impressions / 2.30% CTR): impressions
2.8x, clicks 2.4x, CTR flat.

**Read those two together and the diagnosis is unambiguous.** The site is not
struggling to be found or indexed — visibility is compounding on its own. It
loses at the two steps after that: it ranks on page two (16.6), and when shown
it is not clicked (2%).

Highest-impression queries and their clicks: "why does cia put hummus up ass"
105/0, "gust avrakotos" 54/0, "kiripedia" 45/9, "afghanistan language" 45/0,
"remains of the day … john kiriakou" 40/0, "mary margaret graham john kiriakou"
34/1, "'if it weren't for john kiriakou' mccain" 28/0, "afghan language" 23/0,
"kuwait oil fires" 15/0, "kuwaiti oil fires" 14/0. 418 queries in total. The
pattern holds all the way down: these are exactly the questions this corpus is
uniquely able to answer, and every one of them is being shown and ignored.

**Indexing:** 1,440 indexed, 499 not. Reasons: 340 "Alternate page with proper
canonical tag", 92 "Crawled - currently not indexed", 57 "Discovered - currently
not indexed", 4 redirects, 3 not-found, 2 noindex, 1 soft 404.

**Links:** 18 external backlinks in total, every one from a single Reddit post
in r/intelligence. 8,677 internal links, of which about 8,620 point at the
homepage and the six category pages.

### Two structural faults, both now fixed

**1. The entire corpus was indexed at two URLs each.** Canonical tags, JSON-LD
and the sitemap emitted the trailing-slash form (`/wiki/hummus/`), but every
link the site actually rendered — nav, breadcrumbs, category lists and roughly
10,000 wikilinks inside article bodies — pointed at the slash-less form. Search
Console showed `/wiki/hummus/` at 347 impressions sitting directly next to
`/wiki/hummus` at 257, and the 340 URLs parked under "Alternate page with proper
canonical" are the rest of the corpus doing the same thing. Canonical was doing
its job, so this was never a crisis, but the site was paying twice in crawl
budget for every page and splitting its own ranking signals. The same split was
visible in the internal-link report, where `/category/procedures` (1,467 links,
no slash) and `/category/people/` (1,466 links, slash) were being counted as two
different pages.

**2. Internal link equity was going almost entirely to the nav.** 8,620 of 8,677
internal links pointed at seven pages. Individual articles got almost nothing —
abu-zubaydah 53, david-rockefeller-bahrain 4, most of the corpus 0. Separately,
113 of 822 articles had no inbound wikilink from anywhere in the corpus, and the
median article had 2. That is the mechanism behind the 92 "Crawled - currently
not indexed" and 57 "Discovered - currently not indexed": Google can reach those
pages, but nothing on the site vouches for them. Prior sweeps treated this as an
editorial problem ("linking them means writing new sentences") and wired 6 a
night. It is also solvable structurally, which is what was done here.

### Changed

- **One canonical URL shape, enforced at two layers.** `trailingSlash: true` in
  `vercel.json` makes the edge 308 the slash-less form, so already-indexed URLs
  and inbound links consolidate rather than merely being canonicalised away. A
  new build integration (`tools/astro-trailing-slash.mjs`) rewrites every
  internal link in the emitted HTML to match — 5,285 links normalized on the
  first pass. The 48 redirect targets in `astro.config.mjs` were slash-terminated
  too, so a redirect now lands in one hop instead of two. Verified in the built
  output: **zero slash-less internal page links remain** across 1,752 pages, and
  canonical, JSON-LD and links now all agree.

  This also closes a standing item from the first sweep, which noted redirects
  were meta-refresh stubs and left the deploy config alone.

- **A "Related articles" block on every article** (`tools/build-related.mjs` →
  `src/components/Related.astro`, wired into the build). Relatedness is scored
  from what the corpus already knows rather than guessed: shared cited source
  recordings weigh heaviest (two articles citing the same interview are usually
  the same story), then direct wikilinks, then shared outbound links, then shared
  categories. `john-kiriakou` and `cia` are excluded as coupling terms — they
  appear in 805 and 306 articles respectively and so carry no information. An
  orphan-rescue pass then guarantees every article is surfaced by at least three
  others, repeating until stable so that trimming a full block cannot re-orphan
  someone. Result: 819 of 822 articles carry a block and **no article is
  unreachable by link any more** (was 113). This should also work on the 77%
  bounce rate, since a reader arriving from a search now has a next click.

- **Purpose-written titles and descriptions on nine zero-click pages**, chosen
  directly off the impressions table above rather than by inbound links:
  gust-avrakotos, afghan-languages, john-mccain, kuwait-oil-fires,
  mary-margaret-graham, the-farm, saddam-hussein, david-rockefeller-bahrain,
  remains-of-the-day-book. Each got a `seoTitle` under 50 characters and a `deck`
  near 150, written to answer the query that is actually surfacing the page. No
  new facts — each line compresses material already in that article. This is the
  one lever with direct evidence behind it on this site: hummus went from 0
  clicks to 9 after exactly this treatment on 2026-07-23, and it is now the
  site's second-best page.

- **A daily audit script** (`tools/seo-daily.mjs`) that prints the deterministic
  half of this pass — orphans, thin pages, related-block coverage, how many pages
  still lack a purpose-written title, and the change since the previous run —
  plus a ranked queue of what to write next. Today: 822 articles, 113 orphans by
  wikilink, 359 thin, 719 still serving a truncated summary, 0 related-orphans.

### NOT deployed — and why

Same reason as the 03:54 sweep, and the position is unchanged: the image lane's
work is still uncommitted in this working tree — 597 modified articles and 509
untracked files, mostly newly fetched images. Deploying would ship that lane's
state as a side effect.

Nothing was staged with `git add -A`. This pass committed its own files by
explicit path only. Note that four of the nine articles it edited
(afghan-languages, the-farm, david-rockefeller-bahrain, remains-of-the-day-book)
had also picked up an `image:` infobox line from the image lane by the time they
were committed; those lines are complete and the four image files exist on disk,
so they were committed along with the metadata rather than surgically removed.

### Blocked — needs the user

- **Backlinks. This is the real ceiling and nothing in the codebase can move
  it.** 18 links from one Reddit thread is why average position sits at 16.6.
  Kiriakou sharing the site himself is the highest-value unlock available.
  Second best: that single r/intelligence post produced all 18 existing links,
  so more posts of that kind demonstrably work.
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia** for the Organization `sameAs` (carried from
  2026-07-09).

### Closed as no longer true

- "Search Console is not connected" — it is connected and readable, and has been
  since 2026-08-01. Three sweeps reported this as blocking because they looked
  for a service-account credential rather than using the signed-in browser.

---

## 2026-08-04 — evening analytics pass (7pm routine, first automated run)

First run of the armed `kiripedia-7pm-seo` routine. Ran clean end to end and
**deployed**, which closes the standing "NOT deployed" note from both of this
morning's entries.

### Measured

Both dashboards read directly. **Note: Search Console last refreshed 6.5 hours
before this run, so its figures are the same snapshot the 7am pass read.** No
delta is claimed against them, and nothing this morning changed could have moved
them yet.

- **Search Console, last 3 months (May 24 – Aug 2):** 112 clicks, 5,540
  impressions, 2.0% CTR, average position 16.6. Indexing: 1,440 indexed / 499
  not — 340 "Alternate page with proper canonical tag", 92 "Crawled - currently
  not indexed", 57 "Discovered - currently not indexed", 4 redirects, 3
  not-found, 2 noindex, 1 soft 404. Identical to the 7am read on every figure.
- **Vercel Analytics, last 30 days:** 788 visitors (+178%), 3,845 page views
  (+165%), bounce rate 77% (+22%). Up slightly from this morning's 778 / 3,830.
  Referrers: Google 351, DuckDuckGo 82, Bing 19, Reddit 9, ChatGPT 6, Brave 3,
  Yahoo 3. 73% United States, 62% desktop, 33% GNU/Linux (still unexplained;
  carried).
- **Corpus audit (`tools/seo-daily.mjs`):** 856 articles (+34 since this
  morning), 117 orphans by wikilink (+4), 368 thin (+9), 734 clamped snippets
  (+15), 0 related-orphans, 39 with `seoTitle`, 59 with `deck`.

### Confirmed live: this morning's work did ship

Both 08-04 entries recorded their changes as committed-but-not-deployed. A
later deploy carried them. Verified against production this run: the
trailing-slash 308 fires (`/wiki/hummus` → `/wiki/hummus/`), and the purpose-
written titles and decks for hummus, afghan-languages and gust-avrakotos are
all serving. Nothing was stranded.

### Changed

- **11 zero-click pages got a purpose-written `seoTitle` and `deck`**, picked
  straight off the impressions table — each carries 26–95 impressions over three
  months at **zero** clicks and had no purpose-written metadata:

  | page | impressions | driving queries |
  |---|---|---|
  | `doing-time-like-a-spy` | 95 (65 + 30 slash-less) | book title, "john kiriakou books" |
  | `sheikh-saad-al-abdullah` | 88 | Kuwait / Gulf War cluster |
  | `carlos-the-jackal` | 59 | name |
  | `curveball` | 39 | name |
  | `moral-injury` | 35 | "john kiriakou moral injury" (8) |
  | `united-fruit-arbenz-coup` | 28 | "united fruit company coup" (5), "guatemala united fruit company" (4), "united fruit company cia" (3) |
  | `jfk-assassination` | 27 | "who was the cia director in 1963" (3) |
  | `greater-and-lesser-tunb-islands` | 27 | "greater tunb" (7), "tunb" (5), "tunb islands" (4), "lesser tunb" (4) |
  | `uday-hussein` | 26 | name |
  | `kuwait-liberation-day` | 26 | "kuwait liberation" (8), "liberation kuwait" (5) |
  | `general-dostum` | 43 across the query cluster | "dostum" (13), "general dostum" (10), "general abdul rashid dostum" (8), "rashid dostum" (5), "dostum afghanistan" (4), "abdul rashid dostum" (3) |

  Every `seoTitle` is 44–50 characters, every `deck` 141–152. Verified in the
  built HTML: 11 of 11 serve an untruncated description. No new facts — each
  line compresses material already in that article, per the single-source
  doctrine.

- **A misrouted redirect fixed.** `/wiki/three-saudi-princes` pointed at
  `/wiki/abu-zubaydah` when `/wiki/saudi-princes-and-9-11` — the article
  actually about the three princes — exists. That URL took **59 impressions in
  three months and returned 0 clicks**, and anyone who did click landed on the
  general Abu Zubaydah page rather than the one answering their search.
  Repointed. Verified live.

### Found, not changed — the redirect stubs are being served

New this run, and worth acting on later. Two **`noindex` meta-refresh redirect
stubs are still accruing impressions in Search Console**:
`/wiki/abdul-rashid-dostum` 55 and `/wiki/three-saudi-princes` 59 — 114
impressions over three months landing on a blank "Redirecting to:" page, at a
structurally guaranteed 0% CTR.

This is the measured cost of an item flagged and deferred twice before (first
sweep, third sweep): redirects are Astro-generated meta-refresh HTML rather than
real 301/308s, so Google keeps the stub as its own URL. The fix is to move the
48 entries in `astro.config.mjs` into `vercel.json` as edge redirects, the same
mechanism the trailing-slash rollout already uses.

**Deliberately not done this run.** The trailing-slash edge rule went live only
today; stacking a second routing change on top of it before its effect can be
observed is the riskier option on an unattended run. Recommended for a run once
the trailing-slash consolidation shows up in the indexing report.

### Verified

- `npm run build` → `Total: 0 bugs, 600 suspicious, 0 dead`.
- **URL shape held:** 0 slash-less internal links across 1,784 built pages, and
  0 in the `vercel build --prod` output.
- **Related blocks:** 856 articles, 778 rescue links, **0 with no inbound
  related-link**, 3 with an empty block. The 34 new articles from intake did not
  re-orphan anything; the generator absorbed them.
- **Build completeness checked against source** (per the known flaky-drive
  behaviour on this volume): 856 source articles → 904 built wiki pages (856 +
  48 redirect stubs), 1,729 sitemap URLs. The 254-file gap between
  `src/content/sources` and `dist/sources` is the `.sponsors.md` audit sidecars,
  which are deliberately not rendered — not a dropped write.

### IndexNow

**511 URLs submitted, HTTP 200.** Higher than a normal night and legitimate:
606 article files were touched by the intake and image-lane commits sitting
between the last submission and this one, so their last-commit dates — and
therefore their sitemap `lastmod` — genuinely changed.

### Deployed

Yes. One commit (`bad84c4`), staged by explicit path only, pushed, then
`vercel build --prod` + `vercel deploy --prebuilt --prod`, aliased to
`www.kiripedia.org`. Verified live afterwards. Working tree was clean at the
start of this run — no other session's work was in flight, and nothing was
staged with `git add -A`.

### Blocked — needs the user

Unchanged from this morning:

- **Backlinks — still the real ceiling.** 18 links, all from one r/intelligence
  post, is why average position sits at 16.6. Kiriakou sharing the site himself
  is the highest-value unlock. That one Reddit post produced all 18 existing
  links, so more posts of that kind demonstrably work.
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia** for the Organization `sameAs` (carried from
  2026-07-09).

### Standing items, unchanged

734 clamped snippets (was 719 — the rise is corpus growth, not regression; at
~10–20 a night the high-traffic slice closes first, which is what matters), 117
wikilink orphans, 600 suspicious wikilinks, 532 articles without
`wikidata`/`wikipedia` grounding, 368 thin articles. Reasoning unchanged from
2026-08-04.

---

## 2026-08-05 — nightly sweep

### Read

- **Search Console, last 3 months:** 112 clicks, 5.54K impressions, 2.0% CTR,
  average position 16.6. Indexing: **1,440 indexed / 499 not** — 340 "Alternate
  page with proper canonical tag", 92 "Crawled - currently not indexed", 57
  "Discovered - currently not indexed", 4 redirects, 3 not-found, 2 noindex,
  1 soft 404.
  **Every figure is identical to the 2026-08-04 evening read.** The trailing-
  slash edge rule went live on 08-04 and Google has not recrawled since; the
  report has not moved a single page. This matters for the deferral decision
  below.
- **Sitemap:** `sitemap-index.xml`, last read Aug 3, **Success, 1,622 pages
  discovered.** Healthy.
- **Vercel Analytics, last 30 days:** 778 visitors (+177%), 3,805 page views
  (+157%), bounce rate 77% (+22%). Slightly *below* last night's 788 / 3,845 —
  this is the rolling 30-day window dropping older days off the back, not a
  traffic drop. Referrers: Google 346, DuckDuckGo 80, Bing 19, Reddit 9,
  ChatGPT 6, Brave 3, Yahoo 3.
  Top landing pages: `/` 166, `bob-grenier` 70, `nordstream-pipeline-sabotage`
  38, `alan-dershowitz` 32, `/category/people` 27, `hummus` 26,
  `john-kiriakou` 23. `bob-grenier` at 70 visitors barely registers in Search
  Console, so that traffic is arriving from somewhere other than Google —
  worth identifying on a future run.
- **Corpus audit (`tools/seo-daily.mjs`):** 975 articles (**+119**), 150
  orphans by wikilink (+33), 405 thin (+37), 843 clamped snippets (+109), 0
  related-orphans, 50 with `seoTitle` (+11), 70 with `deck` (+11). The +119 is
  the intake routine; the orphan and thin rises are that growth, not
  regression.

### Changed

- **8 pages with impressions and no purpose-written title got one.** Taken off
  the live impressions table, all of them missing `seoTitle`:

  | page | impressions | clicks |
  |---|---|---|
  | `john-mccone` | 79 | 1 |
  | `cofer-black` | 69 | 2 |
  | `lincolns-last-turd` | 51 | 1 |
  | `abu-zubaydah` | 47 | 0 |
  | `jean-gately` | 35 | 6 |
  | `ali-hassan-al-majid` | 34 | 1 |
  | `kuwait-invasion-intelligence` | 29 | 1 |
  | `mossad` | 28 | 0 |

  `seoTitle` 33–43 characters, `deck` 134–147 where one was written (four
  already had a usable deck and kept it). Verified in the built HTML: all 8
  serve the new title and an untruncated description. No new facts — each line
  compresses material already in that article, per the single-source doctrine.

- **The 48 redirect stubs are now real 308s at the edge.** Flagged and deferred
  on three previous sweeps; the measured cost had reached **114 impressions at
  a structurally guaranteed 0% CTR** (`/wiki/three-saudi-princes` 59,
  `/wiki/abdul-rashid-dostum` 55), because Astro emits them as `noindex`
  meta-refresh HTML that Google keeps as its own URL.

  Moved into `vercel.json` as 96 permanent redirects — **both the slash-less
  and the trailing-slash form of each of the 48 sources**, because with
  `trailingSlash: true` the edge may normalize the URL before or after the
  redirect table is consulted and covering both makes the hit
  order-independent. Before writing: no source is also a destination (no
  chains, no loops), and all 41 unique destinations were confirmed to exist as
  built pages.

  **The Astro stubs were deliberately left in place.** Edge redirects are
  evaluated before the filesystem, so the stubs become unreachable dead weight
  rather than a competing URL — and if a redirect rule ever fails to match,
  the page still resolves instead of 404ing. Defence in depth for a routing
  change made on an unattended run.

  This reverses the previous two sweeps' deferral, and the reason is that the
  deferral condition turned out to be unreachable: it was "wait until the
  trailing-slash consolidation shows up in the indexing report", and the
  report has not moved at all in a day because Google has not recrawled. That
  could take a week or more, during which the bleed continues. The change is
  independently verifiable with a single request per URL, which is what made
  it safe to do now rather than wait.

- **Vercel git auto-deploy on `main` was found switched back ON, and has been
  switched off again.** `vercel.json` set `git.deploymentEnabled.main = false`
  on 2026-07-05 (commit `e2fd6ca`, "Automation permanently disabled per owner
  decision"). Last night's image-lane commit `f096a96` flipped it to `true`
  with the note "Also lifts the Vercel deployment freeze on main."

  Restored to `false`. It contradicts the standing rule that deploys are
  explicit CLI actions, and with it on, the `git push` in this routine fires
  its own build that races the explicit `vercel deploy` immediately after.
  **Flagged for the user:** if the image lane genuinely needs deploy-on-push,
  this is the one to argue about — it was reverted on doctrine, not on a
  measurement.

### Verified

- `npm run build` → **`Total: 0 bugs, 723 suspicious, 0 dead.`**
- **URL shape held:** `grep -rhoE 'href="/(wiki|category|sources)/[a-z0-9._-]+"' dist | wc -l`
  prints **0** across 1,831 indexed pages. The normalizer did not regress.
- **Related blocks:** 975 articles, 832 rescue links, **0 with no inbound
  related-link**, 3 with an empty block. The 119 new intake articles did not
  re-orphan anything.
- **Build completeness checked against source** (per the flaky-drive rule on
  this volume): 975 source articles → 1,022 built wiki pages (975 + 47
  redirect stubs), 1,849 sitemap URLs. A surplus, not a deficit — no dropped
  writes.
- Canonical tags carry the trailing slash; JSON-LD on a sampled article emits
  Organization + WebSite + Article + Person + BreadcrumbList and parses clean.

### Found, not changed — with reasons

- **`/wiki/hummus` (slash-less) still shows 257 impressions and 3 clicks** next
  to `/wiki/hummus/` at 347 and 6. This is three months of history that spans
  the pre-fix period, not evidence the fix failed. Re-read it once Google has
  recrawled.
- **`/category/people` and `/category/procedures` appear in the impressions
  table without trailing slashes** (28 and 88 impressions). Same consolidation
  in progress; the edge rule covers them. No action.
- **Standing items, unchanged:** 843 clamped snippets, 150 wikilink orphans,
  723 suspicious wikilinks, 405 thin articles. Reasoning unchanged from
  2026-08-04 — these track corpus growth, and the high-traffic slice is what
  gets closed first.

### Blocked — needs the user

Unchanged, and repeated every run until fixed:

- **Backlinks are still the real ceiling.** 18 links, all from one
  r/intelligence post, is why average position sits at 16.6 and why 5.54K
  impressions only convert to 112 clicks. Kiriakou sharing the site himself is
  the highest-value unlock available. That one Reddit post produced all 18
  existing links, so more posts of that kind demonstrably work.
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia** for the Organization `sameAs` (carried from
  2026-07-09).

### Deployed — yes, but the push is blocked

**Production is live and carries everything in this entry.** Verified against
`www.kiripedia.org` after deploying:

- The 8 new titles serve (`john-mccone`, `mossad`, `lincolns-last-turd`
  spot-checked).
- **The former redirect stubs now resolve to their canonical article with a
  200**, via real 308s: `three-saudi-princes` → `saudi-princes-and-9-11`,
  `abdul-rashid-dostum` → `general-dostum`, `tom-drake` → `thomas-drake`,
  `afia-sadiki` → `aafia-siddiqui`.
- **Known and accepted: this is a 2-hop chain**, not 1. Vercel evaluates
  `trailingSlash` normalization before the redirect table, so `/wiki/tom-drake`
  first 308s to `/wiki/tom-drake/` and only then to the destination. Both hops
  are 308s and the chain terminates at a 200, which Google follows without
  penalty. The slash-less entries in the table are therefore never reached, but
  they are harmless and were kept because the evaluation order is Vercel's to
  change, not ours.
- **IndexNow: 180 new-or-changed URLs submitted, HTTP 200.**

Deploy needed `--archive=tgz`. The plain `vercel deploy --prebuilt --prod`
failed with `api-upload-free` — more than 5,000 file uploads in 24 hours, a
free-tier cap that the 1,849-page corpus now trips on a normal day. **Future
sweeps should use `vercel deploy --prebuilt --prod --archive=tgz` directly**
rather than discovering this again.

### Blocked — `git push` is rejected, and it is not this routine's doing

The commit for this sweep (`3487c4d`) is **local only**. `git push` is rejected
by GitHub:

> File public/article-mentions-index.json is 160.36 MB; this exceeds GitHub's
> file size limit of 100.00 MB

`public/article-mentions-index.json` sat at 5 MB for months and jumped to
**160 MB** in commit `1aa54b6` ("Bruce Fein, and a batch of tradecraft
articles"), from the intake routine. **Six unpushed commits now carry the
oversized blob, so every push from this branch fails**, including ones that
have nothing to do with it. There are 12 unpushed commits on
`kiriakou-intake-churn` in total.

This was deliberately not fixed here. Clearing it means either rewriting the
history of a branch that two other routines are actively committing to, or
migrating the file to Git LFS — both destructive, both racy against a running
intake, and neither appropriate for an unattended run.

**What the user (or a dedicated session) has to decide:** whether that index
belongs in `public/` and in git at all. It is a build input that ships to the
CDN; if it is not fetched by the browser it should be moved out of `public/`
and gitignored, after which the six commits still need rewriting or squashing
before any push will succeed. Until then KiriPedia's source history is
diverging from GitHub — **production is fine, the backup is not**.
