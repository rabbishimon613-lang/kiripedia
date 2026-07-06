# KiriPedia cleanup — multi-agent orchestration prompt

A playbook for working down `ARTICLE-LEDGER.md` with many writer agents in
parallel, safely, cheaply, and in the right order. Paste the **orchestrator
prompt** into an Opus lead; paste each **worker prompt** into Sonnet 5
sub-agents (writers) running side by side.

---

## 0. Non-negotiables (every agent obeys these)

1. **Single-source canon.** The only truth is John Kiriakou's own spoken
   words in `src/content/sources/*.md` (normalized transcripts with `[mm:ss]`
   timestamps). Never add a fact that isn't in a source transcript. Never use
   Wikipedia, books, or news. Mirror his discretion (don't supply names he
   withheld).
2. **Every claim is cited.** Use `<Cite s="<source-slug>" t="mm:ss" />` right
   after the sentence it supports. When weaving, **keep every existing `<Cite>`
   attached to its claim** — reorganize prose, never orphan or invent a
   citation. If you can't find a timestamp for a sentence, cut the sentence.
3. **Encyclopedic third-person voice.** "Kiriakou says…", not "I". No
   editorializing.
4. **Frozen-deploy discipline.** Workers **never** run git, `npm run build`,
   `vercel`, or touch `.github/workflows`, `astro.config.mjs`, or the HF Space.
   Only the orchestrator commits, builds, and deploys — one manual
   `vercel --prod --yes` per wave. No auto-deploy loop is ever re-enabled.
5. **Build gate.** A wave is not "done" until `npm run build` prints
   **`Total: 0 bugs`**. Suspicious/dead counts are informational.
6. **Disjoint files.** No two agents ever edit the same file in the same wave.

---

## 1. Parallelization model

- **Writers = Sonnet 5**, run in **git worktrees** (`isolation: "worktree"`),
  one worktree per agent, each assigned a **disjoint slug list**. Cheap model,
  self-contained prompts → low token cost.
- **Orchestrator = Opus.** Holds the plan, assigns slug batches, makes
  merge/keep decisions, resolves the rare cross-file collision, runs the build
  gate, commits to `main`, and does the single manual deploy per wave.
- **Batch size:** 15–25 articles per writer. **Wave width:** 6–10 writers.
  After each wave: orchestrator collects worktree branches → `npm run build` →
  fix any `bug` → commit → `vercel --prod --yes` → verify live.
- **Shared-file rule.** Only three files are contended: `astro.config.mjs`
  (redirects), `tools/fetch-images.sh` (image MAPPING), and deletions. Workers
  **never** write these. Instead each worker **emits a machine-readable
  hand-off** at the end of its report:
  - `REDIRECTS: <old-slug> -> <canonical-slug>` (one per line)
  - `IMAGE-MAP: <slug>=<Wikipedia_Title>` (one per line)
  - `DELETE: <slug>` (one per line)
  The orchestrator applies these centrally, once per wave, then rebuilds.

---

## 2. Order of attack (and why)

| Wave | Category | Why this order |
|---|---|---|
| **1** | **Merge — facet folds (§1b)** | Shrinks the corpus first so nobody wastes effort extending/weaving an article that's about to disappear. |
| **2** | **Weave — flagships** | Highest reader value; the biggest, most-stacked articles. Weaving also folds in facet content and adds the cross-links that fix orphans as a byproduct. |
| **3** | **Extend — surviving stubs** | Only the stubs that are genuinely standalone subjects (the facet-stubs are already gone from Wave 1). |
| **4** | **Orphans / cross-linking sweep** | Mop up whatever weaving didn't already link in. |
| **P** | **Pictures (parallel lane)** | Mechanical, lowest-risk, independent of prose — runs continuously alongside Waves 1–4 in its own worktrees. |

Rule of thumb: **decide what disappears (merge) before you invest in what
stays (weave/extend).**

---

## 3. Per-category playbook

### 3a. MERGE — facet folds (Wave 1) · writer: Sonnet 5
**Targets first:** the tiny facet-stubs shadowing a big parent — e.g.
`chelsea-manning-emergence` (27w), `john-brennan-tuesday-morning-kill-list`
(29w), `daniel-domscheit-berg-wikileaks` (29w), `pam-bondi-eric-swallwell`
(22w), `eric-swallwell-fbi-documents` (17w),
`church-committee-mk-ultra-investigation` (70w), `three-saudi-princes`,
`taliban-origin-benazir`. Confirm the two §1a pairs are **false positives**
(JFK≠RFK, walk-in≠walling) and skip them.
**Method:** read child + parent. Move every cited sentence in the child that
isn't already in the parent into the right section of the parent, `<Cite>`
intact. Repoint inbound links (`grep -rl "/wiki/<child>" src/content/articles`)
to the parent. Emit `DELETE: <child>` and `REDIRECT: <child> -> <parent>`.
**Expected result:** parent article strictly gains the child's facts; zero
inbound links left pointing at the child; old URL 301-redirects; build 0 bugs;
corpus count drops by one per fold.

