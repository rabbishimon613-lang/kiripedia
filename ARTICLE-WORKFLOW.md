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
