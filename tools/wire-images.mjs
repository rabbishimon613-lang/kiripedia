#!/usr/bin/env node
// Walk every article MDX and inject infobox.image + infobox.imageCredit
// from public/images/credits.json. Articles whose slug isn't in credits.json
// get no image fields — the Infobox component will render "[no image]".

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const ARTICLES_DIR = 'src/content/articles';
const CREDITS_FILE = 'public/images/credits.json';

const credits = JSON.parse(readFileSync(CREDITS_FILE, 'utf8'));
const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.mdx'));

let wired = 0;
let cleared = 0;
let untouched = 0;

for (const file of files) {
  const slug = file.replace(/\.mdx$/, '');
  const path = join(ARTICLES_DIR, file);
  const raw = readFileSync(path, 'utf8');

  // Split frontmatter from body
  const match = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) {
    console.log(`✗ ${slug} — no frontmatter`);
    continue;
  }

  const fm = yaml.load(match[1]);
  fm.infobox = fm.infobox || {};
  fm.infobox.data = fm.infobox.data || {};

  const cred = credits[slug];

  if (cred) {
    const newImage = cred.file;
    const newCredit = formatCredit(cred);
    if (fm.infobox.image === newImage && fm.infobox.imageCredit === newCredit) {
      untouched++;
      continue;
    }
    fm.infobox.image = newImage;
    fm.infobox.imageCredit = newCredit;
    wired++;
  } else {
    // No image for this article — clear any stale fields so the Infobox
    // component falls through to the [no image] placeholder.
    let changed = false;
    if ('image' in fm.infobox) { delete fm.infobox.image; changed = true; }
    if ('imageCredit' in fm.infobox) { delete fm.infobox.imageCredit; changed = true; }
    if ('imageCaption' in fm.infobox) { delete fm.infobox.imageCaption; changed = true; }
    if (changed) cleared++;
    else untouched++;
  }

  const newYaml = yaml.dump(fm, { lineWidth: 1000, noRefs: true });
  const out = `---\n${newYaml.trimEnd()}\n---\n${match[2]}`;
  writeFileSync(path, out);
}

console.log(`\nWired: ${wired}`);
console.log(`Cleared (no image): ${cleared}`);
console.log(`Untouched: ${untouched}`);
console.log(`Total articles: ${files.length}`);

function formatCredit(c) {
  const artist = (c.artist || 'Unknown').trim();
  const license = (c.license || 'See Wikimedia Commons').trim();
  return `Photo: ${artist} / ${license} via Wikimedia Commons`;
}
