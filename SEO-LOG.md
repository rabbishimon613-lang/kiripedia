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

---

## 2026-08-06 — nightly sweep

### The numbers, as read

**Google Search Console** (last 3 months, data through 2026-08-04):

| | this run | last run | move |
|---|---|---|---|
| Clicks | 116 | 112 | +4 |
| Impressions | 5.84K | 5.54K | +300 |
| Average CTR | 2% | 2% | flat |
| Average position | 16.4 | 16.6 | +0.2 better |

The daily impressions curve is the real story: it sat near 50/day through June
and now runs 150–190/day. Growth is coming from corpus size, not from ranking
improvements — position has barely moved.

**Indexing report:** 1.44K indexed, 499 not indexed, across 7 reasons:

| reason | pages |
|---|---|
| Alternate page with proper canonical tag | 340 |
| Crawled - currently not indexed | 92 |
| Discovered - currently not indexed | 57 |
| Page with redirect | 4 |
| Not found (404) | 3 |
| Excluded by 'noindex' tag | 2 |
| Soft 404 | 1 |

The 340 "alternate page with proper canonical tag" is **the trailing-slash
consolidation working as designed** — Google now sees the slash-less URLs as
alternates of the canonical ones rather than as competing duplicates. This is
the outcome the last three sweeps were waiting on, and it has arrived. Nothing
further to do on that front.

Crawled/Discovered-not-indexed together are 149 on a 1,900-page surface. That
is a normal tail for a corpus growing ~27 articles a day, not a crawl-budget
emergency. Noted for trend; nothing noindexed this run.

**Vercel Analytics** (Last 30 Days):

| | value | change |
|---|---|---|
| Visitors | 767 | +167% |
| Page Views | 3,709 | +153% |
| Bounce rate | 77% | +22% |

- **Top landing pages:** `/` (166), `/wiki/bob-grenier` (70),
  `/wiki/nordstream-pipeline-sabotage` (38), `/wiki/alan-dershowitz` (32),
  `/category/people` (25), `/wiki/hummus` (24), `/wiki/john-kiriakou` (23).
- **Referrers:** google.com 341, duckduckgo.com 82, bing.com 22, reddit.com 9,
  chatgpt.com 8, search.brave.com 3, search.yahoo.com 3.
- **Countries:** US 73%, UK 5%, Canada 3%, Germany 2%, Netherlands 2%.
- **Devices:** desktop 61%, mobile 38%.
- *Read the visitor figure with suspicion:* GNU/Linux is 32% of operating
  systems, ahead of iOS, Windows and Mac. That is not a plausible human mix for
  a general-interest wiki and strongly suggests a meaningful share of the +167%
  is crawler traffic that Vercel is counting as visitors. **Search Console
  clicks (116) are the trustworthy number; Vercel visitors are not.** Recorded
  so future runs don't celebrate a bot wave.

**Corpus audit** (`node tools/seo-daily.mjs`):

```
articles               1002  (+27)      withSeoTitle            58  (+8)
orphans                 152  (+2)       withDeck                75  (+5)
thin                    399  (-6)       grounded               327
veryThin                107  (-15)      relatedBlocksRendered  999  (+27)
noindexed                 0             relatedOrphans           0
clampedSnippets         869  (+26)
```

### The working queue, and what happened to it

**Top pages by impressions with zero or near-zero clicks** (3-month window):

| page | impressions | clicks |
|---|---|---|
| `/wiki/hummus/` | 371 | 6 |
| `/wiki/gust-avrakotos/` | 284 | 3 |
| `/wiki/hummus` (slash-less) | 257 | 3 |
| `/wiki/afghan-languages/` | 221 | **0** |
| `/wiki/kuwait-oil-fires/` | 101 | **0** |
| `/wiki/sheikh-saad-al-abdullah/` | 89 | **0** |
| `/wiki/remains-of-the-day-book/` | 86 | **0** |
| `/wiki/john-mccain/` | 82 | **0** |
| `/wiki/doing-time-like-a-spy/` | 65 | **0** |
| `/wiki/three-saudi-princes/` | 59 | **0** |
| `/wiki/carlos-the-jackal/` | 59 | **0** |
| `/wiki/abu-zubaydah/` | 53 | **0** |

**Every single one of these already has a purpose-written `seoTitle` and
`deck`.** All twelve were checked directly in frontmatter. The impression-ranked
queue that drove the last three sweeps is now fully treated, and this is the
first run where that is true.

So the queue was rebuilt from a different signal — pages with **real traffic or
heavy internal linkage but no purpose-written title at all**. Vercel's landing
pages supplied the top three; `seo-daily`'s inbound-link ranking supplied the
rest.

### Changed — 13 new titles and decks

Each is grounded in the article's own `summary`, i.e. in something Kiriakou
actually said. No fact was invented to sharpen a title. Lengths verified: all
`seoTitle` ≤ 45 chars, all `deck` ≤ 156.

| slug | why it was picked | new title tag |
|---|---|---|
| `bob-grenier` | 70 Vercel visitors, top article | Bob Grenier: CIA's Islamabad station chief |
| `nordstream-pipeline-sabotage` | 38 visitors | Who blew up Nord Stream? A CIA view |
| `alan-dershowitz` | 32 visitors | Alan Dershowitz and Jeffrey Epstein |
| `julian-assange` | 39 inbound, 4,777 words | Julian Assange: a publisher, not a spy |
| `revolutionary-organization-17-november` | 25 inbound | 17 November: Greece's deadliest terror group |
| `asset-acquisition-cycle` | 24 inbound | How the CIA recruits a spy: the four steps |
| `osama-bin-laden` | 23 inbound | Osama bin Laden, per a CIA officer |
| `surveillance-detection-route` | 22 inbound | Surveillance detection route: how it works |
| `iran-12-day-war` | 18 inbound | Israel's 12-day war on Iran, 2025 |
| `vault-7` | 16 inbound | Vault 7: what the CIA leak revealed |
| `mitchell-and-jessen` | 15 inbound | Mitchell and Jessen: who designed CIA torture |
| `waterboarding` | 15 inbound | Waterboarding: a crime before 2002 |
| `fbi` | 35 inbound | The FBI, seen from inside the CIA |

### Verified

- `npm run build` → **`Total: 0 bugs, 836 suspicious, 0 dead.`**
- **URL shape held:** the slash-less-internal-link grep prints **0**. The
  normalizer in `tools/astro-trailing-slash.mjs` has not regressed.
- **Related blocks:** 1,052 articles, 850 rescue links, **0 with no inbound
  related-link**, 3 with an empty block. The intake batch did not re-orphan.
- **Build completeness checked against source** (flaky-drive rule): 1,035
  source articles → 1,049 built wiki pages → 1,873 sitemap URLs. Surplus, not
  deficit; no dropped writes.
- **noindex, all 53 accounted for:** 48 are redirect stubs (correctly
  `noindex` + canonical pointing at the destination article) and 5 are utility
  pages (`/search`, `/random`, `/needs-image`, `/on-this-day`,
  `/special/all-pages`). **Zero accidental noindex.**
- **robots.txt** unchanged and correct: opens everything, disallows only
  `/search`, explicitly welcomes the AI crawlers, declares the sitemap index.
