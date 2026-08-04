#!/usr/bin/env node
// Build src/data/related.json — a "Related articles" block for every article.
//
// Why. Search Console's internal-link report showed 8,677 internal links, of
// which ~8,620 pointed at the homepage and the six category pages: the nav
// chrome, repeated on every page, was absorbing essentially all of the site's
// internal link equity. Individual articles got almost nothing (abu-zubaydah
// 53, david-rockefeller-bahrain 4, most of the corpus 0). On top of that, 106
// of 822 articles are true orphans with no inbound wikilink from anywhere in
// the corpus, and the median article has 2. That is why Google reports 92
// pages "Crawled - currently not indexed" and 57 "Discovered - currently not
// indexed": it can reach those pages, but nothing on the site vouches for them.
//
// A related-articles block is the standard fix. It converts the corpus's own
// structure into editorial links, spreads equity down into the long tail, and
// gives a reader who landed from a search a next click — which is also the
// bounce-rate lever (currently 77%).
//
// Relatedness is scored from what the corpus already knows, not from guessing:
//
//   shared cited source recordings   x4   — the strongest signal by far. Two
//                                            articles citing the same interview
//                                            at the same event are the same story.
//   direct wikilink (either way)     x3   — already editorially asserted
//   shared outbound wikilinks        x1   — bibliographic coupling
//   shared categories                x1   — weak, breaks ties
//
// john-kiriakou is excluded as a coupling term: it appears in 805 of 822
// articles, so it says nothing about whether two articles are related.
//
// Finally an orphan-rescue pass guarantees every article is surfaced by at
// least MIN_INBOUND others, so no page stays unreachable by link.
//
// Run standalone or via `npm run build` (see package.json prebuild wiring).

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = join(ROOT, 'src/content/articles');
const OUT = join(ROOT, 'src/data/related.json');

const RELATED_PER_PAGE = 6;
const MIN_INBOUND = 3;
// Hubs so large that sharing them means nothing.
const STOP_LINKS = new Set(['john-kiriakou', 'cia']);

function frontmatter(text) {
  if (!text.startsWith('---')) return { fm: '', body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: text };
  return { fm: text.slice(3, end), body: text.slice(end + 4) };
}

// The frontmatter is YAML but we only need three scalar-ish fields, and adding
// a YAML dependency to a build step that runs on every deploy is not worth it.
function field(fm, name) {
  const m = new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(fm);
  if (!m) return '';
  return m[1].trim().replace(/^["'](.*)["']$/, '$1');
}
function categories(fm) {
  const m = /^categories:\s*\n((?:\s*-\s*.+\n?)+)/m.exec(fm);
  if (!m) return [];
  return [...m[1].matchAll(/-\s*(.+)/g)].map((x) => x[1].trim());
}

const files = (await readdir(ARTICLES)).filter((f) => f.endsWith('.mdx'));
const slugs = new Set(files.map((f) => f.slice(0, -4)));

const meta = new Map();
for (const f of files) {
  const slug = f.slice(0, -4);
  const raw = await readFile(join(ARTICLES, f), 'utf8');
  const { fm, body } = frontmatter(raw);
  const links = new Set(
    [...body.matchAll(/\]\(\/wiki\/([a-z0-9-]+)\/?\)/g)]
      .map((m) => m[1])
      .filter((s) => s !== slug && slugs.has(s) && !STOP_LINKS.has(s)),
  );
  const sources = new Set([...raw.matchAll(/<Cite\s+s="([^"]+)"/g)].map((m) => m[1]));
  meta.set(slug, {
    slug,
    title: field(fm, 'title') || slug,
    summary: field(fm, 'summary'),
    cats: categories(fm),
    links,
    sources,
  });
}

// Inverted indexes, so scoring only visits pairs that actually share something
// rather than all 822^2 combinations.
const bySource = new Map();
const byLink = new Map();
const byCat = new Map();
const push = (map, key, slug) => {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(slug);
};
for (const a of meta.values()) {
  for (const s of a.sources) push(bySource, s, a.slug);
  for (const l of a.links) push(byLink, l, a.slug);
  for (const c of a.cats) push(byCat, c, a.slug);
}

// A source cited by half the corpus is as uninformative as a stop-link.
const MAX_FANOUT = 60;

const scores = new Map(); // slug -> Map(otherSlug -> score)
const bump = (a, b, n) => {
  if (a === b) return;
  if (!scores.has(a)) scores.set(a, new Map());
  const m = scores.get(a);
  m.set(b, (m.get(b) ?? 0) + n);
};
const couple = (index, weight) => {
  for (const group of index.values()) {
    if (group.length < 2 || group.length > MAX_FANOUT) continue;
    for (const a of group) for (const b of group) bump(a, b, weight);
  }
};
couple(bySource, 4);
couple(byLink, 1);
couple(byCat, 1);
for (const a of meta.values()) {
  for (const l of a.links) {
    bump(a.slug, l, 3);
    bump(l, a.slug, 3);
  }
}

const ranked = (slug) =>
  [...(scores.get(slug) ?? new Map())]
    .filter(([s]) => s !== slug && meta.has(s))
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));

