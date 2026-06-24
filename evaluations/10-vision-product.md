# KiriPedia — Expert #10: Vision, Product, Launch Strategy

*Drafted 2026-06-23. Owner: Vision/Product. Scope: the **why** and the **what comes next** — not the **how**.*

---

## Executive summary

- **KiriPedia is real.** 279 articles, 1,893 inline citations, 63 ingested sources, median article 3.7 KB, doctrine intact, build green. There is enough on disk today to soft-launch *this week* — the missing pieces are comms, On-This-Day pre-population, an X account, and a working About page that frames the project for a stranger arriving cold.
- **The single most important strategic move is to ship v1.0 before the botnet does.** Every day spent waiting for the autonomous fleet to mature is a day the corpus isn't compounding via real readers, real podcast embeds, and real Kiriakou-himself awareness. Soft-launch on 300 articles with the daily DYK ritual and an OTD calendar that's 50% populated will generate more pull-through signal in 30 days than 5,000 articles sitting un-launched. Launch creates the gravity that pulls the rest of the build forward.
- **The product is a *format*, not a site.** "Pediafication" — a single-source canon wiki spun out of one human's public corpus — is portable to comedians, chefs, coaches, political commentators, athletes, scholars. KiriPedia is instance #1. If it works, the second instance ships in a week, not six months, because 80% of the stack (ingest → claims → MDX → Astro → DYK/OTD/X-bot) is bespoke once and reusable forever. Pedro should think of himself as building the Wikipedia-of-one engine, with Kiriakou as the demo corpus.

---

## A. Corpus today — real numbers, real shape

### Volume

| Metric | Value |
|---|--:|
| Articles published | **279** |
| Sources ingested | **63** |
| Total inline citations (`<Cite>` tags) | **1,893** |
| Citations per article (mean) | **6.78** |
| Article markdown on disk | **2.1 MB** |
| Source transcript markdown | **4.2 MB** |
| Raw `.vtt` archive | **15 MB** |
| Stubs marked `stub: true` | **0** (everything has been brought above stub) |

### Article size shape

| Size band | Count | What it means |
|---|--:|---|
| < 2 KB (skeletal stubs) | 26 | Tier-B placeholders, no `stub:` flag but visibly thin |
| 2–5 KB (short articles) | 174 | The bulk of the corpus — one section + infobox + 3–8 cites |
| 5–15 KB (standard) | 67 | Multi-section Wikipedia-shape articles |
| 15 KB+ (anchor articles) | **12** | The flagship reads |

The corpus is **stub-heavy but not stub-broken**. Median article is 3.7 KB, mean is 5.9 KB — the long tail of 12 anchor articles (John Kiriakou at 155 KB, CIA at 90 KB, FCI Loretto at 38 KB) carries the editorial weight. A first-time reader landing on any anchor article reads a real encyclopedia entry; landing on a 2–5 KB article reads a credible stub. The site does not have a hollow-stub problem.

### Category distribution

| Category | Articles | Comment |
|---|--:|---|
| People | 149 | 53% of corpus — the wiki is a who's-who of Kiriakou's universe |
| Procedures | 43 | Tradecraft (SDR, asset acquisition, polygraph) |
| Events | 31 | Dated incidents with `events:` entries |
| Organizations | 28 | CIA, FBI, divisions, foreign services |
| Programs | 12 | EIT, MK-ULTRA, surveillance programs |
| Places | 11 | The Farm, FCI Loretto, Athens station, etc. |
| Operations | 3 | Surprisingly thin — see Gaps |
| Concepts | 3 | Surprisingly thin — see Gaps |

Note: the taxonomy has drifted from the original DEVLOG seven categories (People / Agencies / Operations / Events / Concepts / Cases / Places). The live corpus has "Procedures" (43, not in the original), "Organizations" (replacing "Agencies"), "Programs" (new), and "Operations" and "Concepts" have shrunk to almost nothing. Either the taxonomy needs an honest rewrite or the audit catches the drift. This is small but the kind of thing a careful reader notices.

### Source concentration

