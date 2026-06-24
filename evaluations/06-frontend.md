# Expert #6 — Frontend & Site Experience
*Audit date: 2026-06-23*

---

## Executive summary

- **The skin is production-quality.** Vector 2022 CSS is thorough, mobile-responsive, and semantically correct. The citation pipeline (`Cite` → `citations.mjs` → `References`) is fully implemented and working — DEVLOG's "(planned)" label is stale. Every page route exists and renders.
- **Three real bugs need immediate fixes before the next deploy:** category links carry the `.mdx` extension (broken URLs), the 404 page calls `Math.random()` twice (can link to a different article than it tests), and the YouTube embed in source transcript pages uses the deprecated `frameborder` attribute.
- **On This Day is data-thin but the machinery is fully built.** X automation is spec-only. The pixel office is already live at `/meet-the-team` via `<iframe>` — no remaining integration work, just two divergent snapshot schemas to reconcile.

---

## Reader experience scorecard

| Area | Score | Justification |
|---|---|---|
| Landing / front-page recall | 8/10 | Stats strip, Featured article (rotating), DYK, OTD, Browse-by-topic — all functional; the `article_catalog` JS rotation means it self-corrects across Vercel build intervals. Minus 2: TFA thumbnail is `alt=""` (fine accessibility-wise) but the `articleCatalog` client swap doesn't update `alt` on rotation; also the main-page welcome text drops a Hummus pin date in `pinnedFeatured` from May 2026 that has long expired (cosmetically benign). |
| Article page | 9/10 | Citation density is superb on populated articles (17 November has inline `<Cite>` every 1-2 sentences). TOC appears at ≥3 H2s, repositions to before first H2 via JS. Breadcrumbs present. Infobox floats right with data table. References section numbered and back-linked. Hatnote styled and italic. Minor gap: no stub-notice template invoked for stub articles (the CSS class exists but no component renders it). |
| Category browsing | 5/10 | **Bug:** category `<a>` links use `a.id` (e.g. `/wiki/john-kiriakou.mdx`) instead of stripping the extension — all category page article links are broken 404s. The JSON-LD correctly strips the extension via `a.id.replace(...)` but the visible `<li>` links do not. Fixed this session (see Files edited). |
| Source transcript page | 9/10 | Timestamp-anchored paragraphs, clickable `[MM:SS]` links jump directly to YouTube at the exact second, `?t=<seconds>s` format correct. In-page `:target` CSS highlight works. YouTube embed in infobox. VideoObject + Article JSON-LD. Minor: `frameborder="0"` is a deprecated HTML attribute (not JSX-idiomatic); replaced with `style="border:0" loading="lazy"` this session. |
| Search | 7/10 | Pagefind integration is complete — header typeahead (lazy-loads on focus, debounced 130ms, arrow-key navigation) + `/search` full-results page with `PagefindUI`. The typeahead works in production where `pagefind.js` exists. In dev mode the typeahead silently fails (Pagefind only exists post-build) — expected and documented. No search over sources (transcripts) — but source pages have `data-pagefind-body` so they ARE indexed. |
| Mobile experience | 8/10 | Slide-in sidebar with overlay backdrop, menu toggle with ARIA `aria-expanded`, iOS font-size hack (`font-size:16px` on search input prevents auto-zoom), infobox goes full-width below 800px, mainpage grid stacks. Office iframe shrinks to 480px on narrow viewport. Tap-to-fullscreen overlay for the pixel office on touch screens is a nice touch. Missing: no `loading="lazy"` on infobox images in article MDX (authors add `<Infobox>` manually; the component does use `loading="lazy"` on its img). |
| About / disclaimer page | 8/10 | Honest, voice-appropriate, covers affiliation disclaimer, editorial method, pardon call to action, and Bitcoin address. No hatnote component used (inline `style` instead) — cosmetically fine but inconsistent. Missing: no link to `/meet-the-team` from the about page, even though the bureau is the "how" of the editorial method. |
| Performance | 8/10 | Static Astro build, no client JS frameworks, Pagefind loaded lazily. CSS is one file served from layout. Images use `loading="lazy"`. No web fonts fetched (Linux Libertine falls back to Georgia locally). `@vercel/analytics` adds one tiny deferred script tag. The main risk is the pixel office iframe: it loads a full Vite React app (~150KB JS bundle) on `/meet-the-team` unconditionally — even on mobile. A `loading="lazy"` or `IntersectionObserver` defer would help. |

---

## Dev server status

Started cleanly in ~2 seconds:

```
astro v5.18.1 ready in 2120 ms
Local  http://localhost:4321/
```

