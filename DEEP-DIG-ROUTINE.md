# The Deep Dig

*Mondays and Thursdays, 15:00, two hours. The backlog routine.*

This replaces the daily source-squeeze and the daily noon archaeology, which were two
routines chasing the same backlog from opposite ends and coming back empty. Twice a week
gives the queue time to be worth digging.

Read `/Volumes/EOS_DIGITAL/OPERATING-CYCLE.md` first, and `ARTICLE-WORKFLOW.md` plus
`INGEST.md` §5–6 before writing anything. Working directory: `/Volumes/EOS_DIGITAL/KiriPedia`.

---

## What this routine is for

Two backlogs, both old, both neglected by the daily routines:

- **Inside** — transcripts already fetched, cleaned, and never mined. No article cites
  them. Hundreds of hours of already-paid-for material sitting unread.
- **Outside** — Kiriakou interviews and appearances that exist somewhere on the internet
  and are missing from the catalogue entirely, going back to 2007.

The morning intake handles what is *new*. This routine owns what is *old*, and it is the
only routine that does.

## Order of work, and why

**Inside first, outside second.** The inside backlog is a guaranteed yield; the outside
hunt is speculative. A run that runs out of time has still produced something.

Split the budget roughly 70/30 — about eighty minutes squeezing, about forty digging.

---

## Phase 1 — Squeeze the inside backlog

### The queue problem, first

On 2026-08-13 this pass rejected **nineteen of twenty** candidates, and almost all of them
had already been judged dead by an earlier run. The ledger kept offering back work that
was already known to be worthless. That is the largest single waste in the whole cycle
and fixing it is part of this routine's job, not a nice-to-have.

**Every rejection writes back, in the same run, before you move on:**

- Set the ledger row to `rejected (<one-line reason>)`.
- Add the id to `.kir-exclude.txt` with the reason.
- If it was rejected as a duplicate, name the canonical source it duplicates.

A candidate judged dead must never be offered again. If you find yourself rejecting
something for a reason a previous run already recorded, that is a bug in the write-back —
fix the write-back before continuing, and say so in the report.

### Then dig

1. Regenerate the ledger: `node tools/build-unwritten-ledger.mjs`. Hand-set statuses
   survive regeneration.
2. **Carryover first.** Rows left `in-progress` from last time get finished before
   anything new starts.
3. **Before reading anything, dedupe the whole batch in one pass.** Build the shingle
   index over existing sources and hash every candidate against it. The 08-13 run proved
   this kills roughly half the queue in minutes — do it first, always, rather than
   discovering duplicates one at a time after reading them.
4. Fill the batch with the richest remaining `pending` rows. Mark them `in-progress`
   immediately so a crashed run resumes cleanly.
5. **Read each transcript whole.** Not skimmed, not sampled — that is the entire point.
   Write a content map to `.kir-morning/squeeze-map-<slug>.md`: arcs with timestamp
   ranges, and for each arc whether it becomes a new article or enriches existing ones.
6. Write everything the map calls for. Floor of eight article changes per transcript.
   Every arc lands somewhere. Never pad, never leave a real finding unwritten.
7. Set the row to `written`.

**Watch for the malformed-caption trap.** A row sitting at `paragraphs: 0` with the whole
episode stranded in a `.sponsors` sidecar is usually a broken caption download, not an
empty episode — the entire transcript arrives inside one cue. Re-fetch the auto-captions,
keep the original alongside, and the episode comes back. That pattern has recovered
~49,000 words in a single run.

**The richest seam right now** is sources with only one or two citing articles, longest
first, and Kiriakou's own 2026 shows — Briefing Room, JK Report, Dead Drop — which are
barely cited. Also: run `git status` on `src/content/sources/` before trusting the ledger.
Freshly-ingested untracked transcripts from an intake run beat anything the ledger holds.

---

## Phase 2 — Dig outside the catalogue

The easy finds are gone. Assume every obvious query has been run. Be an archaeologist,
not a search box.

**Load the exclusion set before searching** or you will spend the phase rediscovering the
corpus: every `videoId` in `src/content/sources/`, `.kir-intake-progress.tsv`,
`.kir-exclude.txt`, and the standing ledgers — `SOURCE-DISCOVERY.md`,
`KIRIAKOU-OPEN-VIDS.md`, `KIRIAKOU-MASTER-LEDGER.md`, `KIRIAKOU-UNIVERSE.md`.

Read `ARCHAEOLOGY-LOG.md` for which angles previous digs have already exhausted. **The
2026-08-13 dig returned zero and the cause was the exclusion set itself** — check it is
being built correctly before concluding a seam is dry.

Take anything already listed as a candidate but never ingested first; those are free.

Then rotate through angles, choosing different ones than the last few digs used:

- **Backwards through his career, year by year** — the 2007–2012 press-tour era, the
  prosecution, the prison years, the post-release circuit, the Sputnik years, Dead Drop.
  Search each period in the vocabulary of that time.
- **Chase the interviewer.** Hosts who had him once usually had him repeatedly, and older
  or newer channels carry episodes the main one doesn't.
- **Chase the topic, not the name** — waterboarding, Abu Zubaydah, the Espionage Act,
  Loretto, Assange, Snowden, Iran. He was the booked expert voice on each for years.
- **Chase co-guests** — McGovern, Radack, Drake, Rowley, Ellsberg, Hedges, Horton, Maté,
  Halper.
- **Mine the transcripts you hold.** He constantly says "I was on X last week". Grep the
  corpus for show and host names missing from the catalogue.
- **Leave YouTube** — podcast directories, RSS, university and think-tank recordings,
  C-SPAN, foreign outlets in English, radio archives, the Internet Archive.
- **Vary the string** — misspellings, his titles rather than his name, episode numbers.

**Vet before ingesting.** Reject clips and re-cuts, re-upload channels, reaction videos,
dubs, audiobook samples, and his own shows where he hosts other people. Keep full episodes
where he is the interviewee. Same show plus same date is almost certainly a duplicate —
check date and show, not just the id.

Ingest through `tools/churn.sh` with `PUSH=0`, then write the editorial half properly.

Log every angle tried and what it returned, **including the dead ends** — that is what
stops the next dig repeating you.

---

## Finish

No build. No deploy. The 19:00 publisher ships it.

1. Run the fast audits — `node tools/audit-frontmatter.mjs && node tools/audit-wikilinks.mjs`
   — and they must report `0 bugs, 0 dead`.
2. Stage your own files by explicit path. One commit. Push. **The tree must be clean when
   you exit**, even if the run was partial.
3. One line in `DIARY.md`. The long detail goes to `ARCHAEOLOGY-LOG.md` and `MORNING-LOG.md`
   as before.

Leave anything unfinished at `in-progress` so the next dig picks it up first. Never
quietly shrink the batch and report success — say how many you finished and how many
carried over.

End with a short plain-English report: how much was mined, the best two or three finds,
what was dug up from outside, what was rejected and why, and what carried over. No file
paths, no jargon.