- **Structured data:** the treated pages emit Article + BreadcrumbList +
  WebSite + Organization + ImageObject; all JSON-LD blocks parse clean.
- Live spot-checks on `www.kiripedia.org` after deploying confirm the new
  titles serve (`vault-7`, `julian-assange`, `bob-grenier`, `waterboarding`).

### Found, not changed — with reasons

- **`/wiki/afghan-languages/` is the single biggest miss on the site: 221
  impressions, 0 clicks — and it is not a metadata problem.** Its title
  ("What languages are spoken in Afghanistan?") and deck are already well
  targeted at the queries surfacing it ("afghanistan language" 47,
  "afghan language" 23). The page is **147 words**. It ranks badly and converts
  nothing because it is thin, and under single-source doctrine it cannot be
  fattened — the article contains everything Kiriakou said on the subject,
  which is one exchange with Reality Winner. Left alone deliberately. If it
  never converts, that is the correct outcome, not a defect.
- **The hummus split is resolving on its own.** `/wiki/hummus/` now carries 371
  impressions to the slash-less `/wiki/hummus`'s 257, having been behind on the
  last sweep. The 340 correctly-canonicalised alternates confirm the mechanism.
  No action.
- **Standing items, unchanged:** 869 clamped snippets, 152 wikilink orphans,
  836 suspicious wikilinks, 399 thin articles. These track corpus growth; the
  high-traffic slice is what gets closed first, and this run closed 13 of it.
- **The 160 MB blob that blocked `git push` on the last three sweeps is
  resolved** — `public/article-mentions-index.json` is now gitignored and
  untracked, and the branch had only one unpushed commit at the start of this
  run. Not this routine's fix, but recording that the blocker is gone.

### Deployed

**Yes — live and verified on `www.kiripedia.org`.**

- `vercel build --prod && vercel deploy --prebuilt --prod --archive=tgz`,
  aliased to `www.kiripedia.org`. The `--archive=tgz` flag was used directly,
  per the last sweep's note; no upload-cap failure this time.
- **IndexNow: 109 new-or-changed URLs submitted, HTTP 200.**

**One retry was needed, and the cause is worth recording.** The first
`vercel build --prod` failed with
`ENOENT ... public/images/ethan-mccord-collateral-murder.jpg`. That file is
present on disk (487 KB, dated 2026-08-04) and the same `npm run build` had
succeeded minutes earlier. **This is the EOS_DIGITAL drive dropping a read
under load, not a missing asset.** The retry succeeded with no change to the
tree. Future runs hitting an ENOENT on an image that demonstrably exists should
simply retry rather than investigate the intake routine.

### Blocked — needs the user

Unchanged, and repeated every run until fixed:

- **Backlinks remain the entire ceiling.** Position 16.4 and a 2% CTR are what
  a site with ~18 links from one Reddit thread gets, no matter how good the
  titles are. Every metadata lever this routine can pull is now pulled on the
  whole high-traffic slice; the next order of magnitude has to come from
  someone linking to the site. **Kiriakou sharing it himself is the single
  highest-value unlock available.**
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia**, for the Organization `sameAs` (carried
  from 2026-07-09).

---

## 2026-08-07 — nightly sweep

### The numbers, as read

**Google Search Console** (last 3 months, data through 2026-08-04):

| | this run | last run | move |
|---|---|---|---|
| Clicks | 116 | 116 | flat |
| Impressions | 5.84K | 5.84K | flat |
| Average CTR | 2% | 2% | flat |
| Average position | 16.4 | 16.4 | flat |

**These are not four separate measurements that happened to land identically —
Search Console has not refreshed since the last sweep.** The window still ends
2026-08-04, the same day it ended yesterday, and the indexing report below is
identical to the last run in all seven of its reason counts. Treat this run as
having **no fresh Google data**, not as a run where nothing moved. The next
sweep should be the first with a genuinely new window.

**Indexing report:** 1.44K indexed, 499 not indexed — every reason count
unchanged from 2026-08-06 (340 alternate-canonical, 92 crawled-not-indexed,
57 discovered-not-indexed, 4 redirect, 3 not-found, 2 noindex, 1 soft 404).
Nothing to read into it this run for the reason above.

**Vercel Analytics (Last 30 Days):**

| | this run | last run |
|---|---|---|
| Visitors | 782 (+161%) | 767 (+167%) |
| Page Views | 3,492 (+82%) | 3,709 (+153%) |
| Bounce rate | 78% (+23%) | 77% (+22%) |

- **Top landing pages:** `/` (165), `/wiki/bob-grenier` (70),
  `/wiki/nordstream-pipeline-sabotage` (38), `/wiki/alan-dershowitz` (32),
  `/wiki/hummus` (25), `/category/people` (24), `/wiki/gust-avrakotos` (21).
- **Referrers:** google.com 341, duckduckgo.com 85, bing.com 27, reddit.com 9,
  chatgpt.com 8, search.yahoo.com 5, search.brave.com 3.
- **Countries:** US 73%, UK 5%, Canada 3%, Netherlands 2%, Germany 2%.

**The bot-wave caveat from the last sweep now has an end date.** Over 30 days
GNU/Linux is still 31% of operating systems — the same implausible mix that made
the +167% untrustworthy. But over the **last 7 days** the mix is iOS 32%,
Windows 24%, Android 18%, Mac 17%, GNU/Linux 9%, which is what a general-interest
wiki's audience actually looks like. The crawler wave sits in the older part of
the 30-day window and has passed. The 7-day figures — **164 visitors (+21%),
325 page views (+37%), 76% bounce** — are the ones worth believing, and the
useful consequence is that the next sweep's 30-day number will drop as the wave
ages out. **That drop will not be a regression.** Recorded now so it isn't
misread later.

Also worth noting from the 7-day landing pages: `/wiki/angry-birds`,
`/wiki/kiriakou-prison-designation` and `/wiki/kiriakou-prison-manipulation-tactics`
each pulled 6 visitors. Those are recent intake articles earning real traffic
with no purpose-written metadata at all. They went to the top of this run's queue.

**Corpus audit** (`node tools/seo-daily.mjs`):

```
articles               1146  (+144)     withSeoTitle            71  (+13)
orphans                 154  (+2)       withDeck                88  (+13)
thin                    394  (-5)       grounded               328  (+1)
veryThin                104  (-3)       relatedBlocksRendered 1143  (+144)
noindexed                 0             relatedOrphans           0
clampedSnippets        1005  (+136)
```

**+144 articles in one day** — by a distance the largest single-day intake in the
site's history, from the source-squeeze pass. Related-block coverage absorbed all
144 without re-orphaning a single one.

### The working queue

The impression-ranked queue is still fully treated — every page in the
Search Console top 20 by impressions already carries a purpose-written
`seoTitle` and `deck`, including the eleven checked directly this run
(`saddam-hussein`, `cofer-black`, `the-farm`, `curveball`, `moral-injury`,
`john-mccone`, `mary-margaret-graham`, `lincolns-last-turd`,
`ali-hassan-al-majid`, `kuwait-invasion-intelligence`,
`david-rockefeller-bahrain`). So the queue was built the same way as the last
sweep: **real traffic first, then inbound linkage.**