| Source | Citations into corpus |
|---|--:|
| 2025-08-31 Dalton Fischer — Mossad / Blackwater | **497** |
| 2023-11-12 Dalton Fischer — Kiriakou Part 1 | 361 |
| 2025-10-10 Joe Rogan Experience #2392 | 143 |
| 2023-11-19 Dalton Fischer — Part 2 | 136 |
| 2026-04-20 Tommy G — Israel / Double Agents | 128 |
| 2025-07-09 PBD Podcast — Epstein/Maxwell | 113 |
| 2026-01-16 Julian Dorey — French Intelligence | 111 |
| 2025-06-04 Tucker — Torture/MK-ULTRA/9/11 | 102 |

The top 8 sources carry **1,591 of 1,893 citations (84%)**. The remaining 55 sources average ~5 citations each. Reading: a handful of dense, long-form interviews are doing nearly all the editorial work. **The autonomous fleet's #1 job is not new discovery — it is harvesting density from the 55 thin sources we've already ingested but barely strip-mined.** That's a doctrine-aligned Re-Reader job, not a Channel Crawler job.

### Gaps surfaced

1. **Operations and Concepts taxonomies are starved** (3 each). Either re-categorize or accept the taxonomy has drifted away from the DEVLOG schema.
2. **OTD calendar covers ~39 distinct days** (per ON-THIS-DAY-PLAN.md) against a 365-day surface. The strict-canon ceiling is ~39. Anything richer requires the Lane 2 / Lane 3 doctrine call.
3. **Tier C tracker is rich but unpromoted.** The Dalton Fischer Part 1 tracker alone lists ~20 promotable people/events that haven't been re-read after later sources arrived. Operation Marriott Roof is explicitly tagged "dense enough to be Tier A. Promote on user request." That's gold sitting on the floor.
4. **No `random` curation.** `random.astro` exists but uniform-random over 279 articles surfaces stubs 70% of the time. Should weight by article length or anchor-article tag.

---

## B. The 1k / 5k / 50k arc — what changes at each stage

### Today: 279 articles

- `pagefind` static search adequate. Build completes <2s. Vercel free tier handles 100% of expected traffic.
- Doctrine enforcement is one editor's job (Opus + manual review).
- One person can read the entire corpus end-to-end in two evenings.

### 1k articles (~4× current)

- Reachable in **3–4 months** at fleet's projected 100–150 clips/day throughput if Re-Reader is wired and 84% of effort goes into the thin-source backlog.
- `pagefind` still fine but index size approaches noticeable. Consider Pagefind sharding.
- Category index pages start to need pagination.
- OTD calendar realistically hits 80–120 days populated under Lane 1 + Lane 3 (no doctrine relaxation). Daily ritual works.
- Sitemap >1k entries — Google starts crawling but slowly. SEO investment pays off here.
- Doctrine enforcement load: ~5 Opus interventions/week if Diff Sentinel + Discretion Warden are running clean.

### 5k articles (~18× current)

- Asymptote zone for Kiriakou-on-tape. Realistic ceiling for a single-source canon spanning ~15 years of public appearances, ~5,000 hours of content, ~15,000 clips after dedup. At ~3 articles/clip net of dedup and stub-density, 5k is the natural saturation.
- Static build time starts to matter (~30–90s). Pagefind index >50 MB — needs server-side or split deployment.
- Site IA must add: alphabetical browse, "On this date" weekly digest, anchor-article curated portals (Torture / Greece / Pakistan / Prison / Espionage Act).
- Doctrine enforcement: needs the full editorial cluster (Diff Sentinel, Shape Auditor, MoS Enforcer, Discretion Warden, Promotion Committee) running 24/7. No human review at this scale — airlocked mode mandatory.
- Server cost: still ~$0 on Vercel free if traffic is human-paced. If a podcast embed drives 100k uniques/month, edge invocations spike and a paid plan may be triggered — budget $20–60/mo.

### 50k articles — only via Pediafication

50k articles in a single-Kiriakou universe is **not reachable**. The Kiriakou-on-tape universe genuinely caps at ~5k. To reach 50k you need the second, third, fourth, twentieth instance of the framework — a Comedian-Pedia, a Coach-Pedia, a Commentator-Pedia. The asymptote of the single instance is the floor of the network.

