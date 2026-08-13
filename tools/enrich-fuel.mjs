#!/usr/bin/env node
// Print the enrichment fuel for one article: every paragraph in a source the
// article does NOT already cite where two distinct distinctive title tokens
// co-occur within a window — with the neighbouring paragraphs, so the passage
// can be read in context and the speaker checked before anything is cited.
//
// Usage:
//   node tools/enrich-fuel.mjs <article-slug> [--tokens a,b,c] [--window 90]
//                              [--ctx 1] [--max 40] [--all-sources]
//
// --tokens overrides the tokens derived from the title (use when the title is
// a sentence and the real subject is a name that does not appear in it).
// --all-sources includes sources the article already cites (for re-reading a
// story the article covers thinly).

import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const ARTICLES = 'src/content/articles';
const SOURCES = 'src/content/sources';

const argv = process.argv.slice(2);
const slug = argv[0];
if (!slug) { console.error('usage: enrich-fuel.mjs <article-slug> [--tokens a,b]'); process.exit(1); }
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const WINDOW = Number(opt('window', 90));
const CTX = Number(opt('ctx', 1));
const MAX = Number(opt('max', 40));
const ALL_SOURCES = argv.includes('--all-sources');

const raw = readFileSync(`${ARTICLES}/${slug}.mdx`, 'utf8');
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
const fm = yaml.load(fmMatch[1]);
const body = raw.slice(fmMatch[0].length);
const cited = new Set([...body.matchAll(/<Cite\s+s=["']([^"']+)["']/g)].map(m => m[1]));

const STOP = new Set(['the','a','an','and','or','of','in','on','to','for','at','as','by','with','from','into','that','this','his','her','their','its','was','were','is','are','be','been','not','no','but','it','he','she','they','we','you','i','who','what','when','why','how','kiriakou','john','cia']);

let tokens = opt('tokens', null);
tokens = tokens
  ? tokens.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  : [...new Set((String(fm.title).toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []).filter(t => !STOP.has(t)))];

console.log(`# ${slug} — "${fm.title}"`);
console.log(`# tokens: ${tokens.join(', ')}   already cites ${cited.size} source(s)\n`);

function clean(t) {
  return t.replace(/\[(music|applause|laughter|laughs|inaudible)\]/gi, ' ');
}

let printed = 0;
for (const f of readdirSync(SOURCES).filter(x => x.endsWith('.md'))) {
  const sSlug = f.replace(/\.md$/, '');
  if (!ALL_SOURCES && cited.has(sSlug)) continue;
  const src = readFileSync(`${SOURCES}/${f}`, 'utf8');
  const sBody = src.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const paras = [];
  let cur = null;
  for (const line of sBody.split('\n')) {
    const m = line.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/);
    if (m) { if (cur) paras.push(cur); cur = { t: m[1], text: m[2] }; }
    else if (cur && line.trim()) cur.text += ' ' + line.trim();
  }
  if (cur) paras.push(cur);

  const hitIdx = [];
  paras.forEach((p, idx) => {
    const text = clean(p.text).toLowerCase();
    const pos = [];
    for (const t of tokens) {
      const rx = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      let m; while ((m = rx.exec(text))) pos.push({ t, i: m.index });
    }
    if (pos.length < 2) return;
    pos.sort((x, y) => x.i - y.i);
    for (let i = 0; i < pos.length; i++)
      for (let j = i + 1; j < pos.length; j++) {
        if (pos[j].i - pos[i].i > WINDOW) break;
        if (pos[j].t !== pos[i].t) { hitIdx.push(idx); return; }
      }
  });
  if (!hitIdx.length) continue;

  // merge into ranges with context
  const wanted = new Set();
  for (const i of hitIdx) for (let k = i - CTX; k <= i + CTX; k++) if (k >= 0 && k < paras.length) wanted.add(k);
  const ordered = [...wanted].sort((a, b) => a - b);

  console.log(`\n===== ${sSlug} =====`);
  let last = -99;
  for (const i of ordered) {
    if (i !== last + 1) console.log('  ...');
    const mark = hitIdx.includes(i) ? '*' : ' ';
    console.log(`${mark}[${paras[i].t}] ${paras[i].text}`);
    last = i;
  }
  if (++printed >= MAX) { console.log(`\n(stopped after ${MAX} sources)`); break; }
}