const related = new Map();
for (const slug of meta.keys()) {
  related.set(slug, ranked(slug).slice(0, RELATED_PER_PAGE).map(([s]) => s));
}

// --- Orphan rescue ----------------------------------------------------------
// Every article must be surfaced by at least MIN_INBOUND others. Insert the
// under-linked page into its best partners' lists, trimming that list's weakest
// entry so blocks stay at RELATED_PER_PAGE.
const inbound = new Map([...meta.keys()].map((s) => [s, 0]));
for (const list of related.values()) for (const s of list) inbound.set(s, inbound.get(s) + 1);

// Trimming a full list to make room can push whoever got dropped back under the
// floor, so the pass repeats until nothing moves. It converges quickly because
// each round can only ever demote entries that already have surplus inbound
// links (the drop candidate is chosen as the weakest-ranked entry that is not
// itself at the floor).
let rescued = 0;
for (let round = 0; round < 8; round++) {
  const needy = [...inbound].filter(([, n]) => n < MIN_INBOUND).sort((a, b) => a[1] - b[1]);
  if (needy.length === 0) break;
  let moved = 0;
  for (const [slug] of needy) {
    // Best partners first, then same-category articles — an article can be so
    // isolated that it shares no source, link or coupling with anything.
    const partners = ranked(slug).map(([s]) => s);
    const cat = meta.get(slug).cats[0];
    if (cat) partners.push(...(byCat.get(cat) ?? []).filter((s) => s !== slug));
    for (const p of partners) {
      if (inbound.get(slug) >= MIN_INBOUND) break;
      const list = related.get(p);
      if (!list || list.includes(slug)) continue;
      if (list.length >= RELATED_PER_PAGE) {
        // Drop the weakest entry that can spare the link, never one at the floor.
        const idx = [...list].reverse().findIndex((s) => inbound.get(s) > MIN_INBOUND);
        if (idx === -1) continue;
        const [dropped] = list.splice(list.length - 1 - idx, 1);
        inbound.set(dropped, inbound.get(dropped) - 1);
      }
      list.push(slug);
      inbound.set(slug, inbound.get(slug) + 1);
      rescued++;
      moved++;
    }
  }
  if (moved === 0) break;
}

const payload = {};
for (const [slug, list] of related) {
  payload[slug] = list.map((s) => ({
    slug: s,
    title: meta.get(s).title,
    summary: meta.get(s).summary,
  }));
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(payload, null, 0) + '\n');

const finalInbound = new Map([...meta.keys()].map((s) => [s, 0]));
for (const list of related.values()) for (const s of list) finalInbound.set(s, finalInbound.get(s) + 1);
const stillOrphan = [...finalInbound].filter(([, n]) => n === 0).length;
const empty = [...related].filter(([, l]) => l.length === 0).length;
console.log(
  `related: ${meta.size} articles, ${rescued} rescue links, ` +
    `${stillOrphan} still with no inbound related-link, ${empty} with an empty block`,
);
