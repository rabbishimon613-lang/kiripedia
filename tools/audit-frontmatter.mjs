#!/usr/bin/env node
// Catch frontmatter landmines BEFORE astro build does. Astro's error is a
// stack trace pointing at js-yaml; this one points at the actual file/line
// and tells you which pattern broke.
//
// Runs in the `npm run build` chain before astro starts.

import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const dir = 'src/content/articles';
const bugs = [];

for (const f of readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
  const path = `${dir}/${f}`;
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    bugs.push({ file: f, line: 1, issue: 'missing frontmatter delimiters' });
    continue;
  }
  const fm = m[1];
  const lines = fm.split('\n');

  // Pattern 1: backslash-dollar — YAML doesn't accept it in double-quoted
  // strings either. Use a plain $ or wrap in single quotes.
  lines.forEach((ln, i) => {
    if (/\\\$/.test(ln)) {
      bugs.push({ file: f, line: i + 2, issue: `'\\$' escape sequence — use plain '$' or single-quote the string`, snippet: ln.trim() });
    }
  });

  // Pattern 2: unquoted value containing ': ' — YAML reads everything before
  // the colon as a key. Common on summary lines.
  // Skip lines that are already quoted (single or double) or that are pure keys.
  lines.forEach((ln, i) => {
    const km = ln.match(/^(\s*)([\w-]+):\s+(.+)$/);
    if (!km) return;
    const value = km[3];
    // Already quoted, skip.
    if (/^['"]/.test(value)) return;
    // Block scalar or anchor, skip.
    if (/^[|>&*!?]/.test(value)) return;
    // Value contains an unescaped ': ' AFTER the first character → flag.
    if (/.+:\s/.test(value)) {
      bugs.push({
        file: f, line: i + 2,
        issue: `unquoted value contains ': ' — wrap value in single quotes`,
        snippet: ln.trim(),
      });
    }
  });

  // Pattern 3: try a full YAML parse — catches anything the above missed.
  try {
    yaml.load(fm);
  } catch (e) {
    bugs.push({
      file: f,
      line: (e.mark?.line ?? 0) + 2,
      issue: `js-yaml parse error: ${e.reason || e.message}`,
      snippet: (e.mark?.snippet || '').split('\n')[0],
    });
  }
}

if (bugs.length > 0) {
  console.error(`\n=== FRONTMATTER BUGS (${bugs.length}) ===\n`);
  for (const b of bugs) {
    console.error(`  ${b.file}:${b.line}  ${b.issue}`);
    if (b.snippet) console.error(`    > ${b.snippet}`);
  }
  console.error();
  process.exit(1);
}
console.log(`Frontmatter audit: ${readdirSync(dir).filter(x => x.endsWith('.mdx')).length} files clean.`);
