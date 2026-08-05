#!/usr/bin/env node
// Rank thin articles by how much distinctive raw corpus material exists for them.
// Uses the article's own distinctive title terms (not the noisy alias list) and
// counts matching transcript lines across src/content/sources/*.md.
import fs from 'node:fs';
import path from 'node:path';

const ART = 'src/content/articles';
const SRC = 'src/content/sources';
const maxWords = Number(process.argv[2] || 420);

const sources = fs.readdirSync(SRC).filter((f) => f.endsWith('.md') && !f.includes('.sponsors'));
const corpus = sources.map((f) => ({ slug: f.replace(/\.md$/, ''), text: fs.readFileSync(path.join(SRC, f), 'utf8').toLowerCase() }));

const STOP = new Set(['the','and','for','with','from','that','this','john','kiriakou','cia','story','case','his','her','was','are','not','who','how','why','into','over','under','about','john-kiriakou']);

const rows = [];
for (const f of fs.readdirSync(ART)) {
  if (!f.endsWith('.mdx')) continue;
  const slug = f.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(ART, f), 'utf8');
  const words = raw.split(/\s+/).length;
  if (words > maxWords) continue;
  const title = (raw.match(/^title:\s*'?"?(.+?)'?"?$/m) || [, slug.replace(/-/g, ' ')])[1];
  // distinctive phrase = the title itself; fall back to its longest two words
  const terms = [title.toLowerCase().replace(/[^a-z0-9 ]/g, '')];
  const toks = terms[0].split(' ').filter((t) => t.length > 3 && !STOP.has(t));
  if (toks.length >= 2) terms.push(toks.slice(-2).join(' '));
  if (toks.length === 1) terms.push(toks[0]);

  let best = { term: null, hits: 0, srcs: [] };
  for (const t of terms) {
    if (!t || t.length < 7) continue;
    if (!t.includes(' ') && t.length < 9) continue;   // no short single words
    const srcs = corpus.filter((c) => c.text.includes(t)).map((c) => c.slug);
    if (srcs.length > best.hits) best = { term: t, hits: srcs.length, srcs };
  }
  const cited = new Set([...raw.matchAll(/s="([^"]+)"/g)].map((m) => m[1]));
  const fresh = best.srcs.filter((s) => !cited.has(s));
  rows.push({ slug, words, term: best.term, hits: best.hits, fresh: fresh.length, freshSrcs: fresh });
}

rows.sort((a, b) => b.fresh - a.fresh || a.words - b.words);
for (const r of rows.slice(0, Number(process.argv[3] || 70))) {
  console.log(`${String(r.fresh).padStart(3)} fresh | ${String(r.words).padStart(4)}w | ${r.slug}  <<${r.term}>>`);
}
console.log(`\n(${rows.length} articles under ${maxWords} words)`);
