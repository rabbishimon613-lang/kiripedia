# Enrichment log

Daily record of the enricher pass: starving articles refed from uncited passages
already sitting in the corpus. One dated section per run.

---

## 2026-08-05 — 15/15 fattened

Branch: `kiriakou-intake-churn`. Mentions index rebuilt; candidates ranked by
starvation (thin **and** carrying uncited mentions with a distinctive title term),
not by thinness alone. No carryover from a previous run — this is the first entry
in this log.

| Article | Words before → after | New facts | New sources |
|---|---:|---:|---:|
| ted-rall | 107 → 342 | 4 | 3 |
| government-accountability-project | 88 → 726 | 9 | 4 |
| george-habash | 77 → 520 | 7 | 6 |
| citizens-united | 102 → 474 | 6 | 3 |
| robert-maxwell | 88 → 418 | 5 | 4 |
| zbigniew-brzezinski | 28 → 316 | 5 | 3 |
| lawrence-wilkerson | 90 → 524 | 6 | 3 |
| family-jewels | 106 → 480 | 7 | 2 |
| karl-rove | 91 → 476 | 9 | 2 |
| bob-trout | 123 → 539 | 8 | 5 |
| communications-management-unit | 156 → 663 | 10 | 5 |
| mike-baker | 172 → 637 | 8 | 3 |
| the-sociopath-next-door | 83 → 492 | 6 | 4 |
| abu-omar-rendition | 152 → 871 | 11 | 3 |
| national-security-agency | 126 → 665 | 8 | 4 |

Every article cleared the floor (≥3 new sourced facts from ≥2 distinct new sources).
Nothing left `in-progress`.

### Best finds

- **karl-rove** — the whole 2008 Rendon contract, previously two sentences: Singapore
  to Jakarta by helicopter, the general's Holiday Inn chain and joint-chiefs past,
  Rove opening with TV and radio spots, Kiriakou stopping the meeting over the YouTube
  video of six students stabbed one by one, $25,000 for four op-eds no paper would
  print, and why he took it — just fired, four kids, no income.
- **mike-baker** — how Baker's CIA career actually ended. An old Greek lady watching
  a parked van through her drapes called the police; three changes of disguise each
  and six ID cards in six names; expelled from Greece; resignation demanded the same
  afternoon he expected a commendation.
- **abu-omar-rendition** — the operation itself, absent until now: a dozen officers,
  weeks of surveillance, the van on the mosque route, and the tradecraft failures
  (souvenirs on a real-name credit card, calls home from hotel rooms) that let the
  Italians identify and indict every officer on the team.

### Corrections made while enriching

- **zbigniew-brzezinski** was a misattribution end to end. Its only sentence credited
  Brzezinski with the Analysis Corporation link and a vote for Gus Hall; in the source
  those are John Brennan's, and the speaker is an interview guest, not Kiriakou. The
  claim was removed and the article rebuilt on Kiriakou's own Afghanistan material.
  Category also corrected from Concepts to People.
- **bob-trout** and **the-sociopath-next-door** were miscategorised as Concepts;
  bob-trout moved to People.
- **national-security-agency** was sourced entirely to Tom Drake, not Kiriakou. It has
  been rebuilt on Kiriakou's own account, with Drake's testimony retained under an
  explicit "not Kiriakou's" heading rather than presented as canon.

### Starving but unfuelled — the shopping list for the ingest routines

These are thin and could not be fixed from material already on disk. They need new
sources, not enrichment.

- **ethan-mccord-collateral-murder** (35 words) — no Kiriakou material anywhere in the
  corpus. Worse, its single citation points at
  `2026-03-20-disruption-network-lab… @ 32:33`, which is a passage about Hegseth and
  Gabbard and has nothing to do with McCord. **The citation is false and should be
  pulled or replaced.** Flagged here rather than fixed, as it belongs with whoever
  owns that ingest.
- **katherine-gun** (112 words) — deliberately a null article; the corpus's only
  mention sits in an unlabelled multi-speaker panel and cannot be attributed. Correct
  as it stands; needs a new source, not a rewrite.
- **peter-thiel** (227 words) — every uncited mention is a host or panellist speaking,
  not Kiriakou. One affirmation ("that's exactly right", on Palantir and a Stanford
  alum) is all that is attributable. Below the floor.
- **marble-framework** (233 words) — all uncited passages are Ray McGovern, Scott
  Horton or a panel guest describing Vault 7. Nothing in Kiriakou's own voice.
- **miranda-rights** (140 words) — one genuinely good new passage
  (`2026-04-27-dead-drop-s1e25` @31:45, the Lindh warning that was never given and the
  confession that could not be used), but only that one source. Folded into
  government-accountability-project instead, where it belongs.
- **afghan-war-logs** (154 words) — the only two Kiriakou passages are near-duplicate
  captures of the same February 2020 interview, so the two-source floor is not really
  met. Worth revisiting if a new Assange-extradition source lands.
- **todd-blanch** (153 words) — the index's "fresh" count is an artefact of matching
  the phrase *carte blanche*. No real fuel; slug may also want checking against the
  intended subject.

### Method notes

- Deprogram and other multi-host transcripts carry no speaker labels, so attribution
  was resolved passage by passage from surrounding cues (who is addressed by name,
  who answers). Where it could not be resolved, the passage was cut rather than
  guessed — this is why several otherwise juicy Citizens United and Robert Maxwell
  passages did not make it in.
- Per doctrine rule 5, the Indonesian general's name in the Rove story is retained as
  the captions render it, with the transcription artefact flagged in the article.

Build clean (0 bugs, 0 dead links, 982 articles). Committed, pushed and deployed.
