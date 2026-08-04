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