50k changes that aren't relevant at instance #1:
- Cross-instance entity disambiguation (does "Bill Clinton" mean the same node across canons?)
- Network-level brand vs per-instance brand (kiripedia.org vs the umbrella).
- Operator licensing — does each new instance need a "John of that domain" who consents, or do we go entirely public-corpus?

---

## C. Reader segmentation + IA implications

| Segment | What they want | Where they land | IA implication |
|---|---|---|---|
| **Foreign-policy / national-security nerds** | Deep tradecraft, real names, the Greece-era anecdotes, the asset acquisition cycle | Anchor articles: 17 November, Welch, asset acquisition cycle, SDR | Make anchor articles the obvious portal. Add a "Featured tradecraft" rail on homepage. |
| **Ex-IC / former-CIA readers** | Smell-test of accuracy, names they recognize, the post-2002 prosecution arc | John Kiriakou, Brennan, Black, Espionage Act case | Add a "Who's who in Kiriakou's world" alphabetical index. People is 53% of corpus — surface it. |
| **Journalists doing background research** | Citation provenance, verifiability, timestamped video evidence | Every article via deep-link cite → YouTube + transcript | The cite-to-timestamp infrastructure IS the value here. Make sure footnote UI is bulletproof; add `?v=...&t=...` deep links that actually work on mobile YT. |
| **Students / academics** | Tradecraft pedagogy, case studies, the Welch killing, Iraq WMD | Procedures, Events, anchor narrative articles | Add a "Course pack" — Pedro-curated reading list across articles. Single-page route: `/reading/torture-program`, `/reading/welch-assassination`. |
| **Conspiracy-curious public** | The Israel takes, the Epstein takes, the JFK material | Mossad, Epstein, JFK-adjacent — the highest-trafficked DYK pool | These articles draw the largest crowd but carry the most BLP / takedown / platform-risk surface. See risk register. |
| **Kiriakou himself** | What does this site say about me, and how do I feel about it | About page → John Kiriakou article → top 5 by length | The About page must read as a *fan tribute with editorial discipline*, not a doxx-attempt. Voice calibration is BLP-protective and reputation-protective. |
| **Casual visitors via X / podcast embed** | One striking fact then bounce | DYK → article → maybe a See Also | DYK is the navigation funnel. The X automation IS the front door for this segment. Make sure URLs in tweets land somewhere that doesn't feel like a stub. |

**IA implications, prioritized:**
1. Anchor articles need a visible homepage rail. Surface the 12 long-form articles, not random shuffle.
2. People-category alphabetical browse, since 53% of the corpus is People.
3. Mobile YouTube deep-link sanity check — half the verifiability is whether `?t=754s` actually works on a phone.
4. About page rewrite (current is short and does not orient a stranger). See Section G below.
5. A curated reading-list route (`/reading/...`) for the journalist + student segments.

---

## D. v1.0 launch criteria + sequence + risk register

### v1.0 launch criteria checklist

These are the green-lights for public soft-launch. Anything red blocks announce.

**Editorial floor**
- [ ] 250+ articles published *(✅ 279)*
- [ ] Anchor articles ≥10, each ≥10 KB *(✅ 12)*
- [ ] Average citations/article ≥5 *(✅ 6.78)*
- [ ] No `stub: true` flags on landing pages *(✅ 0)*
- [ ] Wikilink integrity audit passes — no person-→-wrong-person bugs
- [ ] Sources index page renders all 63 sources with deep-link to transcript

**Site readiness**
- [ ] About page tells a stranger what this is, why it exists, who built it, and what the doctrine is in under 90 seconds of reading
- [ ] Homepage DYK rotates per-visit (already wired per ARTICLE-WORKFLOW)
- [ ] Homepage OTD has same-day content **at least 200 days/year** — needs Lane 1 extraction + Lane 3 source-pub dates *(currently ~39 days)*
- [ ] `/random` weighted to favor articles ≥5 KB
- [ ] Mobile rendering audited on iOS Safari + Android Chrome
- [ ] 404, search, category, on-this-day, sources, random — every utility page renders
- [ ] Open Graph + Twitter card metadata on every article (auto via layout)
- [ ] Sitemap + robots.txt + JSON-LD