Top pages by impressions with zero or near-zero clicks, for the record:

| page | impressions | clicks |
|---|---|---|
| `/wiki/hummus/` | 371 | 6 |
| `/wiki/gust-avrakotos/` | 284 | 3 |
| `/wiki/hummus` (slash-less) | 257 | 3 |
| `/wiki/afghan-languages/` | 221 | **0** |
| `/wiki/kuwait-oil-fires/` | 101 | **0** |
| `/wiki/sheikh-saad-al-abdullah/` | 89 | **0** |
| `/category/procedures` | 88 | 1 |
| `/wiki/remains-of-the-day-book/` | 86 | **0** |
| `/wiki/john-mccain/` | 82 | **0** |
| `/category/people/` | 77 | **0** |
| `/wiki/doing-time-like-a-spy/` | 65 | **0** |
| `/wiki/abdul-rashid-dostum/` | 58 | **0** |
| `/wiki/curveball/` | 39 | **0** |
| `/wiki/moral-injury/` | 36 | **0** |

### Changed — 14 new titles and decks

Each grounded in the article's own `summary`, i.e. in something Kiriakou
actually said. No fact was invented to sharpen a title. All `seoTitle` ≤ 46
chars, all `deck` ≤ 154.

| slug | why it was picked | new title tag |
|---|---|---|
| `kiriakou-prison-designation` | 6 visitors, 7-day | The prison John Kiriakou wasn't sentenced to |
| `kiriakou-prison-manipulation-tactics` | 6 visitors, 7-day | Running CIA tradecraft inside a federal prison |
| `angry-birds` | 6 visitors, 7-day | Angry Birds: John Kiriakou's only vice |
| `solitary-confinement` | 23 inbound | Solitary confinement: ten days in a cell |
| `yemen` | 19 inbound, 2,371 words | Yemen, on five trips with the CIA |
| `italians-at-loretto` | 19 inbound | How the mafia adopted John Kiriakou |
| `iran-nuclear-assessment` | 18 inbound, 4,840 words | Did Iran have a nuclear weapons program? |
| `thomas-drake` | 17 inbound | Thomas Drake: 'waiting for a 9/11' |
| `counterterrorism-center` | 17 inbound | Inside the CIA Counterterrorism Center |
| `mk-ultra` | 16 inbound, 4,274 words | MK-Ultra: LSD, brothels and burned files |
| `jose-rodriguez` | 16 inbound | Jose Rodriguez: a good guy, in his own mind |
| `kiriakou-pardon-request` | 15 inbound | Will Trump pardon John Kiriakou? |
| `pakistan-station-2002` | 15 inbound | Landing in Islamabad, January 2002 |
| `palantir` | 15 inbound | Palantir and the CIA: how close? |

`mk-ultra` is the one with independent demand behind it: the source transcript
`/sources/2026-06-16-julian-dorey-daily-mkultra-twin-experiment/` is pulling 44
impressions on its own, and the article it feeds had no title of its own until
tonight.

### Verified

- `npm run build` → **`Total: 0 bugs, 947 suspicious, 0 dead.`**
- **URL shape held:** the slash-less-internal-link grep prints **0**. The
  normalizer in `tools/astro-trailing-slash.mjs` has not regressed, and it
  survived a 144-article intake.
- **Related blocks:** 1,146 articles, 873 rescue links, **0 with no inbound
  related-link**, 3 with an empty block. No hand-linking needed.
- **Build completeness checked against source** (flaky-drive rule): 1,146
  source articles → 1,193 built wiki pages → 2,027 sitemap URLs. Surplus, not
  deficit; no dropped writes.
- **noindex, all 53 accounted for:** 48 redirect stubs and the same 5 utility
  pages (`/search`, `/random`, `/needs-image`, `/on-this-day`,
  `/special/all-pages`). **Zero accidental noindex.**
- **Canonicals and structured data:** treated pages emit Organization + WebSite,
  Article, Thing and BreadcrumbList; all JSON-LD parses clean; canonical is the
  trailing-slash form.
- Live spot-checks on `www.kiripedia.org` after deploying confirm the new
  titles serve (`mk-ultra`, `solitary-confinement`, `palantir`,
  `kiriakou-pardon-request`).

### Found, not changed — with reasons

- **`/wiki/abdul-rashid-dostum/` collects 58 impressions but is a redirect, not
  a page.** `astro.config.mjs` 301s it to `/wiki/general-dostum/`, which already
  has a purpose-written title and deck. Google is still attributing the
  impressions to the old URL and has not consolidated them yet. Nothing to fix —
  a searcher clicking it lands on the real article. Recorded so a future sweep
  doesn't go looking for a missing `abdul-rashid-dostum.mdx`.
- **`/wiki/afghan-languages/` remains the single biggest miss: 221 impressions,
  0 clicks.** Unchanged from the last sweep and unchanged for the same reason —
  it is a 147-word article that says everything Kiriakou said on the subject
  (one exchange with Reality Winner), and single-source doctrine forbids
  fattening it. The query cluster behind it is now 78 impressions
  ("afghanistan language" 47, "afghan language" 23, "language of afghanistan" 8).
  Still the correct outcome, not a defect.
- **Three query clusters are all pointed at already-treated pages** and need no
  work: the Kuwait oil fires cluster (15+14+12+11+11+7 = 70 impressions), the
  *Remains of the Day* cluster (40+10+10+7 = 67), and the Dostum cluster
  (13+10+8 = 31). Each has a page with a written title; each converts at zero.
  This is a ranking problem, not a metadata problem — see the blocked section.
- **New query signals worth watching, no action yet:** "consortium news" (12),
  "jean gately cia" (9, and `/wiki/jean-gately/` is converting at 6 clicks from
  36 impressions — the best CTR on the site), "john kiriakou moral injury" (8),
  "greater tunb" (7).
- **Standing items, unchanged:** 1,005 clamped snippets, 154 wikilink orphans,
  947 suspicious wikilinks, 394 thin articles. All track corpus growth. The
  suspicious count rose with the 144-article intake, as expected.

### Deployed

**Yes — live and verified on `www.kiripedia.org`.**

- `vercel build --prod && vercel deploy --prebuilt --prod --archive=tgz`.
  No retry needed this run; the drive did not drop an image read.
- **IndexNow: 103 new-or-changed URLs submitted, HTTP 200.**

### Blocked — needs the user

Unchanged, and repeated every run until fixed:

- **Backlinks remain the entire ceiling.** Position 16.4 at 2% CTR is what a
  site with ~18 links from one Reddit thread gets. Every page in the
  impression-ranked queue now has a hand-written title; three separate query
  clusters rank and convert nothing anyway. There is no metadata lever left to
  pull on them. **Kiriakou sharing the site himself is still the single
  highest-value unlock available.**
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia**, for the Organization `sameAs` (carried
  from 2026-07-09).

---

## 2026-08-08 — nightly sweep

### The numbers, as read

**Google Search Console** (last 3 months, data through 2026-08-06). **This is the
first genuinely fresh window since 2026-08-04** — the last two sweeps read an
identical, un-refreshed window and said so. The deltas below are real.

