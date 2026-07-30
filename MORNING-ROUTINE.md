# KiriPedia morning routine — 7am, YouTube-only, fully automated

The daily intake. It runs unattended. **There are no approval gates in this document.** If you
find yourself about to ask the user a question, you have misread it — pick the default from §4
and keep going.

Binding doctrine is `ARTICLE-WORKFLOW.md` (voice, citation, single-source canon). The batch
mechanics and the traps live in `KIRIPEDIA-VIDEO-INTAKE-PLAYBOOK.md`. This file is the
automation contract on top of them.

**Scope: YouTube auto-captions only.** No podcast feeds, no MP3s, no whisper, no web articles.
Anything without English auto-captions is pushed to `.kir-whisper-queue.tsv` and left for the
separate audio routine. Do not chase it this morning.

---

## 1. The mandate

**Ship words every day.** The corpus is mature (~690 articles), so most value is *enrichment*,
not new pages — but enrichment counts, and a story the man has told before is still worth
writing when this telling has a new angle, a new detail, a sharper phrase, or simply a second
source to cite. Two added sentences with a real citation is a good outcome. Ten of those is a
good morning.

What that means in practice, per new source:

- **Every arc of the transcript lands somewhere.** No arc gets read and dropped.
- **Floor: 8 article changes per source** (new + enriched combined). A 60-minute interview that
  produced 3 edits was under-mined — go back through the map.
- **New articles when the bar is met**, and the bar is unchanged: notable subject, ≥2 verified
  findings, no existing article covers it. Below the bar → fold into the nearest existing
  article. Never leave a finding on the floor because it doesn't deserve its own page.
- **Net article wordcount must rise.** The run logs the delta; a negative delta means something
  got clobbered — investigate before committing.
- **Re-told stories are enrichments, not duplicates.** Attach the new source's `<Cite>` to the
  existing claim, add whatever this telling adds, and move on.

Never pad to hit a number. Cited and relevant beats long. But when a real finding is sitting
there, write it.

---

## 2. Mechanical half — one command

```bash
cd /Volumes/EOS_DIGITAL/KiriPedia
bash tools/morning-run.sh
```

That does discovery (search sweep, dedup against the corpus *and* `.kir-intake-progress.tsv`
*and* `.kir-exclude.txt`, reject clips/shorts/re-uploads/under-45-minute items, probe survivors
for upload dates), then captions + normalize + ad-strip into `src/content/sources/`.

It **does not commit, push, or deploy** — that's yours, once, at the end.

Outputs:

- `.kir-morning/new-sources-<date>.txt` — the manifest. This is your worklist.
- `.kir-morning/run-<date>.log` — full mechanical log.
- `.kir-morning/words-before-<date>.txt` — baseline wordcount for the delta.

**If the manifest is empty:** that's a legitimate quiet morning. Do not widen the search, do not
switch to podcasts, do not invent work. Append the "nothing new" line to `MORNING-LOG.md` and
stop. (Backfill of old material is the *other* routine's job, not this one's.)

Useful flags: `--since YYYYMMDD` (recent-only sweep), `--limit N` (results per query, default
40), `--min-minutes M` (length floor, default 45).

---

## 3. Editorial half

For each source in the manifest:

1. **Read the whole transcript.** Not skimmed, not sampled.
2. **Write the content map to a file** — `.kir-morning/map-<source-slug>.md`, not to chat:

   ```
   [hh:mm-hh:mm] arc title
     new: slug, slug          (or: none)
     enrich: slug, slug
     key cites: hh:mm:ss
     verbatim: "..."
   ```

   Then act on it immediately. **No "waiting for go" — that gate is deleted for this routine.**
3. **Verify before citing.** Open the source at the timestamp and confirm he says it. Extractors
   drift ±1 minute and misattribute across speakers; this step has caught real errors. If it
   doesn't check out, cut it.
