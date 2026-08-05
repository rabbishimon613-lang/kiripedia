#!/usr/bin/env node
// Canonical show names for /sources.
//
// Two layers, in order:
//
//   1. Ground truth — tools/channel-map.json holds the real publishing channel
//      for each source, fetched from YouTube by tools/resolve-channels.mjs.
//      This beats whatever was typed at ingest time, which drifted badly:
//      names truncated at ~26 characters, five spellings of one show, and a
//      literal "?" whenever the ingester didn't know.
//
//   2. Editorial aliases — the map below. Hosts publish across several
//      channels (main, clips, daily, live, archive) or rename over the years.
//      From KiriPedia's point of view those are one show and collapse into one
//      entry. Patterns are tested case-insensitively against the layer-1 name.
//
// Sources whose video is private, deleted, or not on YouTube at all (the Dead
// Drop podcast feed) keep their hand-typed name, still passed through layer 2.
// Nothing is ever dropped — this only renames.
//
// Usage:
//   node tools/show-aliases.mjs           # report what would change
//   node tools/show-aliases.mjs --fix     # rewrite the show: field

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const ALIASES = [
  // Multi-channel shows and long-running renames
  [/^deprogram/i,                       'DeProgram Show with Ted Rall and Jamarl Thomas'],
  [/^deep focus/i,                      'The Deep Focus Show'],
  [/^julian dorey/i,                    'Julian Dorey Podcast'],
  [/^(powerfuljre|the joe rogan)/i,     'The Joe Rogan Experience'],
  [/^(theo von|this past weekend)/i,    'This Past Weekend w/ Theo Von'],
  [/^tucker carlson/i,                  'Tucker Carlson Network'],
  [/^david gornoski/i,                  'David Gornoski'],
  [/^dialogue works/i,                  'Dialogue Works'],
  [/^(judge napolitano|judging freedom)/i, 'Judging Freedom (Judge Napolitano)'],
  [/^(the )?carlos watson/i,            'The Carlos Watson Podcast'],
  [/^(the )?opperman report/i,          'The Opperman Report'],
  [/^(the )?megyn kelly/i,              'The Megyn Kelly Show'],
  [/^(kevin gosztola|the dissenter)/i,  'Kevin Gosztola (The Dissenter)'],
  [/^(the )?jay dyer/i,                 'Jay Dyer'],
  [/^danny jones/i,                     'Danny Jones Podcast'],
  [/^(reality asserts itself|real news — reality)/i, 'Reality Asserts Itself (Paul Jay)'],
  [/^the real news/i,                   'The Real News Network'],
  [/^lee camp/i,                        'Lee Camp — Unredacted Tonight'],
  [/^panquake/i,                        'Panquake / #TalkLiberation'],
  [/^tcm /i,                            'TCM'],
  [/^insider/i,                         'Insider'],
  [/^tedx/i,                            'TEDx Talks'],

  // Names that were cut off mid-word by the old ingest field
  [/^the clear signal/i,                'The Clear Signal (Steve Visscher)'],
  [/^the third way/i,                   'The Third Way (Orthodox Thought)'],
  [/^elizabeth lane/i,                  'Elizabeth Lane TV'],
  [/^fortress on a hill/i,              'Fortress On A Hill'],
  [/^due dissidence/i,                  'Due Dissidence'],
  [/^unfiltered with s\.? ?a\.? ?m/i,   'Unfiltered With S.A.M.'],
  [/^live on the fly/i,                 'Live on the Fly (Randy Credico)'],
  [/^the bitter truth/i,                'The Bitter Truth with Abe Abdelhadi'],
  [/^voices of liberty/i,               'Voices of Liberty'],
  [/^cleared hot/i,                     'Cleared Hot Podcast'],
  [/^tin foil hat/i,                    'Tin Foil Hat with Sam Tripoli'],
  [/^the zero hour/i,                   'The Zero Hour (RJ Eskow)'],
  [/^the roundtable/i,                  'The Roundtable (Gonzalo Lira)'],
  [/^the pocket/i,                      'The Pocket (Chris Griffin)'],
  [/^matthew cox/i,                     'Inside True Crime (Matthew Cox)'],
  [/^o.?keefe media/i,                  "O'Keefe Media Group"],
  [/^ronpaullibertyreport|^ron paul/i,  'Ron Paul Liberty Report'],
  [/^(the )?diary of a ceo/i,           'The Diary of a CEO'],
  [/^the chris hedges/i,                'The Chris Hedges Report'],
  [/^afshin rattansi/i,                 "Afshin Rattansi's Going Underground"],
  [/^warren smith/i,                    'Warren Smith — Secret Scholar Society'],
  [/^(help lawyer|the legal owl)/i,     'The Legal Owl'],
  [/^government accountability/i,       'Government Accountability Project'],
  [/^human rights defense/i,            'Human Rights Defense Center'],
  [/^stack the legal odds/i,            'Stack The Legal Odds In Your Favor'],
  [/^connecting the dots/i,             'Connecting the Dots (Dr. Wilmer Leon)'],
  [/^spartan leadership/i,              'Spartan Leadership Podcast'],
  [/^the ripple effect/i,               'The Ripple Effect Podcast'],
  [/^alittlepart/i,                     'Alittlepart Ofme (CallMeCookie)'],
  [/^walk with history/i,               'Walk With History'],
  [/^gold shields/i,                    'Gold Shields'],
  [/^jared leto/i,                      'Jared Leto — Beyond the Horizon'],
  [/^washington report on mid/i,        'Washington Report on Middle East Affairs'],
  [/^the never broken/i,                'The Never Broken Podcast'],
  [/^the dive in with rattan/i,         'The Dive In With Rattan'],
  [/^lawyers.? committee for 9/i,       "Lawyers' Committee for 9/11 Inquiry"],
  [/^foreign correspondents/i,          'Foreign Correspondents: Deeper into Hitchcock'],
  [/^heidi weber/i,                     'Heidi Weber'],
  [/^adventures in the free stat/i,     'Adventures in the Free State'],
  [/^fort collins community act/i,      'Fort Collins Community Action Network'],
  [/^the unfettered speech/i,           'The Unfettered Speech Podcast'],
  [/^the information rights/i,          'The Information Rights Project'],
  [/^addy adds/i,                       'Addy Adds Official'],
  [/^the devory darkins/i,              'The DeVory Darkins Interview'],
  [/^jackson hinkle/i,                  'Jackson Hinkle Official'],
  [/^former congressman matt ga/i,      'Former Congressman Matt Gaetz'],
  [/^eyes wide open/i,                  'Eyes Wide Open (Conor Ryan)'],
  [/^indie news network/i,              'Indie News Network (INN)'],
  [/^a good place with ella/i,          'A Good Place with Ella'],
  [/^barracks media/i,                  'Barracks Media'],
  [/^bulwarg/i,                         'Bulwarg'],
  [/^joe mkhitaryan/i,                  'Joe Mkhitaryan'],
  [/^tmj news/i,                        'TMJ News Network'],
  [/^cafe weltschmerz/i,                'Cafe Weltschmerz'],

  // Non-English channels — keep the native name, add a readable English gloss
  [/^(بدون ورق|بودكاست بدون ورق|bidoun waraq)/i, 'Bidoun Waraq (بدون ورق)'],
  [/^al ?jazeera arabic/i,              'Al Jazeera Arabic (الجزيرة)'],
  [/^alarabiya/i,                       'Al Arabiya (العربية)'],
  [/^环球时报/,                          'Global Times (环球时报)'],
  [/^σάββας καλεντερίδης/i,             'Savvas Kalenteridis (Σάββας Καλεντερίδης)'],
  [/^χρήστος κωνσταντινίδης/i,          'Christos Konstantinidis (Χρήστος Κωνσταντινίδης)'],

  // Everything else keeps its real channel name.
];

