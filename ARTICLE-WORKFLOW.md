# Article Population Workflow

How a new KiriPedia article gets written from the existing source corpus.
This file documents the current method, the infrastructure backing it, the
doctrine constraints it operates under, and the optional future upgrades
worth considering once the corpus grows.

## Inputs — what we have saved on disk

| Path | What it is | Format |
|---|---|---|
| `src/content/sources/*.md` | Normalized transcripts, paragraph-timestamped, version-controlled, deployed as `/sources/<slug>` on the live site | One file per source recording |
| `sources/raw/*.vtt` | Original yt-dlp captions, pre-normalization. Insurance against re-fetching | One file per source recording |
| `src/content/articles/*.mdx` | Every published article. Each cites `source@timestamp` for every claim | One file per article |
| `TODO-tier-c.md` | Curated tracker of named entities mentioned in the corpus that don't yet have articles. Each entry pinned to `source@timestamp` | One file, growing |
| `public/images/credits.json` | Per-article image attribution (Wikimedia source + license) | One file |

The transcripts ARE the database. No external search tool, no embeddings, no
LLM-augmented index — just plain markdown with greppable timestamps. This
is intentional: it stays portable, auditable, and the doctrine remains
verifiable by anyone with the corpus and `grep`.

## The standard article-population workflow

When a new article needs to be written — whether triggered by a dead-link
sweep, a Tier C promotion, an enrichment of an existing article, or a
spontaneous request — the steps are:

### 1. Survey the corpus for the topic

```bash
grep -niE "<topic terms>" src/content/sources/*.md
```

Read the count first. As a rule of thumb:

| Mention count | Decision |
|---|---|
| 0 | Cannot write — no source material exists |
| 1-2 | Stub-grade. Could be a Tier C tracker entry instead of a full article |
| 3-7 | Short article. Single section, infobox, references |
| 8-15 | Standard article. Multiple sections, full citations |
| 16+ | Major article. Full Wikipedia-style treatment, sectional headers, possible multi-paragraph quotes |

### 2. Read every hit in context

For each mention, read at least the surrounding paragraph in the transcript.
Identify:

- Sub-topics within the larger topic (e.g., for `case-officer`: definition,
  role vs agent, training, recruitment, ethical strain)
