# Archaeology Log

Standing record of the noon archaeology dig — every search angle tried, what it returned, and
what was rejected and why. The point of this file is that no future dig repeats an angle that
has already been worked dry. Read it before searching.

---

## 2026-08-05 — first run

**Result: 1 video found, vetted and fully ingested.** Well short of the target of 10. The
shortfall is real and is explained below; it is not for lack of angles worked.

### Headline finding: the ledgers are not a head start any more

The routine assumes the standing ledgers contain uningested candidates that are free finds.
As of today they do not.

- `KIRIAKOU-OPEN-VIDS.md` — 100 rows, **all already `ingested`**, 4 `skip`. Nothing to take.
- Pulled every videoId out of all six ledgers (`OPEN-VIDS`, `OPEN-VIDS-BATCH4`,
  `NEW-VIDS-2026-07-28`, `MASTER-LEDGER`, `UNIVERSE`, `SOURCE-DISCOVERY`) = **1,156 unique ids**.
  Diffed against corpus videoIds + `.kir-exclude.txt` + `.kir-intake-progress.tsv` (1,619 known)
  → **102 genuinely unresolved**. Probed all of them with yt-dlp for real channel, duration and
  upload date.
- Of those 102, **zero survived vetting.** Breakdown below.

### The re-cut farm problem (the main reason the pool is empty)

The unresolved ledger rows are dominated by channels that re-cut interviews already in the
corpus. I verified this rather than assuming it, because the ledger's own guess was wrong in
both directions.

Method: pull auto-captions, normalise to plain text, then measure (a) union 8-gram coverage
against the whole corpus and (b) contiguous verbatim runs against the single best-matching
corpus file.

