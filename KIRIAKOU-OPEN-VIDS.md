# Kiriakou Open Vids

A running registry of John Kiriakou **long-form videos/podcasts** discovered on the open web
(mostly YouTube), tracked toward ingest into KiriPedia.

**Schema** — one row per video:
`Status | Date | Len | Show | Title | videoId | URL | Notes`

**Status legend**
- `candidate` — found, verified real + long-form + not yet in corpus; ready to intake
- `queued` — selected for the next intake run
- `ingested` — transcript in `src/content/sources/`, woven in
- `skip` — duplicate / clip / re-upload / foreign dub / not actually Kiriakou-centric
- `audio` — no YouTube captions; needs the audio→whisper path (e.g. Dead Drop, Sputnik shows)

**Vetting bar for `candidate`:** title actually names Kiriakou; he is the interviewee (not
just host); ≥ ~40 min full episode (not a daily-clip re-cut); videoId not already in
`src/content/sources/*`.

> To build an intake queue from this file: take all `candidate`/`queued` rows, run captions
> pull → normalize → extract → weave (see the Dead Drop run for the pattern).

---

## Candidates — recent, Kiriakou-centric full interviews (found 2026-07-07)

| Status | Date | Len | Show | Title | videoId | URL |
|---|---|---|---|---|---|---|
| ingested | 2026-07-07 | 77m | Covert Strategies Revealed | Former CIA Officer Speaks Out About Hidden Politics | osXgMj89FwQ | https://youtu.be/osXgMj89FwQ |
| ingested | 2026-07-06 | 75m | The Jason Jones Show | John Kiriakou Answers the Questions Everyone Wants to Ask | CmH5nEr0MkI | https://youtu.be/CmH5nEr0MkI |
| ingested | 2026-07-05 | 82m | The Bad News Program | John Kiriakou on Israeli Spycraft, False Flags, and the CIA | ZqyYHuJsQgM | https://youtu.be/ZqyYHuJsQgM |
| ingested | 2026-07-02 | 47m | Jack Neel | "They Want the Crazy Ones" — Why the CIA Recruits Sociopaths | y939VG16MCY | https://youtu.be/y939VG16MCY |
| ingested | 2026-06-16 | 64m | The Third Way (Orthodox) | CIA and the Vatican, Christian Zionism, and Living the Faith | 99-EzDMH7ck | https://youtu.be/99-EzDMH7ck |
| ingested | 2026-05-31 | 110m | Lazaros Sideras | Future of War: AI, Drones & the Cyprus Conflict | pjuGkLG7ByY | https://youtu.be/pjuGkLG7ByY |
| ingested | 2026-05-18 | 55m | Covert Operations Insight | Does the Charlie Kirk Case Have Evidence Gaps? | 2zy79qrNm-k | https://youtu.be/2zy79qrNm-k |
| ingested | 2026-05-12 | 40m | Covert Operations Insight | The Scandal the CIA Never Wants to Talk About Again | K8NBiggPaTY | https://youtu.be/K8NBiggPaTY |
| ingested | 2026-04-12 | 117m | Matthew Cox / Inside True Crime | CIA Spy Arrested For Exposing Secrets | q3O2MpP7fzY | https://youtu.be/q3O2MpP7fzY |
| ingested | 2026-03-19 | 63m | DMZ America Podcast | Scott Has Questions for John Kiriakou | hn5BdOxEGiY | https://youtu.be/hn5BdOxEGiY |
| ingested | 2026-03-01 | 69m | DeProgram w/ Ted Rall | EXTRA! Mideast in Flames | aMGfqMyZz5s | https://youtu.be/aMGfqMyZz5s |
| ingested | 2026-02-13 | 91m | O'Keefe Media Group | Inside the CIA and the Cost of Speaking Out | OtonZWE2JWA | https://youtu.be/OtonZWE2JWA |
| ingested | 2026-02-09 | 64m | Epic Real Estate | Ex-CIA Officer: Americans Have No Idea What's Actually Happening | P-WgZKfDTvw | https://youtu.be/P-WgZKfDTvw |
| ingested | 2026-01-13 | 125m | CovertAction Magazine | In Confidence: A Private Conversation with John Kiriakou | 5VuKrdCf-ds | https://youtu.be/5VuKrdCf-ds |
| ingested | 2026-01-01 | 40m | Fair Observer | Does the CIA Control American Presidents and Media? | M0dum00g0fs | https://youtu.be/M0dum00g0fs |
| ingested | 2025-09-19 | 56m | Harrison Berger | John Kiriakou Part III: 9/11, Israeli Spying, CIA Media Manipulation | BFhhPsbO9GU | https://youtu.be/BFhhPsbO9GU |
| ingested | 2025-07-25 | 88m | Gold Shields | CIA Whistleblower Exposes Black Sites, Epstein Secrets & Bin Laden | eyQimLepfL0 | https://youtu.be/eyQimLepfL0 |
| ingested | 2025-07-14 | 147m | Danny Jones | CIA Spy Breaks Silence on Epstein Cover-Up, Mossad & Trump | HStqERfZbPw | https://youtu.be/HStqERfZbPw |
| ingested | 2025-04-11 | 65m | The Clear Signal | Ex-CIA Spy on Torture, Trump & How Australia's Intelligence Ran | cQNedgdX0oM | https://youtu.be/cQNedgdX0oM |
| ingested | 2025-04-07 | 58m | IRONCLAD | Ex-CIA Agent: We Enabled Cartels, Lied About Torture & Rigged Elections | HfT8jrjLNiE | https://youtu.be/HfT8jrjLNiE |

## More candidates (earlier sweep, not yet intaken)

| Status | Date | Len | Show | Title | videoId | URL |
|---|---|---|---|---|---|---|
| ingested | 2025-10-12 | 91m | Danny Haiphong | Ex-CIA Spy Exposes Mossad's Secrets (w/ Joe Lauria) | 44AXcdINY24 | https://youtu.be/44AXcdINY24 |
| ingested | 2026-01-26 | 129m | Tin Foil Hat w/ Sam Tripoli | Spy vs Spy — Ep 959 | uLD02oLoGHU | https://youtu.be/uLD02oLoGHU |
| ingested | 2026-01-09 | 53m | Unfiltered with S.A.M. | Venezuela, Cuba, Greenland, Iran — Empire in Plain Sight | gbvuY-IqXvQ | https://youtu.be/gbvuY-IqXvQ |
| ingested | 2025-01-26 | 47m | Neutrality Studies | CIA Whistleblower Exposes the US Security State | wpTnt74kYus | https://youtu.be/wpTnt74kYus |
| ingested | 2024-11-16 | 192m | The Team House | The Only CIA Officer Sent to Jail for the Torture Program (Ep 309) | OrAf8gK44S4 | https://youtu.be/OrAf8gK44S4 |
| ingested | 2022-05-06 | 42m | Scott Horton (Ep. 5709) | John Kiriakou on the War on Alternative Media | IW1kBeG4444 | https://youtu.be/IW1kBeG4444 |
| ingested | 2021-09-15 | 40m | Garland Nixon | Newly released Saudi 9/11 documents | 6eLIxrbiMjc | https://youtu.be/6eLIxrbiMjc |
| ingested | 2017-06-06 | 94m | Disruption Network Lab | Doing Time Like A Spy — On Prison Survival & the CIA | 4-5yxHqYJ-k | https://youtu.be/4-5yxHqYJ-k |

## Candidates — 1-on-1 interviews, uncharted (found 2026-07-07, batch 2)

Vetted: real Kiriakou-as-subject, single-host interview, ≥40 min, not clip/re-upload/his-own-show,
videoId not in corpus or registry. Dates not all confirmed (flat-search); backfill before intake.