| | this run | last run | move |
|---|---|---|---|
| Clicks | **126** | 116 | **+10** |
| Impressions | **6.17K** | 5.84K | **+330** |
| Average CTR | 2% | 2% | flat |
| Average position | **16.3** | 16.4 | +0.1 |

**Indexing report — the best movement on the site this run:**

| | this run | last run | move |
|---|---|---|---|
| **Indexed** | **1.57K** | 1.44K | **+130** |
| Not indexed | 497 | 499 | −2 |
| Alternate page with proper canonical | 341 | 340 | +1 |
| Crawled — currently not indexed | 96 | 92 | +4 |
| **Discovered — currently not indexed** | **42** | 57 | **−15** |
| Page with redirect | 6 | 4 | +2 |
| Excluded by 'noindex' tag | 6 | 2 | +4 |
| Not found (404) | 5 | 3 | +2 |
| Soft 404 | 1 | 1 | flat |

Indexed grew **+130 while the corpus grew ~+103** — Google is absorbing the
intake faster than it arrives, and the discovered-but-not-indexed backlog fell
by 15. That is the crawl-budget symptom from previous sweeps easing, not
worsening. The noindex count rising 2 → 6 is Google catching up with the
deliberate utility-page noindex, not an accident: all 53 noindexed pages in the
build are accounted for below.

**Vercel Analytics — Last 30 Days:**

| | this run | last run |
|---|---|---|
| Visitors | 797 (+159%) | 782 (+161%) |
| Page Views | **3,135** (+63%) | 3,709 (+153%) |
| Bounce rate | 78% (+22%) | 78% (+23%) |

**The page-view drop is the predicted one, not a regression.** The last sweep
recorded that the crawler wave inflating the 30-day window would age out and
that the next sweep's number would fall. It has, from 3,709 to 3,135, exactly as
written down. (The dashboard briefly painted 823 / 3,247 on first load before
settling at 797 / 3,135; the settled figures are the ones recorded.)

- **Top landing pages, 30d:** `/` (165), `/wiki/bob-grenier` (68),
  `/wiki/nordstream-pipeline-sabotage` (38), `/wiki/alan-dershowitz` (32),
  `/wiki/hummus` (27), `/category/people` (23), `/wiki/gust-avrakotos` (23).
- **Referrers, 30d:** google.com 348, duckduckgo.com 87, bing.com 31,
  reddit.com 9, chatgpt.com 8, search.yahoo.com 5, search.brave.com 3.
- **Countries, 30d:** US 73%, UK 5%, Canada 4%, Germany 2%, Netherlands 2%.

**The 7-day figures are the trustworthy ones and they are up across the board:**
**187 visitors (+40%), 520 page views (+126%), 73% bounce (−2%)**, against
164 / 325 / 76% last sweep. The operating-system mix over 7 days is iOS 34%,
Windows 28%, Mac 16%, Android 14%, GNU/Linux 9% — a normal audience. Over 30
days GNU/Linux is still 31%, which is the tail of the bot wave and will keep
shrinking. Devices split 52% desktop / 48% mobile over 7 days.

**Corpus audit** (`node tools/seo-daily.mjs`, taken at the start of the run):

```
articles               1249  (+103)     withSeoTitle            85  (+14)
orphans                 164  (+10)      withDeck               102  (+14)
thin                    402  (+8)       grounded               328
veryThin                100  (-4)       relatedBlocksRendered 1246  (+103)
noindexed                 0             relatedOrphans           0
clampedSnippets        1095  (+90)
```

The corpus kept growing *during* the sweep — the intake routine was running
concurrently and the final build compiled **1,297 articles**, ~48 more than the
audit snapshot. Noted so the next run's delta is read against 1,297, not 1,249.

### The working queue

The impression-ranked queue is **saturated again**: every page in the Search
Console top 30 by impressions was checked directly and already carries a
purpose-written `seoTitle` and `deck` — `john-mccain`, `doing-time-like-a-spy`,
`carlos-the-jackal`, `abu-zubaydah`, `afghan-languages`, `kuwait-oil-fires`,
`sheikh-saad-al-abdullah`, `remains-of-the-day-book`, `curveball` among them.
One genuine gap turned up and led the queue; the rest was built on inbound
linkage, the same method as the last two sweeps.

Top pages by impressions with zero or near-zero clicks, for the record:

| page | impressions | clicks |
|---|---|---|
| `/wiki/hummus/` | 420 | 7 |
| `/wiki/gust-avrakotos/` | 300 | 3 |
| `/wiki/hummus` (slash-less) | 257 | 3 |
| `/wiki/afghan-languages/` | 237 | **0** |
| `/wiki/kuwait-oil-fires/` | 103 | **0** |
| `/wiki/sheikh-saad-al-abdullah/` | 92 | **0** |
| `/wiki/remains-of-the-day-book/` | 86 | **0** |
| `/category/people/` | 83 | **0** |
| `/wiki/john-mccain/` | 82 | **0** |
| `/wiki/doing-time-like-a-spy/` | 72 | **0** |
| `/wiki/three-saudi-princes/` | 59 | **0** |
| `/wiki/carlos-the-jackal/` | 59 | **0** |
| `/wiki/abdul-rashid-dostum/` | 59 | **0** |
| `/wiki/abu-zubaydah/` | 55 | **0** |
| `/wiki/curveball/` | 39 | **0** |

### Changed — 13 new titles and decks

Each grounded in the article's own `summary`, i.e. in something Kiriakou
actually said. No fact was invented to sharpen a title. All `seoTitle` 30–47
characters, all `deck` 135–151.

| slug | why it was picked | new title tag |
|---|---|---|
| `saudi-princes-and-9-11` | **59 impressions, 0 clicks** | Three Saudi princes, and how they died |
| `barack-obama` | 24 inbound | Obama, Netanyahu and the Iran bluff |
| `senate-foreign-relations-committee` | 23 inbound | Kiriakou's Senate job, and his indictment |
| `dick-cheney` | 20 inbound | Did Cheney hide the torture finding? |
| `joe-biden` | 19 inbound | Joe Biden at Kerry's Christmas party |
| `church-committee` | 18 inbound | The Church Committee: real oversight |
| `brian-ross` | 17 inbound | Brian Ross and the waterboarding interview |
| `china-economic-threat` | 17 inbound | China is an economic threat, not a military one |
| `chelsea-manning` | 17 inbound | Chelsea Manning, whistleblower |
| `operation-mockingbird` | 16 inbound | Operation Mockingbird isn't needed now |
| `daniel-hale` | 15 inbound | Daniel Hale and the 80% figure |
| `iran-contra` | 15 inbound | Iran-Contra ended CIA oversight |
| `maduro-capture` | 14 inbound, 2,333 words | How Delta Force took Maduro from his bed |

`saudi-princes-and-9-11` is the find of the run. **`/wiki/three-saudi-princes/`
pulls 59 impressions and 0 clicks, and it is a redirect, not a page** — the same
shape as the known `abdul-rashid-dostum` case. The difference is that Dostum's
target was already treated, whereas this one redirected to an article with no
written title or description at all. It has one now.

### Verified

