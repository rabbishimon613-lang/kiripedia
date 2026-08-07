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

---

## 2026-08-07 — platforms, the widened-feed seam, and the show-name dedupe trap

**Result: 12 new sources transcribed into the corpus; 10 of them written into the encyclopedia.**
Target met, but only just, and the attrition is the story: of 21 items that entered the day as
live candidates, **7 were duplicates of material already in the corpus** and none of them
deduped by videoId, by show name, or by title.

### Headline: the dedupe every previous dig has been getting wrong

Vet by **date + duration** against `ls src/content/sources/` FIRST, and only then by name.
Two distinct failure modes, both of which passed silently through yesterday's vetting:

1. **One taping, two show names (same network).** The Ironclad network publishes the same
   recording under multiple brands. `Borderland: Narcosis` 2025-04-07 (61m) *is*
   `2025-04-07-ironclad`; `Change Agents with Andy Stumpf` 2025-05-28 (61m) *is*
   `2025-05-28-ironclad-hidden-terror-program`. Both were queued yesterday as fresh finds.
2. **The feed carries the SHOW name; the corpus carries the HOST name.** `Dream Out Loud` #363
   is corpus `2026-05-05-morgan-nelson-cia-whistleblower` — same date, identical title.
   `Straight Talk with Mark Bouris` is corpus `2026-03-25-mark-bouris-…`. Grepping `show:`
   across the corpus finds neither, because the corpus never recorded the show name.

I caught the first one only by accident, at the editorial stage, after paying the full whisper
cost — the article I was about to weave into already cited `2025-04-07-ironclad`.

### Angles worked

| Angle | Status | Yield |
|---|---|---|
| Ledger head start (10 `queued` + 5 `candidate` rows from 2026-08-06) | worked | **4 dups, 1 wrong-guest reject**; the rest ingested |
| `find-new-kiriakou-videos.mjs` baseline | worked | 149 videos, 6 searches, **0 new candidates**. Third consecutive dry run — the floor is dead. |
| **Corpus transcript mining for show/host names** (new) | worked | Grepped all 1,110 sources for `on the X show/podcast`. Almost pure noise — he *references* Maddow, O'Reilly, Rogan and Tucker far more often than he reports his own bookings. The one lead (Dr. Phil) was already held 13 times over. **Low-yield; do not re-run.** |
| **Rumble** (platform never opened) | worked | 321 results / 305 Kiriakou-titled over 3 queries × 5 pages. **Rumble is a mirror layer, not a source** — Tucker, Rogan, Dorey, DeProgram and Deep Focus re-uploads plus re-upload farms (TheWarAgainstYou, Free Your Mind, crashingthunder, Truths Unlimited, Goodstuf, pepperpeep). Three Rumble-*native* shows found; one ingested. |
| **C-SPAN** (never opened) | worked | **The find of the day.** 5 results, of which `After Words with John Kiriakou`, 2010-04-23, 61m — Book TV's one-on-one author programme from the *Reluctant Spy* tour, interviewed by **Frederick Hitz, the CIA's own former Inspector General**. In no ledger. Also surfaced `Law and Morality of Interrogation` (2008-10-30), a **pre-whistleblowing** appearance — panel, so doctrine-rejected, but worth knowing it exists. |
| **Odysee / LBRY** (never opened) | worked | 30 results via the `claim_search` JSON-RPC. RT re-uploads of his own show, Next News Network clips, a Portuguese dub, Cleared Hot and Dorey re-uploads. **0 new.** |
| **Dailymotion** (never opened) | worked | 30 results, 3 over 40m. The one lead — Insider's 279m *"How 6 Secretive Government Roles Actually Work"* — is a six-person compilation. **0 new.** |
| **Vimeo** (never opened) | attempted | Search is JS-rendered; plain fetch returns nothing. **Unresolved, not dead** — needs a browser or the API. |
| **Widened podcast-feed seam** (new — the productive one) | worked | Yesterday scanned the 160 feeds *named in the ledgers*; that well is now dry. This searched the iTunes directory **by topic instead of by his name** — 32 topical terms → ~1,000 feeds, most never written down anywhere → **285 Kiriakou episode hits**. After stripping his own shows (DeProgram 187, Dead Drop 46) and Scott Horton (13, all held), **8 shows the corpus had never held**; 5 ingested today, 2 turned out to be host-name dups, 1 doctrine-rejected. |

