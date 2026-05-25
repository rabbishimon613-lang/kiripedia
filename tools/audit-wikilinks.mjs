#!/usr/bin/env node
// Audit every [Text](/wiki/slug) link in the corpus for mismatches between
// the visible text and the target slug.
//
// Heuristic: slugify the visible text and compare against the URL slug.
// If they're not equal AND neither is a substring of the other (handles
// "Saunders" → "stephen-saunders"), flag it.
//
// Also flags links to slugs that don't exist as articles.

import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const dir = 'src/content/articles';
const articleFiles = readdirSync(dir).filter(x => x.endsWith('.mdx'));
const existingSlugs = new Set(articleFiles.map(f => f.replace(/\.mdx$/, '')));

// Build slug → title map for known articles, plus a reverse lookup of
// "people-name keywords" → slug so we can detect when a visible text looks
// like a person who has an article but the link points elsewhere.
const slugToTitle = {};
const peopleArticles = new Set(); // slugs that are People-category articles
for (const f of articleFiles) {
  const c = readFileSync(`${dir}/${f}`, 'utf8');
  const m = c.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  try {
    const fm = yaml.load(m[1]);
    const slug = f.replace(/\.mdx$/, '');
    slugToTitle[slug] = fm.title || slug;
    if ((fm.categories || []).includes('People')) peopleArticles.add(slug);
  } catch {}
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')         // strip apostrophes
    .replace(/[^a-z0-9]+/g, '-')        // non-alphanum → hyphen
    .replace(/^-+|-+$/g, '')             // trim hyphens
    .replace(/-+/g, '-');                 // collapse hyphens
}

// Looks like a person's name: 2+ Capitalized words, no lower-case words,
// no obvious common-noun tokens, ≤ 4 words total.
const COMMON_NON_NAMES = new Set([
  'agency','intelligence','service','program','office','center','division',
  'state','department','house','senate','committee','court','college',
  'school','university','company','corporation','meeting','hotel','war',
  'attack','plot','case','massacre','uprising','operation','review','report',
  'principle','technique','technique','system','route','cycle','briefing',
  'order','executive','federal','national','american','british','israeli',
  'french','iraqi','iranian','kuwaiti','saudi','pakistani','greek','syrian',
  'union','foundation','treaty','act','law','rule','policy','memo','cable',
  'tower','base','facility','prison','mosque','bank','field','road','highway',
  'liberation','massacre','assassination','invasion','withdrawal','ceasefire',
  'left','right','first','second','third','last','next','only','new','old',
]);
function looksLikePersonName(text) {
  const words = text.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  for (const w of words) {
    if (!/^[A-Z][a-zà-ÿ'’.-]*$/.test(w)) return false;
    if (COMMON_NON_NAMES.has(w.toLowerCase())) return false;
  }
  return true;
}

// Two strings "reasonably correspond" if one is a substring of the other
// after slugification, OR if they share their first or last meaningful token.
function reasonablyMatches(textSlug, urlSlug) {
  if (textSlug === urlSlug) return true;
  if (urlSlug.includes(textSlug) || textSlug.includes(urlSlug)) return true;
  const t = textSlug.split('-');
  const u = urlSlug.split('-');
  // Share a meaningful token (length >= 4) anywhere
  for (const a of t) {
    if (a.length < 4) continue;
    if (u.includes(a)) return true;
  }
  return false;
}

const bugs = [];          // HIGH confidence: person-name pointing at a different person/thing
const suspicious = [];    // MEDIUM: visible text doesn't match slug; check manually
const deadLinks = [];

for (const f of articleFiles) {
  const path = `${dir}/${f}`;
  const text = readFileSync(path, 'utf8');
  const rx = /\[([^\]]+)\]\(\/wiki\/([a-z0-9-]+)\)/g;
  let m;
  while ((m = rx.exec(text)) !== null) {
    const visible = m[1].replace(/[*_`]/g, '').trim();
    const urlSlug = m[2];
    const textSlug = slugify(visible);
    const lineNum = text.slice(0, m.index).split('\n').length;

    if (!existingSlugs.has(urlSlug)) {
      deadLinks.push({ file: f, line: lineNum, visible, urlSlug });
      continue;
    }
    if (reasonablyMatches(textSlug, urlSlug)) continue;

    // The bug case: visible text looks like a person's name AND the target
    // article is a People-category article whose title doesn't contain any
    // of the visible-text tokens. That's the Leon-Panetta-→-Jose-Rodriguez
    // pattern: clicking a person's name takes you to a totally different person.
    if (looksLikePersonName(visible) && peopleArticles.has(urlSlug)) {
      bugs.push({ file: f, line: lineNum, visible, urlSlug, urlTitle: slugToTitle[urlSlug] });
    } else {
      suspicious.push({ file: f, line: lineNum, visible, urlSlug, urlTitle: slugToTitle[urlSlug] });
    }
  }
}

if (bugs.length > 0) {
  console.log(`\n=== HIGH-CONFIDENCE BUGS (${bugs.length}) ===`);
  console.log(`Visible text is a person's name, but the link goes to a different person's article.\n`);
  for (const x of bugs) {
    console.log(`  ${x.file}:${x.line}`);
    console.log(`    [${x.visible}](/wiki/${x.urlSlug})  →  actually goes to "${x.urlTitle}"`);
  }
}

if (suspicious.length > 0) {
  console.log(`\n=== SUSPICIOUS (${suspicious.length}) — review manually ===`);
  console.log(`Visible text doesn't match the slug; could be intentional aliasing or a typo.\n`);
  for (const x of suspicious.slice(0, 25)) {
    console.log(`  ${x.file}:${x.line}  [${x.visible}] → "${x.urlTitle}" (/wiki/${x.urlSlug})`);
  }
  if (suspicious.length > 25) console.log(`  … and ${suspicious.length - 25} more`);
}

if (deadLinks.length > 0) {
  console.log(`\n=== DEAD WIKILINKS (${deadLinks.length}) ===`);
  console.log(`Target slug has no article.\n`);
  // Group by target slug for batchable fixes
  const byTarget = {};
  for (const x of deadLinks) (byTarget[x.urlSlug] ||= []).push(x);
  for (const [target, list] of Object.entries(byTarget).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  /wiki/${target}  (${list.length} occurrences)`);
    for (const x of list.slice(0, 3)) console.log(`    ${x.file}:${x.line}  "${x.visible}"`);
    if (list.length > 3) console.log(`    … and ${list.length - 3} more`);
  }
}

console.log(`\nTotal: ${bugs.length} bugs, ${suspicious.length} suspicious, ${deadLinks.length} dead.`);
if (bugs.length > 0) process.exit(1);
