# Corpus mining routine — the descending shift

A twice-daily, self-terminating routine that writes new articles out of the
transcripts already in the corpus. **No new ingestion. No sub-agents. No
workflows.** One Claude, in one context, reading transcripts and writing
articles — then building, committing and deploying.

Shifts run at **03:00** and **15:00** local, every day. Each shift has a
quota, and the quota falls by one every shift: 50, 49, 48 … 2, 1. When the
quota reaches 0 the routine **deletes its own scheduled tasks and never runs
again.** Total output over its life: 1,275 articles across 50 days.

The quota lives in `CORPUS-MINING-QUOTA` (a single integer, committed).
The shift log lives in `CORPUS-MINING-LOG.md`.

---

## The shift, start to finish

### 0. Read the quota

```bash
cd /Volumes/EOS_DIGITAL/KiriPedia
N=$(cat CORPUS-MINING-QUOTA)
```

If `N` is 0 or less, go straight to **step 8 (retire)** and do nothing else.

`N` is the number of NEW articles this shift must produce. Not "about N".
Exactly N. If a topic turns out to be too thin to write honestly, drop it and
pick another — do not pad, and do not stop short.

### 1. Pick the sources to mine

Find the transcripts nothing cites yet — that is the fuel:

```bash
for f in src/content/sources/*.md; do
  s=$(basename "$f" .md)
  case "$s" in *.sponsors) continue;; esac
  n=$(grep -rl "s=\"$s\"" src/content/articles/ 2>/dev/null | wc -l | tr -d ' ')
  echo "$n $s"
done | sort -n | head -40
```

Prefer, in this order:

1. Sources with **0** citing articles, longest first.
2. Sources cited only once or twice that are long-form and narrative — the
   `dead-drop` episodes especially, which are Kiriakou telling his own story
   at length and yield 6–10 articles each.
3. Anything else in `UNWRITTEN-LEDGER.md` marked `pending`.

Rule of thumb: one 40-minute Dead Drop episode ≈ 6 articles; one interview
≈ 3–5. So a 50-article shift means reading roughly 8–10 transcripts.

**Read them yourself, in full, with the Read tool.** Do not delegate, do not
skim, do not spawn anything. If the shift is too big for one sitting, read
in waves: read 3 → write 6 → read 3 → write 6.

### 2. Harvest candidate topics

While reading, note every concrete thing that could carry an article: a
named person, a place, an operation, a piece of tradecraft, an object, an
incident, a rule, a number. Concrete beats abstract every time — *the toll
booth plan* and *the Snickers bar* are better articles than *recruitment*.

Then dedupe against what exists:

```bash
cd src/content/articles
for s in slug-one slug-two slug-three; do [ -f $s.mdx ] && echo "EXISTS $s" || echo "new    $s"; done
ls | grep -iE "keyword|other-keyword"      # catch differently-slugged duplicates
```

Also check titles, because slugs differ from titles:

```bash
grep -h "^title:" src/content/articles/*.mdx | sed 's/title: //' | grep -i keyword
```

If a topic already has an article, either skip it or — better — leave it and
pick something new. Enrichments do not count toward the quota.

### 3. Weave, don't transcribe

An article is not a summary of one passage. Before writing, grep the whole
corpus for the topic and fold in every telling:

```bash
grep -rHE "regex" src/content/sources/*.md | grep -v '\.sponsors\.md' | head -20
```

Multiple sources are what make an article an article. Where tellings differ
(a number, a date, a name), say so in the prose — *"he gives the figure
variously as twelve, eighteen and twenty states"* — rather than picking one
silently.

### 4. Doctrine — non-negotiable

1. **Only what Kiriakou said, in a public appearance.** Not the host, not the
   guest, not Wikipedia, not general knowledge. If a fact came out of an
   interviewer's mouth, it is not canon; you may report that it was put to
   him and what he answered.
2. **Every substantive claim carries a `<Cite s="..." t="..." />.**
3. **Never cite a `.sponsors` source.** Those are stripped ad-reads and are
   outside the canon, even when the detector wrongly swept real content in.
4. **Encyclopedic voice.** Third person, past tense, no hedging filler.
   Attribute where attribution matters ("in Kiriakou's account") and
   otherwise state and cite.
5. **Mirror his discretion.** Where he refuses to answer, say that he
   refuses. Where he hedges, keep the hedge.
6. Auto-caption garble may be cleaned only where meaning is preserved.

### 5. Verify every citation before writing the spec

This is the step that keeps the corpus honest. For each `s`/`t` pair:

```bash
cd /Volumes/EOS_DIGITAL/KiriPedia/src/content/sources
ck(){ n=$(grep -c "^\[$2\]" "$1.md" 2>/dev/null); [ "$n" = "1" ] || echo "BAD($n) $1 @ $2"; }
ck 2026-02-23-dead-drop-s1e16-captured 32:21
```

Silence means good. Anything printed must be fixed before the article is
written. Timestamps are exactly as they appear in the transcript — `07:31`,
`1:13:37` — no reformatting.

### 6. Write via the scaffolder, six at a time

Build a JSON spec and hand it to the tool; it handles YAML escaping, the
`import Cite`, the See-also block and the house rules.

```bash
cd /Volumes/EOS_DIGITAL/KiriPedia          # must run from the repo root
node tools/scaffold-articles.mjs /path/to/spec.json
```

Spec shape (top-level `_defaults.source_slug` lets `<Cite t="..." />` omit
the slug when everything comes from one episode):

```json
{
  "_defaults": { "source_slug": "2026-02-23-dead-drop-s1e16-captured" },
  "articles": {
    "slug": {
      "title": "...",
      "summary": "One paragraph. This is the meta description and the SERP snippet — front-load the searchable phrase.",
      "categories": ["People"],
      "infobox": { "title": "...", "data": { "Field": "Value" } },
      "dyk": ["… that …?", "… that …?"],
      "events": [{ "date": "1990-08-02", "description": "… with a [wikilink](/wiki/slug)" }],
      "body": "Markdown with <Cite s=\"...\" t=\"...\" /> tags and ## H2 sections.",
      "see_also": ["existing-slug", "another-existing-slug"]
    }
  }
}
```

Hard rules the scaffolder enforces, so get them right first time:

- **≥2 `dyk` entries per article, and ≥2 `/wiki/` links inside each entry.**
  The self-link counts, so `[the thing](/wiki/this-slug)` plus
  `[John Kiriakou](/wiki/john-kiriakou)` satisfies it.
- **`events` dates must be `YYYY-MM-DD` and must come from Kiriakou's own
  mouth.** Month-only or year-only dates stay in prose. Most articles need
  no `events` block at all.
- Every `see_also` and every wikilink must point at a slug that **exists**.
  Check before writing; a dead link is a defect.

Length: 400–900 words of body, 2–4 `##` sections. Long enough to be a real
article, short enough that every sentence is carrying a citation.

