# Enrichment log

Daily record of the enricher pass: starving articles refed from uncited passages
already sitting in the corpus. One dated section per run.

---

## 2026-08-06 — 15/15 fattened

Branch: `kiriakou-intake-churn`. Mentions index rebuilt (1049 articles indexed). No carryover
from the 2026-08-05 run — nothing was left `in-progress`. Candidates were ranked by starvation
using the article's *distinctive* title terms rather than the raw alias list, because the index's
generic aliases ("story", "room", "news", "intelligence") produce hundreds of false fresh-source
hits and put pure noise at the top of the list. The seven articles the previous run logged as
starving-but-unfuelled were excluded from the pool, as were the fifteen it had already fattened.

| Article | Words before → after | New facts | New sources |
|---|---:|---:|---:|
| dianne-feinstein | 118 → 723 | 9 | 8 |
| dead-drop | 175 → 778 | 7 | 9 |
| secret-service | 158 → 881 | 10 | 4 |
| john-bolton | 171 → 710 | 6 | 4 |
| donald-rumsfeld | 190 → 917 | 8 | 8 |
| bill-binney | 256 → 710 | 7 | 5 |
| consortium-news | 253 → 801 | 7 | 5 |
| sam-adams-award | 252 → 609 | 6 | 2 |
| pflp | 170 → 847 | 8 | 7 |
| jake-tapper | 220 → 743 | 7 | 6 |
| home-confinement | 290 → 810 | 7 | 6 |
| learned-helplessness | 198 → 715 | 7 | 5 |
| american-psychological-association | 242 → 746 | 5 | 2 |
| kiriakou-greek-citizenship | 229 → 589 | 5 | 4 |
| senior-intelligence-service | 271 → 912 | 8 | 6 |

Every article cleared the floor (≥3 new sourced facts from ≥2 distinct new sources). Nothing
left `in-progress`.

### Best finds

- **senior-intelligence-service** — the article had the promotion rule but none of the politics.
  Added: John Brennan being told by his own supervisor that he would never make the service and
  being fired on the spot, six weeks from unemployment, landing on the PDB staff because it was
  Christmas and that was the only job open; the service as the room where the torture techniques
  were actually written, with Mitchell and Jessen, before the package went to the White House,
  Justice, and back for signature; and the tenure argument — career officers with twenty to
  forty-two years in place who wait presidents out, decline covert action as "too dangerous", or
  answer an order to focus on China with "yeah, we'll get right on that" and ignore it.
- **dead-drop** — the Tysons Corner failure, which was missing entirely. Kiriakou's only
  criticised exercise at the Farm: a perfect fake key-rock site, a clean surveillance detection
  route, and then a stairwell door repainted in glossy paint during the week between choosing the
  signal site and marking it. The chalk crumbled, the agent never learned the drop was made, and
  surveillance watched him scraping at a door "like a crazy person" — in a hostile environment,
  arrest and expulsion.
- **secret-service** — the Butler rally in operational detail rather than as a one-line verdict:
  Kiriakou grew up walking distance from those fairgrounds and went every year; external building
  coverage was outsourced to the county sheriff's department; no drone coverage, when drones had
  been standard on layered perimeters at Bagram for a decade; and no shared radio net, so a cop
  who sees a shooter has to go cop → his dispatch → Secret Service dispatch → agents.
- **dianne-feinstein** — the Haspel reversal, previously absent: she blocked Haspel's promotion
  in 2013 over the secret site, then told Politico in 2018 she had great respect for her, the
  only intervening change being a dinner.

### Attribution decisions

- **DeProgram** (Ted Rall and Jamarl Thomas plus guest) carries no speaker labels and has three
  voices. A substantial passage about Jake Tapper's 2025 Biden book — the "politburo" of five
  insiders, Beau Biden's death in 2015, the Pelosi meeting one week into the presidency, "Jill
  Biden is Lady Macbeth" — could not be attributed to Kiriakou with confidence and was cut rather
  than guessed. It is worth revisiting if a labelled telling of the same material turns up.
- **american-psychological-association** — the corpus's only real account of the APA's own
  collusion (the PENS task force, the behavioural science consultant teams, the membership
  referendum, the Hoffman report) is the psychologist Brad Olson speaking at a November 2015
  event where Kiriakou also spoke. It is included under an explicit heading marking it as not
  Kiriakou's testimony and outside the single-source canon, following the precedent set for
  national-security-agency in the previous run.
- **sam-adams-award** — the "Sam Adams project" the FBI suspected Kiriakou of sourcing is an
  ACLU Guantánamo defence effort, unrelated to the award or the Associates. The name is retained
  as the captions render it and flagged in the article, per doctrine rule 5.
- Contradictions were preserved rather than smoothed: Kiriakou's day-seven / day-nine / day-twelve
  figures for sleep-deprivation damage vary between tellings, and his home-confinement accounts
  give both 87 statutory days and "every last day of the 23 months" in the cell. Both are stated.

### Starving but unfuelled — the shopping list for the ingest routines

Still true from the 2026-08-05 run and not re-attempted: ethan-mccord-collateral-murder (and its
false citation, still unfixed), katherine-gun, peter-thiel, marble-framework, miranda-rights,
afghan-war-logs, todd-blanch.

New this run — thin, high apparent fresh-source counts, no real fuel:

- **advanced-counterterrorism-operations** (197 words) and
  **advanced-counterterrorism-operations-course** (237 words) — both rank near the top of every
  starvation list purely because their titles end in generic words. The two are near-duplicates
  of each other and should probably be merged rather than enriched.
- **chaos-computer-club-wikileaks** (74 words), **afghan-languages** (64 words),
  **ai-whistleblower-initiative** (62 words) — the index's fresh counts come from matching
  "wikileaks", "languages" and "initiative" across the whole corpus. Nothing subject-specific.
- **bay-path-university** (55 words) and **restraint-camp** (52 words) — the two thinnest
  articles in the pool. Single passing mentions in the corpus; they need new sources.

### Ship status

Build clean (0 bugs, 843 suspicious aliases, 0 dead links, 1054 articles).

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

### Ship status

Build clean (0 bugs, 0 dead links, 982 articles). Committed as `da76186`.
**Deployed and live** — `vercel deploy --prebuilt --prod` hit the free-tier
5,000-file upload cap, so the deploy went out via `--archive=tgz`.
www.kiripedia.org returns 200, all fifteen pages verified live by content, and
IndexNow accepted 117 changed URLs (HTTP 200).

**Push is still blocked, and not by anything this run did.** The branch is 17
commits ahead of origin, and somewhere in that unpushed history sits
`public/article-mentions-index.json` at 160MB — past GitHub's 100MB per-file
ceiling, so the pre-receive hook rejects the whole push. The 2026-08-05 SEO log
records the same blocker. This commit untracks the file and adds it to
`.gitignore` so it stops growing the problem, but the existing blob still has to
be stripped from the unpushed commits before `git push` will go through, and that
is a history rewrite this routine is explicitly not allowed to perform. Someone
needs to do that cleanup by hand; until then every routine on this branch will
keep deploying without pushing.
