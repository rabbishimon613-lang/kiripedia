# Unwritten transcript ledger

Transcripts sitting in the corpus that **no article cites** — fetched, cleaned, never mined.
This is the work queue for the perpetual old-content routine.

- **340 unwritten** of 854 transcripts (516 written from)
- **1,461,078 transcript words** unread, ~798,992 of them in the main queue
- Sorted richest-first: most unwritten words per transcript read
- Regenerate with `node tools/build-unwritten-ledger.mjs` — hand-set statuses in the
  `status` column are preserved across regenerations

Status vocabulary: `pending` · `in-progress` · `written` · `rejected (reason)`.
A row disappears on its own once any article cites it, so `written` is belt-and-braces.

---

## Main queue — 243 transcripts, 798,992 words

| # | status | date | show | title | length | words | slug |
|---|---|---|---|---|---|---|---|
| 1 | rejected (host-side reaction stream; Kiriakou never speaks, host replays Hedges clips) | 2026-04-09 | Finding Truth With Harjeet (English) | Finding Truth With Harjeet | 157:00 | 24,894 | `2026-04-09-finding-truth-with-harjeet-finding-truth-with-harjeet` |
| 2 | rejected (host recap + unrelated guest interview; Kiriakou never speaks) | 2018-01-30 | Ian Discussions | Ian | 92:00 | 12,334 | `2018-01-30-ian-discussions-ian-s-discussions-with-john-kiriakou` |
| 3 | rejected (86% five-word-shingle match to 2026-03-19-dmz-america-podcast, same date/show, already cited by 12 articles) | 2026-03-19 | DMZ America Podcast | Scott Has Questions for John Kiriakou / DMZ America Podcast | 63:00 | 10,351 | `2026-03-19-dmz-america-podcast-scott-has-questions-for-john-kiriakou-dmz-ame` |
| 4 | rejected (byte-identical re-upload of the 2018-06-08 Suzi 3D Unity4J stream) | 2018-07-19 | #Unity4J | #Unity4J | 58:00 | 9,764 | `2018-07-19-unity4j-unity4j` |
| 5 | written | 2025-04-16 | The Dr. Phil Podcast | Top Secrets: The CIA Torture Whistleblower John Kiriakou | 1:06:05 | 9,623 | `2025-04-16-the-dr-phil-podcast-top-secrets-the-cia-torture-whistleblower-john-ki` |
| 6 | rejected (duplicate caption run of the same Dr. Phil episode ev1ozulvly8) | 2025-04-16 | The Dr. Phil Podcast | likely = ingested ev1ozulvly8 | 66:00 | 9,622 | `2025-04-16-the-dr-phil-podcast-likely-ingested-ev1ozulvly8` |
| 7 | rejected (third-person narrated documentary essay about Kiriakou; he never speaks, so nothing in it is single-source canon) | 2026-03-21 | Echo Zip | John Kiriakou’s Entire Life in 67 Minutes | 67:00 | 9,575 | `2026-03-21-echo-zip-john-kiriakou-s-entire-life-in-67-minutes` |
| 8 | written | 2026-05-09 | The Never Broken Podcast | THE NEVER BROKEN PODCAST | 65:00 | 9,451 | `2026-05-09-the-never-broken-podcast-the-never-broken-podcast` |
| 9 | written | 2026-01-19 | John Kiriakou | S1E11 Have Human Spies Become Obsolete? | 0:58:44 | 9,443 | `2026-01-19-dead-drop-s1e11-have-human-spies-become-obsolete` |
| 10 | written | 2025-11-19 | DMZ America Podcast | DMZ America Podcast | 67:00 | 9,300 | `2025-11-19-dmz-america-podcast-dmz-america-podcast` |
| 11 | rejected (re-upload of the 2022-04-21 Lee Camp Moment of Clarity episode; 100% identical to the Suzi 3D copy) | 2022-05-05 | Panquake / #TalkLiberation | CIA Whistleblower Joins Lee Camp to talk Panquake | 55:00 | 9,268 | `2022-05-05-panquake-lee-camp-cia-whistleblower-joins-lee-camp-to-talk-panq` |
| 12 | rejected (re-upload of the 2022-04-21 Lee Camp Moment of Clarity episode) | 2022-05-05 | Suzi 3D | CIA Whistleblower John Kiriakou Joins Lee Camp to talk Panqu | 55:00 | 9,268 | `2022-05-05-suzi-3d-cia-whistleblower-john-kiriakou-joins-lee-cam` |
| 13 | written | 2022-04-21 | Lee Camp — Unredacted Tonight | CIA Whistleblower John Kiriakou Joins Lee Camp | 55:00 | 9,264 | `2022-04-21-lee-camp-unredacted-toni-cia-whistleblower-john-kiriakou-joins-lee-cam` |
| 14 | rejected (91% shingle match to the 2026-04-27 Carlos Watson interview, already cited by 14 articles) | 2026-05-17 | Covert Operations Insight | They | 3015 | 9,193 | `2026-05-17-covert-operations-insight-they-re-hiding-israel-in-every-file` |
| 15 | rejected (contained within 2026-01-15-opperman-report-pt1-reluctant-spy-pt2-michael-bowe-probe-2-pa; 92% match to the 2024-09-18 Opperman original) | 2026-01-15 | The Opperman Report | \ | 52:00 | 9,178 | `2026-01-15-opperman-report-reluctant-spy-era-radio-probe` |
| 16 | in-progress | 2015-01-09 | Terrorpedia Video Center | aggregator channel — likely re-upload | 58:00 | 9,123 | `2015-01-09-terrorpedia-video-center-aggregator-channel-likely-re-upload` |
| 17 | rejected (96% shingle match to 2025-03-14-jack-hopkins-inside-the-mind-of-a-cia-whistleblower, same recording one day apart) | 2025-03-15 | Jack Hopkins | Jack Hopkins | 59:00 | 9,072 | `2025-03-15-jack-hopkins-jack-hopkins` |
| 18 | in-progress | 2026-02-27 | One America News Network | One America News Network | 57:00 | 9,046 | `2026-02-27-one-america-news-network-one-america-news-network` |
| 19 | in-progress | 2025-12-17 | Pete A Turner | John Kiriakou – US Espionage and Foreign Policy | 46:00 | 8,772 | `2025-12-17-pete-a-turner-john-kiriakou-us-espionage-and-foreign-policy` |
| 20 | in-progress | 2025-12-09 | Dialogue Works | Charlie Kirk | 50:00 | 8,023 | `2025-12-09-dialogue-works-charlie-kirk-s-story-cracks-hegseth` |
| 21 | in-progress | 2022-05-05 | Panquake / #TalkLiberation | FULL INTERVIEW: Kiriakou & Sean O | 45:00 | 7,877 | `2022-05-05-panquake-lee-camp-full-interview-kiriakou-sean-o-brien-talk-pan` |
| 22 | rejected (99.5% identical to the same-day Panquake upload of the O'Brien interview, and 95% to the already-cited 2022-04-24 Graham Elwood full interview) | 2022-05-05 | Suzi 3D | FULL INTERVIEW: John Kiriakou & Sean O | 45:00 | 7,871 | `2022-05-05-suzi-3d-full-interview-john-kiriakou-sean-o-brien-tal` |
| 23 | rejected (99.2% duplicate of 2025-04-23-dr-phil-podcast-secrets-lies-price-of-truth-part2, already cited by 16 articles) | 2025-05-01 | The Dr. Phil Podcast | likely = ingested aYK16WJ1WsU | 54:00 | 7,851 | `2025-05-01-the-dr-phil-podcast-likely-ingested-ayk16wj1wsu` |
| 24 | in-progress | 2025-11-06 | Elizabeth Lane TV | co-branded personal channel — confirm real interview | 42:00 | 7,575 | `2025-11-06-elizabeth-lane-tv-co-branded-personal-channel-confirm-real-inte` |
| 25 | in-progress | 2026-05-17 | Matan Even | Matan Confronts Kiriakou (Israel) | 43:00 | 7,575 | `2026-05-17-the-matan-show-matan-confronts-kiriakou-israel` |
| 26 | rejected (99.2% duplicate of 2024-02-04-fortress-on-a-hill-henri) | 2024-01-16 | Fortress On A Hill | Fortress On A Hill (Henri) | 48:00 | 7,495 | `2024-01-16-fortress-on-a-hill-henri` |
| 27 | rejected (95.4% re-cut of 2026-05-04-cleared-hot-446-cost-of-truth, already cited by 14 articles) | 2026-05-11 | Covert Operations Insight | channel re-cuts heavily; corpus has 5 of its eps | 39:00 | 7,393 | `2026-05-11-covert-operations-insight-channel-re-cuts-heavily-corpus-has-5-of-its-e` |
| 28 | in-progress | 2025-11-03 | HispaUnidad | HispaUnidad | 46:00 | 7,362 | `2025-11-03-hispaunidad-hispaunidad` |
| 29 | rejected (93.4% re-cut of 2026-05-05-morgan-nelson-cia-whistleblower, already cited by 14 articles) | 2026-05-23 | Covert Operations Insight | Dark Secrets Behind the Torture Program | 42:00 | 7,345 | `2026-05-23-covert-operations-insight-dark-secrets-behind-the-torture-program` |
| 30 | rejected (99.6% duplicate of 2023-08-09-london-real, already cited by 7 articles) | 2023-08-24 | London Real | Ukraine War, Mass Surveillance, Trump, UFOs & CIA Torture Ta | 45:00 | 6,947 | `2023-08-24-london-real-ukraine-war-mass-surveillance-trump-ufos-cia` |
| 31 | rejected (host-only episode; Kiriakou lost power in a storm and never appears) | 2021-09-02 | Garland Nixon | After Afghanistan | 34:00 | 6,705 | `2021-09-02-garland-nixon-after-afghanistan` |
| 32 | in-progress | 2021-10-02 | Garland Nixon | Talk About the US Congress | 37:00 | 6,680 | `2021-10-02-garland-nixon-talk-about-the-us-congress` |
| 33 | pending | 2024-04-18 | Dr. David Oualaalou | Iran-Israel Possible Open War | 39:00 | 6,565 | `2024-04-18-dr-david-oualaalou-iran-israel-possible-open-war` |
| 34 | pending | 2024-02-19 | Kevin Gosztola (The Dissenter) | Kevin Gosztola (Unauthorized Disclosure) | 44:00 | 6,559 | `2024-02-19-kevin-gosztola-unauthorized-disclosure-kevin-gosztola-unauthorized-disclosure` |
| 35 | rejected (86.3% re-cut of the 2023-08-09 London Real interview) | 2026-05-22 | John Kiriakou Podcast | John Kiriakou Podcast | 42:00 | 6,535 | `2026-05-22-john-kiriakou-podcast-john-kiriakou-podcast` |
| 36 | pending | 2025-10-11 | Dialogue Works | Charlie Kirk | 45:00 | 6,431 | `2025-10-11-dialogue-works-charlie-kirk-s-story-crumbles-iran` |
| 37 | pending | 2025-09-06 | Dr. Johann D | Ep.82 — Choosing Truth Over Career | 36:00 | 6,358 | `2025-09-06-ep-82-choosing-truth-over-career` |
| 38 | pending | 2025-11-20 | American Exception | CIA Veterans & Deep State (w/ Barry Eisler) | 34:00 | 6,338 | `2025-11-20-american-exception-cia-veterans-deep-state-w-barry-eisler` |
| 39 | pending | 2019-08-24 | Suzi 3D | Suzi 3D | 40:00 | 5,956 | `2019-08-24-suzi-3d-suzi-3d` |
| 40 | pending | 2022-04-22 | Graham Elwood | Kiriakou & Sean O | 33:00 | 5,900 | `2022-04-22-graham-elwood-kiriakou-sean-o-brien-explain-panquake` |
| 41 | pending | 2025-08-30 | Jamarl Thomas | What | 33:00 | 5,894 | `2025-08-30-jamarl-thomas-what-s-really-happening-in-israel-mossad` |
| 42 | pending | 2025-09-08 | john brown | historic (his seminal ABC waterboarding interview) but a re-upload; co | 34:00 | 5,722 | `2025-09-08-john-brown-full-2007-abc-interview-historic-his-seminal-abc-waterboarding-interv` |
| 43 | pending | 2021-02-01 | The Bitter Truth with Abe Abdelhadi | The Bitter Truth with Abe | 28:00 | 5,694 | `2021-02-01-the-bitter-truth-with-abe-the-bitter-truth-with-abe` |
| 44 | pending | 2023-01-28 | Kevin Gosztola (The Dissenter) | Every Official Everywhere With Classified Documents | 36:00 | 5,660 | `2023-01-28-kevin-gosztola-every-official-everywhere-with-classified-doc` |
| 45 | pending | 2020-01-03 | Kevin Gosztola (The Dissenter) | Kevin Gosztola | 36:00 | 5,614 | `2020-01-03-kevin-gosztola-kevin-gosztola` |
| 46 | pending | 2025-06-03 | Daniel Davis / Deep Dive | Ukraine Drone Strike on Russia | 30:00 | 5,592 | `2025-06-03-daniel-davis-deep-dive-ukraine-drone-strike-on-russia` |
| 47 | pending | 2021-10-12 | Foreign Correspondents: Deeper into Hitchcock | Episode 25: \ | 33:00 | 5,528 | `2021-10-12-foreign-correspondents-de-episode-25-mr-mrs-smith-1941-feat-olympia-kir` |
| 48 | pending | 2024-05-25 | Leonardo Salvaggio | personal channel, Saudi/9-11 — probe | 36:00 | 5,517 | `2024-05-25-leonardo-salvaggio-personal-channel-saudi-9-11-probe` |
| 49 | pending | 2021-08-17 | Crossing Faiths | John Pinna & Kiriakou on Afghanistan | 29:00 | 5,467 | `2021-08-17-crossing-faiths-john-pinna-kiriakou-on-afghanistan` |
| 50 | pending | 2023-01-20 | ScheerPost | ScheerPost | 35:00 | 5,427 | `2023-01-20-scheerpost-scheerpost` |
| 51 | pending | 2025-04-11 | Kim Iversen | Banks Are the New Thought Police – THIS Changes EVERYTHING / | 29:00 | 5,222 | `2025-04-11-kim-iversen-banks-are-the-new-thought-police-this-changes` |
| 52 | pending | 2021-07-13 | Caleb Maupin | Cuba Crisis, Marxism & Automation | 27:00 | 5,138 | `2021-07-13-caleb-maupin-cuba-crisis-marxism-automation` |
| 53 | pending | 2026-05-08 | Covert Operations Insight | Covert Operations Insight | 40:00 | 5,096 | `2026-05-08-covert-operations-insight-covert-operations-insight` |
| 54 | pending | 2019-09-06 | Action 4 Assange | What Julian Assange Is Up Against | 31:00 | 5,069 | `2019-09-06-what-julian-assange-is-up-against` |
| 55 | pending | 2025-12-22 | Piers Morgan Uncensored | Piers Morgan Uncensored | 35:00 | 5,028 | `2025-12-22-piers-morgan-uncensored-piers-morgan-uncensored` |
| 56 | pending | 2021-03-13 | Caleb Maupin | Sanctions & US Efforts in Eurasia | 26:00 | 4,999 | `2021-03-13-caleb-maupin-sanctions-us-efforts-in-eurasia` |
| 57 | pending | 2023-04-25 | Reality Asserts Itself (Paul Jay) | Real News — Reality Asserts Itself | 28:00 | 4,960 | `2023-04-25-real-news-reality-asserts-itself-real-news-reality-asserts-itself` |
| 58 | pending | 2025-12-10 | Mario Nawfal | — | 27:00 | 4,928 | `2025-12-10-mario-nawfal-always-watch-the-naval-movements-ex-cia-offic` |
| 59 | pending | 2019-10-03 | Rob Kall Bottom-up Show | Discusses Ukraine Phone Call | 30:00 | 4,876 | `2019-10-03-rob-kall-bottom-up-show-discusses-ukraine-phone-call` |
| 60 | pending | 2026-05-14 | Liberty Vault | Liberty Vault | 26:00 | 4,697 | `2026-05-14-liberty-vault-liberty-vault` |
| 61 | pending | 2026-05-03 | ANI News | \ | 28:00 | 4,467 | `2026-05-03-pakistan-can-t-win-a-conventional-war-against` |
| 62 | pending | 2020-02-25 | Cafe Weltschmerz | Dutch-language framing — confirm John speaks / not a dub | 29:00 | 4,451 | `2020-02-25-cafe-weltschmerz-dutch-dutch-language-framing-confirm-john-speaks-no` |
| 63 | pending | 2026-05-10 | Liberty Vault | Liberty Vault | 24:00 | 4,432 | `2026-05-10-liberty-vault-liberty-vault` |
| 64 | pending | 2023-01-26 | Enema of the State | Enema of the State | 24:00 | 4,410 | `2023-01-26-enema-of-the-state-enema-of-the-state` |
| 65 | pending | 2023-03-20 | TRT World | The CIA spy who blew the whistle on torture | 27:00 | 4,409 | `2023-03-20-trt-world-the-innerview-the-cia-spy-who-blew-the-whistle-on-torture` |
| 66 | pending | 2025-12-15 | Afshin Rattansi | CIA Whistleblower John Kiriakou REVEALS ALL on US-Israel All | 28:00 | 4,404 | `2025-12-15-afshin-rattansi-s-going-un-cia-whistleblower-john-kiriakou-reveals-all-o` |
| 67 | pending | 2026-02-09 | Judging Freedom (Judge Napolitano) | John Kiriakou  :  How Rogue Is US Intelligence? | 28:00 | 4,392 | `2026-02-09-judge-napolitano-judging-john-kiriakou-how-rogue-is-us-intelligence` |
| 68 | pending | 2023-04-25 | Reality Asserts Itself (Paul Jay) | Why I Was Targeted (RAI pt 9, probe dup) | 26:00 | 4,326 | `2023-04-25-real-news-reality-asserts-itself-why-i-was-targeted-rai-pt-9-probe-dup` |
| 69 | pending | 2026-05-01 | Liberty Vault | Liberty Vault | 25:00 | 4,285 | `2026-05-01-liberty-vault-liberty-vault` |
| 70 | pending | 2025-10-17 | Liberty Vault | Liberty Vault | 23:00 | 4,217 | `2025-10-17-liberty-vault-liberty-vault` |
| 71 | pending | 2019-03-07 | ORCA Media | House at Pooh Corner - Imprisoning the Heroes - John Kiriakou | 28:00 | 4,122 | `2019-03-07-orca-media-house-at-pooh-corner-imprisoning-the-heroes-j` |
| 72 | pending | 2025-09-25 | The Jimmy Dore Show | The Jimmy Dore Show | 22:00 | 4,007 | `2025-09-25-the-jimmy-dore-show-the-jimmy-dore-show` |
| 73 | pending | 2020-02-25 | Potkaars podcast | London report on the Assange extradition hearing | 24:00 | 3,992 | `2020-02-25-london-report-on-the-assange-extradition-hear` |
| 74 | pending | 2025-06-08 | American Exception | Late Imperial Blues – John Kiriakou (DCC85) | 25:00 | 3,984 | `2025-06-08-american-exception-late-imperial-blues-john-kiriakou-dcc85` |
| 75 | pending | 2013-02-07 | Government Accountability Project | Full Video: Kiriakou Portrait Unveiling @ Busboys & Poets | 46:00 | 3,968 | `2013-02-07-government-accountability-full-video-kiriakou-portrait-unveiling-busboy` |
| 76 | pending | 2021-01-24 | The Grayzone | Pay for pardons? Trump | 25:00 | 3,855 | `2021-01-24-the-grayzone-parampil-pay-for-pardons-trump-s-final-flop` |
| 77 | pending | 2023-10-24 | ProjectCensored | \ | 24:00 | 3,733 | `2023-10-24-projectcensored-it-s-not-about-justice` |
| 78 | pending | 2022-03-06 | Washington Report on Middle East Affairs | Israel | 23:00 | 3,674 | `2022-03-06-washington-report-on-mid-east-israel-s-negative-influence-on-us-security` |
| 79 | pending | 2018-10-13 | Edward Rhymes | Rhymes & Reasons (2018-10-09) | 30:00 | 3,659 | `2018-10-13-edward-rhymes-rhymes-reasons-2018-10-09` |
| 80 | pending | 2023-04-24 | Reality Asserts Itself (Paul Jay) | Real News — Reality Asserts Itself | 22:00 | 3,647 | `2023-04-24-real-news-reality-asserts-itself-real-news-reality-asserts-itself` |
| 81 | pending | 2026-01-22 | The Honest Talk | credits \ | 20:00 | 3,566 | `2026-01-22-the-honest-talk-credits-steven-bartlett-likely-mislabeled-re` |
| 82 | pending | 2022-11-07 | Indie News Network (INN) | Indie News Network (INN) | 24:00 | 3,560 | `2022-11-07-indie-news-network-inn-indie-news-network-inn` |
| 83 | pending | 2021-02-05 | acTVism Munich | Bezahlung für Begnadigungen? CIA Whistleblower Kiriakou über | 24:00 | 3,439 | `2021-02-05-actvism-munich-bezahlung-f-r-begnadigungen-cia-whistleblower` |
| 84 | pending | 2026-03-02 | Judging Freedom (Judge Napolitano) | Iranian Retaliation Strikes the CIA | 23:00 | 3,363 | `2026-03-02-judging-freedom-iranian-retaliation-strikes-the-cia` |
| 85 | pending | 2025-10-19 | Liberty Vault | Liberty Vault | 18:00 | 3,346 | `2025-10-19-liberty-vault-liberty-vault` |
| 86 | pending | 2026-04-10 | Revolutionary Change | Revolutionary Change | 18:00 | 3,303 | `2026-04-10-revolutionary-change-revolutionary-change` |
| 87 | pending | 2017-08-26 | Internet Party | Internet Party | 22:00 | 3,286 | `2017-08-26-internet-party-internet-party` |
| 88 | pending | 2023-01-03 | Enema of the State | Kiriakou Reports on the Flawed Business Model | 24:00 | 3,281 | `2023-01-03-enema-of-the-state-kiriakou-reports-on-the-flawed-business-model` |
| 89 | pending | 2020-11-24 | Revolutionary Change | Revolutionary Change | 17:00 | 3,270 | `2020-11-24-revolutionary-change-revolutionary-change` |
| 90 | pending | 2023-03-05 | Enema of the State | Enema of the State | 22:00 | 3,196 | `2023-03-05-enema-of-the-state-enema-of-the-state` |
| 91 | pending | 2018-08-07 | The Jimmy Dore Show | The Jimmy Dore Show | 17:00 | 3,178 | `2018-08-07-the-jimmy-dore-show-the-jimmy-dore-show` |
| 92 | pending | 2026-01-23 | The Honest Talk | The Honest Talk | 17:00 | 3,137 | `2026-01-23-the-honest-talk-the-honest-talk` |
| 93 | pending | 2015-09-23 | MintPress News | Former CIA Agent John Kiriakou Takes Us Inside The Saudi Ter | 19:00 | 3,114 | `2015-09-23-mintpress-news-former-cia-agent-john-kiriakou-takes-us-insid` |
| 94 | pending | 2022-07-03 | Panquake / #TalkLiberation | Public Delivery Meeting #17 feat. Kiriakou, Suzie Dawson | 19:00 | 3,046 | `2022-07-03-panquake-lee-camp-public-delivery-meeting-17-feat-kiriakou-suzi` |
| 95 | pending | 2019-09-01 | Consortium News | CN LIVE! Kiriakou on the Upcoming 9/11 Trial | 16:00 | 2,993 | `2019-09-01-cn-live-kiriakou-on-the-upcoming-9-11-trial` |
| 96 | pending | 2017-03-07 | FlyingOverTr0ut | re-upload \ | 17:00 | 2,976 | `2017-03-07-flyingovertr0ut-re-upload-pt-1` |
| 97 | pending | 2026-03-12 | Nietzsche | John Kiriakou Sentenced to prison | 16:00 | 2,927 | `2026-03-12-nietzsche-john-kiriakou-sentenced-to-prison` |
| 98 | pending | 2023-04-24 | Reality Asserts Itself (Paul Jay) | I Believed America Could Do No Wrong (RAI) | 16:00 | 2,917 | `2023-04-24-real-news-reality-asserts-itself-i-believed-america-could-do-no-wrong-rai` |
| 99 | pending | 2026-01-27 | The Honest Talk | The Honest Talk | 17:00 | 2,874 | `2026-01-27-the-honest-talk-the-honest-talk` |
| 100 | pending | 2015-05-08 | The Real News Network | They Won | 15:00 | 2,869 | `2015-05-08-the-real-news-network-they-won-t-shut-me-up-john-kiriakou-on-rai-10` |
| 101 | pending | 2026-04-02 | The Megyn Kelly Show | The TRUTH About \ | 17:00 | 2,868 | `2026-04-02-megyn-kelly-the-truth-about-mk-ultra-and-why-conspiracy-t` |
| 102 | pending | 2023-04-25 | Reality Asserts Itself (Paul Jay) | Real News — Reality Asserts Itself | 15:00 | 2,866 | `2023-04-25-real-news-reality-asserts-itself-real-news-reality-asserts-itself-FgD6TE` |
| 103 | pending | 2013-01-30 | Democracy Now! | Sentenced to Prison While Torturers Walk Free | 17:00 | 2,856 | `2013-01-30-democracy-now-sentenced-to-prison-while-torturers-walk-free` |
| 104 | pending | 2025-10-25 | ANI News | Ex-CIA Agent Kiriakou: The U.S. Was Waiting for India to Att | 18:00 | 2,760 | `2025-10-25-ani-news-ex-cia-agent-kiriakou-the-u-s-was-waiting-for` |
| 105 | pending | 2026-04-23 | Valuetainment | Valuetainment | 13:00 | 2,709 | `2026-04-23-valuetainment-valuetainment` |
| 106 | pending | 2025-06-01 | Stephen Gardner | title doesn | 16:00 | 2,680 | `2025-06-01-stephen-gardner-title-doesn-t-name-john-confirm-presence` |
| 107 | pending | 2025-10-24 | The Jimmy Dore Show | The Jimmy Dore Show | 13:00 | 2,613 | `2025-10-24-the-jimmy-dore-show-the-jimmy-dore-show` |
| 108 | pending | 2025-12-23 | TCM | TCM TV | 16:00 | 2,593 | `2025-12-23-tcm-tv-tcm-tv` |
| 109 | pending | 2022-04-07 | David Gornoski | Explores Life as a Spy (probe dup) | 14:00 | 2,525 | `2022-04-07-david-gornoski-explores-life-as-a-spy-probe-dup` |
| 110 | pending | 2019-08-08 | David Gornoski | David Gornoski Archives | 14:00 | 2,522 | `2019-08-08-david-gornoski-archives-david-gornoski-archives-W6OZ4C` |
| 111 | pending | 2026-01-25 | Liberty Vault | Liberty Vault | 14:00 | 2,522 | `2026-01-25-liberty-vault-liberty-vault` |
| 112 | pending | 2017-08-08 | Democracy Now! | Jeff Sessions Is Extending Obama | 15:00 | 2,520 | `2017-08-08-democracy-now-jeff-sessions-is-extending-obama-s-war-on-lea` |
| 113 | pending | 2025-12-15 | Jackson Hinkle Official | EX-CIA JOHN KIRIAKOU: VENEZUELA WAR IS ABOUT CHINA | 14:00 | 2,513 | `2025-12-15-jackson-hinkle-official-an-ex-cia-john-kiriakou-venezuela-war-is-about-c` |
| 114 | pending | 2013-01-30 | Democracy Now! | John Brennan a \ | 17:00 | 2,496 | `2013-01-30-democracy-now-john-brennan-a-terrible-choice-to-lead-the-ci` |
| 115 | pending | 2026-01-21 | Liberty Vault | John Kiriakou Is CERTAIN That Epstein Was Working for Israel | 14:00 | 2,492 | `2026-01-21-liberty-vault-john-kiriakou-is-certain-that-epstein-was-wor` |
| 116 | pending | 2025-09-02 | Dalton Fischer Podcast | Dalton Fischer Podcast | 13:00 | 2,400 | `2025-09-02-dalton-fischer-podcast-dalton-fischer-podcast` |
| 117 | pending | 2019-06-29 | The Yellow Brick Road | What Will Happen to Julian Assange | 15:00 | 2,382 | `2019-06-29-what-will-happen-to-julian-assange` |
| 118 | pending | 2019-09-06 | Graham Elwood | Uncovered US Torture Program | 14:00 | 2,367 | `2019-09-06-graham-elwood-uncovered-us-torture-program` |
| 119 | pending | 2015-02-10 | Alittlepart Ofme (CallMeCookie) | Alittlepart Ofme (CallMeCo | 13:00 | 2,290 | `2015-02-10-alittlepart-ofme-callmeco-alittlepart-ofme-callmeco` |
| 120 | pending | 2025-02-22 | Katie Halper | \ | 12:00 | 2,270 | `2025-02-22-katie-halper-rudy-giuliani-tried-to-shake-me-down-for-2m` |
| 121 | pending | 2025-09-03 | Dalton Fischer Podcast | Dalton Fischer Podcast | 14:00 | 2,268 | `2025-09-03-dalton-fischer-podcast-dalton-fischer-podcast` |
| 122 | pending | 2026-02-15 | London Real | London Real | 12:00 | 2,249 | `2026-02-15-london-real-london-real` |
| 123 | pending | 2026-04-06 | Due Dissidence | Kiriakou: Israelis Asked EVERY PRESIDENT To ATTACK Iran! - w | 12:00 | 2,247 | `2026-04-06-due-dissidence-kiriakou-israelis-asked-every-president-to-at` |
| 124 | pending | 2023-01-16 | The Canada Files | Political Misfits — DC Witte, Kiriakou & August | 20:00 | 2,246 | `2023-01-16-the-canada-files-political-misfits-dc-witte-kiriakou-august` |
| 125 | pending | 2025-10-24 | Podcast UFO Live Shows | Podcast UFO Live Shows | 13:00 | 2,211 | `2025-10-24-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 126 | pending | 2025-09-04 | Dalton Fischer Podcast | Dalton Fischer Podcast | 12:00 | 2,199 | `2025-09-04-dalton-fischer-podcast-dalton-fischer-podcast` |
| 127 | pending | 2025-09-12 | Podcast UFO Live Shows | Podcast UFO Live Shows | 12:00 | 2,198 | `2025-09-12-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 128 | pending | 2024-01-07 | Dalton Fischer Podcast | 3 CIA Training Exercises For New Recruits / John Kiriakou | 13:00 | 2,137 | `2024-01-07-dalton-fischer-podcast-cia-training-exercises-for-new-recruits-john` |
| 129 | pending | 2025-12-12 | Dialogue Works | US lacks long-term Middle East strategy | 13:00 | 2,130 | `2025-12-12-dialogue-works-highlights-us-lacks-long-term-middle-east-strategy` |
| 130 | pending | 2026-05-20 | Doug Bopst | Doug Bopst | 12:00 | 2,114 | `2026-05-20-doug-bopst-doug-bopst` |
| 131 | pending | 2025-09-06 | Dalton Fischer Podcast | Dalton Fischer Podcast | 12:00 | 2,104 | `2025-09-06-dalton-fischer-podcast-dalton-fischer-podcast` |
| 132 | pending | 2013-02-15 | Michael H. Rhee | CIA Whistleblower John Kiriakou | 13:00 | 2,095 | `2013-02-15-michael-h-rhee-cia-whistleblower-john-kiriakou-if-i-tortured` |
| 133 | pending | 2017-05-17 | Democracy Now! | Blowing the Whistle / Why Trump Worries Him | 12:00 | 2,093 | `2017-05-17-democracy-now-blowing-the-whistle-why-trump-worries-him` |
| 134 | pending | 2025-10-25 | ANI News | ANI News | 13:00 | 2,087 | `2025-10-25-ani-news-ani-news` |
| 135 | pending | 2022-04-24 | Graham Elwood | Explains Assange Censorship | 12:00 | 2,084 | `2022-04-24-graham-elwood-explains-assange-censorship` |
| 136 | pending | 2025-02-25 | Katie Halper | \ | 11:00 | 2,070 | `2025-02-25-katie-halper-we-re-led-by-a-cabal-of-criminals` |
| 137 | pending | 2026-05-06 | Doug Bopst | Doug Bopst | 11:00 | 2,067 | `2026-05-06-doug-bopst-doug-bopst` |
| 138 | pending | 2025-09-29 | Venture Social | Venture Social | 12:00 | 2,066 | `2025-09-29-venture-social-venture-social` |
| 139 | pending | 2020-11-24 | Revolutionary Change | Revolutionary Change | 12:00 | 2,041 | `2020-11-24-revolutionary-change-revolutionary-change-IozNdH` |
| 140 | pending | 2026-04-03 | Unfiltered With S.A.M. | Kiriakou: Washington Has No Say in This War | 12:00 | 2,036 | `2026-04-03-unfiltered-with-s-a-m-kiriakou-washington-has-no-say-in-this-war` |
| 141 | pending | 2025-09-05 | Dalton Fischer Podcast | Dalton Fischer Podcast | 13:00 | 2,035 | `2025-09-05-dalton-fischer-podcast-dalton-fischer-podcast` |
| 142 | pending | 2019-12-19 | Jared Leto — Beyond the Horizon | Jared Leto (Beyond the Horizon) | 14:00 | 2,023 | `2019-12-19-jared-leto-beyond-the-horizon-jared-leto-beyond-the-horizon` |
| 143 | pending | 2026-03-17 | Breakpoint | Breakpoint | 11:00 | 2,017 | `2026-03-17-breakpoint-breakpoint` |
| 144 | pending | 2025-09-01 | Dalton Fischer Podcast | Dalton Fischer Podcast | 11:00 | 2,011 | `2025-09-01-dalton-fischer-podcast-dalton-fischer-podcast` |
| 145 | pending | 2026-04-28 | Warren Smith — Secret Scholar Society | Warren Smith - Secret Scho | 10:00 | 2,002 | `2026-04-28-warren-smith-secret-scho-warren-smith-secret-scho` |
| 146 | pending | 2025-01-25 | Kim Iversen | Why Abolishing The CIA Won | 12:00 | 1,972 | `2025-01-25-kim-iversen-why-abolishing-the-cia-won-t-change-anything` |
| 147 | pending | 2026-02-08 | Redacted | How Epstein Was Used by Mossad, CIA & MI6 | 16:00 | 1,939 | `2026-02-08-how-epstein-was-used-by-mossad-cia-mi6` |
| 148 | pending | 2026-01-02 | Truth Hurts Show | Truth Hurts Show | 10:00 | 1,867 | `2026-01-02-truth-hurts-show-truth-hurts-show` |
| 149 | pending | 2026-04-17 | Hang Out with Sean Hannity | Hang Out with Sean Hannity | 9:00 | 1,864 | `2026-04-17-hang-out-with-sean-hannity-hang-out-with-sean-hannity` |
| 150 | pending | 2025-11-25 | HR News Channel | HR News Channel | 11:00 | 1,855 | `2025-11-25-hr-news-channel-hr-news-channel` |
| 151 | pending | 2018-08-10 | The Jimmy Dore Show | The Jimmy Dore Show | 10:00 | 1,837 | `2018-08-10-the-jimmy-dore-show-the-jimmy-dore-show` |
| 152 | pending | 2018-11-19 | Styxhexenhammer666 | Styxhexenhammer666 | 8:00 | 1,821 | `2018-11-19-styxhexenhammer666-styxhexenhammer666` |
| 153 | pending | 2026-05-02 | The Carlos Watson Podcast | John Kiriakou: CIA Torture Was Illegal & Useless | 10:00 | 1,818 | `2026-05-02-the-carlos-watson-podcast-john-kiriakou-cia-torture-was-illegal-useless` |
| 154 | pending | 2018-06-05 | TEDx Talks | How I Became a CIA Whistleblower | 11:00 | 1,817 | `2018-06-05-tedx-foggybottom-how-i-became-a-cia-whistleblower` |
| 155 | pending | 2026-03-31 | Unfiltered With S.A.M. | JOHN KIRIAKOU: Israel’s “Samson Option” Is Real | 12:00 | 1,809 | `2026-03-31-unfiltered-with-s-a-m-john-kiriakou-israel-s-samson-option-is-real` |
| 156 | pending | 2026-04-25 | Valuetainment | Valuetainment | 9:00 | 1,796 | `2026-04-25-valuetainment-valuetainment` |
| 157 | pending | 2026-01-13 | TCM | TCM Originals | 10:00 | 1,770 | `2026-01-13-tcm-originals-tcm-originals` |
| 158 | pending | 2017-08-17 | The Real News Network | CIA Torture Architects Settle With Victims to Avoid Trial | 10.6:00 | 1,768 | `2017-08-17-the-real-news-network-cia-torture-architects-settle-with-victims-to` |
| 159 | pending | 2026-05-02 | The Carlos Watson Podcast | The Carlos Watson Podcast | 10:00 | 1,768 | `2026-05-02-the-carlos-watson-podcast-the-carlos-watson-podcast-ol3UPW` |
| 160 | pending | 2023-12-18 | Dalton Fischer Podcast | Dalton Fischer Podcast | 11:00 | 1,742 | `2023-12-18-dalton-fischer-podcast-dalton-fischer-podcast` |
| 161 | pending | 2015-11-13 | Robin Hensel | John Kiriakou - Tackling Torture at the Top (11-12-15 Hamlin | 10:00 | 1,726 | `2015-11-13-robin-hensel-john-kiriakou-tackling-torture-at-the-top-11` |
| 162 | pending | 2026-05-02 | The Carlos Watson Podcast | The Carlos Watson Podcast | 10:00 | 1,726 | `2026-05-02-the-carlos-watson-podcast-the-carlos-watson-podcast` |
| 163 | pending | 2026-01-25 | The Honest Talk | The Honest Talk | 10:00 | 1,696 | `2026-01-25-the-honest-talk-the-honest-talk` |
| 164 | pending | 2025-04-27 | The Dr. Phil Podcast | “Your job is to break the law”John Kiriakou CIA Whistleblower | 10:00 | 1,679 | `2025-04-27-the-dr-phil-podcast-your-job-is-to-break-the-law-john-kiriakou-ci` |
| 165 | pending | 2018-08-24 | The Real News Network | CIA Whistleblower: John Brennan Is Out For Himself, Not the | 9.3:00 | 1,651 | `2018-08-24-the-real-news-network-cia-whistleblower-john-brennan-is-out-for-him` |
| 166 | pending | 2026-04-03 | The Megyn Kelly Show | Megyn Kelly | 9:00 | 1,650 | `2026-04-03-megyn-kelly-megyn-kelly` |
| 167 | pending | 2026-02-02 | LBC | CIA whistleblower on Epstein Files: Why no one will be broug | 8.9:00 | 1,625 | `2026-02-02-lbc-cia-whistleblower-on-epstein-files-why-no-one` |
| 168 | pending | 2023-11-16 | Dalton Fischer Podcast | Dalton Fischer Podcast | 9:00 | 1,590 | `2023-11-16-dalton-fischer-podcast-dalton-fischer-podcast` |
| 169 | pending | 2026-02-27 | Podcast UFO Live Shows | Podcast UFO Live Shows | 10:00 | 1,584 | `2026-02-27-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 170 | pending | 2026-03-16 | Breakpoint | Breakpoint | 8:00 | 1,576 | `2026-03-16-breakpoint-breakpoint` |
| 171 | pending | 2025-12-02 | RTM News | RTM News | 9:00 | 1,560 | `2025-12-02-rtm-news-rtm-news` |
| 172 | pending | 2025-11-12 | The America Report | John Kiriakou Explains CIA | 9:00 | 1,550 | `2025-11-12-the-america-report-john-kiriakou-explains-cia-s-torture-program` |
| 173 | pending | 2018-07-20 | Newsmax | Newsmax | 10:00 | 1,521 | `2018-07-20-newsmax-newsmax` |
| 174 | pending | 2021-09-29 | Free Assange | Free Assange | 10:00 | 1,501 | `2021-09-29-free-assange-free-assange` |
| 175 | pending | 2016-06-07 | CGTN America | The Heat: Crackdown on whistleblowers in the US Pt2 | 9.1:00 | 1,496 | `2016-06-07-cgtn-america-the-heat-crackdown-on-whistleblowers-in-the-u` |
| 176 | pending | 2025-04-22 | MintPress News | John Kiriakou: Exposing CIA Torture & U.S War Crimes / State | 9:00 | 1,487 | `2025-04-22-mintpress-news-john-kiriakou-exposing-cia-torture-u-s-war-cr` |
| 177 | pending | 2025-11-04 | Truth Hurts Show | Truth Hurts Show | 8:00 | 1,434 | `2025-11-04-truth-hurts-show-truth-hurts-show` |
| 178 | pending | 2024-09-07 | Dalton Fischer Podcast | Dalton Fischer Podcast | 8:00 | 1,429 | `2024-09-07-dalton-fischer-podcast-dalton-fischer-podcast` |
| 179 | pending | 2026-03-03 | Austin and Matt | Ex-CIA John Kiriakou: How \ | 8:00 | 1,409 | `2026-03-03-austin-and-matt-ex-cia-john-kiriakou-how-access-agents-infilt` |
| 180 | pending | 2025-02-06 | Redacted | The CIA is FINISHED as we know it Trump is burning it down w | 14:00 | 1,398 | `2025-02-06-redacted-the-cia-is-finished-as-we-know-it-trump-is-bu` |
| 181 | pending | 2021-10-07 | CovertAction Magazine | Silenced - John Kiriakou | 8:00 | 1,377 | `2021-10-07-covertaction-magazine-silenced-john-kiriakou` |
| 182 | pending | 2026-02-08 | Bidoun Waraq (بدون ورق) | كيف قمت بتجنيد رجل استخبارات شرق أوسطي؟ - جون كيرياكو (Arabi | 7:00 | 1,371 | `2026-02-08-arabi` |
| 183 | pending | 2026-01-20 | Podcast Digest | Podcast Digest | 9:00 | 1,357 | `2026-01-20-podcast-digest-podcast-digest` |
| 184 | pending | 2025-06-05 | Podcast Summaries | John Kiriakou / Tucker Carlson Podcast Summary | 9:00 | 1,279 | `2025-06-05-podcast-summaries-john-kiriakou-tucker-carlson-podcast-summary` |
| 185 | pending | 2026-03-17 | The Inquiry | The Inquiry | 8:00 | 1,276 | `2026-03-17-the-inquiry-the-inquiry` |
| 186 | pending | 2026-01-19 | Podcast Summaries | Podcast Summaries | 9:00 | 1,259 | `2026-01-19-podcast-summaries-podcast-summaries` |
| 187 | pending | 2017-05-17 | Democracy Now! | Democracy Now! | 8:00 | 1,238 | `2017-05-17-democracy-now-democracy-now` |
| 188 | pending | 2020-07-31 | Kevin Gosztola (The Dissenter) | How Politicians Disqualify Whistleblowers | 8:00 | 1,226 | `2020-07-31-kevin-gosztola-how-politicians-disqualify-whistleblowers` |
| 189 | pending | 2025-05-15 | zouglagr | Ο πρώην πράκτορας της CIA Τζον Κυριάκου μιλά ανοιχτά για την | 11:00 | 1,203 | `2025-05-15-zouglagr-cia` |
| 190 | pending | 2019-05-13 | Jamarl Thomas | Jamarl Thomas | 8:00 | 1,186 | `2019-05-13-jamarl-thomas-jamarl-thomas` |
| 191 | pending | 2018-05-28 | Breaking News 24/7 | Breaking News 24/7 | 8:00 | 1,141 | `2018-05-28-breaking-news-24-7-breaking-news-24-7` |
| 192 | pending | 2012-01-25 | The Young Turks | CIA Agent Charged With Espionage Act by Justice Department | 6.5:00 | 1,113 | `2012-01-25-the-young-turks-cia-agent-charged-with-espionage-act-by-justi` |
| 193 | pending | 2026-01-26 | Unfiltered With S.A.M. | JOHN KIRIAKOU: Venezuela Wasn | 7:00 | 1,108 | `2026-01-26-unfiltered-with-s-a-m-john-kiriakou-venezuela-wasn-t-about-oil-it-w` |
| 194 | pending | 2026-04-28 | Tucker Carlson Network | Tucker Carlson Network | 10:00 | 1,108 | `2026-04-28-tucker-carlson-network-tucker-carlson-network` |
| 195 | pending | 2023-05-30 | Global Times (环球时报) | 环球时报 Global Times | 8:00 | 1,087 | `2023-05-30-global-times-global-times` |
| 196 | pending | 2021-01-20 | Democracy Now! | CIA Whistleblower: Biden Intel Pick Avril Haines Approved Ob | 6.8:00 | 1,059 | `2021-01-20-democracy-now-cia-whistleblower-biden-intel-pick-avril-hain` |
| 197 | pending | 2026-01-21 | Unfiltered With S.A.M. | JOHN KIRIAKOU: There Is NO Good Guy in U.S. Politics | 7:00 | 1,028 | `2026-01-21-unfiltered-with-s-a-m-john-kiriakou-there-is-no-good-guy-in-u-s-pol` |
| 198 | pending | 2025-05-15 | Christos Konstantinidis (Χρήστος Κωνσταντινίδης) | Συνέντευξη με τον πρώην αξιωματικό της CIA Τζων Κυριακού (Gr | 9:00 | 979 | `2025-05-15-cia-gr` |
| 199 | pending | 2014-04-24 | Democracy Now! | Silenced Film Explores the Human Toll of Obama | 5.5:00 | 958 | `2014-04-24-democracy-now-silenced-film-explores-the-human-toll-of-obam` |
| 200 | pending | 2019-11-15 | Fox Business | The whistleblower did not think this through: Former CIA whi | 6.4:00 | 886 | `2019-11-15-fox-business-the-whistleblower-did-not-think-this-through` |
| 201 | pending | 2013-05-31 | The Young Turks | CIA Whistleblower | 4.4:00 | 852 | `2013-05-31-the-young-turks-cia-whistleblower-s-tips-on-how-not-to-get-ki` |
| 202 | pending | 2025-07-09 | Middle East Eye | Jeffrey Epstein was accused of being | 4.5:00 | 834 | `2025-07-09-middle-east-eye-jeffrey-epstein-was-accused-of-being-an-acces` |
| 203 | pending | 2021-10-19 | CODEPINK | John Kiriakou – Never Forget: 9/11 and the 20 Year War on Te | 6:00 | 830 | `2021-10-19-codepink-john-kiriakou-never-forget-9-11-and-the-20-ye` |
| 204 | pending | 2021-03-26 | Revolutionary Change | Revolutionary Change | 10:00 | 801 | `2021-03-26-revolutionary-change-revolutionary-change` |
| 205 | pending | 2025-10-25 | Republic World | US Runs Pak | 7:00 | 797 | `2025-10-25-republic-world-us-runs-pak-s-nuclear-strength-ex-cia-john-ki` |
| 206 | pending | 2013-01-24 | Channel 4 News | CIA whistleblower faces jail term | 5.0:00 | 788 | `2013-01-24-channel-4-news-cia-whistleblower-faces-jail-term` |
| 207 | pending | 2026-05-14 | Fox News | — | 4.6:00 | 727 | `2026-05-14-fox-news-you-liar-former-cia-official-calls-fauci-s-pa` |
| 208 | pending | 2018-03-14 | Democracy Now! | “She Tortured Just for the Sake of Torture”: CIA Whistleblow | 4.7:00 | 706 | `2018-03-14-democracy-now-she-tortured-just-for-the-sake-of-torture-cia` |
| 209 | pending | 2025-11-21 | TOI Bharat | — | 6:00 | 704 | `2025-11-21-toi-bharat-wiped-my-a-with-it-ex-cia-kiriakou-reveals-wh` |
| 210 | pending | 2019-12-21 | Fox News | Former CIA whistleblower on Durham probing Brennan | 3.6:00 | 610 | `2019-12-21-fox-news-former-cia-whistleblower-on-durham-probing-br` |
| 211 | pending | 2019-10-10 | Fox News | CIA whistleblower: This is an insult to real whistleblowers | 4.1:00 | 606 | `2019-10-10-fox-news-cia-whistleblower-this-is-an-insult-to-real-w` |
| 212 | pending | 2026-02-13 | Al Jazeera Arabic (الجزيرة) | ضابط استخبارات أمريكي سابق للجزيرة: إسرائيل حاولت تجنيدي - ج | 4:00 | 605 | `2026-02-13-aljazeera-arabic` |
| 213 | pending | 2025-10-25 | ANI News | Ex-CIA Agent Kiriakou Explains Why Pakistan Stands No Chance | 4:00 | 568 | `2025-10-25-ani-news-ex-cia-agent-kiriakou-explains-why-pakistan-s` |
| 214 | pending | 2018-05-11 | Democracy Now! | If Gina Haspel Is Confirmed at CIA, the U.S. Would Be Giving | 2.8:00 | 471 | `2018-05-11-democracy-now-if-gina-haspel-is-confirmed-at-cia-the-u-s-wo` |
| 215 | pending | 2026-02-13 | John Kiriakou | Mini Episode 5 Betrayal | 0:16:32 | 469 | `2026-02-13-dead-drop-mini-episode-5-betrayal` |
| 216 | pending | 2023-12-02 | Fox News | CIA whistleblower: | 3.6:00 | 447 | `2023-12-02-fox-news-cia-whistleblower-all-it-takes-is-a-signature` |
| 217 | pending | 2013-01-25 | Al Jazeera English | Ex-CIA agent heads to prison for torture leak | 2.5:00 | 440 | `2013-01-25-al-jazeera-english-ex-cia-agent-heads-to-prison-for-torture-leak` |
| 218 | pending | 2025-11-25 | Al Jazeera Arabic (الجزيرة) | ضابط سابق في الاستخبارات الأمريكية: إسرائيل طلبت من كل رئيس | 3:00 | 415 | `2025-11-25-aljazeera-arabic` |
| 219 | pending | 2025-05-17 | Nationalpost TV | Ελληνοαμερικανός πρώην πράκτορας CIA αποκαλύπτει - Αυτές οι | 3:00 | 377 | `2025-05-17-nationalpost-tv-cia` |
| 220 | pending | 2024-11-23 | Pentapostagma TV | Ελληνοαμερικανός πρώην πράκτορας της CIA: Κακώς στην Ελλάδα | 3:00 | 375 | `2024-11-23-pentapostagma-tv-cia` |
| 221 | pending | 2024-01-22 | Al Arabiya (العربية) | فضح جون كيرياكو أسرارا كبيرة عن المخابرات الأميركية وتحول لخ | 3:00 | 366 | `2024-01-22-alarabiya` |
| 222 | pending | 2025-02-22 | Katie Halper | F*** Joe Biden! - CIA Whistleblower John Kiriakou | 2:00 | 330 | `2025-02-22-katie-halper-f-joe-biden-cia-whistleblower-john-kiriakou` |
| 223 | pending | 2025-04-21 | MintPress News | Former CIA officer John Kiriakou reveals why he exposed the | 2:00 | 320 | `2025-04-21-mintpress-news-former-cia-officer-john-kiriakou-reveals-why` |
| 224 | pending | 2025-02-05 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou: Final | 2:00 | 310 | `2025-02-05-covertaction-magazine-former-cia-counter-terrorism-specialist-john` |
| 225 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou on Rub | 2:00 | 309 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john` |
| 226 | pending | 2025-02-25 | Katie Halper | Why CIA Whistleblower John Kiriakou Almost Took His Own Life | 1:00 | 300 | `2025-02-25-katie-halper-why-cia-whistleblower-john-kiriakou-almost-to` |
| 227 | pending | 2022-07-29 | CGTN America | Assange: political prisoner or criminal? | 2.0:00 | 298 | `2022-07-29-cgtn-america-assange-political-prisoner-or-criminal` |
| 228 | pending | 2013-01-26 | JewishNewsOne | Former CIA officer sentenced for leaks | 1.9:00 | 285 | `2013-01-26-jewishnewsone-former-cia-officer-sentenced-for-leaks` |
| 229 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou | 1:00 | 216 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john-fYN9zL` |
| 230 | pending | 2025-02-26 | Katie Halper | CIA Whistleblower John Kiriakou Predicts JFK Files | 1:00 | 202 | `2025-02-26-katie-halper-cia-whistleblower-john-kiriakou-predicts-jfk` |
| 231 | pending | 2025-02-27 | Katie Halper | ‘I’d Like To Smack Mitch McConnell’s Turtle Face’ - CIA Whis | 1:00 | 177 | `2025-02-27-katie-halper-i-d-like-to-smack-mitch-mcconnell-s-turtle-fa` |
| 232 | pending | 2025-02-05 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou Talks | 1:00 | 154 | `2025-02-05-covertaction-magazine-former-cia-counter-terrorism-specialist-john-VtRxlx` |
| 233 | pending | 2025-07-09 | Piers Morgan Uncensored | Former CIA Intelligence John Kiriakou On Epstein Files Disap | 1:00 | 152 | `2025-07-09-piers-morgan-uncensored-former-cia-intelligence-john-kiriakou-on-epst` |
| 234 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou: What | 1:00 | 134 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john-GyK2WK` |
| 235 | pending | 2026-04-16 | Fox News | CIA whistleblower on his life of espionage | 1.1:00 | 134 | `2026-04-16-fox-news-cia-whistleblower-on-his-life-of-espionage` |
| 236 | pending | 2025-02-03 | CovertAction Magazine | John Kiriakou, Former CIA Counter Terrorism Specialist on Cy | 1:00 | 117 | `2025-02-03-covertaction-magazine-john-kiriakou-former-cia-counter-terrorism-sp` |
| 237 | pending | 2012-05-15 | Government Accountability Project | GAP | 1.0:00 | 103 | `2012-05-15-government-accountability-gap-s-jesselyn-radack-on-nsa-whistleblower-to` |
| 238 | pending | 2015-03-02 | Voices of Liberty | CIA Torture Whistleblower John Kiriakou, Part 9: How to Blow | 1:00 | 96 | `2015-03-02-voices-of-liberty-cia-torture-whistleblower-john-kiriakou-part-olK01D` |
| 239 | pending | 2025-02-24 | Katie Halper | Why Edward Snowden Is NOT A TRAITOR w/ CIA Whistleblower Joh | 2:00 | 96 | `2025-02-24-katie-halper-why-edward-snowden-is-not-a-traitor-w-cia-whi` |
| 240 | pending | 2023-11-22 | ProjectCensored | It | 1:00 | 94 | `2023-11-22-projectcensored-it-s-not-about-justice-john-kiriakou-on-his-e` |
| 241 | pending | 2023-01-07 | Real Progressives | The CIA Serves the Capital Order w/ John Kiriakou #shorts | 1:00 | 87 | `2023-01-07-real-progressives-the-cia-serves-the-capital-order-w-john-kiria` |
| 242 | pending | 2015-07-30 | AP Archive | US government leak crackdown snags ex-CIA officer | 1.4:00 | 83 | `2015-07-30-ap-archive-us-government-leak-crackdown-snags-ex-cia-off` |
| 243 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou on Tru | 1:00 | 78 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john-wh8Rwf` |

---

## Flagged low-value — 97 transcripts, 662,086 words

His own shows where he hosts others, clip formats, audiobook samples. The intake playbook
rejects these on discovery; these predate that filter or slipped through. Skim before spending
a run on them — but check rather than assume, a few are real interviews under a bad label.

| # | status | date | show | title | length | words | slug |
|---|---|---|---|---|---|---|---|
| 244 | pending | 2026-03-27 | The Deep Focus Show | The Deep Focus Show | 90:00 | 16,662 | `2026-03-27-the-deep-focus-show-the-deep-focus-show` |
| 245 | pending | 2025-07-25 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 84:00 | 15,051 | `2025-07-25-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 246 | pending | 2025-08-12 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 76:00 | 14,346 | `2025-08-12-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 247 | pending | 2025-07-26 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 94:00 | 13,991 | `2025-07-26-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 248 | pending | 2025-08-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 73:00 | 13,051 | `2025-08-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-LnuGCF` |
| 249 | pending | 2026-02-28 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 70:00 | 12,271 | `2026-02-28-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 250 | pending | 2025-09-04 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 71:00 | 12,267 | `2025-09-04-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 251 | pending | 2025-08-28 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 69:00 | 12,189 | `2025-08-28-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 252 | pending | 2026-03-01 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 68:00 | 12,053 | `2026-03-01-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 253 | pending | 2025-09-08 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “France In Crisis” | 76:00 | 11,914 | `2025-09-08-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-fra` |
| 254 | pending | 2025-09-08 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “France In Crisis” | 67:00 | 11,756 | `2025-09-08-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-fra-y1XO6M` |
| 255 | pending | 2025-08-21 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 68:00 | 11,587 | `2025-08-21-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 256 | pending | 2025-08-14 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 68:00 | 11,520 | `2025-08-14-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 257 | pending | 2025-09-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 66:00 | 11,269 | `2025-09-11-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 258 | pending | 2025-09-22 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 67:00 | 11,018 | `2025-09-22-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-dSPyBa` |
| 259 | pending | 2025-12-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 73:00 | 10,727 | `2025-12-06-deprogram-ted-rall-deprogram-ted-rall` |
| 260 | pending | 2026-01-30 | DeProgram Show with Ted Rall and Jamarl Thomas | Is Trump Bidening Out? / DeProgram with Ted Rall and John Kiriakou | 3428 | 10,652 | `2026-01-30-deprogram-show-with-is-trump-bidening-out-deprogram-with-ted` |
| 261 | pending | 2025-07-29 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 74:00 | 10,430 | `2025-07-29-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 262 | pending | 2026-02-28 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 70:00 | 10,393 | `2026-02-28-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-Bg4Lki` |
| 263 | pending | 2026-02-18 | DeProgram Show with Ted Rall and Jamarl Thomas | Jordan Is Next / DeProgram with Ted Rall and John Kiriakou | 60:00 | 10,378 | `2026-02-18-deprogram-show-with-ted-ra-jordan-is-next-deprogram-with-ted-rall-and-jo` |
| 264 | pending | 2025-11-01 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “Gaza-istan?” | 61:00 | 10,265 | `2025-11-01-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-gaz` |
| 265 | pending | 2026-01-13 | DeProgram Show with Ted Rall and Jamarl Thomas | The Fix Is In / DeProgram with Ted Rall and John Kiriakou | 57:00 | 10,159 | `2026-01-13-deprogram-show-with-ted-ra-the-fix-is-in-deprogram-with-ted-rall-and-joh` |
| 266 | pending | 2025-11-10 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 58:00 | 10,107 | `2025-11-10-deprogram-ted-rall-deprogram-ted-rall` |
| 267 | pending | 2026-01-13 | DeProgram Show with Ted Rall and Jamarl Thomas | The Fix Is In / DeProgram with Ted Rall and John Kiriakou | 57:00 | 10,105 | `2026-01-13-deprogram-show-with-ted-ra-the-fix-is-in-deprogram-with-ted-rall-and-joh-lg1k-9` |
| 268 | pending | 2026-03-04 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 10,104 | `2026-03-04-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 269 | pending | 2026-01-23 | DeProgram Show with Ted Rall and Jamarl Thomas | Club Med Gaza / DeProgram with Ted Rall and John Kiriakou | 59:00 | 10,047 | `2026-01-23-deprogram-show-with-ted-ra-club-med-gaza-deprogram-with-ted-rall-and-joh-0D-L8O` |
| 270 | pending | 2026-03-31 | DeProgram Show with Ted Rall and Jamarl Thomas | Israel Legalizes Lynching / DeProgram with Ted Rall and John Kiriakou | 3588 | 10,009 | `2026-03-31-deprogram-show-with-israel-legalizes-lynching-deprogram-with-ted-rall` |
| 271 | pending | 2025-11-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,992 | `2025-11-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 272 | pending | 2025-10-10 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,978 | `2025-10-10-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-UaGsDF` |
| 273 | pending | 2026-03-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 58:00 | 9,977 | `2026-03-11-deprogram-ted-rall-deprogram-ted-rall` |
| 274 | pending | 2025-11-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,903 | `2025-11-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-1mebPn` |
| 275 | pending | 2026-01-26 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,863 | `2026-01-26-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 276 | pending | 2026-03-09 | DeProgram Show with Ted Rall and Jamarl Thomas | Ecocide in Iran / DeProgram with Ted Rall and John Kiriakou | 59:00 | 9,750 | `2026-03-09-deprogram-show-with-ted-ra-ecocide-in-iran-deprogram-with-ted-rall-and-j` |
| 277 | pending | 2026-04-08 | DeProgram Show with Ted Rall and Jamarl Thomas | Two More Weeks / DeProgram with Ted Rall and Jamarl Thomas | 3595 | 9,750 | `2026-04-08-deprogram-show-with-two-more-weeks-deprogram-with-ted-rall` |
| 278 | pending | 2025-10-31 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “Gaza-istan?” | 60:00 | 9,676 | `2025-10-31-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-gaz` |
| 279 | pending | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 56:00 | 9,658 | `2025-11-19-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 280 | pending | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 56:00 | 9,554 | `2025-11-19-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-Cxd39y` |
| 281 | pending | 2025-10-23 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 9,306 | `2025-10-23-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 282 | pending | 2025-10-22 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 9,301 | `2025-10-22-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 283 | pending | 2026-03-20 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 60:00 | 9,282 | `2026-03-20-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 284 | rejected (93.3% duplicate of the 2025-11-19 DMZ America episode mined in its place) | 2025-11-18 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 57:00 | 9,169 | `2025-11-18-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 285 | pending | 2025-08-29 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 63:00 | 8,930 | `2025-08-29-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 286 | pending | 2025-10-30 | DeProgram Show with Ted Rall and Jamarl Thomas | Deprogram with Ted Rall and John Kiriakou: “Hamas Has Won\ | 58:00 | 8,887 | `2025-10-30-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-ham` |
| 287 | pending | 2025-10-31 | The Deep Focus Show | The Deep Focus Show | 51:00 | 8,879 | `2025-10-31-the-deep-focus-show-the-deep-focus-show` |
| 288 | pending | 2025-11-20 | DeProgram Show with Ted Rall and Jamarl Thomas | CIA Cover-Up on JFK Exposed | 58:00 | 8,851 | `2025-11-20-deprogram-ted-rall-cia-cover-up-on-jfk-exposed` |
| 289 | pending | 2025-11-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 55:00 | 8,740 | `2025-11-11-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 290 | pending | 2025-09-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 71:00 | 8,603 | `2025-09-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 291 | pending | 2025-10-21 | The Deep Focus Show | The Deep Focus Show | 52:00 | 8,470 | `2025-10-21-the-deep-focus-show-the-deep-focus-show` |
| 292 | pending | 2026-02-19 | The Deep Focus Show | Trump | 62:00 | 8,411 | `2026-02-19-the-deep-focus-show-trump-s-iran-gamble-w-george-galloway` |
| 293 | pending | 2025-12-19 | The Deep Focus Show | Held Captive 100+ Days by the Taliban w/ Safi Rauf | 54:00 | 7,865 | `2025-12-19-the-deep-focus-show-held-captive-100-days-by-the-taliban-w-safi-r` |
| 294 | pending | 2026-02-13 | The Deep Focus Show | Is U.S. Global Dominance Eroding? w/ Alfred McCoy | 50:00 | 7,766 | `2026-02-13-the-deep-focus-show-is-u-s-global-dominance-eroding-w-alfred-mcco` |
| 295 | pending | 2025-08-16 | The Deep Focus Show | The Call is to Liberate Palestine w/ Miko Peled | 44:00 | 7,746 | `2025-08-16-the-deep-focus-show-the-call-is-to-liberate-palestine-w-miko-pele` |
| 296 | pending | 2025-10-07 | The Deep Focus Show | The Deep Focus Show | 46:00 | 7,655 | `2025-10-07-the-deep-focus-show-the-deep-focus-show` |
| 297 | pending | 2025-07-26 | The Deep Focus Show | RUSSIAGATE — A Major Dividing Line w/ Matt Taibbi | 46:00 | 7,607 | `2025-07-26-the-deep-focus-show-russiagate-a-major-dividing-line-w-matt-taibb` |
| 298 | pending | 2025-12-27 | The Deep Focus Show | The Deep Focus Show | 50:00 | 7,399 | `2025-12-27-the-deep-focus-show-the-deep-focus-show` |
| 299 | pending | 2025-11-14 | The Deep Focus Show | Taxpayers Against Genocide w/ Seth Donnelly | 42:00 | 7,179 | `2025-11-14-the-deep-focus-show-taxpayers-against-genocide-w-seth-donnelly` |
| 300 | pending | 2026-03-06 | The Deep Focus Show | The Deep Focus Show | 52:00 | 7,125 | `2026-03-06-the-deep-focus-show-the-deep-focus-show` |
| 301 | pending | 2025-09-18 | The Deep Focus Show | The Deep Focus Show | 32:00 | 5,899 | `2025-09-18-the-deep-focus-show-the-deep-focus-show` |
| 302 | pending | 2021-02-24 | Scott Horton | Ep 5458 — The Dangerous Reaction | 33:00 | 5,721 | `2021-02-24-ep-5458-the-dangerous-reaction` |
| 303 | pending | 2026-03-03 | The Deep Focus Show | Iran Escalation, Captured Spies: What Really Happens? And More I Going | 2324 | 5,279 | `2026-03-03-the-deep-focus-iran-escalation-captured-spies-what-really-happens` |
| 304 | pending | 2026-03-31 | The Deep Focus Show | Is World War 3 Starting? | 38:00 | 5,176 | `2026-03-31-the-deep-focus-show-is-world-war-3-starting` |
| 305 | pending | 2025-11-25 | The Deep Focus Show | Complicity In Gaza | 50:00 | 4,946 | `2025-11-25-the-deep-focus-show-complicity-in-gaza-s-genocide-w-richard-falk` |
| 306 | pending | 2026-04-17 | The Deep Focus Show | Europe Is Running Out of Fuel w/ Richard Wolff | 31:00 | 4,259 | `2026-04-17-the-deep-focus-show-europe-is-running-out-of-fuel-w-richard-wolff` |
| 307 | pending | 2025-08-28 | yusefs report | clip (\ | 25:00 | 4,144 | `2025-08-28-yusefs-report-clip-scott-horton-x-kiriakou-destroy-dershowi` |
| 308 | pending | 2026-03-01 | DeProgram Show with Ted Rall and Jamarl Thomas | John Kiriakou & Ted Rall | 22:00 | 4,010 | `2026-03-01-deprogram-show-with-ted-ra-john-kiriakou-ted-rall-s-live-iran-war-q-a-de` |
| 309 | pending | 2025-10-30 | Full Audiobook | Full Audiobook | 30:00 | 3,952 | `2025-10-30-full-audiobook-full-audiobook` |
| 310 | pending | 2026-04-23 | Golden Gems | clip channel | 17:00 | 3,020 | `2026-04-23-golden-gems-clip-channel` |
| 311 | pending | 2026-02-26 | DeProgram Show with Ted Rall and Jamarl Thomas | SOTU: A Complete Disaster | 16:00 | 2,912 | `2026-02-26-deprogram-ted-rall-sotu-a-complete-disaster` |
| 312 | pending | 2025-04-27 | The Dr. Phil Podcast | short clip of the full Dr. Phil ep | 15:00 | 2,555 | `2025-04-27-the-dr-phil-podcast-short-clip-of-the-full-dr-phil-ep` |
| 313 | pending | 2026-02-18 | Viral Plug | John Kiriakou CIA Story Meme Compilation - PART 2 | 13:00 | 2,535 | `2026-02-18-viral-plug-john-kiriakou-cia-story-meme-compilation-part` |
| 314 | pending | 2026-02-21 | Viral Plug | John Kiriakou CIA Story Meme Compilation - PART 4 | 11:00 | 2,380 | `2026-02-21-viral-plug-john-kiriakou-cia-story-meme-compilation-part` |
| 315 | pending | 2026-03-01 | Viral Plug | John Kiriakou CIA Story Meme Compilation 8 | 11:00 | 2,210 | `2026-03-01-viral-plug-john-kiriakou-cia-story-meme-compilation-8` |
| 316 | pending | 2026-02-27 | Viral Plug | John Kiriakou CIA Story Meme Compilation 7 | 10:00 | 2,150 | `2026-02-27-viral-plug-john-kiriakou-cia-story-meme-compilation-7` |
| 317 | pending | 2026-02-10 | DeProgram Show with Ted Rall and Jamarl Thomas | Greek Spies, Epstein, Aliens, CIA | 11:00 | 2,010 | `2026-02-10-deprogram-ted-rall-greek-spies-epstein-aliens-cia` |
| 318 | pending | 2026-03-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 11:00 | 2,002 | `2026-03-11-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 319 | pending | 2026-02-25 | Viral Plug | John Kiriakou CIA Story Meme Compilation 6 | 10:00 | 1,886 | `2026-02-25-viral-plug-john-kiriakou-cia-story-meme-compilation-6` |
| 320 | pending | 2026-03-04 | DeProgram Show with Ted Rall and Jamarl Thomas | Ted Rall & John Kiriakou Iran War Viewer Q&A / DeProgram Show | 11:00 | 1,844 | `2026-03-04-deprogram-show-with-ted-ra-ted-rall-john-kiriakou-iran-war-viewer-q-a-de` |
| 321 | pending | 2026-02-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 8:00 | 1,779 | `2026-02-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 322 | pending | 2026-02-11 | DeProgram Show with Ted Rall and Jamarl Thomas | Bad Bunny, Epstein Files, and more! | 10:00 | 1,761 | `2026-02-11-deprogram-ted-rall-bad-bunny-epstein-files-and-more` |
| 323 | pending | 2026-02-25 | DeProgram Show with Ted Rall and Jamarl Thomas | Is War with Iran Imminent? / Ted Rall & John Kiriakou | 9:00 | 1,590 | `2026-02-25-deprogram-show-with-ted-ra-is-war-with-iran-imminent-ted-rall-john-kiria` |
| 324 | pending | 2026-02-13 | DeProgram Show with Ted Rall and Jamarl Thomas | Pam Bondi | 8:00 | 1,498 | `2026-02-13-deprogram-ted-rall-pam-bondi-s-embarrassing-epstein-hearing` |
| 325 | pending | 2025-12-17 | DeProgram Show with Ted Rall and Jamarl Thomas | John Kiriakou on CIA Coup Tactics, Trump | 8:00 | 1,410 | `2025-12-17-deprogram-show-with-ted-ra-john-kiriakou-on-cia-coup-tactics-trump-s-wmd` |
| 326 | pending | 2026-03-01 | DeProgram Show with Ted Rall and Jamarl Thomas | Ted Rall & John Kiriakou React as Iran War Rages On | 8:00 | 1,320 | `2026-03-01-deprogram-show-with-ted-ra-ted-rall-john-kiriakou-react-as-iran-war-rage` |
| 327 | pending | 2026-01-04 | DeProgram Show with Ted Rall and Jamarl Thomas | On CIA Psychologists, Torture, Mamdani | 8:00 | 1,315 | `2026-01-04-deprogram-ted-rall-on-cia-psychologists-torture-mamdani` |
| 328 | pending | 2026-03-31 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 7:00 | 1,146 | `2026-03-31-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 329 | pending | 2026-01-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 6:00 | 1,014 | `2026-01-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 330 | pending | 2025-06-15 | The Deep Focus Show | Israel Strikes Iran - John Kiriakou | 4:00 | 591 | `2025-06-15-the-deep-focus-show-israel-strikes-iran-john-kiriakou-s-insights` |
| 331 | pending | 2023-05-05 | CODEPINK | John Kiriakou on Daniel Ellsberg #shorts | 1:00 | 179 | `2023-05-05-codepink-john-kiriakou-on-daniel-ellsberg-shorts` |
| 332 | pending | 2025-07-30 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 77:00 | 0 | `2025-07-30-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 333 | pending | 2025-08-02 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 70:00 | 0 | `2025-08-02-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 334 | pending | 2025-09-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 65:00 | 0 | `2025-09-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 335 | rejected (same episode as the 2025-11-19 DMZ America record mined in its place; this file's transcript was swept into its .sponsors sidecar and the main file is empty) | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | Israel | 62:00 | 0 | `2025-11-19-deprogram-ted-rall-israel-s-discreet-ethnic-cleansing-of-gaza` |
| 336 | pending | 2025-11-20 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 0 | `2025-11-20-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 337 | pending | 2025-11-21 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 0 | `2025-11-21-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 338 | pending | 2026-02-25 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 59:00 | 0 | `2026-02-25-deprogram-ted-rall-deprogram-ted-rall` |
| 339 | pending | 2026-03-03 | DeProgram Show with Ted Rall and Jamarl Thomas | Regime Derange / DeProgram with Ted Rall and John Kiriakou | 60:00 | 0 | `2026-03-03-deprogram-show-with-ted-ra-regime-derange-deprogram-with-ted-rall-and-jo` |
| 340 | pending | 2026-03-12 | DeProgram Show with Ted Rall and Jamarl Thomas | A Super Dumb Mass Murder | 59:00 | 0 | `2026-03-12-deprogram-ted-rall-a-super-dumb-mass-murder` |