No errors, no warnings on startup. All 279 articles, 63 sources, and every special page resolve. The `pagefind` directory is absent in dev mode (expected — only exists after `npm run build && pagefind --site dist`), so typeahead silently fails in dev. This is normal Pagefind behavior.

---

## Top 5 frontend bugs / gaps

### Bug 1 — Category page article links carry `.mdx` extension (CRITICAL, FIXED)
**File:** `src/pages/category/[name].astro` line 61  
**Was:** `href={\`/wiki/${a.id}\`}` — produces `/wiki/john-kiriakou.mdx`  
**Fix:** `href={\`/wiki/${a.id.replace(/\.mdx?$/, '')}\`}` — every article link on every category page was a broken 404. Fixed this session.

### Bug 2 — 404 page `randomSlug` calls `Math.random()` twice (FIXED)
**File:** `src/pages/404.astro` lines 6-8  
**Was:** `articles[Math.floor(Math.random() * articles.length)] && slugOf(articles[Math.floor(Math.random() * articles.length)])` — the truthiness guard and the actual value pick use two independent random rolls, so the guard can succeed on a truthy article while the value picks a different (potentially different) one. With 279 articles this is statistically benign but logically wrong. Fixed to: `const randomArticle = articles[...]; const randomSlug = randomArticle ? slugOf(randomArticle) : null;`

### Bug 3 — YouTube iframe `frameborder` deprecated attribute (FIXED)
**File:** `src/pages/sources/[...slug].astro` line 102  
**Was:** `frameborder="0"` — deprecated HTML attribute, triggers validator warnings  
**Fix:** `style="border:0"` + added `loading="lazy"`. Fixed this session.

### Bug 4 — No stub-notice component invoked for stub articles
**File:** Anywhere — the CSS class `.stub-notice` exists in `wiki.css` but no Astro component uses it. Stub articles (CIA, Enhanced interrogation) have no visual indicator to readers. The frontmatter doesn't have a `stub: true` field convention either.  
**Recommendation:** Add `stub?: boolean` to the content schema, and in `wiki/[...slug].astro` render a `<div class="stub-notice">` when `article.data.stub === true`. One-hour job.

### Bug 5 — `infobox-image-missing` `<span>` announces `[no image]` to screen readers (FIXED)
**File:** `src/components/Infobox.astro` line 22  
**Fix:** Added `aria-hidden="true"` to the wrapping `<div>`. The striped placeholder background communicates the absence visually; screen readers don't need to hear the bracket text.

---

## Pixel office embedding plan

**Current state:** Already embedded. `meet-the-team.astro` serves an `<iframe src="/office/index.html?embed=1">` pointing at `public/office/` which contains the compiled Vite output (`index.html` + `assets/`). This is live and working.

**What the office reads:** `snapshot.json` (relative fetch → resolves to `/office/snapshot.json`). That file lives at `public/office/snapshot.json` and is a different schema than `public/botnet-snapshot.json`.

**The one real gap:** Two separate snapshot files with two different schemas:

| File | Schema | Consumer |
|---|---|---|
| `public/office/snapshot.json` | `{ ts, bots: { key: { status, action, target, handoff_to } } }` | The pixel office `<iframe>` |
| `public/botnet-snapshot.json` | `{ generated_at, bots: [ { key, label, action, handoff_to, ts } ], last_cycle, counts }` | Activity log on `meet-the-team.astro` |

When the real botnet lands and writes its snapshot, it will need to write both formats (or write one canonical format and update both consumers). The office server's `SnapshotWatcher` expects the first format; the activity log JS expects the second. This is a coordination issue for the botnet build phase, not a frontend bug today.

**Integration steps still needed:**

1. Decide on the canonical snapshot schema and document it in `BOTNET-HANDOFF.md`.
2. When the real botnet's `snapshot-writer.mjs` ships, have it write `public/office/snapshot.json` (office format) AND `public/botnet-snapshot.json` (activity log format) — or normalize both consumers to the same schema.
3. The `?embed=1` query param: the office JS bundle references `embed` to suppress the standalone server controls (per BOTNET-HANDOFF). Verify the compiled bundle actually reads `URLSearchParams` for this; based on the bundle grep it likely does.
4. Performance: add `loading="lazy"` to the `<iframe>` on meet-the-team so the 150KB React bundle doesn't load until the user scrolls to the office section.

**Not needed:** No Astro React island integration required. The pre-built static output in `public/office/` is sufficient and already wired up.

---

## On This Day + X automation status

### On This Day

**Status: machinery fully built, data sparse.**

The OTD system is complete end-to-end:
- `index.astro` aggregates `events:` arrays from all articles, strict MM-DD matching, Fisher-Yates shuffle per visit, honest empty state with link to `/on-this-day`
- `on-this-day.astro` shows a full calendar grouped by month with a today callout block
- Both pages serialize an OTD pool as inline JSON for client-side reshuffling