**Distribution**
- [ ] X account exists, bio discloses automation, first 5 hand-curated tweets queued
- [ ] X automation deployed (GitHub Actions cron, DYK pool stripped + posted 1/day)
- [ ] Domain `kiripedia.org` resolves, SSL valid, redirects www → apex
- [ ] At least one third-party referrer secured before announce (X repost, friendly podcast mention, single Reddit drop)

**Legal / safety**
- [ ] About page disclaimer prominent: not affiliated with John Kiriakou or Wikipedia
- [ ] No images used without Wikimedia-attributed credit (already enforced via `credits.json`)
- [ ] BLP audit complete on top 30 most-trafficked articles (see risk register)
- [ ] Pre-decided takedown response protocol (see risk register)

### Launch sequence (T-minus → T+30)

**T-7 days — locked editorial**
- No new articles. No category drift. Final wikilink + frontmatter audit.
- Lane 1 OTD extraction completed → calendar populated.
- Lane 3 source-pub dates added → calendar populated further.

**T-3 days — distribution prep**
- X account created, bio finalized, first week of posts queued by hand.
- One trusted friend (foreign-policy world, security world, or podcast world) briefed and primed to repost on launch day.
- Mailing list signup (optional but cheap insurance via Buttondown/Listmonk).

**T-0 — soft launch**
- First X post: a featured anchor article ("Did you know…that 17 November murdered 28 people including CIA station chief Richard Welch?") — link to article.
- About page now live and discoverable from every page footer.
- One Reddit drop in r/IntelligenceNews or r/AskHistorians-adjacent, low-key, single comment.
- Pedro tweets from personal account: "Built a thing. It's an encyclopedia of John Kiriakou's mouth. kiripedia.org"
- **DO NOT @ John Kiriakou.** Don't ask his blessing. Let him find it organically. See risk register.

**T+7 — observe**
- Read every X reply that arrives. Adjust DYK pool to suppress anything that drew BLP heat.
- Check whether Kiriakou himself or his podcast (Political Misfits) has noticed. Stand by.
- Add OTD entries for any dates Kiriakou utters in the *next* week's appearances — the calendar starts compounding immediately if he says a date on a Wednesday and we ship the OTD entry by Thursday.

**T+30 — first real review**
- Traffic numbers, source attribution (X vs Reddit vs direct vs podcast-embed).
- One follow-up: a *podcast embed widget* (Section E — Pediafication portability), embeddable on podcast show notes pages.
- First takedown / pushback inventory.

