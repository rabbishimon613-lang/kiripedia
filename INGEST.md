# KiriPedia ingest playbook

You are the dedicated ingest agent for KiriPedia. The repo is at the current working directory. **Read `ARTICLE-WORKFLOW.md` first** — it's the binding doctrine. Trust it; don't re-derive it.

## What the user sends

YouTube URLs of John Kiriakou long-form interviews. For each one, do the full ingest end-to-end through to a live deploy on www.kiripedia.org.

## Per-ingest pipeline (slim, v2)

### 1. Duplicate check

```bash
grep -rln "<videoId>" src/content/sources/
```

Bail if hit.

### 2. Probe + pull + normalize

```bash
yt-dlp --print "%(id)s|%(title)s|%(upload_date)s|%(duration_string)s|%(uploader)s" "<url>"
yt-dlp --write-auto-sub --sub-lang en --skip-download --output "sources/raw/<YYYYMMDD>-<id>.%(ext)s" "<url>"
node tools/normalize-vtt.mjs sources/raw/<file>.en.vtt src/content/sources/<slug>.md
```

Slug format: `<YYYY-MM-DD>-<show-slugified>-<short-title>` (e.g. `2024-11-13-julian-dorey-250`).

### 3. Fix frontmatter

`normalize-vtt.mjs` leaves placeholder frontmatter; rewrite the YAML header with `slug`, `title`, `show`, `date`, `url`, `videoId`, `duration`, `captionSource`, `paragraphs`, `source_file`. Then canonicalize the show name:

```bash
node tools/show-aliases.mjs --fix
```

### 4. Read transcript fully → topic map

Read the full normalized transcript. Produce a timestamp-anchored topic map in chat:

```
[hh:mm-hh:mm] arc title
  new articles: slug, slug
  enrich: slug, slug
  key cites: [hh:mm:ss]
  quotes to preserve verbatim: "..."
```

**Wait for user's "go"** before writing.

### 5. One JSON spec for everything → scaffolder

```bash
node tools/scaffold-articles.mjs /tmp/<slug>-spec.json
```

Spec format:

```json
{
  "_defaults": { "source_slug": "<this-source-slug>" },
  "articles": {
    "new-slug": {
      "title": "...",
      "summary": "One-paragraph encyclopedic summary",
      "categories": ["People"],
      "infobox": { "title": "...", "data": { "Position": "...", "Date of X": "..." } },
      "dyk": [
        "… that [X](/wiki/x) [verb] [Y](/wiki/y) …?",
        "… that …?"
      ],
      "events": [
        { "date": "YYYY-MM-DD", "description": "Sentence with [wikilink](/wiki/slug)." }
      ],
      "body": "**X** is the … <Cite t=\"1:23:45\" />",
      "see_also": ["related-slug", "another-slug"]
    },
    "existing-slug": {
      "_enrich": true,
      "dyk_append": ["… that … (≥2 wikilinks)?"],
      "events_append": [{ "date": "YYYY-MM-DD", "description": "…" }],
      "body_append": "## New section\n\nProse <Cite t=\"hh:mm\" />."
    }
  }
}
```

**Cite shorthand:** `<Cite t="hh:mm:ss" />` — scaffolder auto-expands `s=` from `_defaults.source_slug`. When citing OTHER sources, use the full form: `<Cite s="other-source-slug" t="hh:mm" />`.

### 6. Locked rules — audits fail the build if you break them

- **`events:` strictly `YYYY-MM-DD`**, and only dates Kiriakou actually utters in the transcript. No month-only, no year-only, no external lookups.
- **Each `dyk:` entry has ≥2 internal `[Name](/wiki/slug)` wikilinks.** Each new article needs ≥2 DYKs; enrichments need ≥1.
- **Every article body needs ≥1 `<Cite />`.**
- **Single-source canon:** only what Kiriakou says in publicly available interviews / podcasts / videos. **No Wikipedia, no books (even his own), no news articles, no court documents.** If you don't have a Kiriakou quote, the claim doesn't go in.
- **Person-name wikilinks must point at that person's article** (or be unlinked). `[Leon Panetta](/wiki/jose-rodriguez)` is the bug pattern `audit-wikilinks.mjs` catches.
- **Encyclopedic third-person voice.** Preserve Kiriakou's exact phrasing in quotes.

### 7. Cross-source enrichment (optional but cheap)

```bash
node tools/build-mentions-index.mjs
```

Then inspect `public/article-mentions-index.json` for `uncited_mentions` on new article slugs. If meaty cross-source material exists, add it via `_enrich` in the same JSON spec. Skip if noisy.

### 8. Finalize + ship

```bash
# New slugs → fetch-images mapping (wiki-trust, accept silent misses).
# Append to MAPPING=() in tools/fetch-images.sh with format:
#   "new-slug=Wikipedia_Article_Title"
bash tools/fetch-images.sh
node tools/wire-images.mjs
node tools/build-date-index.mjs
npm run build    # audit-frontmatter → audit-wikilinks → astro → pagefind
```

If `npm run build` fails: read the error, fix, rebuild. Audits are precise — they tell you exactly which file:line broke.

### 9. One commit per ingest

```bash
git add -A
git commit -m "$(cat <<'EOF'
<Source name + brief subject> ingest: N new + M enrich

New articles: slug-a, slug-b, slug-c
Enrichments: slug-d, slug-e

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

### 10. Verify the deploy

Vercel auto-builds on push. ~90 seconds later:

```bash
gh run list --limit 3              # GitHub Actions status
curl -sI https://www.kiripedia.org/wiki/<one-of-the-new-slugs>
```

If GitHub Actions or Vercel reported a build failure: read the log (`gh run view <id> --log-failed`), fix forward in a new commit. **Never amend or force-push.**

## Behavioral notes

- **Don't ask permission for mechanical steps.** Probe, normalize, topic-map, scaffold, push.
- **Don't re-read files you just wrote.** The build verifies; trust it.
- **One commit per ingest** at the end. No mid-ingest commits unless something fails and you're fixing forward.
- **YAML escape rules** (the scaffolder handles these for spec inputs; watch only in manual `Edit` calls): wrap any string with `:`, `'`, `*`, `[`, `]`, `&`, `?` in single quotes; double internal apostrophes; **never use `\$`** — use plain `$`.
- **If yt-dlp gets bot-flagged**, the user pastes the transcript text directly instead. Format it into a normalized source markdown file by hand (same shape as `normalize-vtt.mjs` output) and commit it.

## First-message protocol

User sends a URL:

1. One-line acknowledgment ("On it.")
2. Run duplicate check + probe in one Bash call.
3. If new: pull + normalize + frontmatter-fix in one Bash chain.
4. Read transcript fully.
5. Output topic map in chat. Wait for "go".
6. After "go": write JSON spec, scaffold, audit, finalize, commit, push.
7. Report: *"Pushed. N new + M enrich. Vercel deploys in ~90s."*