### The successor to yesterday's seam

Yesterday's insight was "the ledgers contain non-YouTube URLs nobody looked at." That is now
exhausted. The generalisation with water still in it: **search the podcast directory by topic,
not by his name.** He is booked as the expert voice on CIA/torture/whistleblowing/foreign policy,
so the shows that had him are reachable from the subject matter even when his name never lands in
an indexed title. Terms that produced the new shows: *whistleblower, civil liberties, press
freedom, declassified, war on terror, counterterrorism*. Terms that produced only noise: *empire,
dissident, geopolitics, conspiracy realist*.

### Two transcription bugs found, one of them corpus-wide

**1. The ad-stripper is burying canon at scale — now measured.** Every previous log flagged this
qualitatively. `unstrip-sponsors.mjs --all --dry-run` puts a number on it:

> **236 files, 3,332 paragraphs of real interview content sitting in `.sponsors.md` sidecars,
> against 284 genuine ads.** The stripper is wrong roughly twelve times out of thirteen.

Today's intake alone had over-strips of 46, 31, 25, 24, 16, 12, 12, 12 and 11 paragraphs. The
46-paragraph case (Lehto Files) was 39% of the episode. I unstripped every file I ingested today
and left the rest alone — a 236-file mechanical change does not belong inside a discovery run's
single commit, and the last two runs reached the same conclusion. **It should be its own routine,
and it is now the highest-value job in the repo.** A ready-made priority ranking: scan sources for
timestamp gaps > 90s; the 12-paragraph fuse produces a distinctive ~400s hole. Worst offenders:
`dead-drop-s2e5` (+55), `deprogram-show-with-ted-ra` (+55), `jason-jones-3-hours` (+49),
`danny-jones-whats-really-happening-in-israel` (+48), `useful-idiots-halper-mat` (+41).

**2. `whisper2vtt.py`'s VAD filter destroys phone-line guest audio.** *Tell Somebody* (2015)
came back with the host's questions clean and Kiriakou's answers shredded — 9 gaps over 60
seconds, the largest 475s, roughly 20 of 56 minutes missing. It is a telephone interview and the
guest's level trips `vad_filter=True`. Measured on an identical 3-minute slice:

> `vad_filter=True` → 5 segments, **58 words**. `vad_filter=False` → 40 segments, **424 words**.

A 7× recovery. I re-transcribed that episode with VAD off and `condition_on_previous_text=False`
rather than change the shared tool mid-run, but **the default should be revisited**: the
asymmetry is the same one `unstrip-sponsors.mjs` documents — over-recovering silence is cosmetic,
losing testimony is a correctness bug.

### Ingested and written into the encyclopedia (10)

| # | Show | Date | Len | What it added |
|---|---|---|---|---|
| 1 | RFK Jr Podcast | 2022-12-04 | 62m | FBI FOIA turnaround (six weeks vs five years at CIA) and the surveillance-log CD-ROM; the CIA redacting a whole chapter of his surveillance guide as *"currently and properly classified"* — then clearing it when he pointed out he'd copied it off the agency's own website |
| 2 | Discussions of Truth | 2018-07-28 | 62m | The European Parliament panel he was thrown off because an American co-panellist refused to share a stage with a Sputnik host; what the old Greek whistleblower law actually said and what his draft changed |
| 3 | Primary Sources (Defending Rights & Dissent) | 2021-09-08 | 73m | Who the Clinton "cull" actually reached — assets recruited under Reagan who had murdered nuns or served on death squads; Clinton's Latin America declassification order and where the records went |
| 4 | The Big Mig Show | 2025-04-19 | 75m | That the Icelandic lawyers who unfroze Panquake's accounts were WikiLeaks' own Iceland attorneys |
| 5 | **C-SPAN Book TV — *After Words*** | **2010-04-23** | **61m** | His earliest extended account: assembling a Middle East degree around GW's gaps, an experimental class taught by the former Shah's chief of staff, relearning Greek from 1930s slang; the DO interview that ended the moment he said his wife wouldn't move to Sudan; nearly being assigned North Korea; Post refusing credit for the recruitment |
| 6 | DeepStateBear (Rumble-native) | 2025-07-24 | 83m | Reagan's "year of the spy" as the frame for the Pollard rebuttal |
| 7 | The Free Thought Project | 2025-05-19 | 60m | The Nixon yardstick — friends on both right and left "pining for the days of Richard Nixon", and why he still thinks now is more dangerous |
| 8 | Lehto Files (UAP) | 2025-02-28 | 59m | The 1990 agency: typewriters, smoking at desks, the basement barbershop with *Playboy* out, and the abolished unclassified cafeteria |
| 9 | Sarah Westall — Business Game Changers | 2025-03-24 | 52m | Kerry proposing an authorization bill, Kiriakou laughing because he thought it was a joke, and learning the committee hadn't passed one in five years |
| 10 | Eric A. Cinotti: Unplugged | 2026-02-05 | 59m | The Office of Security officer on Pompeo's detail: *"the only person who is less popular than Mike Pompeo is Mrs. Mike Pompeo"* |