### 7. Build, verify, commit, deploy

The EOS drive drops file renames under load, which corrupts Astro's content
cache mid-build. Move that cache off the drive first — this is not optional:

There are **two** caches to move — `node_modules/.astro` and the root-level
`.astro` — and the build needs a bigger heap than the default at this corpus
size (it aborts with a V8 out-of-memory otherwise):

```bash
cd /Volumes/EOS_DIGITAL/KiriPedia
rm -rf node_modules/.astro .astro dist
mkdir -p /tmp/kiripedia-astro-cache /tmp/kiripedia-astro-root
ln -s /tmp/kiripedia-astro-cache node_modules/.astro
ln -s /tmp/kiripedia-astro-root .astro
NODE_OPTIONS="--max-old-space-size=8192" npm run build   # audits run first; must exit 0
```

The build must report `0 bugs` and `0 dead` from the wikilink audit. (A large
`SUSPICIOUS` count is advisory aliasing noise, not a gate.) Then confirm every
article of this shift actually rendered — the drive has been known to silently
drop writes:

```bash
for s in slug-one slug-two …; do [ -d dist/wiki/$s ] || echo "MISSING $s"; done
```

**Then delete BOTH symlinks before deploying — this is not optional.**
`vercel deploy --archive=tgz` tars the working directory *including symlinks*,
so a `.astro` pointing at `/tmp/...` ships to Vercel, resolves to nothing, and
the remote build dies with `ENOENT: no such file or directory, mkdir
'/vercel/path0/.astro/collections/'`:

```bash
rm -f node_modules/.astro .astro
```

**Category names must never contain a slash.** A category like `9/11` generates
the route `/category/9/11/` and kills the build with `Missing parameter: name`.
Use an existing category (`Events`, `History`) instead.

Then commit **by explicit path** (never `git add -A` blindly — other work
may be sitting in the tree) and deploy:

```bash
git add src/content/articles public/llms.txt src/data
git commit -m "Corpus mining shift: N new articles"
rm -rf dist
vercel deploy --prod --archive=tgz --yes --cwd /Volumes/EOS_DIGITAL/KiriPedia
```

The deploy takes 10–20 minutes and may exceed a foreground timeout; let it
run in the background and confirm afterwards with:

```bash
vercel ls kiripedia --cwd /Volumes/EOS_DIGITAL/KiriPedia | head -8
curl -s -o /dev/null -w "%{http_code}\n" https://www.kiripedia.org/wiki/<a-new-slug>/
```

### 8. Decrement, log — or retire

On success:

```bash
cd /Volumes/EOS_DIGITAL/KiriPedia
N=$(cat CORPUS-MINING-QUOTA); echo $((N-1)) > CORPUS-MINING-QUOTA
```

Append one line to `CORPUS-MINING-LOG.md`: the date and time, the quota, the
sources mined, the slugs written, and anything that went wrong. Commit both
files with the shift.

**Retirement.** When `CORPUS-MINING-QUOTA` reaches 0 — i.e. the shift that
wrote 1 article has just finished, or a shift starts and finds 0 — the
routine ends itself, permanently:

```bash
rm -rf /Users/pedro/.claude/scheduled-tasks/kiripedia-mining-shift-am
rm -rf /Users/pedro/.claude/scheduled-tasks/kiripedia-mining-shift-pm
```

and also call `mcp__scheduled-tasks__delete_scheduled_task` for
`kiripedia-mining-shift-am` and `kiripedia-mining-shift-pm` so the scheduler
forgets them. Write a final line in the log saying the routine is complete
and how many articles it produced in total. Do not recreate it.

---

## Standing constraints

- **Never spawn sub-agents, Agent calls, or Workflows.** Pedro has banned
  agent fan-outs outright. Do the reading and writing yourself.
- **Never re-enable any automatic deploy loop**, and never restart the
  Hugging Face Space `zerocool69/kiripedia`. Deploys are manual, one per
  shift, from this routine only.
- **Never ask for approval mid-shift.** Every tool this routine needs is
  already allowed. Pick the sensible default and keep going.
- If something is genuinely blocked (build fails twice, deploy rejected),
  write what happened in `CORPUS-MINING-LOG.md`, do **not** decrement the
  quota, and stop for that shift. The next shift picks it up.
