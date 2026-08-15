# Enrichment log

Daily record of the enricher pass: starving articles refed from uncited passages
already sitting in the corpus. One dated section per run.

---

## 2026-08-07 — 15/15 fattened

Branch: `kiriakou-intake-churn`, in sync with origin at the start of the run. Mentions index
rebuilt (1142 articles indexed, 856 transcript files). No carryover — nothing was left
`in-progress` by the 2026-08-06 run.

**Ranking method, and a correction to it.** The index's own `uncited_mention_count` is unusable
for ranking: its generic aliases put `permanent-multipolar-world` (alias "world", 827 sources)
and four different `*-story` articles (alias "story", 768 sources) at the top. As in the
previous two runs, candidates were ranked on *distinctive* title terms instead — but this run
also found that a naive substring grep is still wrong. `abraham-bolden` scored 14 fresh sources
on the term "bolden"; every one of them was the word *emboldened*. Word-boundary matching was
applied to the whole shortlist before any article was opened, and it eliminated ten candidates
outright: **abraham-bolden, bernie-kerik, ross-ulbricht, maria-butina, russell-targ, jane-harman,
walter-pincus, matt-dehart, skip-gnehm, ismail-haniyeh-assassination** — all zero real hits in
the corpus. Each of those articles carries at least one citation, so the subject exists in a
source under a different caption spelling; they need the spelling resolved, not enrichment.

| Article | Words before → after | New facts | New sources |
|---|---:|---:|---:|
| cuban-double-agents | 113 → 531 | 6 | 4 |
| china-djibouti-base | 127 → 773 | 9 | 9 |
| kent-state | 161 → 586 | 5 | 6 |
| james-clapper | 166 → 930 | 8 | 4 |
| allen-dulles | 179 → 748 | 7 | 4 |
| greenland | 201 → 753 | 9 | 6 |
| monroe-doctrine | 172 → 736 | 7 | 2 |
| james-angleton | 200 → 949 | 9 | 5 |
| denied-areas | 218 → 717 | 7 | 4 |
| ground-branch | 243 → 881 | 8 | 4 |
| condoleezza-rice | 226 → 743 | 6 | 6 |
| petra-bank | 241 → 646 | 7 | 3 |
| alec-baldwin | 157 → 608 | 6 | 2 |
| salt-pit | 219 → 637 | 7 | 2 |
| bill-casey | 243 → 558 | 5 | 2 |

Every article cleared the floor (≥3 new sourced facts from ≥2 distinct new sources). Nothing
left `in-progress`.

### Best finds

- **james-angleton** — the article was a single anecdote about a wall of file folders. Added the
  whole Philby collapse in Kiriakou's own telling: that Angleton and Kim Philby were best man at
  each other's weddings and Angleton was godfather to Philby's daughter, a bond he reaches for
  the Greek *koumbaros* to describe because English has no word for it; Philby's escape from the
  British ambassador's Christmas party in Beirut through a bathroom window to the Soviet embassy,
  and his press conference in Moscow six days later; and the verdict of an old-timer Kiriakou
  worked with who would turn and walk the other way down the hall rather than pass Angleton —
  that after learning Philby was the mole "he kind of lost his mind and never got it back." Also
  added the declassified-JFK-files finding Kiriakou calls the biggest bombshell of the release:
  that Angleton ordered CIA officers to recruit Lee Harvey Oswald.
- **ground-branch** — a federal appeals court ruling that had never been in the corpus. Kiriakou
  reports the Ninth Circuit held that contractors may kill and kidnap on the CIA's behalf so long
  as they hold a written contract and the Agency has presidential authority; the plaintiff was
  Abu Zubaydah, and the court's answer was that he had been tortured but the men were acting for
  the CIA, which was legally permitted to torture. One of the attorneys in the case telephoned
  Kiriakou to ask why nobody in the media cared. Also added his flat statement of the mission —
  "kill or kidnap and render anybody who might be a threat" — and the office norm around it:
  "You know what they're doing. I know what they're doing. Everybody in the office knows what
  they're doing. Nobody mentions it."
- **greenland** — two of Kiriakou's own contacts flatly contradicting each other, which the
  article now states as a contradiction rather than resolving. A White House friend says the
  United States is serious, will not attack, and will lean on the 1951/1953 Danish treaty to
  argue Greenland is already de facto American; a friend who used to chair the Republican Party
  in Texas says Trump has no designs on it at all and throws grenades into the room to distract
  the press from confirmation fights and the tax bill. Also added the rare-earth mechanism he
  says is the real driver — all of it refined in China, at a deliberate loss, to hold the
  monopoly — and House Resolution 1116, which would take Greenland by any means necessary and
  rename it "Red, White, and Blue Land."
- **china-djibouti-base** — how the shared base came to exist, in two lines of dialogue: the
  French abandoned Camp Lemonnier, the Djiboutians asked the Americans "You want this?", the
  answer was "Yeah, it's 16 miles from Yemen, sure, we'll take it," and the Chinese then asked
  for a share of the same ground. Plus the detail Kiriakou noticed on the ground — the Chinese
  keep all their hangar doors open and the Americans keep theirs closed — and the eight men
  convicted of murder or armed robbery held on the joint base while Washington tried to expel
  them to South Sudan.
- **salt-pit** — the cold cell, absent until now, which Kiriakou rates as worse than
  waterboarding: a naked prisoner chained to an eye-bolt in the ceiling so he can neither sit nor
  lie down, the cell chilled to 50°F, and an officer entering every hour to throw a bucket of ice
  water over him. "We killed several prisoners with the cold cell."

### Attribution decisions

Speaker attribution ate a substantial share of this run, and four passages that looked like good
fuel were cut after checking who was talking:

- **collateral-murder-video** — of nine corpus passages naming the video, only one is Kiriakou.
  The Howie Hawkins passage is Hawkins introducing him; the Revolutionary Change passage is Medea
  Benjamin; the Katie Halper passage is Halper; the Democracy Now passage is the filmmaker James
  Spione; the Disruption Network Lab and Consortium News passages are panellists. The article was
  enriched anyway from the one attributable source (Sharyl Attkisson — the Reuters cameramen, the
  firing on the rescuers and the ambulance, and the 99 percent of the tranche that was routine
  cabling) because the material is real and correct, but it is **below the two-source floor and
  is not counted toward the 15**. See the skip list below.
- **greenland** — the claim that the Danish military flew planeloads of explosives to Greenland
  in the middle of the night to blow up their own runways is the Deep Focus host's, not
  Kiriakou's, and was cut despite being the single most striking thing in the search results. The
  Piers Morgan "grotesque breach of trust" passage is a British panellist, not Kiriakou; also cut.
- **allen-dulles** — the Eisenhower "legacy of ashes" line is the Around the Empire host's, not
  Kiriakou's. Cut.
- **james-angleton** — the "Angleton was clearly a Mossad double agent" line in the Kim Iversen
  interview cannot be cleanly assigned between host and guest, and the hedge that follows it
  ("we don't know for a fact, I guess") reads as the host's. The article records only that
  Kiriakou notes people are starting to look at the Israeli angle, which is unambiguously his.
- Contradictions were preserved rather than smoothed. Kiriakou dates the Monroe Doctrine to 1823
  in one telling and 1814 in another; gives the Petra Bank theft as $36 million in three tellings
  and $30 million in a fourth; says the Guatemalan dictatorship brutalised the country for "20
  plus years" in one account and "half a century" in another; and says the friend's daughter was
  "one of the five" killed at Kent State. All are stated as he states them.

### Corrections made while enriching

- **china-djibouti-base** carried the title *Djibouti*, identical to the separate `djibouti`
  article, and the two overlapped heavily. It has been retitled **China's base in Djibouti** and
  narrowed to the shared base and the small-state intelligence material, so the pair is no longer
  duplicative. The two articles now cross-link. A full merge is still worth considering but is a
  structural decision, not an enrichment one.
- **alec-baldwin** carried three malformed citation timestamps written as `t="[32:18]"` — square
  brackets inside the attribute. Fixed, and the timestamps re-verified against the transcript.
- **ed-schultz** had two consecutive sections, *"The label after death"* and *"Labelled after his
  death,"* telling the same story twice, one of them with doubled apostrophes leaking out of the
  YAML escaping into the prose. Woven into one passage. Ed Schultz was **evaluated as a candidate
  and rejected** — its remaining fuel is one line in a 2019 interview — so this is a defect fix,
  not a counted enrichment.
- **denied-areas**, **bill-casey** and **greenland** each gained a correction of fact from the
  fuller telling: Syria and Iran are named as denied areas alongside the Soviet Union and Cuba;
  Casey named his own deputy director *for operations* as well as his own deputy, a businessman
  with no intelligence experience; and the Djibouti service measurement is that Kiriakou's whole
  townhouse was twice the size of the entire service, not merely that the director's office was
  small.

### Starving but unfuelled — the shopping list for the ingest routines

Still true from previous runs and not re-attempted: ethan-mccord-collateral-murder (and its false
citation, **still unfixed** — this is now three runs old), katherine-gun, peter-thiel,
marble-framework, miranda-rights, afghan-war-logs, todd-blanch,
advanced-counterterrorism-operations and its near-duplicate
advanced-counterterrorism-operations-course, chaos-computer-club-wikileaks, afghan-languages,
ai-whistleblower-initiative, bay-path-university, restraint-camp.

New this run:

- **The ten spelling casualties** — abraham-bolden, bernie-kerik, ross-ulbricht, maria-butina,
  russell-targ, jane-harman, walter-pincus, matt-dehart, skip-gnehm,
  ismail-haniyeh-assassination. Each has zero word-boundary matches for its subject anywhere in
  856 transcripts, yet each carries a citation. The auto-captions are rendering these names
  some other way. This is the highest-value item on the list: resolving the caption spellings
  would unlock ten articles at once, and the same distortion is presumably hiding material for
  articles nobody has flagged yet.
- **collateral-murder-video** (161 → 329 words) — enriched but below floor. One attributable
  Kiriakou source in the whole corpus; everything else is hosts and panellists. Needs a new
  source in which Kiriakou himself discusses the video at length.
- **sandy-berger** (159 words) — the index's eight fresh sources are Rosenberger, Greenberger,
  Berkman and Wasserman Schultz. One passing mention of the real subject. Needs new material.
