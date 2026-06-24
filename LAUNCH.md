# KiriPedia — v1.0 Launch Checklist

*Operator-facing launch doc. The "is it ready" gate. Strategy lives in `evaluations/10-vision-product.md`.*

---

## Current state (snapshot 2026-06-23)

- 279 articles, 63 sources, 1,893 inline citations
- 12 anchor articles ≥15 KB; 67 standard articles 5–15 KB
- Median article: 3.7 KB. Mean: 5.9 KB. Stubs flagged: 0.
- Build pipeline: green. Wikilink audit: hard-fail in place.
- OTD calendar: ~39 distinct calendar days populated (strict-canon ceiling).
- X automation: planned, not deployed.
- Pixel office: localhost only, not wired to live snapshot.

**Verdict: editorial floor IS met. Distribution + OTD + comms are the blockers.**

---

## v1.0 launch gates (every box must check)

### Editorial floor (✅ mostly there)

- [x] 250+ articles published *(279)*
- [x] 10+ anchor articles ≥10 KB *(12)*
- [x] Avg citations/article ≥5 *(6.78)*
- [x] No `stub: true` on landing pages
- [ ] Wikilink integrity audit re-run cleanly on full corpus
- [ ] Category taxonomy audit — DEVLOG says 7 categories; live corpus has 8 with drift. Pick: rewrite DEVLOG to match live OR re-categorize live to match DEVLOG. Don't ship with the mismatch unresolved.
- [ ] Top 30 most-trafficked articles BLP-audited (per-claim verifiability + discretion-mirror pass)

### Site readiness

- [ ] About page rewritten — orient a cold stranger in <90s. *(see PR for new about.astro)*
- [x] DYK rotates per-visit
- [ ] OTD has same-day content ≥200 days/year — **needs Lane 1 + Lane 3 extraction. Lane 2 is the user's call.**
- [ ] `/random` weighted by article length to suppress 2 KB stubs in the random pool
- [ ] Mobile audit on iOS Safari + Android Chrome (article render, footnote tap, deep-link to YT, search input)
- [ ] All utility routes render: `/404`, `/search`, `/category/[name]`, `/on-this-day`, `/sources`, `/random`, `/special/*`, `/meet-the-team`
- [ ] Sitemap.xml present and includes all 279 articles
- [ ] OG + Twitter card metadata on every article (auto via layout — verify with one curl)
- [ ] JSON-LD Article schema present
- [ ] robots.txt allows crawl

### Distribution

- [ ] Domain `kiripedia.org` resolves with valid SSL; www → apex redirect
- [ ] X account created, bio discloses automation
- [ ] First 7 days of hand-curated X posts queued (don't trust the auto-poster on day 1)
- [ ] X auto-poster deployed (GH Actions cron, free tier creds)
- [ ] At least one trusted re-poster briefed (foreign-policy world, security Twitter, or a friendly podcast)
- [ ] Personal-account launch tweet drafted

### Legal / safety

- [x] Disclaimer prominent in About + footer: "Not affiliated with John Kiriakou or Wikipedia"
- [x] Image attributions via `credits.json`
- [ ] `<takedown@kiripedia.org>` email forwards working
- [ ] DEFERRED / ATTRIBUTION NOTE list of sensitive articles is written down, not in-Pedro's-head
- [ ] Pre-decided takedown response: 48-hour SLA, standard "we hear you, here's how single-source canon works, here's where to read the source verbatim, here's the article-level discussion path"
- [ ] BTC tip address pinned in About + Footer, identical string

---

## Launch sequence (T-day calendar)

### T-7 — editorial freeze

- No new articles. No taxonomy changes.
- Final wikilink + frontmatter audit.
- Lane 1 OTD extraction completed.
- Lane 3 source-pub dates added.
- (If approved) Lane 2 historical-anchor dates added.

### T-3 — distribution prep

- X account live. Bio + first 7 posts.
- Trusted re-poster briefed.
- Pedro's personal-account tweet drafted.
- Reddit drop drafted (single comment, single subreddit, low-key).

### T-0 — soft launch

- First X post: anchor-article DYK.
- Site fully discoverable. About page in footer of every article.
- Pedro's personal-account tweet posts.
- Reddit drop goes live.
- **Do NOT @ John Kiriakou. Do NOT email him. Let him find it.**

### T+7 — observe

- Read every X reply.
- Adjust DYK pool to suppress anything that drew BLP heat.
- Check if Kiriakou or Political Misfits has noticed.
- Smoke-test 5 random articles for doctrine drift.

### T+30 — first review

- Traffic + referrer breakdown.
- Ship podcast-embed widget (per Pediafication portability — Section E of vision doc).
- Inventory takedowns / pushback.
- Decide whether to open Lane 2 OTD if not done at launch.

---

## Risk register (condensed; full in `evaluations/10-vision-product.md` §D)

| Risk | L × S | Mitigation owner |
|---|---|---|
| Kiriakou himself objects | M × H | Pedro — stealth posture, fan-tribute voice, comply if asked |
| BLP complaint from third party named in articles | M × H | Editorial — pre-launch top-30 audit + 48h takedown SLA |
| YouTube source goes 404 | H × M | Fleet — Archive Diver, `.vtt` immutable archive already in place |
| X account restricted | M × M | Distribution — Buffer/Typefully fallback at $5/mo |
| Sensitive article goes viral (Israel/JFK/etc) | M × MH | Editorial — DEFERRED list + suppress in auto-DYK + `noindex` option |
| Vercel free tier capped | L × L | Infra — Cloudflare Pages mirror pre-staged |
| Doctrine drift unnoticed | H over months × M | Editorial — Diff Sentinel + Pedro reads 5/wk for first 90d |
| Domain or trademark challenge | L × M | Pedro — parody disclaimer + rename plan documented |
| Tip address phishing-cloned | L × M | Infra — pin address everywhere identical |

---

## Definition of "v1.0 shipped"

All editorial-floor and site-readiness boxes checked. All distribution boxes checked. At least 5 of the 9 legal/safety items checked, with the remainder having a written 30-day plan.

When that condition holds, the launch is greenlit on the operator's discretion. There is no further audit gate.

---

## Post-v1.0 — what does v1.1 look like

Not a launch question, but worth pre-staging:

- **v1.1 (T+30):** Podcast-embed widget. Featured anchor-article homepage rail. People A-Z browse.
- **v1.2 (T+60):** Re-Reader live; 84% of source backlog re-harvested. Article count crosses ~500.
- **v1.3 (T+90):** Lane 2 OTD decision shipped one way or the other. First "course pack" reading-list route.
- **v2.0 (T+180):** Article count ~1k. Fleet steady-state. Pedro decides whether to publicly position as Pediafication template.
