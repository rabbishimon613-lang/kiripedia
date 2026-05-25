#!/usr/bin/env node
// Strip every `events:` entry whose date is not YYYY-MM-DD.
//
// Rule (locked in ARTICLE-WORKFLOW.md): events: entries must be day-precise
// AND sourced from Kiriakou's mouth. Month-only and year-only entries are
// not "on this day" content — they live in article prose only.
//
// Removes the events: block entirely if no day-precise entries remain.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const dir = 'src/content/articles';
let stripped = 0, blocksRemoved = 0;

for (const f of readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
  const path = `${dir}/${f}`;
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  let fm; try { fm = yaml.load(m[1]); } catch { continue; }
  if (!fm.events || fm.events.length === 0) continue;

  const before = fm.events.length;
  const kept = fm.events.filter(e => /^\d{4}-\d{2}-\d{2}$/.test(String(e.date)));
  if (kept.length === before) continue; // nothing to do

  stripped += (before - kept.length);

  // Rebuild the YAML block: replace the existing events: block with the kept
  // entries (or remove it entirely if empty).
  // We rewrite just the events: section, preserving everything else byte-for-byte.
  const fmRaw = m[1];
  const lines = fmRaw.split('\n');
  const out = [];
  let inEvents = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^events:/.test(line)) {
      inEvents = true;
      continue;
    }
    if (inEvents) {
      // events block continues while we're in indented array items (`  - date:` or `    description:`).
      if (/^  - /.test(line) || /^    /.test(line)) continue;
      inEvents = false;
      // fall through to emit this line normally
    }
    out.push(line);
  }
  // Append the rebuilt events block if there are kept entries.
  if (kept.length > 0) {
    out.push('events:');
    for (const e of kept) {
      out.push(`  - date: '${e.date}'`);
      const desc = String(e.description).replace(/'/g, "''");
      out.push(`    description: '${desc}'`);
    }
  } else {
    blocksRemoved++;
  }
  const newFm = out.join('\n');
  const newRaw = raw.replace(/^---\n[\s\S]*?\n---/, `---\n${newFm}\n---`);
  writeFileSync(path, newRaw);
}

console.log(`Stripped ${stripped} imprecise event entries.`);
console.log(`Removed ${blocksRemoved} now-empty events: blocks.`);