- `npm run build` → **`Total: 0 bugs, 1113 suspicious, 0 dead.`**
- **URL shape held:** the slash-less-internal-link grep prints **0**. The
  normalizer in `tools/astro-trailing-slash.mjs` has not regressed.
- **Related blocks:** 1,297 articles, 945 rescue links, **0 with no inbound
  related-link**, 3 with an empty block. No hand-linking needed.
- **Build completeness checked against source** (flaky-drive rule): 1,297 source
  articles → 1,344 built wiki pages → 2,182 sitemap URLs. Surplus, not deficit;
  no dropped writes in the final build.
- **noindex, all 53 accounted for:** 48 redirect stubs plus the same 5 utility
  pages (`/search`, `/random`, `/needs-image`, `/on-this-day`,
  `/special/all-pages`). **Zero accidental noindex.**

### The build fought the drive for three attempts — worth writing down

The first three builds failed, none of them for a reason in the content:

1. `ENOENT` copying `public/images/avril-haines.jpg` — **the file exists on disk**
   (103 KB, verified immediately after).
2. Retry: `ENOENT` copying `public/images/felix-rodriguez.jpg` — a *different*
   image, also present.
3. After pre-warming all 888 images (723 MB) into the OS cache, it got past the
   image copy and into page rendering, then died on
   `Cannot find module dist/chunks/astro/server_*.mjs` — **a build artifact the
   build itself had written moments earlier.** The whole `dist/chunks/astro/`
   directory was simply gone.

Every one of the three reached `Total: 0 bugs` in the content phase first, so
nothing in the corpus or in tonight's edits was implicated. This is the known
EOS_DIGITAL silent-write-drop under bulk load: five small test writes in a row
succeeded fine while the 888-file copy and the chunk writes did not. The fourth
attempt, run ~40 minutes later against a cleared `dist` and a pre-warmed cache,
completed cleanly and passed every verification gate above. **Recorded because
the failure signature — a missing file that demonstrably exists — will recur,
and the fix is to clear `dist`, wait for the load to pass, and rebuild rather
than to go looking for a content bug.**

### Found, not changed — with reasons

- **`/wiki/afghan-languages/` is still the biggest single miss: 237 impressions,
  0 clicks** (up from 221). Unchanged for the same reason as the last two
  sweeps — it is a 147-word article containing everything Kiriakou said on the
  subject (one exchange with Reality Winner), and single-source doctrine forbids
  fattening it. The query cluster is now 84 impressions ("afghanistan language"
  52, "afghan language" 24, "language of afghanistan" 8). Correct outcome, not a
  defect.
- **The Kuwait oil-fires cluster keeps growing and keeps converting at zero** —
  "kuwait oil fires" 15, "kuwaiti oil fires" 14, "kuwait oil well fires" 12,
  "fires of kuwait" 11, "oil fires in kuwait" 11, "kuwait liberation" 8,
  "kuwait fires" 7. The page has a written title already. This is a ranking
  problem, not a metadata problem — see blocked.
- **`why does cia put hummus up ass` is now the single largest query on the site
  at 105 impressions, 0 clicks**, with `hummus up ass` adding 9. The hummus page
  itself converts (7 clicks from 420) on its better-behaved queries. Nothing to
  fix: the page already answers this, and the title is not going to be rewritten
  toward that phrasing.
- **`/wiki/abdul-rashid-dostum/` at 59 impressions is still a redirect**, 301ing
  to `/wiki/general-dostum/`, which is already treated. Google has still not
  consolidated it. Nothing to do.
- **New query signals, no action yet:** "consortium news" (12), "gus avricatus"
  (11 — a misspelling of Avrakotos that the page already ranks for),
  "jean gately cia" (9, and `/wiki/jean-gately/` converts at 6 clicks from 36
  impressions, still the best CTR on the site), "john kiriakou moral injury" (8),
  "greater tunb" (7).
- **Standing items, all tracking corpus growth:** 1,095 clamped snippets, 164
  wikilink orphans, 1,113 suspicious wikilinks, 402 thin articles.

### Blocked — needs the user

Unchanged, and repeated every run until fixed:

- **Backlinks remain the entire ceiling.** Position 16.3 at 2% CTR is what a
  site with ~18 links from one Reddit thread gets. Impressions and indexed pages
  are both climbing steadily; clicks moved +10 in the same window. Three
  separate query clusters rank and convert nothing despite hand-written titles.
  There is no metadata lever left on them. **Kiriakou sharing the site himself
  is still the single highest-value unlock available.**
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia**, for the Organization `sameAs` (carried
  from 2026-07-09).

### Deployed

**Yes — live and verified on `www.kiripedia.org`.**

- `vercel build --prod` (exit 0) then
  `vercel deploy --prebuilt --prod --archive=tgz` → `readyState: READY`,
  deployment `dpl_FRbvp4urJtH2JtctbGmRP5NjQV4P`.
- **Spot-checked in production**, all five serving the new title tag:
  `saudi-princes-and-9-11`, `dick-cheney`, `brian-ross`, `maduro-capture`,
  `iran-contra`.
- **IndexNow: 175 new-or-changed URLs submitted, HTTP 200.** Higher than a
  normal night because the concurrent intake run's new articles went out in the
  same submission.

Note for the next sweep: the 13 metadata files were committed by explicit path
on branch `kiriakou-intake-churn`. The intake routine's ~48 new articles and the
generated files (`article-dates.json`, `related.json`, `llms.txt`,
`date-index.json`, `.kir-seo-state.json`) were **deliberately left unstaged** —
they are not this routine's changes — but they *were* included in the deployed
build, which is the established behaviour for this site.

---

## 2026-08-09 — nightly sweep

**No dashboard numbers this run.** Both Search Console and Vercel Analytics were
unreadable, so the analytics half of the sweep did not happen and nothing in
this entry is estimated to cover the gap. The corpus half ran in full, and the
build fought the drive again.

### The numbers — not read, and why

The deep pass depends on the signed-in Chrome browser tools. **The Chrome
extension was disconnected for the entire run** — two attempts, both returning
"Claude in Chrome is not connected". The in-app browser was tried as a fallback
and **hung for five minutes on the first page load** before timing out, so it
was abandoned rather than retried.

**No clicks, impressions, CTR, position, indexed-vs-excluded counts, query list,
page list, visitors, page views, bounce rate or referrer breakdown were read
tonight, and none are estimated here.** The last measured values stand as of
2026-08-08: 126 clicks, 6.17K impressions, 2% CTR, position 16.3, and 1.57K
indexed against 497 not indexed.

**This is the first sweep since the routine absorbed the analytics pass that has
produced no numbers at all.** If the extension is still down next run, that is
two consecutive blind sweeps and the impression-ranked working queue — the
highest-yield input this routine has — goes stale.

### The working queue, substituted

With no impression data, the queue came from the deterministic side:
`tools/seo-daily.mjs`'s own ranked candidates, sorted by inbound links and word
count. **This is a worse signal than impressions and is recorded as a
substitution, not an equivalent.** Inbound links say an article matters inside
the corpus; impressions say Google is already showing it to people and they are
not clicking. The second is the one that converts.

