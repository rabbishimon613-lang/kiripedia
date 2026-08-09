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
