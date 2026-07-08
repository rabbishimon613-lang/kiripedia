# The Art of Processing the Vids — KiriPedia video-intake playbook

How to turn a raw Kiriakou video/podcast into cited, woven encyclopedia content — the full
pipeline, the parallelization model, and the hard-won judgment calls. This is the SOP behind
the interview batch and the 42-episode Dead Drop run.

**Queue lives in:** `KIRIAKOU-OPEN-VIDS.md` (status: `candidate`→`queued`→`ingested`).

---

## 0. Non-negotiables (every stage, every agent)

1. **Single-source canon.** The only truth is Kiriakou's own spoken words in the transcript.
   Never add a fact that isn't in a source. No Wikipedia/news/books for *claims*. Mirror his
   discretion — if he withholds a name, don't supply it.
2. **Cite everything** with `<Cite s="<source-slug>" t="mm:ss" />` right after the sentence.
3. **Weave, don't stack.** Integrating new facts means *rewriting* the relevant section into
   one cohesive article — never appending a raw `## From <show>` block. Keep every existing
   `<Cite>` attached to its claim; never delete a cited fact.
4. **Verify before you cite.** Open the source, find the `[timestamp]`, confirm he actually
   says it. This is the guard against extractor hallucination — it has caught real
   misattributions (e.g. "KSM laughed" was actually Abu Zubaydah). If it doesn't check, cut it.
5. **Frozen deploy.** Writers never run git/build/vercel/workflows. One manual
   `vercel --prod --yes` per run, by the integrator only. Never re-enable auto-deploy.
6. **Build gate.** Not done until `npm run build` prints `Total: 0 bugs` and Astro compiles.

---

## 1. The pipeline (7 stages)

```
Discovery → Fetch+Normalize → Extract (parallel) → Aggregate/Route → Weave (parallel) → Integrate → Deploy
```

### A. Discovery & vetting
- Resolve candidates to **videoIds** and dedupe against BOTH the corpus
  (`grep videoId src/content/sources/*`) AND the ledger. 171-item exclusion set at last count.
- **Reject:** clips / "Daily" re-cuts, re-upload channels (J-HB Radio, Theo Talks, etc.),
  reaction videos, foreign-language dubs, audiobook samples, multi-guest **panels** (Assange
  vigils, roundtables), and **his own shows** where he hosts *others* (JK Report, Deep Focus,
  DeProgram, Sputnik dailies — these are co-host news, low canon density, skip).
- **Keep:** he is the *interviewee/subject*, ≥ ~40 min, full episode.
- **Dup trap:** a different videoId can still be the *same conversation* re-posted. Same
  show + same date = almost certainly a dup (e.g. a re-cut Danny Jones). Check date+show, not
  just videoId.
- Tools: `yt-dlp --flat-playlist` for wide fast sweeps (returns duration, **no date**);
  probe survivors individually for `upload_date`/`view_count`. **Gotcha:** `\t` in a yt-dlp
  `--print` template is *not* expanded to a tab — use a rare literal delimiter like `@@`.

### B. Fetch + normalize
- **YouTube:** `yt-dlp --extractor-args "youtube:player_client=android_vr" --write-auto-subs
  --sub-lang en --sub-format vtt` (the `mweb` client in the old tool is stale — use
  `android_vr`). Then `tools/normalize-vtt.mjs <vtt> <out.md> --meta slug=… title=… show=…
  date=… url=… videoId=… duration=…`.
- **Audio-only podcasts** (Dead Drop, etc.): find the **RSS feed** (Spotify/Apple are just
  storefronts; the feed has the real MP3s — e.g. Acast). `curl` the MP3 (Python `urllib`
  fails SSL on this Mac — use curl), transcribe with **faster-whisper** (`small`, int8, CPU;
  ~0.1× realtime), emit a VTT, then `normalize-vtt.mjs`.
- **Injected ads:** podcast feeds splice programmatic ads (other shows, software) that whisper
  transcribes. Strip them **non-lossily** — only drop a paragraph matching strong ad signals
  AND lacking any Kiriakou-narrative marker. Do NOT trim "everything before his intro" — that
  deleted 28 min of a real episode once. Keep the raw VTTs so you can re-normalize.
- Result: `src/content/sources/<YYYY-MM-DD-show-topic>.md` — frontmatter + `[mm:ss]` paragraphs.

### C. Extraction wave (parallel, collision-free)
- One Sonnet writer per **disjoint batch of sources** (~24k words each). Balance by word count.
- Each reads its transcripts fully and emits a **findings TSV** — nothing else, no article edits
  (so agents can't collide). 5 columns: `target ⇥ src-slug ⇥ timestamp ⇥ claim ⇥ quote`.
  `target` = existing article slug, or `NEW:slug`. Verify each timestamp against the source.
- A 3-hour transcript yields 40–120 findings; a 30-min one 10–25. Reading the source **once**
  here is what keeps cost down — everything downstream works off the findings, not the transcript.

### D. Aggregate & route (central, scripted)
- Combine all findings, group by `target`, write one **bundle file per target**.
- **Salvage misroutes:** some agents drop the target and write the source-slug instead — route
  those to an `UNROUTED` bundle for a dedicated router agent rather than losing them.
- Partition targets into **thematic lanes** (first-match keyword rules → guaranteed disjoint).
  For Kiriakou that's: torture/detainees, Iran/Israel, CIA-history/MKUltra, prison/prosecution,
  early-career/tradecraft, postings, Greece/17N, family, 9-11/Pakistan, people-misc.
- **Split mega-targets:** `fci-loretto` (83 findings) and `abu-zubaydah` (51) each get their own
  agent; a lane over ~95 findings gets halved.

### E. Weave wave (parallel, disjoint by article)
- One writer per lane; each **owns its article files** — no two agents touch the same MDX.
- For each existing target: read the whole article, verify + weave the findings into the right
  sections, **dedup stacked sections** while you're there (one article had a section repeated
  17×), keep every `<Cite>`, add `events:`/`dyk:` where datable/DYK-worthy.