### 3b. WEAVE — flagships (Wave 2) · writer: Sonnet 5
"Weave" = take an article that's a **pile of stacked `## From <source>` /
appended enrichment sections** and rewrite it into one cohesive encyclopedia
entry (see the [[weaving]] definition). **Targets first (most stacked):**
`abu-zubaydah`, `john-brennan`, `mk-ultra`, `espionage-act`,
`tuesday-morning-kill-list`, `enhanced-interrogation`, `waterboarding`,
`guantanamo`-family, `cia`.
**Method:** read the whole body. Rebuild it top-to-bottom with a real topical
structure (lead paragraph → thematic sections → See also). **Dedupe** the
overlapping fragments, but **preserve every distinct fact and its `<Cite>`**
(if two sections cite the same fact from two shows, keep the richer sentence
and both citations). Thread in `/wiki/` links to related subjects throughout.
Remove the machine "## From 2026-xx-…" headings.
**Expected result:** one flowing article a human would call finished — no
duplicate paragraphs, no raw source-dump headings, every `<Cite>` still
present and correctly placed, generous internal links. Same or greater fact
count, far better prose.

### 3c. EXTEND — stubs (Wave 3) · writer: Sonnet 5
**Targets:** the 214 "extend" rows that are **standalone subjects** (skip any
already merged). Prioritize ones with inbound links > 0 (readers hit them).
**Method — the safe expansion loop:** `grep -rin "<subject>" src/content/sources`
to find which transcripts mention it, read those `[mm:ss]` spans, and write
**only what Kiriakou actually says there**, each sentence cited `s`+`t`. Give
it: a real lead, ≥2 `<Cite>`, an infobox where sensible, and a DYK block of
**≥2 entries each with ≥2 `/wiki/` links**. If the subject turns out to have
almost nothing behind it, don't pad — emit `MERGE-SUGGEST: <slug> -> <parent>`
instead of inventing filler.
**Expected result:** each stub becomes a real ~150+ word, properly-cited,
linked article — or is flagged for merge. **No hallucinated facts** (this is
the category with the highest hallucination risk — the grep-the-source rule is
mandatory).

### 3d. ORPHANS / cross-link sweep (Wave 4) · writer: Sonnet 5
**Targets:** the 133 zero-inbound articles.
**Method:** for each orphan, find 2–3 articles that *should* mention it
(`grep` its subject across `src/content/articles`) and add a natural,
in-context `/wiki/<orphan>` link in each — never a dumped "See also" of
unrelated links. Only link where the connection is real and, ideally, cited.
**Expected result:** every orphan reachable by at least one (target: 2–3)
in-context link from a relevant article; navigation graph has no islands.

### 3e. PICTURES (parallel lane P) · writer: Sonnet 5 (or a script)
**Targets:** the 253 imageless articles. Do the **"image on disk, not wired"**
ones first (free wins — the file exists, only the `infobox.image` field is
missing).
**Method:** for a disk image, add `image: /images/<slug>.jpg` (+ credit) to the
infobox. For a missing image on a notable People/Organization/Place subject,
emit `IMAGE-MAP: <slug>=<Wikipedia_Title>` for the orchestrator to add to
`tools/fetch-images.sh` and run `fetch-images.sh` + `wire-images.mjs`
centrally. Abstract concepts with no sensible portrait: leave imageless and
list them under `NO-IMAGE-OK`.
**Expected result:** every article that *can* have a relevant image has one
wired into its infobox; the rest are explicitly triaged as image-not-applicable.

---

## 4. Orchestrator prompt (paste into the Opus lead)

> You are the integrator for a KiriPedia cleanup run. Read `ARTICLE-LEDGER.md`
> and this playbook. Execute the waves in order (Merge → Weave → Extend →
> Orphans), with the Pictures lane running in parallel throughout. For each
> wave: split the target slugs into disjoint batches of ~20, spawn N Sonnet 5
> writer sub-agents in **worktree isolation** with the matching worker prompt
> and their slug list, and wait. When they return, apply their hand-off lines
> centrally — add `REDIRECT` entries to `astro.config.mjs`, `IMAGE-MAP` lines
> to `tools/fetch-images.sh` (then run `fetch-images.sh` + `wire-images.mjs`),
> and `git rm` the `DELETE` slugs. Then run `node tools/build-date-index.mjs`
> and `npm run build`; if it doesn't say `Total: 0 bugs`, read the failure and
> fix or bounce the offending slug back to a writer. Once green, `git add -A`,
> commit with a wave summary, `git push origin main`, and deploy exactly once
> with `vercel --prod --yes`. Verify a few live URLs. Never re-enable any
> workflow or the HF Space; deploys are manual only. Report per-wave totals.

## 5. Worker prompt template (paste into each Sonnet 5 writer)

> You are a KiriPedia writer. Category: **<MERGE|WEAVE|EXTEND|ORPHAN|PICTURE>**.
> Your articles (edit ONLY these files): `<slug1, slug2, …>`.
> Obey the non-negotiables in `KIRIPEDIA-CLEANUP-PLAYBOOK.md §0`: single-source
> canon, cite every claim with `<Cite s t />` verifiable against
> `src/content/sources/`, keep all existing citations, encyclopedic voice.
> Do the method for your category in §3. **Do not** run git, build, deploy, or
> edit any file outside your assigned slugs (especially not
> `astro.config.mjs`, `tools/fetch-images.sh`, or workflows). When done, end
> your reply with a hand-off block listing any `REDIRECT:`, `IMAGE-MAP:`,
> `DELETE:`, or `MERGE-SUGGEST:` lines you need the integrator to apply, plus a
> one-line status per slug.

---

## 6. What "done" looks like across the run

- Merge: ~20 facet-stubs folded into parents; corpus tighter; all old URLs
  redirect; no duplicate subjects remain.
- Weave: the top ~15 flagship articles read as cohesive entries, not
  source-dumps; every fact retained and cited.
- Extend: surviving stubs are real articles; nothing hallucinated.
- Orphans: navigation graph fully connected.
- Pictures: every image-appropriate article illustrated.
- Every wave shipped via one manual deploy, build green, frozen discipline
  intact.