### Ingested but adding no new canon (2)

`Abe Lincoln's Top Hat` #572 (2021-09-25, 92m) and `Seymizzle` (2025-10-16, 124m). Both are
genuine, correctly vetted, full-length interviews; both are pure retellings. Every distinctive
element I checked — the Japanese-diplomat sting, the Brennan→Holder letters, the plea ladder from
45 years down to 2.5, Plato Cacheris's *"you stupid son of a bitch, take the deal"*, "it's not
about justice, it's about mitigating damage", the honey-salesman intercepts — is already in the
articles, usually from three or more sources. They stay in the corpus as citation depth. **They do
not count toward the 10**, and padding the number with them would have been dishonest.

### Rejected (10)

| What | Why |
|---|---|
| Borderland: Narcosis 2025-04-07 | = corpus `2025-04-07-ironclad` (same taping, other network brand) |
| Change Agents w/ Andy Stumpf 2025-05-28 | = corpus `2025-05-28-ironclad-hidden-terror-program` |
| Dream Out Loud #363 2026-05-05 | = corpus `2026-05-05-morgan-nelson-cia-whistleblower` |
| Straight Talk w/ Mark Bouris 2026-03-25 | = corpus `2026-03-25-mark-bouris-…` |
| GOLD SHIELDS ep.128 2025-07-25 | = corpus `2025-07-25-gold-shields` |
| Potkaars 2019-05-01 | = corpus `2019-05-01-potkaars-podcast-…` |
| SaltCubeAnalytics 2024-08-20 | same 63m conversation as corpus `2024-07-27-saltcube-…`; feed release lags the YouTube upload |
| **What Should We Call It 2026-03-12** | **Kiriakou is not in it.** Two hosts discuss him in passing — *"it's Kiriakou… he's the former CIA counterterrorism guy."* Third instance of this failure mode after `jcg5aO_H9OU` and `0Q8vwrego9k`: a feed title naming him is not evidence he is in it |
| Whistleblowing Now and Then 2023-03-06 | Multi-contributor academic series with a historian co-presenter — attribution unsafe |
| Primary Sources 2021-07-28 | Jesselyn Radack is the guest, not Kiriakou |

### Parked

- **Tell Somebody 2015-05-21 (58m)** — genuine, and from the four-months-after-release period that
  is thin in the corpus. First transcription was unusable (see the VAD bug above); re-transcribed
  with VAD off at the end of this run.
- **AM WakeUp 2023-07-06 (191m, Rumble-native)** and **Health Ranger Report 2026-02-11 (111m,
  Rumble-native)** — both real, both deferred on format risk (3-hour livestream; multi-topic
  magazine show). In `KIRIAKOU-OPEN-VIDS.md` as candidates.
- **Potkaars New Year's Eve 2020-01-01 (144m)** — carried over again on length/format risk.

### Note for whoever reads the git history

A **second routine was committing to this branch concurrently** (commit `522f142d`, 18:33 UTC,
"Weaving pass 2026-08-07"). It swept up eight of this run's article edits along with its own work.
Nothing was lost, but this run's changes are split across two commits and the tree also carries
eleven untracked article drafts belonging to that other routine, which I did not stage or touch.

### For the next dig — the head start

`KIRIAKOU-OPEN-VIDS.md` carries fresh `candidate` rows from the widened-feed seam plus the two
deferred Rumble-native shows. Beyond that, the untouched ground is: **C-SPAN's full catalogue**
(only the `kiriakou` keyword was searched today — his colleagues' event recordings are unsearched),
**Vimeo** (needs a browser), **Podchaser's appearances index** (still 403s), and the widened-feed
method run against a second directory (Podcast Index or Listen Notes) rather than iTunes alone.