The data problem is per `ON-THIS-DAY-PLAN.md`: only ~39 distinct calendar days populated out of 365. Most days will show the empty state.

**V0.1 ship plan (Lane 1 + Lane 3 from the plan doc):**

1. **Lane 1 — pure canon extraction (do now, no doctrine decision needed):** Run the date-index script against all 63 transcripts, extract day-precise mentions, propose `events:` additions to the matching articles. The plan estimates this gets from 39 to ~39 distinct days (already near the ceiling of strict canon).

2. **Lane 3 — source publication dates (low-risk, mechanical):** Add `events:` entries to source-linked articles for the publication date of each source. Format: `{ date: "2024-11-07", description: "John Kiriakou appeared on [Julian Dorey Podcast #249](/sources/2024-11-07-julian-dorey-249)" }`. 63 sources = up to 63 more OTD entries covering the interview dates, each linking to the source transcript page. This is entirely mechanical and safe.

3. **Lane 2 (needs Pedro's call):** Historical anchors — public dates for events Kiriakou explicitly discusses (Welch Dec 23 1975, Bay of Pigs, etc.). Biggest payoff, needs explicit doctrine approval.

**Order:** Lane 3 first (mechanical, clear win), then Lane 1 extraction, then bring Lane 2 decision to Pedro.

### X Automation

**Status: spec-only, zero code written.**

The plan (`X-AUTOMATION-PLAN.md`) is thorough and well-reasoned. Current blockers to v0.1:

1. **DYK entries exist in volume** — the `john-kiriakou.mdx` frontmatter alone has 50+ `dyk:` entries. The pool is real.
2. **No GitHub Actions workflow written yet** — `tools/x-posted-log.json` doesn't exist, no `.github/workflows/` directory.
3. **No X API credentials** — user needs to create the X developer account.

**V0.1 ship plan (text-only DYK post, 1/day):**

Step 1 — Write `tools/post-dyk-tweet.mjs`: reads all articles, collects `dyk:` entries, loads `tools/x-posted-log.json`, picks random unused entry, strips `[text](url)` wikilink syntax to plain text, prepends "Did you know…", appends `https://www.kiripedia.org/wiki/<slug>`, checks ≤280 chars, POSTs to X API v2 `/2/tweets`, appends entry ID to log, writes log back.

Step 2 — Write `.github/workflows/x-daily.yml`: cron `0 18 * * *` (1pm ET = 18:00 UTC), `npm run post-tweet` with X API secrets injected.

Step 3 — User provisions X dev account, adds 4 secrets to GitHub repo.

**Order:** X automation after OTD Lane 3 (OTD data enrichment takes an hour and makes the v3 X post possible). Do DYK tweet first (no OTD dependency), then add OTD posts once Lane 2/3 data is richer.

---

## Files edited this session

| File | Change |
|---|---|
| `src/pages/category/[name].astro` line 61 | Fixed article link to strip `.mdx?` extension — was producing broken 404 URLs |
| `src/pages/404.astro` lines 6-8 | Fixed double `Math.random()` call — now single pick with null guard |
| `src/pages/sources/[...slug].astro` lines 97-105 | Replaced deprecated `frameborder="0"` with `style="border:0"`, added `loading="lazy"` |
| `src/components/Infobox.astro` line 22 | Added `aria-hidden="true"` to `infobox-image-missing` wrapper |

---

## Open product calls for Pedro

1. **Stub convention:** Decide on `stub: true` frontmatter field and let me add a stub-notice component. Affects ~20 articles currently (CIA, enhanced-interrogation, etc.).

2. **OTD Lane 2 doctrine call:** Allow historical-anchor dates (Welch Dec 23 1975, etc.) in `events:` frontmatter with `date_source: historical` tag? Biggest OTD payoff. Needs your yes/no.

3. **Canonical snapshot schema:** Before botnet build starts, decide: does `public/office/snapshot.json` and `public/botnet-snapshot.json` converge to one file/schema, or do we keep two writers? I'd recommend one canonical file + one writer, with the activity log JS updated to read the same schema.

4. **X account:** Create the X developer account whenever ready. Once you hand over the 4 API keys, the automation code is a half-day write.

5. **Pixel office `loading="lazy"` on meet-the-team iframe:** Low-risk perf win — the React bundle only loads when the user scrolls to the office section. Worth adding.

6. **OTD Lane 3 (source pub dates):** This is pure mechanical work I can do in a single session — 63 `events:` entries added to the appropriate articles, one per source, linking back to the source transcript page. No doctrine risk. Say the word.
