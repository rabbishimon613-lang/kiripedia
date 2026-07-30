#!/usr/bin/env node
// Ledger of transcripts in the corpus that NO article cites — i.e. fetched, normalized, and
// never written from. This is the backlog the perpetual old-content routine eats.
//
// Regenerate any time: node tools/build-unwritten-ledger.mjs
// It rewrites UNWRITTEN-LEDGER.md, preserving any status you've hand-set on a row.
//
// "Cited" = the slug appears in a <Cite s="..."> anywhere in src/content/articles/*.mdx.
// Verified 2026-07-30: every one of 10,438 cites in the corpus carries s=, and no article
// references a source through frontmatter, so that single signal is complete.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';

const SRC = 'src/content/sources';
const ART = 'src/content/articles';
const OUT = 'UNWRITTEN-LEDGER.md';

// ---- what's already been written from --------------------------------------
const cited = new Set();
for (const f of readdirSync(ART).filter(x => x.endsWith('.mdx'))) {
  const body = readFileSync(`${ART}/${f}`, 'utf8');
  for (const m of body.matchAll(/<Cite\s+s="([^"]+)"/g)) cited.add(m[1]);
}

// ---- preserve hand-set statuses from a previous ledger ----------------------
const priorStatus = new Map();
if (existsSync(OUT)) {
  for (const line of readFileSync(OUT, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*[\d—-]+\s*\|\s*([^|]+?)\s*\|.*?\|\s*`([^`]+)`\s*\|/);
    if (m && m[1].trim() && m[1].trim() !== 'pending') priorStatus.set(m[2], m[1].trim());
  }
}

// ---- collect the unwritten -------------------------------------------------
// Host-side shows and clip formats are what the intake playbook rejects: he's the host, not the
// subject, so canon density is low. Flagged rather than dropped — the call stays with the writer.
const LOW_VALUE = /(the-jk-report|jk-report|deep-focus|deprogram|sputnik|shorts|clips?-|compilation|reaction|audiobook|google-play-books)/i;

const rows = [];
for (const f of readdirSync(SRC).filter(x => x.endsWith('.md') && !x.endsWith('.sponsors.md'))) {
  const slug = f.replace(/\.md$/, '');
  if (cited.has(slug)) continue;
  const raw = readFileSync(`${SRC}/${f}`, 'utf8');
  const fm = (k) => (raw.match(new RegExp(`^${k}:\\s*['"]?([^'"\\n]*)`, 'm')) || [, ''])[1].trim();
  const body = raw.split(/^---$/m).slice(2).join('---');
  rows.push({
    slug,
    date: fm('date') || '—',
    show: fm('show') || '—',
    title: (fm('title') || '—').replace(/\|/g, '/').slice(0, 70),
    duration: fm('duration') || '—',
    paras: parseInt(fm('paragraphs')) || 0,
    words: body.split(/\s+/).filter(Boolean).length,
    videoId: fm('videoId') || '—',
    lowValue: LOW_VALUE.test(slug) || LOW_VALUE.test(fm('show')),
  });
}

// Richest first — most unwritten words per transcript read is the best use of a run.
rows.sort((a, b) => b.words - a.words);
const main = rows.filter(r => !r.lowValue);
const flagged = rows.filter(r => r.lowValue);
const sum = (xs) => xs.reduce((n, r) => n + r.words, 0);
const fmtN = (n) => n.toLocaleString('en-US');

const table = (list, offset = 0) => [
  '| # | status | date | show | title | length | words | slug |',
  '|---|---|---|---|---|---|---|---|',
  ...list.map((r, i) =>
    `| ${offset + i + 1} | ${priorStatus.get(r.slug) || 'pending'} | ${r.date} | ${r.show} | ${r.title} | ${r.duration} | ${fmtN(r.words)} | \`${r.slug}\` |`),
].join('\n');

const totalSources = readdirSync(SRC).filter(x => x.endsWith('.md') && !x.endsWith('.sponsors.md')).length;

writeFileSync(OUT, `# Unwritten transcript ledger

Transcripts sitting in the corpus that **no article cites** — fetched, cleaned, never mined.
This is the work queue for the perpetual old-content routine.

- **${fmtN(rows.length)} unwritten** of ${fmtN(totalSources)} transcripts (${fmtN(cited.size)} written from)
- **${fmtN(sum(rows))} transcript words** unread, ~${fmtN(sum(main))} of them in the main queue
- Sorted richest-first: most unwritten words per transcript read
- Regenerate with \`node tools/build-unwritten-ledger.mjs\` — hand-set statuses in the
  \`status\` column are preserved across regenerations

Status vocabulary: \`pending\` · \`in-progress\` · \`written\` · \`rejected (reason)\`.
A row disappears on its own once any article cites it, so \`written\` is belt-and-braces.

---

## Main queue — ${fmtN(main.length)} transcripts, ${fmtN(sum(main))} words

${table(main)}

---

## Flagged low-value — ${fmtN(flagged.length)} transcripts, ${fmtN(sum(flagged))} words

His own shows where he hosts others, clip formats, audiobook samples. The intake playbook
rejects these on discovery; these predate that filter or slipped through. Skim before spending
a run on them — but check rather than assume, a few are real interviews under a bad label.

${table(flagged, main.length)}
`);

console.log(`${rows.length} unwritten (${main.length} main, ${flagged.length} flagged) — ${fmtN(sum(rows))} words → ${OUT}`);
