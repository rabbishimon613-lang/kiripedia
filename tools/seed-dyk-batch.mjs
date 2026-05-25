#!/usr/bin/env node
// One-shot bulk-seeder for `dyk:` frontmatter entries across many articles.
//
// Rule (also documented in ARTICLE-WORKFLOW.md): every new article ships
// with >=2 dyk strings; every enrichment to an existing article appends >=1.
// Each dyk string must contain >=2 internal [wikilink](/wiki/slug) anchors —
// the homepage uses the DYK box as the primary navigation funnel.
//
// Idempotent: if an article already has a `dyk:` block it is skipped.

import { readFileSync, writeFileSync } from 'node:fs';

const ENTRIES = {
  // ===== Carlos Watson 2026-04-27 =====
  'rudy-giuliani': [
    '… that [Rudy Giuliani](/wiki/rudy-giuliani) attempted in 2018 to extort \\$2 million from [John Kiriakou](/wiki/john-kiriakou) at the [Trump International Hotel](/wiki/rudy-giuliani) in exchange for arranging a presidential pardon — and Giuliani\'s own aide [Noelle Dunphy](/wiki/noelle-dunphy) corroborated the entire account to the *New York Times*?',
    '… that the day before the [Giuliani meeting](/wiki/rudy-giuliani), Giuliani\'s aide warned [John Kiriakou](/wiki/john-kiriakou) by phone that *"Rudy is not very good by 2 o\'clock"* — and that on Kiriakou\'s introducer [Bernie Kerik](/wiki/bernie-kerik)\'s advice the meeting was set for 11 a.m.?',
  ],
  'sebastian-gorka': [
    '… that the day after [Rudy Giuliani](/wiki/rudy-giuliani) tried to extort \\$2 million from [John Kiriakou](/wiki/john-kiriakou), [Sebastian Gorka](/wiki/sebastian-gorka) tried to extract \\$5,000 from him at a Trump Hotel book launch in exchange for tweeting at President Trump?',
  ],
  'saddam-hussein': [
    '… that on the morning Iraq invaded Kuwait, the 25-year-old [John Kiriakou](/wiki/john-kiriakou) was the analyst President George H. W. Bush turned to in the Oval Office for the brief on [Saddam Hussein](/wiki/saddam-hussein)\'s next moves?',
    '… that the only meaningful conversation U.S. Ambassador [April Glaspie](/wiki/april-glaspie) ever held with [Saddam Hussein](/wiki/saddam-hussein) was the one days before the [invasion of Kuwait](/wiki/saddam-hussein), in which she delivered Secretary James Baker\'s cable that the U.S. had *"no position on inter-Arab disputes"*?',
  ],
  'april-glaspie': [
    '… that U.S. Ambassador [April Glaspie](/wiki/april-glaspie) had met [Saddam Hussein](/wiki/saddam-hussein) only twice before the cable delivery that, per [John Kiriakou](/wiki/john-kiriakou), Saddam read as a green light to invade Kuwait — and the first time was when she presented her credentials?',
  ],
  'hussein-kamel': [
    '… that the CIA burned [Hussein Kamel](/wiki/hussein-kamel) after his 1993 defection to Jordan by planting an Arab-press story claiming he had told the Americans everything — causing [Saddam Hussein](/wiki/saddam-hussein) to destroy his chemical-weapons stockpile?',
  ],
  'uday-hussein': [
    '… that [Hussein Kamel](/wiki/hussein-kamel) and his brother Saddam Kamel defected to Jordan in 1993 not over policy but out of fear of [Uday Hussein](/wiki/uday-hussein), [Saddam](/wiki/saddam-hussein)\'s eldest son?',
  ],
  'bruce-fine': [
    '… that [Bruce Fine](/wiki/bruce-fine), a former Reagan-era Deputy Attorney General, accompanied [John Kiriakou](/wiki/john-kiriakou) to the [Trump Hotel meeting](/wiki/rudy-giuliani) at which [Rudy Giuliani](/wiki/rudy-giuliani)\'s aide solicited \\$2 million for a pardon — and summed up the encounter on the walk out in two words: *"Criminal. Criminal."*?',
  ],
  'robert-maclean': [
    '… that TSA whistleblower [Robert MacLean](/wiki/robert-maclean) is the person who, hours after [John Kiriakou](/wiki/john-kiriakou) described the [Giuliani extortion attempt](/wiki/rudy-giuliani) to him at an RNC book launch, called the *New York Times* and triggered the front-page exposé — because the FBI declined interest?',
  ],
  'mort-halperin': [
    '… that the author of the Intelligence Identities Protection Act, [Mort Halperin](/wiki/mort-halperin), wrote to President Obama after [John Kiriakou](/wiki/john-kiriakou)\'s 2012 conviction stating that the law was never intended for prosecutions like Kiriakou\'s — and that Kiriakou should be pardoned?',
  ],
  'bernie-kerik': [
    '… that former NYPD Commissioner [Bernie Kerik](/wiki/bernie-kerik) was the person who, in 2018, introduced [John Kiriakou](/wiki/john-kiriakou) to [Rudy Giuliani](/wiki/rudy-giuliani) for the meeting that became Giuliani\'s \\$2 million pardon-extortion attempt?',
  ],
  'noelle-dunphy': [
    '… that the same evening [Rudy Giuliani](/wiki/rudy-giuliani) solicited \\$2 million from [John Kiriakou](/wiki/john-kiriakou), Giuliani told his aide [Noelle Dunphy](/wiki/noelle-dunphy) he had *"tried to get \\$2 million out of this guy for a pardon today"* — a line she later corroborated to the *New York Times*?',
  ],
  'norman-schwarzkopf': [
    '… that the Gulf War flanking maneuver attributed to General [Norman Schwarzkopf](/wiki/norman-schwarzkopf), which produced the Highway of Death, is described by [John Kiriakou](/wiki/john-kiriakou) as *"a very simple, very elementary, first-step-play flanking move"*?',
  ],

  // ===== Carlos Watson part-everyone-missed =====
  'ahmed-khatib': [
    '… that the Iraqi-installed occupation governor of Kuwait, [Ahmed Khatib](/wiki/ahmed-khatib), was a medical doctor whose mother had been a Sudanese slave in the Kuwaiti royal household — and whose college roommate at AUB was [George Habash](/wiki/george-habash), co-founder with him of the [PFLP](/wiki/pflp)?',
  ],
  'george-habash': [
    '… that [George Habash](/wiki/george-habash) and [Ahmed Khatib](/wiki/ahmed-khatib) — later Iraq\'s installed governor of occupied Kuwait — were college roommates at the American University of Beirut when they founded the [PFLP](/wiki/pflp)?',
  ],
  'pflp': [
    '… that the [PFLP](/wiki/pflp) was one of the Arab armed groups whose unmolested transit through Athens was tolerated by Greece in the late 1990s, per a deal [John Kiriakou](/wiki/john-kiriakou) describes — alongside [17 November](/wiki/revolutionary-organization-17-november) and the Abu Nidal Organization — on condition that they not kill Greeks?',
  ],
  'john-mccone': [
    '… that on the afternoon of the [JFK assassination](/wiki/jfk-assassination), per Robert F. Kennedy Jr.\'s account to [John Kiriakou](/wiki/john-kiriakou), CIA Director [John McCone](/wiki/john-mccone) answered Bobby Kennedy Sr.\'s question *"Tell me your people didn\'t do this"* not with denial but with *"I don\'t know who did it"*?',
  ],
  'jean-gately': [
    '… that the commander of the 1961 Bay of Pigs operation, [Jean Gately](/wiki/jean-gately), was still in the CIA decades later — sharing a guesthouse with [John Kiriakou](/wiki/john-kiriakou) in Pakistan — where he told him, of the [JFK assassination](/wiki/jfk-assassination): *"Fucking Kennedy. We could have won that thing."*?',
  ],
  'jfk-assassination': [
    '… that [John Kiriakou](/wiki/john-kiriakou) was told by a White House contact that *"every document that remains classified [in the JFK files] has the word Israel in it"* — a line he cites for his conclusion that Israeli intelligence was involved in the [JFK assassination](/wiki/jfk-assassination)?',
    '… that the line [John Kiriakou](/wiki/john-kiriakou) cites from Bay of Pigs commander [Jean Gately](/wiki/jean-gately) — *"Fucking Kennedy. We could have won that thing."* — is one of the three strands underpinning his belief that elements of the CIA were involved in the [JFK assassination](/wiki/jfk-assassination)?',
  ],
  'robert-hanssen': [
    '… that FBI counterintelligence chief [Robert Hanssen](/wiki/robert-hanssen), while himself a Soviet mole, framed his CIA counterpart [Brian Kelly](/wiki/brian-kelly) as the source of executed agents — and the FBI told Kelly\'s daughter her father would face the death penalty unless she got him to confess?',
  ],
  'brian-kelly': [
    '… that CIA counterintelligence chief [Brian Kelly](/wiki/brian-kelly) spent a year and a half framed by FBI mole [Robert Hanssen](/wiki/robert-hanssen) before Hanssen was unmasked as the actual traitor?',
  ],
  'pete-seeger': [
    '… that folk singer [Pete Seeger](/wiki/pete-seeger), [John Kiriakou](/wiki/john-kiriakou)\'s personal hero, pleaded the **First** Amendment rather than the Fifth before the House Un-American Activities Committee in 1958 — and went to prison for it?',
  ],
  'gina-haspel': [
    '… that CIA Director [Gina Haspel](/wiki/gina-haspel) — known internally to officers including [John Kiriakou](/wiki/john-kiriakou) as *"Bloody Gina"* — flew to a CIA black site to sit in on an [enhanced-interrogation](/wiki/enhanced-interrogation) torture session *"just because she could"*?',
  ],
  'louis-farrakhan': [
    '… that [Louis Farrakhan](/wiki/louis-farrakhan)\'s public statement during [John Kiriakou](/wiki/john-kiriakou)\'s imprisonment at [FCI Loretto](/wiki/fci-loretto) — naming him a hero of the Muslim people — secured Kiriakou\'s safety from the prison\'s Muslim population, even as the Aryans simultaneously protected him under a *"Muslim hunter"* cover story?',
  ],
  'jeffrey-epstein': [
    '… that [John Kiriakou](/wiki/john-kiriakou)\'s position on [Jeffrey Epstein](/wiki/jeffrey-epstein) is that he was *"an Israeli access agent"* — and that, drawing on his own time in federal custody, Kiriakou believes Epstein died by suicide because in the Bureau of Prisons *"the cameras never work, the guards are always sound asleep, this happens all the time"*?',
  ],
  'kiki-camarena-case': [
    '… that the U.S. statute under which Washington claims authority to seize foreign nationals abroad — invoked in the 2026 [Maduro snatch](/wiki/kiki-camarena-case) — originated in the 1985 [Kiki Camarena case](/wiki/kiki-camarena-case), the abduction and murder in Mexico of a DEA agent?',
  ],

  // ===== Bidoun Waraq Kuwait =====
  'asel-al-ghabandi': [
    '… that Kuwaiti resistance figure [Asel al-Ghabandi](/wiki/asel-al-ghabandi) reported on Iraqi troop movements during the 1990–91 occupation by simply speaking on the telephone — knowing the NSA was intercepting every call and the transcripts would reach the CIA?',
  ],
  'sheikh-jaber-al-ahmad': [
    '… that the 1991 Washington visit by Kuwaiti Amir [Sheikh Jaber al-Ahmad](/wiki/sheikh-jaber-al-ahmad), at which President Bush gave him *"the red carpet treatment"*, was triggered by a single cable [John Kiriakou](/wiki/john-kiriakou) sent from Taif?',
    '… that Kuwait\'s sovereign wealth fund — the world\'s first — was developed in the 1970s by [Sheikh Jaber al-Ahmad](/wiki/sheikh-jaber-al-ahmad) when he was Minister of Finance, decades before becoming Amir?',
  ],
  'sheikh-saad-al-abdullah': [
    '… that during the 1990–91 occupation, Crown Prince [Sheikh Saad al-Abdullah](/wiki/sheikh-saad-al-abdullah) ran the Kuwaiti government-in-exile from Taif at twenty hours a day — per [John Kiriakou](/wiki/john-kiriakou), *"the best leader Kuwait had for that situation"*?',
  ],
  'skip-gnehm': [
    '… that the first U.S. cable out of liberated Kuwait City, sent by Ambassador [Skip Gnehm](/wiki/skip-gnehm), read simply *"American Embassy Kuwait City is now open for business"* — and was, per [John Kiriakou](/wiki/john-kiriakou), the moment he thought *"we\'ve won"*?',
  ],
  'saud-nasir-al-sabah': [
    '… that on the morning of the 1990 Iraqi invasion of Kuwait, President George H. W. Bush was on the phone with Kuwaiti Ambassador [Saud Nasir Al-Sabah](/wiki/saud-nasir-al-sabah) when [John Kiriakou](/wiki/john-kiriakou) and his boss walked into the Oval Office?',
  ],
  '1993-bush-assassination-plot': [
    '… that the 1993 [Iraqi plot to assassinate former President George H. W. Bush in Kuwait](/wiki/1993-bush-assassination-plot) was answered, eight hours after a single phone call from Chairman of the Joint Chiefs Colin Powell to [John Kiriakou](/wiki/john-kiriakou), with 47 cruise missiles into the Iraqi Intelligence Service headquarters in Baghdad?',
  ],
  'william-webster': [
    '… that [William Webster](/wiki/william-webster), Director of Central Intelligence during the [1990 invasion of Kuwait](/wiki/saddam-hussein), is the only person in history to have served as both Director of the FBI and Director of the CIA?',
  ],
  'gerald-bull': [
    '… that British inventor [Gerald Bull](/wiki/gerald-bull) was assassinated by Mossad in Brussels only after Iraqi engineers solved his giant gun\'s cracking problem with an internal barrel-smoothing sleeve they called *"the condom"*?',
  ],
  'ahmed-chalabi': [
    '… that [Ahmed Chalabi](/wiki/ahmed-chalabi) — later resurrected by Dick Cheney to feed the Pentagon fabricated WMD intelligence for the [2003 Iraq War](/wiki/yellowcake-niger-forgery) — first came to CIA attention as the man who looted [Petra Bank](/wiki/petra-bank) of \\$36 million and fled to Syria in the trunk of his secretary\'s car?',
  ],
  'kuwait-oil-fires': [
    '… that the [Kuwait oil fires](/wiki/kuwait-oil-fires) of 1991 were extinguished by an international team led by American specialist Red Adair — who bought a Rolls-Royce jet engine and rigged it over each wellhead to blow the flame out?',
    '… that two French journalists driving into Kuwait behind [John Kiriakou](/wiki/john-kiriakou)\'s convoy on Liberation Day were vaporized after driving off the road onto a sheet of melted-sand glass over a lake of oil — bodies never recovered?',
  ],
  'yellowcake-niger-forgery': [
    '… that the [Yellowcake Niger forgery](/wiki/yellowcake-niger-forgery) line — which the CIA twice pulled out of President George W. Bush\'s 2003 State of the Union draft and Dick Cheney twice put back in — was identified as a forgery on sight by [John Kiriakou](/wiki/john-kiriakou) and his boss because *"it\'s not even in the right font"*?',
  ],
  'wesley-clark': [
    '… that the famous *"seven countries in five years"* Pentagon plan exposed by General [Wesley Clark](/wiki/wesley-clark) — to overthrow Iran, Iraq, Libya, Syria, Somalia, Sudan, and one other — is attributed by [John Kiriakou](/wiki/john-kiriakou) to *"the Israeli plan, 100 percent"*?',
  ],
  'cia-cable-priority-levels': [
    '… that the highest [U.S. cable priority level](/wiki/cia-cable-priority-levels) is **CRITIC** — meaning, per [John Kiriakou](/wiki/john-kiriakou), *"they\'re coming over the embassy walls, God save"* — and that most career intelligence officers go a 30-year career without ever seeing one?',
  ],
  'ali-hassan-al-majid': [
    '… that "Chemical Ali" — [Ali Hassan al-Majid](/wiki/ali-hassan-al-majid), [Saddam Hussein](/wiki/saddam-hussein)\'s cousin — was also briefly the Iraqi-installed governor of occupied Kuwait, earning per [John Kiriakou](/wiki/john-kiriakou) the title *"Butcher of Kuwait"* alongside his existing *"Butcher of Kurdistan"*?',
  ],
  'petra-bank': [
    '… that [Petra Bank](/wiki/petra-bank), the principal bank for the Iraqi refugee community in Jordan, was looted of \\$36 million in a single night by its founder [Ahmed Chalabi](/wiki/ahmed-chalabi), who fled to Syria in the trunk of his secretary/girlfriend\'s car?',
  ],

  // ===== Dorey 250 =====
  'heather-saunders': [
    '… that public opinion in Greece against [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) only began to turn — for the first time since 1975 — after [Heather Saunders](/wiki/heather-saunders), widow of the British defense attaché [Stephen Saunders](/wiki/stephen-saunders), went on Greek television to call the group not a political organization but *"a gang of criminals"*?',
  ],
  'three-saudi-princes': [
    '… that the cell-phone numbers of [three Saudi princes](/wiki/three-saudi-princes) were in [Abu Zubaydah](/wiki/abu-zubaydah)\'s address book at the time of his March 2002 capture — and per [John Kiriakou](/wiki/john-kiriakou), all three were dead within a week, of a heart attack at 43, a single-car accident with failed brakes, and thirst while camping alone in the desert?',
  ],
  'mohammed-atef': [
    '… that the actual #3 in al-Qaeda, [Mohammed Atef](/wiki/mohammed-atef), was killed in October 2001 in Tora Bora when a U.S. rocket strike hit his kitchen and a shard of wood from the blown-up table struck him in the neck?',
  ],
  'khalid-sheikh-mohammed': [
    '… that the CIA learned the true identity of 9/11 mastermind [Khalid Sheikh Mohammed](/wiki/khalid-sheikh-mohammed) only when [Abu Zubaydah](/wiki/abu-zubaydah) laughed at FBI interrogator [Ali Soufan](/wiki/ali-soufan)\'s ignorance of him at a CIA black site — *"You don\'t know who Mukhtar is? He\'s Khalid Sheikh Mohammed."*?',
    '… that [Khalid Sheikh Mohammed](/wiki/khalid-sheikh-mohammed) lived with an American host family in North Carolina as an exchange student — and per [John Kiriakou](/wiki/john-kiriakou)\'s relay of his own account, was radicalized by news video of an Israeli soldier with his boot on the neck of a Palestinian woman?',
  ],
  'john-oneill': [
    '… that FBI New York counterterrorism chief [John O\'Neill](/wiki/john-oneill) — *"spot-on about Osama bin Laden — 100 percent correct"* per [John Kiriakou](/wiki/john-oneill) — is the principal subject of Lawrence Wright\'s book *The Looming Tower*?',
  ],
  'hawala-system': [
    '… that [John Kiriakou](/wiki/john-kiriakou), later Chief Investigator on the Senate Foreign Relations Committee, personally tested the [hawala system](/wiki/hawala-system) by handing \\$50 to a UAE grocer and walking out with a 16-digit handwritten code — which a week later got him \\$46 from an Arabic bakery in Bethesda, Maryland, completely untraceable?',
  ],
  'mad-minute': [
    '… that the CIA\'s [mad minute](/wiki/mad-minute) procedure — the first sixty seconds of every meeting with a recruited source — exists for one reason: so that if the door is kicked in, the essentials (*"are you safe? did you run a [surveillance-detection route](/wiki/surveillance-detection-route)?"*) have already been handled?',
  ],
  'bob-baer': [
    '… that during the Clinton years, [Bob Baer](/wiki/bob-baer) — later the subject of George Clooney\'s film *Syriana* — was pulled out of northern Iraq under threat of a conspiracy charge after NSA intercepted his plan to assassinate [Saddam Hussein](/wiki/saddam-hussein)?',
  ],
  'sandy-berger': [
    '… that [Sandy Berger](/wiki/sandy-berger), President Clinton\'s National Security Adviser, personally shut down CIA officer [Bob Baer](/wiki/bob-baer)\'s plan to assassinate [Saddam Hussein](/wiki/saddam-hussein) — telling the CIA either to pull Baer back or to expect him under arrest for conspiracy?',
  ],
  'robert-mueller': [
    '… that on July 31, 2002 — the day the CIA wrested primacy over [Abu Zubaydah](/wiki/abu-zubaydah)\'s interrogation away from FBI agent [Ali Soufan](/wiki/ali-soufan) — FBI Director [Robert Mueller](/wiki/robert-mueller) withdrew every FBI employee from the country, not just from the black site, within 48 hours?',
  ],

  // ===== Existing high-signal articles =====
  'john-kiriakou': [
    '… that [John Kiriakou](/wiki/john-kiriakou), then a 25-year-old CIA analyst eight months into the job, was the person who briefed President George H. W. Bush in the Oval Office on the morning [Saddam Hussein](/wiki/saddam-hussein) invaded Kuwait in 1990?',
    '… that [John Kiriakou](/wiki/john-kiriakou) is the first U.S. official ever to publicly confirm the existence of the CIA\'s [enhanced interrogation](/wiki/enhanced-interrogation) program — and was sentenced to 30 months at [FCI Loretto](/wiki/fci-loretto) for it?',
    '… that the shirt [John Kiriakou](/wiki/john-kiriakou) was wearing when [Abu Zubaydah](/wiki/abu-zubaydah) regained consciousness after surgery — and at the sight of which the captured al-Qaeda figure\'s pulse went from 120 to 220 — was a red [SpongeBob SquarePants](/wiki/abu-zubaydah) shirt his kids had given him for Christmas?',
  ],
  'abu-zubaydah': [
    '… that the figure long described in U.S. press as the "#3 in al-Qaeda", [Abu Zubaydah](/wiki/abu-zubaydah), was per [John Kiriakou](/wiki/john-kiriakou) never even formally a member of al-Qaeda — the misidentification arose because a cousin used the same kunya, and the actual #3 was [Mohammed Atef](/wiki/mohammed-atef)?',
    '… that the CIA waterboarded [Abu Zubaydah](/wiki/abu-zubaydah) 83 times — and the breakthrough intelligence credited to the program was, per a 2009-released Inspector General report, lifted from FBI interrogator [Ali Soufan](/wiki/ali-soufan)\'s pre-torture rapport-based interrogation?',
  ],
  'george-tenet': [
    '… that during a briefing in which the Pentagon\'s Middle East commander said the United States *"could be in Tehran by August"*, CIA Director [George Tenet](/wiki/george-tenet) muted his microphone, turned to [John Kiriakou](/wiki/john-kiriakou) and asked: *"Did he say Baghdad or did he say Tehran?"*?',
  ],
  'enhanced-interrogation': [
    '… that the CIA\'s [enhanced interrogation](/wiki/enhanced-interrogation) program was designed by two outside contractors — [Mitchell and Jessen](/wiki/mitchell-and-jessen) — who together were paid roughly \\$108 million?',
  ],
  'mitchell-and-jessen': [
    '… that [Mitchell and Jessen](/wiki/mitchell-and-jessen), the two contractor-psychologists who designed the CIA\'s [enhanced interrogation](/wiki/enhanced-interrogation) program, were paid approximately \\$108 million combined and now live in Florida?',
  ],
  'ali-soufan': [
    '… that FBI interrogator [Ali Soufan](/wiki/ali-soufan) — mentored by John O\'Neill — obtained from [Abu Zubaydah](/wiki/abu-zubaydah) the identity of 9/11 mastermind [Khalid Sheikh Mohammed](/wiki/khalid-sheikh-mohammed) using nothing more coercive than coffee and a respectful conversation?',
  ],
  'cofer-black': [
    '… that on July 6, 2001, CIA Counterterrorism Center chief [Cofer Black](/wiki/cofer-black) interrupted a routine analyst briefing [John Kiriakou](/wiki/john-kiriakou) was giving to a friendly Arab intelligence delegation to deliver, unprompted, the line *"something terrible is going to happen … I beg you, if you have any sources inside al-Qaeda, please help us"*?',
  ],
  'jose-rodriguez': [
    '… that the night before [John Kiriakou](/wiki/john-kiriakou) reported to [FCI Loretto](/wiki/fci-loretto), the CIA\'s Director of Counterterrorism [Jose Rodriguez](/wiki/jose-rodriguez) tweeted at him: *"Don\'t drop the soap. Haha"* with a laughing emoji?',
  ],
  'fci-loretto': [
    '… that at [FCI Loretto](/wiki/fci-loretto), [John Kiriakou](/wiki/john-kiriakou) was protected by the Italians (because he was CIA not FBI), the Aryans (under a *"Muslim hunter"* cover story), the Muslims (after a statement from [Louis Farrakhan](/wiki/louis-farrakhan)), and the Mexican cartels (after he wrote one of their members\' appeals pro bono)?',
  ],
  'jonathan-pollard': [
    '… that [John Kiriakou](/wiki/john-kiriakou)\'s counter to a former [Mossad](/wiki/mossad) director\'s on-air denial of Israeli spying against the United States was simply: *"[Jonathan Pollard](/wiki/jonathan-pollard) was caught in 1985, and you were spying on the United States in 1998, you know, or 2004"* — to which the former Mossad director declined to comment?',
  ],
  'welch-45': [
    '… that the same .45-caliber pistol used to kill CIA Athens station chief [Richard Welch](/wiki/richard-welch) in 1975 was used by [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) in every one of its assassinations through 2002 — including the killing of British defense attaché [Stephen Saunders](/wiki/stephen-saunders) in 2000?',
  ],
  'richard-welch': [
    '… that the December 1975 assassination of CIA Athens station chief [Richard Welch](/wiki/richard-welch) inaugurated a 27-year run of [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) killings carried out with the same [.45-caliber pistol](/wiki/welch-45)?',
  ],
  'revolutionary-organization-17-november': [
    '… that [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) — the Greek group that for 27 years carried out its killings with the [same .45](/wiki/welch-45) — was so opaque to the Greek public that it was widely rumored to be either the government itself or the Greek Orthodox Church?',
  ],
  'mossad': [
    '… that per [John Kiriakou](/wiki/john-kiriakou), [Mossad](/wiki/mossad) assassinated British inventor [Gerald Bull](/wiki/gerald-bull) in Brussels not because of anything he had done, but because they did not want him designing any more weapons for [Saddam Hussein](/wiki/saddam-hussein)?',
  ],
  'aipac': [
    '… that, per [John Kiriakou](/wiki/john-kiriakou), a Texas state senator\'s resolution to declare a *"John Kiriakou Day"* in Texas was killed by an [AIPAC](/wiki/aipac) lobbyist dedicated solely to lobbying the Texas state legislature?',
  ],
  'bojinka-plot': [
    '… that the [Bojinka plot](/wiki/bojinka-plot) was the 1996 plan attributed to [Khalid Sheikh Mohammed](/wiki/khalid-sheikh-mohammed) to hijack as many as fourteen 747s out of Manila and fly them into fourteen buildings up and down the U.S. west coast — uncovered when a cleaning lady let the cops into his apartment?',
  ],
  'gerald-post': [
    '… that [John Kiriakou](/wiki/john-kiriakou)\'s graduate-school professor [Gerald Post](/wiki/gerald-post) — the CIA\'s legendary political-psychology profiler — recruited him into the agency from the class *"The Psychology of Leadership"*?',
  ],
  'mike-spann': [
    '… that the first American killed in combat after September 11, 2001 — CIA officer [Mike Spann](/wiki/mike-spann) — died interrogating prisoners at [Qala-i-Jangi](/wiki/qala-i-jangi-uprising), among them American Taliban fighter [John Walker Lindh](/wiki/john-walker-lindh)?',
  ],
  'qala-i-jangi-uprising': [
    '… that the November 2001 [Qala-i-Jangi uprising](/wiki/qala-i-jangi-uprising) in Afghanistan, the first major battle of the post-9/11 war, killed CIA officer [Mike Spann](/wiki/mike-spann) and produced the capture of American Taliban fighter [John Walker Lindh](/wiki/john-walker-lindh)?',
  ],
  'general-dostum': [
    '… that warlord [General Dostum](/wiki/general-dostum) — the Northern Alliance commander whose forces, with CIA paramilitary support, took the northern Afghan front from the Taliban in 2001 — is the man whose troops oversaw the [Qala-i-Jangi uprising](/wiki/qala-i-jangi-uprising)?',
  ],
  'erik-prince': [
    '… that [Blackwater](/wiki/blackwater) founder [Erik Prince](/wiki/erik-prince) — per [John Kiriakou](/wiki/john-kiriakou) — was, before his contracting career, a Navy SEAL who washed out of the teams?',
  ],
  'james-angleton': [
    '… that legendary CIA counterintelligence chief [James Angleton](/wiki/james-angleton)\'s mole-hunt paranoia caused so much internal damage that, per [John Kiriakou](/wiki/john-kiriakou), it shaped CIA culture for a generation after his removal?',
  ],
  'hummus': [
    '… that [hummus](/wiki/hummus) is, per [John Kiriakou](/wiki/john-kiriakou), Levantine — not Greek — and that the version one sees in American supermarkets is *"not real hummus"*?',
  ],
};

function addDyk(slug, entries) {
  const path = `src/content/articles/${slug}.mdx`;
  let content;
  try { content = readFileSync(path, 'utf8'); }
  catch { console.warn(`  skip (not found): ${slug}`); return false; }

  // Already has dyk? Skip silently.
  if (/^dyk:/m.test(content)) return false;

  // Insert before the closing `---` of the frontmatter block.
  const fmEnd = content.indexOf('\n---', 4);
  if (fmEnd === -1) { console.warn(`  skip (no frontmatter): ${slug}`); return false; }

  // Build YAML — single-quoted lines with apostrophe doubling.
  const yaml = 'dyk:\n' + entries.map(e => `  - '${e.replace(/'/g, "''")}'`).join('\n');
  const next = content.slice(0, fmEnd) + '\n' + yaml + content.slice(fmEnd);
  writeFileSync(path, next);
  return true;
}

let added = 0, items = 0;
for (const [slug, entries] of Object.entries(ENTRIES)) {
  if (addDyk(slug, entries)) { added++; items += entries.length; }
}
console.log(`Seeded ${items} DYK entries across ${added} articles.`);