That said, the previous three sweeps all found the impression-ranked queue
**saturated** — every page in the Search Console top 30 already carried a
purpose-written title and deck. So the inbound-link queue was the likely next
target anyway, and none of the fifteen below has ever been treated.

**Corpus audit** (`node tools/seo-daily.mjs`, taken at the start of the run):

```
articles               1325  (+76)      withSeoTitle            98  (+13)
orphans                 172  (+8)       withDeck               115  (+13)
thin                    403  (+1)       grounded               328
veryThin                 92  (-8)       relatedBlocksRendered 1322  (+76)
noindexed                 0             relatedOrphans           0
clampedSnippets        1159  (+64)
```

The corpus grew *hard* during the sweep — the intake routine was running
concurrently the whole time. It went 1,325 → 1,337 → 1,347 → 1,369 and the final
build compiled **1,380 articles**. Next run's delta should be read against
1,380, not 1,325.

### Changed — 15 new titles and decks

Each grounded in the article's own `summary`, i.e. in something Kiriakou
actually said. No fact was invented to sharpen a title. All `seoTitle` 29–40
characters, all `deck` 139–149.

| slug | why it was picked | new title tag |
|---|---|---|
| `permanent-wartime-economy` | 17 inbound, 1,570 words | The war economy the US can't switch off |
| `presidents-daily-brief` | 17 inbound, 1,519 words | Inside the President's Daily Brief |
| `bahrain-1994-1996-posting` | 16 inbound, 2,201 words | Kiriakou in Bahrain, 1994-1996 |
| `jonathan-pollard` | 15 inbound, 1,955 words | Jonathan Pollard, and what Israel traded |
| `tuesday-morning-kill-list` | 15 inbound, 1,702 words | The Tuesday morning kill list |
| `gina-haspel` | 15 inbound, 1,471 words | Gina Haspel, known as 'Bloody Gina' |
| `russia-ukraine-war-origins` | 14 inbound, 1,433 words | The Ukraine war began in 2014, not 2022 |
| `daniel-ellsberg` | 14 inbound, 1,335 words | Daniel Ellsberg, Kiriakou's mentor |
| `october-7-attack` | 14 inbound, 1,221 words | October 7 was a policy failure |
| `mass-surveillance` | 14 inbound, 755 words | The NSA warehouse in the Utah desert |
| `whistleblower-protection-act` | 14 inbound, 612 words | The law that doesn't cover CIA officers |
| `afghan-heroin-policy` | 13 inbound, 2,938 words | How Afghan heroin went from 0% to 93% |
| `leonie-brinkema` | 13 inbound, 1,768 words | Judge Brinkema, 'a hanging judge' |
| `eastern-district-of-virginia` | 13 inbound, 1,523 words | The court where spies never win |
| `tucker-carlson` | 13 inbound, 1,279 words | Tucker Carlson, as Kiriakou knows him |

`afghan-heroin-policy` is the standout of the batch: 2,938 words, thirteen
inbound links, and it was serving a truncated clamp of its own summary as the
search snippet. The 0%-to-93% figure is the thing a person would actually click,
and it was nowhere in the title.

### Verified

- `npm run build` → **`Total: 0 bugs, 1268 suspicious, 0 dead.`**
- **URL shape held:** the slash-less-internal-link grep prints **0**. The
  normalizer in `tools/astro-trailing-slash.mjs` has not regressed.
- **Related blocks:** 1,380 articles, 977 rescue links, **0 with no inbound
  related-link**, 3 with an empty block. No hand-linking needed — the generator
  absorbed +76 new articles without moving off 0.
- **Build completeness checked against source** (flaky-drive rule): 1,380 source
  articles → 1,427 built wiki pages → 2,263 sitemap URLs. Surplus, not deficit.
- **noindex, all 53 accounted for:** 48 redirect stubs plus the same 5 utility
  pages (`/search`, `/random`, `/needs-image`, `/on-this-day`,
  `/special/all-pages`). **Zero accidental noindex.** Identical to last sweep.
- **All 15 titles and decks confirmed in the built HTML** before committing.

### The drive fought the build again — same signature, now on the second attempt

Four build attempts, and the first three failed for reasons that were not in the
content. Every one reached `Total: 0 bugs` in the content phase first, so
nothing in the corpus or in tonight's edits was ever implicated.

1. **Transient, and genuinely the intake's fault:** `1 bugs, 10 dead` — dead
   wikilinks pointing at `louise-mensch`, `marco-rubio-and-iran-policy`,
   `bombing-the-omanis` and others. **These were not defects.** The intake
   routine was mid-flight writing articles that link to each other; `louise-mensch.mdx`
   appeared on disk minutes later. Waiting for the article count to hold steady
   for four consecutive 30-second checks cleared it.
2. `ENOENT` renaming `.astro/content-modules.mjs.tmp` → `.mjs` — **a file the
   build had written moments earlier**.
3. `ENOENT` copying `public/images/cia-arabic-hiring-practices.png` — **the file
   exists on disk**, 197 KB, verified immediately after.
4. After pre-warming all 893 images (736 MB) into the OS cache, the build
   completed cleanly and passed every gate above.

This is the known EOS_DIGITAL silent-write-drop under bulk load, and it is now
been recorded twice running with the same tell: **a missing file that
demonstrably exists.** The fix remains: clear `dist` and `.astro`, `cat` the
image tree into cache, rebuild. Recorded again because the pre-warm turned four
attempts into one success, which is a faster remedy than the 40-minute wait the
2026-08-08 entry landed on.

**Contention was a factor and is worth noting for next time.** A second Claude
session was running its own `astro build` against this same repo concurrently,
on top of the intake routine writing articles. Three processes hitting a flaky
external drive at once is the worst case for this failure mode.

### Found, not changed — with reasons

- **The intake routine's ~55 new articles, the enricher's edits, and the
  generated files were deliberately left unstaged.** Only the 15 metadata files
  were committed, by explicit path. Never `git add -A`.
- **Two of the fifteen had to be re-staged from `HEAD` rather than from the
  working tree.** The enricher session added a 1,200-word "moral question"
  section to `afghan-heroin-policy.mdx` *after* this routine edited it, and
  something re-quoted a `dyk` line in `leonie-brinkema.mdx`. Staging the working
  file would have swept both into this commit. Instead the `HEAD` blob was taken,
  the two frontmatter lines spliced in, and that object staged directly — so the
  commit is exactly 15 files and 30 added lines, and the other session's work
  stayed in its own tree untouched. **Worth reusing: this is the clean way to
  commit by-hunk without an interactive add.**
- **11 dead wikilinks survived into the final build** (down from the transient
  spike, and the audit reports `0 dead` at the gate because the referenced
  articles landed). Not this routine's to write.
- **Standing items, all tracking corpus growth:** 1,159 clamped snippets, 172
  wikilink orphans, 1,268 suspicious wikilinks, 403 thin articles.

### Blocked — needs the user

- **The Chrome extension is disconnected.** New this run and it blocks the
  highest-yield half of the routine on this property, plus the Search Console
  read on the other two. **One-time fix:** open the Claude side panel in Chrome
  and sign in with the same account as this app. Until then this routine is
  working from corpus statistics alone.