**Calibration matters here and cost me an hour.** Union coverage alone is *not* discriminative:
a known-genuine interview (Theo Von #661) scores **60.7%** leave-one-out against the corpus,
because Kiriakou retells the same anecdotes in near-identical words. Anything that treats
~60% as proof of duplication will reject real material. The discriminator that actually works
is **long contiguous verbatim runs against one file, including the host's own speech**.

| Channel | Verdict | Evidence |
|---|---|---|
| Covert Operations Insight (9) | **re-cut farm — reject** | 43iOYjANtcQ: 148 runs ≥25 words vs Theo Von #661, incl. host questions |
| Covert Strategies Revealed (27) | **re-cut farm — reject** | JBbwtTbC3hA: 65% union, concentrated on two prior interviews |
| **National Security Files (8)** | **re-cut farm — reject** | z4OWvuV3EYQ: 190 runs ≥25 words vs The Pocket / Chris Griffin, **including a verbatim podcast ad read** |
| The Insight Network, Rated R TV | reject | flagged re-upload channels; EQCTyoEjeMc has since been deleted by its uploader |
| Liberty Vault (2) | reject | not a Kiriakou channel (per BATCH4 ledger note) |

`KIRIAKOU-NEW-VIDS-2026-07-28.md` §F1 calls National Security Files *"REAL, and the best find"*.
**That is wrong** — it is a re-cut farm like F4 and F5. Corrected here so the next dig does not
spend the run on it.

### Corpus integrity issue found in passing (not fixed — flagging only)

**24 source files already in the corpus come from these farm channels**: Covert Operations
Insight ×10, Covert Strategies Revealed ×4, Liberty Vault ×7, National Security Files ×3. They
have been woven into articles and are cited there (e.g. `george-tenet.mdx` cites
`2026-06-02-covert-strategies-revealed-…` for the Tommy Franks/Tehran exchange). That means
some citations point at a re-cut aggregation rather than the original interview.

I did **not** touch them. Deleting them would break live citations and is well outside a
discovery run. This needs a dedicated provenance-repair pass: for each of the 24, find the
original interview, re-point the citation, then retire the farm copy.

### Angles worked today

| Angle | Queries | Yield |
|---|---|---|
| Ledger mining (all six ledgers) | — | 102 unresolved → **0 usable** |
| `tools/find-new-kiriakou-videos.mjs` baseline | fixed set, ≥40m | **1 hit — and it was a National Security Files re-cut.** The floor is dry. |
| Career-era: 2007 waterboarding, 2009 Zubaydah, 2012 plea, 2015 release, Reluctant Spy tour | 5 | 0 |
| Topic: Espionage Act, Assange extradition, torture-whistleblower-2013 | 3 | 0 |
| Co-guest: McGovern, Radack, Drake, Ellsberg, Hedges, Maté, Halper, Rowley, Husseini | 9 | 0 new Kiriakou — **this angle is a trap**: it returns the co-guest's own catalogue, not his. |
| Misspellings: "Kiriako", "Kyriakou" | 2 | 0 |
| Events/talks: Liberty Forum, keynote, university lecture, book talk, HOPE, Left Forum, film festival, bookstore, award | 20 | **the productive vein — 2 real finds** |
| Foreign/diaspora: Cyprus, Greece, Greek Orthodox | 3 | **the Cyprus find** |
| Internet Archive (`archive.org` advancedsearch, 120 hits) | 1 | 0 usable — dominated by RT *The Whistleblowers* TV captures (his own show, ~30m) |

Two sweeps of 20 queries × 25 results = **943 raw hits, ~420 unique ids new to the corpus**,
nearly all of which were other whistleblowers' content surfaced by the co-guest queries.

### Ingested (1)

| Show | Date | Len | videoId | Note |
|---|---|---|---|---|
| Cyprus Diaspora Forum — *John Kiriakou Fireside Chat* | recorded **2026-05-08**, uploaded 2026-07-23 | 75m | `vCB56HbNvOo` | 3.2% union coverage — almost entirely new material |

Interviewed by Philip Amaman at the Amara Hotel, Limassol. Solo fireside chat, not a panel.

**Normaliser bug caught here — worth knowing about.** `normalize-vtt.mjs` stripped 12
consecutive paragraphs (30:16–36:05) as "sponsor reads". They were not ads: they were the
richest canon in the recording — the Nicosia green line, the lit crescent on the mountainside,
his refusal on principle to cross to the occupied side, the dinner with the Turkish deputy
foreign minister, and the Republican committee chairman on NATO Article 5. This is exactly the
over-stripping failure the playbook warns about. I restored all 12 paragraphs in timestamp
order and deleted the `.sponsors.md` sidecar. **Check the sidecar on every event recording** —
applause, music stings and audience Q&A appear to trip the ad heuristic.

### Rejected after fetching (worth recording so they are not re-fetched)

| videoId | What it was | Why rejected |
|---|---|---|
| `WF8NOMGWI2o` | "Piers Morgan & John Kiriakou Full Debate", 51m | **Five-way panel** (Piers, Scott Horton, Joe Kent, an Israeli guest, Jim). Kiriakou only enters at 13:24 and auto-captions carry no speaker labels — attribution unsafe under doctrine rule #4. Fetched, then removed and added to `.kir-exclude.txt`. |
| `jEamop1gJxw` | "A Fireside Conversation at Cyprus Diaspora Forum", 70m, World Affairs Podcast | Same conversation as `vCB56HbNvOo`, different uploader. Kept the forum's own longer cut. |
| `uxHODlAhiBk` | "John Kiriakou & Jay Dyer", 78m | **He is the host** — this is his own *Deep State* show posted to Dyer's channel. Low canon density. |
| `jOzI8j-dHKg` | "CIA Whistleblower Debates CIA Loyalist", 60m, *Best of* Danny Jones | Re-upload of `2024-08-12-danny-jones-loyal-officer-vs-dissident-spy`. |
| `P87hPOyEOfE` | Julian Dorey Daily, 61m | 154 verbatim runs ≥25w vs `2026-02-23-epstein-lies-satanic-elite-mossad` — re-cut. |
| `ftznt3LxoEI` | The Young Turks, 47m | Same conversation as the two 2026-07-10 TYT sources, re-posted 3 days later. |
| `0Q8vwrego9k` | NH Liberty Forum 2014, 94m | **Kiriakou is not in it** — zero mentions in the full transcript. Title matched, he did not. |
| `jcg5aO_H9OU` | American Whistleblower Tour, 89m, 2015 | Genuine and he is credited — **no captions**. → whisper queue. |
| `mriqX2_9Xp8`, `18pZGRe8F4U`, `hJEWVVtbB48`, `8SV3618tLAE`, `aFszjzDjbo8`, `VfDIZ0t4zt0`, `tO83oMvqKKE`, `RcB7b2FBgD0` | think-tank / conference panels | multi-guest panels — doctrine reject |

### Parked for whisper

- `jcg5aO_H9OU` — American Whistleblower Tour: Essential Voices for Accountability, 2015-03-31,
  89m, Edmond & Lily Safra Center. Genuine, credited, no auto-captions. Best remaining lead.

### Honest assessment of the shortfall

I reached 1 of 10. The angles in §2 of the routine are worked above, plus a round of invented
ones (Internet Archive; diaspora-forum and Greek/Cypriot event vocabulary; the verbatim-run
duplicate test used as a discovery filter rather than only a dedupe). The constraint is not
search effort — it is that **the 2024–2026 YouTube surface is saturated**, and what looks like
untapped supply in the ledgers is re-cut farm output that dedupes clean by videoId while being
duplicate by content.

Where the remaining supply actually is, for the next dig:

1. **Caption-less event recordings** — the whisper path. `jcg5aO_H9OU` is one; the GAP
   American Whistleblower Tour ran multiple campus stops, each likely its own recording.
2. **Panels, if the doctrine is revisited.** There is a real body of 2014–2017 conference
   material (HOPE X, FIFDH Genève, CovertAction events, Assange vigils) where he speaks
   substantively. All currently rejected on attribution grounds. A speaker-diarisation step
   would unlock this tier — worth raising, because it is the largest untapped block found today.
3. **Non-YouTube audio** — podcast RSS back-catalogues, radio archives, C-SPAN. Barely scratched;
   the Internet Archive pass today only covered its own index.

### Editorial output

New article: **Breaking the nuclear taboo** — Trump reportedly weighing a tactical nuclear
weapon in Iran to break the taboo so future presidents could use larger ones; the cabinet
objection; the General Caine nuclear-codes account and Caine's denial. Written from three
independent sources, not just today's.

Woven (all verified against timestamps before citing):

- `bill-richardson.mdx` — his own counter-ask (ambassador to Greece or Cyprus in the second
  term); Eric Holder as a third man promised State; six promised in total.
- `john-kerry.mdx` — Kerry telling the Obama Christmas-dinner story *on stage* at Brookings,
  off script, with Kiriakou reading along in the front row.
- `george-tenet.mdx` — Rice's *"George, you're just going to have to take one for the team"*;
  what the agency's actual WMD paper said. This exchange appears in 6 sources and was in **no**
  article.
- `cyprus-green-line.mdx` — the lit crescent, the refusal to cross, the 45-minute visit,
  Turkish Cypriots vs settlers, the Anatolian demographic point.
- `israel-turkey-nato-article-5.mdx` — the scenario put to a Republican committee chairman and
  his EU-military-alliance answer.
- `netanyahu-nuclear-threat-to-trump.mdx` — the 1986 start date, the sequence of refusals,
  Obama's *"go ahead, use them"*.
- `gulf-security-bargain.mdx` — August 1990 dating, the embassy's photographic history of the
  "special relationship", two ambassadors confirming it is lip service, *"crooked real estate
  agents"*.

---

## 2026-08-06 — the podcast-feed seam

**Headline: the ledgers were a head start after all — just not the part anyone had looked at.**

Yesterday's dig concluded the pool was empty after pulling **1,156 videoIds** out of the six
standing ledgers and finding 102 unresolved, none usable. That method had a blind spot: it
extracted `videoId`s and nothing else. Every **non-YouTube URL** sitting in those same files —
podcast RSS feeds, direct MP3s, Vimeo, C-SPAN — was invisible to it.

There were **197** of them. 160 were podcast feeds. Scanning those feeds for Kiriakou episodes
returned **168 episode hits, 111 of them ≥40 minutes**, and after dedupe against the corpus by
date + title overlap, **53 genuinely unresolved** — of which 18 passed vetting as full-length
solo interviews. Many have **no YouTube upload at all**; the audio→whisper path is the only way
in, which is exactly why a decade of YouTube-first sweeps never touched them.

### Angles worked

| Angle | What it returned |
|---|---|
| **Non-YouTube URLs in the ledgers** (new) | **The seam.** 197 URLs → 160 feeds → 168 Kiriakou episodes → 111 ≥40m → 53 unresolved → 18 vetted accepts. This is where the run's finds came from. |
| `find-new-kiriakou-videos.mjs` baseline | 147 videos across 6 searches, **0 new candidates**. The floor is still dry. |
| **In-channel search across all 302 corpus channels** (new) | 2,210 hits. Almost entirely his own shows (DeProgram, Deep Focus, Dead Drop, Briefing Room), re-upload farms, and multi-guest panels (Mario Nawfal, #Unity4J, Suzi 3D). **One genuine find: Fort Collins part 2** — the corpus had part 1 and not part 2. |
| Scott Horton's own archive (WP REST API, 53 results) | All 15 Kiriakou interviews **already in corpus**. His pre-2015 antiwar.com radio era did not migrate to the current site. Dead end, now documented. |
| **Apple/iTunes podcast-episode index** (new) | 99 episodes, **0 new**. Theo Von, Cleared Hot, Jeff Dornik, Dalton Fischer, Rogan #2392 all already held. The mainstream podcast surface is as saturated as YouTube. |
| Internet Archive (`advancedsearch`, 120 hits) | Same as yesterday — dominated by RT *The Whistleblowers* captures (his own show). 0 usable. |
| Era/misspelling/foreign-outlet sweep (20 queries × 20) | **0 new.** "Kiriakow", "Kyriakou", "Kirakou", Press TV, TRT, Al Mayadeen, teleSUR, CGTN, 2010 book tour, 2012 indictment, 2015 release — all dry. |
| Podchaser appearances index | **403 Forbidden.** Not scrapeable; unresolved. |
| YouTube fast-path for queued audio items | 13 targeted searches → **1 hit** (IRONCLAD = the Change Agents episode, with captions). Ingested via the fast path instead of whisper. |

### Correction to yesterday's log

`jcg5aO_H9OU` — "American Whistleblower Tour", parked yesterday as *"genuine, credited, no captions… best remaining lead"* — **does not contain Kiriakou.** I transcribed all 89 minutes to check. The panellists are Jesselyn Radack and Walt Tamosaitis; Kiriakou's name appears exactly twice, both inside Radack's introduction, where she is described as representing *"Edward Snowden and Thomas Drake as well as John Kiriakou."* He is a client being listed, not a speaker. Removed, added to `.kir-exclude.txt`. Same failure mode as `0Q8vwrego9k` yesterday: the title matched, the man did not.

### The ad-stripper is losing canon — found again, five times in one run

Yesterday's log flagged `normalize-vtt.mjs` over-stripping on one event recording. It is not an
edge case. **Five of this run's transcripts had real interview content filed as advertisements:**

| Source | Buried | What was in there |
|---|---|---|
| Sharyl Attkisson | **24 paragraphs** | His entire Assange background — Collateral Murder, the Swedish cases, the bugging of the Ecuadorian embassy, the plan to kidnap or kill him, Belmarsh. Exactly **one** line in the sidecar was a real ad (a body-butter read). |
| The Platform Talk | 12 paragraphs | The classic 12-paragraph fuse. |
| IRONCLAD | 22 paragraphs | 2 genuine ads correctly held back — the tool works when it runs. |
| U Cast (Venezuela) | 4 paragraphs | BRICS recourse, and his forecast that **Cuba falls next**. |
| U Cast (torture) | — | **The opposite failure:** two genuine radio ads (Moore Park College, a zoo light show) left sitting *in* the canon transcript, unstripped. |

`tools/unstrip-sponsors.mjs` fixed all four over-strips cleanly. The unstripped ads I left alone
under the non-lossy rule rather than hand-edit canon.

**There are 255 `.sponsors.md` sidecars in the corpus.** If the hit rate here is anything like
representative, a large amount of Kiriakou's testimony is sitting outside the canon corpus,
invisible to every article writer downstream. The Assange case is the proof: `julian-assange.mdx`
was 190 lines deep on the prosecution and had **never once mentioned Collateral Murder or
Belmarsh**, because the passage where he explains them had been filed as an ad read. A corpus-wide
`unstrip-sponsors --all` pass is the single highest-value job available right now. I did not run it
here — it is a large change and outside a discovery run's remit — but it should be its own routine.

### Ingested (10)

| # | Show | Date | Len | Path in |
|---|---|---|---|---|
| 1 | Kim Iversen — *Israel and Al-Qaeda* | 2026-04-02 | 68m | YouTube captions. Corpus held only a **12-minute clip** of this taping; this is the full episode. |
| 2 | Fort Collins Community Action Network — **Part 2** | 2016-04-26 | 50m | YouTube captions. Corpus had part 1 and not part 2. |
| 3 | Colonial Outcasts — *Renditions to El Salvador* | 2025-04-18 | 40m | Podcast feed → whisper |
| 4 | The Sharyl Attkisson Podcast #200 | 2023-10-13 | 40m | Podcast feed → whisper |
| 5 | The Platform Talk Podcast | 2021-03-24 | 66m | Podcast feed → whisper |
| 6 | IRONCLAD / Change Agents (Andy Stumpf) | 2025-09-03 | 41m | Captioned YouTube twin of a feed episode — fast path |
| 7 | U Cast Studios — *The CIA, Torture, And More* | 2024-12-19 | 43m | Podcast feed → whisper |
| 8 | Yung Flamingo Club | 2025-09-02 | 72m | Podcast feed → whisper |
| 9 | U Cast Studios — *Venezuela, the Maduro Trial* | 2026-02-05 | 50m | Podcast feed → whisper |
| 10 | Macro N Cheese — *Spelunking the Deep State* | 2023-01-07 | 60m | Podcast feed → whisper |

**Target met: 10 found, vetted, transcribed and written.** Eight of the ten came from the
podcast-feed seam and have no YouTube upload at all.

### Rejected after vetting

Julian Dorey Daily (all 16 rows — daily re-cuts of the main podcast, the farm yesterday
identified); Real Coffee with Scott Adams ×5 (his own show, Kiriakou only referenced); The Antedote
×3 (about RT and Russian media, not him); Piers Morgan Uncensored ×6 (panels — attribution unsafe);
Danny Jones #390 (guest is Julian Dorey); CODEPINK Radio ×3 and UK Column News (multi-topic
magazine shows); Politics and Prose (panel); Joannes Wyckmans ×4 (derivative/AI-summary feed);
con-sara-cy theories (commentary *about* his DOAC appearance); Valuetainment ×11 (all clips under
15m); plus same-conversation dups under different show names — WiseNuts, Ripple Effect ×2, Break It
Down, Potkaars, Jack Hopkins, Jack Neel, Doug Bopst, The Jason Jones Show, Fortress On A Hill Ep
133, London Real, Opperman Report, Austin and Matt #12.

### Whisper timing note, for whoever runs this next

faster-whisper `small`/int8 hit ~3× realtime with one worker. I started a second worker to
parallelise and **that was a mistake** — on 4 performance cores the two contended and each dropped
to ~1.3×, so combined throughput fell *below* a single worker. It got worse later when another
routine started competing for CPU (load average 12.7 on 8 cores). **Run one whisper worker, not
two**, and check `uptime` before assuming a stall.

### For the next dig — the head start

`KIRIAKOU-OPEN-VIDS.md` now carries **10 `queued` rows** (vetted, full-length, audio path ready) and
**5 `candidate` rows** (need vetting). Take the queued ones first; they are free finds. Beyond that,
the seam itself is not exhausted: this run scanned only the feeds *already named in the ledgers*.
Feeds nobody has ever written down remain untouched, and Podchaser's appearances index (403s to
plain fetch) is still unopened.

