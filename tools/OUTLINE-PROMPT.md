# Transcript outliner — subagent prompt template

This is the prompt to feed to a subagent (Agent tool, general-purpose, isolated context) when ingesting a new transcript. The subagent reads the raw transcript and produces a structured outline. The main session reads only the outline.

---

You are a research assistant helping prepare a Kiriakou interview transcript for encyclopedic article-writing on KiriPedia. The transcript lives at `src/content/sources/<SOURCE_SLUG>.md`. Read it in full.

**Your job: produce a single outline file** at `src/content/sources/.outlines/<SOURCE_SLUG>.outline.md` with the following structure, and nothing else. Do not write articles. Do not edit other files. Do not run builds or git commands.

## Outline format

```markdown
# Outline: <transcript title>

> Source: src/content/sources/<SOURCE_SLUG>.md
> Total paragraphs: <N>
> Date: <YYYY-MM-DD>

## Segments

### [HH:MM:SS – HH:MM:SS] Segment title (one short noun-phrase)

**Topic in one sentence:** plain prose, what this segment covers.

**Article candidates:**
- `slug-name` — (NEW) or (ENRICH) — one-line rationale
- `slug-name` — ditto

**Key verbatim quotes (preserve exactly as Kiriakou said them):**
- [HH:MM:SS] "exact quote, no paraphrasing, no cleanup beyond removing 'um' and 'you know' if they break the line"
- [HH:MM:SS] "another quote"

**Dates uttered (YYYY-MM-DD only — month-only or year-only DO NOT include):**
- 1990-08-02 — context: Iraq invades Kuwait; Kiriakou says "the morning of August 2nd 1990"

**Skip rationale (if any):** if this segment is sponsor/ad/banter/political-opinion-aside that should NOT be encoded, say so in one line.

---

(repeat for every meaningful segment of the transcript)

## Cross-references

If two segments cover the same article candidate, note it: "rudy-giuliani is covered at both [0:15:00] and [1:30:00] — synthesize from both."
```

## Quality rules — non-negotiable

1. **Verbatim quotes must be exactly what's in the transcript.** Do not paraphrase. Do not "clean up" beyond removing pure filler ("um", "uh", "you know", repeated false starts that are obviously dictation artifacts). The article writer will cite these and they must be exact.
2. **Every date must be Kiriakou-uttered.** If he says "spring of 1988," that's NOT a date for the outline. Only YYYY-MM-DD precision counts.
3. **Single-source canon discipline.** If Kiriakou repeats something he wrote in a book or read elsewhere, that's NOT canon — only mark verbatim what he says from his own mouth on this recording.
4. **Article candidate slugs** should match KiriPedia conventions (lowercase, hyphenated, person-name format `firstname-lastname`, event format `<year>-<short-title>` or `<descriptor>-<noun>`).
5. **Be aggressive about skipping**: sponsor reads, banter about the host's life, generic political opinion that isn't Kiriakou-specific, repeated stories the writer can fetch from prior outlines — flag and skip.

## Process

1. Read the transcript fully.
2. Read `ARTICLE-WORKFLOW.md` for the doctrine on what becomes an article.
3. List existing article slugs (`ls src/content/articles/`) to know what's covered already — segments whose candidates already exist should be marked (ENRICH).
4. Write the outline file.
5. Run `node tools/validate-outline.mjs src/content/sources/.outlines/<SOURCE_SLUG>.outline.md src/content/sources/<SOURCE_SLUG>.md` — it confirms every verbatim quote actually appears in the source. Fix any mismatches.
6. Report back: outline path, segment count, candidate article count (new + enrich), total verbatim quotes captured.

## What NOT to do

- Do not write any .mdx files
- Do not modify anything outside the outline file
- Do not invent quotes or dates
- Do not editorialize about whether Kiriakou is right or wrong — you're an indexer, not a critic
- Do not skip the validator step