- Direct quotes worth preserving verbatim
- Cross-references to other named entities (which become wikilinks)
- Contradictions or hedges in the source (preserve them; don't smooth over)

### 3. Group passages into article sections

Organize the material into a coherent Wikipedia-style structure. Standard
order:

1. **Hatnote** (if disambiguation needed)
2. **Lede paragraph** — what the thing is, in Kiriakou's framing, with at
   least one citation
3. **Infobox** — structured key facts in `infobox: { title, image, data: {} }`
   frontmatter
4. **Body sections** by sub-topic, h2 headings
5. **Direct quotes** as blockquotes when the wording matters
6. **See also** linking to related existing articles
7. **References** — automatically generated from `<Cite>` tags

### 4. Cite every factual claim

Each sentence containing a substantive claim must end with a `<Cite>` tag:

```mdx
He was the first U.S. official to publicly confirm CIA waterboarding.<Cite s="2023-11-12-dalton-fischer-kiriakou-part-1" t="1:01" />
```

The `s` value is the source slug (the filename without `.md`). The `t`
value is the timestamp from the transcript paragraph the claim is drawn
from. The `<References>` component at the article bottom auto-generates the
numbered footnote list from these tags.

### 5. Cross-link to existing articles only

Wiki-style internal links should point only at slugs that exist in
`src/content/articles/`. Dead links to non-existent articles are stripped
periodically by `tools/delink-dead-wiki-links.mjs`. The first article to
link to a new candidate effectively becomes the prompt to write that
candidate later.

Slugs are kebab-case, lowercase, with no leading slash other than the
`/wiki/` prefix:

```mdx
[John Kiriakou](/wiki/john-kiriakou) was approached by [Cofer Black](/wiki/cofer-black).
```

### 6. Frontmatter checklist

```yaml
---
title: <Full article title>
summary: <One-paragraph encyclopedic summary; doubles as meta description and SERP snippet>
categories: [People] | [Agencies] | [Operations] | [Events] | [Concepts] | [Cases] | [Places]
infobox:
  title: <Optional override; defaults to title>
  image: /images/<slug>.jpg              # if a Wikimedia image exists for this article
  imageCredit: "<auto-set by tools/wire-images.mjs>"
  data:
    <Field>: "<Value, may use [link](/wiki/x) markdown>"
events:                                  # optional, for /on-this-day rotation
  - { date: "YYYY-MM-DD", description: "..." }
dyk:                                     # optional, for Did You Know rotation
  - "...that <one-liner ending with a question mark>?"
---
```

### 7. Build + push

```bash
npm run build  # local verify; will fail loudly on schema violations
git add -A && git commit -m "Add <article>" && git push
```

Vercel auto-deploys on push. Sitemap, JSON-LD, breadcrumbs, OG tags, and
analytics are all wired into the layout — nothing per-article needs to be
added for SEO.

## Doctrine constraints

The only inviolable rules:

1. **Single-source canon — publicly available online appearances only.** If
   John didn't say it in a publicly available interview, podcast, video,
   livestream, or short-form video, it doesn't go in. Books are
   explicitly excluded. So is Wikipedia, news reports, court documents,
   general knowledge.
2. **Every claim cited.** No floating sentences. The `source@timestamp`
   format makes every claim verifiable.
3. **Encyclopedic voice.** Third person. No "Kiriakou says" framing — write
   the claim as fact, cite to source, trust the reader.
4. **Mirror Kiriakou's discretion.** If he hedges or refuses to comment, the
   article hedges or notes the silence. Don't fill gaps from outside
   knowledge.
5. **Auto-caption errors** can be cleaned only if the meaning is preserved.
   If a transcription error would change the meaning (e.g., a misheard
   proper noun), retain the source text and flag the artifact.

## Token cost per article

Rough estimates for a writer agent operating on this workflow:

| Phase | Cost |
|---|---:|
| `grep` topic survey | ~0 (shell output is small) |
| Read hits in context (3-15 paragraphs) | ~2-4k |
| Draft article (200-500 words + infobox + citations) | ~2-4k |
| Build verify | ~0 |
| Total | **~5-10k per article** |

Enrichments to existing articles run cheaper — closer to ~2-5k.

## Tier C tracker → article promotion

The standard promotion path:

1. A topic accumulates Tier C entries across multiple ingests
2. The dead-link sweep shows the topic is being reached for from multiple
   existing articles
3. Combined evidence justifies writing the full article
4. The article is written; the Tier C entry is removed; existing articles'
   prose becomes linked

## Optional future upgrades

Not implemented yet. Listed in order of decreasing ROI given current corpus size.

### Level 1 — Per-source topic index (recommended once we exceed ~10 sources)

For each ingested source, emit `src/content/sources/<slug>.topics.json` at
ingest time listing every named entity / concept appearing in that transcript
with its first-occurrence timestamp and a short excerpt.

Built either by:
- Regex against a known-entities list (cheap, exhaustive within the
  whitelist, misses novel entities)
- One-shot LLM scan of the transcript with a "label each paragraph"
  instruction (richer, finds novel entities, ~5k tokens per source one-time)

After a Level 1 index exists, "write the X article" becomes:

```bash
jq -r '.[] | select(.topic == "X") | "\(.source) @ \(.timestamp) — \(.excerpt)"' \
  src/content/sources/*.topics.json
```

…returning a pre-filtered list of relevant paragraphs without reading any
transcript end-to-end.

**Cost: ~30k tokens one-time across the current 6 sources. Recurring cost:
~5k tokens per future ingest. Saves ~2-4k tokens on every article
written from that point forward.**

### Level 2 — Reverse citation map (cheap, marginal value)

Build-time scan that produces:
- `cited.json`: which `source@timestamp` references are already cited
  somewhere in an existing article
- `uncited.json`: which `source@timestamp` references in the topic index
  are *not* yet cited anywhere

`uncited.json` then becomes a continuously-refreshing backlog of untouched
source material. Useful for finding "what's still on the cutting-room floor"
without grepping.

**Cost: ~2k tokens to write the script, runs free thereafter.**

### Level 3 — Per-section semantic summaries (skip for now)

LLM-generated 1-2 sentence summary per ~10-paragraph block of each transcript.
Lets us search by topic without grepping.

**Not worth doing until grep+read genuinely feels slow at the operator end —
which it doesn't at 6 sources / 440 KB.**

## When to upgrade

| Trigger | Upgrade |
|---|---|
| Source count crosses ~10 | Build Level 1 topic index |
| Source count crosses ~25 | Build Level 2 reverse citation map |
| Source count crosses ~50 | Consider Level 3 semantic summaries; consider pagefind-server-side |
| Article count crosses ~250 | Reconsider build performance; the static pipeline currently completes in <1 second |
| Dead-link sweep returns >500 slugs | Treat as signal that article-writing has fallen behind ingestion; do a Tier C → article promotion sprint |

## When NOT to upgrade

If the operator can answer "how many times does Kiriakou mention X across the
corpus" in under 10 seconds at the terminal, current infrastructure is
adequate. The corpus is currently ~440 KB of markdown; `grep` is faster than
any indexed alternative at this scale.

The workflow's strength is its lack of moving parts. The transcripts are
plain text, the tracker is plain markdown, the articles are plain MDX with
explicit citations. Every step is auditable by reading a file. That property
is worth preserving until it stops being free.

## Homepage navigation: the `dyk:` rule

The homepage *"Did you know …"* box is the site's primary navigation funnel
out of the landing page. It is wired to a **per-visit shuffle** over the
entire `dyk:` pool aggregated from every article's frontmatter — so the
larger and richer that pool, the more discoverable the encyclopedia is.

Rules, locked into the per-ingest playbook:

1. **Every new article ships with `dyk:` array containing ≥2 entries.**
2. **Every enrichment to an existing article appends ≥1 new `dyk:` entry.**
3. **Each `dyk:` entry contains ≥2 internal `[wikilink](/wiki/slug)` anchors.**
   The box is navigation, not trivia — every line is a launchpad.
4. Voice: start with `… that …` (Wikipedia-style). End with a question mark.
   Bold/italic for emphasis is fine; standard `mdLite` markdown is parsed.

The selection engine (`src/pages/index.astro`):

- Build emits the **full pool** as a `<script type="application/json">` blob
  alongside an SSR fallback of 5 entries (deterministic by date for SEO).
- An inline `<script>` Fisher-Yates-shuffles the pool on every page load and
  swaps `innerHTML` of the `<ul>` — fresh five every refresh.
- No build is needed to rotate; the rotation is per-visit-Math.random.

Backfill bulk-seeder: `tools/seed-dyk-batch.mjs` (idempotent; adds entries
only to articles that don't yet have a `dyk:` block).

## Homepage navigation: the `events:` rule

The homepage *"On this day — {date}"* box is the second of the two primary
navigation funnels (alongside the [DYK rule](#homepage-navigation-the-dyk-rule)).

Engine (`src/pages/index.astro`):

- Build emits the full events pool as a `<script type="application/json">` blob.
- An inline `<script>` runs a four-tier fallback on every page load:
  1. exact MM-DD match for today
  2. ±3-day window
  3. same calendar month
  4. anywhere in the year
  …then Fisher-Yates-shuffles and shows 4 entries (newest year first within the slice).
- **The box is never empty.** Always shows links out of the homepage.

Rules, locked into the per-ingest playbook:

1. **Every article with a datable event ships with an `events:` array.**
   Date precision: `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` — use the most precise
   Kiriakou provides. If he says "spring of 1988", `1988-04` is acceptable.
2. **Every event description contains ≥1 internal `[wikilink](/wiki/slug)` anchor.**
3. Voice: encyclopedic past-tense narration. Year is rendered separately in
   bold; do not repeat it in the description.

Backfill bulk-seeder: `tools/seed-events-batch.mjs` (idempotent).

## Per-ingest checklist (locked in)

For every new ingest:

- [ ] Probe → captions → normalize → frontmatter
- [ ] Read transcript in full
- [ ] Write Tier A articles
- [ ] Enrich existing articles with new material
- [ ] Per article, before commit:
  - [ ] ≥2 `dyk:` entries on every new article; +1 on every enriched article
  - [ ] Every `dyk:` entry contains ≥2 internal wikilinks
  - [ ] Every datable claim becomes an `events:` entry with the most precise date Kiriakou provides
  - [ ] Every `events:` description contains ≥1 internal wikilink
- [ ] `npm run build` clean
- [ ] Commit, push

## Image discipline (per-ingest)

Every new article in an ingest gets one line in `tools/fetch-images.sh`'s
`MAPPING=()` array — an obvious Wikipedia title best-guess. We accept silent
misses; Wikipedia returns "no lead image" for ~30% of titles and the script
just moves on. No verification round, no per-article research.

Per-ingest workflow:

1. Add the new slugs' mappings to `tools/fetch-images.sh` (best-guess Wikipedia titles).
2. `bash tools/fetch-images.sh` — re-fetches the misses, regenerates credits.json.
3. `node tools/wire-images.mjs` — wires `image:` frontmatter for anything newly present.
4. Commit + push as part of the ingest commit.

Adds ~10 seconds per ingest. Tokenless.

## STRICT events: rule (locked in, no exceptions)

`events:` array entries MUST satisfy both:

1. **YYYY-MM-DD precision.** No `YYYY-MM`, no `YYYY`. Month-only and
   year-only dates are not "on this day" content — they live in article prose.
2. **The date must come from Kiriakou's mouth.** No external lookups —
   not Wikipedia, not news archives, not court filings. If he doesn't utter
   the day, the event doesn't get an `events:` entry.

This applies to all future ingests and supersedes any earlier permissive
wording.

### Surfaces enforce it

- Homepage OTD box: strict `mmdd === today` filter, no fallback chain.
- `/on-this-day` page: defensively filters out anything not matching
  `^\d{4}-\d{2}-\d{2}$` so a slip-up in seeding doesn't pollute the calendar.
- Empty box on an empty day is the correct behavior.

### Tools

- `tools/audit-events.mjs` — lists every events entry grouped by precision.
- `tools/strip-imprecise-events.mjs` — removes any non-day-precise entries
  from frontmatter. Idempotent; rebuilds `events:` blocks cleanly.
- `tools/find-dated-quotes.mjs [source-slug-substring]` — mines all source
  transcripts for date-precise mentions Kiriakou utters; outputs
  `[timestamp] [match] [snippet]` so the editor can decide which events to
  add. The ONLY canon-compliant way to grow the OTD pool.

### Per-ingest checklist addition

After writing articles for a new ingest, run:

```
node tools/find-dated-quotes.mjs <source-slug>
```

For each day-precise hit Kiriakou utters:
- If the event already has an article → add an `events:` entry.
- If not → add to tracker for later promotion.

If Kiriakou says only "January 1993" or "spring of 1988" — date stays in
prose, no `events:` entry.

## Date-pointer index (separate from events:)

The strict `events:` rule (day-precise + Kiriakou-uttered) governs what
surfaces in the OTD calendar. But every date Kiriakou utters — including
the ones too vague for `events:` (month-only, year-only, "spring of 1988")
— is valuable as a searchable index for internal data mining.

**Rule:** every date mention in a transcript is captured in a generated
date-pointer index, regardless of precision. Nothing is thrown away.

- `tools/find-dated-quotes.mjs` mines the transcripts (already exists).
- A second tool, `tools/build-date-index.mjs`, runs the miner across all
  sources and writes `public/date-index.json` — an array of:
  `{ source, timestamp, match, precision, snippet }`.
- `precision` is one of `day` | `month` | `year` | `vague`.
- The artifact is committed and regenerated on every ingest.

This is data, not content. The OTD calendar reads only the `events:`
arrays. The date-pointer index is a separate lookup substrate — useful
when an editor asks "did Kiriakou ever mention 1968?" or "what dates does
he give in the Bidoun Waraq episode?"

The per-ingest checklist gains one step:
- `node tools/build-date-index.mjs` — runs after `find-dated-quotes`,
  regenerates the JSON artifact.

## Wikilink integrity (locked into the build)

`tools/audit-wikilinks.mjs` runs at the front of `npm run build` and
**exits non-zero on any HIGH-confidence bug**, breaking the build before
Vercel can deploy. The check that matters: visible text that looks like a
person's name pointing to a different person's article (the
"Leon Panetta → jose-rodriguez" pattern that hit prod).

What the audit categorizes:

- **HIGH-confidence bugs** (fails the build): visible text is a person's
  name (2–4 capitalized words, no common-noun tokens) AND the target slug
  is a People-category article whose title doesn't contain any of the
  visible-text tokens.
- **Suspicious** (informational): visible text doesn't slugify to the
  target — usually intentional aliasing like
  `[Central Intelligence Agency](/wiki/cia)`. Reviewed manually.
- **Dead links** (informational): target slug has no article. Fix by
  unlinking, creating the article, or pointing elsewhere.

The bug check is **the only hard fail**; aliasing is a feature, not a bug.

Per-ingest checklist gains one step:
- `node tools/audit-wikilinks.mjs` — run as soon as articles are drafted,
  before commit. Build will block if any HIGH-confidence bug remains.

## Token-optimized ingest workflow

The expensive thing about an ingest is reading the same 50k-token
transcript multiple times. The fix is to read it once, externalize the
structure into a topic map, then write articles from the map.

### Step 1 — read once, produce a topic map

Read the full normalized transcript in one pass. Produce a markdown
topic map keyed by timestamp ranges:

```
1:54:30–2:13:25  Giuliani pardon arc
  articles to write/enrich:
    - rudy-giuliani  (new)
    - bernie-kerik   (new, brief)
    - bruce-fine     (new)
    - noelle-dunphy  (new, brief)
    - robert-maclean (new, brief)
  key cites: [1:54:30] [1:55:32] [1:57:38] [1:58:42] [2:02:54] [2:08:13]
  quotes to preserve verbatim:
    - "anybody know where the pisser is"
    - "Rudy is not very good by 2 o'clock"
    - "criminal — criminal"
```

The map is the only place transcript context lives during the writing
phase. Articles are written from the map, with targeted Read calls into
the transcript only when a specific quote needs to be confirmed.

### Step 2 — bulk-write via the scaffolder

Draft all articles for the ingest as a single JSON spec, pass to:

```
node tools/scaffold-articles.mjs <spec.json>
```

The scaffolder handles all YAML escaping, all boilerplate (`import Cite`,
`## See also`, blank lines), and enforces the rules:
- DYK >= 2 per new article, each with >= 2 wikilinks
- Every events: date is YYYY-MM-DD with a wikilinked description
- Body must contain >= 1 `<Cite />` tag
- Refuses to overwrite an existing article (unless `skip_if_exists: false`)

Saves ~30% of MDX-boilerplate tokens per article, and kills the YAML
escape class entirely.

### Step 3 — build hooks catch the rest

`npm run build` chain now runs in order:
1. `tools/audit-frontmatter.mjs` — catches YAML escape bugs (`\$`,
   unquoted-value-with-colon, generic parse errors). Points at file:line
   instead of dumping a js-yaml stack trace.
2. `tools/audit-wikilinks.mjs` — catches person-name-pointing-at-wrong-
   person bugs (the Leon-Panetta-→-Jose-Rodriguez class).
3. `astro build` + `pagefind`.

Build fails on any HIGH-confidence issue from steps 1 or 2. Vercel won't
deploy garbage.

### Step 4 — finalize

```
node tools/build-date-index.mjs    # regenerate public/date-index.json
bash tools/fetch-images.sh         # any new slugs get wiki-trusted images
node tools/wire-images.mjs          # wire newly-fetched images into frontmatter
git add -A && git commit -m "..."
git push
```

### Token savings per ingest (rough)

| Old pattern | New pattern | Saves |
|---|---|---|
| Re-read transcript chunks 3-4× | Read once → topic map | 15k–25k |
| Per-article MDX with boilerplate | JSON spec to scaffolder | 8k–12k |
| YAML retry cycles on `\$` etc | Lint catches at file:line | 1k–4k |
| Per-write linter echoes | Single bulk-write tool call | 5k–10k |
| **Total** | | **~30k–50k per ingest** |

## Slim-pipeline v2: subagent outliner + scaffolder shorthand

Three optimizations layered on top of the slim pipeline to cut main-context
token cost by ~50% without quality loss:

### 1. Subagent outliner (the big one)

For ingests from a desktop/Mac Claude Code session, the transcript-reading
work is offloaded to an isolated Agent subagent. The subagent reads the
full ~30k-token transcript in its own context window (subscription-billed
but isolated), produces a structured outline at
`src/content/sources/.outlines/<slug>.outline.md`, then exits. The main
session reads only the outline (~3k–5k tokens) and does targeted re-reads
of the raw transcript for specific quote confirmation.

Tooling:
- `tools/OUTLINE-PROMPT.md` — the binding prompt template for the subagent
- `tools/validate-outline.mjs <outline> <source>` — validates the outline:
  every verbatim quote must appear in the source, segment timestamps must
  be in range. Hard fail on quality bugs.

Per-ingest workflow when subagents are available:
1. Normalize transcript → source markdown
2. Spawn Agent subagent with the OUTLINE-PROMPT.md template
3. Subagent validates its own output via `validate-outline.mjs`
4. Main session reads the outline only
5. Topic-map / scope confirm with user (now reading outline, not transcript)
6. Bulk JSON spec → scaffolder
7. Finalize per usual

Phone-flow ingests (claude.ai connector) can't spawn subagents, so the
user pastes the transcript directly into chat and the writing context
absorbs it — the outline shortcut doesn't apply there.

### 2. Citation shorthand: `<Cite t="..." />`

The scaffolder accepts a top-level `_defaults.source_slug` (or per-spec
`_source_slug`) and rewrites any `<Cite t="..." />` in article bodies to
`<Cite s="<source_slug>" t="..." />` on write. The spec stops repeating
the slug — typically saves ~1k–2k tokens per ingest.

Spec format (top-level):

```json
{
  "_defaults": { "source_slug": "2026-05-04-cleared-hot-446-cost-of-truth" },
  "articles": {
    "slug-a": { ..., "body": "Text <Cite t=\"1:23\" />..." },
    "slug-b": { ... }
  }
}
```

### 3. Scaffolder enrich mode

For enriching existing articles (the most common cross-ingest pattern),
the spec entry sets `_enrich: true` and provides only the patches:

```json
{
  "gust-avrakotos": {
    "_enrich": true,
    "dyk_append": ["… that …?"],
    "events_append": [{ "date": "2026-05-04", "description": "…" }],
    "body_append": "## New section\n\nNew prose…"
  }
}
```

The scaffolder rewrites in place: dyk/events appended to existing arrays,
body inserted before the `## See also` block. One spec file now handles
both creates AND enrichments in a single tool call.

### 4. Sponsor stripping

`tools/normalize-vtt.mjs` now detects sponsor/ad reads via known patterns
(brought to you by, use code, today's sponsor, common brand names) and
strips them from the main transcript into a sidecar `.sponsors.md` file.
Preserved for audit, not part of the canon corpus. Saves ~3k–5k tokens
of transcript-read cost per 3-hour podcast.

## Show-name canonicalization (locked in)

Hosts publish across multiple channels — Julian Dorey alone runs at least
four (`Julian Dorey Podcast`, `Julian Dorey Clips`, `Julian Dorey Daily`,
`Julian Dorey Live`). From KiriPedia's perspective these are all the same
editorial show and must collapse into one `/sources` group.

Per-ingest check (run as the last step before commit):
```
node tools/show-aliases.mjs --fix
```

The alias map in `tools/show-aliases.mjs` is the source of truth. When a
new host appears for the first time, add their canonical name + any known
channel variants to the ALIASES array. Future ingests then auto-canonicalize.

This is part of the per-ingest checklist now. If a Julian Dorey clip
slipped through showing as a different show name, the audit catches it.
