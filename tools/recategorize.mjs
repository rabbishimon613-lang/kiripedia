#!/usr/bin/env node
// One-shot recategorization. Replaces the old 7-category mess (People,
// Agencies, Operations, Events, Concepts, Cases, Places) with a clean
// 6-category taxonomy:
//
//   People        — real human beings
//   Organizations — agencies, contractors, lobbies, terrorist groups, units
//   Places        — geographic locations and physical facilities
//   Programs      — named programs and operations (EIT, MK-Ultra, Vault 7…)
//   Tradecraft    — techniques, doctrines, laws, abstract methods
//   Events        — singular dated occurrences (Iran 12-Day War, Dasht-i-Leili…)
//
// Articles can belong to multiple categories.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const DIR = 'src/content/articles';

// Explicit per-article mapping. If an article isn't listed, the script
// will warn so I can add it.
const MAP = {
  // === People (real humans) ===
  'abu-zubaydah': ['People'],
  'admiral-crowe': ['People'],
  'alex-karp': ['People'],
  'ali-soufan': ['People'],
  'anwar-al-awlaki': ['People'],
  'benazir-bhutto': ['People'],
  'bill-buckley': ['People'],
  'bill-casey': ['People'],
  'bill-richardson': ['People'],
  'billy-wall': ['People'],
  'bob-cia-hr': ['People'],
  'cofer-black': ['People'],
  'cori-bush': ['People'],
  'david-ransom': ['People'],
  'erik-prince': ['People'],
  'gerald-post': ['People'],
  'general-dostum': ['People'],
  'george-tenet': ['People'],
  'gust-avrakotos': ['People'],
  'hassan-nasrallah': ['People'],
  'imran-khan': ['People'],
  'jamaal-bowman': ['People'],
  'james-angleton': ['People'],
  'jason-leopold': ['People'],
  'jeff-fahey': ['People'],
  'jim-pavitt': ['People'],
  'joe-biden': ['People'],
  'john-brennan': ['People'],
  'john-kerry': ['People'],
  'john-kiriakou': ['People'],
  'john-mccain': ['People'],
  'john-rendon': ['People'],
  'john-walker-lindh': ['People'],
  'joko-widodo': ['People'],
  'jonathan-pollard': ['People'],
  'jose-rodriguez': ['People'],
  'joshua-schulte': ['People'],
  'josh-shapiro': ['People'],
  'karl-rove': ['People'],
  'ken-dilanian': ['People'],
  'khaled-mashal': ['People'],
  'mack-mclarty': ['People'],
  'mahmoud-al-mabhouh': ['People'],
  'mahmud': ['People'],
  'mark-mcdougall': ['People'],
  'martha-kesler': ['People'],
  'michael-hastings': ['People'],
  'mike-baker': ['People'],
  'mike-spann': ['People'],
  'mitchell-and-jessen': ['People'],
  'muhammad-atar': ['People'],
  'peter-thiel': ['People'],
  'plato-cacheras': ['People'],
  'prince-muhammad-bin-naif': ['People'],
  'ramzi-bin-al-shibh': ['People'],
  'richard-welch': ['People'],
  'roger-waters': ['People'],
  'sharon-scranage': ['People'],
  'stephen-saunders': ['People'],
  'steve-kappes': ['People'],
  'ted-rall': ['People'],
  'trita-parsi': ['People'],
  'tyrell-vanto': ['People'],

  // === Organizations (agencies, contractors, lobbies, terror groups, units) ===
  'aipac': ['Organizations'],
  'analysis-corporation': ['Organizations'],
  'arrais-corporation': ['Organizations'],
  'black-cube': ['Organizations'],
  'blackwater': ['Organizations'],
  'cia': ['Organizations'],
  'cia-national-resources-division': ['Organizations'],
  'cia-political-psychology-division': ['Organizations'],
  'dgse': ['Organizations'],
  'five-eyes': ['Organizations'],
  'ground-branch': ['Organizations'],
  'grs-global-response-staff': ['Organizations'],
  'in-q-tel': ['Organizations'],
  'mossad': ['Organizations'],
  'national-endowment-for-democracy': ['Organizations'],
  'palantir': ['Organizations'],
  'revolutionary-organization-17-november': ['Organizations'],
  'special-activities-division': ['Organizations'],

  // === Places ===
  'bluffdale-nsa-facility': ['Places'],
  'drone-base-balochistan': ['Places'],
  'falls-church-mosque': ['Places'],
  'fci-loretto': ['Places'],
  'guantanamo-bay': ['Places'],
  'mount-weather': ['Places'],
  'strawberry-fields': ['Places'],
  'the-farm': ['Places'],
  'yemen': ['Places'],

  // === Programs (named programs and operations) ===
  'enhanced-interrogation': ['Programs'],
  'mk-ultra': ['Programs'],
  'operation-mockingbird': ['Programs'],
  'tuesday-morning-kill-list': ['Programs'],
  'vault-7': ['Programs'],

  // === Tradecraft (techniques, doctrines, laws, abstract methods) ===
  'asset-acquisition-cycle': ['Tradecraft'],
  'cold-cell': ['Tradecraft'],
  'executive-order-12333': ['Tradecraft'],
  'hummus': ['Tradecraft'],
  'operating-directive': ['Tradecraft'],
  'pick-the-man-principle': ['Tradecraft'],
  'sleep-deprivation': ['Tradecraft'],
  'soylent-green-cable-easter-egg': ['Tradecraft'],
  'surveillance-detection-route': ['Tradecraft'],
  'ticking-time-bomb': ['Tradecraft'],
  'title-10-vs-title-50': ['Tradecraft'],
  'walling': ['Tradecraft'],
  'welch-45': ['Tradecraft'],

  // === Events (singular dated occurrences) ===
  'bojinka-plot': ['Events'],
  'dasht-i-leili-massacre': ['Events'],
  'iran-12-day-war': ['Events'],
  'kuwait-liberation-day': ['Events'],
  'lincolns-last-turd': ['Events'],
  'ninth-circuit-contractor-ruling-2025': ['Events'],
  'qala-i-jangi-uprising': ['Events'],
  'senate-torture-report': ['Events'],
};

const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx'));

const tally = { changed: 0, missing: [] };
const newCategoryCounts = {};

for (const file of files) {
  const slug = file.replace(/\.mdx$/, '');
  const path = join(DIR, file);
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) continue;

  const fm = yaml.load(m[1]);
  const newCats = MAP[slug];
  if (!newCats) {
    tally.missing.push(slug);
    continue;
  }
  // Drop the old `category` (singular) field — we only use `categories` (plural) now
  if ('category' in fm) delete fm.category;
  fm.categories = newCats;
  for (const c of newCats) newCategoryCounts[c] = (newCategoryCounts[c] ?? 0) + 1;

  const newYaml = yaml.dump(fm, { lineWidth: 1000, noRefs: true });
  const out = `---\n${newYaml.trimEnd()}\n---\n${m[2]}`;
  writeFileSync(path, out);
  tally.changed++;
}

console.log(`\nRecategorized: ${tally.changed} articles\n`);
console.log('New category counts:');
const order = ['People', 'Organizations', 'Places', 'Programs', 'Tradecraft', 'Events'];
for (const c of order) {
  console.log(`  ${(newCategoryCounts[c] ?? 0).toString().padStart(3)}  ${c}`);
}
if (tally.missing.length) {
  console.log(`\nMissing from mapping (need to add):`);
  tally.missing.forEach((s) => console.log(`  - ${s}`));
}
