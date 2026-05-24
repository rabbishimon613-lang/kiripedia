# KiriPedia — Devlog

A running record of decisions, doctrine, and design for the project. New entries go at the top under a date heading. Things that are foundational (won't change) live in the "Doctrine" and "Architecture" sections below.

---

## Doctrine

KiriPedia is **John Kiriakou's mouth as a wiki**, not a neutral encyclopedia that uses him as a source. This single sentence is the project's whole identity and every other decision flows from it.

### The five rules

1. **Single-source canon.** If John didn't say it — in a publicly available interview, podcast appearance, video, livestream, or short-form video on platforms like YouTube, TikTok, Instagram, etc. — it doesn't go in. No filling in from Wikipedia, news reports, court documents, his books, or general knowledge. Gaps are preserved as gaps.

2. **Mirror John's discretion.** When he uses an alias, refuses to name a country, or says "I can't say," the article does the same. *"In an unnamed Middle Eastern country."* *"An asset referred to only as Mahmud."* Editorial inference of redacted details is not allowed even when the answer seems obvious.

3. **Encyclopedic voice, not "according to John."** Articles read declarative, present-tense, like Wikipedia. Sourcing is invisible — it lives in the footnotes (`<Cite>`), not in attribution phrases in prose. The reader knows from the About page that every fact is John's. Hedging like *"Kiriakou said that..."* every sentence kills the encyclopedia illusion and ages badly when the same fact is later cited from five episodes.

   > ❌ *"Kiriakou told Dalton Fischer in 2023 that 17 November murdered 28 people, including the CIA station chief."*
   >
   > ✅ *"Over its operational life, 17 November murdered 28 people, including CIA station chief Richard Welch.[^3]"*

4. **Capture density — every drop is gold.** Every named person, dollar figure, weapon model, street name, date, and notable quote gets preserved. Better to over-include and risk being dense than to omit a detail because it came from only one source. The "told twice = enriched" model means single-source facts are still canon today; later sources add citations, they don't unlock new content.

5. **Direct quotes when John is striking.** Memorable phrasing gets a blockquote or inline quotation with a cite. Auto-caption errors (lowercase *i*, missing punctuation, obvious misheard words like "kiraku" for "Kiriakou") get gently cleaned — standard sentence case, restored punctuation — but never in a way that changes meaning. The raw `.vtt` stays untouched as the receipt.

### What KiriPedia is *not*

- Not Wikipedia. No neutrality requirement, no "both sides," no challenging John's account with counter-narratives.
- Not a fan blog. Encyclopedic voice and structure, not opinion or commentary.
- Not made by, assisted by, or endorsed by John Kiriakou or Wikipedia. (See `/about`.)

---

## Architecture

### Stack

- **Astro 5** (static site generator) with **MDX** for article authoring
- **Vector 2022 skin** — hand-rolled CSS that mimics current Wikipedia look (serif headings, sans body, sticky top bar, article tabs, infobox, hatnote, categories bar, references section)
- Content collections: `articles` (the wiki entries) and `sources` (the transcript receipts)
- Deployed as static files — host on Cloudflare Pages / Netlify, free tier sufficient

### Directory layout

```
KiriPedia/
├── src/
│   ├── content/
│   │   ├── articles/        Article MDX, one file per entry
│   │   └── sources/         Transcript MDs, one file per episode
│   ├── pages/
│   │   ├── index.astro      Main page (Wikipedia-style)
│   │   ├── about.astro      About page (disclaimer + project ethos)
│   │   ├── wiki/[slug].astro    Article renderer
│   │   └── category/[name].astro    Category index
│   ├── layouts/
│   │   ├── WikiLayout.astro     Shell: header, sidebar, footer
│   │   └── ArticleLayout.astro  Article-specific: tabs, title, body, categories
│   ├── components/
│   │   ├── Infobox.astro
│   │   ├── Hatnote.astro
│   │   ├── Cite.astro       (planned) Footnote citation
│   │   └── References.astro (planned) Auto-built references list
│   └── styles/wiki.css      Vector 2022 skin
├── sources/
│   └── raw/                 Original .vtt files, immutable archive
├── tools/
│   ├── normalize-vtt.mjs    .vtt → clean .md
│   ├── ingest.mjs           (planned) URL → both files
│   └── index-entities.mjs   (planned) entity sweep across sources
└── public/
    └── logo.svg             Placeholder until real logo
```

### Article taxonomy

Seven categories, fixed for now:

- **People** — anyone John names (officers, targets, politicians, assets, family)
- **Agencies** — institutions (CIA, FBI, divisions like NRD, PPD, etc.)
- **Operations** — specific named or describable ops
- **Events** — dated incidents (Welch assassination, Kiriakou prosecution)
- **Concepts** — tradecraft and ideas (asset acquisition cycle, SDR, enhanced interrogation)
- **Cases** — legal cases (US v. Kiriakou)
- **Places** — locations of note (The Farm, FCI Loretto, Athens station)

Multi-category is allowed (`categories: [Concepts, Operations]`).

### Citation contract

Every factual claim in an article is followed inline by:

```mdx
<Cite s="2023-11-12-dalton-fischer-kiriakou-part-1" t="12:34" />
```

- `s=` is the source slug (filename of the transcript md without extension)
- `t=` is `MM:SS` or `H:MM:SS`

This renders as a superscript `[N]` linking to the references section at the bottom of the article. Each reference shows:

1. Show name, date — clickable to YouTube at that exact timestamp (`?v=ID&t=754s`)
2. *Transcript* link — opens `/sources/<slug>#t=12-34`, deep-linked to the cited paragraph

Numbering is per-article, in order of first appearance. The same `s + t` cited twice in one article gets the same number.

### Source transcript format

Every episode = two files, lockstep:

- **`sources/raw/YYYYMMDD-<videoId>.en[-orig].vtt`** — immutable archive from `yt-dlp`. Never edited.
- **`sources/YYYY-MM-DD-<channel-slug>-<short-title>.md`** — generated by `tools/normalize-vtt.mjs`. Frontmatter (slug, title, show, date, url, videoId, duration, captionSource), then paragraphs prefixed `[MM:SS]` at ~30-second intervals.

The cleaned md is what I read; the vtt is the receipt that proves I didn't make anything up.

### Ingestion pipeline (token-free)

| Step | Tool | Cost |
|---|---|---|
| Probe metadata | `yt-dlp --skip-download --print` | ~0 tokens |
| List subs | `yt-dlp --list-subs` | ~0 tokens |
| Pull captions | `yt-dlp --write-auto-sub --skip-download` | ~0 tokens |
| Normalize VTT → MD | `node tools/normalize-vtt.mjs` | 0 tokens, pure code |
| Speaker diarization (optional, multi-voice episodes only) | local whisperX | 0 tokens, slow |
| Entity sweep | `node tools/index-entities.mjs` (planned) | 0 tokens |

LLM tokens only spend at the article-writing stage, and only on the chunks relevant to the article being written — not the whole transcript.

### Tier system for article priority

When a new transcript comes in, candidate articles get binned:

- **Tier A** — enough material in this one source to write a full article now
- **Tier B** — stub now, expand when more sources mention it
- **Tier C** — mentioned in passing; track the timestamp, don't write until corroborated or expanded later

Tier C entries live in a TODO list with their slug + timestamp so we can find them when the next source enriches them.

### End-to-end workflow — video URL to finished articles

The full pipeline from a single video to a complete set of articles, optimized to spend the minimum number of LLM tokens. Established and proven on the Dalton Fischer Part 1 ingest (2h 51m → 16 articles, ~237 citations, single transcript read).

#### Stage 1 — Probe (free, no tokens)

Always probe before downloading. A two-line shell command tells you whether the video is what you think it is and what kind of transcript to expect:

```bash
yt-dlp --skip-download --print "%(upload_date)s|%(channel)s|%(title)s|%(duration_string)s|%(id)s" "<URL>"
yt-dlp --list-subs --skip-download "<URL>" | grep -iE "english|^en"
```

You learn: date, channel, exact title, runtime, videoId, and whether English captions are auto-generated, manually authored, or absent. ~0 tokens, ~3 seconds.

#### Stage 2 — Acquire captions (free, no tokens)

Prefer `en-orig` (the original-language track) over `en` (often a re-translation). Save to `sources/raw/` for the immutable archive:

```bash
yt-dlp --write-auto-sub --sub-lang en-orig --skip-download --sub-format vtt \
  -o "sources/raw/%(upload_date)s-%(id)s.%(ext)s" "<URL>"
```

If no English captions exist, fall back to `whisper.cpp` or `MacWhisper` on the audio. For multi-speaker shows where the host's voice is hard to distinguish from the guest's, use `whisperX` locally to get speaker diarization. Both are free and run on the Mac; the cost is minutes of CPU time, not tokens.

#### Stage 3 — Normalize VTT → clean Markdown (free, no tokens)

`tools/normalize-vtt.mjs` does all of this in pure JavaScript:

1. Parses VTT cues (regex)
2. **Dedupes YouTube's rolling 2-line auto-captions** — this is the critical step. Each YouTube auto-caption cue contains two lines, and consecutive cues overlap by one line. The naive dedupe (cue-by-cue) misses 50% of the redundancy. Walk **line-by-line in order** and emit each line only if it differs from the last emitted line.
3. Strips inline timing markers (`<00:00:00.000>`), `<c>` tags, HTML entities
4. Merges adjacent lines into ~30-second paragraphs
5. Prefixes each paragraph with `[MM:SS]` (or `[H:MM:SS]` for hour-plus marks)
6. Writes YAML frontmatter (slug, title, show, date, url, videoId, duration, captionSource)
7. Writes to `src/content/sources/`

Result: ~90% size reduction from raw VTT. A 1.2 MB raw becomes ~127 KB cleaned. That delta is the entire reason this is token-frugal — you read the cleaned md, not the raw VTT.

```bash
node tools/normalize-vtt.mjs sources/raw/<file>.vtt "src/content/sources/<slug>.md" \
  --meta slug=<slug> --meta "title=<title>" --meta "show=<show>" \
  --meta date=<YYYY-MM-DD> --meta "url=<url>" --meta videoId=<id> --meta duration=<H:MM:SS>
```

#### Stage 4 — Pre-readthrough scan (one LLM read, ~one transcript's worth of tokens)

Read the cleaned transcript end-to-end **once**. The output of this single read is a **topic map** with three things:

1. **Episode structure table** — block-by-block summary with timestamp ranges, so you can navigate to a topic instantly without re-reading
2. **Tier A / B / C bins** — every candidate article, slotted by how much material this single source actually supports
3. **Part-N teaser list** — what's promised but not delivered, so you know what to ingest next

This is the most token-expensive step of the whole pipeline (one transcript read = ~30-40k tokens for a 3-hour episode) and it's spent **once per episode**. Every article you subsequently write reuses this scan as a navigation index — you re-read only the relevant 2-3 paragraphs per article.

#### Stage 5 — Article writing (small, targeted reads)

Each article touches only the timestamps surfaced by the topic map. The article-writing prompt context is:

- The doctrine (≈500 tokens, persistent)
- The relevant slice of transcript (≈500-2,000 tokens, per article)
- The article being written

Cost per article: low single-digit thousand tokens. Cost per 13-article batch from one source: typically under 50k tokens total — less than a second read of the source.

#### Stage 6 — Tier C tracker (free, no tokens)

For every passing mention that didn't make it into an article, capture in `TODO-tier-c.md` with `source-slug @ MM:SS` plus a one-line note. When a future source mentions the same topic, the tracker tells you exactly where to look for the first mention. The cost of writing the tracker is in the same LLM session as the article-writing — no additional read needed.

#### Cumulative cost model

| Phase | Token cost | Frequency |
|---|---|---|
| Stages 1-3 (acquire + normalize) | 0 | Once per episode |
| Stage 4 (pre-readthrough scan) | ~30-40k for a 3hr episode | Once per episode |
| Stage 5 (article writing) | ~2-5k per article | Once per article |
| Stage 6 (Tier C tracker) | bundled with Stage 5 | Once per episode |

**A typical 3-hour episode produces 10-15 articles for roughly 80-100k tokens total** — about 2-3× a single transcript read. Every additional source that mentions the same topics produces *additional citations*, not additional reads of the original transcript.

### Working in batches

The pipeline above is theoretical until paired with a batching protocol that keeps the work scoped, reviewable, and recoverable. Every multi-step write task on KiriPedia is broken into discrete batches with explicit checkpoints — never a single open-ended run.

**Why batches.** Long autonomous runs fail in three ways: (1) drift from doctrine without anyone catching it, (2) silent build errors that don't surface until many articles are wrong, (3) the user wanting to redirect mid-flight and finding nothing to grab. Batches solve all three by forcing a return to the user at predictable points.

**The standard batch sequence** for taking a fully-scanned source through to finished articles:

1. **Batch 1 — Citation machinery & one anchor article.** Build/extend the `<Cite>` / `<References>` system if needed, then write or convert one full article so the system is end-to-end verified before any other writing begins. Checkpoint: footnotes render, YouTube deep links work, transcript anchors scroll.

2. **Batch 2 — Exemplar articles (2-3 of them).** Write the densest, most representative Tier A articles. **This is the most important checkpoint** — voice and density problems caught here cost a few articles to fix; caught at the end of Batch 3 they cost the whole batch. Always stop after Batch 2 and ask the user to confirm voice before proceeding.

3. **Batch 3 — Remaining Tier A articles.** Once voice is locked in, finish the rest of Tier A in one push.

4. **Batch 4 — Tier B stubs.** Quick, often only 3-5 articles, each just a paragraph or two with the stub flag set.

5. **Batch 5 — Tier C tracker.** Single file, no rendered output to verify. Lists every Tier-C-grade mention with `source-slug @ MM:SS` + one-line note.

**Batch protocol rules:**

- Each batch is self-contained and ends with a verified working state (HTTP 200 on all new pages, expected citation counts).
- After each batch, report: what landed, what cite/ref counts, what's next, and whether to proceed.
- If a batch will take longer than ~5 minutes, surface progress mid-flight ("3 of 9 articles written…") rather than going silent.
- Never silently merge a batch into the next. If user input is needed, stop and ask, even if the answer seems obvious.
- If a batch fails (build error, render crash), report it immediately rather than attempting to fix more than one or two things before checking back in.

**Why stopping at Batch 2 is non-negotiable.** Doctrine drift on KiriPedia is invisible to me — I can write 13 articles in a single "Kiriakou said..." style without noticing that I've violated rule #3. The user can spot it in 30 seconds reading one article. The cost of waiting for that check is small; the cost of skipping it is rewriting Tier A.

---

## Log

### 2026-05-24 — Project init + first transcript ingested

- Scaffolded Astro project at `/Volumes/EOS_DIGITAL/KiriPedia/`
- Built Vector 2022 skin from scratch: sticky header with logo + search, sidebar nav with **Navigation / Site map / Tools** sections, article tabs (Article/Talk/Read/View source/View history), serif headings, floated infobox, hatnote, stub-notice, categories bar, footer
- Main page: Wikipedia-style four-box grid (Featured / In the news / Did you know / On this day) + browse-by-topic
- Three starter articles seeded: **John Kiriakou** (full), **CIA** (stub), **Enhanced interrogation techniques** (stub)
- About page added with project disclaimer and the "vibe-coded by a day-one fan" ethos
- Placeholder SVG logo in `public/logo.svg` — to be replaced with the real burning-globe parody logo
- Preview server runs via `npm run dev` (port 4321); registered in parent `/Volumes/EOS_DIGITAL/.claude/launch.json` as `kiripedia`

**Pipeline brought online:**
- `yt-dlp` workflow established (Homebrew, already installed)
- `tools/normalize-vtt.mjs` written — parses VTT cues, dedupes YouTube's rolling 2-line auto-captions (line-by-line, since consecutive cues overlap by one line not whole-prefix), merges into ~30s paragraphs, writes frontmatter + clean markdown. Achieves ~90% size reduction vs. raw VTT.

**First transcript ingested:**
- URL: `https://www.youtube.com/watch?v=P1kOwRMd3o8`
- Show: *Dalton Fischer Podcast*, 2023-11-12
- Title: *John Kiriakou - CIA Spy Recounts Insane Covert Operations and Assassination Attempts | Part 1*
- Duration: 2h 51m 50s
- Files: `sources/raw/20231112-P1kOwRMd3o8.en-orig.vtt` (1.2 MB) + `sources/2023-11-12-dalton-fischer-kiriakou-part-1.md` (127 KB, 328 paragraphs)
- Caption source: YouTube auto, single-guest format so no diarization needed

**Pre-readthrough scan of Part 1 — Tier A article candidates (13):**

1. **John Kiriakou** (enrich existing)
2. **Gerald "Jerry" Post** — political psychiatrist, recruiter, founder of the Political Psychology Division
3. **Revolutionary Organization 17 November** — Greek terrorist group, 28 victims, rolled up 2002
4. **Richard Welch** — CIA Athens station chief assassinated Dec 23 1975
5. **Steve Saunders** — British defense attaché assassinated March 2000, Kiriakou's neighbor
6. **Gust Avrakotos** — Kiriakou's mentor, *Charlie Wilson's War* figure
7. **CIA National Resources Division** — Casey-era domestic intel via patriotic businessmen
8. **CIA Political Psychology Division** — Post's creation, foreign-leader psych profiles
9. **The Farm** — CIA training facility, crash-and-bang, scenario exercises
10. **Asset acquisition cycle** — spot/assess/develop/recruit; vulnerabilities; "greed's the best"
11. **Surveillance detection route** — what it is, the "mad minute," Kiriakou as instructor
12. **Operating Directive (OD)** — the CIA tier 0–5 intelligence priority system
13. **The Welch .45** — the specific weapon used in every 17N hit

Tier B (stubs to expand later): Bill Casey, Bob (HR director alias), Mahmud (al-Qaeda recruit alias).

Tier C (don't write yet): Carlos the Jackal, Charlie Wilson, Bill/Hillary Clinton, the "I'm not afraid of your gun" carjacker.

Part 2 of this episode is teased to cover: 9/11, Abu Zubaydah operation, refusal of EIT training, "kill them all" (likely Cofer Black), $10M weapons request for Afghanistan. Worth pulling Part 2 next.

**Next up (planned but not yet built):**
- `<Cite>` and `<References>` components (numbered footnote machinery)
- `/sources/<slug>` page rendering transcripts with per-paragraph timestamp anchors + optional YouTube embed
- `tools/ingest.mjs` — one-command URL → both files
- `tools/index-entities.mjs` — entity sweep producing `<slug>.entities.json` sidecars and a global `who-mentions-what.json`
- Convert the existing `john-kiriakou.mdx` placeholder citations to real `<Cite>` calls
- Write the first 2–3 Tier A articles end-to-end as exemplars (proposed: 17 November, Richard Welch, The Farm)
