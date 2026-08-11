# Unwritten transcript ledger

Transcripts sitting in the corpus that **no article cites** — fetched, cleaned, never mined.
This is the work queue for the perpetual old-content routine.

- **172 unwritten** of 873 transcripts (706 written from)
- **494,684 transcript words** unread, ~239,996 of them in the main queue
- Sorted richest-first: most unwritten words per transcript read
- Regenerate with `node tools/build-unwritten-ledger.mjs` — hand-set statuses in the
  `status` column are preserved across regenerations

Status vocabulary: `pending` · `in-progress` · `written` · `rejected (reason)`.
A row disappears on its own once any article cites it, so `written` is belt-and-braces.

---

## Main queue — 121 transcripts, 239,996 words

| # | status | date | show | title | length | words | slug |
|---|---|---|---|---|---|---|---|
| 1 | rejected (host recap + unrelated guest interview; Kiriakou never speaks) | 2018-01-30 | Ian Discussions | Ian | 92:00 | 12,334 | `2018-01-30-ian-discussions-ian-s-discussions-with-john-kiriakou` |
| 2 | rejected (50-minute truncated audio cut of the same 2023-09-22 Scheer interview held in full at 92 minutes as 2023-09-22-ex-cia-officer-exposes-the-torture-program, 76.7% match with an identical opening and no outro -- the full upload was mined in its place) | 2023-09-22 | Scheer Intelligence | John Kiriakou: Never Forget America | 50:00 | 11,431 | `2023-09-22-scheer-intelligence-john-kiriakou-never-forget-americas-torture-l` |
| 3 | rejected (re-upload of the 2022-04-21 Lee Camp Moment of Clarity episode) | 2022-05-05 | Suzi 3D | CIA Whistleblower John Kiriakou Joins Lee Camp to talk Panqu | 55:00 | 9,268 | `2022-05-05-suzi-3d-cia-whistleblower-john-kiriakou-joins-lee-cam` |
| 4 | rejected (99.5% identical to the same-day Panquake upload of the O'Brien interview, and 95% to the already-cited 2022-04-24 Graham Elwood full interview) | 2022-05-05 | Suzi 3D | FULL INTERVIEW: John Kiriakou & Sean O | 45:00 | 7,871 | `2022-05-05-suzi-3d-full-interview-john-kiriakou-sean-o-brien-tal` |
| 5 | rejected (99.2% duplicate of 2025-04-23-dr-phil-podcast-secrets-lies-price-of-truth-part2, already cited by 16 articles) | 2025-05-01 | The Dr. Phil Podcast | likely = ingested aYK16WJ1WsU | 54:00 | 7,851 | `2025-05-01-the-dr-phil-podcast-likely-ingested-ayk16wj1wsu` |
| 6 | rejected (Spanish-dubbed re-presentation of the 2025-10-10 Joe Rogan interview, already cited by 26 articles; captions are a machine back-translation so no wording is Kiriakou's) | 2025-11-03 | HispaUnidad | HispaUnidad | 46:00 | 7,362 | `2025-11-03-hispaunidad-hispaunidad` |
| 7 | rejected (host-only episode; Kiriakou lost power in a storm and never appears) | 2021-09-02 | Garland Nixon | After Afghanistan | 34:00 | 6,705 | `2021-09-02-garland-nixon-after-afghanistan` |
| 8 | rejected (Susie Dawson fundraiser stream; Kiriakou is praised by other panellists but never speaks) | 2019-08-24 | Suzi 3D | Suzi 3D | 40:00 | 5,956 | `2019-08-24-suzi-3d-suzi-3d` |
| 9 | rejected (99.6% duplicate of the 2022-04-24 Graham Elwood full interview; the same content is already cited extensively from the 2022-05-05 Panquake copy) | 2022-04-22 | Graham Elwood | Kiriakou & Sean O | 33:00 | 5,900 | `2022-04-22-graham-elwood-kiriakou-sean-o-brien-explain-panquake` |
| 10 | rejected (film-studies episode with Olympia Kiriakou on Carole Lombard; John Kiriakou never appears) | 2021-10-12 | Foreign Correspondents: Deeper into Hitchcock | Episode 25: \ | 33:00 | 5,528 | `2021-10-12-foreign-correspondents-de-episode-25-mr-mrs-smith-1941-feat-olympia-kir` |
| 11 | rejected (two-host reaction breakdown of the 2025-10-10 Joe Rogan episode; 32.6% verbatim shingle overlap with that already-cited source and the rest is host monologue — Kiriakou appears only as replayed clips) | 2025-10-17 | Liberty Vault | Liberty Vault | 23:00 | 4,217 | `2025-10-17-liberty-vault-liberty-vault` |
| 12 | rejected (same interview as 2020-02-25-cafe-weltschmerz…, which was fully mined on 2026-08-08; identical English conversation, the Weltschmerz upload merely carries a Dutch-language intro in front of it) | 2020-02-25 | Potkaars podcast | London report on the Assange extradition hearing | 24:00 | 3,992 | `2020-02-25-london-report-on-the-assange-extradition-hear` |
| 13 | rejected (87.5% shingle match to 2026-01-19-diary-of-a-ceo-they-can-see-all-your-messages, already cited by 18 articles — a third-party re-upload of the Steven Bartlett interview, as the slug's own note suspected) | 2026-01-22 | The Honest Talk | credits \ | 20:00 | 3,566 | `2026-01-22-the-honest-talk-credits-steven-bartlett-likely-mislabeled-re` |
| 14 | rejected (hosts reading John Kiriakou's Consortium News column 'American Gulag' aloud on air; Kiriakou himself never speaks, so nothing in it is single-source canon) | 2022-11-07 | Indie News Network (INN) | Indie News Network (INN) | 24:00 | 3,560 | `2022-11-07-indie-news-network-inn-indie-news-network-inn` |
| 15 | rejected (same two-host reaction-breakdown format as the 10-17 upload; 34.0% verbatim shingle overlap with the already-cited 2025-10-10 Joe Rogan episode, remainder host monologue) | 2025-10-19 | Liberty Vault | Liberty Vault | 18:00 | 3,346 | `2025-10-19-liberty-vault-liberty-vault` |
| 16 | rejected (94.8% shingle match to 2017-08-20-internet-party-internet-party, already cited by 3 articles — a re-upload of the same Internet Party appearance six days later) | 2017-08-26 | Internet Party | Internet Party | 22:00 | 3,286 | `2017-08-26-internet-party-internet-party` |
| 17 | rejected (Panquake product-update livestream; Kiriakou appears only as a 60-second brand-ambassador intro and makes no substantive claim — the remaining 18 minutes are Suzie Dawson's build presentation and Sean O'Brien's dev update) | 2022-07-03 | Panquake / #TalkLiberation | Public Delivery Meeting #17 feat. Kiriakou, Suzie Dawson | 19:00 | 3,046 | `2022-07-03-panquake-lee-camp-public-delivery-meeting-17-feat-kiriakou-suzi` |
| 18 | rejected (re-upload of the 2013-01-30 Democracy Now sentencing segment — opens 'I'm Amy Goodman'; 86.4% shingle match to the terrorpedia aggregator copy already cited by 20 articles) | 2026-03-12 | Nietzsche | John Kiriakou Sentenced to prison | 16:00 | 2,927 | `2026-03-12-nietzsche-john-kiriakou-sentenced-to-prison` |
| 19 | rejected (2023 re-post of the 2015-04-16 Real News RAI part 1 already held, 73.0% shingle match; identical episode word for word, but this upload carries auto-captions where the 2015 file has speaker-labelled human captions -- the 2015 original was mined in its place) | 2023-04-24 | Reality Asserts Itself (Paul Jay) | I Believed America Could Do No Wrong (RAI) | 16:00 | 2,917 | `2023-04-24-real-news-reality-asserts-itself-i-believed-america-could-do-no-wrong-rai` |
| 20 | rejected (81.4% duplicate of the 2015-05-08 Real News 'Reality Asserts Itself' original, which was mined in its place on this run) | 2023-04-25 | Reality Asserts Itself (Paul Jay) | Real News — Reality Asserts Itself | 15:00 | 2,866 | `2023-04-25-real-news-reality-asserts-itself-real-news-reality-asserts-itself-FgD6TE` |
| 21 | rejected (86.4%-verified re-holding of the 2013-01-30 Democracy Now sentencing segment already carried by the 2015-01-09 terrorpedia aggregator, cited by 20 articles; the Amy Goodman intro and the Intelligence Identities Protection Act framing appear verbatim there) | 2013-01-30 | Democracy Now! | Sentenced to Prison While Torturers Walk Free | 17:00 | 2,856 | `2013-01-30-democracy-now-sentenced-to-prison-while-torturers-walk-free` |
| 22 | rejected (84.5% shingle match to 2025-10-24-pakistan-nuclear-secrets-cia-lies, already cited by 7 articles — a next-day re-cut of the same India/Pakistan interview) | 2025-10-25 | ANI News | Ex-CIA Agent Kiriakou: The U.S. Was Waiting for India to Att | 18:00 | 2,760 | `2025-10-25-ani-news-ex-cia-agent-kiriakou-the-u-s-was-waiting-for` |
| 23 | rejected (96.9% shingle match to 2025-07-03-spy-diaries-jailed-for-exposing-the-cia, already cited) | 2025-12-23 | TCM | TCM TV | 16:00 | 2,593 | `2025-12-23-tcm-tv-tcm-tv` |
| 24 | rejected (92.1% duplicate of the 2019-08-08 David Gornoski interview, which was mined in its place on this run) | 2022-04-07 | David Gornoski | Explores Life as a Spy (probe dup) | 14:00 | 2,525 | `2022-04-07-david-gornoski-explores-life-as-a-spy-probe-dup` |
| 25 | rejected (two-host reaction breakdown replaying the cited 2026-01-19 Diary of a CEO interview — 36.2% verbatim overlap with that source and the remainder host monologue; the '95% of our defense secrets' and Hungarian-pager-company passages verified verbatim in the parent) | 2026-01-25 | Liberty Vault | Liberty Vault | 14:00 | 2,522 | `2026-01-25-liberty-vault-liberty-vault` |
| 26 | rejected (host reaction video: 25 of 28 paragraphs are Jackson Hinkle's own monologue, and Kiriakou appears only as a replayed clip whose Caribbean-refinery argument is already carried by the 2025-12-10 Mario Nawfal source cited by 13 articles, and by five other sources) | 2025-12-15 | Jackson Hinkle Official | EX-CIA JOHN KIRIAKOU: VENEZUELA WAR IS ABOUT CHINA | 14:00 | 2,513 | `2025-12-15-jackson-hinkle-official-an-ex-cia-john-kiriakou-venezuela-war-is-about-c` |
| 27 | rejected (91.5% shingle match to the terrorpedia aggregator copy of the same Democracy Now segment, already cited by 20 articles) | 2013-01-30 | Democracy Now! | John Brennan a \ | 17:00 | 2,496 | `2013-01-30-democracy-now-john-brennan-a-terrible-choice-to-lead-the-ci` |
| 28 | rejected (96.2% shingle match to 2025-08-31-dalton-fischer-mossad-blackwater, already cited by 76 articles) | 2025-09-02 | Dalton Fischer Podcast | Dalton Fischer Podcast | 13:00 | 2,400 | `2025-09-02-dalton-fischer-podcast-dalton-fischer-podcast` |
| 29 | written | 2015-02-10 | Alittlepart Ofme (CallMeCookie) | Alittlepart Ofme (CallMeCo | 13:00 | 2,290 | `2015-02-10-alittlepart-ofme-callmeco-alittlepart-ofme-callmeco` |
| 30 | rejected (2,303-word clip of the 15,506-word 2025-02-19 Katie Halper episode already cited by 12 articles; 90.7% match, 11 of 12 sampled 12-word runs verbatim in the parent) | 2025-02-22 | Katie Halper | \ | 12:00 | 2,270 | `2025-02-22-katie-halper-rudy-giuliani-tried-to-shake-me-down-for-2m` |
| 31 | rejected (clip of the 42,209-word 2025-08-31 Dalton Fischer episode already cited by 77 articles; 95.7% match, 11 of 12 sampled 12-word runs verbatim in the parent) | 2025-09-03 | Dalton Fischer Podcast | Dalton Fischer Podcast | 14:00 | 2,268 | `2025-09-03-dalton-fischer-podcast-dalton-fischer-podcast` |
| 32 | written | 2023-01-16 | The Canada Files | Political Misfits — DC Witte, Kiriakou & August | 20:00 | 2,246 | `2023-01-16-the-canada-files-political-misfits-dc-witte-kiriakou-august` |
| 33 | rejected (clip of the same 2025-03-26 Podcast UFO live show; 86.9% shingle match) | 2025-10-24 | Podcast UFO Live Shows | Podcast UFO Live Shows | 13:00 | 2,211 | `2025-10-24-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 34 | rejected (clip of the same 2025-08-31 Dalton Fischer episode; 93.5% match, 10 of 12 sampled 12-word runs verbatim in the parent) | 2025-09-04 | Dalton Fischer Podcast | Dalton Fischer Podcast | 12:00 | 2,199 | `2025-09-04-dalton-fischer-podcast-dalton-fischer-podcast` |
| 35 | rejected (clip of the 10,041-word 2025-03-26 Podcast UFO live show already cited by 13 articles; 88.6% shingle match) | 2025-09-12 | Podcast UFO Live Shows | Podcast UFO Live Shows | 12:00 | 2,198 | `2025-09-12-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 36 | rejected (the publisher's own highlights cut of the 2025-12-09 Dialogue Works episode already cited by 28 articles; 96.1% shingle match) | 2025-12-12 | Dialogue Works | US lacks long-term Middle East strategy | 13:00 | 2,130 | `2025-12-12-dialogue-works-highlights-us-lacks-long-term-middle-east-strategy` |
| 37 | written | 2013-02-15 | Michael H. Rhee | CIA Whistleblower John Kiriakou | 13:00 | 2,095 | `2013-02-15-michael-h-rhee-cia-whistleblower-john-kiriakou-if-i-tortured` |
| 38 | written | 2017-05-17 | Democracy Now! | Blowing the Whistle / Why Trump Worries Him | 12:00 | 2,093 | `2017-05-17-democracy-now-blowing-the-whistle-why-trump-worries-him` |
| 39 | rejected (2,114-word clip of the 8,831-word 2025-10-24 India/Pakistan interview already cited by 7 articles; 84.9% shingle match, 10 of 12 sampled 12-word runs verbatim in the parent) | 2025-10-25 | ANI News | ANI News | 13:00 | 2,087 | `2025-10-25-ani-news-ani-news` |
| 40 | rejected (2,112-word clip of the 7,918-word 2022-04-24 Graham Elwood full interview already held; 92.4% shingle match, 11 of 12 sampled 12-word runs verbatim in the parent) | 2022-04-24 | Graham Elwood | Explains Assange Censorship | 12:00 | 2,084 | `2022-04-24-graham-elwood-explains-assange-censorship` |
| 41 | rejected (2,102-word clip of the 15,507-word 2025-02-19 Katie Halper episode already cited by 12 articles; 87.3% shingle match, 9 of 12 sampled 12-word runs verbatim in the parent) | 2025-02-25 | Katie Halper | \ | 11:00 | 2,070 | `2025-02-25-katie-halper-we-re-led-by-a-cabal-of-criminals` |
| 42 | rejected (2,093-word re-cut of the 17,762-word 2025-09-25 Joe Mkhitaryan interview already cited by 40 articles; 96.9% shingle match, 11 of 12 sampled 12-word runs verbatim in the parent) | 2025-09-29 | Venture Social | Venture Social | 12:00 | 2,066 | `2025-09-29-venture-social-venture-social` |
| 43 | rejected (2,068-word next-day re-cut of the 9,599-word 2020-11-23 Revolutionary Change episode already cited by 23 articles; 96.5% shingle match, 12 of 12 sampled 12-word runs verbatim in the parent) | 2020-11-24 | Revolutionary Change | Revolutionary Change | 12:00 | 2,041 | `2020-11-24-revolutionary-change-revolutionary-change-IozNdH` |
| 44 | rejected (2,064-word clip of the 42,210-word 2025-08-31 Dalton Fischer episode already cited by 78 articles; 93.4% shingle match, 10 of 12 sampled 12-word runs verbatim in the parent) | 2025-09-05 | Dalton Fischer Podcast | Dalton Fischer Podcast | 13:00 | 2,035 | `2025-09-05-dalton-fischer-podcast-dalton-fischer-podcast` |
| 45 | rejected (2,042-word syndicated re-cut of the 5,018-word 2025-12-03 Honesty Box interview already cited by 14 articles; 93.5% shingle match, 11 of 12 sampled 12-word runs verbatim in the parent) | 2026-03-17 | Breakpoint | Breakpoint | 11:00 | 2,017 | `2026-03-17-breakpoint-breakpoint` |
| 46 | rejected (2,004-word clip of the 12,078-word Kim Iversen interview held as 2026-04-02 and already cited by 8 articles; 89.9% shingle match, 10 of 12 sampled 12-word runs verbatim in the parent) | 2025-01-25 | Kim Iversen | Why Abolishing The CIA Won | 12:00 | 1,972 | `2025-01-25-kim-iversen-why-abolishing-the-cia-won-t-change-anything` |
| 47 | written | 2026-02-08 | Redacted | How Epstein Was Used by Mossad, CIA & MI6 | 16:00 | 1,939 | `2026-02-08-how-epstein-was-used-by-mossad-cia-mi6` |
| 48 | rejected (1,884-word re-cut of the 5,145-word 2024-06-13 HR News Channel interview already cited by 3 articles; 88.1% shingle match, 7 of 12 sampled 12-word runs verbatim in the parent) | 2025-11-25 | HR News Channel | HR News Channel | 11:00 | 1,855 | `2025-11-25-hr-news-channel-hr-news-channel` |
| 49 | rejected (solo host commentary reacting to a Kiriakou column on the Assange extradition; Kiriakou never speaks and the host's summary of his case misstates it -- says NBC for ABC and adds a lying-to-investigators charge that was never brought) | 2018-11-19 | Styxhexenhammer666 | Styxhexenhammer666 | 8:00 | 1,821 | `2018-11-19-styxhexenhammer666-styxhexenhammer666` |
| 50 | written | 2026-01-13 | TCM | TCM Originals | 10:00 | 1,770 | `2026-01-13-tcm-originals-tcm-originals` |
| 51 | written | 2017-08-17 | The Real News Network | CIA Torture Architects Settle With Victims to Avoid Trial | 10.6:00 | 1,768 | `2017-08-17-the-real-news-network-cia-torture-architects-settle-with-victims-to` |
| 52 | rejected (1,771-word clip of the 27,340-word 2023-11-19 Dalton Fischer part 2 already cited by 28 articles; 88.6% shingle match, 9 of 12 sampled 12-word runs verbatim in the parent) | 2023-12-18 | Dalton Fischer Podcast | Dalton Fischer Podcast | 11:00 | 1,742 | `2023-12-18-dalton-fischer-podcast-dalton-fischer-podcast` |
| 53 | rejected (1,716-word clip of the 9,658-word 2025-04-16 Dr. Phil episode already cited by 21 articles; 97.3% shingle match, 12 of 12 sampled 12-word runs verbatim in the parent) | 2025-04-27 | The Dr. Phil Podcast | “Your job is to break the law”John Kiriakou CIA Whistleblower | 10:00 | 1,679 | `2025-04-27-the-dr-phil-podcast-your-job-is-to-break-the-law-john-kiriakou-ci` |
| 54 | written | 2018-08-24 | The Real News Network | CIA Whistleblower: John Brennan Is Out For Himself, Not the | 9.3:00 | 1,651 | `2018-08-24-the-real-news-network-cia-whistleblower-john-brennan-is-out-for-him` |
| 55 | pending | 2026-02-02 | LBC | CIA whistleblower on Epstein Files: Why no one will be broug | 8.9:00 | 1,625 | `2026-02-02-lbc-cia-whistleblower-on-epstein-files-why-no-one` |
| 56 | pending | 2023-11-16 | Dalton Fischer Podcast | Dalton Fischer Podcast | 9:00 | 1,590 | `2023-11-16-dalton-fischer-podcast-dalton-fischer-podcast` |
| 57 | pending | 2026-02-27 | Podcast UFO Live Shows | Podcast UFO Live Shows | 10:00 | 1,584 | `2026-02-27-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 58 | pending | 2026-03-16 | Breakpoint | Breakpoint | 8:00 | 1,576 | `2026-03-16-breakpoint-breakpoint` |
| 59 | pending | 2025-12-02 | RTM News | RTM News | 9:00 | 1,560 | `2025-12-02-rtm-news-rtm-news` |
| 60 | pending | 2025-11-12 | The America Report | John Kiriakou Explains CIA | 9:00 | 1,550 | `2025-11-12-the-america-report-john-kiriakou-explains-cia-s-torture-program` |
| 61 | pending | 2021-09-29 | Free Assange | Free Assange | 10:00 | 1,501 | `2021-09-29-free-assange-free-assange` |
| 62 | pending | 2016-06-07 | CGTN America | The Heat: Crackdown on whistleblowers in the US Pt2 | 9.1:00 | 1,496 | `2016-06-07-cgtn-america-the-heat-crackdown-on-whistleblowers-in-the-u` |
| 63 | pending | 2025-04-22 | MintPress News | John Kiriakou: Exposing CIA Torture & U.S War Crimes / State | 9:00 | 1,487 | `2025-04-22-mintpress-news-john-kiriakou-exposing-cia-torture-u-s-war-cr` |
| 64 | pending | 2025-11-04 | Truth Hurts Show | Truth Hurts Show | 8:00 | 1,434 | `2025-11-04-truth-hurts-show-truth-hurts-show` |
| 65 | pending | 2024-09-07 | Dalton Fischer Podcast | Dalton Fischer Podcast | 8:00 | 1,429 | `2024-09-07-dalton-fischer-podcast-dalton-fischer-podcast` |
| 66 | pending | 2026-03-03 | Austin and Matt | Ex-CIA John Kiriakou: How \ | 8:00 | 1,409 | `2026-03-03-austin-and-matt-ex-cia-john-kiriakou-how-access-agents-infilt` |
| 67 | pending | 2025-02-06 | Redacted | The CIA is FINISHED as we know it Trump is burning it down w | 14:00 | 1,398 | `2025-02-06-redacted-the-cia-is-finished-as-we-know-it-trump-is-bu` |
| 68 | pending | 2021-10-07 | CovertAction Magazine | Silenced - John Kiriakou | 8:00 | 1,377 | `2021-10-07-covertaction-magazine-silenced-john-kiriakou` |
| 69 | pending | 2026-02-08 | Bidoun Waraq (بدون ورق) | كيف قمت بتجنيد رجل استخبارات شرق أوسطي؟ - جون كيرياكو (Arabi | 7:00 | 1,371 | `2026-02-08-arabi` |
| 70 | pending | 2026-01-20 | Podcast Digest | Podcast Digest | 9:00 | 1,357 | `2026-01-20-podcast-digest-podcast-digest` |
| 71 | pending | 2025-06-05 | Podcast Summaries | John Kiriakou / Tucker Carlson Podcast Summary | 9:00 | 1,279 | `2025-06-05-podcast-summaries-john-kiriakou-tucker-carlson-podcast-summary` |
| 72 | pending | 2026-03-17 | The Inquiry | The Inquiry | 8:00 | 1,276 | `2026-03-17-the-inquiry-the-inquiry` |
| 73 | pending | 2026-01-19 | Podcast Summaries | Podcast Summaries | 9:00 | 1,259 | `2026-01-19-podcast-summaries-podcast-summaries` |
| 74 | pending | 2025-05-15 | zouglagr | Ο πρώην πράκτορας της CIA Τζον Κυριάκου μιλά ανοιχτά για την | 11:00 | 1,203 | `2025-05-15-zouglagr-cia` |
| 75 | pending | 2019-05-13 | Jamarl Thomas | Jamarl Thomas | 8:00 | 1,186 | `2019-05-13-jamarl-thomas-jamarl-thomas` |
| 76 | pending | 2018-05-28 | Breaking News 24/7 | Breaking News 24/7 | 8:00 | 1,141 | `2018-05-28-breaking-news-24-7-breaking-news-24-7` |
| 77 | pending | 2012-01-25 | The Young Turks | CIA Agent Charged With Espionage Act by Justice Department | 6.5:00 | 1,113 | `2012-01-25-the-young-turks-cia-agent-charged-with-espionage-act-by-justi` |
| 78 | pending | 2023-05-30 | Global Times (环球时报) | 环球时报 Global Times | 8:00 | 1,087 | `2023-05-30-global-times-global-times` |
| 79 | pending | 2026-01-21 | Unfiltered With S.A.M. | JOHN KIRIAKOU: There Is NO Good Guy in U.S. Politics | 7:00 | 1,028 | `2026-01-21-unfiltered-with-s-a-m-john-kiriakou-there-is-no-good-guy-in-u-s-pol` |
| 80 | pending | 2025-05-15 | Christos Konstantinidis (Χρήστος Κωνσταντινίδης) | Συνέντευξη με τον πρώην αξιωματικό της CIA Τζων Κυριακού (Gr | 9:00 | 979 | `2025-05-15-cia-gr` |
| 81 | pending | 2014-04-24 | Democracy Now! | Silenced Film Explores the Human Toll of Obama | 5.5:00 | 958 | `2014-04-24-democracy-now-silenced-film-explores-the-human-toll-of-obam` |
| 82 | pending | 2019-11-15 | Fox Business | The whistleblower did not think this through: Former CIA whi | 6.4:00 | 886 | `2019-11-15-fox-business-the-whistleblower-did-not-think-this-through` |
| 83 | pending | 2013-05-31 | The Young Turks | CIA Whistleblower | 4.4:00 | 852 | `2013-05-31-the-young-turks-cia-whistleblower-s-tips-on-how-not-to-get-ki` |
| 84 | pending | 2025-07-09 | Middle East Eye | Jeffrey Epstein was accused of being | 4.5:00 | 834 | `2025-07-09-middle-east-eye-jeffrey-epstein-was-accused-of-being-an-acces` |
| 85 | pending | 2021-10-19 | CODEPINK | John Kiriakou – Never Forget: 9/11 and the 20 Year War on Te | 6:00 | 830 | `2021-10-19-codepink-john-kiriakou-never-forget-9-11-and-the-20-ye` |
| 86 | pending | 2021-03-26 | Revolutionary Change | Revolutionary Change | 10:00 | 801 | `2021-03-26-revolutionary-change-revolutionary-change` |
| 87 | pending | 2025-10-25 | Republic World | US Runs Pak | 7:00 | 797 | `2025-10-25-republic-world-us-runs-pak-s-nuclear-strength-ex-cia-john-ki` |
| 88 | pending | 2013-01-24 | Channel 4 News | CIA whistleblower faces jail term | 5.0:00 | 788 | `2013-01-24-channel-4-news-cia-whistleblower-faces-jail-term` |
| 89 | pending | 2018-03-14 | Democracy Now! | “She Tortured Just for the Sake of Torture”: CIA Whistleblow | 4.7:00 | 706 | `2018-03-14-democracy-now-she-tortured-just-for-the-sake-of-torture-cia` |
| 90 | pending | 2025-11-21 | TOI Bharat | — | 6:00 | 704 | `2025-11-21-toi-bharat-wiped-my-a-with-it-ex-cia-kiriakou-reveals-wh` |
| 91 | pending | 2019-12-21 | Fox News | Former CIA whistleblower on Durham probing Brennan | 3.6:00 | 610 | `2019-12-21-fox-news-former-cia-whistleblower-on-durham-probing-br` |
| 92 | pending | 2019-10-10 | Fox News | CIA whistleblower: This is an insult to real whistleblowers | 4.1:00 | 606 | `2019-10-10-fox-news-cia-whistleblower-this-is-an-insult-to-real-w` |
| 93 | pending | 2026-02-13 | Al Jazeera Arabic (الجزيرة) | ضابط استخبارات أمريكي سابق للجزيرة: إسرائيل حاولت تجنيدي - ج | 4:00 | 605 | `2026-02-13-aljazeera-arabic` |
| 94 | pending | 2025-10-25 | ANI News | Ex-CIA Agent Kiriakou Explains Why Pakistan Stands No Chance | 4:00 | 568 | `2025-10-25-ani-news-ex-cia-agent-kiriakou-explains-why-pakistan-s` |
| 95 | pending | 2018-05-11 | Democracy Now! | If Gina Haspel Is Confirmed at CIA, the U.S. Would Be Giving | 2.8:00 | 471 | `2018-05-11-democracy-now-if-gina-haspel-is-confirmed-at-cia-the-u-s-wo` |
| 96 | pending | 2026-02-13 | John Kiriakou | Mini Episode 5 Betrayal | 0:16:32 | 469 | `2026-02-13-dead-drop-mini-episode-5-betrayal` |
| 97 | pending | 2023-12-02 | Fox News | CIA whistleblower: | 3.6:00 | 447 | `2023-12-02-fox-news-cia-whistleblower-all-it-takes-is-a-signature` |
| 98 | pending | 2013-01-25 | Al Jazeera English | Ex-CIA agent heads to prison for torture leak | 2.5:00 | 440 | `2013-01-25-al-jazeera-english-ex-cia-agent-heads-to-prison-for-torture-leak` |
| 99 | pending | 2025-11-25 | Al Jazeera Arabic (الجزيرة) | ضابط سابق في الاستخبارات الأمريكية: إسرائيل طلبت من كل رئيس | 3:00 | 415 | `2025-11-25-aljazeera-arabic` |
| 100 | pending | 2025-05-17 | Nationalpost TV | Ελληνοαμερικανός πρώην πράκτορας CIA αποκαλύπτει - Αυτές οι | 3:00 | 377 | `2025-05-17-nationalpost-tv-cia` |
| 101 | pending | 2024-11-23 | Pentapostagma TV | Ελληνοαμερικανός πρώην πράκτορας της CIA: Κακώς στην Ελλάδα | 3:00 | 375 | `2024-11-23-pentapostagma-tv-cia` |
| 102 | pending | 2024-01-22 | Al Arabiya (العربية) | فضح جون كيرياكو أسرارا كبيرة عن المخابرات الأميركية وتحول لخ | 3:00 | 366 | `2024-01-22-alarabiya` |
| 103 | pending | 2025-02-22 | Katie Halper | F*** Joe Biden! - CIA Whistleblower John Kiriakou | 2:00 | 330 | `2025-02-22-katie-halper-f-joe-biden-cia-whistleblower-john-kiriakou` |
| 104 | pending | 2025-04-21 | MintPress News | Former CIA officer John Kiriakou reveals why he exposed the | 2:00 | 320 | `2025-04-21-mintpress-news-former-cia-officer-john-kiriakou-reveals-why` |
| 105 | pending | 2025-02-05 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou: Final | 2:00 | 310 | `2025-02-05-covertaction-magazine-former-cia-counter-terrorism-specialist-john` |
| 106 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou on Rub | 2:00 | 309 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john` |
| 107 | pending | 2025-02-25 | Katie Halper | Why CIA Whistleblower John Kiriakou Almost Took His Own Life | 1:00 | 300 | `2025-02-25-katie-halper-why-cia-whistleblower-john-kiriakou-almost-to` |
| 108 | pending | 2022-07-29 | CGTN America | Assange: political prisoner or criminal? | 2.0:00 | 298 | `2022-07-29-cgtn-america-assange-political-prisoner-or-criminal` |
| 109 | pending | 2013-01-26 | JewishNewsOne | Former CIA officer sentenced for leaks | 1.9:00 | 285 | `2013-01-26-jewishnewsone-former-cia-officer-sentenced-for-leaks` |
| 110 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou | 1:00 | 216 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john-fYN9zL` |
| 111 | pending | 2025-02-27 | Katie Halper | ‘I’d Like To Smack Mitch McConnell’s Turtle Face’ - CIA Whis | 1:00 | 177 | `2025-02-27-katie-halper-i-d-like-to-smack-mitch-mcconnell-s-turtle-fa` |
| 112 | pending | 2025-02-05 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou Talks | 1:00 | 154 | `2025-02-05-covertaction-magazine-former-cia-counter-terrorism-specialist-john-VtRxlx` |
| 113 | pending | 2025-07-09 | Piers Morgan Uncensored | Former CIA Intelligence John Kiriakou On Epstein Files Disap | 1:00 | 152 | `2025-07-09-piers-morgan-uncensored-former-cia-intelligence-john-kiriakou-on-epst` |
| 114 | pending | 2025-02-03 | CovertAction Magazine | John Kiriakou, Former CIA Counter Terrorism Specialist on Cy | 1:00 | 117 | `2025-02-03-covertaction-magazine-john-kiriakou-former-cia-counter-terrorism-sp` |
| 115 | pending | 2012-05-15 | Government Accountability Project | GAP | 1.0:00 | 103 | `2012-05-15-government-accountability-gap-s-jesselyn-radack-on-nsa-whistleblower-to` |
| 116 | pending | 2015-03-02 | Voices of Liberty | CIA Torture Whistleblower John Kiriakou, Part 9: How to Blow | 1:00 | 96 | `2015-03-02-voices-of-liberty-cia-torture-whistleblower-john-kiriakou-part-olK01D` |
| 117 | pending | 2025-02-24 | Katie Halper | Why Edward Snowden Is NOT A TRAITOR w/ CIA Whistleblower Joh | 2:00 | 96 | `2025-02-24-katie-halper-why-edward-snowden-is-not-a-traitor-w-cia-whi` |
| 118 | pending | 2023-11-22 | ProjectCensored | It | 1:00 | 94 | `2023-11-22-projectcensored-it-s-not-about-justice-john-kiriakou-on-his-e` |
| 119 | pending | 2023-01-07 | Real Progressives | The CIA Serves the Capital Order w/ John Kiriakou #shorts | 1:00 | 87 | `2023-01-07-real-progressives-the-cia-serves-the-capital-order-w-john-kiria` |
| 120 | pending | 2015-07-30 | AP Archive | US government leak crackdown snags ex-CIA officer | 1.4:00 | 83 | `2015-07-30-ap-archive-us-government-leak-crackdown-snags-ex-cia-off` |
| 121 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou on Tru | 1:00 | 78 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john-wh8Rwf` |

---

## Flagged low-value — 51 transcripts, 254,688 words

His own shows where he hosts others, clip formats, audiobook samples. The intake playbook
rejects these on discovery; these predate that filter or slipped through. Skim before spending
a run on them — but check rather than assume, a few are real interviews under a bad label.

| # | status | date | show | title | length | words | slug |
|---|---|---|---|---|---|---|---|
| 122 | pending | 2025-07-26 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 94:00 | 13,991 | `2025-07-26-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 123 | pending | 2025-09-08 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “France In Crisis” | 67:00 | 11,756 | `2025-09-08-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-fra-y1XO6M` |
| 124 | pending | 2025-09-22 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 67:00 | 11,018 | `2025-09-22-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-dSPyBa` |
| 125 | pending | 2025-12-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 73:00 | 10,727 | `2025-12-06-deprogram-ted-rall-deprogram-ted-rall` |
| 126 | pending | 2026-02-28 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 70:00 | 10,393 | `2026-02-28-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-Bg4Lki` |
| 127 | pending | 2026-01-13 | DeProgram Show with Ted Rall and Jamarl Thomas | The Fix Is In / DeProgram with Ted Rall and John Kiriakou | 57:00 | 10,105 | `2026-01-13-deprogram-show-with-ted-ra-the-fix-is-in-deprogram-with-ted-rall-and-joh-lg1k-9` |
| 128 | pending | 2026-03-04 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 10,104 | `2026-03-04-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 129 | pending | 2026-01-23 | DeProgram Show with Ted Rall and Jamarl Thomas | Club Med Gaza / DeProgram with Ted Rall and John Kiriakou | 59:00 | 10,047 | `2026-01-23-deprogram-show-with-ted-ra-club-med-gaza-deprogram-with-ted-rall-and-joh-0D-L8O` |
| 130 | pending | 2025-10-10 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,978 | `2025-10-10-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-UaGsDF` |
| 131 | pending | 2026-03-09 | DeProgram Show with Ted Rall and Jamarl Thomas | Ecocide in Iran / DeProgram with Ted Rall and John Kiriakou | 59:00 | 9,750 | `2026-03-09-deprogram-show-with-ted-ra-ecocide-in-iran-deprogram-with-ted-rall-and-j` |
| 132 | pending | 2025-10-31 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “Gaza-istan?” | 60:00 | 9,676 | `2025-10-31-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-gaz` |
| 133 | pending | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 56:00 | 9,554 | `2025-11-19-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-Cxd39y` |
| 134 | pending | 2025-10-23 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 9,306 | `2025-10-23-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 135 | rejected (93.3% duplicate of the 2025-11-19 DMZ America episode mined in its place) | 2025-11-18 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 57:00 | 9,169 | `2025-11-18-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 136 | pending | 2025-10-30 | DeProgram Show with Ted Rall and Jamarl Thomas | Deprogram with Ted Rall and John Kiriakou: “Hamas Has Won\ | 58:00 | 8,887 | `2025-10-30-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-ham` |
| 137 | pending | 2025-09-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 71:00 | 8,603 | `2025-09-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 138 | pending | 2025-10-21 | The Deep Focus Show | The Deep Focus Show | 52:00 | 8,470 | `2025-10-21-the-deep-focus-show-the-deep-focus-show` |
| 139 | pending | 2025-08-16 | The Deep Focus Show | The Call is to Liberate Palestine w/ Miko Peled | 44:00 | 7,746 | `2025-08-16-the-deep-focus-show-the-call-is-to-liberate-palestine-w-miko-pele` |
| 140 | pending | 2025-10-07 | The Deep Focus Show | The Deep Focus Show | 46:00 | 7,655 | `2025-10-07-the-deep-focus-show-the-deep-focus-show` |
| 141 | pending | 2025-12-27 | The Deep Focus Show | The Deep Focus Show | 50:00 | 7,399 | `2025-12-27-the-deep-focus-show-the-deep-focus-show` |
| 142 | pending | 2025-11-14 | The Deep Focus Show | Taxpayers Against Genocide w/ Seth Donnelly | 42:00 | 7,179 | `2025-11-14-the-deep-focus-show-taxpayers-against-genocide-w-seth-donnelly` |
| 143 | pending | 2026-03-06 | The Deep Focus Show | The Deep Focus Show | 52:00 | 7,125 | `2026-03-06-the-deep-focus-show-the-deep-focus-show` |
| 144 | rejected (second upload of the same Scott Horton interview mined as 2021-02-12-scott-horton-john-kiriakou-on-the-governments-dangerous-re; 81.8% shingle match) | 2021-02-24 | Scott Horton | Ep 5458 — The Dangerous Reaction | 33:00 | 5,721 | `2021-02-24-ep-5458-the-dangerous-reaction` |
| 145 | pending | 2025-11-25 | The Deep Focus Show | Complicity In Gaza | 50:00 | 4,946 | `2025-11-25-the-deep-focus-show-complicity-in-gaza-s-genocide-w-richard-falk` |
| 146 | pending | 2025-08-28 | yusefs report | clip (\ | 25:00 | 4,144 | `2025-08-28-yusefs-report-clip-scott-horton-x-kiriakou-destroy-dershowi` |
| 147 | pending | 2025-10-30 | Full Audiobook | Full Audiobook | 30:00 | 3,952 | `2025-10-30-full-audiobook-full-audiobook` |
| 148 | pending | 2026-02-26 | DeProgram Show with Ted Rall and Jamarl Thomas | SOTU: A Complete Disaster | 16:00 | 2,912 | `2026-02-26-deprogram-ted-rall-sotu-a-complete-disaster` |
| 149 | pending | 2025-04-27 | The Dr. Phil Podcast | short clip of the full Dr. Phil ep | 15:00 | 2,555 | `2025-04-27-the-dr-phil-podcast-short-clip-of-the-full-dr-phil-ep` |
| 150 | pending | 2026-02-18 | Viral Plug | John Kiriakou CIA Story Meme Compilation - PART 2 | 13:00 | 2,535 | `2026-02-18-viral-plug-john-kiriakou-cia-story-meme-compilation-part` |
| 151 | pending | 2026-02-21 | Viral Plug | John Kiriakou CIA Story Meme Compilation - PART 4 | 11:00 | 2,380 | `2026-02-21-viral-plug-john-kiriakou-cia-story-meme-compilation-part` |
| 152 | pending | 2026-02-27 | Viral Plug | John Kiriakou CIA Story Meme Compilation 7 | 10:00 | 2,150 | `2026-02-27-viral-plug-john-kiriakou-cia-story-meme-compilation-7` |
| 153 | pending | 2026-03-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 11:00 | 2,002 | `2026-03-11-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 154 | pending | 2026-02-25 | Viral Plug | John Kiriakou CIA Story Meme Compilation 6 | 10:00 | 1,886 | `2026-02-25-viral-plug-john-kiriakou-cia-story-meme-compilation-6` |
| 155 | pending | 2026-02-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 8:00 | 1,779 | `2026-02-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 156 | pending | 2026-02-11 | DeProgram Show with Ted Rall and Jamarl Thomas | Bad Bunny, Epstein Files, and more! | 10:00 | 1,761 | `2026-02-11-deprogram-ted-rall-bad-bunny-epstein-files-and-more` |
| 157 | pending | 2026-02-13 | DeProgram Show with Ted Rall and Jamarl Thomas | Pam Bondi | 8:00 | 1,498 | `2026-02-13-deprogram-ted-rall-pam-bondi-s-embarrassing-epstein-hearing` |
| 158 | pending | 2025-12-17 | DeProgram Show with Ted Rall and Jamarl Thomas | John Kiriakou on CIA Coup Tactics, Trump | 8:00 | 1,410 | `2025-12-17-deprogram-show-with-ted-ra-john-kiriakou-on-cia-coup-tactics-trump-s-wmd` |
| 159 | pending | 2026-03-01 | DeProgram Show with Ted Rall and Jamarl Thomas | Ted Rall & John Kiriakou React as Iran War Rages On | 8:00 | 1,320 | `2026-03-01-deprogram-show-with-ted-ra-ted-rall-john-kiriakou-react-as-iran-war-rage` |
| 160 | pending | 2026-01-04 | DeProgram Show with Ted Rall and Jamarl Thomas | On CIA Psychologists, Torture, Mamdani | 8:00 | 1,315 | `2026-01-04-deprogram-ted-rall-on-cia-psychologists-torture-mamdani` |
| 161 | pending | 2026-01-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 6:00 | 1,014 | `2026-01-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 162 | pending | 2025-06-15 | The Deep Focus Show | Israel Strikes Iran - John Kiriakou | 4:00 | 591 | `2025-06-15-the-deep-focus-show-israel-strikes-iran-john-kiriakou-s-insights` |
| 163 | pending | 2023-05-05 | CODEPINK | John Kiriakou on Daniel Ellsberg #shorts | 1:00 | 179 | `2023-05-05-codepink-john-kiriakou-on-daniel-ellsberg-shorts` |
| 164 | pending | 2025-07-30 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 77:00 | 0 | `2025-07-30-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 165 | pending | 2025-08-02 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 70:00 | 0 | `2025-08-02-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 166 | pending | 2025-09-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 65:00 | 0 | `2025-09-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 167 | rejected (same episode as the 2025-11-19 DMZ America record mined in its place; this file's transcript was swept into its .sponsors sidecar and the main file is empty) | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | Israel | 62:00 | 0 | `2025-11-19-deprogram-ted-rall-israel-s-discreet-ethnic-cleansing-of-gaza` |
| 168 | pending | 2025-11-20 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 0 | `2025-11-20-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 169 | pending | 2025-11-21 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 0 | `2025-11-21-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 170 | pending | 2026-02-25 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 59:00 | 0 | `2026-02-25-deprogram-ted-rall-deprogram-ted-rall` |
| 171 | pending | 2026-03-03 | DeProgram Show with Ted Rall and Jamarl Thomas | Regime Derange / DeProgram with Ted Rall and John Kiriakou | 60:00 | 0 | `2026-03-03-deprogram-show-with-ted-ra-regime-derange-deprogram-with-ted-rall-and-jo` |
| 172 | pending | 2026-03-12 | DeProgram Show with Ted Rall and Jamarl Thomas | A Super Dumb Mass Murder | 59:00 | 0 | `2026-03-12-deprogram-ted-rall-a-super-dumb-mass-murder` |
