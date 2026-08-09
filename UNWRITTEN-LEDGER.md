# Unwritten transcript ledger

Transcripts sitting in the corpus that **no article cites** — fetched, cleaned, never mined.
This is the work queue for the perpetual old-content routine.

- **215 unwritten** of 870 transcripts (657 written from)
- **752,607 transcript words** unread, ~273,455 of them in the main queue
- Sorted richest-first: most unwritten words per transcript read
- Regenerate with `node tools/build-unwritten-ledger.mjs` — hand-set statuses in the
  `status` column are preserved across regenerations

Status vocabulary: `pending` · `in-progress` · `written` · `rejected (reason)`.
A row disappears on its own once any article cites it, so `written` is belt-and-braces.

---

## Main queue — 140 transcripts, 273,455 words

| # | status | date | show | title | length | words | slug |
|---|---|---|---|---|---|---|---|
| 1 | rejected (host recap + unrelated guest interview; Kiriakou never speaks) | 2018-01-30 | Ian Discussions | Ian | 92:00 | 12,334 | `2018-01-30-ian-discussions-ian-s-discussions-with-john-kiriakou` |
| 2 | rejected (re-upload of the 2022-04-21 Lee Camp Moment of Clarity episode) | 2022-05-05 | Suzi 3D | CIA Whistleblower John Kiriakou Joins Lee Camp to talk Panqu | 55:00 | 9,268 | `2022-05-05-suzi-3d-cia-whistleblower-john-kiriakou-joins-lee-cam` |
| 3 | rejected (99.5% identical to the same-day Panquake upload of the O'Brien interview, and 95% to the already-cited 2022-04-24 Graham Elwood full interview) | 2022-05-05 | Suzi 3D | FULL INTERVIEW: John Kiriakou & Sean O | 45:00 | 7,871 | `2022-05-05-suzi-3d-full-interview-john-kiriakou-sean-o-brien-tal` |
| 4 | rejected (99.2% duplicate of 2025-04-23-dr-phil-podcast-secrets-lies-price-of-truth-part2, already cited by 16 articles) | 2025-05-01 | The Dr. Phil Podcast | likely = ingested aYK16WJ1WsU | 54:00 | 7,851 | `2025-05-01-the-dr-phil-podcast-likely-ingested-ayk16wj1wsu` |
| 5 | rejected (Spanish-dubbed re-presentation of the 2025-10-10 Joe Rogan interview, already cited by 26 articles; captions are a machine back-translation so no wording is Kiriakou's) | 2025-11-03 | HispaUnidad | HispaUnidad | 46:00 | 7,362 | `2025-11-03-hispaunidad-hispaunidad` |
| 6 | rejected (host-only episode; Kiriakou lost power in a storm and never appears) | 2021-09-02 | Garland Nixon | After Afghanistan | 34:00 | 6,705 | `2021-09-02-garland-nixon-after-afghanistan` |
| 7 | rejected (Susie Dawson fundraiser stream; Kiriakou is praised by other panellists but never speaks) | 2019-08-24 | Suzi 3D | Suzi 3D | 40:00 | 5,956 | `2019-08-24-suzi-3d-suzi-3d` |
| 8 | rejected (99.6% duplicate of the 2022-04-24 Graham Elwood full interview; the same content is already cited extensively from the 2022-05-05 Panquake copy) | 2022-04-22 | Graham Elwood | Kiriakou & Sean O | 33:00 | 5,900 | `2022-04-22-graham-elwood-kiriakou-sean-o-brien-explain-panquake` |
| 9 | rejected (film-studies episode with Olympia Kiriakou on Carole Lombard; John Kiriakou never appears) | 2021-10-12 | Foreign Correspondents: Deeper into Hitchcock | Episode 25: \ | 33:00 | 5,528 | `2021-10-12-foreign-correspondents-de-episode-25-mr-mrs-smith-1941-feat-olympia-kir` |
| 10 | rejected (two-host reaction breakdown of the 2025-10-10 Joe Rogan episode; 32.6% verbatim shingle overlap with that already-cited source and the rest is host monologue — Kiriakou appears only as replayed clips) | 2025-10-17 | Liberty Vault | Liberty Vault | 23:00 | 4,217 | `2025-10-17-liberty-vault-liberty-vault` |
| 11 | rejected (same interview as 2020-02-25-cafe-weltschmerz…, which was fully mined on 2026-08-08; identical English conversation, the Weltschmerz upload merely carries a Dutch-language intro in front of it) | 2020-02-25 | Potkaars podcast | London report on the Assange extradition hearing | 24:00 | 3,992 | `2020-02-25-london-report-on-the-assange-extradition-hear` |
| 12 | rejected (87.5% shingle match to 2026-01-19-diary-of-a-ceo-they-can-see-all-your-messages, already cited by 18 articles — a third-party re-upload of the Steven Bartlett interview, as the slug's own note suspected) | 2026-01-22 | The Honest Talk | credits \ | 20:00 | 3,566 | `2026-01-22-the-honest-talk-credits-steven-bartlett-likely-mislabeled-re` |
| 13 | rejected (hosts reading John Kiriakou's Consortium News column 'American Gulag' aloud on air; Kiriakou himself never speaks, so nothing in it is single-source canon) | 2022-11-07 | Indie News Network (INN) | Indie News Network (INN) | 24:00 | 3,560 | `2022-11-07-indie-news-network-inn-indie-news-network-inn` |
| 14 | rejected (same two-host reaction-breakdown format as the 10-17 upload; 34.0% verbatim shingle overlap with the already-cited 2025-10-10 Joe Rogan episode, remainder host monologue) | 2025-10-19 | Liberty Vault | Liberty Vault | 18:00 | 3,346 | `2025-10-19-liberty-vault-liberty-vault` |
| 15 | rejected (80.6% shingle match to 2020-11-24-revolutionary-change-revolutionary-change, same length and same conversation, already cited — a re-upload filed under a 2026 date) | 2026-04-10 | Revolutionary Change | Revolutionary Change | 18:00 | 3,303 | `2026-04-10-revolutionary-change-revolutionary-change` |
| 16 | rejected (94.8% shingle match to 2017-08-20-internet-party-internet-party, already cited by 3 articles — a re-upload of the same Internet Party appearance six days later) | 2017-08-26 | Internet Party | Internet Party | 22:00 | 3,286 | `2017-08-26-internet-party-internet-party` |
| 17 | written | 2018-08-07 | The Jimmy Dore Show | The Jimmy Dore Show | 17:00 | 3,178 | `2018-08-07-the-jimmy-dore-show-the-jimmy-dore-show` |
| 18 | written | 2015-09-23 | MintPress News | Former CIA Agent John Kiriakou Takes Us Inside The Saudi Ter | 19:00 | 3,114 | `2015-09-23-mintpress-news-former-cia-agent-john-kiriakou-takes-us-insid` |
| 19 | rejected (Panquake product-update livestream; Kiriakou appears only as a 60-second brand-ambassador intro and makes no substantive claim — the remaining 18 minutes are Suzie Dawson's build presentation and Sean O'Brien's dev update) | 2022-07-03 | Panquake / #TalkLiberation | Public Delivery Meeting #17 feat. Kiriakou, Suzie Dawson | 19:00 | 3,046 | `2022-07-03-panquake-lee-camp-public-delivery-meeting-17-feat-kiriakou-suzi` |
| 20 | rejected (re-upload of the 2013-01-30 Democracy Now sentencing segment — opens 'I'm Amy Goodman'; 86.4% shingle match to the terrorpedia aggregator copy already cited by 20 articles) | 2026-03-12 | Nietzsche | John Kiriakou Sentenced to prison | 16:00 | 2,927 | `2026-03-12-nietzsche-john-kiriakou-sentenced-to-prison` |
| 21 | in-progress | 2023-04-24 | Reality Asserts Itself (Paul Jay) | I Believed America Could Do No Wrong (RAI) | 16:00 | 2,917 | `2023-04-24-real-news-reality-asserts-itself-i-believed-america-could-do-no-wrong-rai` |
| 22 | written | 2015-05-08 | The Real News Network | They Won | 15:00 | 2,869 | `2015-05-08-the-real-news-network-they-won-t-shut-me-up-john-kiriakou-on-rai-10` |
| 23 | rejected (81.4% duplicate of the 2015-05-08 Real News 'Reality Asserts Itself' original, which was mined in its place on this run) | 2023-04-25 | Reality Asserts Itself (Paul Jay) | Real News — Reality Asserts Itself | 15:00 | 2,866 | `2023-04-25-real-news-reality-asserts-itself-real-news-reality-asserts-itself-FgD6TE` |
| 24 | in-progress | 2013-01-30 | Democracy Now! | Sentenced to Prison While Torturers Walk Free | 17:00 | 2,856 | `2013-01-30-democracy-now-sentenced-to-prison-while-torturers-walk-free` |
| 25 | rejected (84.5% shingle match to 2025-10-24-pakistan-nuclear-secrets-cia-lies, already cited by 7 articles — a next-day re-cut of the same India/Pakistan interview) | 2025-10-25 | ANI News | Ex-CIA Agent Kiriakou: The U.S. Was Waiting for India to Att | 18:00 | 2,760 | `2025-10-25-ani-news-ex-cia-agent-kiriakou-the-u-s-was-waiting-for` |
| 26 | in-progress | 2025-06-01 | Stephen Gardner | title doesn | 16:00 | 2,680 | `2025-06-01-stephen-gardner-title-doesn-t-name-john-confirm-presence` |
| 27 | in-progress | 2025-10-24 | The Jimmy Dore Show | The Jimmy Dore Show | 13:00 | 2,613 | `2025-10-24-the-jimmy-dore-show-the-jimmy-dore-show` |
| 28 | rejected (96.9% shingle match to 2025-07-03-spy-diaries-jailed-for-exposing-the-cia, already cited) | 2025-12-23 | TCM | TCM TV | 16:00 | 2,593 | `2025-12-23-tcm-tv-tcm-tv` |
| 29 | rejected (92.1% duplicate of the 2019-08-08 David Gornoski interview, which was mined in its place on this run) | 2022-04-07 | David Gornoski | Explores Life as a Spy (probe dup) | 14:00 | 2,525 | `2022-04-07-david-gornoski-explores-life-as-a-spy-probe-dup` |
| 30 | written | 2019-08-08 | David Gornoski | David Gornoski Archives | 14:00 | 2,522 | `2019-08-08-david-gornoski-archives-david-gornoski-archives-W6OZ4C` |
| 31 | rejected (two-host reaction breakdown replaying the cited 2026-01-19 Diary of a CEO interview — 36.2% verbatim overlap with that source and the remainder host monologue; the '95% of our defense secrets' and Hungarian-pager-company passages verified verbatim in the parent) | 2026-01-25 | Liberty Vault | Liberty Vault | 14:00 | 2,522 | `2026-01-25-liberty-vault-liberty-vault` |
| 32 | in-progress | 2017-08-08 | Democracy Now! | Jeff Sessions Is Extending Obama | 15:00 | 2,520 | `2017-08-08-democracy-now-jeff-sessions-is-extending-obama-s-war-on-lea` |
| 33 | in-progress | 2025-12-15 | Jackson Hinkle Official | EX-CIA JOHN KIRIAKOU: VENEZUELA WAR IS ABOUT CHINA | 14:00 | 2,513 | `2025-12-15-jackson-hinkle-official-an-ex-cia-john-kiriakou-venezuela-war-is-about-c` |
| 34 | rejected (91.5% shingle match to the terrorpedia aggregator copy of the same Democracy Now segment, already cited by 20 articles) | 2013-01-30 | Democracy Now! | John Brennan a \ | 17:00 | 2,496 | `2013-01-30-democracy-now-john-brennan-a-terrible-choice-to-lead-the-ci` |
| 35 | rejected (96.2% shingle match to 2025-08-31-dalton-fischer-mossad-blackwater, already cited by 76 articles) | 2025-09-02 | Dalton Fischer Podcast | Dalton Fischer Podcast | 13:00 | 2,400 | `2025-09-02-dalton-fischer-podcast-dalton-fischer-podcast` |
| 36 | written | 2019-06-29 | The Yellow Brick Road | What Will Happen to Julian Assange | 15:00 | 2,382 | `2019-06-29-what-will-happen-to-julian-assange` |
| 37 | pending | 2019-09-06 | Graham Elwood | Uncovered US Torture Program | 14:00 | 2,367 | `2019-09-06-graham-elwood-uncovered-us-torture-program` |
| 38 | pending | 2015-02-10 | Alittlepart Ofme (CallMeCookie) | Alittlepart Ofme (CallMeCo | 13:00 | 2,290 | `2015-02-10-alittlepart-ofme-callmeco-alittlepart-ofme-callmeco` |
| 39 | pending | 2025-02-22 | Katie Halper | \ | 12:00 | 2,270 | `2025-02-22-katie-halper-rudy-giuliani-tried-to-shake-me-down-for-2m` |
| 40 | pending | 2025-09-03 | Dalton Fischer Podcast | Dalton Fischer Podcast | 14:00 | 2,268 | `2025-09-03-dalton-fischer-podcast-dalton-fischer-podcast` |
| 41 | pending | 2026-02-15 | London Real | London Real | 12:00 | 2,249 | `2026-02-15-london-real-london-real` |
| 42 | pending | 2026-04-06 | Due Dissidence | Kiriakou: Israelis Asked EVERY PRESIDENT To ATTACK Iran! - w | 12:00 | 2,247 | `2026-04-06-due-dissidence-kiriakou-israelis-asked-every-president-to-at` |
| 43 | pending | 2023-01-16 | The Canada Files | Political Misfits — DC Witte, Kiriakou & August | 20:00 | 2,246 | `2023-01-16-the-canada-files-political-misfits-dc-witte-kiriakou-august` |
| 44 | pending | 2025-10-24 | Podcast UFO Live Shows | Podcast UFO Live Shows | 13:00 | 2,211 | `2025-10-24-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 45 | pending | 2025-09-04 | Dalton Fischer Podcast | Dalton Fischer Podcast | 12:00 | 2,199 | `2025-09-04-dalton-fischer-podcast-dalton-fischer-podcast` |
| 46 | pending | 2025-09-12 | Podcast UFO Live Shows | Podcast UFO Live Shows | 12:00 | 2,198 | `2025-09-12-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 47 | pending | 2025-12-12 | Dialogue Works | US lacks long-term Middle East strategy | 13:00 | 2,130 | `2025-12-12-dialogue-works-highlights-us-lacks-long-term-middle-east-strategy` |
| 48 | pending | 2025-09-06 | Dalton Fischer Podcast | Dalton Fischer Podcast | 12:00 | 2,104 | `2025-09-06-dalton-fischer-podcast-dalton-fischer-podcast` |
| 49 | pending | 2013-02-15 | Michael H. Rhee | CIA Whistleblower John Kiriakou | 13:00 | 2,095 | `2013-02-15-michael-h-rhee-cia-whistleblower-john-kiriakou-if-i-tortured` |
| 50 | pending | 2017-05-17 | Democracy Now! | Blowing the Whistle / Why Trump Worries Him | 12:00 | 2,093 | `2017-05-17-democracy-now-blowing-the-whistle-why-trump-worries-him` |
| 51 | pending | 2025-10-25 | ANI News | ANI News | 13:00 | 2,087 | `2025-10-25-ani-news-ani-news` |
| 52 | pending | 2022-04-24 | Graham Elwood | Explains Assange Censorship | 12:00 | 2,084 | `2022-04-24-graham-elwood-explains-assange-censorship` |
| 53 | pending | 2025-02-25 | Katie Halper | \ | 11:00 | 2,070 | `2025-02-25-katie-halper-we-re-led-by-a-cabal-of-criminals` |
| 54 | pending | 2025-09-29 | Venture Social | Venture Social | 12:00 | 2,066 | `2025-09-29-venture-social-venture-social` |
| 55 | pending | 2020-11-24 | Revolutionary Change | Revolutionary Change | 12:00 | 2,041 | `2020-11-24-revolutionary-change-revolutionary-change-IozNdH` |
| 56 | pending | 2026-04-03 | Unfiltered With S.A.M. | Kiriakou: Washington Has No Say in This War | 12:00 | 2,036 | `2026-04-03-unfiltered-with-s-a-m-kiriakou-washington-has-no-say-in-this-war` |
| 57 | pending | 2025-09-05 | Dalton Fischer Podcast | Dalton Fischer Podcast | 13:00 | 2,035 | `2025-09-05-dalton-fischer-podcast-dalton-fischer-podcast` |
| 58 | pending | 2026-03-17 | Breakpoint | Breakpoint | 11:00 | 2,017 | `2026-03-17-breakpoint-breakpoint` |
| 59 | pending | 2025-09-01 | Dalton Fischer Podcast | Dalton Fischer Podcast | 11:00 | 2,011 | `2025-09-01-dalton-fischer-podcast-dalton-fischer-podcast` |
| 60 | pending | 2025-01-25 | Kim Iversen | Why Abolishing The CIA Won | 12:00 | 1,972 | `2025-01-25-kim-iversen-why-abolishing-the-cia-won-t-change-anything` |
| 61 | pending | 2026-02-08 | Redacted | How Epstein Was Used by Mossad, CIA & MI6 | 16:00 | 1,939 | `2026-02-08-how-epstein-was-used-by-mossad-cia-mi6` |
| 62 | pending | 2026-04-17 | Hang Out with Sean Hannity | Hang Out with Sean Hannity | 9:00 | 1,864 | `2026-04-17-hang-out-with-sean-hannity-hang-out-with-sean-hannity` |
| 63 | pending | 2025-11-25 | HR News Channel | HR News Channel | 11:00 | 1,855 | `2025-11-25-hr-news-channel-hr-news-channel` |
| 64 | pending | 2018-11-19 | Styxhexenhammer666 | Styxhexenhammer666 | 8:00 | 1,821 | `2018-11-19-styxhexenhammer666-styxhexenhammer666` |
| 65 | pending | 2026-03-31 | Unfiltered With S.A.M. | JOHN KIRIAKOU: Israel’s “Samson Option” Is Real | 12:00 | 1,809 | `2026-03-31-unfiltered-with-s-a-m-john-kiriakou-israel-s-samson-option-is-real` |
| 66 | pending | 2026-01-13 | TCM | TCM Originals | 10:00 | 1,770 | `2026-01-13-tcm-originals-tcm-originals` |
| 67 | pending | 2017-08-17 | The Real News Network | CIA Torture Architects Settle With Victims to Avoid Trial | 10.6:00 | 1,768 | `2017-08-17-the-real-news-network-cia-torture-architects-settle-with-victims-to` |
| 68 | pending | 2023-12-18 | Dalton Fischer Podcast | Dalton Fischer Podcast | 11:00 | 1,742 | `2023-12-18-dalton-fischer-podcast-dalton-fischer-podcast` |
| 69 | pending | 2025-04-27 | The Dr. Phil Podcast | “Your job is to break the law”John Kiriakou CIA Whistleblower | 10:00 | 1,679 | `2025-04-27-the-dr-phil-podcast-your-job-is-to-break-the-law-john-kiriakou-ci` |
| 70 | pending | 2018-08-24 | The Real News Network | CIA Whistleblower: John Brennan Is Out For Himself, Not the | 9.3:00 | 1,651 | `2018-08-24-the-real-news-network-cia-whistleblower-john-brennan-is-out-for-him` |
| 71 | pending | 2026-04-03 | The Megyn Kelly Show | Megyn Kelly | 9:00 | 1,650 | `2026-04-03-megyn-kelly-megyn-kelly` |
| 72 | pending | 2026-02-02 | LBC | CIA whistleblower on Epstein Files: Why no one will be broug | 8.9:00 | 1,625 | `2026-02-02-lbc-cia-whistleblower-on-epstein-files-why-no-one` |
| 73 | pending | 2023-11-16 | Dalton Fischer Podcast | Dalton Fischer Podcast | 9:00 | 1,590 | `2023-11-16-dalton-fischer-podcast-dalton-fischer-podcast` |
| 74 | pending | 2026-02-27 | Podcast UFO Live Shows | Podcast UFO Live Shows | 10:00 | 1,584 | `2026-02-27-podcast-ufo-live-shows-podcast-ufo-live-shows` |
| 75 | pending | 2026-03-16 | Breakpoint | Breakpoint | 8:00 | 1,576 | `2026-03-16-breakpoint-breakpoint` |
| 76 | pending | 2025-12-02 | RTM News | RTM News | 9:00 | 1,560 | `2025-12-02-rtm-news-rtm-news` |
| 77 | pending | 2025-11-12 | The America Report | John Kiriakou Explains CIA | 9:00 | 1,550 | `2025-11-12-the-america-report-john-kiriakou-explains-cia-s-torture-program` |
| 78 | pending | 2021-09-29 | Free Assange | Free Assange | 10:00 | 1,501 | `2021-09-29-free-assange-free-assange` |
| 79 | pending | 2016-06-07 | CGTN America | The Heat: Crackdown on whistleblowers in the US Pt2 | 9.1:00 | 1,496 | `2016-06-07-cgtn-america-the-heat-crackdown-on-whistleblowers-in-the-u` |
| 80 | pending | 2025-04-22 | MintPress News | John Kiriakou: Exposing CIA Torture & U.S War Crimes / State | 9:00 | 1,487 | `2025-04-22-mintpress-news-john-kiriakou-exposing-cia-torture-u-s-war-cr` |
| 81 | pending | 2025-11-04 | Truth Hurts Show | Truth Hurts Show | 8:00 | 1,434 | `2025-11-04-truth-hurts-show-truth-hurts-show` |
| 82 | pending | 2024-09-07 | Dalton Fischer Podcast | Dalton Fischer Podcast | 8:00 | 1,429 | `2024-09-07-dalton-fischer-podcast-dalton-fischer-podcast` |
| 83 | pending | 2026-03-03 | Austin and Matt | Ex-CIA John Kiriakou: How \ | 8:00 | 1,409 | `2026-03-03-austin-and-matt-ex-cia-john-kiriakou-how-access-agents-infilt` |
| 84 | pending | 2025-02-06 | Redacted | The CIA is FINISHED as we know it Trump is burning it down w | 14:00 | 1,398 | `2025-02-06-redacted-the-cia-is-finished-as-we-know-it-trump-is-bu` |
| 85 | pending | 2021-10-07 | CovertAction Magazine | Silenced - John Kiriakou | 8:00 | 1,377 | `2021-10-07-covertaction-magazine-silenced-john-kiriakou` |
| 86 | pending | 2026-02-08 | Bidoun Waraq (بدون ورق) | كيف قمت بتجنيد رجل استخبارات شرق أوسطي؟ - جون كيرياكو (Arabi | 7:00 | 1,371 | `2026-02-08-arabi` |
| 87 | pending | 2026-01-20 | Podcast Digest | Podcast Digest | 9:00 | 1,357 | `2026-01-20-podcast-digest-podcast-digest` |
| 88 | pending | 2025-06-05 | Podcast Summaries | John Kiriakou / Tucker Carlson Podcast Summary | 9:00 | 1,279 | `2025-06-05-podcast-summaries-john-kiriakou-tucker-carlson-podcast-summary` |
| 89 | pending | 2026-03-17 | The Inquiry | The Inquiry | 8:00 | 1,276 | `2026-03-17-the-inquiry-the-inquiry` |
| 90 | pending | 2026-01-19 | Podcast Summaries | Podcast Summaries | 9:00 | 1,259 | `2026-01-19-podcast-summaries-podcast-summaries` |
| 91 | pending | 2017-05-17 | Democracy Now! | Democracy Now! | 8:00 | 1,238 | `2017-05-17-democracy-now-democracy-now` |
| 92 | pending | 2025-05-15 | zouglagr | Ο πρώην πράκτορας της CIA Τζον Κυριάκου μιλά ανοιχτά για την | 11:00 | 1,203 | `2025-05-15-zouglagr-cia` |
| 93 | pending | 2019-05-13 | Jamarl Thomas | Jamarl Thomas | 8:00 | 1,186 | `2019-05-13-jamarl-thomas-jamarl-thomas` |
| 94 | pending | 2018-05-28 | Breaking News 24/7 | Breaking News 24/7 | 8:00 | 1,141 | `2018-05-28-breaking-news-24-7-breaking-news-24-7` |
| 95 | pending | 2012-01-25 | The Young Turks | CIA Agent Charged With Espionage Act by Justice Department | 6.5:00 | 1,113 | `2012-01-25-the-young-turks-cia-agent-charged-with-espionage-act-by-justi` |
| 96 | pending | 2023-05-30 | Global Times (环球时报) | 环球时报 Global Times | 8:00 | 1,087 | `2023-05-30-global-times-global-times` |
| 97 | pending | 2026-01-21 | Unfiltered With S.A.M. | JOHN KIRIAKOU: There Is NO Good Guy in U.S. Politics | 7:00 | 1,028 | `2026-01-21-unfiltered-with-s-a-m-john-kiriakou-there-is-no-good-guy-in-u-s-pol` |
| 98 | pending | 2025-05-15 | Christos Konstantinidis (Χρήστος Κωνσταντινίδης) | Συνέντευξη με τον πρώην αξιωματικό της CIA Τζων Κυριακού (Gr | 9:00 | 979 | `2025-05-15-cia-gr` |
| 99 | pending | 2014-04-24 | Democracy Now! | Silenced Film Explores the Human Toll of Obama | 5.5:00 | 958 | `2014-04-24-democracy-now-silenced-film-explores-the-human-toll-of-obam` |
| 100 | pending | 2019-11-15 | Fox Business | The whistleblower did not think this through: Former CIA whi | 6.4:00 | 886 | `2019-11-15-fox-business-the-whistleblower-did-not-think-this-through` |
| 101 | pending | 2013-05-31 | The Young Turks | CIA Whistleblower | 4.4:00 | 852 | `2013-05-31-the-young-turks-cia-whistleblower-s-tips-on-how-not-to-get-ki` |
| 102 | pending | 2025-07-09 | Middle East Eye | Jeffrey Epstein was accused of being | 4.5:00 | 834 | `2025-07-09-middle-east-eye-jeffrey-epstein-was-accused-of-being-an-acces` |
| 103 | pending | 2021-10-19 | CODEPINK | John Kiriakou – Never Forget: 9/11 and the 20 Year War on Te | 6:00 | 830 | `2021-10-19-codepink-john-kiriakou-never-forget-9-11-and-the-20-ye` |
| 104 | pending | 2021-03-26 | Revolutionary Change | Revolutionary Change | 10:00 | 801 | `2021-03-26-revolutionary-change-revolutionary-change` |
| 105 | pending | 2025-10-25 | Republic World | US Runs Pak | 7:00 | 797 | `2025-10-25-republic-world-us-runs-pak-s-nuclear-strength-ex-cia-john-ki` |
| 106 | pending | 2013-01-24 | Channel 4 News | CIA whistleblower faces jail term | 5.0:00 | 788 | `2013-01-24-channel-4-news-cia-whistleblower-faces-jail-term` |
| 107 | pending | 2018-03-14 | Democracy Now! | “She Tortured Just for the Sake of Torture”: CIA Whistleblow | 4.7:00 | 706 | `2018-03-14-democracy-now-she-tortured-just-for-the-sake-of-torture-cia` |
| 108 | pending | 2025-11-21 | TOI Bharat | — | 6:00 | 704 | `2025-11-21-toi-bharat-wiped-my-a-with-it-ex-cia-kiriakou-reveals-wh` |
| 109 | pending | 2019-12-21 | Fox News | Former CIA whistleblower on Durham probing Brennan | 3.6:00 | 610 | `2019-12-21-fox-news-former-cia-whistleblower-on-durham-probing-br` |
| 110 | pending | 2019-10-10 | Fox News | CIA whistleblower: This is an insult to real whistleblowers | 4.1:00 | 606 | `2019-10-10-fox-news-cia-whistleblower-this-is-an-insult-to-real-w` |
| 111 | pending | 2026-02-13 | Al Jazeera Arabic (الجزيرة) | ضابط استخبارات أمريكي سابق للجزيرة: إسرائيل حاولت تجنيدي - ج | 4:00 | 605 | `2026-02-13-aljazeera-arabic` |
| 112 | pending | 2025-10-25 | ANI News | Ex-CIA Agent Kiriakou Explains Why Pakistan Stands No Chance | 4:00 | 568 | `2025-10-25-ani-news-ex-cia-agent-kiriakou-explains-why-pakistan-s` |
| 113 | pending | 2018-05-11 | Democracy Now! | If Gina Haspel Is Confirmed at CIA, the U.S. Would Be Giving | 2.8:00 | 471 | `2018-05-11-democracy-now-if-gina-haspel-is-confirmed-at-cia-the-u-s-wo` |
| 114 | pending | 2026-02-13 | John Kiriakou | Mini Episode 5 Betrayal | 0:16:32 | 469 | `2026-02-13-dead-drop-mini-episode-5-betrayal` |
| 115 | pending | 2023-12-02 | Fox News | CIA whistleblower: | 3.6:00 | 447 | `2023-12-02-fox-news-cia-whistleblower-all-it-takes-is-a-signature` |
| 116 | pending | 2013-01-25 | Al Jazeera English | Ex-CIA agent heads to prison for torture leak | 2.5:00 | 440 | `2013-01-25-al-jazeera-english-ex-cia-agent-heads-to-prison-for-torture-leak` |
| 117 | pending | 2025-11-25 | Al Jazeera Arabic (الجزيرة) | ضابط سابق في الاستخبارات الأمريكية: إسرائيل طلبت من كل رئيس | 3:00 | 415 | `2025-11-25-aljazeera-arabic` |
| 118 | pending | 2025-05-17 | Nationalpost TV | Ελληνοαμερικανός πρώην πράκτορας CIA αποκαλύπτει - Αυτές οι | 3:00 | 377 | `2025-05-17-nationalpost-tv-cia` |
| 119 | pending | 2024-11-23 | Pentapostagma TV | Ελληνοαμερικανός πρώην πράκτορας της CIA: Κακώς στην Ελλάδα | 3:00 | 375 | `2024-11-23-pentapostagma-tv-cia` |
| 120 | pending | 2024-01-22 | Al Arabiya (العربية) | فضح جون كيرياكو أسرارا كبيرة عن المخابرات الأميركية وتحول لخ | 3:00 | 366 | `2024-01-22-alarabiya` |
| 121 | pending | 2025-02-22 | Katie Halper | F*** Joe Biden! - CIA Whistleblower John Kiriakou | 2:00 | 330 | `2025-02-22-katie-halper-f-joe-biden-cia-whistleblower-john-kiriakou` |
| 122 | pending | 2025-04-21 | MintPress News | Former CIA officer John Kiriakou reveals why he exposed the | 2:00 | 320 | `2025-04-21-mintpress-news-former-cia-officer-john-kiriakou-reveals-why` |
| 123 | pending | 2025-02-05 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou: Final | 2:00 | 310 | `2025-02-05-covertaction-magazine-former-cia-counter-terrorism-specialist-john` |
| 124 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou on Rub | 2:00 | 309 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john` |
| 125 | pending | 2025-02-25 | Katie Halper | Why CIA Whistleblower John Kiriakou Almost Took His Own Life | 1:00 | 300 | `2025-02-25-katie-halper-why-cia-whistleblower-john-kiriakou-almost-to` |
| 126 | pending | 2022-07-29 | CGTN America | Assange: political prisoner or criminal? | 2.0:00 | 298 | `2022-07-29-cgtn-america-assange-political-prisoner-or-criminal` |
| 127 | pending | 2013-01-26 | JewishNewsOne | Former CIA officer sentenced for leaks | 1.9:00 | 285 | `2013-01-26-jewishnewsone-former-cia-officer-sentenced-for-leaks` |
| 128 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou | 1:00 | 216 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john-fYN9zL` |
| 129 | pending | 2025-02-27 | Katie Halper | ‘I’d Like To Smack Mitch McConnell’s Turtle Face’ - CIA Whis | 1:00 | 177 | `2025-02-27-katie-halper-i-d-like-to-smack-mitch-mcconnell-s-turtle-fa` |
| 130 | pending | 2025-02-05 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou Talks | 1:00 | 154 | `2025-02-05-covertaction-magazine-former-cia-counter-terrorism-specialist-john-VtRxlx` |
| 131 | pending | 2025-07-09 | Piers Morgan Uncensored | Former CIA Intelligence John Kiriakou On Epstein Files Disap | 1:00 | 152 | `2025-07-09-piers-morgan-uncensored-former-cia-intelligence-john-kiriakou-on-epst` |
| 132 | pending | 2026-04-16 | Fox News | CIA whistleblower on his life of espionage | 1.1:00 | 134 | `2026-04-16-fox-news-cia-whistleblower-on-his-life-of-espionage` |
| 133 | pending | 2025-02-03 | CovertAction Magazine | John Kiriakou, Former CIA Counter Terrorism Specialist on Cy | 1:00 | 117 | `2025-02-03-covertaction-magazine-john-kiriakou-former-cia-counter-terrorism-sp` |
| 134 | pending | 2012-05-15 | Government Accountability Project | GAP | 1.0:00 | 103 | `2012-05-15-government-accountability-gap-s-jesselyn-radack-on-nsa-whistleblower-to` |
| 135 | pending | 2015-03-02 | Voices of Liberty | CIA Torture Whistleblower John Kiriakou, Part 9: How to Blow | 1:00 | 96 | `2015-03-02-voices-of-liberty-cia-torture-whistleblower-john-kiriakou-part-olK01D` |
| 136 | pending | 2025-02-24 | Katie Halper | Why Edward Snowden Is NOT A TRAITOR w/ CIA Whistleblower Joh | 2:00 | 96 | `2025-02-24-katie-halper-why-edward-snowden-is-not-a-traitor-w-cia-whi` |
| 137 | pending | 2023-11-22 | ProjectCensored | It | 1:00 | 94 | `2023-11-22-projectcensored-it-s-not-about-justice-john-kiriakou-on-his-e` |
| 138 | pending | 2023-01-07 | Real Progressives | The CIA Serves the Capital Order w/ John Kiriakou #shorts | 1:00 | 87 | `2023-01-07-real-progressives-the-cia-serves-the-capital-order-w-john-kiria` |
| 139 | pending | 2015-07-30 | AP Archive | US government leak crackdown snags ex-CIA officer | 1.4:00 | 83 | `2015-07-30-ap-archive-us-government-leak-crackdown-snags-ex-cia-off` |
| 140 | pending | 2025-02-06 | CovertAction Magazine | Former CIA Counter Terrorism Specialist John Kiriakou on Tru | 1:00 | 78 | `2025-02-06-covertaction-magazine-former-cia-counter-terrorism-specialist-john-wh8Rwf` |

---

## Flagged low-value — 75 transcripts, 479,152 words

His own shows where he hosts others, clip formats, audiobook samples. The intake playbook
rejects these on discovery; these predate that filter or slipped through. Skim before spending
a run on them — but check rather than assume, a few are real interviews under a bad label.

| # | status | date | show | title | length | words | slug |
|---|---|---|---|---|---|---|---|
| 141 | pending | 2025-07-26 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 94:00 | 13,991 | `2025-07-26-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 142 | pending | 2025-08-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 73:00 | 13,051 | `2025-08-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-LnuGCF` |
| 143 | pending | 2025-08-28 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 69:00 | 12,189 | `2025-08-28-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 144 | pending | 2026-03-01 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 68:00 | 12,053 | `2026-03-01-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 145 | pending | 2025-09-08 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “France In Crisis” | 76:00 | 11,914 | `2025-09-08-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-fra` |
| 146 | pending | 2025-09-08 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “France In Crisis” | 67:00 | 11,756 | `2025-09-08-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-fra-y1XO6M` |
| 147 | pending | 2025-08-21 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 68:00 | 11,587 | `2025-08-21-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 148 | pending | 2025-08-14 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 68:00 | 11,520 | `2025-08-14-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 149 | pending | 2025-09-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 66:00 | 11,269 | `2025-09-11-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 150 | pending | 2025-09-22 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 67:00 | 11,018 | `2025-09-22-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-dSPyBa` |
| 151 | pending | 2025-12-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 73:00 | 10,727 | `2025-12-06-deprogram-ted-rall-deprogram-ted-rall` |
| 152 | pending | 2026-01-30 | DeProgram Show with Ted Rall and Jamarl Thomas | Is Trump Bidening Out? / DeProgram with Ted Rall and John Kiriakou | 3428 | 10,652 | `2026-01-30-deprogram-show-with-is-trump-bidening-out-deprogram-with-ted` |
| 153 | pending | 2025-07-29 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 74:00 | 10,430 | `2025-07-29-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 154 | pending | 2026-02-28 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 70:00 | 10,393 | `2026-02-28-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-Bg4Lki` |
| 155 | pending | 2025-11-10 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 58:00 | 10,107 | `2025-11-10-deprogram-ted-rall-deprogram-ted-rall` |
| 156 | pending | 2026-01-13 | DeProgram Show with Ted Rall and Jamarl Thomas | The Fix Is In / DeProgram with Ted Rall and John Kiriakou | 57:00 | 10,105 | `2026-01-13-deprogram-show-with-ted-ra-the-fix-is-in-deprogram-with-ted-rall-and-joh-lg1k-9` |
| 157 | pending | 2026-03-04 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 10,104 | `2026-03-04-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 158 | pending | 2026-01-23 | DeProgram Show with Ted Rall and Jamarl Thomas | Club Med Gaza / DeProgram with Ted Rall and John Kiriakou | 59:00 | 10,047 | `2026-01-23-deprogram-show-with-ted-ra-club-med-gaza-deprogram-with-ted-rall-and-joh-0D-L8O` |
| 159 | pending | 2025-11-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,992 | `2025-11-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 160 | pending | 2025-10-10 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,978 | `2025-10-10-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-UaGsDF` |
| 161 | pending | 2025-11-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,903 | `2025-11-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-1mebPn` |
| 162 | pending | 2026-01-26 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 59:00 | 9,863 | `2026-01-26-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 163 | pending | 2026-03-09 | DeProgram Show with Ted Rall and Jamarl Thomas | Ecocide in Iran / DeProgram with Ted Rall and John Kiriakou | 59:00 | 9,750 | `2026-03-09-deprogram-show-with-ted-ra-ecocide-in-iran-deprogram-with-ted-rall-and-j` |
| 164 | pending | 2025-10-31 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram with Ted Rall and John Kiriakou: “Gaza-istan?” | 60:00 | 9,676 | `2025-10-31-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-gaz` |
| 165 | pending | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 56:00 | 9,658 | `2025-11-19-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 166 | pending | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 56:00 | 9,554 | `2025-11-19-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra-Cxd39y` |
| 167 | pending | 2025-10-23 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 9,306 | `2025-10-23-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 168 | pending | 2025-10-22 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 9,301 | `2025-10-22-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 169 | pending | 2026-03-20 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 60:00 | 9,282 | `2026-03-20-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 170 | rejected (93.3% duplicate of the 2025-11-19 DMZ America episode mined in its place) | 2025-11-18 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 57:00 | 9,169 | `2025-11-18-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 171 | pending | 2025-10-30 | DeProgram Show with Ted Rall and Jamarl Thomas | Deprogram with Ted Rall and John Kiriakou: “Hamas Has Won\ | 58:00 | 8,887 | `2025-10-30-deprogram-show-with-ted-ra-deprogram-with-ted-rall-and-john-kiriakou-ham` |
| 172 | pending | 2025-11-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 55:00 | 8,740 | `2025-11-11-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 173 | pending | 2025-09-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 71:00 | 8,603 | `2025-09-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 174 | pending | 2025-10-21 | The Deep Focus Show | The Deep Focus Show | 52:00 | 8,470 | `2025-10-21-the-deep-focus-show-the-deep-focus-show` |
| 175 | pending | 2026-02-19 | The Deep Focus Show | Trump | 62:00 | 8,411 | `2026-02-19-the-deep-focus-show-trump-s-iran-gamble-w-george-galloway` |
| 176 | pending | 2025-12-19 | The Deep Focus Show | Held Captive 100+ Days by the Taliban w/ Safi Rauf | 54:00 | 7,865 | `2025-12-19-the-deep-focus-show-held-captive-100-days-by-the-taliban-w-safi-r` |
| 177 | pending | 2026-02-13 | The Deep Focus Show | Is U.S. Global Dominance Eroding? w/ Alfred McCoy | 50:00 | 7,766 | `2026-02-13-the-deep-focus-show-is-u-s-global-dominance-eroding-w-alfred-mcco` |
| 178 | pending | 2025-08-16 | The Deep Focus Show | The Call is to Liberate Palestine w/ Miko Peled | 44:00 | 7,746 | `2025-08-16-the-deep-focus-show-the-call-is-to-liberate-palestine-w-miko-pele` |
| 179 | pending | 2025-10-07 | The Deep Focus Show | The Deep Focus Show | 46:00 | 7,655 | `2025-10-07-the-deep-focus-show-the-deep-focus-show` |
| 180 | pending | 2025-07-26 | The Deep Focus Show | RUSSIAGATE — A Major Dividing Line w/ Matt Taibbi | 46:00 | 7,607 | `2025-07-26-the-deep-focus-show-russiagate-a-major-dividing-line-w-matt-taibb` |
| 181 | pending | 2025-12-27 | The Deep Focus Show | The Deep Focus Show | 50:00 | 7,399 | `2025-12-27-the-deep-focus-show-the-deep-focus-show` |
| 182 | pending | 2025-11-14 | The Deep Focus Show | Taxpayers Against Genocide w/ Seth Donnelly | 42:00 | 7,179 | `2025-11-14-the-deep-focus-show-taxpayers-against-genocide-w-seth-donnelly` |
| 183 | pending | 2026-03-06 | The Deep Focus Show | The Deep Focus Show | 52:00 | 7,125 | `2026-03-06-the-deep-focus-show-the-deep-focus-show` |
| 184 | pending | 2025-09-18 | The Deep Focus Show | The Deep Focus Show | 32:00 | 5,899 | `2025-09-18-the-deep-focus-show-the-deep-focus-show` |
| 185 | pending | 2021-02-24 | Scott Horton | Ep 5458 — The Dangerous Reaction | 33:00 | 5,721 | `2021-02-24-ep-5458-the-dangerous-reaction` |
| 186 | pending | 2025-11-25 | The Deep Focus Show | Complicity In Gaza | 50:00 | 4,946 | `2025-11-25-the-deep-focus-show-complicity-in-gaza-s-genocide-w-richard-falk` |
| 187 | pending | 2026-04-17 | The Deep Focus Show | Europe Is Running Out of Fuel w/ Richard Wolff | 31:00 | 4,259 | `2026-04-17-the-deep-focus-show-europe-is-running-out-of-fuel-w-richard-wolff` |
| 188 | pending | 2025-08-28 | yusefs report | clip (\ | 25:00 | 4,144 | `2025-08-28-yusefs-report-clip-scott-horton-x-kiriakou-destroy-dershowi` |
| 189 | pending | 2025-10-30 | Full Audiobook | Full Audiobook | 30:00 | 3,952 | `2025-10-30-full-audiobook-full-audiobook` |
| 190 | pending | 2026-02-26 | DeProgram Show with Ted Rall and Jamarl Thomas | SOTU: A Complete Disaster | 16:00 | 2,912 | `2026-02-26-deprogram-ted-rall-sotu-a-complete-disaster` |
| 191 | pending | 2025-04-27 | The Dr. Phil Podcast | short clip of the full Dr. Phil ep | 15:00 | 2,555 | `2025-04-27-the-dr-phil-podcast-short-clip-of-the-full-dr-phil-ep` |
| 192 | pending | 2026-02-18 | Viral Plug | John Kiriakou CIA Story Meme Compilation - PART 2 | 13:00 | 2,535 | `2026-02-18-viral-plug-john-kiriakou-cia-story-meme-compilation-part` |
| 193 | pending | 2026-02-21 | Viral Plug | John Kiriakou CIA Story Meme Compilation - PART 4 | 11:00 | 2,380 | `2026-02-21-viral-plug-john-kiriakou-cia-story-meme-compilation-part` |
| 194 | pending | 2026-02-27 | Viral Plug | John Kiriakou CIA Story Meme Compilation 7 | 10:00 | 2,150 | `2026-02-27-viral-plug-john-kiriakou-cia-story-meme-compilation-7` |
| 195 | pending | 2026-03-11 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 11:00 | 2,002 | `2026-03-11-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 196 | pending | 2026-02-25 | Viral Plug | John Kiriakou CIA Story Meme Compilation 6 | 10:00 | 1,886 | `2026-02-25-viral-plug-john-kiriakou-cia-story-meme-compilation-6` |
| 197 | pending | 2026-02-05 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 8:00 | 1,779 | `2026-02-05-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 198 | pending | 2026-02-11 | DeProgram Show with Ted Rall and Jamarl Thomas | Bad Bunny, Epstein Files, and more! | 10:00 | 1,761 | `2026-02-11-deprogram-ted-rall-bad-bunny-epstein-files-and-more` |
| 199 | pending | 2026-02-13 | DeProgram Show with Ted Rall and Jamarl Thomas | Pam Bondi | 8:00 | 1,498 | `2026-02-13-deprogram-ted-rall-pam-bondi-s-embarrassing-epstein-hearing` |
| 200 | pending | 2025-12-17 | DeProgram Show with Ted Rall and Jamarl Thomas | John Kiriakou on CIA Coup Tactics, Trump | 8:00 | 1,410 | `2025-12-17-deprogram-show-with-ted-ra-john-kiriakou-on-cia-coup-tactics-trump-s-wmd` |
| 201 | pending | 2026-03-01 | DeProgram Show with Ted Rall and Jamarl Thomas | Ted Rall & John Kiriakou React as Iran War Rages On | 8:00 | 1,320 | `2026-03-01-deprogram-show-with-ted-ra-ted-rall-john-kiriakou-react-as-iran-war-rage` |
| 202 | pending | 2026-01-04 | DeProgram Show with Ted Rall and Jamarl Thomas | On CIA Psychologists, Torture, Mamdani | 8:00 | 1,315 | `2026-01-04-deprogram-ted-rall-on-cia-psychologists-torture-mamdani` |
| 203 | pending | 2026-03-31 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 7:00 | 1,146 | `2026-03-31-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 204 | pending | 2026-01-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 6:00 | 1,014 | `2026-01-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 205 | pending | 2025-06-15 | The Deep Focus Show | Israel Strikes Iran - John Kiriakou | 4:00 | 591 | `2025-06-15-the-deep-focus-show-israel-strikes-iran-john-kiriakou-s-insights` |
| 206 | pending | 2023-05-05 | CODEPINK | John Kiriakou on Daniel Ellsberg #shorts | 1:00 | 179 | `2023-05-05-codepink-john-kiriakou-on-daniel-ellsberg-shorts` |
| 207 | pending | 2025-07-30 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 77:00 | 0 | `2025-07-30-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 208 | pending | 2025-08-02 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 70:00 | 0 | `2025-08-02-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 209 | pending | 2025-09-06 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 65:00 | 0 | `2025-09-06-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 210 | rejected (same episode as the 2025-11-19 DMZ America record mined in its place; this file's transcript was swept into its .sponsors sidecar and the main file is empty) | 2025-11-19 | DeProgram Show with Ted Rall and Jamarl Thomas | Israel | 62:00 | 0 | `2025-11-19-deprogram-ted-rall-israel-s-discreet-ethnic-cleansing-of-gaza` |
| 211 | pending | 2025-11-20 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 0 | `2025-11-20-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 212 | pending | 2025-11-21 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram Show with Ted Ra | 58:00 | 0 | `2025-11-21-deprogram-show-with-ted-ra-deprogram-show-with-ted-ra` |
| 213 | pending | 2026-02-25 | DeProgram Show with Ted Rall and Jamarl Thomas | DeProgram (Ted Rall) | 59:00 | 0 | `2026-02-25-deprogram-ted-rall-deprogram-ted-rall` |
| 214 | pending | 2026-03-03 | DeProgram Show with Ted Rall and Jamarl Thomas | Regime Derange / DeProgram with Ted Rall and John Kiriakou | 60:00 | 0 | `2026-03-03-deprogram-show-with-ted-ra-regime-derange-deprogram-with-ted-rall-and-jo` |
| 215 | pending | 2026-03-12 | DeProgram Show with Ted Rall and Jamarl Thomas | A Super Dumb Mass Murder | 59:00 | 0 | `2026-03-12-deprogram-ted-rall-a-super-dumb-mass-murder` |