const DIR = 'src/content/sources';
const MAP = 'tools/channel-map.json';
const fix = process.argv.includes('--fix');
const channels = existsSync(MAP) ? JSON.parse(readFileSync(MAP, 'utf8')) : {};

function canonical(name) {
  const s = String(name || '').replace(/\s+/g, ' ').trim();
  for (const [rx, canon] of ALIASES) if (rx.test(s)) return canon;
  return s;
}

let changed = 0, unresolved = 0;
const before = new Set(), after = new Set();

for (const f of readdirSync(DIR).filter(x => x.endsWith('.md') && !x.endsWith('.sponsors.md'))) {
  const path = `${DIR}/${f}`;
  const content = readFileSync(path, 'utf8');
  const m = content.match(/^show:\s*(.+)$/m);
  if (!m) continue;
  const current = m[1].trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"');

  const truth = channels[f]?.channel;
  if (!truth) unresolved++;
  // A hand-typed "?" carries no information; without ground truth, say so plainly.
  const base = truth || (/^\??$/.test(current) ? 'Unidentified channel' : current);
  const want = canonical(base);

  before.add(current);
  after.add(want);
  if (current === want) continue;
  changed++;
  if (!fix) console.log(`  ${current}  →  ${want}`);
  else writeFileSync(path, content.replace(/^show:\s*.+$/m, `show: ${JSON.stringify(want)}`));
}

console.log(
  `\n${changed} source(s) renamed · ${before.size} distinct names → ${after.size}` +
  ` · ${unresolved} kept hand-typed (private, deleted, or podcast-only)`
);
if (!fix && changed) console.log('Re-run with --fix to apply.');
