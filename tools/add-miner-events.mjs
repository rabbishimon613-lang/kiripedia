#!/usr/bin/env node
// One-shot: promote day-precise dates Kiriakou utters (surfaced by the
// transcript miner) into events: frontmatter. Idempotent — refuses to
// add a (date, article) pair that already exists.
import { readFileSync, writeFileSync } from 'node:fs';
import yaml from 'js-yaml';

const NEW = {
  'dasht-i-leili-massacre': [
    { date: '2001-11-30', description: '2,000 Taliban soldiers surrender at Mazar-i-Sharif to the [Northern Alliance](/wiki/general-dostum); per [John Kiriakou](/wiki/john-kiriakou) on the Dorey Podcast: *"November 30th and December 1st 2001 we arrested … 2,000 Taliban soldiers."*' },
    { date: '2001-12-01', description: 'Continuation of the Mazar-i-Sharif surrender that produced the [Dasht-i-Leili massacre](/wiki/dasht-i-leili-massacre).' },
  ],
  'saddam-hussein': [
    { date: '1990-08-01', description: 'Kiriakou\'s boss at the CIA: *"Get a good night\'s sleep, because tomorrow\'s going to be a very long day."* The Iraqi military, per [John Kiriakou](/wiki/john-kiriakou), is fully massed on the [Kuwait](/wiki/saud-nasir-al-sabah) border the night before the invasion — *"you could not squeeze one more Iraqi soldier onto the border."*' },
    { date: '1991-01-15', description: 'President Bush\'s ultimatum deadline for Iraqi withdrawal from Kuwait expires; per [John Kiriakou](/wiki/john-kiriakou), *"the 15th of January, that\'s what it was."* Bombing campaign Desert Sword begins immediately after.' },
  ],
  'norman-schwarzkopf': [
    { date: '1991-02-24', description: 'Ground assault begins — [Norman Schwarzkopf](/wiki/norman-schwarzkopf)\'s flanking maneuver, with the main force routed through Saudi Arabia to strike [Iraqi forces](/wiki/saddam-hussein) from the north. The country was liberated in two and a half days.' },
  ],
  'john-kiriakou': [
    { date: '2002-08-01', description: '[John Kiriakou](/wiki/john-kiriakou)\'s first day as Executive Assistant to the CIA Deputy Director for Operations; he is read into six compartments and told the U.S. will invade [Iraq](/wiki/saddam-hussein) in spring 2003 to overthrow Saddam and build the world\'s largest air base in the south.' },
  ],
  'enhanced-interrogation': [
    { date: '2001-09-12', description: 'Neoconservative Richard Perle goes to the White House the morning after [9/11](/wiki/cofer-black) and says, *"we have to attack Iraq."* Per [John Kiriakou](/wiki/john-kiriakou), this is the origin of the case for invasion that would unfold over the next eighteen months.' },
  ],
};

for (const [slug, entries] of Object.entries(NEW)) {
  const path = `src/content/articles/${slug}.mdx`;
  const raw = readFileSync(path, 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) { console.warn(`skip (no frontmatter): ${slug}`); continue; }
  const fm = yaml.load(fmMatch[1]);
  const existing = new Set((fm.events ?? []).map(e => e.date));
  const toAdd = entries.filter(e => !existing.has(e.date));
  if (toAdd.length === 0) { console.log(`= ${slug}: nothing new`); continue; }

  const fmRaw = fmMatch[1];
  const lines = fmRaw.split('\n');
  let eventsStart = lines.findIndex(l => /^events:/.test(l));
  let next;
  if (eventsStart === -1) {
    // No events block — append at end of frontmatter.
    const block = ['events:'];
    for (const e of toAdd) {
      block.push(`  - date: '${e.date}'`);
      block.push(`    description: '${e.description.replace(/'/g, "''")}'`);
    }
    next = lines.concat(block).join('\n');
  } else {
    // Find end of existing events block.
    let i = eventsStart + 1;
    while (i < lines.length && (/^  - /.test(lines[i]) || /^    /.test(lines[i]))) i++;
    const before = lines.slice(0, i);
    const after = lines.slice(i);
    const block = [];
    for (const e of toAdd) {
      block.push(`  - date: '${e.date}'`);
      block.push(`    description: '${e.description.replace(/'/g, "''")}'`);
    }
    next = before.concat(block, after).join('\n');
  }
  const newRaw = raw.replace(/^---\n[\s\S]*?\n---/, `---\n${next}\n---`);
  writeFileSync(path, newRaw);
  console.log(`+ ${slug}: added ${toAdd.length} (${toAdd.map(e => e.date).join(', ')})`);
}