- **ed-schultz** (234 words) — one usable new line ("they kicked Ed Schultz off at MSNBC and he
  went to RT") plus a duplicate capture of a telling already cited. Below floor.
- **uk-secrecy-laws** (217 words) — evaluated and rejected. Its twelve "official secrets" hits are
  dominated by the Disruption Network Lab panel, where the speaker on UK secrecy law is Annie
  Machon, not Kiriakou. The article as it stands is already built on the attributable material.
- **djibouti** (263 words) — deliberately left alone this run to avoid double-counting against
  china-djibouti-base, which was fattened from the same source pool.

### Ship status

Build clean: 1147 articles, frontmatter audit clean, **0 bugs, 0 dead links**, 957 suspicious
aliases (informational). One HIGH-confidence wikilink bug was introduced during writing — a DYK
line reading `[Ninth Circuit](/wiki/abu-zubaydah)` — and was caught by `audit-wikilinks.mjs`
before commit and rewritten. Built output verified against source rather than trusted: all
seventeen touched pages present in `dist/`, and five distinctive new phrases grepped out of the
rendered HTML to confirm the new prose actually shipped.

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

Build clean (0 bugs, 843 suspicious aliases, 0 dead links, 1054 articles). Committed as
`225d6f2e` and **pushed** — the 160MB-blob blocker recorded in the 2026-08-05 entry is gone,
the branch is in sync with origin, and no history rewrite was needed. **Deployed and live**;
all fifteen pages verified by content on www.kiripedia.org, which returns 200. IndexNow
accepted 122 changed URLs (HTTP 200).

**New deploy blocker, and the fix.** `vercel deploy --prebuilt --prod` failed the first time
with "File size limit exceeded (100 MB)". The cause is `public/article-mentions-index.json`,
now 173MB: it is gitignored, but it still sits in `public/`, so Astro copies it into `dist/`
and from there into `.vercel/output/static/`, and Vercel rejects the deployment on that one
file. Deleting the two copies out of `dist/` and `.vercel/output/static/` before re-running
the deploy cleared it, and the source file was left in place because the other routines read
it. **This will recur on every deploy until the generator stops writing into `public/`.**
`tools/build-mentions-index.mjs` should write the index somewhere outside the published
directory; that is a one-line change but it is a code change, so it is flagged here rather
than made inside an enrichment run.

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

---

## 2026-08-08 — enricher pass

**15 of 15 articles fattened.** Mention index rebuilt from scratch (1,292 articles indexed;
886 sit at 11+ uncited mentions, 174 at zero). Candidates ranked by starvation — thin *and*
fuelled — rather than by thinness alone.

| Article | Words before → after | New facts | Distinct new sources |
|---|---|---:|---:|
| april-glaspie | 169 → 737 | 11 | 3 |
| shin-bet | 290 → 851 | 9 | 5 |
| john-ratcliffe | 331 → 865 | 9 | 6 |
| pike-committee | 271 → 796 | 8 | 6 |
| hamid-karzai | 168 → 590 | 7 | 5 |
| bill-burns | 231 → 577 | 7 | 3 |
| richard-helms | 331 → 661 | 7 | 6 |
| admit-nothing-deny-everything | 121 → 560 | 6 | 5 |
| william-webster | 132 → 513 | 6 | 4 |
| maria-corina-machado | 156 → 522 | 6 | 2 |
| william-donovan | 148 → 491 | 6 | 5 |
| josh-shapiro | 160 → 497 | 5 | 4 |
| avril-haines | 148 → 452 | 5 | 3 |
| alexa | 67 → 416 | 5 | 4 |
| kim-philby | 157 → 364 | 4 | 2 |

Nothing left in-progress.

### Best finds

- **pike-committee** — the classified annex. A sitting senator and committee chairman called
  Kiriakou to the Hill for help getting 1975 documents he had been denied for seven years:
  a classified annex to a report whose entire point was that it was public. Its existence was
  denied for seven years, then it turned up sealed and dust-covered in a Senate basement, and
  he still cannot open it. Leadership won't referee a dispute between two chairmen, and
  because these are congressional documents classified by a congressional committee they are
  outside FOIA — Congress having exempted itself from the laws it passes. Kiriakou says the
  story punctured his own belief in the 1975–82 "golden age."
- **april-glaspie** — the night in the operations center. Glaspie herself asked Baker for the
  meeting with Saddam; his reply came back as a NODIS cable printable only in the CIA
  operations center, where analysts could read and take notes but not quote or copy it; ten
  or twelve of them stood waiting for her reporting cable. Saddam said nothing at all. The
  CIA said invasion, State said Rumaila oil field, and the talking points were written to
  State's reading. Kiriakou's verdict on the green-light charge — *"I was there that night.
  She got a bum rap."*
- **william-webster** — the Oval Office seating on the morning of the invasion, which registers
  the hierarchy exactly: Bush and Quayle in overstuffed chairs, the National Security Advisor
  and the Director of Central Intelligence on what looked like dining-room chairs, and the
  25-year-old briefer on the couch — who then answered the President's question.
- **shin-bet** — the 1990 recruitment approach filled in from five tellings: the date, the
  briefing subject, the eight-to-ten-person table, and what it felt like (*"it enraged me,
  the question"*), plus the boss's shrug that they do it to everyone, and the standing
  asymmetry — the CIA is *"absolutely, positively forbidden"* from spying on Israel while the
  FBI had 187 undeclared Mossad officers identified across the United States.

### Corrections made while enriching

- **richard-helms** carried a false citation, the same class of error flagged for
  ethan-mccord in the previous pass. Its core claims — Church's order, the destruction, the
  $100 fine paid by colleagues in the hallway — were sourced to
  `2025-11-19-julian-dorey-vault-7 @37:58`, a passage about the CIA's deputy director for
  innovation. That transcript contains no mention of Helms or MK-Ultra at all. The correct
  source is `2026-05-04-cleared-hot-446-cost-of-truth` at the same timestamp; fixed, and the
  Helms attribution strengthened with two further tellings that name him.
- **richard-helms** also asserted the surviving MK-Ultra fraction had been "misfiled in a
  financial-records warehouse." Nothing in the corpus supports the warehouse; what Kiriakou
  says is that what survived was largely financial records, from which the program had to be
  reconstructed. Rewritten to that, and the surviving share now records his variance (15% in
  most tellings, 20% in others).
- **william-webster** claimed he was "the only person to have served as both FBI and CIA
  director." Kiriakou never says this; he gives the sequence (federal judge, FBI, CIA) and
  nothing more. The external superlative was removed from summary, prose and DYK.
- **william-donovan** (`2:00`) and **pike-committee** (`22:22`) carried timestamps that do not
  exist in their sources — a zero-padding slip and a wrong paragraph. Both corrected.

### Starving but unfuelled — the shopping list for the ingest routines

- **ali-hassan-al-majid** (140 words) — the index's fuel is an alias collision: every "al-Majid"
  hit is Hussein Kamel or Saddam Kamel al-Majid, Saddam's sons-in-law, not Chemical Ali. The
  one real passage is in a duplicate upload of a source already cited. Needs new material.
- **only-fans** (80 words) — the ad-offer story is genuinely good, but it exists as three
  captures of a single telling (`cleared-hot-446`, `covert-operations-insight`,
  `national-security-files`). One telling, not two sources.
- **eric-swallwell** (81 words) — one strong new passage (the honey-trap episode, 2026-07-16).
  Everything else is a host reading news copy. Below the two-source floor.
- **cory-booker** (168 words) — the AIPAC recruitment story attached to him is inside the same
  Megyn Kelly interview already cited; the two deprogram passages cannot be attributed to
  Kiriakou rather than Rall.
- **christopher-hitchens** (145 words) — one source only (`2026-03-11-deprogram-ted-rall`), but
  a rich one: the Vanity Fair waterboarding, Hitchens thinking Kiriakou had exaggerated, and
  Kiriakou's admiration alongside his anger at Hitchens's war position. Worth writing the day
  a second telling lands.
- **barbara-leaf**, **fort-gordon**, **robert-maclean**, **black-cube**, **waco-siege**,
  **ruby-ridge**, **trump-dni-replacement** — index counts are alias noise (leaf, gordon,
  MacLean/McLean, cube, siege, ridge, replacement). Not real fuel.

### Method notes

- **`.sponsors` sidecars must never be cited.** 262 of them exist, they are not rendered as
  pages (zero appear in `dist/sources/`), so any citation to one is a dead reference. Worse,
  the sponsor detector has false positives — real interview content is sitting in at least
  `2024-12-21-not-a-grayman.sponsors` — so they look like fuel in the mention index. All
  candidate mentions were filtered on `.sponsors` before use. Two live articles
  (marjorie-taylor-greene, oliver-stone) still carry such citations and should be repointed.
- Duplicate uploads of one interview are common (both Bidoun Waraq Kuwait files, both
  2026-04-02/04-03 Megyn Kelly files, three captures of Cleared Hot 446). They are cited as
  corroboration but never counted toward the two-source floor.
- Multi-host and panel transcripts carry no speaker labels. Crossing Faiths material on Karzai
  was cut once the speaker resolved as the host; the same for a Bill Burns/Ukraine passage in
  a Gonzalo Lira roundtable, a Liberty Vault passage on Ratcliffe, and the Official Secrets
  Act passage in Disruption Network Lab, which is Annie Machon and not Kiriakou.
- `james-angleton` and `james-jesus-angleton` are two live articles on the same person. Not
  merged here — that is a cleanup job, not an enrichment.

---

## 2026-08-09 — enricher pass

**15 of 15 articles fattened.** Mention index rebuilt from scratch (1,375 articles; 941 sit at
11+ uncited mentions, 186 at zero). The raw uncited counts are now badly inflated by
single-word alias collisions — the top of the starvation ranking was `bay-path-university`
matching every occurrence of the word *university*, `national-endowment-for-democracy`
matching *democracy*, `cori-bush` matching *Bush*. Candidates were therefore re-ranked on
distinct uncited sources whose passage actually contains a **multi-word** alias, which cut the
pool from 1,375 to 58 real candidates and made the shortlist honest.

| Article | Words before → after | New facts | Distinct new sources |
|---|---|---:|---:|
| ramzi-bin-al-shibh | 374 → 1092 | 11 | 5 |
| yasser-arafat | 339 → 1085 | 11 | 4 |
| advanced-counterterrorism-operations | 376 → 1050 | 12 | 5 |
| admiral-crowe | 386 → 1041 | 10 | 2 |
| intelligence-peddlers | 356 → 1003 | 10 | 8 |
| mad-minute | 327 → 918 | 8 | 3 |
| magic-box | 304 → 912 | 9 | 2 |
| dick-clarke | 294 → 821 | 8 | 2 |
| christopher-hitchens | 331 → 821 | 8 | 2 |
| jim-moran | 373 → 816 | 7 | 5 |
| kamala-harris | 334 → 813 | 6 | 4 |
| turning-point-usa | 374 → 762 | 6 | 2 |
| john-walker-lindh | 297 → 744 | 6 | 3 |
| brad-birkenfeld | 353 → 735 | 5 | 2 |
| the-backstory | 326 → 613 | 6 | 4 |

Nothing left in-progress. All 252 `<Cite>` tags across the fifteen files were machine-verified
to resolve to a real `[timestamp]` paragraph in a real non-sponsor source before commit.

### Best finds

- **admiral-crowe** — the departure gifts. When an officer left Bahrain the Emir and the Prime
  Minister gave a farewell present, normally a Rolex, which no American could keep: anything
  over twenty-five dollars went to Treasury in the diplomatic pouch, so gifts were opened in
  front of witnesses. The ambassador's was a cigar box. Opened in front of the assembled staff
  it held fifty thousand dollars in cash, which the deputy chief of mission and the head of
  public affairs counted before it was boxed back up and shipped to Washington. Kiriakou's
  footnote on himself: *"I was the only one, the only one who didn't get a Rolex when we left."*
  The same pass also produced Shirley Crowe introducing herself to him at dinner two hours
  after he had spent an entire day negotiating her carpet prices — *"Of course you did."*
- **magic-box** — the device now has its build and its death. Two tech officers *"both of whom
  looked like they were 16 years old"* bought a cigar-box-sized case and a pile of wire,
  capacitors and LEDs from the Pakistani equivalent of Radio Shack, worked two days in the
  station's tech shack, and produced something that *"looked like a Boy Scout put it together."*
  It beeped exactly once, at ten at night; the compass swung north; the team picked it up,
  started for the exit, and the signal died. Abu Zubaydah was switching the phone on only long
  enough to hear his voicemail and then pulling the battery. Kiriakou's verdict — *"this isn't
  going to help us catch him, this is wasted time"* — is what sent him to fetch the targeting
  analyst who actually found the man.
- **advanced-counterterrorism-operations** — the course stops being a syllabus and becomes a
  physical experience. The invitation came by cable halfway through his Athens tour, for what
  was then a brand-new course; the driving half was about ramming roadblocks, with the specific
  instruction to go through the boot because the engine block will kill you; students were
  blindfolded in the driver's seat and given three seconds to react to whatever was in front of
  them when it came off — a roadblock, a man with an AK-47, or somebody easing the door open to
  put a pistol to their head and say *"bang, you're dead, you fail."* Kiriakou was injured,
  everybody finished with whiplash, and twenty-five years later he still locks the car doors
  before the key goes in the ignition.
- **yasser-arafat** — the map of Jerusalem. Kiriakou's first CIA boss, by then the Middle East
  official at the National Security Council, was in the room in the last days of the Clinton
  administration when the parties had agreed on nearly everything and were dividing Jerusalem
  block by block with a marker pen on an enormous map. Gore said *"My God, we have peace."*
  Arafat said he could never sell it to the Palestinian people and walked out; Gore ran after
  him into the corridor; Arafat said it again. Kiriakou calls that the death of the peace
  process, and *"in retrospect, anything would have been better than nothing. And what the
  Palestinians have today is nothing."*
- **intelligence-peddlers** — eight tellings of the same taxonomy assembled into one article,
  and the variance is now part of the content rather than noise: the lunatic share moves
  between 95, 96 and 99 per cent, the payment between twenty dollars and five hundred, and the
  peddler's total between a month's salary and *"a year's worth of money in three days."* The
  article also recovers where the taxonomy came from — his job as chief of counterintelligence
  in the bin Laden unit was literally to sort the walk-ins claiming to know where bin Laden was.

### Corrections made while enriching

- **the-backstory** named the co-host as **Lisa Stranahan**. He is **Lee Stranahan**, and the
  corpus is unambiguous — he introduces himself by name on air in the 2021-01-22 recording, and
  a separate 2018 source is titled with his name. The article's "Lisa" traced to a caption
  artefact (*"I'm Liz Stranahan"*) in the one source it was written from. Fixed in summary,
  infobox and body.
- **brad-birkenfeld** carried YAML-escape artefacts that had leaked out of the frontmatter and
  into rendered prose — readers were seeing `Kiriakou''s` and `there''s no recourse` on the live
  page. Fixed.
- **kamala-harris** had no `dyk:` block at all, so the homepage navigation pool was getting
  nothing from a top-tier article. Two entries added.

### Starving but unfuelled — the shopping list for the ingest routines

- **national-bird** (295 words) — five of the six uncited sources are other people talking:
  Ray McGovern presenting a Sam Adams award, and Sonia Kennebeck, the film's own director, on a
  Disruption Network Lab panel. The one Kiriakou passage is excellent (his own monologue on
  Daniel Hale, the Drone Papers, and the five-month period in 2012 in which nearly 90 per cent
  of those killed were not the intended targets) but it is one telling. Needs a second.
- **national-endowment-for-democracy** (315 words) — looks well-fuelled and is not. The
  Kuwait/Rendon/DNC-RNC block is already in the article from an earlier capture, and the two
  "new" sources are duplicate uploads of that same interview. Only the USAID-funding passage
  (`2026-06-16-julian-dorey-daily`) is genuinely new, and one source is below the floor.
- **james-fishback** (342 words) — same shape. The Mehdi Hasan interview is already cited via
  the Zeteo capture; the `eb-flow` hit is a commentary channel replaying that interview. That
  leaves one real new source (`2026-03-31-deprogram`, where he explains how a "take a look at
  him" remark became a reported endorsement within seconds). Worth revisiting on a second
  telling.
- **marble-framework** (233 words) — confirmed unfuelled for a second consecutive pass. Every
  uncited passage is Ray McGovern or Suzie Dawson describing Vault 7 on a roundtable, twice
  captured. Nothing in Kiriakou's own voice.
- **nick-bryant** (252 words) — the two sources are Deep Focus episodes where Kiriakou
  *interviews* Bryant. The substance is all Bryant's; single-source canon excludes it. Only
  Kiriakou's own framing (*"the country's leading expert on the Jeffrey Epstein case"*) is
  usable, and that is one sentence.
- **kiriakou-guatemala-orphanage-trip**, **spy-films-accuracy**,
  **french-village-lsd-bread-experiment**, **mariel-boatlift-comparison**,
  **cia-animal-surveillance-experiments**, **afghan-languages**, **andrew-feinstein**,
  **ai-whistleblower-initiative**, **bay-path-university**, **intelligence-agencies** — all
  rank near the top on raw uncited counts and all yield **zero** real passages. Every hit is a
  single generic word from the title (*guatemala*, *accurate*, *experiment*, *comparison*,
  *languages*, *feinstein*, *initiative*, *university*, *agencies*). These are index artefacts,
  not a shopping list.

### Method notes

- The mention index needs an alias-quality fix. An article whose title contains a common noun
  gets an alias for that noun and then matches several hundred sources, which puts it at the
  top of every starvation ranking while having no fuel at all. This pass worked around it by
  requiring a multi-word alias match inside the passage snippet; doing that in
  `build-mentions-index.mjs` itself would make the index usable directly.
- Speaker attribution remains the main filter. Cut this pass: the Tucker Carlson block on Jim
  Moran's drinking and private life (Carlson's words, not Kiriakou's — only *"Jim was very
  helpful, very, very helpful"* is his); a Telesur summary of Moran's pardon call (interviewer);
  the Gonzalo Lira roundtable line on Kamala Harris being kicked upstairs (a panellist who
  refers to John in the third person); the Danny Jones McGovern/superdelegate exchange, which is
  a two-guest show where the other guest cannot be excluded; and the Zeteo "Kamala Harris is a
  neocon" line, which is Mehdi Hasan quoting his own friends.
- Where a fact appears in several tellings with different values, the article now records the
  variance rather than picking one — the ACO course length and date, the intelligence-peddler
  percentages and payments, the magic box's two-day versus one-week build, and the Camp David
  delegation lead (Prime Minister in one telling, Shimon Peres in another).

---

## 2026-08-10 — 15/15 fattened

Branch `kiriakou-intake-churn`, in sync with origin at the start of the run. Mentions index
rebuilt (1499 articles, 866 non-sponsor transcripts). No carryover — the 2026-08-09 run left
nothing `in-progress`.

**Ranking method.** The index's raw `uncited_mention_count` is again unusable: its generic
aliases put `i-want-my-fifty-bucks-back` (9,017 uncited mentions across 988 sources) and
`say-five-years` at the top. Candidates were ranked instead by a corpus-wide document-frequency
pass: every title token was scored by how many transcripts contain it, the rarest token (or the
two rarest, required within sixty characters of each other) became the search pattern, and
matches were counted only in sources the article does not already cite. That killed the usual
false positives before any article was opened — `whistleblowers-die-broke`, `presidents-and-the-cia`,
`arabic-and-greek`, `camp-david-final-talks` and `cia-cash-room` all rank in the top ten on a
naive count and are matching the words *whistleblowers*, *presidents*, *arabic*, *david* and
*cash*.

| Article | Words before → after | New facts | New sources |
|---|---:|---:|---:|
| kiriakou-on-wine | 148 → 917 | 9 | 8 |
| death-threats-against-kiriakou | 190 → 1301 | 12 | 11 |
| joe-rogan | 228 → 598 | 6 | 4 |
| djibouti | 252 → 765 | 9 | 10 |
| j-edgar-hoover | 260 → 967 | 8 | 5 |
| kandahar | 267 → 706 | 8 | 7 |
| hamilton-68 | 252 → 581 | 5 | 4 |
| alex-station | 300 → 865 | 9 | 8 |
| fisa-court | 237 → 731 | 6 | 6 |
| arlington-cemetery-spies | 230 → 766 | 8 | 4 |
| james-comey | 244 → 730 | 7 | 5 |
| henry-kissinger | 310 → 823 | 7 | 7 |
| max-blumenthal | 233 → 563 | 6 | 7 |
| iron-dome | 288 → 817 | 8 | 8 |
| craig-murray | 289 → 678 | 5 | 4 |

Every article cleared the floor (≥3 new sourced facts from ≥2 distinct new sources). Nothing
left `in-progress`. Every `<Cite>` tag in all fifteen files was machine-checked before commit:
the source slug resolves to a real non-sponsor transcript and the `t=` value resolves to a real
`[timestamp]` paragraph in it. Every `/wiki/` link in the fifteen files was checked against the
article directory; four dead targets written during drafting were unlinked or repointed.

### Best finds

- **henry-kissinger — the Mao viewing.** A station chief Kiriakou worked for had come to the CIA
  from the State Department's diplomatic security bureau and travelled to China with Kissinger in
  1976. Kissinger pressed from the moment they landed to see Mao and was deferred, official by
  official, until the party was leaving for the airport — then walked into an empty room with a
  wall of drapes. The drapes opened on Mao in bed. Kiriakou's friend whispered *"He's dead, isn't
  he?"* and Kissinger whispered back *"Don't tell anybody."* China announced the death a month
  later. The same pass also moved the Greek junta off the CIA's ledger and onto Kissinger's:
  Kiriakou says the White House and State installed the colonels and that Kissinger, holding no
  official title in 1967, told Johnson to go ahead — the generals who took power first being *"too
  liberal"*, the colonels wanting *"to crack heads."*
- **death-threats-against-kiriakou** went from one 2021 quote to a two-decade record with four
  distinct waves and their causes. The 2017 Arabic telling adds the police car posted outside his
  house and the FBI taking calls saying he would be killed; the Haspel op-ed for the *Washington
  Post* brought half a dozen threats; a single sentence to an Indian outlet — that India would
  probably win a conventional war on population alone — brought a letter to his home address from
  the president of Imran Khan's party demanding a written apology, and one morning of 72 calls
  from the same man promising to spread his brains on the street. The current wave he attributes
  to Palestine, and the frequency has gone from *"one every couple of years"* to every couple of
  days. The FBI's posture inverted across the same span: in 2007 it assessed the threats and told
  him to leave the country; now, he says, it has never once contacted him — except when a caller
  recited his son's address, at which the agent said *"that's a crime"* and found the man in four
  days.
- **alex-station** now has a chain of command and a clock. Kiriakou got the counterintelligence
  job on the strength of the Abu Zubaydah capture, held it about six weeks hunting al-Qaeda
  penetrations, and left when Jim Pavitt took him to the seventh floor — a promotion Jose
  Rodriguez never forgave. His desk was next to Jennifer Matthews, later killed at Camp Chapman.
  He also dates his first contact with the unit to 12 September 2001 and says that even inside it
  the expectation had been another multiple-embassy attack, probably in Africa.
- **j-edgar-hoover** gains the Roy Cohn material and the grave. A congressman whose vote on the
  FBI budget they wanted was blackmailed over an affair, told them he was not afraid of them, and
  spent the weeks between the election and the swearing-in denouncing Hoover and Clyde Tolson from
  the floor of the House — *"the only one who ever fought back."* Hoover now lies thirty feet from
  Tolson in Congressional Cemetery, at the centre of what Kiriakou calls the only officially gay
  section of any cemetery in America, because people bought the plots around them.
- **kiriakou-on-wine** stops being a hobby note. Wine turns out to run through the tradecraft as
  well as the cellar: vineyard tours as his cover story for west-coast operational weekends, the
  wine shop as the classic second stop on a surveillance-detection route, two-hundred-dollar
  bottles as recruitment currency — and the $2,000 bottle a first-tour officer ordered for an
  allied diplomat at lunch, which the diplomat reported to his own service and which Kiriakou says
  took the relationship more than a decade to repair.

### Corrections and variances recorded

- **hamilton-68** — the corpus contradicts itself on who red-checked Consortium News. The April
  2023 telling names Hamilton 68 throughout; in February 2023, on Consortium News's own programme,
  Kiriakou corrects himself mid-sentence and names **NewsGuard**. Both tellings are his; the
  article now records the discrepancy rather than picking one.
- **craig-murray** — the Denmark offer has two endings. In the 2019 telling (which Kiriakou had
  from Murray a fortnight earlier) the offer comes at lunch from Murray's best friend of thirty
  years, then the Foreign Service's head of HR, the alternative is *"hire a criminal defence
  attorney"*, and Murray resigns. The later telling has him going to the press and facing arrest.
- **fisa-court** — Kiriakou dates the court to the Carter administration in one telling and the
  FISA Act to October 2001 in another. Both are now in the article, with the note that the second
  description fits the post-9/11 statutes rather than the original act.
- **death-threats-against-kiriakou** — the Mexico trip is a week in the 2017 telling and a
  fortnight in the 2021 one; the rabbi's name is captioned *Sima* in one recording and *Simcha* in
  the other.
- **iron-dome** — the drone figures move between tellings (600 launched; seven, eleven or "more
  than half a dozen" through; four hours' flight time in 2024, six in 2026). The inference does
  not move, and the article now says so instead of picking a number.
- **djibouti** — the crossing to Yemen is sixteen miles in most tellings and about nine in the
  latest, the latter matching the width of the strait.

### Starving but unfuelled — the shopping list for the ingest routines

- **aq-khan** (296 words) — looks well-fuelled and is not. Every "new" passage is the ANI
  interview of 2025-10-25, which is a second upload of the 2025-10-24 recording the article is
  already written from. The only genuinely new material anywhere is one line in a 2022 Gosztola
  interview (a rumour that the Saudis bought North Korean nuclear information from Khan, and that
  Saudi money is why a Pakistani city is named for King Faisal). One source, below the floor.
- **scott-horton** (155 words, and the thinnest well-connected article in the corpus) — 44 sources
  contain the name and essentially none of them are usable. They are Horton's own show: the
  intros, the book plugs for *Fool's Errand*, the archive announcements, and his standing warning
  not to confuse him with the other Scott Horton, the human-rights lawyer at *Harper's*. All of it
  is the host's voice, which single-source canon excludes. Needs Kiriakou talking about Horton, not
  Horton talking.
- **ed-schultz** (225 words) — two of the three threads in the corpus are already in the article,
  and the third is thin: a 2019 line grouping Schultz with Lee Camp and Chris Hedges as people
  treated as Russian assets after leaving mainstream outlets. The 2025 re-telling of the Bernie
  Sanders instruction was attached as a corroborating cite, but the article gained no new fact.
- **haiti** (247 words) — the fuel is other people. The Lee Camp hits are show promos for Dan
  Cohen's Haiti documentaries; the Deep Focus hits are guests (Seth Donnelly, Alfred McCoy, Danny
  Haiphong) talking while Kiriakou hosts. The one promising hit — *"we allowed four families to run
  the entire economy"*, which would have contradicted the article's seven merchant families — turns
  out on reading to be about **Mexico**, not Haiti.
- **2019-03-04 A Good Place with Ella** is a multi-guest show where the FBI material is spoken in
  the institutional first person (*"our agents"*) by someone who is plainly not Kiriakou. Two
  strong Moussaoui/FISA passages were cut on that basis. The article `j-edgar-hoover` carries a
  pre-existing citation to the same recording (t=42:54) that a future pass should re-check.

### Method notes

- Word-boundary matching is not enough on its own; document frequency is what makes the ranking
  usable. A title token appearing in more than ~250 of the 866 transcripts is noise no matter how
  it is matched, and the fix is to require the two rarest title tokens within sixty characters of
  each other. Building that into `build-mentions-index.mjs` would make the index directly usable
  and would save the whole ranking step.
- Two citation classes broke silently and were caught only by machine verification: sources whose
  paragraphs are timestamped `[01:00]` rather than `[1:00]`, and near-identical DeProgram uploads
  where the same exchange sits at 32:53 in one cut and 32:25 in the other. Both would have rendered
  as live footnotes pointing at nothing.

## 2026-08-11 — 15/15 fattened

Carryover: none. Nothing was left `in-progress` by the 2026-08-10 run.

Candidates were ranked by starvation rather than thinness: the mention index was rebuilt, then
every article under 320 words was scored on how many *uncited* passages survived a strict match
(the two rarest title tokens within ninety characters of each other, deduplicated by source).
That leaves a pool of 491 short articles, of which 282 have no strict fuel at all.

| article | words before | words after | new facts | new sources |
|---|---:|---:|---:|---:|
| `tony-blinken` | 256 | 806 | 8 | 5 |
| `chuck-grassley` | 289 | 945 | 9 | 6 |
| `sergey-lavrov` | 303 | 746 | 7 | 6 |
| `mike-spann` | 317 | 637 | 6 | 5 |
| `sandy-berger` | 257 | 695 | 7 | 5 |
| `joe-weisberg` | 286 | 577 | 7 | 6 |
| `fidel-castro` | 252 | 784 | 8 | 5 |
| `ilhan-omar` | 253 | 561 | 4 | 2 |
| `mike-johnson` | 276 | 577 | 5 | 3 |
| `cia-car-hacking` | 204 | 552 | 6 | 6 |
| `burn-notice` | 278 | 701 | 6 | 4 |
| `saddam-hussein-biographer` | 274 | 638 | 7 | 5 |
| `promotion-panel` | 226 | 613 | 6 | 4 |
| `kiriakou-television-pilots` | 210 | 615 | 7 | 4 |
| `paul-wright` | 292 | 509 | 4 | 3 |

Nothing left `in-progress`. All 268 `<Cite>` tags across the fifteen files were machine-verified
against the source transcripts before commit — every source slug exists and every timestamp
appears verbatim in that transcript. One pre-existing bad citation was caught and fixed on the
way through (`ilhan-omar` cited `t="3:44"`; the paragraph is timestamped `[03:44]`).

### The best of what came out

- **`tony-blinken`** stops being a single-quote article. The career ladder is now complete and
  sourced twice over — Harvard, junior legislative aide to Senator Biden, legislative director,
  staff director of the Foreign Relations Committee when Biden took the chair, national security
  adviser to the vice-president, deputy secretary of state, secretary of state — and Kiriakou's
  verdict is the fuller one: *"Tony is a lovely guy, he's very smart, and he is in completely
  over his head… he belongs at a think tank."* The argument's evidence is now in the article too:
  Bill Burns as the *de facto* secretary of state, a career ambassador posted to seven places
  including Russia, sent to Doha because *"he's a better diplomat than the secretary of state is."*
  Three different tellings of how Kiriakou came to inherit Blinken's desk are recorded as three,
  not smoothed into one.
- **`chuck-grassley`** gains its own contradiction. The public line — one finger, then two names,
  then four out of 535 — now sits beside the 2020 Gosztola interview in which Kiriakou says
  *"he's certainly not my friend. Chuck Grassley's not done anything for me"*, and names Jim Moran,
  Lloyd Doggett and John McCain as the members who actually helped. A 2024 telling puts Grassley
  back among his supporters; both are in the article.
- **`burn-notice`** was an article about a television show that never explained its own title. It
  now opens with the tradecraft: a cable to every CIA officer on earth forbidding contact with one
  named person, the Chalabi burn notice that produced it, the $36m embezzled from Petra Bank and
  the escape to Syria in the boot of a secretary's car — and Cheney's response, which was to have
  the Pentagon invent an under-secretary of intelligence whose sole job was to talk to Chalabi
  anyway. Kiriakou was threatened with a burn notice himself and laughed at the officer who did it.
- **`saddam-hussein-biographer`** gains the desk next door. The analyst sitting eight feet away
  wrote a two-day program to draw the Saudi royal family tree, was given a $500 bonus for it, and
  is now, Kiriakou says, the number four officer in the CIA — the associate deputy director for
  technology who deals with Palantir and In-Q-Tel.
- **`cia-car-hacking`** now answers the question the article was avoiding: the capability is not
  about electric cars (*"conventional, really"*), and its purpose is stated every time he tells it —
  a bridge, a tree, an abutment, at a speed nobody survives.
- **`promotion-panel`** turns out to be three stories, not one. Alongside the *"shocking lack of
  commitment to counterterrorism"* line there is the panel he lost because a member was sleeping
  with the rival candidate, and the panel at which a CTC psychologist supported him by saying he
  *"will come up with 40 different ideas for an operation; 36 of them are insane, but four of them
  are going to be really good."*

### Corrections and variances recorded

- **`sandy-berger`** — the strongest-looking passage in the whole index was a trap. A February 2023
  Consortium News panel contains *"I had a personal war with Sandy Berger… he loathed me… and made
  my life miserable in Yugoslavia"*, which reads as Kiriakou until the same speaker goes on to
  describe Dick Holbrooke having his publisher taken to lunch and names Sydney Schanberg, David
  Halberstam and Ray Bonner. That is Chris Hedges, not Kiriakou. Cut.
- **`mike-johnson`** — a passage in which the speaker lays out the 218-vote discharge petition and
  says it is *"out of Mike Johnson's hands"* was cut once the reply turned out to begin *"But that's
  not necessarily going to change anything, **Ted**"* — the analysis is Ted Rall's. The same test
  disqualified the Newt-Gingrich-on-my-couch passage from the same show.
- **`promotion-panel`** — the *"shocking lack of commitment"* line now has a third attribution
  (the deputy chief of CTC, at his feedback meeting) alongside Cofer Black's successor and Jose
  Rodriguez, and in that telling it is reported as the panel's consensus rather than one man's
  remark. All three are in the article.
- **`kiriakou-television-pilots`** — seven pilots sold as of March 2019, eight from 2023 onward.
  Recorded as a progression, not a discrepancy.

### Starving but unfuelled — the shopping list for the ingest routines

- **`music-as-torture`** (196 words) — ranks near the top of the whole corpus on raw uncited
  mentions and has, on inspection, nothing at all. Every hit is the literal token `[Music]` that
  the caption normaliser leaves in for intro stings and ad breaks, colliding with the word
  *torture* elsewhere in the paragraph. Zero usable passages out of 3,438. The fix is in the
  indexer, not the ingest.
- **`national-bird`** (139 words) — one clean new source only. The Scheer interview gives the
  documentary's 2016 release, its Academy Award nomination, and the fact that appearing in it is
  what pushed Daniel Hale to go public under his own name shortly before his arrest. The other
  promising passage is from a joint Scott Horton appearance billed as *"Kevin Gosztola and John
  Kiriakou"*, where *"he did tell me that he underestimated the government's reaction"* cannot be
  assigned to either man from the transcript. Below the two-source floor; left alone.
- **`pan-quake`** (135 words) — 139 uncited mentions, and essentially all of them are Lee Camp's
  and Graham Elwood's identical show intros (*"PanQuake is a new social media platform that will be
  out soon"*) re-uploaded across four channels. The host's voice, not Kiriakou's.
- **`ralph-nader`** (294 words) — thin and mostly other people's. The two genuine hits are a
  passing reference to Nader's 2000 independent run in a discussion of presidential debates, and
  Kiriakou saying he intended to vote for Nader rather than Obama, which upset Dan Ellsberg.
  Two facts, one of them barely about Nader.
- **Duplicate-slug pairs found while ranking**, all of which look like enrichment targets and are
  really merge candidates: `james-angleton` / `james-jesus-angleton`,
  `death-threats-against-kiriakou` / `kiriakou-death-threats` / `the-2007-death-threats`,
  `advanced-counterterrorism-operations` / `advanced-counterterrorism-operations-course`. Not this
  routine's job, but they will keep surfacing in the starvation ranking until someone merges them.

### Method notes

- The Deprogram (Rall and Kiriakou co-hosting) is the single most dangerous source class in the
  corpus for attribution, because both men are political commentators and neither is introduced by
  name at each turn. The reliable tell is the *vocative in the reply* — when the next turn opens
  *"But that's not necessarily going to change anything, Ted"*, the preceding analysis was Ted's.
  Any Deprogram passage without a vocative, a `>>` turn marker, or first-person CIA content should
  be treated as unattributable.
- `build-mentions-index.mjs` still ranks on raw alias hits, so generic-title articles
  (`intelligence-agencies`, `cia-and-hollywood`, `kiriakou-on-christmas`) sit at the top of the
  starvation list with hundreds of meaningless mentions, while `music-as-torture` is poisoned by
  the caption token `[Music]`. Two cheap fixes would make the index directly usable: require the
  two rarest title tokens within ~90 characters of each other, and strip `[Music]`, `[Applause]`
  and `[laughter]` before matching.
- `npm run build` OOMs on the default Node heap at this corpus size; it completes cleanly under
  `NODE_OPTIONS=--max-old-space-size=8192`. Worth putting in the `build` script.

---

## 2026-08-12 — 15/15 fattened

Carryover: none. Nothing was left `in-progress` by the 2026-08-11 run.

The mention index was rebuilt and every article under 340 words re-scored on *strict* fuel —
the article's distinctive title tokens required within a ninety-character window of each other,
caption noise (`[Music]`, `[Applause]`, `[laughter]`) stripped, deduplicated by source, and the
106 articles already fattened by earlier runs excluded. That produced 195 candidates. The top of
the ranking is still dominated by one-word titles (`the-isi-as-two-organizations`, `bds-movement`,
`the-orb-off-yemen`) whose "fuel" is any sentence containing a common noun, so selection was made
by hand from the two-token matches down the list.

| article | words before | words after | new facts | new sources |
|---|---:|---:|---:|---:|
| `scott-horton` | 154 | 717 | 8 | 7 |
| `reality-winner` | 236 | 873 | 9 | 8 |
| `ed-schultz` | 223 | 506 | 3 | 2 |
| `amnesty-international` | 245 | 869 | 9 | 8 |
| `human-rights-watch` | 260 | 895 | 8 | 6 |
| `james-bond` | 268 | 934 | 8 | 6 |
| `new-castle-pennsylvania` | 283 | 1153 | 11 | 7 |
| `code-pink` | 323 | 1047 | 9 | 6 |
| `wesley-clark` | 322 | 948 | 7 | 4 |
| `prince-andrew` | 330 | 900 | 8 | 9 |
| `langley` | 313 | 898 | 7 | 6 |
| `watergate` | 335 | 892 | 8 | 6 |
| `arabic-and-greek` | 298 | 734 | 7 | 12 |
| `national-security-act` | 209 | 820 | 9 | 7 |
| `the-spy-shop` | 223 | 724 | 8 | 2 |

Every article cleared the floor of ≥3 new sourced facts from ≥2 distinct new sources. Nothing
left `in-progress`. All 471 `<Cite>` tags across the fifteen files were machine-verified before
commit — every source slug resolves to a transcript on disk and every timestamp appears verbatim
in that transcript — and every `/wiki/` link in the fifteen files was checked against the article
directory, so none of them is dead.

### Best finds

- **`new-castle-pennsylvania`** turns out to contain the origin of the cemetery books. Aged eight,
  turning over rocks in Oak Park Cemetery looking for salamanders, Kiriakou found the grave of
  Joseph B. Chambers, Medal of Honor. His mother took him to the library — *"everybody has a
  story"* — and they found a private in Company F of the 199th Pennsylvania Infantry, the Round
  Heads, who captured a Confederate battle flag at Petersburg on 25 March 1865, was decorated on
  27 July 1871 aged thirty-eight, and farmed at Eastbrook until he died quietly in 1908. He became
  a regular in a cemetery of thirty thousand, learned the town off its stones, kept the habit in
  every country he was posted to, and published *Remains of the Day* in March 2026. The same
  article now carries his father standing up in church to announce that his son was an undercover
  officer in Athens, after which the congregation rang the station about visas.
- **`code-pink`** was a thin gratitude note and is now the fullest account in the corpus of what
  a defence committee actually does. Four nights before prison, on the roof of the Hay-Adams
  across from the White House, a Grammy-winning folk group sang a rewritten *Have You Been to Jail
  for Justice* — *"he stood up to the CIA, now he's doing time"* — and everybody in the room knew
  the words. The group had also worked out that his wife was going to lose the house, and
  approached Roger Waters, who wrote a cheque and paid off the second mortgage.
- **`human-rights-watch`** gains the missing name. The chain that ended in Kiriakou's arrest runs
  Matthew Cole → **John Sifton**, an HRW investigator → the Guantánamo defence attorneys → a
  classified motion → a judge → the FBI, walking it back link by link. The John Adams Project,
  working with HRW, had hired the investigators; Kiriakou calls it *"one of the most f——ed up human
  rights projects I've ever encountered in my life"*, and notes the man they were hunting was never
  a torturer at all but crew on a rendition flight.
- **`langley`** now has the Kryptos sculpture: Kiriakou was at the 1990 unveiling, looked at it
  every day for almost fifteen years, and watched a Cray fail to crack it. Alongside it, the
  floor plan he uses to answer the alien-bodies documentaries — *"the only things in the basement
  at Langley are the gym, the boiler room, and the supply room"* — and the copy-machine repairman
  whose installed device sends a second copy of everything the prime minister reads back to
  headquarters.
- **`national-security-act`** acquires its origin scene: MI6 officers sent to New York at Truman's
  request, met by Bill Donovan, Prescott Bush *"and a handful of other swells from Wall Street and
  the OSS days"*, inventing the CIA with pads of paper. Plus Truman's two conditions — no law
  enforcement, no domestic spying — and the 1963 op-ed calling it *"a damn fool mistake"* that ran
  in the Washington Post's morning edition and was gone by the afternoon one.
- **`the-spy-shop`** stops being a single anecdote. The shop was headquartered in London with New
  York and briefly Washington branches, its customers were mostly the public and private
  investigators, there were half a dozen imitators, and what the shop could not supply came from
  Radio Shack in parts. The measure: *"I used more spy gadgets in my six months in Pakistan than I
  used in the rest of my entire career combined,"* all but one bought online.
- **`arabic-and-greek`** finally records the sentence that got him the job, quoted almost
  identically across fifteen years of interviews: *"it's a lot easier and a lot cheaper to take a
  linguist and teach him operations than to take an operations person and teach him how to speak
  Greek and Arabic."*

### Corrections and variances recorded

- **`reality-winner`** — the interval between publication and arrest is *forty minutes* in the 2023
  Scheerpost telling and *four hours* in the 2026 one; the sentence is *five years and three months*
  in some accounts and *five years and four months* in others. Both variances are now stated in the
  article rather than silently picked. The Intercept pair is also corrected: Matthew Cole **and
  Richard Esposito**, not Cole alone.
- **`amnesty-international`** — Kiriakou's account of Zeke Johnson has softened across tellings. In
  2017 the New Yorker subscription arrives with a letter of refusal; in 2021 and 2025 Johnson is
  *"an awesome guy"* who wrote from London's side of the wall to apologise for his bosses. The
  article now records the shift and locates the blame where the later tellings put it. The Ai
  Weiwei exhibition is the Smithsonian in one telling and Alcatraz in another.
- **`new-castle-pennsylvania`** — three different population pairs (50,000 → 18,000; *"a good
  40,000"* → *"about 20, or less than 20"*), and the Chambers regiment is the Fourth Pennsylvania
  Infantry with a death in the 1890s in the 2023 telling, the 199th with a death in 1908 in the
  2025 one. The later, more precise account is given as such.
- **`arabic-and-greek`** — *"the only person in the entire CIA"* who had both languages is, in one
  2019 telling, *"one of only two people… and the other one was a language teacher."* The transfer
  is dated to 1997 in some accounts and 1998 in others.
- **`scott-horton`** — the fourth panellist on the Piers Morgan show is *Danny Ayalon, former
  Israeli general* in two tellings and *"the former head of Mossad"* in two others. Preserved, not
  resolved.
- **`national-security-act`** — the first covert action is the Italian election of 1947 in one
  telling and 1948 in another. Kiriakou also flags his own provenance once, introducing the
  Truman–Hoover deal as *"a story that I heard many years ago."*
- **`the-spy-shop`** — two different friends who left finance or law for the gadget trade, with
  opposite endings: the Washington attorney whose Southern California shop folded in five years,
  and Glenn the New York hedge-fund man who *"ended up making a handsome living."* Recorded as two.

### Cut on attribution

- **`prince-andrew`** — a vivid passage in which a speaker mocks an alibi (*"for an hour and I left
  with my wife, my children, and our nannies"*) turned out to be about Howard Lutnick's
  congressional testimony, not Andrew. Cut. The Sarah Ferguson attorney anecdote from the same
  three-speaker show could not be assigned to Kiriakou and was cut too; the Ferguson material in
  the article comes from a source where he is plainly speaking.
- **`ed-schultz`** — a 2025 passage giving MSNBC's ideological history and its purge of Phil
  Donahue and Schultz is more likely Ted Rall's than Kiriakou's, on the tell that the next turn
  supplies *"and Brian Becker and Jesse Ventura"* — Kiriakou's own colleague. Cut.
- **`watergate`** — the *"Nixon won by a landslide in 1972, by 1974 you couldn't find anyone who
  admitted voting for him"* line opens with one co-host addressing the other and could not be
  assigned. Cut.

### Starving but unfuelled — the shopping list for the ingest routines

- **`american-shoes`** (279 words) — ranked high but has exactly one source. The whole story is a
  single 2026 *Dead Drop* episode; every other corpus hit for *shoes* is combat boots at a mosque
  or Aldrich Ames's footwear. Below the two-source floor and left alone.
- **`cu-chi-tunnels`** (181 words) — the Vietnam visit exists in exactly one telling. Every other
  *tunnels* hit is Gaza. Needs a second telling of the 2026 Vietnam trip, not enrichment.
- **`aq-khan`** (296 words) — only two source files mention him at all, and one is a passing
  reference. A genuine Pakistan-nuclear ingest gap given how much Kiriakou has said about ISI.
- **`kiriakou-on-christmas`**, **`jim-jordan`**, **`the-orb-off-yemen`**, **`bds-movement`**,
  **`the-isi-as-two-organizations`** — all rank in the top ten on raw fuel and all of it is
  indexer noise from a single common word. They are not starving; they are mis-ranked.

### Method notes

- The strict re-ranker described in the 2026-08-11 log was rebuilt and used again, and it is worth
  making permanent in `build-mentions-index.mjs` rather than re-deriving each run. Even with it,
  one-token titles are unusable: the fix is to require at least two distinctive tokens, and to skip
  scoring entirely for articles whose title yields fewer than two.
- The single most productive habit this run was checking the *speaker* before the *content*.
  Three separate passages that looked like the best find of the day belonged to a co-host, a
  panellist, or a witness being quoted about somebody else. The `>>` turn markers, a vocative in
  the reply, and first-person CIA content remain the only reliable tells.
- `npm run build` again needs `NODE_OPTIONS=--max-old-space-size=8192`; it OOMs on the default heap
  at 1,782 articles. This is the third run to record it. It belongs in the `build` script.

## 2026-08-13 — 15/15 fattened

Carryover: none. Nothing was left `in-progress` by the 2026-08-12 run.

The strict re-ranker that the last three runs rebuilt from scratch each time is now a permanent
tool, `tools/rank-enrich-candidates.mjs`, together with `tools/enrich-fuel.mjs` (prints an
article's uncited passages in context, so the speaker can be checked before anything is cited)
and `tools/verify-cites.mjs` (machine-checks every `<Cite>` and every `/wiki/` link in a file).
The ranker implements the fix the 2026-08-12 log asked for: title tokens are dropped when their
document frequency across the 1,155 transcripts exceeds 20%, and any article left with fewer
than two distinctive tokens is skipped outright and reported separately rather than scored. That
removed the one-word-title noise that has topped the raw index every run — 201 articles were set
aside as unscorable — and produced 167 honest candidates under 340 words with at least two
uncited fuel sources.

| article | words before | words after | new facts | new sources |
|---|---:|---:|---:|---:|
| `rand-paul-eric-holder` | 251 | 1263 | 14 | 22 |
| `tucker-carlson-2026-fara-referral` | 323 | 1062 | 11 | 4 |
| `the-asset-recruitment-cycle` | 318 | 1504 | 18 | 9 |
| `cleaning-up-after-tora-bora` | 287 | 909 | 9 | 10 |
| `planning-a-surveillance-detection-route` | 282 | 861 | 9 | 11 |
| `terry-albury` | 177 | 603 | 8 | 15 |
| `nation-of-islam-at-loretto` | 318 | 748 | 8 | 14 |
| `the-condoleezza-rice-meeting` | 239 | 860 | 11 | 10 |
| `fifth-fleet` | 275 | 882 | 10 | 12 |
| `the-oath-to-the-constitution` | 283 | 939 | 9 | 12 |
| `cia-divorce-rate` | 315 | 912 | 9 | 10 |
| `the-piers-morgan-panel` | 324 | 754 | 7 | 9 |
| `mark-zuckerberg-angela-merkel-meeting` | 111 | 558 | 6 | 5 |
| `christopher-steele-dossier` | 256 | 700 | 6 | 3 |
| `strait-of-hormuz-transit-fees` | 289 | 829 | 8 | 8 |

Every article cleared the floor of ≥3 new sourced facts from ≥2 distinct new sources. Nothing
left `in-progress`. All 425 `<Cite>` tags across the fifteen files were machine-verified before
commit — every source slug resolves to a transcript on disk and every timestamp appears verbatim
in that transcript — and every `/wiki/` link in the fifteen files was checked against the article
directory, so none of them is dead.

### Best finds

- **`the-asset-recruitment-cycle`** was a single-source sketch of four words and is now the
  fullest account of CIA agent recruitment in the corpus. Spotting is for access, not rank —
  *"you are a nice guy, I like hanging out with you, but you're not operationally interesting"* —
  and the filter is nationality first, then function: no interest in the Spanish officer, every
  interest in the man who works in the part of the port that is off limits. Development is
  months of bought friendship on an unlimited expense account: lunch, then dinner, then dinner
  with both wives, an all-expenses trip to New York, a ten-thousand-dollar-a-day charter for
  marlin. Kiriakou's own best example is the cheapest — a man he was developing at the United
  Nations said the Manhattan skyline at sunset was the most beautiful thing he had ever seen, so
  Kiriakou bought him a helicopter tour: *"I thought he was gonna cry. That was a few hundred
  dollars well spent."* The pitch trades on a vulnerability, a word he defuses on purpose, and
  the offers are deliverable because the CIA holds agreements with almost every American
  university and the Fortune 1500: *"I'll get your kid into Harvard, no problem — give me two
  hours in your code room."* But the currency need not be material. He recruited one man with a
  basketball bought from the NBA store online, presented in an acrylic box with the story that
  Michael Jordan had signed it for him personally; the man *"couldn't give me the information I
  wanted fast enough, and he didn't take any money for it."* And threats are forbidden outright —
  unethical, ineffective, and *"you run the risk of him coming to the next meeting with a gun."*
- **`the-condoleezza-rice-meeting`** finally has its document. The nine o'clock White House
  appointment of 11 September 2001 was about a Government Printing Office volume called *Foreign
  Relations of the United States, Greece-Turkey-Cyprus*, due to be printed in an edition of five
  or ten copies that *"nobody's ever going to read."* Three of the old cables named CIA sources
  who were still alive — men by then about a hundred years old — and an obscure statute obliges
  the government to offer citizenship and resettlement to any recruited source it exposes. So
  *"we thought it would be easier and cheaper if we went to Condi and asked her to just pull
  these three cables out of the volume."* The driver called at 8.15 from the East entrance.
- **`cleaning-up-after-tora-bora`** gains the reason a clean-up was needed at all. The
  encirclement failed because *"the translator for the commander of Central Command was actually
  an al-Qaeda operative"*; bin Laden left in the dark dressed as a woman in the back of a pickup
  truck, and *"when the sun came up at dawn there was no one in Tora Bora to give up."* The
  clean-up itself now has its detail: dozens of fighters taken at the border and loaded onto an
  aircraft — the moment Kiriakou first heard the word Guantánamo — and his first interrogation
  ever, a Jordanian chained to an eyebolt, asked not about plots but to draw the smugglers'
  valleys, the *"rat lines"*, from Tora Bora to Quetta.
- **`rand-paul-eric-holder`** stops being a single exchange. The Haspel arc is the find: the
  *Washington Post* op-ed held for the Sunday edition, Rand Paul telephoning at ten that morning,
  the whiteboard in his office with four or five staffers counting votes — *"who's yes, who's no,
  who's maybe, who can we lobby"* — and the confirmation vote a week later. *"It was shocking to
  me."* Alongside it, the two members of Congress Kiriakou says have ever defended
  whistleblowers: Chuck Grassley and Paul, *"no other 536 members of Congress."*
- **`terry-albury`** acquires the mechanics of his own exposure: the FBI *"went back and looked
  at the security camera footage from every computer that had accessed the memo"* and found the
  agent who had photographed his own screen. Also the human afterword — Kiriakou stayed in touch
  through the sentence, and describes the effort as seasonal: *"Christmas is the only holiday
  that people really start to sink emotionally."*
- **`nation-of-islam-at-loretto`** gains the line that makes the scene, and its mirror image.
  When Kiriakou put out his hand to the man who had just delivered Farrakhan's blessing, he was
  told *"I don't shake hands with the white devil."* Meanwhile the Aryans had decided he was a
  CIA assassin who had gone round the world killing Muslims. *"The Aryans thought I was killing
  Muslims, the Muslims thought I was saving Muslims, and I just kept my mouth shut."*
- **`cia-divorce-rate`** now has the moment rather than the statistic. His first marriage ended
  in an armoured car during the emergency evacuation from Athens, hours after 17 November claimed
  the killing of Stephen Saunders: one car for him, one for his wife, one for the children, and
  *"my wife says, I want a divorce. I'm not doing this anymore."* He was on the noon Delta flight
  to New York. On his next-to-last day in Athens he sat down with a calculator, divided his
  salary by twenty-six pay periods, and started paying support before anyone had filed.
- **`the-piers-morgan-panel`** gains the Epstein round. Kiriakou said on air that Epstein was an
  Israeli access agent; Dershowitz, who had been Epstein's attorney, objected that Epstein would
  have told him because *"I could have gone to the White House and I could have gotten him a
  better sentence"* — an answer Kiriakou treats as self-refuting. Morgan then asked the Israeli
  panellist outright whether Epstein was a spy, and got a laugh and *"who knows?"*

### Corrections and variances recorded

- **`christopher-steele-dossier`** — the article previously carried the Ted Cruz funding origin
  as Kiriakou's account. In 2021 he calls that story *"nonsense"* — a rumour *"the Clinton
  campaign put out… and they hinted that it was Ted Cruz"* — and says the relationship ran
  directly between Steele and the Clinton people. Both versions are now stated as contradictory.
  The article also gains the operation he actually worked with Steele on: Greek terrorism, after
  the assassination of the British defence attaché in Athens.
- **`cleaning-up-after-tora-bora`** — the article said "the December 2001 battle." Kiriakou
  consistently dates the bombing to the end of October 2001, and the December date came from
  outside the corpus. Removed; his dating now stands alone.
- **`the-condoleezza-rice-meeting`** — the cable volume spans 1949 to 1967 in the 2026 telling
  and 1947 to 1969 in the 2021 one. Both given.
- **`the-piers-morgan-panel`** — the fourth panellist is named General Danny Ayalon in some
  tellings, *"the former head of Mossad"* in others, and in one Kiriakou corrects himself
  mid-sentence to *"Danny Yat."* Preserved, not resolved.
- **`terry-albury`** — the sentence is three and a half years in most tellings and four in one.
- **`the-oath-to-the-constitution`** — the auditorium holds *"about 30 other people"* in three
  tellings, *"a couple of hundred"* in another and *"300 or 400"* in a fifth.
- **`nation-of-islam-at-loretto`** — the Farrakhan article appears *"a couple of days before I
  went to prison"*, *"the week that I went to prison"*, and *"the day that I arrived"*.
- **`the-asset-recruitment-cycle`** — Kiriakou calls it the asset *acquisition* cycle far more
  often than the asset *recruitment* cycle; the article now says so in its first sentence rather
  than silently preferring the slug.
- **`fifth-fleet`** — Kiriakou describes Admiral Crowe as a former chairman of the joint chiefs
  *"under Bill Clinton."* Recorded as he says it, without outside correction, per doctrine.

### Cut on attribution

- **`mark-zuckerberg-angela-merkel-meeting`** — a passage on the FBI asking Facebook to change
  its news-feed algorithm was cut because the turn belongs to Kevin Gosztola, not Kiriakou. The
  same claim survives in the article from a source where Kiriakou plainly makes it himself.
- **`christopher-steele-dossier`** — three of the strongest-looking hits were a Tucker Carlson
  monologue, a host reading a *Telegraph* summary, and a guest (Michael Jaco) pitching his own
  book. All cut.
- **`the-oath-to-the-constitution`** — the Sam Adams-style citations that read *"for upholding
  his sworn duty to support and defend the Constitution"* are introductions spoken by Amy Goodman
  and by Paul Wright. Cut, even though they say exactly what the article is about.

### Starving but unfuelled — the shopping list for the ingest routines

- **`netanyahu-and-the-tel-aviv-police-chief`** (337 words) — ranked third on strict fuel and is
  pure ranking artefact: *netanyahu* and *tel aviv* co-occur constantly. The July 2023 firing of
  the Tel Aviv police chief appears in exactly one transcript, and there is no second telling of
  the Israeli judicial-overhaul fight anywhere in the corpus either. Needs ingest, not
  enrichment.
- **`the-crenshaw-text-messages`** (338 words) — ranked high on *text* and *messages*, both
  common words. The anecdote itself exists once. Left alone.
- **`the-blacked-out-grand-jury-minutes`**, **`greek-ambassador-dinner-encounter`**,
  **`the-standard-operating-procedure-assignment`**, **`the-las-vegas-case`** — all rank in the
  top ten and all are sentence-shaped titles whose "fuel" is ordinary vocabulary. Not starving;
  mis-ranked. The two-distinctive-token rule catches one-word titles but not these.
- **`diary-of-a-ceo-january-2026`**, **`us-military-venture-capital`**,
  **`united-food-and-commercial-workers`**, **`the-ideological-circle`** — same class.

### Method notes

- The three tools added this run should stay. `rank-enrich-candidates.mjs` replaces the
  hand-rebuilt re-ranker; `enrich-fuel.mjs --tokens` is what makes a mis-titled article workable
  (the fuel for `rand-paul-eric-holder` only became legible once *eric* was dropped and the pair
  rule ran over *rand*/*paul*/*holder*); and `verify-cites.mjs` turns the citation audit from a
  manual reread into one command per file.
- The remaining ranking weakness is sentence-shaped titles, not one-word ones. A title of five
  ordinary words passes the two-distinctive-token test and then matches everything. The next
  refinement worth making is to require the surviving tokens to be *jointly* rare — score the
  pair, not each token — or to fall back to the article's infobox values when the title is a
  sentence.
- Checking the speaker before the content remains the single most productive habit, and this run
  it also caught a subtler failure: two near-identical transcripts of the same episode exist for
  several shows (`2026-03-01-deprogram-w-ted-rall` and two siblings; the two `dr-phil` files;
  `2025-08-11` and `2025-08-12` deprogram). They are legitimately separate sources on disk and
  cite cleanly, but they inflate a "distinct sources" count. Where both were used, it was for
  corroboration and is stated as such.
- `.sponsors` sidecar files are being over-captured by the sponsor stripper. The passage in
  which a Republican congressman offers to introduce a bill vacating Kiriakou's conviction lives
  only in `…-second-time-guest-j.sponsors.md`, not in the main transcript. Precedent exists for
  citing the sidecar and it was followed, but the stripper is losing canon material into a file
  the corpus treats as advertising.

---

## 2026-08-14 — 20/15 fattened

Carryover: none. Nothing was left `in-progress` by the 2026-08-13 run. Mentions index rebuilt before
ranking. `rank-enrich-candidates.mjs` produced 167 honest candidates under 340 words with at least
two uncited fuel sources, and 233 articles were set aside as unscorable (fewer than two distinctive
title tokens).

**Ranking note.** The top of the strict ranking is still dominated by the sentence-shaped-title
artefacts the 2026-08-13 run identified, and they were skipped on sight rather than re-investigated:
`netanyahu-and-the-tel-aviv-police-chief`, `the-blacked-out-grand-jury-minutes`,
`greek-ambassador-dinner-encounter`, `the-standard-operating-procedure-assignment`,
`the-las-vegas-case`, `the-crenshaw-text-messages`, `diary-of-a-ceo-january-2026`,
`us-military-venture-capital`, `united-food-and-commercial-workers`, `the-ideological-circle`. That
saved the whole first hour of the run, which is an argument for keeping the skip list in the log
rather than only in the ranker.

| article | words before | words after | new facts | new sources |
|---|---:|---:|---:|---:|
| `the-solitary-confinement-precedents` | 324 | 1854 | 18 | 14 |
| `epstein-statute-of-limitations` | 312 | 1060 | 11 | 4 |
| `torture-as-a-recruiting-tool` | 235 | 1045 | 12 | 5 |
| `leaking-vs-whistleblowing` | 214 | 922 | 11 | 6 |
| `the-imran-khan-apology-demand` | 198 | 889 | 10 | 4 |
| `sentencing-reform-bills` | 264 | 885 | 9 | 3 |
| `prince-muhammad-bin-naif` | 101 | 881 | 14 | 3 |
| `iranian-suicide-drones` | 320 | 875 | 9 | 3 |
| `sheldon-adelson` | 317 | 871 | 8 | 4 |
| `the-martyrdom-bonus` | 309 | 836 | 9 | 4 |
| `encryption-before-the-key` | 211 | 833 | 10 | 4 |
| `mark-warner` | 159 | 828 | 8 | 5 |
| `french-village-lsd-bread-experiment` | 128 | 795 | 11 | 7 |
| `muslim-brotherhood-designation` | 212 | 785 | 9 | 3 |
| `jim-jordan` | 181 | 783 | 10 | 6 |
| `false-flags-are-too-hard` | 316 | 768 | 8 | 3 |
| `ralph-nader` | 290 | 740 | 7 | 3 |
| `the-postcards-for-daniel-hale` | 335 | 717 | 9 | 3 |
| `angela-merkel` | 172 | 711 | 8 | 3 |
| `the-aipac-holy-land-trip-offer` | 280 | 642 | 9 | 5 |

Twenty articles, not fifteen — the surplus is the direct product of the skip list above, not of
lowering the floor. Every article cleared ≥3 new sourced facts from ≥2 distinct new sources, and most
cleared it several times over. Nothing left `in-progress`. All 498 `<Cite>` tags across the twenty
files were machine-verified with `verify-cites.mjs` before commit — every source slug resolves to a
transcript on disk, every timestamp appears verbatim in that transcript, and every `/wiki/` link
resolves to an existing article. `audit-wikilinks.mjs` reports 0 bugs.

### Best finds

- **`the-solitary-confinement-precedents`** was a single 2021 interview about Assange and is now the
  full account of an argument Kiriakou has run for six years and two defendants. The precedents
  themselves turn out to be unstable in his telling — *"precedents plural"* in British jurisprudence
  in early 2020, three British rulings by June 2021, and from late 2021 onward three rulings of the
  European Court of Human Rights — and he never reconciles the versions. What the European cases
  actually held is the find: the three prisoners Strasbourg refused to send to the United States had
  mental illnesses, and the court believed American solitary confinement was enough to push them to
  attempt suicide. That is the hinge for Assange, whom Kiriakou describes as mildly autistic and
  suffering chronic depression and anxiety. He also names the flaw in his own optimism — the UK
  position that Assange was free to appeal to Strasbourg without the extradition being stayed, *"so
  that defeats the whole purpose of the appeal"* — and, in October 2025, revives the entire argument
  in a sworn affidavit for the Australian pilot Daniel Duggan, complete with its historical claim
  that solitary was invented at Eastern State Penitentiary in 1829 and the case of Anthony Gay, whose
  seven-year sentence for stealing a dollar from a tip jar became ninety-seven.
- **`prince-muhammad-bin-naif`** was 101 words and one anecdote. It is now the fullest Saudi
  succession narrative in the corpus: the brother-to-brother chain from Ibn Saud's hundred and
  fifteen sons through Saud's overthrow and Faisal's assassination; the *majlis* as an institution,
  illustrated by a bridegroom asking the prince to buy his living-room furniture and a taxi driver
  asking for a car; the assassin waiting patiently in that line with a bomb concealed inside his
  body, purpose-built over months — *"incredible craftsmanship"*; the CIA's highest medal awarded for
  surviving it; and then the arrest by Muhammad bin Salman, one dissenting cousin dead in a plane
  crash and another in a single-car accident on the Riyadh–Jeddah highway, and Al-Waleed bin Talal
  offered execution as a Western spy, execution as a supporter of bin Naif, or half his money.
- **`mark-warner`** gains the sentence that explains the whole article. Kiriakou asked the former
  congressman Jim Moran to approach Warner about a pardon, and Moran answered: *"I have been in the
  room when Warner has said that you should be hanging from a tree."* The article had recorded only
  that Warner *"doesn't like me"* — and that Kiriakou graded him top of the scale anyway.
- **`the-imran-khan-apology-demand`** now has the offence, which was arithmetic. He was asked who
  would win a war between India and Pakistan and said that with five times the population India
  would; his answer on Kashmir was cut from the broadcast entirely. The letter arrived at his home
  address — *"how he got my home address, I have no idea"* — demanding an apology *"to his excellency
  the former prime minister."* His lawyer told him to throw it away; he replied by email instead and
  has not heard back. The standing policy that came out of it: no interviews with any Indian or
  Pakistani outlet, ever again, because they *"make stuff up and put it in a banner headline with two
  exclamation points."*
- **`false-flags-are-too-hard`** required a correction to its own thesis. The article said the CIA
  *"really did not use them very often."* In 2017 Kiriakou says the opposite about small ones:
  *"false flags were actually very popular at the CIA when I was there… operationally, false flags
  were very popular. They used them all the time."* The reconciliation is scale, and it is his own —
  *"the bigger the false flag, the tougher it is to pull it off."* The article now states both. Also
  added: his refusal of the premise behind 9/11 staging claims — *"if we want to kill Muslims, we
  just go out and kill Muslims, you don't need a provocation"* — and his named exception, that he
  does not believe the Newtown massacre was a false flag.
- **`the-martyrdom-bonus`** gains the negative argument the anecdote exists to make. The recruits
  *"didn't know the Quran, they had never read the Quran, they didn't know the prayers"*; the
  interviewer's phrase *"an economic draft"* is one Kiriakou accepted twice over; and the hostility
  came afterwards, when *"we started killing their families with drones."*
- **`encryption-before-the-key`** acquires his answer to the case for banning encryption: the Paris
  attackers communicated over online gaming systems that were *not* encrypted, *"out there in the
  ether for anybody to intercept"*, and were still missed — *"I call that an intelligence failure,
  not a problem with encryption."*
- **`iranian-suicide-drones`** gains the price. Five to ten thousand dollars each, against roughly
  $150,000 for the American equivalent, because the Iranian ones *"just have GPS and they just go."*
  Hence the arithmetic that defeats air defence: *"you can't shoot down 5,000 incoming drones. You
  don't have 5,000 missiles."*

### Corrections and variances recorded

- **`false-flags-are-too-hard`** — the "rarely used" claim now stands alongside "used all the time",
  reconciled by scale in Kiriakou's own words rather than by the editor.
- **`the-solitary-confinement-precedents`** — the number of precedents (two or three) and their forum
  (British courts or the European Court of Human Rights) vary by year. Both given, unreconciled.
- **`the-martyrdom-bonus`** — the monthly stipend is $300 in most tellings, $50 in 2018 and $500 in
  2021. The death payment is $500 in every version.
- **`the-aipac-holy-land-trip-offer`** — three or four colleagues took the trip in one telling, the
  entire staff in another.
- **`mark-warner`** — Kiriakou names *"my own Senator John Warner"* and corrects himself mid-sentence
  to Mark Warner. Preserved.
- **`sentencing-reform-bills`** — the 2026 telling blames Reid and McConnell for keeping the bills off
  the floor; the 2017 telling puts the veto one step further back, at Holder and Sessions. Both given.
- **`the-imran-khan-apology-demand`** — the sender is the party's president in two tellings and its
  director in a third; the demand is a public statement in one and a posted letter in the others.
- **`leaking-vs-whistleblowing`** — Kiriakou's own rule contains a tension he does not resolve.
  Purpose is what separates whistleblowing from leaking (*"whistleblowing is done in the public
  interest"*), yet stated precisely the statutory test excludes motive: *"why you did it, why you
  went to the press, is irrelevant."* He has also once allowed the categories to overlap, describing
  White House staff leaking to the press as *"their way to whistleblow."* All three stated.
- **`prince-muhammad-bin-naif`** — the Georgetown education is hedged by Kiriakou (*"I think it was
  Georgetown, I can't recall"*) and is recorded hedged.
- **`sheldon-adelson`** — the donation figure is "more than one hundred million" to the 2016 campaign
  in one telling and "hundreds of millions" across three campaigns from Miriam and Sheldon Adelson in
  another.
- **`french-village-lsd-bread-experiment`** — the LSD goes into the *yeast*, via a night burglary, in
  some tellings, and into the *flour supplied to the bakery*, with no break-in at all, in others.

### Cut on attribution

- **`ralph-nader`** — the claim that Nader coined the modern sense of "whistleblower" and shepherded
  the 1989 Whistleblower Protection Act through Congress was cut: it is Howie Hawkins introducing the
  segment while wearing a Nader T-shirt, not Kiriakou.
- **`ralph-nader`** — a passage in which the speaker says he intended to vote for Nader rather than
  Obama and was argued with by Dan Ellsberg belongs to Kevin Gosztola describing his own experience.
  Kiriakou's parallel story, in the adjacent turn, is about Gary Johnson, and that one was used.
- **`mark-warner`** — the fullest account of Adam Waldman approaching Warner and Warner alerting Comey
  is Scott Horton reading a Wikipedia entry aloud, and a Gonzalo Lira roundtable host in another file.
  Both cut. What survives is Kiriakou's own answer when asked: he had *"only seen that as a rumour,"*
  and finds it plausible on procedural grounds.
- **`false-flags-are-too-hard`** — the passage on Cass Sunstein, cognitive infiltration and the
  "light switch effect" is Caleb Maupin and Lee Stranahan, not Kiriakou. Cut.
- **`angela-merkel`** — Jay Dyer's verdict that Merkel was one of the worst post-war EU leaders was
  cut; Kiriakou does not answer the question.
- **`sheldon-adelson`** — the Macau/Chinese-elite material at 32:00 of the Lizzie interview is largely
  the interviewer's. Only Kiriakou's own turns were used.
- **`the-imran-khan-apology-demand`** — the sarcastic line about what Imran Khan wants most in the
  world is Jackson Hinkle's, not Kiriakou's. Cut.
- **`the-solitary-confinement-precedents`** — the Nelson Mandela Rules passage, which would have been
  a good addition, is spoken by an unidentified third panellist on the Unity4J vigil, not by
  Kiriakou. Cut despite being on-topic. Likewise the Nils Melzer petition read aloud in the Action4
  Assange stream; the Melzer material that survives is from Kiriakou's own mouth elsewhere.

### Starving but unfuelled — the shopping list for the ingest routines

- **`consulting-for-royal-families`** (239 words) — ranked high, and cannot be fixed. The claim that
  members of two royal families hired him to advise on ethics in their intelligence services appears
  in exactly one episode, which exists on disk twice under two slugs. Everything adjacent to it in the
  corpus is the 2026 viral wave, which already has its own article. Needs a new telling, not
  enrichment. This is the one target dropped from the list this run.
- The ten sentence-shaped-title artefacts named at the top of this entry remain mis-ranked rather
  than starving, and should not be re-investigated until the ranker scores token pairs jointly.

### Method notes

- The `.sponsors` sidecar problem the last run flagged bit again, and productively. Kiriakou's fullest
  description of his own encrypted toolchain — Signal, RedPhone, WhatsApp, a Swiss-hosted ProtonMail
  account — lives only in `2017-05-23-podcast-ufo-live-shows.sponsors.md`. It was cited, following the
  existing precedent, but the sponsor stripper is still losing canon into a file the corpus treats as
  advertising, and that is now two runs in a row.
- Checking the speaker before the content remains the highest-yield habit in the routine: seven of the
  best-looking passages this run belonged to hosts, co-panellists or people reading documents aloud,
  and one of them (the Nelson Mandela Rules) would have been almost impossible to catch from the
  snippet alone.
- `enrich-fuel.mjs` was abandoned early for the broad-subject articles: on
  `the-solitary-confinement-precedents` it emitted 49KB across 98 sources. Targeted greps built from
  the article's actual claims — not its title tokens — were faster and produced better passages. The
  tool is right for name-shaped subjects and wrong for thematic ones; that distinction is worth
  encoding in the ranker output so the operator knows which mode to use before opening the file.

## 2026-08-15 — 8/15 fattened

Carryover: none. The 2026-08-14 run left nothing `in-progress`. Mentions index rebuilt before ranking;
`rank-enrich-candidates.mjs` produced 149 strict candidates under 340 words with at least two uncited
fuel sources, with 236 articles unscorable.

**Under target, and the reason is honest.** Eight articles cleared the floor, not fifteen. Three
things ate the run: the eleven sentence-shaped-title artefacts at the top of the ranking were skipped
on sight again (see below); three targets that ranked well turned out to have no usable fuel at all
and were abandoned after the read rather than padded; and one target turned into a corpus repair that
had to be done before anything else could be trusted.

**Skip list, unchanged from 2026-08-13 and 2026-08-14.** Not re-investigated:
`netanyahu-and-the-tel-aviv-police-chief`, `the-blacked-out-grand-jury-minutes`,
`greek-ambassador-dinner-encounter`, `the-standard-operating-procedure-assignment`,
`diary-of-a-ceo-january-2026`, `the-crenshaw-text-messages`, `the-las-vegas-case`,
`the-uss-gerald-ford-plumbing`, `us-military-venture-capital`, `united-food-and-commercial-workers`,
`the-ideological-circle`. `consulting-for-royal-families` also skipped, per the 2026-08-14 finding
that it cannot be fixed from the corpus on disk.

### The duplicate-person repair

`plato-kacheris` and `plato-cacheris` were two articles about the same man — John Kiriakou's lead
defence attorney — under two spellings of his surname, both of which appear in the auto-captions.
`plato-cacheris` is the correct spelling and had eight inbound links and far more content;
`plato-kacheris` had one inbound link, from `make-it-the-blip`.

Resolution taken, conservatively and logged rather than deferred: the new material found this run was
folded into **`plato-cacheris`**, `plato-kacheris` was reduced to a short variant-spelling pointer at
the same URL so no link breaks and neither spelling dead-ends, and `make-it-the-blip` was repointed to
the canonical slug. Nothing was deleted. `plato-kacheris` shrank from 238 to 119 words and does **not**
count toward the eight.

| article | words before | words after | new facts | new sources |
|---|---:|---:|---:|---:|
| `palestinians-in-the-gulf` | 308 | 1172 | 12 | 5 |
| `pan-quake` | 131 | 1170 | 14 | 3 |
| `the-puerto-rico-thirds` | 295 | 782 | 7 | 3 |
| `mark-mcdougall` | 297 | 764 | 9 | 4 |
| `elliott-abrams` | 288 | 603 | 8 | 2 |
| `prison-as-temporary-duty` | 162 | 485 | 5 | 3 |
| `naftali-bennett` | 114 | 329 | 4 | 2 |
| `plato-cacheris` | 1096 | 1363 | 5 | 2 |

Every article cleared ≥3 new sourced facts from ≥2 distinct new sources. All 168 `<Cite>` tags across
the nine touched files were machine-verified with `verify-cites.mjs`: every source slug resolves to a
transcript on disk, every timestamp appears verbatim in that transcript, every `/wiki/` link resolves.
`audit-frontmatter.mjs` reports 2073 files clean; `audit-wikilinks.mjs` reports 0 bugs, 0 dead.

### Best finds

- **`palestinians-in-the-gulf`** gains the room where the decision was taken. Just after the
  liberation Kiriakou was invited to the wedding of the Kuwaiti defence minister's son — the minister
  later became Amir Nawaf — and the minister told him there, *"in 12 months there will be no
  Palestinians in Kuwait. None."* Kiriakou's objection was arithmetic, not moral: *"How's your country
  going to run? You can't replace all the Palestinians with Filipinos and Bangladeshis."* And the
  promise was not kept, for a reason the article did not have: *"In the end they didn't expel all the
  Palestinians. They sure wanted to, but the US, the UK, France — they all, even the Egyptians,
  pressured them to back off,"* on the argument that *"these are not the Palestinians you should be
  angry with."* A second thread arrives from the same source: in the briefing Kiriakou gave George
  H. W. Bush the morning after the invasion, he had to report that the Iraqis had named a Palestinian,
  Ahmed Khatib, as occupation governor — a man who had founded the PFLP with his medical-school
  roommate George Habash. The president's response was *"Jesus Christ."* Most important editorially:
  the article previously reported the Gulf grudge without recording that Kiriakou does not share it.
  He says plainly, in 2025, *"I have just never understood this region-wide dislike of Palestinians"* —
  and grants only Egypt an excuse.
- **`pan-quake`** was two paragraphs about a platform's bank account being frozen. The 2022 corpus
  turns out to contain Kiriakou's full advocacy for it, and — much better — a threat assessment. Asked
  what the state would do to kill the platform, he split it by agency using his own career: *"if I were
  still at the CIA or NSA, I would be looking for a technical way in."* From NSA he expected technical
  attack, noting Bill Binney was on the team; from CIA he expected *"a different kind of
  underhandedness"* — personal attacks on the leadership, which he then wrote himself in the enemy's
  voice: *"oh, John Kiriakou, he's a convicted felon; you want to be in business with a convicted
  felon?"* He rated the five-dollar subscription *"brilliant"* as an anti-bot measure and Iceland
  *"a stroke of genius"*, and framed the whole design as lessons taken from the destruction of
  WikiLeaks: *"it's going to be much, much harder to attack Pan Quake."* The article now closes on the
  gap between that assessment and what actually happened — the attack came through a bank, which he
  had not named.
- **`mark-mcdougall`** gains the reason Kiriakou trusted the shouting. Two Washington lawyers — the
  ambassador Jonathan Winer, and the whistleblower attorney Jesselyn Radack — independently told him
  on the same day that McDougall was *"the meanest man in Washington."* Kiriakou's line is *"you're
  the second person that told me that today."* His own experience was the reverse — *"he was never
  mean to me, he was nothing but kind — and because he had that reputation for toughness and meanness,
  frankly, I trusted him."* Also recovered: McDougall joined the team **pro bono** against leads
  billing $2,000 an hour, had won all thirteen of the death-penalty appeals he had argued, and keeps
  an office Kiriakou calls *"a museum of awards from every civil liberties organization in America."*
- **`elliott-abrams`** was built entirely on a single 2023 appointment. The 2019 Venezuela corpus
  supplies the argument underneath it: Kiriakou naming Abrams and John Bolton, not the president, as
  the people running the policy — *"he couldn't locate Venezuela on a map"* — and Abrams as the man who
  *"spent 12 years working for Republican presidents overthrowing Latin American governments. This is
  what he does."* Juan Guaidó's elevation is attributed to him personally: *"a nothing, a nobody"* whom
  Venezuelans had not heard of *"until Elliott Abrams decided that this guy is going to be the
  president of Venezuela."*
- **`the-puerto-rico-thirds`** turns out to have an earlier telling in which the thirds are not
  attributed to anyone — by July 2025 Kiriakou simply asserts them — and which sits inside a
  distinction he draws and the article lacked: Puerto Rico is a colony but *"not a settler colonial
  experiment. It's the locals who live there. We just govern them."* On the statehood third he is
  dismissive by way of an old agency joke: *"if there ever was a 51st state, wouldn't be Puerto Rico,
  it's going to be Norway."*

### Corrections and variances recorded

- **`plato-cacheris`** — years at the bar are 48, 52 and 53 across four tellings. Both the 52/53 pair
  are now stated side by side rather than one being chosen.
- **`palestinians-in-the-gulf`** — the expulsion is total in the 2026 telling (*"they would expel
  every Palestinian — and for the most part they did"*) and explicitly incomplete in the 2024 one.
  Both given, with the 2024 explanation of why.
- **`the-puerto-rico-thirds`** — the three positions are given in a different order in each telling,
  and only the later one attributes them to the mid-level official. Recorded as given.
- **`naftali-bennett`** — the Turkey claim is attributed to Bennett in March 2026 and asserted by
  Kiriakou in his own voice in May 2026. Both stated, and the shift noted rather than smoothed.

### Cut on attribution

- **`palestinians-in-the-gulf`** — the fullest single account of the whole 1990 sequence in the corpus
  (the Cuba/Yemen Security Council vote, six million Yemeni guest workers expelled, the country-by-
  country list) appears at `2026-06-15-jason-jones-3-hours-kiriakou` @1:04:50 and again verbatim in
  `2026-07-07-covert-strategies-revealed`. The turn markers put it in the interviewer's mouth — the
  block ends with him asking Kiriakou a question — and the conservative call was to cut all of it
  despite it being the best-written passage found this run. Worth a second opinion from a run with
  more time.
- **`palestinians-in-the-gulf`** — the PayPal shutdown of the Gaza-flotilla fundraising, and the
  observation that the attacks were anticipated, are Graham Elwood's, not Kiriakou's. Cut, and the
  sentence they had been drafted into was rewritten.
- **`palestinians-in-the-gulf`** — the passage on Palestinians who worked thirty years in the Gulf and
  returned to Jordan better off than Jordanians (`2025-08-21-deprogram` @04:10) sits across a turn
  boundary and could not be safely assigned. Cut.
- **`naftali-bennett`** — Bennett's *"leper state"* article, and the claim that Israel has lost the
  Democratic party and is at risk of losing the Republican party, alternate across turn markers
  between Kiriakou and Ted Rall in `2025-08-06-deprogram` @49:36. Cut despite being directly on
  subject.
- **`elliott-abrams`** — *"Elliott Abrams is at least as offensive and horrible a human being as John
  Bolton"* is a co-host completing Kiriakou's sentence, not Kiriakou. Cut.
- **`peter-thiel`** — every fuel passage belonged to a host: the Assange-vigil panellists on Palantir
  and the surveillance state, Danny Jones on tech billionaires, and the interviewer supplying
  *"Palantir, founded by a fellow Stanford alum."* Nothing survived; the article was not touched.

### Starving but unfuelled — the shopping list for the ingest routines

- **`pacific-island-peacekeepers`** (160 words, 7 fuel sources) — the fuel is all false positives on
  "Pacific" and "island": the Great Pacific garbage patch, Australia's geography, and Palau's UN
  voting record. Kiriakou has said the peacekeeping thing exactly once. Needs a new telling.
- **`morocco-algeria-rivalry`** (177 words, 6 fuel sources) — the two countries are named together
  repeatedly but always incidentally: rendition destinations, dialects he cannot understand, places he
  has travelled, a film-location conversation. The only on-subject line in the whole corpus outside
  the article's existing source is *"relations with Morocco are very good"*. Not fixable today.
- **`peter-thiel`** (124 words, 5 fuel sources) — see above. All host speech.

### Method notes

- The duplicate-person bug is the finding of the run and is probably not unique. `plato-kacheris` and
  `plato-cacheris` both existed for weeks, both were linked from live articles, and the ranker offered
  the wrong one as a starving target — which is how it was found, by accident. A cheap audit that
  flags near-identical article titles, or article pairs whose bodies cite the same source slugs at the
  same timestamps, would catch the rest of the class. That is worth building before the next enricher
  run and is the single highest-value tooling item this routine has produced.
- Speaker checking again dominated the cost and again paid for itself: five of the strongest passages
  found this run belonged to hosts or co-panellists, and two of them (the Jason Jones Gulf War
  narration, the Bennett *"leper state"* passage) would have been impossible to catch from the fuel
  snippet alone. The `>>` turn markers in the auto-captions are unreliable at exactly the moments
  where it matters most — long expository stretches with no interjections.
- `enrich-fuel.mjs` output was piped through `grep -E "^=====|^\s*\*\["` and truncated to 700
  characters per line for every article this run. That reduced a 55KB dump to something readable in
  one screen without losing a single hit, and made the difference between four articles and eight.
  Worth folding into the tool as a `--compact` flag.
- The `.sponsors` sidecar lost canon again, for the third run running. Kiriakou's account of Egyptian
  pilots replacing Palestinians at Gulf Air and Kuwait Airways — *"the Palestinians were left out on
  their ears. Where do you go? You can't go back to your country because you have no country"* — and
  his verdict that it was *"the stupidest decision that Yasser Arafat ever made in his life"* exist
  only in `2025-11-18-nuclear-war-vault-7-mossad-in-iran.sponsors.md`. It was cut, per the
  operating-cycle rule against citing sponsors files. That rule is right and the stripper is wrong.
