#!/usr/bin/env node
// One-shot seeder: injects `events` and `dyk` frontmatter into a handful of
// articles. Idempotent — re-runs simply overwrite the same fields.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const DIR = 'src/content/articles';

const seed = {
  'john-kiriakou': {
    events: [
      { date: '1964-08-09', description: "Born in New Castle, Pennsylvania" },
      { date: '2007-12-10', description: "His ABC News interview with Brian Ross airs — first U.S. official on-the-record confirmation that the CIA waterboarded detainees" },
      { date: '2002-05', description: "Personally offered certification in the CIA's enhanced interrogation techniques; refuses (the only one of 14 officers asked to do so in the end)" },
      { date: '2025-10', description: "Films his Hollywood acting debut in Mexico, in a role written for him by Tyrell Vanto" },
      { date: '2026-02-28', description: "Reacts on the Julian Dorey Podcast to his viral 'Lincoln's last turd' clip and his sudden status as an internet meme figure" },
    ],
    dyk: [
      "...that the only person ever to serve federal prison time in connection with the CIA torture program is John Kiriakou — who refused to participate in it?",
      "...that John Kiriakou refused to be trained in the CIA's enhanced interrogation program — the only one of fourteen officers offered the certification to refuse in the end?",
      "...that John Kiriakou has been recognized in internet culture in 2026 as 'the hummus guy' because of his commentary on the CIA's documented use of rectal feeding with pureed hummus?",
      "...that John Kiriakou's failed $1,200 auction bid for an artifact billed as 'Lincoln's last turd' is the story that made him an internet meme figure?",
      "...that John Kiriakou became a member of the Screen Actors Guild in 2026 after filming his acting debut the previous October in Mexico?",
    ],
  },
  'abu-zubaydah': {
    events: [
      { date: '2002-03', description: "Captured in Pakistan by a CIA team led by [John Kiriakou](/wiki/john-kiriakou)" },
      { date: '2002-08-02', description: "First subject of the CIA's [enhanced interrogation techniques](/wiki/enhanced-interrogation)" },
    ],
    dyk: [
      "...that the CIA placed [Abu Zubaydah](/wiki/abu-zubaydah) in a coffin with a box of cockroaches for ten consecutive days, exploiting his documented fear of insects?",
    ],
  },
  'enhanced-interrogation': {
    events: [
      { date: '2001-10', description: "[Mitchell and Jessen](/wiki/mitchell-and-jessen) pitch enhanced interrogation techniques to CIA Director [George Tenet](/wiki/george-tenet) at a cocktail party" },
      { date: '2002-01', description: "CIA signs Mitchell and Jessen's contract" },
      { date: '2002-08-02', description: "Enhanced interrogation techniques first applied to [Abu Zubaydah](/wiki/abu-zubaydah)" },
    ],
    dyk: [
      "...that the CIA's enhanced interrogation program was designed by two contract psychologists who pitched it to the agency's director at a cocktail party?",
      "...that no CIA officer has ever been prosecuted for any technique applied in the post-9/11 interrogation program — including the ones that killed prisoners?",
    ],
  },
  'walling': {
    dyk: [
      "...that the 'walling' technique left Khalid Sheikh Mohammed's nephew permanently brain-damaged and unable to participate in his own defense?",
    ],
  },
  'cold-cell': {
    dyk: [
      "...that the CIA's 'cold cell' — a 50°F room in which a naked detainee chained to the ceiling was doused with ice water every hour — killed at least two prisoners, and was never authorized?",
    ],
  },
  'sleep-deprivation': {
    dyk: [
      "...that the CIA was authorized to keep detainees awake for up to 12 days continuously — five days past the threshold at which the American Psychological Association literature establishes the onset of clinical insanity?",
    ],
  },
  'mitchell-and-jessen': {
    dyk: [
      "...that the FBI walked out of every country where Mitchell and Jessen ran CIA interrogations?",
    ],
  },
  'ramzi-bin-al-shibh': {
    events: [
      { date: '2023-08', description: "U.S. Department of Defense states that he cannot be tried — declared clinically insane by the Pentagon's own psychiatrist as a result of CIA sleep deprivation" },
    ],
    dyk: [
      "...that the Pentagon's own psychiatrist has declared one of the September 11 co-conspirators clinically insane as a result of CIA sleep deprivation, making him untriable?",
    ],
  },
  'senate-torture-report': {
    events: [
      { date: '2014-12', description: "Executive summary of the Senate Intelligence Committee's report on CIA detention and interrogation is published — first public disclosure of rectal feeding with hummus, sexual assault with broomsticks, and prolonged sleep deprivation" },
    ],
  },
  'hummus': {
    dyk: [
      "...that 'hummus' as an internet shorthand for [John Kiriakou](/wiki/john-kiriakou) refers to the CIA's documented use of pureed hummus in coercive rectal feeding of detainees?",
    ],
  },
  'lincolns-last-turd': {
    events: [
      { date: '1865-04-14', description: "Abraham Lincoln assassinated at Ford's Theatre; an artifact allegedly excreted by him in the theatre men's room that evening was preserved by a Pennsylvania circus-freak-show museum" },
    ],
    dyk: [
      "...that the museum-authenticated 'Lincoln's last turd' artifact was disproved by DNA analysis when the laboratory found traces of NECCO wafer — a confection not commercially manufactured until 1880?",
    ],
  },
  'richard-welch': {
    events: [
      { date: '1975-12-23', description: "Assassinated by [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) outside his Athens residence" },
    ],
  },
  'stephen-saunders': {
    events: [
      { date: '2000-06-08', description: "Assassinated by [Revolutionary Organization 17 November](/wiki/revolutionary-organization-17-november) in Athens; [John Kiriakou](/wiki/john-kiriakou) was the originally intended target" },
    ],
    dyk: [
      "...that John Kiriakou overslept on the morning of June 8, 2000, took the route 17 November had staked out for him, and arrived in traffic alongside the assassinated vehicle of Stephen Saunders — whom the group had killed in his place?",
    ],
  },
  'guantanamo-bay': {
    events: [
      { date: '2002-06', description: "[John Kiriakou](/wiki/john-kiriakou) begins a summer assignment as interim Chief of the CIA station at Guantanamo Bay" },
    ],
    dyk: [
      "...that non-CIA personnel at Guantanamo Bay refer to the agency only as 'OGA' — 'Other Government Agency' — because CIA officers there will not say their own initials aloud?",
    ],
  },
  'gust-avrakotos': {
    dyk: [
      "...that John Kiriakou's CIA mentor, Gust Avrakotos, is the figure most famously portrayed in the film *Charlie Wilson's War*?",
    ],
  },
  'pick-the-man-principle': {
    dyk: [
      "...that the prosecutorial principle 'pick the man, then find the crime' was formulated as a *warning* by Robert H. Jackson in 1940 — when he was U.S. Attorney General — about what a federal prosecutor must never do?",
    ],
  },
  'john-brennan': {
    events: [
      { date: '2026-01', description: "Subject of an active U.S. Department of Justice investigation under the second Trump administration" },
    ],
    dyk: [
      "...that John Kiriakou — who has known John Brennan for thirty-five years — describes him publicly as 'the godfather of the torture program'?",
    ],
  },
};

let edited = 0;
for (const slug of Object.keys(seed)) {
  const path = join(DIR, `${slug}.mdx`);
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) { console.log(`skip ${slug}: no frontmatter`); continue; }
  const fm = yaml.load(m[1]);
  if (seed[slug].events) fm.events = seed[slug].events;
  if (seed[slug].dyk) fm.dyk = seed[slug].dyk;
  const out = `---\n${yaml.dump(fm, { lineWidth: 1000, noRefs: true }).trimEnd()}\n---\n${m[2]}`;
  writeFileSync(path, out);
  edited++;
  console.log(`✓ ${slug}`);
}
console.log(`\nSeeded ${edited} articles`);