### Editorial output

**New articles (4)** — `bernie-sanders` (the Senate cafeteria, where Sanders held open breakfast
for anyone who walked in, against a senator who shoved a pregnant woman out of the cashier's line);
`proposals-to-relocate-the-palestinians` (the 1980s plan to rename a barren diamond on the
Saudi–Iraqi border "Palestine" — *"even insects don't live there"* — which lapsed when the two
governments settled the border); `israels-rightward-shift`; `cia-internal-social-culture` (his
one-word verdict, *"incestuous"*, and the club-for-everything structure behind it).

**Enriched (22)** — `julian-assange` (Collateral Murder, the Swedish cases, the bugged embassy,
Belmarsh — none of which the article had, because the passage had been filed as an ad read);
`fci-loretto` (the warden rejecting a book on CIA interrogation as *"disruptive"*);
`cia-recruitment-through-academia` (the Officer in Residence program, and that the professor-spotter
method by which he was recruited became illegal under the 1993 EEO Act); `zero-dark-thirty`
(Ellsberg telephoning two days before he went to prison — *"you're the only one with the moral
authority"* — and Mark Boal's reported regret); `cia-insiders-guide-to-surveillance` (the
surveillance-detection instructor who never noticed three years of FBI surveillance: *"I never
bothered to look, because I hadn't done anything wrong"*); `presidents-daily-brief` (the blue-border
and black-border reports, and *"isn't it great to be one of us now?"*); `once-cia-always-cia` (the
leave-without-pay year that is the whole factual basis of the slogan); `ron-wyden`
(*"it took all of my energy just to not lose my security clearance"* → *"even the overseers are
afraid of them"*); `george-tenet` (who persuaded him, and that they still believe they were right);
`alexander-acosta`; `extraordinary-rendition`; `expanding-the-definition-of-terrorism` (the CIA's
own working definition); `trump-cartel-terrorist-designation`; `bashar-al-assad` (the 2004 border
understanding); `sanctions-effectiveness`; `operation-paperclip`; `israel-united-states-relations`;
`venezuela-regime-change-2026` (Cuba next); `kiriakou-transfer-to-operations` (*"you are always
going to be the good cop"*).