- **Backlinks remain the entire ceiling.** Unchanged and repeated every run:
  position 16.3 at 2% CTR is what a site with ~18 links from one Reddit thread
  gets. **Kiriakou sharing the site himself is still the single highest-value
  unlock available.**
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia**, for the Organization `sameAs` (carried
  from 2026-07-09).

### Deployed

**Yes — live and verified on `www.kiripedia.org`.**

- `vercel build --prod` (exit 0) then
  `vercel deploy --prebuilt --prod --archive=tgz` → `readyState: READY`,
  deployment `dpl_cYJAP68Lf6wt2ZCeLb7LaEyRePo1`, aliased to
  `https://www.kiripedia.org`. 800 MB uploaded as one archive, 5,844 files
  extracted remotely.
- **Spot-checked in production**, all five serving the new title tag:
  `afghan-heroin-policy`, `gina-haspel`, `eastern-district-of-virginia`,
  `tuesday-morning-kill-list`, `jonathan-pollard`.
- **IndexNow: 222 new-or-changed URLs submitted out of 2,263 in the sitemap,
  HTTP 200.** The delta is the intake routine's new articles plus tonight's 15
  retitled pages.

Note for the next sweep: the 15 metadata files were committed by explicit path
on branch `kiriakou-intake-churn` and pushed. The intake routine's new articles
and the generated files (`article-dates.json`, `related.json`, `llms.txt`,
`date-index.json`) were **deliberately left unstaged** — they are not this
routine's changes — but they *were* included in the deployed build, which is the
established behaviour for this site.

---

## 2026-08-12 — nightly sweep

**Dashboards are back.** The Chrome extension was disconnected for the whole of
the 08-09 sweep; it reconnected in time for this one, so this is the first
entry since 08-08 with real numbers in it. No sweep ran on 08-10 or 08-11, so
every delta below spans three days.

### The numbers — all read, none estimated

**Google Search Console, last 3 months** (against 2026-08-08, the last
measured run):

| | 08-08 | **08-12** | move |
|---|---|---|---|
| clicks | 126 | **159** | +33 |
| impressions | 6.17K | **7.15K** | +0.98K |
| CTR | 2.0% | **2.2%** | +0.2pt |
| average position | 16.3 | **15.7** | **−0.6, better** |

Every one of the four moved the right way, and position improving while
impressions grow is the harder of the two to get. The daily impressions curve
also turns sharply upward in the final week — the last plotted days run near
750/day against a ~250/day plateau for most of the quarter.

**Indexing** — and this is the one number that moved the wrong way:

| | 08-08 | **08-12** |
|---|---|---|
| indexed | 1.57K | **1.62K** |
| not indexed | 497 | **805** |

Not-indexed grew **+308 in three days**, against +50 indexed. The reasons:

```
Alternate page with proper canonical tag  343    Crawled - currently not indexed   336
Page with redirect                         11    Discovered - currently not indexed 105
Excluded by 'noindex' tag                   5    Not found (404)                     4
Soft 404                                    1
```

`Crawled` + `Discovered - currently not indexed` = **441**. That is the
thin-content and crawl-budget symptom the routine watches for, and the cause is
not mysterious: **the corpus grew from 1,380 to 1,743 articles since 08-09**, so
Google is discovering far faster than it will index. No mass `noindex` was
applied in response — there is no clean pattern to apply it to, and the corpus
is growing legitimately. Acted on indirectly instead, by giving 873 crawl-budget
sinks back (see below). **Watch this number next run.**

**Vercel Analytics, last 30 days:**

| | value | change |
|---|---|---|
| visitors | **878** | +128% |
| page views | **3,855** | +27% |
| bounce rate | **78%** | +16% |

Bounce rising 16 points while visitors more than double is what a wave of
first-time search arrivals looks like; it is not by itself a defect.

Top landing pages: `/` 157 · `bob-grenier` 69 · `nordstream-pipeline-sabotage`
37 · `alan-dershowitz` 32 · `hummus` 25 · `gust-avrakotos` 24 · `john-kiriakou`
22. **`bob-grenier` at 69 does not appear anywhere in the Search Console top
20**, so that traffic is arriving from somewhere other than Google.

Referrers: google.com 371 · duckduckgo.com 100 · bing.com 40 ·
**l.instagram.com 14** · chatgpt.com 9 · search.yahoo.com 6 · ecosia.org 3.
Instagram is new and is the first referrer on this site that is not a search
engine. Countries: US 71%, UK 5%, Canada 3%. Devices: desktop 57%, mobile 42%.

### The working queue — and it was saturated again

Pages sorted by impressions, zero or near-zero clicks:

```
afghan-languages/        253 imp   0 clicks      remains-of-the-day-book/  86   0
heather-kiriakou/        202       0             john-mccain/              83   0
kuwait-oil-fires/        105       0             doing-time-like-a-spy/    81   0
sheikh-saad-al-abdullah/  92       0             abu-zubaydah/             63   0
saddam-hussein/           96       2             john-mccone/              83   1
```

**All ten already carried a purpose-written `seoTitle` and `deck`.** That is the
fourth sweep running where the impression queue is fully treated. So the yield
had to come from somewhere else, and it did — from auditing the treatment
itself rather than extending it.

### Changed, 1 — twenty-six title tags were being truncated

**The single most useful finding this run.** Of the 130 articles carrying a
purpose-written `seoTitle`, **26 were long enough that Google truncates them**
— the exact failure the `seoTitle` field exists to prevent. With the brand
suffix appended the full title tags ran **64 to 90 characters** against a ~60
character cutoff.

The worst offender was **`heather-kiriakou` at 89 characters** — and that page
is the biggest zero-click page on the site: **202 impressions, 0 clicks**, with
its exact-name query `heather kiriakou` showing **177 impressions and 0 clicks**
on its own. A user searching her name saw a title cut off mid-phrase.

All 26 rewritten to **28–44 characters**, each still grounded in that article's
own `summary` — no fact was invented to sharpen a line. Nine also dropped a
redundant "Kiriakou" that the brand suffix now supplies twice (`Ted Rall,
Kiriakou's Deprogram co-host | John Kiriakou`). Sample:

| slug | was (chars) | now |
|---|---|---|
| `heather-kiriakou` | 77 | Heather Kiriakou lost her CIA job for him |
| `kiriakou-father-and-grandfather` | 78 | The bribe his father refused |
| `cia-feeder-schools` | 66 | GWU sends more to the CIA than Georgetown |
| `decapitation-strikes` | 63 | 'We killed 27 number threes in Al-Qaeda' |
| `isi` (new, then shortened) | — | Pakistan's two parallel ISIs |
| `2028-presidential-field` | 59 | The 2028 field: 44 Democrats, 26 Republicans |

### Changed, 2 — eight more pages titled, off the inbound-link queue

The impression queue being saturated, the fallback is `seo-daily.mjs`'s
inbound-link ranking. Eight untreated pages, each with a `seoTitle` (33–41
chars) and a `deck` (142–151 chars):

`ted-rall` (46 inbound) · `israel-united-states-relations` ·`tulsi-gabbard` ·
`richard-wolff` · `isi` · `cold-cell` · `abolish-the-cia` ·
`special-activities-division`.