### Risk register

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| **Kiriakou himself reacts negatively** (he sees the site, finds the framing patronizing, asks for shutdown) | Medium | High | Voice calibration is fan-tribute respectful. Mirror his discretion. If he asks, dialogue first, comply if asked. Have a draft "thank you for everything, we'll take this down" public statement ready. Never claim affiliation. |
| **BLP / defamation complaints from third parties he names** (a former IC official sees themselves named, doesn't dispute the fact but disputes characterization) | Medium | High | Single-source canon protects us: "He said this in this video at this timestamp" is provable. But: pre-launch BLP audit on top 30 articles. Establish a `<takedown@kiripedia.org>` channel with a 48-hour response SLA. |
| **YouTube takes down a referenced source** (channel deleted, video private) | High over 12 months | Medium | The `sources/raw/*.vtt` archive is immutable. Transcripts remain on-site even if YT 404s. Add an Archive Diver job (TEAM-REWORK Phase 1) to mirror critical sources to archive.org pre-emptively. |
| **X (Twitter) restricts the auto-account** | Medium | Low-Medium | Plan B is cheap scheduler (Buffer, Typefully) — not free but ~$5/mo. Don't tie launch to X exclusively. |
| **A specific article goes viral for the wrong reason** (e.g., Israel/Mossad article picked up by bad-faith actor and used as ammo) | Medium | Medium-High | The DEFERRED / ATTRIBUTION NOTE flag (already in X-AUTOMATION-PLAN) keeps known-hot articles out of the auto-DYK pool. Add a `noindex` option on flagged-sensitive articles if heat rises. |
| **Vercel free tier capped on traffic spike** | Low | Low | Pre-stage Cloudflare Pages mirror DNS. Switching takes minutes. |
| **Doctrine drift goes unnoticed for weeks** (autonomous fleet softening articles over time) | High over months | Medium | Diff Sentinel + monthly Opus audit + Pedro reads 5 articles/week as smoke test. |
| **Search index goes stale** (Pagefind doesn't rebuild on a failed CI) | Low | Low | Build-step verifies Pagefind output size > N MB; fails build if not. |
| **Bitcoin tip address gets phishing-cloned** | Low | Medium | Pin the address in About + Footer + use a static `bc1q…` so any clone is obvious. |
| **A third party claims the brand "KiriPedia" or wikipedia look-alike trademark claim** | Low | Medium | The site is sufficiently distinct from Wikipedia visually (parody disclaimer in footer). Move fast if challenged; rename if necessary, the corpus survives a rename. |

---

## E. Pediafication — the format is the product

**Thesis:** KiriPedia is instance #1 of a *single-source canon wiki* format. Once shipped, the second instance ships in days, not months.

### Candidate canons

| Subject type | Why it works | Example |
|---|---|---|
| **A political commentator** with a decade of unedited podcast appearances | Same shape: opinions, takes, frequent guests, dated commentary | Tucker Carlson / Glenn Greenwald / Naomi Klein |
| **A chef** with hundreds of cooking videos | Recipes, techniques, ingredient philosophies, the "according to chef X" canon | Kenji López-Alt, Ina Garten if she had a long pod tail |
| **A comedian** with a podcast archive | Bits, story canon, recurring characters, dated incidents | Joe Rogan, Marc Maron, Conan O'Brien |
| **A coach** with sports media tail | Plays, philosophies, era anecdotes | Bill Belichick (post-retirement), any post-career coach with a pod |
| **A scholar** with public lectures | Citations, frameworks, dated positions | Yuval Harari, Jordan Peterson, Sapolsky |
| **A musician** with a deep interview archive | Songs, sessions, era stories | Henry Rollins, Rick Rubin |
| **A whistleblower** (same archetype as Kiriakou) | Same exact stack — KiriPedia is the template | Snowden, Manning, Chelsea-era IC voices |

### Portability matrix — what's reusable vs bespoke

| Layer | Portable across instances? | Bespoke per instance? | Notes |
|---|:-:|:-:|---|
| Astro + MDX + Vector-2022 skin | ✅ | — | Reuses unchanged. Brand colors maybe. |
| `tools/normalize-vtt.mjs` (yt-dlp + dedupe + paragraph chunking) | ✅ | — | Already provider-agnostic. |
| `<Cite>` + `<References>` components | ✅ | — | Already provider-agnostic. |
| Sources collection schema + `/sources/[slug]` page | ✅ | — | Drop-in. |
| Articles collection schema | ✅ | — | Drop-in. |
| 12-layer grounding stack | ✅ | — | Verbatim-quote-grep + timestamp-window-check are subject-agnostic. |
| Fleet workers (Channel Crawler, Scribe, Cataloger, Reviewer, Coordinator) | ✅ | — | Subject-agnostic with prompt parameterization. |
| DYK + OTD homepage rails | ✅ | — | Same surface. |
| X automation (GH Actions cron + DYK pool poster) | ✅ | — | Same script. |
| **Doctrine** (single-source rules, discretion mirror, encyclopedic voice) | ✅ (pattern) | ✅ (specifics) | The 5 rules are universal; the *application* (what counts as discretion for a chef? for a comedian?) is bespoke. |
| **Discovery seed channels** | — | ✅ | Must be hand-curated per subject. ~40 channels per instance. |
| **Reliable Sources List** (grounds.json) | — | ✅ | Per-subject. |
| **Anchor articles** (the first 12 flagship reads) | — | ✅ | Subject-specific. Curated by an operator who knows the subject. |
| **Categories taxonomy** | — | ✅ | A chef's wiki has Recipes / Techniques / Ingredients, not Procedures / Operations. |
| **Operator's relationship to subject** (consent? estrangement? estate?) | — | ✅ | Highest-variability dimension. |
| **Brand + domain** | — | ✅ | Naming is per-instance; design system is shared. |

### The Pediafication business shape (forward-looking)

- KiriPedia ships as **the demo**.
- The framework spins out as **`pedia-kit`** — an open-source scaffold that takes (subject name, seed channels list, doctrine notes) and produces a deployable Astro site + fleet config.
- Each instance is operator-led — Pedro doesn't have to run them all. He runs the engine.
- Revenue path, if there is one: hosted-Pediafication-as-a-service (someone wants a wiki for their podcaster, they pay $X/month for the fleet + hosting), or one-shot consulting builds, or a kit + community.
- This is *not* a Pedro decision today. It is an option that opens up if KiriPedia gets traction. Worth keeping the repo factored for it.

---

## F. Files written this session

- `/Volumes/EOS_DIGITAL/KiriPedia/evaluations/10-vision-product.md` — this document.
- `/Volumes/EOS_DIGITAL/KiriPedia/LAUNCH.md` — v1.0 launch checklist + risk register, operator-facing (separate from this strategy doc).
- `/Volumes/EOS_DIGITAL/KiriPedia/src/pages/about.astro` — rewritten to orient a cold-arriving stranger and front-load the doctrine.

No article content touched. No fleet code touched. No editorial decisions made.

---

## G. Open strategic calls for Pedro

These are the decisions only you can make. Each blocks something downstream.

1. **OTD lane decision (BLOCKS launch).** Lane 1 alone caps at ~39 days/year. Lane 1 + Lane 3 (source-pub dates) probably gets to ~100 days. Lane 2 (historical-anchor dates for events Kiriakou discusses but doesn't day-date) is the only path to ~250+ days. Lane 2 has a small doctrine cost. **My recommendation: ship Lane 1 + Lane 3 for launch, defer Lane 2 to T+90 when readers will have signaled whether OTD-richness matters to them.** Empty OTD on most days is honest — and the empty box already shows the next-fallback content.

2. **Launch posture toward Kiriakou himself.** Three options:
   - **Stealth** — soft-launch, don't tell him, let him discover. (My recommendation. Protects voice from his preferences pulling on it.)
   - **Heads-up** — DM him before launch, frame as fan tribute, ask if he objects.
   - **Collaboration ask** — invite him to record a short intro for the About page. (Probably too much.)

3. **Domain.** Is `kiripedia.org` live? If `kiripedia.com` is owned by a squatter, do we want it before launch becomes a forcing function on price?

4. **X account voice.** Encyclopedic-only (current plan) vs. occasionally cheeky ("hummus guy" pun energy). The DEVLOG voice rules say no editorializing; the brand opportunity says cheeky travels further on X. Pick a lane and stay.

5. **Pediafication first-second-instance call.** Will Pedro commit publicly to "this is the demo of a portable format" or position KiriPedia as a one-off labor of love? Affects the About page framing and the long-term repo architecture. **Recommendation: keep instance #2 as an internal hypothesis, don't market it pre-launch. If KiriPedia hits, *then* announce Pediafication. If it doesn't, the framing doesn't matter.**

6. **Botnet airlock posture.** BOTNET-HANDOFF specifies "no Opus, no human intervention" at steady state. Soft-launch will create traffic and feedback that *will* surface doctrine issues. Are you genuinely committed to airlocked — or does launch reopen the question of weekly Opus reviews? **Recommendation: airlocked is the right long-term posture but **add a Pedro-reads-5-articles-per-week ritual** for the first 90 days post-launch as smoke-test insurance.**

7. **Sensitive-topic policy lock.** The DEFERRED / ATTRIBUTION NOTE flag is good. Confirm the list pre-launch (Israel/Mossad articles, JFK material, anything that draws bad-faith aggregation). Articles stay live; auto-poster skips. This needs a written-down list, not an in-Pedro's-head list, for when the fleet runs while Pedro is asleep.

8. **Monetization decision (low-pressure but real).** The current Bitcoin tip jar is a tasteful default. **Is that the long-term posture?** Or does a Patreon / Ko-fi / GitHub Sponsors layer get added at T+30? More important: does *any* monetization compromise the fan-tribute framing that protects the project from BLP and Kiriakou-reaction risk? My read: keep BTC-only through T+90, revisit only if hosting costs cross $100/mo.

---

*End. Strategy only. Implementation owned by Experts #1–#9.*
