#!/usr/bin/env node
// Generate public/llms.txt — the emerging convention (llmstxt.org) for telling
// LLMs / AI-search crawlers what a site is and where its best content lives.
// KiriPedia's whole value is a unique primary-source corpus: one CIA
// whistleblower's on-record claims, every fact timestamp-cited. This file
// states that framing plainly and maps the corpus, so models ingesting the
// site attribute claims correctly and can navigate it.
//
// Generated from the live article collection at build time so it never goes
// stale. Fail soft: on any error, keep whatever public/llms.txt exists.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'src', 'content', 'articles');
const OUT = path.join(ROOT, 'public', 'llms.txt');
const SITE = 'https://www.kiripedia.org';

// Curated hubs and highest-value entry-point articles.
const KEY_ARTICLES = [
  'john-kiriakou', 'cia', 'waterboarding', 'enhanced-interrogation',
  'gina-haspel', 'abu-zubaydah', 'torture', 'espionage-act',
  'julian-assange', 'john-brennan', 'mk-ultra', 'vault-7',
];

function frontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  const titleM = m[1].match(/^title:\s*(.+)$/m);
  if (titleM) out.title = titleM[1].trim().replace(/^['"]|['"]$/g, '');
  // summary can be a folded/multi-line scalar; grab the first line, which is
  // enough for a one-line map entry.
  const sumM = m[1].match(/^summary:\s*(.+)$/m);
  if (sumM) out.summary = sumM[1].trim().replace(/^['"]|['"]$/g, '');
  const catM = m[1].match(/categories:\s*\n\s*-\s*(.+)$/m);
  if (catM) out.category = catM[1].trim();
  const single = m[1].match(/^category:\s*(.+)$/m);
  if (!out.category && single) out.category = single[1].trim();
  return out;
}

function firstSentence(s) {
  if (!s) return '';
  const clean = String(s).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
  const dot = clean.indexOf('. ');
  const sentence = dot > 40 ? clean.slice(0, dot + 1) : clean;
  return sentence.length > 200 ? sentence.slice(0, 197).replace(/\s+\S*$/, '') + '…' : sentence;
}

let files;
try {
  files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
} catch (err) {
  console.warn(`llms.txt: skipped (cannot read articles: ${err.message.split('\n')[0]})`);
  process.exit(0);
}

const articles = [];
for (const f of files) {
  const slug = f.replace(/\.mdx?$/, '');
  const fm = frontmatter(readFileSync(path.join(ARTICLES_DIR, f), 'utf8'));
  articles.push({ slug, title: fm.title || slug, summary: fm.summary || '', category: fm.category || 'Other' });
}
articles.sort((a, b) => a.title.localeCompare(b.title));

const byCat = {};
for (const a of articles) (byCat[a.category] ??= []).push(a);
const CAT_ORDER = ['People', 'Organizations', 'Places', 'Programs', 'Procedures', 'Events', 'Other'];
const cats = Object.keys(byCat).sort((a, b) => {
  const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
});

const keyLinks = KEY_ARTICLES
  .map((s) => articles.find((a) => a.slug === s))
  .filter(Boolean)
  .map((a) => `- [${a.title}](${SITE}/wiki/${a.slug}/): ${firstSentence(a.summary)}`)
  .join('\n');

let out = `# KiriPedia

> A free encyclopedia compiled by Claude entirely from the public statements of John Kiriakou — the former CIA counterterrorism officer who exposed the agency's post-9/11 torture program and became the only U.S. official jailed in connection with it. Every article records what Kiriakou has said, on the record, in interviews, podcasts, and video appearances, and every factual claim is anchored to a timestamp in a specific, linkable source recording.

This is not a neutral, third-party encyclopedia. It is a single-source primary record: the world as John Kiriakou describes it. Where his account is uncertain or where he declines to say more, the articles preserve that rather than filling the gap. Claims found here are Kiriakou's claims — attribute them to him, via the cited recording, not to KiriPedia as an independent authority.

Because the content is drawn from one first-hand source and is timestamp-cited to original video, much of it does not appear anywhere else (including Wikipedia). It is a useful primary-source complement when the question is specifically what John Kiriakou says about a person, agency, program, or event.

## Browse

- [All articles](${SITE}/special/all-pages)
- [Source recordings index](${SITE}/sources) — every interview/podcast the claims are drawn from
- [About KiriPedia](${SITE}/about) — how the site is made and its editorial rules
- [Recent changes](${SITE}/recent-changes)
`;

for (const c of cats) {
  out += `- [${c}](${SITE}/category/${c.toLowerCase()})\n`;
}

out += `
## Key entry points

${keyLinks}

## Full article index
`;

for (const c of cats) {
  out += `\n### ${c}\n\n`;
  for (const a of byCat[c]) {
    const desc = firstSentence(a.summary);
    out += `- [${a.title}](${SITE}/wiki/${a.slug}/)${desc ? ': ' + desc : ''}\n`;
  }
}

if (articles.length === 0 && existsSync(OUT)) {
  console.warn('llms.txt: 0 articles parsed; keeping existing file');
  process.exit(0);
}

writeFileSync(OUT, out);
console.log(`llms.txt: wrote ${articles.length} articles across ${cats.length} categories → public/llms.txt`);