- For `NEW:` targets: create only if **notable + ≥2 verified findings + no existing article**.
  Otherwise **fold** into the best existing article, or **drop**. Don't make thin stubs — the
  corpus is mature (~500 articles), so most value is *enrichment*, not new pages.
- **Images:** for a new article whose subject has a Wikipedia page, emit a hand-off line
  `IMAGE-MAP: <slug>=<Wikipedia_Title>`. Private people (family, inmates) → no image.
- Hand-off block per agent: `REDIRECT:` / `IMAGE-MAP:` / `DELETE:` / `MERGE-SUGGEST:`.

### F. Integrate (central)
- Apply hand-offs: add `REDIRECT`s to `astro.config.mjs`, `IMAGE-MAP`s to
  `tools/fetch-images.sh` then run it + `tools/wire-images.mjs`, `git rm` the `DELETE`s.
- **Dedup new-article collisions:** two lanes can create the same subject under different
  spellings (e.g. `gerald-post` vs `jerome-post` = Jerrold Post). Merge, redirect, repoint links.
- **YAML sweep:** agent frontmatter breaks on unquoted colons in summaries and un-doubled
  apostrophes (`Kiriakou's` inside single quotes → `Kiriakou''s`). `audit-frontmatter.mjs`
  finds them. Titles with `|` break MD tables — sanitize.
- `npm run build` until `Total: 0 bugs`. `dead`/`suspicious` counts are informational.

### G. Deploy
- Commit to `main`, `git push`, one `vercel --prod --yes`. Verify a few live URLs (new article,
  a source page, a redirect, an image) return 200. Update ledger rows to `ingested`.

---

## 2. Parallelization model
- **Writers = Sonnet** (cheap, self-contained prompts). **Integrator = Opus** (holds the plan,
  makes merge calls, runs the build gate, does the one deploy).
- **Extract-once, weave-by-article.** Extraction reads each transcript exactly once (parallel by
  source); weaving works off findings + only the target article (parallel by article). Both
  phases are collision-free because the unit of ownership is disjoint (a source, then an article).
- **Batch/width:** ~24k words per extractor; one weaver per lane; run in waves of ~6–11.
- **Contended files** (`astro.config.mjs`, `fetch-images.sh`, deletions) are touched **only**
  centrally, via the hand-off lines — writers never edit them.

## 3. The art — judgment calls & traps that bit us
- **Weave ≠ append.** If you're adding a section titled "From the X show," you're doing it wrong.
- **Trust nothing unverified.** Extractors misattribute quotes and drift timestamps ±1 min;
  the verify step is not optional.
- **Most findings enrich; few justify a new article.** Default a thin `NEW:` to fold-or-drop.
- **Mega-articles need a dedicated writer** or they get bloated/half-done.
- **Fence the agents.** They will wander: if the old cleanup playbook or ledger is lying in the
  repo, some agent will "helpfully" execute it and commit it. **Move trigger files out** during a
  run. Agents also spawn child writers and sometimes run git themselves — so the integrator must
  own push/deploy and always diff the tree before shipping.
- **Concurrency on shared bios:** `john-kiriakou` gets touched by several lanes; sequence the
  ones that fold into it (or verify all their content coexists) — check for lost edits, not just
  conflict markers.
- **Diminishing returns are real.** After a mature corpus, "20 more recent long-forms" may not
  exist. Report the true count; don't pad with panels, dubs, re-posts, or clips.

## 4. Orchestrator prompt (paste into an Opus lead)

> You are the integrator for a KiriPedia video-intake run. Read
> `KIRIPEDIA-VIDEO-INTAKE-PLAYBOOK.md` and `KIRIAKOU-OPEN-VIDS.md`. Take the `candidate`/`queued`
> rows. Move any stray playbook/ledger trigger files aside first. Centrally fetch captions
> (YouTube) or audio→whisper (podcasts) and normalize into `src/content/sources/`, stripping
> injected ads non-lossily. Spawn Sonnet **extraction** agents over disjoint source batches
> (findings TSV only, no article edits); aggregate their findings into per-target bundles and
> thematic lanes, splitting mega-targets. Spawn Sonnet **weave** agents with disjoint article
> ownership (weave, don't stack; verify every finding; create/fold/drop new subjects; emit
> IMAGE-MAP/REDIRECT/DELETE hand-offs). Apply hand-offs centrally, dedup duplicate new articles,
> fix YAML, run `npm run build` to `Total: 0 bugs`, restore any moved files, commit, push, and
> deploy exactly once with `vercel --prod --yes`. Verify live URLs. Update the ledger to
> `ingested`. Report per-stage counts and anything you dropped and why.

## 5. Worker prompt templates
- **Extractor:** see `EXTRACT-BRIEF.md` (findings format, verify rule, ad-ignore note).
- **Weaver:** see `WEAVE-BRIEF.md` (weave-not-stack, verify, new-article bar, image hand-off).

## 6. Done looks like
- Every queued vid → a source file; ads gone; ledger row `ingested`.
- New facts woven into the right articles, each cited; stacked sections collapsed.
- New notable subjects are real articles (with Wikipedia images where applicable); thin ones
  folded or dropped; nothing hallucinated.
- Build green, one deploy, live URLs verified, frozen-deploy discipline intact.
