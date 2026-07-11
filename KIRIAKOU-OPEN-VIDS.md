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
| verify | 2026-06? | ? | Useful Idiots (Halper & Maté) | CIA Whistleblower John Kiriakou: "They DESTROYED Epstein Files" | wVQjgd1Tqz4 | https://youtu.be/wVQjgd1Tqz4 |  <!-- identified 2026-07-11 via search; confirm date/length, eps usually ~1h -->
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

## Candidates — batch 4 (found 2026-07-11)

Discovered by web-search sweep only — **YouTube, all podcast RSS/MP3 hosts, Podcast Index and
huggingface.co were network-blocked in the discovery environment**, so lengths/dates come from
search snippets and podcast listings (Apple/Podscan/Acast/iHeart), not from yt-dlp probes.
Backfill `?` fields with a `yt-dlp --print` probe from an unrestricted machine before intake.
Deduped against corpus videoIds, this registry, SOURCE-DISCOVERY.md, and show+date pairs of all
ingested sources. Ledger note: most SOURCE-DISCOVERY §B stragglers resolved to already-tracked
IDs (Shawn Ryan, Honesty Box, ANI, TAC/Berger companion, Danny Jones #138/#213, Break It Down
Show, Cleared Hot 446, Rogan #2392); the genuinely-new ones are below.

| Status | Date | Len | Show | Title | videoId | URL |
|---|---|---|---|---|---|---|
| candidate | 2026-04-23 | 114m | PBD Podcast | John Kiriakou: Ex-CIA Officer CONFRONTED Over Zionist Accusations (#783) | 1p_B72s6Ix0 | https://youtu.be/1p_B72s6Ix0 |
| candidate | 2026-03-24 | 76m | Sit Down with Michael Franzese | Ex-Mob Boss & Ex-CIA Agent: Iran, Israel, and Epstein Are All Connected | sWucl8ZRiK8 | https://youtu.be/sWucl8ZRiK8 |
| candidate | 2026-05-17 | 43m | The Matan Show | Matan Confronts John Kiriakou For Secretly Working For Israel | drZH5_d9Xg0 | https://youtu.be/drZH5_d9Xg0 |
| candidate | 2026-07-09 | ? | Byrna Bros Podcast (Josh Schirard) | EP.46 — Former CIA Counterterrorism Officer: How to Spot Danger Before It's Too Late | C4Hz6bUAiHI | https://youtu.be/C4Hz6bUAiHI |
| candidate | 2024-07-16 | 159m | Danny Jones Podcast | #249 — CIA Spy Breaks Down Trump Assassination Attempt (w/ Matt Cox) | vcgJXirykZE | https://youtu.be/vcgJXirykZE |
| candidate | 2024-02-19 | ? | Unauthorized Disclosure (Gosztola) | The War On Whistleblowers Under Biden — Plus, Assange's Appeal Hearing | Y1E8EypwzPA | https://youtu.be/Y1E8EypwzPA |
| candidate | 2025-01-24 | ? | The Kim Iversen Show | Former CIA Officer Reveals Why Abolishing The CIA Won't Change Anything | J_GA5Wj3-94 | https://youtu.be/J_GA5Wj3-94 |
| candidate | 2025-03-14 | ? | The Jack Hopkins Show | Inside the Mind of a CIA Whistleblower: Secrets, Sabotage, and the Shocking Truth | zssCchYDO5A | https://youtu.be/zssCchYDO5A |
| candidate | 2025-10-11 | 45m | Dialogue Works | Charlie Kirk's Story Crumbles — Iran Fully Armed in DEFENSE | 4V5GlZ4IodQ | https://youtu.be/4V5GlZ4IodQ |
| candidate | 2025-12-10 | ~50m | Dialogue Works | Charlie Kirk's Story Cracks Wide Open — The Hegseth Controversy Explodes | PA2Sh1zpgfU | https://youtu.be/PA2Sh1zpgfU |
| candidate | 2025-11-20 | ? | American Exception (Aaron Good) | AE219 — CIA Veterans and the Deep State (w/ Barry Eisler — 2 guests) | Z-qsocM6Khc | https://youtu.be/Z-qsocM6Khc |
| candidate | 2013-01-23 | ? | Busboys & Poets / GAP | John Kiriakou @ Busboys & Poets in Washington DC (pre-prison send-off) | hMVoynRZHE0 | https://youtu.be/hMVoynRZHE0 |
| candidate | 2015-02? | ? | VICE News | Ex-CIA Officer John Kiriakou: "The Government Turned Me Into a Dissident" | GaiyVMRGE0M | https://youtu.be/GaiyVMRGE0M |
| candidate | 2017-03-17 | ? | The Zero Hour (RJ Eskow) | Doing Time Like a Spy (w/ John Kiriakou) | 5JUqRcpwkS0 | https://youtu.be/5JUqRcpwkS0 |
| candidate | 2019-12-19 | ? | Beyond the Horizon (Jared Leto) | Lies and Torture of the CIA with John Kiriakou and Jared Leto | Ndpaua_S5lg | https://youtu.be/Ndpaua_S5lg |
| candidate | 2021-01-25 | ? | The Grayzone (Anya Parampil) | Pay for pardons? John Kiriakou on Trump's final flop and Biden's intel picks | G4nd6oOC4iU | https://youtu.be/G4nd6oOC4iU |
| candidate | 2021-01? | ? | Valuetainment | Former CIA agent: Rudy & Trump offered me a pardon for $2 million | DZh9W-TWV1o | https://youtu.be/DZh9W-TWV1o |
| verify | 2026-05-22 | 53m | Zeteo (Mehdi Unfiltered) | Mehdi Hasan CONFRONTS Ex-CIA Agent John Kiriakou on His SUSPICIOUS Past | Rfl9WUe4DnY | https://youtu.be/Rfl9WUe4DnY |  <!-- likely same conversation as ingested ZmaIRlBhsS8 (Zeteo 2026-06-10) — dup-trap check before intake -->
| verify | 2026-06-02 | ? | Mitha Intel | Why The CIA Hid Critical Intel From The FBI | CRCBTd3s_Ow | https://youtu.be/CRCBTd3s_Ow |  <!-- possible split-part of ingested Mitha Intel 2026-06-08 (Dof3OWLXbRU) -->
| verify | 2017-05-25 | ? | (unknown channel) | Doing Time Like A Spy — author interview | tN4O6xu4SQk | https://youtu.be/tN4O6xu4SQk |  <!-- channel/length unverified -->
| verify | 2026-06? | ? | (unknown channel) | John Kiriakou REVEALS the DARK Reality of Intelligence Operations | 7i5osl-M9do | https://youtu.be/7i5osl-M9do |  <!-- clickbait-title pattern — check for AI re-narration before intake -->
| short | 2023-04-25 | ~26m | TRT World — The InnerView | John Kiriakou, the CIA spy who blew the whistle on torture | SBCSSQ0bpBA | https://youtu.be/SBCSSQ0bpBA |
| short | 2026-03-02 | ~30m | Judge Napolitano — Judging Freedom | John Kiriakou: Iranian Retaliation Strikes the CIA | nJ6yjjr1ogA | https://youtu.be/nJ6yjjr1ogA |
| short | 2017-04-18 | ~30m | Ron Paul Liberty Report | 'Doing Time Like A Spy' — With Guest John Kiriakou | TGvgUl7geeM | https://youtu.be/TGvgUl7geeM |
| short | 2025-06-01 | ~30m | Stephen Gardner | Trump & Marco Rubio JUST did the UNTHINKABLE! | 0r560eBIwWE | https://youtu.be/0r560eBIwWE |
| short | 2026-01-22 | <30m? | Insider (Authorized Account) | How CIA Black Ops Actually Work | Pcfwx50zl40 | https://youtu.be/Pcfwx50zl40 |
| short | 2013-01-30 | ? | Democracy Now! | Ex-CIA Agent, Whistleblower John Kiriakou Sentenced to Prison | YeBIRH9VlBQ | https://youtu.be/YeBIRH9VlBQ |  <!-- DN segments run 15-25m; substantive post-sentencing sit-down — maybe worth an exception -->
| short | 2017-05-17 | ? | Democracy Now! | Blowing the Whistle on CIA Torture & Why Trump's Presidency Worries Him | dAmdo2MzzhE | https://youtu.be/dAmdo2MzzhE |
| short | 2018-04-14 | 13m | TEDxFoggyBottom | How I became a CIA whistleblower | fX2YMB6dWJw | https://youtu.be/fX2YMB6dWJw |

**Leads without videoIds (couldn't resolve — YouTube blocked):** Judging Freedom 2026-03-26
"The Truth About Power, Control & the CIA" (~25-30m anyway); Legal Owl 2026-07-01 "Prison Reform
Through the Eyes of John Kiriakou" (YT playlist PLZfuJx1QlDXW2SMWgVvAPUqbggEovbIwZ); U Cast
Studios "The Talk Spot" 2025-03-19 JFK Files (may be audio-only); The Pocket w/ Chris Griffin
2026-07-06; RFK Jr Podcast 2022-12-04 (Spotify/Anchor only, no YT). Ruled out as empty/tracked
in the 2026 window: Shawn Ryan, Lex Fridman, Triggernometry, Modern Wisdom, Flagrant, Breaking
Points, The Duran, MOATS, Meidas, Jimmy Dore, Due Dissidence (panel livestream only).

## Shows he hosted

- **John Kiriakou's Dead Drop** — `ingested` (42 eps, Acast feed → whisper).
- **Sputnik dailies** (Political Misfits, Loud & Clear) — **skip, low value**: daily 2h news roundtables he co-hosted; sparse canon, murky attribution, ages badly. Not queued.