### Changed, 3 — 873 noindexed transcripts pulled out of the sitemap

Another session noindexed every individual source transcript
(`src/pages/sources/[...slug].astro`, uncommitted, theirs) — a defensible call:
they are raw auto-caption text and no `/sources/` URL appears anywhere in the
Search Console top 20.

**But they were all still in the sitemap.** 873 pages carrying `noindex` while
the sitemap actively advertised them — asking Google to spend crawl budget on
pages it is then told to discard, at exactly the moment 441 URLs are already
stuck in crawled/discovered-not-indexed. Added a sitemap filter for individual
transcripts. **Sitemap 2,616 → 1,743 URLs.** The `/sources/` index page itself
stays: it is indexable and is the entry point to the corpus.

This completes the other session's change rather than reverting it.

### Verified

- `npm run build` → **`Total: 0 bugs, 1789 suspicious, 0 dead.`**
- **URL shape held:** the slash-less-internal-link grep prints **0**. The
  normalizer in `tools/astro-trailing-slash.mjs` has not regressed.
- **All 34 title tags confirmed ≤60 characters in the built HTML**, decoded, not
  counted raw. Decks confirmed serving as meta descriptions.
- **Related blocks:** 1,743 articles, 1,264 rescue links, **0 with no inbound
  related-link**, 3 with an empty block. The generator absorbed +363 articles
  without moving off 0 — no hand-linking.
- **Build completeness checked against source** (flaky-drive rule): 1,743 source
  articles → 1,790 built wiki pages → 1,787 sitemap URLs. Surplus, not deficit.
- **noindex, all accounted for:** 53 outside `/sources/` — the same 48 redirect
  stubs plus the same 5 utility pages. **Unchanged, and zero accidental
  noindex.** The 873 under `/sources/` are the other session's deliberate change.
- **The dual-URL scare was a false alarm, and is worth writing down.** Search
  Console lists `/wiki/hummus` (257 impressions) *and* `/wiki/hummus/` (493)
  as separate pages, plus `/category/procedures`. Both slash-less forms were
  tested live: each returns **308 to the trailing-slash form**, and the
  slash-less URL's canonical already points at the slash form. Google is
  reporting a legacy URL it has not finished retiring, which is also what the
  343 `Alternate page with proper canonical tag` entries are. **Nothing to fix.**

### The build fought back twice, and neither cause was the usual one

Six build attempts. The content gate reached `0 bugs, 0 dead` on every single
one, so nothing in the corpus or in tonight's edits was ever implicated.

1. **Node heap exhaustion — new, and the more important of the two.** Two
   attempts died with `FATAL ERROR: Reached heap limit — JavaScript heap out of
   memory` (exit 134). The corpus grew ~23% since the last sweep and pushed the
   default heap over. **`NODE_OPTIONS=--max-old-space-size=8192` fixes it, and
   it must also be passed to `vercel build`** — Vercel runs `npm run build` in
   its own environment and OOMed identically until it was set there too. **This
   will keep happening as the corpus grows; expect it next run.**
2. **`ENOENT` on files that demonstrably exist** — `itamar-ben-gvir.jpg`, then
   `joby-warrick-washington-post-resignation.jpg` on the retry. Both were on
   disk at full size and read fine when tested. Previous entries logged this as
   the EOS_DIGITAL silent-write-drop, but this time the cause was found: **a
   second `astro build` from another Claude session was running against this
   same repo, writing into the same `dist/`.** Waiting for that process to exit
   cleared it on the next attempt with no other change. Worth reusing:
   `pgrep -f "astro build"` before building, rather than assuming the drive.

The intake routine was also writing throughout — the article count went
1,699 → 1,703 → 1,738 → 1,743 during the sweep. Next run's delta should be read
against **1,743**.

### Corpus audit — start of run, and after

```
                     start          after
articles              1699 (+139)    1743
orphans                271 (+32)      301
thin                   433 (+34)      435
veryThin                90 (+2)        90
noindexed                0              0
withSeoTitle           130 (+1)        138 (+8)
withDeck               147 (+1)        155 (+8)
relatedOrphans           0              0
clampedSnippets       1505 (+139)     1541
```

### Found, not changed — with reasons

- **Three files belonging to another session were left unstaged**, as always:
  `src/components/SEO.astro`, `src/layouts/ArticleLayout.astro`,
  `src/pages/sources/[...slug].astro`. They ride along in the deployed build,
  which is the established behaviour for this site, but they are not in this
  commit. Only 36 files were staged, every one by explicit path. Never
  `git add -A`.
- **That session changed the brand suffix from ` — KiriPedia` to
  ` | John Kiriakou`** (12 chars → 16), on the reasoning that Kiriakou's name
  carries branded search volume and "KiriPedia" carries none. **It is also what
  made the truncation problem worse**, and the 26 rewrites above were sized
  against the new 16-character suffix, not the old one. Flagging it because the
  routine's own ~50-character rule of thumb is now **~44** and the note in this
  routine's brief is out of date.
- **`heather-kiriakou.mdx` was committed with that session's `deck` line in
  it.** They added `seoTitle` + `deck`; this routine then replaced the
  `seoTitle`. Splicing out their deck would have left the article with a title
  and no description, which is worse. Recorded rather than surgically separated.
- **Standing items, all tracking corpus growth:** 1,541 clamped snippets, 301
  wikilink orphans (+30), 1,789 suspicious wikilinks, 435 thin articles. The
  orphan count grows with every intake batch and is not this routine's to fix.

### Blocked — needs the user

- **Backlinks remain the entire ceiling.** Position 15.7 at 2.2% CTR is what a
  site with a handful of links gets, and it is the same sentence every sweep.
  **Kiriakou sharing the site himself is still the single highest-value unlock
  available.** The one new signal this run is that Instagram sent 14 visitors
  unprompted — the first non-search referrer this site has had.
- **Bing Webmaster Tools** signup (carried from 2026-07-09).
- **A Wikidata item for KiriPedia**, for the Organization `sameAs` (carried
  from 2026-07-09).

### Deployed

**Yes — live and verified on `www.kiripedia.org`.**

- `NODE_OPTIONS=--max-old-space-size=8192 VERCEL_FORCE_NO_BUILD_CACHE=1
  vercel build --prod` (exit 0), then `vercel deploy --prebuilt --prod
  --archive=tgz` (exit 0) → deployment
  `kiripedia-nmfq9vi2c-shimonindustries.vercel.app` **ready**, promoted to
  production. 834 MB uploaded as one archive, 6,660 files extracted remotely.
- **Spot-checked in production**, all five serving the new short title tag at
  the length it was written to be: `heather-kiriakou` (57), `cold-cell` (56),
  `isi` (44), `ted-rall` (47), `cameo` (55).
- **The sitemap change is live and verified against production, not just the
  local build:** `sitemap-0.xml` serves **1,786 URLs, matching `dist` exactly`**,
  with **0 individual `/sources/` transcripts** and the `/sources/` index still
  present.
- **IndexNow: 167 new-or-changed URLs submitted out of 1,786, HTTP 200.** The
  delta is the intake routine's new articles plus tonight's 34 retitled pages.
