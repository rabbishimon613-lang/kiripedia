#!/usr/bin/env node
// Bulk-seed `events:` frontmatter from the corpus.
//
// Rule (locked into ARTICLE-WORKFLOW.md): every article ships with the
// most-precise date(s) Kiriakou gives for the events it describes — YYYY,
// YYYY-MM, or YYYY-MM-DD. Each event description should contain >=1 internal
// wikilink so the homepage OTD box doubles as a navigation funnel.
//
// Idempotent: if an article already has an `events:` block it is skipped.

import { readFileSync, writeFileSync } from 'node:fs';

const ENTRIES = {
  // === The September 11, 2001 sequence ===
  'cofer-black': [
    { date: '2001-07-06', description: '[Cofer Black](/wiki/cofer-black) interrupts a routine [John Kiriakou](/wiki/john-kiriakou) briefing to a friendly Arab delegation to deliver the warning *"something terrible is going to happen … I beg you, if you have any sources inside al-Qaeda, please help us."*' },
  ],
  'enhanced-interrogation': [
    { date: '2002-07-31', description: 'CIA Director [George Tenet](/wiki/george-tenet) wins President Bush\'s approval to strip [Ali Soufan](/wiki/ali-soufan) and the FBI of primacy over [Abu Zubaydah](/wiki/abu-zubaydah)\'s interrogation; FBI Director [Robert Mueller](/wiki/robert-mueller) withdraws all FBI personnel from the host country within 48 hours and the CIA begins [enhanced interrogation](/wiki/enhanced-interrogation).' },
    { date: '1968-01', description: 'The *Washington Post* runs a front-page photograph of a U.S. soldier waterboarding a North Vietnamese prisoner; Secretary of Defense Robert McNamara orders an investigation, and the soldier is convicted of torture and sent to Leavenworth for 20 years — a precedent [John Kiriakou](/wiki/john-kiriakou) repeatedly cites against the post-2002 [enhanced interrogation](/wiki/enhanced-interrogation) program.' },
    { date: '1946', description: 'The United States executes Japanese soldiers for waterboarding American POWs — the legal precedent [John Kiriakou](/wiki/john-kiriakou) cites for his position that the post-2002 [enhanced interrogation](/wiki/enhanced-interrogation) program was *"clearly illegal"*.' },
  ],
  'robert-mueller': [
    { date: '2002-07-31', description: 'FBI Director [Robert Mueller](/wiki/robert-mueller) withdraws every FBI employee from the host country of the CIA black site holding [Abu Zubaydah](/wiki/abu-zubaydah) within 48 hours of the CIA winning primacy — *"we know what these CIA guys are going to do."*' },
  ],

  // === Athens / 17 November ===
  'stephen-saunders': [
    { date: '2000-04-22', description: 'British defense attaché [Stephen Saunders](/wiki/stephen-saunders) is assassinated by [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) in a Kifissia Boulevard traffic jam in Athens; his car shares the same `YHB`-prefixed license plate as the U.S. embassy, drawing the group\'s eye to [John Kiriakou](/wiki/john-kiriakou).' },
  ],
  'heather-saunders': [
    { date: '2000-04', description: '[Heather Saunders](/wiki/heather-saunders) goes on Greek television after her husband [Stephen Saunders](/wiki/stephen-saunders)\' assassination and calls [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) not a political organization but *"a gang of criminals"* — turning Greek public opinion for the first time since 1975.' },
  ],
  'richard-welch': [
    { date: '1975-12-23', description: 'CIA Athens station chief [Richard Welch](/wiki/richard-welch) is shot dead outside his Athens home with the .45 that would become known as the [Welch .45](/wiki/welch-45), inaugurating a 27-year run of [17 November](/wiki/revolutionary-organization-17-november) assassinations carried out with the same weapon.' },
  ],

  // === Kuwait 1990-91 ===
  'saddam-hussein': [
    { date: '1990-06-30', description: 'The CIA, with [John Kiriakou](/wiki/john-kiriakou) as the lead [Saddam Hussein](/wiki/saddam-hussein) analyst, publishes its first paper warning the White House that Iraq is preparing to invade [Kuwait](/wiki/ahmed-khatib).' },
    { date: '1990-08-02', description: 'Iraq invades Kuwait at 02:00 local time; that morning the 25-year-old [John Kiriakou](/wiki/john-kiriakou) is in the Oval Office briefing President George H. W. Bush on [Saddam Hussein](/wiki/saddam-hussein) and his installed governor of occupied Kuwait, [Ahmed Khatib](/wiki/ahmed-khatib).' },
  ],
  'ahmed-khatib': [
    { date: '1990-08-02', description: 'Iraq announces medical doctor [Ahmed Khatib](/wiki/ahmed-khatib) — co-founder of the [PFLP](/wiki/pflp) with his AUB roommate [George Habash](/wiki/george-habash) — as occupation governor of Kuwait, without Khatib\'s consent; he pledges loyalty to the Kuwaiti ruling family hours later.' },
  ],
  'norman-schwarzkopf': [
    { date: '1991-02', description: '[Norman Schwarzkopf](/wiki/norman-schwarzkopf) launches the Gulf War flanking maneuver — diverting at the Battle of Khafji while routing the main force through Saudi Arabia to strike Iraqi forces from the north — producing the Highway of Death and the liberation of [Kuwait](/wiki/saud-nasir-al-sabah).' },
  ],
  'kuwait-oil-fires': [
    { date: '1991-02', description: 'Retreating Iraqi forces set fire to an estimated 600–800 Kuwaiti oil wells; the [Kuwait oil fires](/wiki/kuwait-oil-fires) blacken the desert as far as Riyadh and are extinguished by an international team led by Red Adair using a Rolls-Royce jet engine.' },
  ],
  '1993-bush-assassination-plot': [
    { date: '1993', description: 'Iraqi intelligence attempts to assassinate former President George H. W. Bush during his planned post-liberation visit to Kuwait; eight hours after a phone call from Colin Powell to [John Kiriakou](/wiki/john-kiriakou) the U.S. fires 47 cruise missiles into the [Iraqi Intelligence Service](/wiki/1993-bush-assassination-plot) headquarters in Baghdad.' },
  ],
  'hussein-kamel': [
    { date: '1993-01', description: '[Hussein Kamel](/wiki/hussein-kamel) and his brother Saddam Kamel defect to Jordan out of fear of [Uday Hussein](/wiki/uday-hussein); a CIA delegation including [John Kiriakou](/wiki/john-kiriakou) flies to Amman to debrief them in King Hussein\'s palace.' },
  ],

  // === The Abu Zubaydah operation ===
  'abu-zubaydah-capture': [
    { date: '2002-03', description: 'Thirteen simultaneous overnight raids in Lahore and Faisalabad, planned by [John Kiriakou](/wiki/john-kiriakou), result in the [capture of Abu Zubaydah](/wiki/abu-zubaydah-capture) — shot three times during a rooftop escape by a Pakistani officer with an AK-47.' },
  ],
  'abu-zubaydah': [
    { date: '2002-03', description: '[Abu Zubaydah](/wiki/abu-zubaydah) is captured in Faisalabad; on regaining consciousness in a Pakistani military-base hospital he opens his eye to see [John Kiriakou](/wiki/john-kiriakou) at the foot of the bed in a red SpongeBob SquarePants shirt, sending his pulse from 120 to 220.' },
    { date: '2002-07-31', description: '[George Tenet](/wiki/george-tenet) wins President Bush\'s approval to strip [Ali Soufan](/wiki/ali-soufan) of primacy over [Abu Zubaydah](/wiki/abu-zubaydah)\'s interrogation, allowing the CIA to begin [enhanced interrogation](/wiki/enhanced-interrogation) the same week.' },
  ],
  'john-kiriakou': [
    { date: '2002-01-04', description: '[John Kiriakou](/wiki/john-kiriakou) arrives in Pakistan as CIA chief of counterterrorism operations — the assignment that within ten weeks produces the [capture of Abu Zubaydah](/wiki/abu-zubaydah-capture).' },
    { date: '2012-01-23', description: '[John Kiriakou](/wiki/john-kiriakou) is arrested on five felony counts including three counts of espionage stemming from his 2007 ABC News confirmation of the [CIA torture program](/wiki/enhanced-interrogation).' },
    { date: '2013-02-28', description: '[John Kiriakou](/wiki/john-kiriakou) reports to [FCI Loretto](/wiki/fci-loretto) to begin a 30-month sentence under the [Intelligence Identities Protection Act](/wiki/mort-halperin) — the night before, CIA Counterterrorism Director [Jose Rodriguez](/wiki/jose-rodriguez) tweets at him *"Don\'t drop the soap. Haha"* with a laughing emoji.' },
  ],

  // === Pardon-extortion arc ===
  'rudy-giuliani': [
    { date: '2018', description: '[Rudy Giuliani](/wiki/rudy-giuliani) — introduced via [Bernie Kerik](/wiki/bernie-kerik) — meets [John Kiriakou](/wiki/john-kiriakou) and [Bruce Fine](/wiki/bruce-fine) at the Trump International Hotel in Washington; Giuliani\'s aide solicits \\$2 million in exchange for arranging a presidential pardon. Kiriakou refuses.' },
  ],
  'sebastian-gorka': [
    { date: '2018', description: 'Days after the [Giuliani pardon meeting](/wiki/rudy-giuliani), [Sebastian Gorka](/wiki/sebastian-gorka) solicits \\$5,000 from [John Kiriakou](/wiki/john-kiriakou) at a Trump Hotel book launch in exchange for tweeting at President Trump on his behalf. Kiriakou refuses.' },
  ],

  // === JFK / Cold War ===
  'jfk-assassination': [
    { date: '1963-11-22', description: 'President John F. Kennedy is assassinated in Dallas; that afternoon, per Robert F. Kennedy Jr.\'s account to [John Kiriakou](/wiki/john-kiriakou), CIA Director [John McCone](/wiki/john-mccone) answers Bobby Kennedy Sr.\'s driveway question *"Tell me your people didn\'t do this"* with *"I don\'t know who did it."*' },
  ],
  'john-mccone': [
    { date: '1963-11-22', description: 'CIA Director [John McCone](/wiki/john-mccone), at the Kennedy family home Hickory Hill on the afternoon of the [JFK assassination](/wiki/jfk-assassination), tells Bobby Kennedy Sr. — per RFK Jr.\'s account — not that "of course my people didn\'t do it" but *"I don\'t know who did it."*' },
  ],
  'jean-gately': [
    { date: '1961-04', description: '[Jean Gately](/wiki/jean-gately) commands the Bay of Pigs operation against Cuba — the failure he later blames, in a Pakistan-station outburst to [John Kiriakou](/wiki/john-kiriakou), on President Kennedy: *"Fucking Kennedy. We could have won that thing."*' },
  ],
  'jonathan-pollard': [
    { date: '1985', description: 'U.S. Navy intelligence analyst [Jonathan Pollard](/wiki/jonathan-pollard) is arrested for spying for Israel — the canonical proven case [John Kiriakou](/wiki/john-kiriakou) cites against a former [Mossad](/wiki/mossad) director\'s denial of Israeli espionage against the United States.' },
  ],
  'kiki-camarena-case': [
    { date: '1985', description: 'DEA agent Enrique "Kiki" Camarena is abducted and murdered in Mexico; the resulting U.S. statute, per [John Kiriakou](/wiki/john-kiriakou), is the [legal basis](/wiki/kiki-camarena-case) for the 2026 U.S. operation to snatch Venezuelan President Maduro.' },
  ],

  // === Other dated events from the corpus ===
  'noelle-dunphy': [
    { date: '2018', description: 'On the evening of the [Giuliani pardon meeting](/wiki/rudy-giuliani), Giuliani tells aide [Noelle Dunphy](/wiki/noelle-dunphy) he had *"tried to get \\$2 million out of this guy for a pardon today"* — a line she later corroborates to the *New York Times*.' },
  ],
  'mort-halperin': [
    { date: '2013', description: '[Mort Halperin](/wiki/mort-halperin), author of the Intelligence Identities Protection Act, writes to President Obama stating that the statute was not intended for prosecutions like [John Kiriakou](/wiki/john-kiriakou)\'s and that Kiriakou should be pardoned.' },
  ],
  'robert-hanssen': [
    { date: '2001-02', description: 'FBI counterintelligence chief [Robert Hanssen](/wiki/robert-hanssen) is exposed as a Soviet/Russian mole after a year and a half of having framed his CIA counterpart [Brian Kelly](/wiki/brian-kelly) as the source of executed agents.' },
  ],
  'mohammed-atef': [
    { date: '2001-10', description: 'Al-Qaeda\'s actual #3, [Mohammed Atef](/wiki/mohammed-atef), is killed in [Tora Bora](/wiki/abu-zubaydah-capture) when a U.S. rocket strike on his house drives a shard of wood from the kitchen table into his neck.' },
  ],
  'khalid-sheikh-mohammed': [
    { date: '2002', description: 'At a CIA black site, [Abu Zubaydah](/wiki/abu-zubaydah) — interrogated by FBI agent [Ali Soufan](/wiki/ali-soufan) using rapport-based techniques — reveals that the al-Qaeda figure the agency had hunted for six years as *"Mukhtar"* is in fact [Khalid Sheikh Mohammed](/wiki/khalid-sheikh-mohammed).' },
  ],
  'bojinka-plot': [
    { date: '1995-01', description: 'A cleaning lady entering a Manila apartment uncovers plans and photographs for what becomes known as the [Bojinka plot](/wiki/bojinka-plot) — a [Khalid Sheikh Mohammed](/wiki/khalid-sheikh-mohammed) operation to hijack as many as fourteen 747s and fly them into U.S. west-coast buildings.' },
  ],
  'three-saudi-princes': [
    { date: '2002-03', description: 'After the [capture of Abu Zubaydah](/wiki/abu-zubaydah-capture), three Saudi princes named in his address book die within a week of the CIA\'s confrontation of the Saudi government — by heart attack at 43, single-car accident with failed brakes, and thirst alone in the desert. See [the three Saudi princes](/wiki/three-saudi-princes).' },
  ],
  'yellowcake-niger-forgery': [
    { date: '2003-01-28', description: 'President George W. Bush delivers the [Yellowcake Niger forgery](/wiki/yellowcake-niger-forgery) line in the State of the Union — twice pulled out of the draft by the CIA and twice reinserted by [Dick Cheney](/wiki/dick-clarke).' },
  ],
  'gerald-bull': [
    { date: '1990-03-22', description: 'Mossad assassinates British inventor [Gerald Bull](/wiki/gerald-bull) outside his Brussels apartment — only after Iraqi engineers solve his giant gun\'s cracking problem with an internal sleeve they called *"the condom"*.' },
  ],
  'sheikh-jaber-al-ahmad': [
    { date: '1990-08-02', description: 'Amir [Sheikh Jaber al-Ahmad](/wiki/sheikh-jaber-al-ahmad) and the Kuwaiti royal family flee to Saudi Arabia hours after the Iraqi invasion; the government-in-exile is established in Taif under day-to-day leadership of [Sheikh Saad al-Abdullah](/wiki/sheikh-saad-al-abdullah).' },
  ],
  'gina-haspel': [
    { date: '2018', description: '[Gina Haspel](/wiki/gina-haspel) — known internally as *"Bloody Gina"* for having flown to a CIA black site to watch an [enhanced-interrogation](/wiki/enhanced-interrogation) torture session, per [John Kiriakou](/wiki/john-kiriakou) — becomes Director of the CIA under President Trump.' },
  ],
  'pete-seeger': [
    { date: '1958', description: 'Folk singer [Pete Seeger](/wiki/pete-seeger) — [John Kiriakou](/wiki/john-kiriakou)\'s lifelong hero — pleads the First Amendment rather than the Fifth before the House Un-American Activities Committee and is sent to prison for it (later overturned on appeal).' },
  ],
  'ahmed-chalabi': [
    { date: '1991', description: 'The CIA assembles 35 Iraqi opposition groups in a Vienna hotel ballroom and consolidates them as the Iraqi National Congress under [Ahmed Chalabi](/wiki/ahmed-chalabi); within months the \\$6 million in seed funding has been pocketed and Chalabi has paid cash for a Mayfair house, prompting the CIA to issue a worldwide [burn notice](/wiki/petra-bank) on him.' },
  ],
  'george-tenet': [
    { date: '2002-07-31', description: '[George Tenet](/wiki/george-tenet) goes to the White House and wins President Bush\'s approval to strip the FBI of primacy over [Abu Zubaydah](/wiki/abu-zubaydah)\'s interrogation — clearing the path for [enhanced interrogation](/wiki/enhanced-interrogation) to begin.' },
  ],
};

function addEvents(slug, entries) {
  const path = `src/content/articles/${slug}.mdx`;
  let content;
  try { content = readFileSync(path, 'utf8'); }
  catch { console.warn(`  skip (not found): ${slug}`); return false; }

  if (/^events:/m.test(content)) return false;

  const fmEnd = content.indexOf('\n---', 4);
  if (fmEnd === -1) { console.warn(`  skip (no frontmatter): ${slug}`); return false; }

  const yaml = 'events:\n' + entries.map(e =>
    `  - date: '${e.date}'\n    description: '${e.description.replace(/'/g, "''")}'`
  ).join('\n');
  const next = content.slice(0, fmEnd) + '\n' + yaml + content.slice(fmEnd);
  writeFileSync(path, next);
  return true;
}

let added = 0, items = 0;
for (const [slug, entries] of Object.entries(ENTRIES)) {
  if (addEvents(slug, entries)) { added++; items += entries.length; }
}
console.log(`Seeded ${items} events across ${added} articles.`);