| Status | Date | Len | Show | Title | videoId | URL |
|---|---|---|---|---|---|---|
| ingested | 2026-05-27 | 60m | The Information Rights Pro | Whistleblower Diaries #1 — John Kiriakou with Greg Barns S | 4AACmzGfitg | https://youtu.be/4AACmzGfitg |
| ingested | 2026-04-13 | 42m | Crossing Faiths | Crossing Faiths Podcast Episode 162: John Kiriakou | zNDWqIJjkGI | https://youtu.be/zNDWqIJjkGI |
| ingested | 2026-02-18 | 96m | Lost Aux Media | Ep.083 — Who in the F*ck is John Kiriakou? — Lost Aux Medi | Ao9gaUkuBxc | https://youtu.be/Ao9gaUkuBxc |
| ingested | 2026-01-05 | 79m | Lee Camp - Unredacted Toni | LIVE: Former CIA Officer John Kiriakou on Venezuela, 9/11  | ZO0GpNURRRk | https://youtu.be/ZO0GpNURRRk |
| ingested | 2025-12-09 | 55m | The Unfettered Speech Podc | EP:22 [GUEST] John Kiriakou : Inside The CIA: Torture, Cov | kopDfgn8Bas | https://youtu.be/kopDfgn8Bas |
| ingested | 2025-09-25 | 102m | Joe Mkhitaryan | "All My Stories Have a Bad Ending for the Good Guy" - John | s41zksLari8 | https://youtu.be/s41zksLari8 |
| ingested | 2025-06-25 | 47m | Harrison Berger | CIA Whistleblower John Kiriakou Confronts the Deep State,  | 8-8pQrcfQ8U | https://youtu.be/8-8pQrcfQ8U |
| ingested | 2025-06-15 | 42m | Joe DiRosa | Brainpower TV #1 Interview w/ CIA Whistleblower John Kiria | aNgY2ljZKC4 | https://youtu.be/aNgY2ljZKC4 |
| ingested | 2025-06-06 | 48m | Red Apple Podcast Network | Episode 76-John Kiriakou | Ij3nQk7T0sY | https://youtu.be/Ij3nQk7T0sY |
| ingested | 2025-04-12 | 106m | The Clear Signal with Stev | Ex-CIA Whistleblower Reveals: How Australia Gets Classifie | Qxbw5cWqL9c | https://youtu.be/Qxbw5cWqL9c |
| ingested | 2025-03-29 | 43m | Lionel Nation | Inside the CIA: Whistleblower John Kiriakou Reveals What Y | BUS9gA518Sg | https://youtu.be/BUS9gA518Sg |
| ingested | 2024-09-03 | 73m | George Peyrouton | John Kiriakou — CIA Whistleblower — Episode 83 — The Georg | Lfbf9gSVdJM | https://youtu.be/Lfbf9gSVdJM |
| ingested | 2024-07-30 | 50m | Spartan Leadership Podcast | CIA EXPOSED: Whistleblower Reveals Torture Secrets with Jo | Jnq27oguBTQ | https://youtu.be/Jnq27oguBTQ |
| ingested | 2023-05-13 | 68m | Indie News Network (INN) | John Kiriakou: The Politics of CIA Whistleblowers — The Po | C6nIky-RSTw | https://youtu.be/C6nIky-RSTw |
| ingested | 2023-04-12 | 184m | Danny Jones | CIA Spy Breaks Silence On Elon Musk's Twitter Files — John | RmPpOps1yeI | https://youtu.be/RmPpOps1yeI |
| ingested | 2023-01-11 | 60m | Real Progressives | Spelunking the Deep State with John Kiriakou | is0yrElNSFA | https://youtu.be/is0yrElNSFA |
| ingested | 2022-07-09 | 71m | Scott Horton | Ep. 5740 - John Kiriakou on Vault 7, Robert Grenier and Bi | 4GQPPZRxxQY | https://youtu.be/4GQPPZRxxQY |
| ingested | 2021-03-10 | 48m | Heidi Weber (No Stop Heidi | Ex-CIA John Kiriakou-waterlogged whistleblower S3Ep4 | J82Ry2N8jbM | https://youtu.be/J82Ry2N8jbM |
| ingested | 2020-12-23 | 51m | CODEPINK | A conversation with John Kiriakou | CQ6AC0Kn8lE | https://youtu.be/CQ6AC0Kn8lE |
| ingested | 2020-11-23 | 54m | Revolutionary Change | John Kiriakou — Whistleblower Protections, Torture, and Ju | b7Uq2aYrR5w | https://youtu.be/b7Uq2aYrR5w |
| ingested | 2019-12-30 | 44m | Scott Horton | Ep. 5150 – John Kiriakou on the Brutal CIA Torture of Abu  | fmUsmRQO_cQ | https://youtu.be/fmUsmRQO_cQ |
| ingested | 2019-10-02 | 60m | Nicole Sandler | 10-2-19 Nicole Sandler Show - The Public Trust with John K | q3IkX9p5LqA | https://youtu.be/q3IkX9p5LqA |
| ingested | 2019-06-14 | 46m | Slow News Day | SND#40 Gulf Mines & Incubator Babies w/John Kiriakou | SM85ukUYXm8 | https://youtu.be/SM85ukUYXm8 |
| ingested | 2019-04-18 | 42m | Scott Horton | John Kiriakou on Chelsea Manning’s ‘Don’t Tread on Me’ Mom | ahlUdUoayOc | https://youtu.be/ahlUdUoayOc |
| ingested | 2018-06-19 | 64m | Real Progress In Action | Rocco Million - Today I sit down with American hero CIA wh | KkgYYXrQl10 | https://youtu.be/KkgYYXrQl10 |
| ingested | 2017-06-29 | 57m | Rob Kall Bottom-up Show | Whistleblower John Kiriakou On the Rob Kall Bottom up Show | P2t-xAWvn0g | https://youtu.be/P2t-xAWvn0g |
| ingested | 2017-05-31 | 68m | The Ripple Effect Podcast | The Ripple Effect Podcast #129 (John Kiriakou — CIA-Whistl | QkuwsEURRGw | https://youtu.be/QkuwsEURRGw |
| verify | ? | ? | ? | (unavailable) | mT-mwgE-P6Y | https://youtu.be/mT-mwgE-P6Y |
| verify | ? | ? | ? | (unavailable) | NHMw9uvL9JE | https://youtu.be/NHMw9uvL9JE |
| verify | 2026-01-15 | 53m | Opperman Report | John Kiriakou - The Reluctant Spy: My Secret Life  | 1GigwWMC8cQ | https://youtu.be/1GigwWMC8cQ |

## Candidates — batch 3 (found 2026-07-07)

Kiriakou-as-subject interviews/talks, ≥40 min, not in corpus or ledger; Assange-vigil
panels, audiobook samples, reactions and dupes excluded. **Dates not yet backfilled.**

| Status | Date | Len | Show | Title | videoId | URL |
|---|---|---|---|---|---|---|
| ingested | 2026-05-26 | 50m | Covert Operations Insight | Former CIA Spy Reveals the Truth That Shook Washington - | d2cKxy1ZQf0 | https://youtu.be/d2cKxy1ZQf0 |
| ingested | 2026-05-20 | 52m | The DeVory Darkins Intervi | John Kiriakou: These people should be in prison #002 | WbOFlL1ingk | https://youtu.be/WbOFlL1ingk |
| ingested | 2026-05-20 | 51m | Covert Operations Insight | Former Spy Reveals the Brutal Survival Rules Inside the  | Rf8xsrnBBs0 | https://youtu.be/Rf8xsrnBBs0 |
| ingested | 2026-03-10 | 57m | Former Congressman Matt Ga | The Anchormen Show EP 105 - Spy Games w/ Pearson Sharp & | _B70u_5YXNk | https://youtu.be/_B70u_5YXNk |
| ingested | 2026-02-27 | 57m | The Ripple Effect Podcast | Ex-CIA John Kiriakou — War On Whistleblowers: The High C | OtvG1MS2pAQ | https://youtu.be/OtvG1MS2pAQ |
| ingested | 2026-02-19 | 57m | Mario Nawfal | "The Ears Did Not Match" - Ex-CIA's John Kiriakou On Eps | eE30KoA2VU8 | https://youtu.be/eE30KoA2VU8 |
| ingested | 2025-10-16 | 53m | Truth Hurts Show | The CIA's Secrets on Iran, War, and What Happens Next —  | appqKuSX6SQ | https://youtu.be/appqKuSX6SQ |
| ingested | 2025-09-06 | 63m | Connecting the Dots Podcas | John Kiriakou on Venezuela Strikes, Regime Change Talk,  | _RqBVs-P6WY | https://youtu.be/_RqBVs-P6WY |
| ingested | 2025-07-17 | 64m | Barracks Media inc | “CIA Whistleblower John Kiriakou: Torture, Truth & Traum | 9Oi61wpeGnA | https://youtu.be/9Oi61wpeGnA |
| ingested | 2025-06-05 | 83m | Austin and Matt | #12 The Mafia, CIA & Hidden American Underworld with Joh | 5KJEWIk_Kxw | https://youtu.be/5KJEWIk_Kxw |
| ingested | 2025-05-05 | 91m | Austin and Matt | #05 CIA Whistleblower John Kiriakou: The Truth They Trie | 7-ZUFCx1omA | https://youtu.be/7-ZUFCx1omA |
| ingested | 2025-03-26 | 61m | Podcast UFO Live Shows | 03-25-25 CIA Whistleblower John Kiriakou — UAP Governmen | 0T8VEkYn_2A | https://youtu.be/0T8VEkYn_2A |
| ingested | 2025-02-19 | 89m | Katie Halper | CIA Whistleblower John Kiriakou On JFK Files, Nathan Tan | 7iJ_1LNBBZA | https://youtu.be/7iJ_1LNBBZA |
| ingested | 2024-12-21 | 165m | Not A Grayman | INSIDE THE CIA: What They Aren't Telling You — John Kiri | xYx6oycyKww | https://youtu.be/xYx6oycyKww |
| ingested | 2024-12-10 | 67m | Pete A Turner | John Kiriakou – Enhanced Techniques & Whistleblowing | xkkqwGDDbE0 | https://youtu.be/xkkqwGDDbE0 |
| ingested | 2024-10-30 | 47m | Bulwarg | John Kiriakou - CIA, Blackmail, Whistleblowers - Bulwarg | oNxH86ZdeSE | https://youtu.be/oNxH86ZdeSE |
| ingested | 2024-10-06 | 77m | JoeCat ® | More Than Rich: S3E33 - John Kiriakou Exposes The Cost o | 3NCqVjUN4zw | https://youtu.be/3NCqVjUN4zw |
| ingested | 2024-09-04 | 43m | failure | Country Fried Podcast Season 2 / John Kiriakou talks abo | nYZT3a9tlSk | https://youtu.be/nYZT3a9tlSk |
| ingested | 2024-02-04 | 48m | Fortress On A Hill (Henri) | John Kiriakou – Ep 133 | xHbpdELKO3o | https://youtu.be/xHbpdELKO3o |
| ingested | 2023-12-07 | 51m | TruthOverComfort | Ex CIA Officer John Kiriakou Talks Torture, Terrorism, U | P9miDzcUT9U | https://youtu.be/P9miDzcUT9U |
| ingested | 2023-08-09 | 45m | London Real | Ukraine War, Mass Surveillance, Trump, UFOs & CIA Tortur | QlIUEY1QiRA | https://youtu.be/QlIUEY1QiRA |
| ingested | 2023-06-26 | 46m | Kevin Gosztola | Unauthorized Disclosure: What Will Happen To Assange Nex | TCBF2avfMHU | https://youtu.be/TCBF2avfMHU |
| ingested | 2023-04-14 | 45m | Kevin Gosztola | Former CIA Officer John Kiriakou On Espionage Act Prosec | vmY7r4ggP6o | https://youtu.be/vmY7r4ggP6o |
| ingested | 2023-01-13 | 78m | The Open Forum Podcast | 018 — State Sanctioned Torture, Whistleblowing & 9/11 —  | QiWoQ0Y86DE | https://youtu.be/QiWoQ0Y86DE |
| ingested | 2023-01-04 | 61m | Scott Horton | Ep. 5832 - John Kiriakou on the CIA, FBI, JFK and 9/11 - | v1tRqZKo4q0 | https://youtu.be/v1tRqZKo4q0 |
| ingested | 2022-08-13 | 49m | Kevin Gosztola | CIA Whistleblower John Kiriakou: Trump, Espionage Act &  | UvD5cUtGSZM | https://youtu.be/UvD5cUtGSZM |
| ingested | 2022-07-23 | 57m | The Darkened Hour | An Interview With John Kiriakou (CIA Whistleblower On Th | ULlvbl5ym8E | https://youtu.be/ULlvbl5ym8E |
| ingested | 2022-05-19 | 63m | ScheerPost | Scheer Intelligence: John Kiriakou Interview 9/10/21 | R4cW71vcS_o | https://youtu.be/R4cW71vcS_o |
| ingested | 2022-04-09 | 95m | Will Turbitt | EXCLUSIVE! MUST SEE LIVE INTERVIEW WITH LEGENDARY CIA WH | CwegyuWY758 | https://youtu.be/CwegyuWY758 |
| ingested | 2021-10-17 | 50m | LA Progressive | Former CIA Agent John Kiriakou Turned Whistleblower Talk | NiAb3oiaZ58 | https://youtu.be/NiAb3oiaZ58 |
| ingested | 2021-08-01 | 43m | Scott Horton | Ep. 5567 – Kevin Gosztola and John Kiriakou on the Sente | OV3V3wFJUwY | https://youtu.be/OV3V3wFJUwY |
| ingested | 2020-11-30 | 58m | Crossing Faiths | Guest John Kiriakou Greek American Author, Journalist, a | d82Vejn9a30 | https://youtu.be/d82Vejn9a30 |
| ingested | 2020-05-25 | 57m | Scott Horton | Ep. 5264 – John Kiriakou on What Could Have Prevented 9/ | XhjFW9ey15U | https://youtu.be/XhjFW9ey15U |
| ingested | 2020-05-15 | 44m | Choo Radio Network | Interview with CIA Whistleblower John Kiriakou | Z6GK5GOzv1Q | https://youtu.be/Z6GK5GOzv1Q |
| ingested | 2019-06-19 | 59m | Soundwaves 2000 | Radio Liberty interview, 4-15-10, John Kiriakou (former  | cPfqguIwcqU | https://youtu.be/cPfqguIwcqU |
| ingested | 2019-03-14 | 47m | Salem Access TV - Public | Foresight with Ken Weaver--John Kiriakou, Whistleblower  | YcTHv1zLD7M | https://youtu.be/YcTHv1zLD7M |
| ingested | 2018-04-20 | 147m | Bookia gr | John Kiriakou, «Φυλακισμένος πράκτορας» | 9sAnupyZSks | https://youtu.be/9sAnupyZSks |
| ingested | 2017-11-23 | 47m | Stelios Kouloglou | John Kiriakou with Stelios Kouloglou | OAwSZzldvuE | https://youtu.be/OAwSZzldvuE |
| ingested | 2017-05-26 | 61m | Nicole Sandler | 5-26-17 Nicole Sandler Show - Our Dangerous World with J | GLiupCJPu_I | https://youtu.be/GLiupCJPu_I |
| ingested | 2017-05-23 | 91m | Podcast UFO Live Shows | John Kiriakou, CIA Whistleblower, Doing Time Like a Spy, | twDSUsMh2ws | https://youtu.be/twDSUsMh2ws |
| ingested | 2017-05-17 | 45m | Strand Book Store | John Kiriakou & Brian Ross — Doing Time Like a Spy | 0iSfm1yeJUA | https://youtu.be/0iSfm1yeJUA |
| ingested | 2016-07-11 | 60m | adventures in the free sta | John Kiriakou Addresses the 2016 NHLA Liberty Dinner | _1Un-IY3vlc | https://youtu.be/_1Un-IY3vlc |
| ingested | 2015-11-14 | 75m | Robin Hensel | Tackling Torture at the Top John Kiriakou and Bradley Ol | rFTwPrTyY2Q | https://youtu.be/rFTwPrTyY2Q |
| ingested | 2015-11-12 | 83m | QuakerHouse | John Kiriakou Speaks at Quaker House | v2GbWGoIW6w | https://youtu.be/v2GbWGoIW6w |
| ingested | 2015-07-25 | 74m | Splendour in the Grass | John Kiriakou about what can go wrong with spy agencies  | CXpClkw38CY | https://youtu.be/CXpClkw38CY |
| verify | ? | ? | ? | (unavailable) | wVQjgd1Tqz4 | https://youtu.be/wVQjgd1Tqz4 |
| verify | 2026-06-25 | 77m | The Secret Intelligence Re | John Kiriakou - A Former CIA Officer Reveals the Alarmin | wNWGRrcxa2s | https://youtu.be/wNWGRrcxa2s |  <!-- clickbait-title channel — verify it's a real interview not AI re-narration -->
| verify | ? | ? | ? | (unavailable) | njWyFh3Nafc | https://youtu.be/njWyFh3Nafc |
| verify | 2026-06-03 | 54m | The Secret Intelligence Re | John Kiriakou - Former CIA Officer Reveals the Shocking  | mCg8i8i4qZc | https://youtu.be/mCg8i8i4qZc |  <!-- clickbait-title channel — verify it's a real interview not AI re-narration -->
| verify | 2026-06-24 | 53m | The Secret Intelligence Re | John Kiriakou - A Former CIA Officer Reveals What No One | WQDR8rk6WAM | https://youtu.be/WQDR8rk6WAM |  <!-- clickbait-title channel — verify it's a real interview not AI re-narration -->

## Watch / verify before intake (likely duplicates of ingested Dorey episodes)

| Status | Date | Len | Show | Title | videoId | Notes |
|---|---|---|---|---|---|---|
| skip? | 2025-11-18 | 197m | Julian Dorey | Nuclear War, Vault 7 Tech, Mossad in Iran | F3MFGJFh4Ps | likely = ingested `2025-11-19-julian-dorey-vault-7` |
| skip? | 2026-02-23 | 187m | Julian Dorey | "Epstein LIES!" — Kiriakou Erupts | vmDn8YzxVeQ | verify vs ingested Dorey eps |
| skip? | 2025-02-28 | 163m | Julian Dorey | Unloads on Epstein, Bin Laden, China & Israel | scrGRKVa-Q4 | verify vs ingested Dorey eps |
| skip? | 2025-02-25 | 137m | Julian Dorey | MK Ultra, USAID Mission, Overthrowing Govts | _CFWmuIgQIE | verify vs ingested Dorey eps |

## Shows he hosted

- **John Kiriakou's Dead Drop** — `ingested` (42 eps, Acast feed → whisper).
- **Sputnik dailies** (Political Misfits, Loud & Clear) — **skip, low value**: daily 2h news roundtables he co-hosted; sparse canon, murky attribution, ages badly. Not queued.

---

## Archaeology dig — 2026-08-05

Full detail, including every angle worked and every rejection, is in `ARCHAEOLOGY-LOG.md`.

| Status | Date | Len | Show | Title | videoId | URL |
|---|---|---|---|---|---|---|
| ingested | 2026-05-08 | 75m | Cyprus Diaspora Forum | John Kiriakou Fireside Chat (rec. 8 May, uploaded 23 Jul) | vCB56HbNvOo | https://youtu.be/vCB56HbNvOo |
| audio | 2015-03-31 | 89m | Edmond & Lily Safra Center | American Whistleblower Tour: Essential Voices for Accountability | jcg5aO_H9OU | https://youtu.be/jcg5aO_H9OU |
| skip | 2026-07-30 | 51m | Piers Morgan Uncensored (via Roja Multimedia) | Full Debate — 5-way panel, speaker attribution unsafe | WF8NOMGWI2o | https://youtu.be/WF8NOMGWI2o |
| skip | 2026-08-05 | 70m | World Affairs Podcast | Same Cyprus fireside chat as vCB56HbNvOo | jEamop1gJxw | https://youtu.be/jEamop1gJxw |
| skip | 2026-06-06 | 78m | Jay Dyer | Kiriakou hosts Dyer — his own show, low canon | uxHODlAhiBk | https://youtu.be/uxHODlAhiBk |

> **Warning for the next dig:** `National Security Files`, `Covert Strategies Revealed`,
> `Covert Operations Insight`, `The Insight Network` and `Rated R TV` are all **re-cut farms**.
> They dedupe clean by videoId but are duplicate by content. `NEW-VIDS-2026-07-28.md` §F1 is
> wrong to call National Security Files genuine. Do not spend a run on them.

---

## Noon dig 2026-08-06 — the podcast-feed seam

Found by scanning the **RSS feeds already listed in the ledgers** for Kiriakou episodes.
Previous digs only ever extracted `videoId`s from these files, so every non-YouTube URL in
them had never been checked. 160 feeds scanned, 168 episode hits, 111 at >=40 min.
Many of these interviews have **no YouTube upload at all** — the audio->whisper path is the
only way in. `queued` rows below were run in this dig; `candidate` rows are the head start
for the next one.

| Status | Date | Len | Show | Title | videoId | URL | Notes |
|---|---|---|---|---|---|---|---|
| skip | 2026-03-12 | 75m | what should we call it | John Kiriakou and People who suck | — | https://anchor.fm/s/1bea3808/podcast/play/116822825/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-2-12%2Fb85df2c7-ba6f-aa3d-b064-2e547782d5c2.mp3 | REJECTED 2026-08-07: Kiriakou is NOT in this episode — two hosts discuss him in passing |
| ingested | 2018-07-28 | 62m | Discussions of Truth | Former CIA agent John Kiriakou | — | https://traffic.megaphone.fm/APO8121469842.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2022-12-04 | 62m | RFK Jr Podcast | CIA Whistleblower John Kiriakou | — | https://anchor.fm/s/4ae2c0e4/podcast/play/61664395/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2022-11-4%2Fcf640ad3-6156-36cc-b251-7e45baeb72ef.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2025-09-02 | 72m | Yung Flamingo Club | Yung Flamingo Club: John Kiriakou | — | https://anchor.fm/s/4ed344f8/podcast/play/107722899/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-8-2%2F406759437-44100-2-88aabbdc35232.m4a | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2025-10-16 | 124m | Seymizzle Podcast | Ask Ex-CIA agent and whistleblower John Kiriakou anything | — | https://anchor.fm/s/67e8620c/podcast/play/109738431/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-9-16%2F1a173e13-76bf-e2cd-7faa-c93b9e9fd1df.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2021-03-24 | 66m | The Platform Talk Podcast | From CIA Whistleblower To Convicted Felon to Political Analyst: The Jo | — | https://traffic.megaphone.fm/APO7722652056.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2023-10-13 | 40m | The Sharyl Attkisson Podcast | 200. CIA Whistleblower John Kiriakou on Assange, Weaponized Govt. and  | — | https://traffic.megaphone.fm/APO7631875012.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2026-04-02 | 68m | Kim Iversen | Israel and Al-Qaeda: CIA Whistleblower Exposes the Alliance | 2k0Rz71HCIE | https://youtu.be/2k0Rz71HCIE | Full episode; corpus previously held only a 12m clip of the same 2025-01-24 taping |
| ingested | 2016-04-26 | 50m | Fort Collins Community Action Network | John Kiriakou, CIA Whistle-Blower — Part 2 | AOLKpvbVzh4 | https://youtu.be/AOLKpvbVzh4 | Corpus had part 1 only; found by in-channel search across all 302 corpus channels |
| ingested | 2025-09-03 | 41m | IRONCLAD (Change Agents, Andy Stumpf) | Ex-CIA Officer: Epstein Was an Israeli Asset — And President Bush Covered It Up? | j6O9FnnYdDA | https://youtu.be/j6O9FnnYdDA | Captioned YouTube twin of the Change Agents feed episode — took the fast path, marked the MP3 a dup |
| ingested | 2025-04-18 | 40m | Colonial Outcasts | CIA Whistleblower John Kiriakou on Renditions to El Salvatore and the  | — | https://anchor.fm/s/ef9dcb38/podcast/play/101469685/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-3-18%2F2cbe9767-4317-72e4-140f-56aaf21e6ab2.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2025-04-19 | 75m | The Big Mig Show | Ex-CIA & Founder of Panquake, John Kiriakou /EP531 | — | https://anchor.fm/s/fc419e50/podcast/play/101493938/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-3-19%2F398657556-44100-2-5b38c9edf283b.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2021-09-08 | 73m | Primary Sources | Jailing the Messenger: The CIA's Torture Whistleblower feat. John Kiri | — | https://www.buzzsprout.com/1798604/episodes/9155620-jailing-the-messenger-the-cia-s-torture-whistleblower-feat-john-kiriakou.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2023-01-07 | 60m | Macro N Cheese | Spelunking the Deep State with John Kiriakou | — | https://podcasts.captivate.fm/media/8f2c30ac-a6b9-44a8-a2eb-3a01567373fd/John-Kiriakou-Ep-206-Final.mp3 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2025-04-07 | 61m | Borderland: Narcosis with Vincent 'Rocco' Vargas | CIA Whistleblower Exposes the Agency’s Role in the Drug Trade (with Jo | — | https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/clrtpod.com/m/pscrb.fm/rss/p/mgln.ai/e/1184/traffic.megaphone.fm/IRD1153214884.mp3?updated=1744394185 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2025-09-03 | 43m | Change Agents with Andy Stumpf | Epstein an Israeli Agent & President BUSH Covered It Up? (John Kiriako | — | https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/clrtpod.com/m/pscrb.fm/rss/p/mgln.ai/e/1184/traffic.megaphone.fm/IRD2188020169.mp3?updated=1757229957 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2021-09-25 | 92m | Abe Lincoln's Top Hat | Episode 572: Blowing the Whistle w/ John Kiriakou | — | https://dts.podtrac.com/redirect.mp3/stitcher.simplecastaudio.com/71098f10-ffc0-43b2-82f5-9e12b4d79b7f/episodes/82da2d96-ca8a-43b3-b4be-2f2eff290803/audio/128/default.mp3?aid=rss_feed&awCollectionId=71098f10-ffc0-43b2-82f5-9e12b4d79b7f&awEpisodeId=82da2d96-ca8a-43b3-b4be-2f2eff290803&feed=HFfCVCG8 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| skip | 2025-07-25 | 87m | GOLD SHIELDS |  GOLD SHIELDS EPISODE 128: THE TRUE LIES OF THE CIA – CIA INSIDER JOHN | — | https://www.buzzsprout.com/2109780/episodes/17564200-gold-shields-episode-128-the-true-lies-of-the-cia-cia-insider-john-kiriakou-exposes-all.mp3 | dup of corpus `2025-07-25-gold-shields` |
| skip | 2024-08-20 | 63m | SaltCubeAnalytics | Controversial CIA Whistleblower John Kiriakou Exposed America's Dark S | — | https://www.buzzsprout.com/2385051/episodes/15612130-controversial-cia-whistleblower-john-kiriakou-exposed-america-s-dark-secrets.mp3 | dup of corpus `2024-07-27-saltcube-cia-enemy-of-the-state` (same 63m taping) |
| ingested | 2026-02-05 | 50m | U Cast Studios | John Kiriakou On Venezuela, The Maduro Trial, And More (The Talk Spot) | — | https://traffic.libsyn.com/secure/ucaststudios/John_Kiriakou_On_Venezuela_The_Maduro_Trial_And_More_The_Talk_Spot.mp3?dest-id=966392 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2024-12-19 | 43m | U Cast Studios | John Kiriakou On The CIA, Torture, And More (The Talk Spot) | — | https://traffic.libsyn.com/secure/ucaststudios/TalkSpot_John_Kiriakou.mp3?dest-id=966392 | podcast-feed find (noon dig 2026-08-06); audio->whisper path |
| ingested | 2021-07-28 | 53m | Primary Sources | The Whistleblower Who Takes On Espionage Act Prosecutions feat. Jessel | — | https://www.buzzsprout.com/1798604/episodes/8936178-the-whistleblower-who-takes-on-espionage-act-prosecutions-feat-jesselyn-radack.mp3 | podcast-feed find (noon dig 2026-08-06); needs vetting + whisper |
| ingested | 2025-05-28 | 61m | Change Agents with Andy Stumpf | How the War on Terror Created a New Generation of Enemies (with CIA Wh | — | https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/clrtpod.com/m/pscrb.fm/rss/p/mgln.ai/e/1184/traffic.megaphone.fm/IRD1571683766.mp3?updated=1748473391 | podcast-feed find (noon dig 2026-08-06); needs vetting + whisper |
| candidate | 2020-01-01 | 144m | Potkaars Podcast - Interviews en reportages | New Years Eve Part 1 (English) | — | https://www.buzzsprout.com/1572253/episodes/7198888-new-years-eve-part-1-english.mp3 | podcast-feed find (noon dig 2026-08-06); needs vetting + whisper |
| skip | 2019-05-01 | 41m | Potkaars Podcast - Interviews en reportages | 20190429 John Kiriakou CIA Whistleblower (English) | — | https://www.buzzsprout.com/1572253/episodes/7198990-20190429-john-kiriakou-cia-whistleblower-english.mp3 | dup of corpus `2019-05-01-potkaars-podcast-potkaars-podcast` |
| ingested | 2015-05-21 | 58m | Tell Somebody | CIA Whistleblower John Kiriakou & Peace Activist Brian Terrell | — | https://traffic.libsyn.com/secure/tellsomebody/ts_2015_05_21a.mp3?dest-id=20629 | podcast-feed find (noon dig 2026-08-06); needs vetting + whisper |
| skip | 2026-01-03 | 60m | Politics and Prose Presents | 50 Years of Project Censored: State of the Free Press - Panel with Rya | — | https://anchor.fm/s/10003f420/podcast/play/112675601/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-11-15%2Fea92b572-a842-ca7a-a8d9-7b326207502a.mp3 | multi-speaker panel |
| skip | 2025-04-02 | 61m | UK Column News | UK Column News Podcast 2nd April 2025 | — | https://anchor.fm/s/1044e334c/podcast/play/101975896/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-3-30%2F399333205-48000-2-c08c3f3b0325a3ea.mp3 | news programme, not an interview |
| skip | 2026-03-21 | 46m | Joannes Wyckmans Podcast | Shadow Games: Espionage, Blackmail, and the Epstein Network | — | https://anchor.fm/s/10b1106b4/podcast/play/117258497/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-2-21%2F420474315-44100-2-fda98722a7984.m4a | derivative/AI-summary style feed — not a primary interview |
| skip | 2026-02-24 | 42m | Joannes Wyckmans Podcast | Shadow Governments and the Architecture of Secrets | — | https://anchor.fm/s/10b1106b4/podcast/play/115988042/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-1-24%2F29671df9-9627-8eb6-2237-09580358db51.m4a | derivative/AI-summary style feed — not a primary interview |
| skip | 2026-02-23 | 42m | Joannes Wyckmans Podcast | Global Intelligence, Elite Networks, and Geopolitical Conflict | — | https://anchor.fm/s/10b1106b4/podcast/play/115937941/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-1-23%2F418680810-44100-2-39f15534e6e9c.m4a | derivative/AI-summary style feed — not a primary interview |
| skip | 2025-10-14 | 79m | Real Coffee with Scott Adams | Episode 2988 CWSA 10/14/25 | — | https://traffic.megaphone.fm/APO8795100091.mp3 | Adams own show; Kiriakou only referenced |
| skip | 2025-04-20 | 59m | Real Coffee with Scott Adams | Episode 2815 CWSA 04/20/25 | — | https://traffic.megaphone.fm/APO3119026967.mp3 | Adams own show; Kiriakou only referenced |
| skip | 2025-02-11 | 82m | Real Coffee with Scott Adams | Episode 2747 CWSA 02/11/25 | — | https://traffic.megaphone.fm/APO5841075052.mp3 | Adams own show; Kiriakou only referenced |
| skip | 2026-02-23 | 157m | PBD Podcast |  El Mencho Killing IGNITES Narco War & Newsom's 960 SAT Speech / PBD # | — | https://traffic.megaphone.fm/APO4368775734.mp3 | episode is not a Kiriakou interview |
| skip | 2022-03-31 | 165m | The Antedote | Deep Ukraine Part 6: RT America, Abby Martin, and Russian Media Warfar | — | https://anchor.fm/s/6838aa0/podcast/play/49761222/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2022-2-28%2Ff30bea2c-3221-fdda-5969-6d138c7c71c2.mp3 | about RT/Russian media, not a Kiriakou interview |
| skip | 2021-10-29 | 89m | The Antedote | Antedote News Roundup (Part 1) | — | https://anchor.fm/s/6838aa0/podcast/play/42520976/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2021-9-29%2F02dc8435-208c-2530-8046-5f2d7c72ab29.mp3 | about RT/Russian media, not a Kiriakou interview |
| skip | 2020-02-24 | 58m | The Antedote | Summary of Recent Phone Calls (Part 1) | — | https://anchor.fm/s/6838aa0/podcast/play/10599414/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2020-1-24%2F52172511-44100-1-ff585ae560bc8.mp3 | about RT/Russian media, not a Kiriakou interview |
| skip | 2024-09-11 | 55m | CODEPINK Radio | Episode 265: Authoritarianism at Home and Abroad | — | https://anchor.fm/s/ef064ec/podcast/play/91578159/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-8-11%2F386175170-44100-2-05fdcb088bc4.m4a | multi-topic magazine show |
| skip | 2023-05-17 | 55m | CODEPINK Radio | Episode 196: The Whistleblowers: An Episode Honoring Daniel Ellsberg: | — | https://anchor.fm/s/ef064ec/podcast/play/70560861/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2023-4-17%2F0cf2b5ba-41f5-0038-6ea1-73c5de765adf.mp3 | multi-topic magazine show |
| skip | 2017-05-17 | 98m | Disruption Network Lab | Panel: Prisoners of Dissent. Locked Up For Exposing Crimes | — | https://traffic.libsyn.com/secure/disruptionlab/10653.mp3?dest-id=1971815 | panel; already in corpus (2017-06-06) |
| skip | 2026-04-24 | 162m | Danny Jones Podcast | #390 - "There's an ESCAPE Hatch" New Details Inside Epstein's Prison C | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD2480955029.mp3?updated=1777048685 | guest is Julian Dorey, not Kiriakou |
| skip | 2026-05-13 | 64m | Julian Dorey Daily | Ex-CIA Spy on the Truth Christian Zionists REFUSE to Face / John Kiria | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD9552261656.mp3?updated=1777396768 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2026-05-12 | 64m | Julian Dorey Daily | Lutnick REFUSES OATH and BLOWS UP his DEPOSITION!! / Julian Dorey | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD1107685300.mp3?updated=1778544503 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2026-04-10 | 64m | Julian Dorey Daily | CIA Spy Addresses the Steve Bannon/Epstein Spy Theory / John Kiriakou | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD4975293299.mp3?updated=1775589438 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2026-02-24 | 64m | Julian Dorey Daily | CIA Spy Believes Tucker Carlson's "Supra Gov." Theory is SPOT ON / Joh | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD8793270222.mp3?updated=1771879497 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2026-01-30 | 64m | Julian Dorey Daily | "I'm Leaving Before 2030..." - CIA Spy WARNS About America's Future /  | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD5280742484.mp3?updated=1769002922 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2026-01-01 | 63m | Julian Dorey Daily | The CIA Threatened Georgia’s Prime Minister — Here’s Why / Elizabeth L | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD2079251638.mp3?updated=1764011495 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2025-12-24 | 64m | Julian Dorey Daily | The Terrifying Backdoor Palantir Built for the CIA / Ken Klippenstein | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD9884234717.mp3?updated=1765222971 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2025-12-08 | 64m | Julian Dorey Daily | CIA Spy: "My Insider Sources Claimed Iran Bombing STOPPED WW3" / John  | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD6167320724.mp3?updated=1763251214 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2025-07-31 | 66m | Julian Dorey Daily | The Shadowy Epstein Insider Who’s LYING / Alessi Allaman | — | https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/QCD9990183241.mp3?updated=1752427197 | daily re-cut of the main Dorey podcast — re-cut farm |
| skip | 2026-04-23 | 84m | The Adversity Advantage with Doug Bopst | Former CIA Spy: How To Spot Liars & Manipulators Before They Control Y | — | https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chrt.fm/track/47G541/pscrb.fm/rss/p/mgln.ai/e/433/claritaspod.com/measure/traffic.megaphone.fm/BTGDG6085913832.mp3?updated=1777410534 | already in corpus (2026-04-23) |
| skip | 2025-04-25 | 62m | Piers Morgan Uncensored | Was Jeffrey Epstein a Spy for Israel? Mossad Debate With Former CIA Ag | — | https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/pscrb.fm/rss/p/prfx.byspotify.com/e/mgln.ai/e/441/claritaspod.com/measure/traffic.megaphone.fm/RSV3687019177.mp3?updated=1745598520 | multi-guest panel — speaker attribution unsafe |
| skip | 2025-03-20 | 41m | Piers Morgan Uncensored | "There's A Bombshell In Here!" JFK Files Released  | — | https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/pscrb.fm/rss/p/prfx.byspotify.com/e/mgln.ai/e/441/claritaspod.com/measure/traffic.megaphone.fm/RSV7390789412.mp3?updated=1742827632 | multi-guest panel — speaker attribution unsafe |
| skip | 2026-06-11 | 167m | The Jason Jones Show | 3 Hours with John Kiriakou: CIA Whistleblower on JFK, Conspiracies & P | — | https://cdn.simplecast.com/media/audio/transcoded/bafd24cc-b670-4696-9f85-01852b12c1d9/61c144ad-3853-4eb6-9d21-f3aa7833466f/episodes/audio/group/77f623d1-d37c-4bad-a463-1220e8dca1f2/group-item/0a040597-1840-4af9-8fae-ea3f2d46cf17/128_default_tc.mp3?aid=rss_feed&feed=Twi3PAW5 | already in corpus (2026-06-15) |
| skip | 2026-02-25 | 51m | con-sara-cy theories | Episode 110: John Kiriakou on the DOAC Podcast, Part 1 | — | https://www.buzzsprout.com/2289560/episodes/18563407-episode-110-john-kiriakou-on-the-doac-podcast-part-1.mp3 | commentary about his DOAC appearance, not him |

## Noon dig 2026-08-07 — the widened-feed seam, Rumble, and C-SPAN

Yesterday's dig scanned only the **160 feeds already named in the ledgers**. This one searched the
iTunes podcast directory **by topic instead of by his name** (32 topical terms → 1,000+ feeds,
of which the ledgers had never named most), then scanned each feed for Kiriakou episodes. That
surfaced eight shows the corpus has never held. Rumble and C-SPAN were also opened for the first
time. Full detail in `ARCHAEOLOGY-LOG.md`.

| Status | Date | Len | Show | Title | videoId | URL | Notes |
|---|---|---|---|---|---|---|---|
| skip | 2026-05-05 | 84m | Dream Out Loud (= Morgan Nelson) | 363. CIA Whistleblower: "I Told The World The CIA Was Torturing  | — | https://anchor.fm/s/f213593c/podcast/play/119445212/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-4-4%2F423413952-44100-2-c8c3e138b5e86.mp3 | DUP of corpus `2026-05-05-morgan-nelson-cia-whistleblower` — the feed carries the SHOW name, the corpus the HOST name |
| skip | 2026-03-25 | 66m | Straight Talk with Mark Bouris | CIA Whistleblower Speaks Out "This is how the US & Iran war will | — | https://p.podderapp.com/2544644999/traffic.omny.fm/d/clips/2fb3740d-3436-44af-8cc0-a91900716aa5/1c4759f0-81fc-4f35-85d1-b305004fc1e8/0d0ad9fd-f3cf-4ff3-85b7-b418001db501/audio.mp3?utm_source=Podcast&amp;in_playlist=573776d2-4dbd-4f2f-a825-b305004fc1ef | DUP of corpus `2026-03-25-mark-bouris-cia-whistleblower-us-israel-invaded-iran` |
| ingested | 2025-05-19 | 60m | The Free Thought Project Podcast | Guest: John Kiriakou — CIA Whistleblower on America’s Secret Dru | — | https://pdcn.co/e/mcdn.podbean.com/mf/web/55p2mvhe88ir2uet/JOHN_KIRIAKOU_PODCAST8utcv-z33sid-Optimized.mp3 | widened-feed seam (noon dig 2026-08-07); audio->whisper path |
| ingested | 2025-03-24 | 52m | Sarah Westall - Business Game Changers | CIA Coups, Coverups and Torture: CIA Whistleblower & Former Inte | — | https://rss.art19.com/episodes/ef6bef9b-1e81-4cd8-9cd8-04e03139c2d6.mp3?rss_browser=BAhJIgtDaHJvbWUGOgZFVA%3D%3D--d05363d83ce333c74f32188013892b2863ad051c | widened-feed seam (noon dig 2026-08-07); audio->whisper path |
| ingested | 2026-02-05 | 59m | Eric A. Cinotti: Unplugged | CIA Whistleblower John Kiriakou Exposes Post-9/11 Torture, Gover | — | https://dts.podtrac.com/redirect.mp3/api.spreaker.com/download/episode/69822370/285569_eric_cinotti_unplugged_2025_10_06_exposing_the_whistleblowing_against_the_cia.mp3 | widened-feed seam (noon dig 2026-08-07); audio->whisper path |
| ingested | 2025-02-28 | 59m | Lehto Files - Investigating UAPs | CIA Whistleblower John Kiriakou on UAP Crash Retrieval & Governm | — | https://dts.podtrac.com/redirect.mp3/api.spreaker.com/download/episode/64634535/john_kiriakou_cia_whistleblower_on_uaps_and_government_transparency.mp3 | widened-feed seam (noon dig 2026-08-07); audio->whisper path |
| skip | 2023-03-06 | 50m | Whistleblowing Now and Then | USA: Secrecy Superpower | — | https://www.buzzsprout.com/1101926/episodes/12352903-usa-secrecy-superpower.mp3 | widened-feed seam (noon dig 2026-08-07); audio->whisper path |
| candidate | 2023-07-06 | 191m | AM WakeUp (Rumble-native) | False Flags & Real Terrorists w/ John Kiriakou! | v2vv7g6 | https://rumble.com/v2ygmna-false-flags-and-real-terrorists-w-john-kiriakou.html | Rumble sweep (noon dig 2026-08-07); deferred — 3h livestream, vet canon density first |
| candidate | 2026-02-11 | 111m | Health Ranger Report (Rumble-native) | War with Iran — Interview with John Kiriakou (+ glyphosate/EPA news) | v73fo1y | https://rumble.com/v75mc26-war-with-iran-interview-with-john-kiriakou-and-news-on-glyphosate-the-epa-a.html | Rumble sweep; multi-topic magazine show — interview is a segment, vet before ingest |
| candidate | 2020-01-01 | 144m | Potkaars Podcast | New Years Eve Part 1 (English) | — | https://www.buzzsprout.com/1572253/episodes/7198888-new-years-eve-part-1-english.mp3 | carried over from 2026-08-06; deferred today on length/format risk |
| skip | 2026-03-30 | 90m | The System Unfiltered | @DeepFocuswithJohnKiriakou — Ex CIA Whistleblower interviews… | — | — | Kiriakou is the INTERVIEWER (Deep Focus cross-post) — his own show, low canon density |
| skip | 2024-08-20 | 63m | SaltCubeAnalytics | Controversial CIA Whistleblower John Kiriakou Exposed America's Dark Secrets | — | https://www.buzzsprout.com/2385051/episodes/15612130-controversial-cia-whistleblower-john-kiriakou-exposed-america-s-dark-secrets.mp3 | same 63m conversation as corpus `2024-07-27-saltcube-cia-enemy-of-the-state` (HSZLMPdMGFQ) — feed release lags the YouTube upload |
| skip | 2025-07-25 | 87m | GOLD SHIELDS | Episode 128: The True Lies of the CIA | — | — | dup of corpus `2025-07-25-gold-shields` |
| skip | 2019-05-01 | 41m | Potkaars | 20190429 John Kiriakou CIA Whistleblower (English) | — | — | dup of corpus `2019-05-01-potkaars-podcast-potkaars-podcast` |
| skip | 2021-07-28 | 53m | Primary Sources | The Whistleblower Who Takes On Espionage Act Prosecutions feat. Jesselyn Radack | — | — | Radack is the guest, not Kiriakou |
| ingested | 2010-04-23 | 61m | C-SPAN Book TV — After Words | After Words with John Kiriakou, interviewed by Frederick Hitz (former CIA Inspector General) | program.223989 | https://www.c-span.org/program/book-tv/after-words-with-john-kiriakou/223989 | C-SPAN sweep (noon dig 2026-08-07). Site page is JS-rendered; audio via `https://iphone.c-spanvideo.org/m3u8/program.<id>.m3u8` — segments need a browser User-Agent or they 403 |
| ingested | 2025-07-24 | 83m | DeepStateBear (Rumble-native) | Everybody Hates Israel — interview with expert John Kiriakou | v6ufcpg | https://rumble.com/v6wm8ya-everybody-hates-israel-interview-with-expert-john-kiriakou.html | Rumble sweep (noon dig 2026-08-07); yt-dlp handles Rumble directly |
| skip | 2008-10-30 | ? | C-SPAN public affairs event | Law and Morality of Interrogation — a PRE-whistleblowing appearance | 196588 | https://www.c-span.org/program/public-affairs-event/law-and-morality-of-interrogation/196588 | Panel — doctrine reject on attribution, but recorded here because a 2008 appearance is the earliest known and may matter if the panel rule is ever revisited |

## Noon dig 2026-08-09 — Mixcloud as an index, and Robert Scheer's own feed

Two new methods. **Mixcloud** was opened for the first time and turns out to hold the radio
archive layer — but its audio is protected against downloading, so it is a **discovery index
only**: use it to learn which shows had him, then pull the audio from that show's real podcast
feed. **Chasing one interviewer through his own feed** was the productive angle: *Scheer
Intelligence* carries twelve Kiriakou episodes and the corpus held four. Full detail, including
three silent failures in the shared transcription tool, is in `ARCHAEOLOGY-LOG.md`.

| Status | Date | Len | Show | Title | videoId | URL | Notes |
|---|---|---|---|---|---|---|---|
| ingested | 2026-07-28 | 39m | Dissidentklubben | A conversation with John Kiriakou (Stockholm, rec. 4 Jul) | _cVnFagpXow | https://youtu.be/_cVnFagpXow | Found by plain web search — a method no previous dig had used |
| ingested | 2016-01-12 | 60m | The Sharin' Hour (KX93.5 Laguna) | The Sharin' Hour 1/11/16: JOHN KIRIAKOU, ex-C.I.A. | — | https://www.spreaker.com/show/4221519/episodes/feed | Mixcloud discovery → Spreaker feed → whisper. A corpus-empty year; no overlap with anything held |
| ingested | 2015-12-11 | 38m | Scheer Intelligence | John Kiriakou: A Whistleblower on Torture | — | https://feeds.captivate.fm/scheer-intelligence/ | Scheer feed enumeration |
| ingested | 2021-05-21 | 57m | Scheer Intelligence | A former CIA mideast expert's view of the Israeli-Palestinian crisis | — | https://feeds.captivate.fm/scheer-intelligence/ | Scheer feed enumeration |
| ingested | 2021-10-29 | 44m | Scheer Intelligence | Daniel Hale and America's unending persecution of whistleblowers | — | https://feeds.captivate.fm/scheer-intelligence/ | Kiriakou is the guest despite the title naming Hale |
| ingested | 2022-04-01 | 44m | Scheer Intelligence | Biden denies CIA torture victims their day in court | — | https://feeds.captivate.fm/scheer-intelligence/ | Scheer feed enumeration |
| candidate | 2018-04-06 | 33m | Scheer Intelligence | John Kiriakou: The Wrong Direction for the CIA | — | https://feeds.captivate.fm/scheer-intelligence/ | **Head start.** rss-pick title match fails (curly apostrophe / prefix); resolve by feed index or GUID |
| candidate | 2022-05-20 | 52m | Scheer Intelligence | It's scoundrel time in the good ol' USA | — | https://feeds.captivate.fm/scheer-intelligence/ | **Head start.** Same title-matching failure |
| ingested | 2024-03-29 | 45m | Scheer Intelligence | It's a secret only when Uncle Sam says it is | — | https://feeds.captivate.fm/scheer-intelligence/ | Scheer feed enumeration. Whisper renders his name "John Curriaco"/"Kriakou" — a name grep alone would have wrongly rejected it |
| candidate | 2017-12-12 | 79m | Homebrewed Culture Cast | When Doing Good Breaks the Law with John Kiriakou | — | http://traffic.libsyn.com/hbculturecast/CC20John20KiriakouFINAL.mp3 | Resolved and genuine; **ffmpeg fails to decode this MP3 (exit 183)** — needs a re-encode |
| candidate | 2023-07-06 | 191m | AM WakeUp (Rumble-native) | False Flags & Real Terrorists w/ John Kiriakou | v2vv7g6 | https://rumble.com/v2ygmna-false-flags-and-real-terrorists-w-john-kiriakou.html | Carried over from 08-07; never reached |
| candidate | 2026-02-11 | 111m | Health Ranger Report (Rumble-native) | War with Iran — Interview with John Kiriakou | v73fo1y | https://rumble.com/v75mc26-war-with-iran-interview-with-john-kiriakou-and-news-on-glyphosate-the-epa-a.html | Carried over from 08-07; never reached |
| blocked | 2016-01-29 | 55m | Loud & Clear (Radio Sputnik) | John Kiriakou: "The CIA Tortured For Torture's Sake" | — | https://www.mixcloud.com/loudclear/john-kiriakou-the-cia-tortured-for-tortures-sake/ | **Guest era — he did not co-host until Aug 2017, so doctrine-clean.** No surviving feed; Mixcloud audio is download-protected. Needs another route |
| blocked | 2016-08-29 | 51m | Loud & Clear (Radio Sputnik) | John Kiriakou: CIA wants Zubaydah silenced for life | — | https://www.mixcloud.com/loudclear/john-kiriakou-cia-wants-zubaydah-silenced-for-life/ | As above |
| blocked | 2017-01-19 | 53m | Loud & Clear (Radio Sputnik) | US Intel Veterans' Letter to Obama: Where's the Proof? | — | https://www.mixcloud.com/loudclear/john-kiriakou-us-intel-veterans-letter-to-obama-wheres-the-proof/ | As above |
| blocked | 2016-02-13 | ~57m | Alternative Radio | The War on Whistleblowers (product KIRJ001) | — | https://www.alternativeradio.org/products/kirj001/ | Paywalled; not obtainable. Recorded so nobody hunts it twice |
| parked | 2020-01-01 | 144m | Potkaars Podcast | New Years Eve Part 1 (English) | — | https://feeds.buzzsprout.com/1572253.rss | Third dig running. `whisper2vtt.py` hung four hours at 49:12; retry with the windowed transcriber |
| skip | 2016-08-02 | 60m | The Sharin' Hour | The Sharin' Hour 7/30/16: JOHN KIRIAKOU, CIA | — | — | **89.6% overlap with 2016-01-12 — the same taping re-aired.** Identical stated duration; only dupe-check caught it |
| skip | 2026-02-10 | 64m | Epic Real Estate Investing | EX-CIA OFFICER: Americans Have No Idea What's ACTUALLY Happening | — | — | 73% overlap with corpus `2026-02-09-epic-real-estate`; feed release lags the YouTube upload by a day |
| skip | 2021-04-15 | 56m | Peter B. Collins Show | Whistleblowers Kiriakou and Hickman Finger Serial Informant Matthew Cole | — | https://peterbcollins.com/feed/podcast/ | Two-guest (Kiriakou + Joseph Hickman), no speaker labels — attribution unsafe under doctrine rule 4 |
| skip | 2023-12-15 | 40m | Scheer Intelligence | The Never Ending War on Terror | — | — | **Kiriakou is NOT in it** — guests are Kate Stonehill and Mohammed Rabbani; his name appears once, spoken by the host |
| skip | 2026-07-28 | 65m | End Time America | HOW BIG IS THE DECEPTION? | — | https://anchor.fm/s/13787af4/podcast/rss | Prophecy-commentary show; presence unverified, dropped after the Scheer false positive |
| skip | 2026-07-26 | 75m | Cyprus Diaspora Uncovered | John Kiriakou Uncovered | — | — | Same taping as corpus `2026-07-23-cyprus-diaspora-forum-john-kiriakou-fireside-chat` |

> **Dead platforms, do not re-run:** fyyd.de (German-centric, holds only re-cuts and shows
> already held), the Spreaker search API (returns nothing), the Audioboom API (ignores the
> query), BitChute (re-upload farms — WatchmanFT, TheWarAgainstYou). **Still unresolved:**
> Vimeo (yt-dlp 401s on its API; needs a browser) and C-SPAN's person page (403s).

---

## Noon dig 2026-08-12 — SoundCloud and the Apple *episode* index

Two indexes no previous dig had opened, both productive. **SoundCloud** holds a radio/podcast
layer that Mixcloud only partly overlaps, and unlike Mixcloud its audio *is* fetchable with
yt-dlp. **Apple's `entity=podcastEpisode` search** is a different endpoint from the feed sweeps
of 08-06/08-09 — it indexes episodes directly, so it surfaces shows whose *feed* metadata never
mentions Kiriakou. Full method notes in `ARCHAEOLOGY-LOG.md`.

**A dedupe warning that cost this dig an hour:** three items the 08-09 head start listed as open
(the two Scheer episodes, both Rumble rows) were already ingested on 08-10/08-11 by the corpus
mining and squeeze routines, which do not update this ledger. Dedupe against
`src/content/sources/` by **show + date**, never against these ledgers.

| Status | Date | Len | Show | Title | videoId | URL | Notes |
|---|---|---|---|---|---|---|---|
| ingested | 2019-10-15 | 41m | David Gornoski (A Neighbor's Choice) | John Kiriakou on the CIA's Ukraine "Whistleblower" | — | https://traffic.libsyn.com/secure/davidgornoski/Neighborschoice_10-15-19_JKiriakou.mp3 | Apple episode index. Feed release date is 2020-09-22 but the file name carries the **recording date 10-15-19** — filed under the recording date | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| ingested | 2016-11-07 | 43m | This Is Hell! | We should all be afraid: A whistleblower's report on the price of secrecy and surveillance | — | https://soundcloud.com/this-is-hell/925johnkiriakou | SoundCloud. A corpus-empty month; the segment cut, not the full broadcast | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| ingested | 2015-08-17 | 52m | A Public Affair (WORT 89.9 FM) | A Public Affair — Monday, August 17th | — | https://soundcloud.com/wort-fm/a-public-affair-monday-august-17th | SoundCloud. No description on the item; matched the query on tags — **guest presence to be confirmed from the transcript** | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| ingested | 2024-01-19 | 59m | The Independent Riot | How Espionage Works (Former CIA Spy John Kiriakou Interview) | — | https://www.buzzsprout.com/1599790/episodes/14340827-how-espionage-works-former-cia-spy-john-kiriakou-interview.mp3 | Apple episode index | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| ingested | 2017-08-11 | 60m | Kate Dalley Radio | John Kiriakou Ex CIA Spy Tells All | — | https://soundcloud.com/katedalleyradio/0811john-kiriakou-ex-cia-spy-tells-all | SoundCloud | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| queued | 2010-01-30 | 60m | Citizen Radio | Torture still doesn't work, and neither does David Cameron or Air America (ep. #79) | — | https://archive.org/details/citizenradio_2010-01-30 | Internet Archive. **A 2010 source — the corpus held exactly one.** *Reluctant Spy* launch month |
| ingested | 2017-04-30 | 64m | Sound Health Options | Doing Time Like a Spy; How The CIA Taught Me To Survive and Thrive | — | https://podcasts.captivate.fm/media/c7673f03-c38b-4755-95ae-8044a6a9eb88/show-9984275-2017-04-30-17-08-27.mp3 | Apple episode index | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| ingested | 2023-02-06 | 88m | In Limine Podcast | In Limine — John Kiriakou | — | https://api.substack.com/feed/podcast/101244999/c6968c45cb152bde19c666b9be4b2816.mp3 | Apple episode index. Item title is just the show name — **confirm from the transcript** | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| ingested | 2019-10-31 | 92m | Useful Idiots | CIA Whistleblower John Kiriakou on Impeachment, "Assets," and the Deep State | — | https://audio3.redcircle.com/episodes/d3a714fb-7e24-4c94-b868-b2a391199c9f/stream.mp3 | Apple episode index. Corpus held Useful Idiots only from 2023 on | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| ingested | 2021-09-25 | 93m | Abe Lincoln's Top Hat | Episode 572: Blowing the Whistle w/ John Kiriakou | — | https://archive.org/details/alth-episode-572-blowing-the-whistle-w_-john-kiriakou | Internet Archive. Three hosts, **one guest** — multi-host is not the multi-guest panel bar | — **verified held in `src/content/sources/` (git index), 2026-08-14 dig**
| skip | 2025-04-07 | 61m | Borderland: Narcosis (Vincent) | CIA Whistleblower Exposes the Agency's Role in the Drug Trade | — | Apple episode index | Show absent from the corpus entirely. Not reached today | — **2026-08-14: dup — IRONCLAD twin feed, held at 2025-04-07**
| skip | 2025-05-28 | 61m | Change Agents with Andy Stumpf | How the War on Terror Created a New Generation of Enemies | — | Apple episode index | Show absent from the corpus. Enclosure URL was truncated in the API response — re-resolve | — **2026-08-14: dup — IRONCLAD twin feed, held at 2025-05-28**
| candidate | 2025-05-21 | 91m | Austin and Matt | #04 CIA Whistleblower John Kiriakou: The Truth They Tried to Bury | — | https://mcdn.podbean.com/mf/web/i5ba99ur8vygwmz3/JOHN_KIRIAKO9csrb.mp4 | Corpus holds #05, #11, #12 — **#04 is the gap** |
| skip | 2025-03-26 | 61m | Podcast UFO | 656B. Former CIA, John Kiriakou | — | https://dts.podtrac.com/redirect.mp3/api.spreaker.com/download/episode/65120149/656b_john_kiriakou.mp3 | Corpus holds only the 2017 Podcast UFO Live appearance | — **2026-08-14: held as *Podcast UFO Live Shows* 2025-03-26**
| skip | 2026-02-13 | 91m | My Price Is My Life (James O'Keefe) | John Kiriakou: Inside the CIA and the Cost of Speaking Out | — | Apple episode index | Show absent from the corpus | — **2026-08-14: dup — O'Keefe Media Group 2026-02-13**
| skip | 2026-02-18 | 65m | History Told Forward | John Kiriakou: Whistleblower Inside the CIA's Torture Program | — | Apple episode index | Show absent from the corpus | — **2026-08-14: dup — Barracks Media 2026-02-18**
| skip | 2026-06-16 | 61m | Joannes Wyckmans Podcast | John Kiriakou: CIA Secrets, Soft Power, and the Poppy Trade | — | Apple episode index | Show absent from the corpus | — **2026-08-14: ingested 2026-08-13**
| candidate | 2026-07-26 | 51m | When You Know You Know | What The Govt. Can Do To You — John Kiriakou, Dave Marcus | — | Apple episode index | Two named guests — vet the panel bar before ingesting |
| skip | 2019-05-02 | 48m | Reality Asserts Itself (Paul Jay) | I Believed America Could Do No Wrong, Pt. 1 | — | — | Same taping as corpus `2023-04-24` RAI — the corpus files it under the **re-upload** date, so a date grep misses it |
| skip | 2015-02-09 | 44m | Democracy Now! | Exclusive: Freed CIA Whistleblower "I Would Do It All Again" | — | — | Same broadcast as corpus `2015-02-09-democracy-now-torture-report` |
| skip | 2015-02-11 | 60m | Citizen Radio | Hatred of Kanye… CIA whistleblower freed | — | — | Explicitly a **replay** of the 2013-01-23 interview already held |
| skip | 2016-11-05 | 60m | This Is Hell! | Episode 925: Feds Watching (Full Broadcast) | — | — | The full broadcast wrapping the 2016-11-07 segment above — same conversation |
| skip | 2021-12-17 | 79m | American Exception | Episode 2: The 9/9/2001 Massoud Assassination | — | — | **Four-way roundtable** (Peter Dale Scott, Pepe Escobar, Kiriakou, Aaron Good) — attribution unsafe under doctrine rule 4 |
| skip | 2015-11-12 | 67m | Pardon The Dissent | w/ Joey Vincent 11/12/15 | — | — | **Kiriakou is not a guest** — the host plays a clip of him. Matched the query on the show notes |
| skip | 2017-06-27 | 237m | (audiobook) | The Convenient Terrorist | — | — | Audiobook, excluded by the playbook |
| skip | 2026-02-23 | 49m | TAC Right Now | John Kiriakou on CIA Propaganda, War with Iran | — | — | Same taping as corpus `2026-02-19-the-american-conservative` |
| skip | 2017-10-10 | 21m / 22m | Challenging Opinions | CO 049 / CO 050 | — | — | Both under the length bar |
| skip | 2016-10-04 | 18m | (KPFA-style magazine) | Sharon Ellison / Jennifer McCoy / John Kiriakou | — | — | Kiriakou segment is 18 min of a three-segment show |
| skip | 2014-11-05 | 58m | Stranger Talk | Stranger Talk 10 24 14 | — | — | **False positive** — two hosts discussing job hunting; no Kiriakou |
| blocked | 2010-05-16 | 60m | C-SPAN2 Book TV *After Words* | After Words: John Kiriakou | — | https://archive.org/details/CSPAN2_20100517_010000_Book_TV_After_Words | The taping is already held as corpus `2010-04-23-c-span-book-tv-after-words`; the Archive copy is `access-restricted` (caption `.srt` downloads as 0 bytes) |
| blocked | 2013-05-12 | 61m | C-SPAN *Q&A* | Q & A, May 12 2013 | — | https://archive.org/details/CSPAN_20130513_030000_Q__A | Access-restricted on the Archive, and c-span.org is CloudFront-403 to **both** plain fetch and a real browser. Presence unconfirmed |
| blocked | 2017-12-12 | 79m | Homebrewed Culture Cast | When Doing Good Breaks the Law with John Kiriakou | — | — | **The 08-09 diagnosis was wrong** — it is not an ffmpeg failure. `traffic.libsyn.com/hbculturecast/CC20John20KiriakouFINAL.mp3` returns a **404 HTML page**; the `%20`s were stripped from the real filename. No surviving feed found |

> **Dead ends confirmed this dig — do not re-run:** Mixcloud audio is *still* download-protected
> (yt-dlp resolves the metadata, then 404s on the stream), so Loud & Clear ×3 stay blocked;
> alternate spellings (`kiriako`/`kyriakou`/`kiriakos`) on the Archive return only Greek
> musicians and DJs; `radio4all` holds 5 items, none new; **the Scott Horton Show is exhausted**
> — his site lists 15 Kiriakou interviews and the corpus already holds all of them.

---
## Noon dig 2026-08-13 — every candidate was already in the corpus

**Net new: zero.** Six sources were found, vetted as genuine solo interviews, and five of them
were fetched and transcribed before the dedupe caught them. All six were **already committed**
to `src/content/sources/` — five of them *earlier the same day* by the corpus-mining and
source-squeeze routines (`2441336f`, `1b74a975`).

They were invisible to this dig because **the EOS_DIGITAL volume had dropped the files from
disk while leaving them intact in git.** An exclusion index built by walking
`src/content/sources/*.md` on disk therefore missed them, and `ingest-audio-url.sh`'s `-e`
guard — which also tests the disk — let every one of them straight through.

| Was treated as new | Actually held as | How it hid |
|---|---|---|
| Peter B. Collins Show 2017-05-19 | same slug, committed `2441336f` | dropped from disk |
| Whistleblower of the Week 2026-05-05 | same slug, committed `2441336f` | dropped from disk |
| Green Socialist Notes 2021-05-13 | same slug, committed `2441336f` | dropped from disk |
| Joannes Wyckmans 2026-06-16 | same slug, committed `1b74a975` | dropped from disk |
| One Tough Podcast (Bo Dietl) ep. 76, 2019-12-23 | **also** `2025-06-06-red-apple-podcast-network` | dropped from disk **and** double-filed under Dietl's *network* name at the re-upload date |
| Jay's Analysis 2026-04-30 | `2026-04-29-jay-dyer` | feed date one day off the upload date |

> **The rule that follows — build the exclusion set from `git ls-tree -r HEAD`, never from a
> disk walk and never from `ls`.** On this volume the two disagree: at the start of this dig the
> disk held 881 sources and git held 886. The five-file gap *was* the entire day's candidate list.
> The 08-12 dig learned the same lesson at a cost of three transcriptions and wrote it down as
> "never `ls` alone on this volume"; it recurred today because the index was still built by
> globbing the directory. Diff on **show + date against the git tree**, then shingle-check.

> **Second rule — `dupe-check.mjs` needs a much lower threshold across transcript types.** Bo
> Dietl scored only **70.8%** against the copy already held, because that copy came from YouTube
> auto-captions and this one from whisper; the same conversation transcribed two different ways
> does not reach the ~80–90% that previous digs treated as the dup line. **Treat anything above
> ~65% as a dup until proven otherwise**, and read the first paragraph of the match before
> deciding.

**Reachable but genuinely absent — the real head start for the next dig:**

| Status | Date | Len | Show | Title | URL | Notes |
|---|---|---|---|---|---|---|
| blocked | 2017-06-13 | ~60m | Free Man Beyond the Wall (Pete Quinones) | Episode 388 — Kiriakou on the American Left | — | **Genuine 2017 gap, verified absent from git.** Wayback recovered the exact enclosure `traffic.libsyn.com/secure/freemanbeyondthewall/Episode_388_Full_and_Complete.mp3`, but the libsyn account now 404s and the YouTube copy `pb_3WQ36O-I` was pulled for a ToS violation. Needs a third host |
| blocked | 2020-05-28 | ? | The American Conservative — *Empire Has No Clothes* ep. 4 | Podcast: John Kiriakou | — | **Genuine 2020 gap** (2020 holds only 19 sources). Page 403s live; the Wayback snapshot yields libsyn embed id **14593364**, but that embed now 500s and the show has no findable feed |

> **Dead ends confirmed 2026-08-13 — do not re-run:** KBOO carries Kiriakou twice, but they are
> **30-min and 60-min *Alternative Radio* slots with no fetchable audio** on the page; Internet
> Archive `mediatype:audio` returns only *American Exception* roundtables and Kiriakou's own RT
> show *The Whistleblowers*; transcript-mining for "I was on X" over-matches third-party chatter
> and yielded **nothing**; WhoWhatWhy holds 4 Kiriakou episodes but **all are 14–28 min**.
>
> **The dominant failure mode is now "named in the show notes but not in the room" — nine
> instances in one dig:** Project Censored 2015-07-12 (Radack is the guest), Danny Jones #390
> (Julian Dorey is the guest), Matthew Cox 2026-04-28 (an FBI agent discussing him), Unwashed
> and Unruly, The Freedom Talking Show, SaltCubeAnalytics 2026-03-19 (Sibel Edmonds), and three
> Joannes Wyckmans episodes that matched on the show-level blurb. **Apple's
> `entity=podcastEpisode` matches descriptions, so always read the episode description before
> queueing** — only 1 of 4 Wyckmans hits actually had him on.

## Found by the 2026-08-14 noon dig (Apple episode-index sweep, corpus-diffed against `git ls-tree`)

All rows below were verified **absent** from `src/content/sources/` using the git index, not a
disk glob. Shows marked "show absent" have no Kiriakou source in the corpus under any date.

| Status | Date | Len | Show | Title | videoId | URL | Notes |
|---|---|---|---|---|---|---|---|
| ingested | 2024-12-12 | 105m | Jackman Radio | Episode 188: Former CIA Officer John Kiriakou | 4njeXUnWFqc | https://youtu.be/4njeXUnWFqc | **Show was absent from the corpus.** YouTube captions; dupe-check clean |
| ingested | 2025-07-21 | 63m | Capital and Coast | JAILED for Exposing CIA Secrets | 7Q5cbp6C4CU | https://youtu.be/7Q5cbp6C4CU | **Show absent.** YouTube captions; dupe-check clean |
| queued | 2021-04-19 | 96m | Jackman Radio | Episode 78 \| John Kiriakou | — | https://mcdn.podbean.com/mf/web/gxwqu2/416219v7j3.mp3 | Enclosure verified 200. No YouTube copy found |
| queued | 2016-08-02 | 60m | The Sharin' Hour | 7/30/16: JOHN KIRIAKOU, CIA | — | https://api.spreaker.com/download/episode/22412819/shm8136552401.mp3 | Corpus holds only the 2016-01-12 episode. **2016 is a thin year (11 sources)** |
| queued | 2022-08-17 | 60m | CovertAction Bulletin | Everything you need to know about the Espionage Act & Trump | — | https://www.buzzsprout.com/1903718/episodes/11151858-everything-you-need-to-know-about-the-espionage-act-trump-with-john-kiriakou.mp3 | Corpus holds 2021-12-11 and 2022-05-04 only |
| queued | 2023-04-18 | 53m | CovertAction Bulletin | What do the Pentagon leaks really reveal? | — | https://www.buzzsprout.com/1903718/episodes/12678885-what-do-the-pentagon-leaks-really-reveal-with-john-kiriakou.mp3 | Same feed, different gap |
| queued | 2024-12-12 | 68m | Break It Down Show | John Kiriakou — Enhanced Techniques & Whistleblowing | — | https://dts.podtrac.com/redirect.mp3/traffic.libsyn.com/secure/breakitdownshow/John_Kiriakou.mp3?dest-id=262625 | **Third distinct Pete A. Turner episode** — corpus holds the two YouTube ones (2025-03-22, 2025-12-17), not this |
| queued | 2023-09-19 | 60m | Eyewitness History | CIA Officer Discusses His Career And Whistleblowing | — | https://traffic.omny.fm/d/clips/5e27a451-e6e6-4c51-aa03-a7370003783c/67981960-b1f7-49a3-a22f-b13f011c5bd0/a82fdd6e-7989-49e3-9122-b13f012c2e31/audio.mp3 | **Show absent** |
| queued | 2026-01-06 | 65m | Moment of Clarity | Former CIA Officer John Kiriakou on Venezuela, 9/11 & More! | — | https://pdcn.co/e/serve.castfire.com/audio/7897259/7897259_2026-01-06-141659.128.mp3?rssID=4727 | **Show absent** |
| queued | 2026-05-27 | 60m | The Mechanic | S1E9 Kiriakou, John Kiriakou | — | https://sphinx.acast.com/p/open/s/69c72424e05c00aacfb5fadc/e/6a14e79e83dd9b6e116cd1d3/media.mp3 | **Show absent** |
| candidate | 2015-03-01 | 61m | Unauthorized Disclosure | Guest: John Kiriakou | — | https://anchor.fm/s/4b8b7144/podcast/play/26325872/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2021-1-7%2F152751866-44100-2-793d875094871371.mp3 | **The long-standing head start.** Full anchor.fm→CloudFront URL now resolved — worth one more attempt |
| candidate | 2015-04-07 | 71m | Jackman Radio | Episode 6 \| March 25, 2015 | — | https://mcdn.podbean.com/mf/web/9hvz26/Episode6_March252015.m4a | Title does not name him; description match only — **vet before queueing** |
| candidate | 2024-08-20 | 63m | SaltCubeAnalytics | Controversial CIA Whistleblower John Kiriakou Exposed America's Dark Secrets | — | https://www.buzzsprout.com/2385051/episodes/15612130-controversial-cia-whistleblower-john-kiriakou-exposed-america-s-dark-secrets.mp3 | Corpus holds only 2024-07-27 from this show. A 2026 SaltCube episode was rejected on 08-13 as being about Sibel Edmonds — **vet** |
| candidate | 2025-08-24 | 79m | USA & Co | 85 – Gäst: John Kiriakou | — | https://sphinx.acast.com/p/open/s/663887294e48ad0012648ea5/e/68aa4db1352b565deb2b05a8/media.mp3 | Swedish show; **confirm the audio is English** before spending a transcription |
| candidate | 2026-02-14 | 126m | The Truth with John Gordon | Are Savannah Guthrie Headlines an Epstein Files Distraction? | — | https://sphinx.acast.com/p/open/s/6895f778f9482328d0054dc9/e/6990839c7301331f1fc8aa41/media.mp3 | Magazine show — he is likely a segment. **Vet canon density first** |
| candidate | 2025-06-10 | 88m | The Hostile Zone | The Fenton Files | — | Apple episode index | Description match only — vet |
| candidate | 2018-05-14 | 59m | People's Republic | "Bloody Gina" slated to head CIA | — | Apple episode index | Description match only — vet |
| skip | 2025-05-21 | 91m | Austin and Matt | #04 CIA Whistleblower John Kiriakou | — | https://mcdn.podbean.com/mf/web/i5ba99ur8vygwmz3/JOHN_KIRIAKO9csrb.mp4 | **Genuinely absent, but the podbean enclosure 404s.** Needs a different host |
| skip | 2025-05-03 | 41m | Crossing Faiths | 162: John Kiriakou | zNDWqIJjkGI | https://youtu.be/zNDWqIJjkGI | Held as `2026-04-13-crossing-faiths` — **filed under the YouTube re-upload date** |
| skip | 2019-05-02 | 194m | Reality Asserts Itself (Paul Jay) | I Believed America Could Do No Wrong, Pt. 1–4 | — | api.spreaker.com | The 4-part podcast cut of the taping the corpus already holds as **six** YouTube segments at 2023-04-24/25. Confirmed again 2026-08-14 — **do not re-queue** |