4. **Write via one JSON spec per source** → `node tools/scaffold-articles.mjs <spec.json>`
   (format and the locked rules — `YYYY-MM-DD` events only, ≥2 wikilinks per DYK, ≥1 `<Cite>`
   per body, single-source canon — are in `INGEST.md` §5–6). Weave into existing sections;
   never append a `## From <show>` block.

**Scale-up: NO AGENT FAN-OUT. Ever.** (Locked 2026-07-30, supersedes the old "one extraction
agent per source, then weave lanes" instruction and the parallelization model in
`KIRIPEDIA-VIDEO-INTAKE-PLAYBOOK.md` §2.) Read, map, verify and write **yourself, in the main
context, one source at a time**. If the volume won't fit in one sitting, shrink the batch and
take more turns — never shard it across agents. No `Workflow`, no worktree fan-outs, no
agents spawning agents.

---

## 4. Defaults — the answers to questions you must not ask

| Situation | Default |
|---|---|
| Thin new subject, <2 findings or marginal notability | Fold into the nearest existing article |
| Two candidate parents for a finding | The more specific article |
| Date mentioned but partial ("that spring", "'09") | No `events:` entry; keep the prose |
| Speaker attribution unclear | Cut the finding |
| Same story already in the corpus | Enrich: add this source's cite + whatever's new |
| New subject collides with an existing slug spelling | Merge into the existing one, add a redirect |
| Two agents created the same subject | Merge, redirect, repoint links |
| Wikipedia image ambiguous, or subject is a private person | No image |
| Transcript quality is garbage (gibberish, music, <40 wpm) | Drop the source file, log it, move on |
| Video turns out to be a panel / host-side / re-upload | Delete the source file, add the id to `.kir-exclude.txt` |
| Build fails on one article | Fix it; if unfixable, revert that article and ship the rest |
| yt-dlp bot-check or 429 | The driver retries; whatever fails is tomorrow's problem |
| Anything else genuinely ambiguous | Take the conservative option, note it in the report, continue |

---

## 5. Never stop

- **One bad video fails that video only.** Never abort the run.
- **Two retries, then park it** in `.kir-exclude.txt` (junk) or the whisper queue (no captions).
- **Fix forward.** Never amend, never force-push, never `git reset --hard` shared history.
- **Partial is fine.** Four of six sources woven and shipped beats six mapped and nothing shipped.
- **No questions.** Ever. §4 covers it.

---

## 6. Finish — once

```bash
bash tools/fetch-images.sh          # only if new slugs were added to its MAPPING
node tools/wire-images.mjs
node tools/build-date-index.mjs
npm run build                       # must reach: Total: 0 bugs
```

Then **one** commit, **one** push, **one** deploy:

```bash
git add -A
git commit -m "morning intake <date>: N sources, X new + Y enrich"
git push
vercel build --prod && vercel deploy --prebuilt --prod
```

Build **locally**, then upload prebuilt: some build-time generators (recent-changes, article
dates) read git history, which a remote Vercel build may not have. They fail soft, so plain
`vercel --prod --yes` also ships — use it only if the prebuilt path errors.

**Frozen-deploy discipline is absolute:** exactly one `vercel --prod --yes` per run, at the very
end. Never re-enable git auto-deploy (`vercel.json` keeps `main` disabled on purpose — the
account-wide free deploy cap is what froze this project once already). Never deploy mid-run.

Stay on whatever branch the repo is on; do not switch or merge branches — dedup relies on the
untracked progress ledger, which travels with the working directory, not the branch.

Verify 2–3 live URLs return 200 (one new article, one enriched article, one source page).

Append one line to `MORNING-LOG.md`:

```
- YYYY-MM-DD — N sources (shows) · X new · Y enrich · +Z words · deployed <sha> · notes
```

---

## 7. Report (the only chat output)

Six lines, plain English, no file paths:

```
Morning intake, <date>.
In: N videos (show names) — or "nothing new today".
Written: X new articles, Y enrichments, +Z words.
Skipped: list with one-word reasons.
Deferred to audio: N caption-less videos.
Live: deployed and verified.
```
