#!/usr/bin/env node
// Cross-source mentions index.
//
// For every article, scans every source transcript looking for paragraphs
// that mention the article's subject. Splits hits into "already cited by
// this article" vs "uncited" — the uncited list is the enrichment-candidate
// pool.
//
// Output: .kir-mentions-index.json
//   (Repo-root scratch, not public/. This file runs to ~175MB, and anything
//   under public/ is copied into dist/ and then into the Vercel build output,
//   where a single file over 100MB fails the prebuilt upload outright.)
//   {
//     "<slug>": {
//       "title": "...",
//       "aliases": [...],
//       "total_mentions": N,
//       "cited_sources": ["<source-slug>", ...],
//       "uncited_mentions": [
//         { "source": "<slug>", "timestamp": "h:mm:ss", "snippet": "...±200 chars" },
//         ...
//       ]
//     },
//     ...
//   }
//
// Aliases handle auto-caption mangles (Kiriakou → Kiryaku, Saddam → Sadam,
// Abu Zubaydah → abu zubeda / abu beta / abuaba / etc.). Map grows as needed.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const ARTICLES = 'src/content/articles';
const SOURCES = 'src/content/sources';

// Auto-caption alias expansions per slug. Add new ones as misses are found.
// Each entry: extra strings (case-insensitive) to also match for that subject.
const ALIASES = {
  'abu-zubaydah':            ['abu zubeda', 'abu beta', 'abuaba', 'abu zuba', 'aubaba', 'auba', 'ababa beta'],
  'abu-zubaydah-capture':    ['abu zubeda', 'abu beta', 'abuaba'],
  'john-kiriakou':           ['kiryaku', 'kiraku', 'keryaku', 'kiriako'],
  'saddam-hussein':          ['sadam', 'saddam', 'hussein'],
  'khalid-sheikh-mohammed':  ['ksm', 'khalid sheikh', 'khalid shik', 'mukhtar', 'shik muhammad'],
  'rudy-giuliani':           ['giuliani'],
  'george-tenet':            ['tennant', 'tenet'],
  'cofer-black':             ['kofer black', 'cofer', 'goofer'],
  'gust-avrakotos':          ['gus', 'gust', 'avrakotos', 'avricatus'],
  'jose-rodriguez':          ['jose', 'rodriguez'],
  'enhanced-interrogation':  ['eit', 'enhanced interrogation', 'torture program'],
  'carlos-the-jackal':       ['carlos', 'jackal', 'ilich ramirez', 'ramirez sanchez'],
  'mohamedou-ould-slahi':    ['mohamedou', 'slahi', 'mauritanian', 'muhammadu', 'mohammadu'],
  'maher-arar':              ['maher arar', 'arar'],
  'khaled-el-masri':         ['khaled al-masri', 'khaled almasri', 'khaled the egyptian'],
  'ali-soufan':              ['ali sufan', 'sufan', 'soufan'],
  'robert-hanssen':          ['hansen', 'hanssen', 'hans'],
  'brian-kelly':             ['brian kelly', 'kelly'],
  'mike-hayden':             ['mike hayden', 'michael hayden'],
  'tom-drake':               ['tom drake', 'thomas drake'],
  'leon-panetta':            ['panetta', 'petta', 'leon p'],
  'erik-prince':             ['erik prince', 'eric prince'],
  'curveball':               ['curveball', 'curve ball'],
  'valerie-plame':           ['valerie plame', 'valerie pl', 'plame'],
  'joe-wilson':              ['joseph wilson', 'joe wilson', 'wilson'],
  'matthew-cole':            ['matthew cole'],
  'ahmed-chalabi':           ['chalabi', 'chelby', 'chelvi', 'chalbi'],
  'gerald-bull':             ['gerald bull', 'bull'],
  'jean-gately':             ['jean gately', 'gately', 'gene'],
  'john-mccone':             ['mccone'],
  'norman-schwarzkopf':      ['schwarzkopf', 'schwarzkov', 'schwariskov', 'schwarzkoff'],
  'april-glaspie':           ['april glaspie', 'glaspie', 'glassby', 'glasby'],
  'hussein-kamel':           ['hussein kamel', 'hussein camel'],
  'uday-hussein':            ['uday', 'odd', 'ud'],
  'ali-hassan-al-majid':     ['ali hassan al-majid', 'ali kimawi', 'ali hassan', 'chemical ali'],
  'benazir-bhutto':          ['benazir', 'bhutto'],
  'general-dostum':          ['dostum', 'dostam', 'doam'],
  'mike-spann':              ['mike spann', 'spann'],
  'qala-i-jangi-uprising':   ['qala-i-jangi', 'qala i jangi', 'mazar-i-sharif uprising'],
  'dasht-i-leili-massacre':  ['dasht-i-leili', 'dashti leili', 'dashy lele', 'dash dele', 'dashy leli'],
  '1993-bush-assassination-plot': ['bush assassination', 'assassinate bush', 'kill the president', 'iraqi intelligence service headquarters', 'IIS headquarters'],
  'sandy-berger':            ['sandy berger', 'samuel berger', 'samuel r berger'],
  'bob-baer':                ['bob baer', 'robert baer'],
  'dick-clarke':             ['dick clarke', 'richard clarke'],
  'mike-scheuer':            ['mike scheuer', 'michael scheuer', 'shroyer'],
  'john-oneill':             ["john o'neill", 'john oneill'],
  'eric-oneill':             ["eric o'neill", 'eric oneill'],
  'mohammed-atef':           ['mohammed atef', 'muhammad atef'],
  'harold-james-nicholson':  ['nicholson', 'harold james nicholson'],
  'mitchell-and-jessen':     ['mitchell and jessen', 'mitchell jessen', 'jim mitchell', 'bruce jessen'],
  'wesley-clark':            ['wesley clark', 'wes clark'],
  'francis-gary-powers':     ['gary powers', 'francis gary powers'],
  'william-webster':         ['william webster', 'judge webster', 'william h webster'],
  'robert-mueller':          ['robert mueller', 'mueller', 'meller'],
  'pete-seeger':             ['pete seeger'],
  'jeffrey-epstein':         ['jeffrey epstein', 'epstein'],
  'ai-weiwei':               ['ai weiwei', 'iwwayi weii'],
  'andres-serrano':          ['andres serrano', 'serrano'],
  'jonathan-pollard':        ['jonathan pollard', 'pollard'],
  'mort-halperin':           ['mort halperin', 'morton halperin', 'halperin', 'morton halper'],
  'noelle-dunphy':           ['noelle dunphy', 'dunphy'],
  'bruce-fine':              ['bruce fine', 'bruce fein'],
  'bernie-kerik':            ['bernie kerik', 'bernard kerik', 'kerik'],
  'robert-maclean':          ['robert maclean', 'rob mclean', 'mlan'],
  'stephen-saunders':        ['steven saunders', 'stephen saunders'],
  'heather-saunders':        ['heather saunders'],
  'mike-mastrovito':         ['mastrovito', 'masterveto'],
  'sarah-jane-moore':        ['sarah jane moore', 'sara jane moore'],
  'james-angleton':          ['james angleton', 'angleton', 'jesus angleton'],
  'sebastian-gorka':         ['sebastian gorka', 'gorka'],
  'george-habash':           ['george habash', 'habash', 'gor habash'],
  'ahmed-khatib':            ['ahmed khatib', 'ahmed katib', 'ahmed khib', 'khatib'],
  'gerald-post':             ['gerald post', 'jerrold post', 'dr post', 'dr. post'],
  'kuwait-oil-fires':        ['oil fires', 'red adair'],
  'asel-al-ghabandi':        ['asel', 'gabandi', 'ghabandi'],
  'sheikh-jaber-al-ahmad':   ['sheikh jaber', 'shikh jaba', 'sheikh jabar'],
  'sheikh-saad-al-abdullah': ['sheikh saad', 'shikh sad', 'sheikh sad'],
  'saud-nasir-al-sabah':     ['saud nasir', 'salaser', 'sa naser'],
  'skip-gnehm':              ['skip gnehm', 'ganim', 'gneam'],
  'kiki-camarena-case':      ['kiki camarena', 'camarena', 'enrique camarena'],
  'louis-farrakhan':         ['louis farrakhan', 'farrakhan'],
  'mossad':                  ['mossad', 'mad'],
  'aipac':                   ['aipac'],
  'blackwater':              ['blackwater', 'academi'],
  'bojinka-plot':            ['bojinka'],
  'pflp':                    ['pflp', 'popular front for the liberation of palestine'],
  'revolutionary-organization-17-november': ['17 november', '17n', 'revolutionary organization 17 november'],
  'welch-45':                ['welch 45', '.45', 'welch pistol'],
  'richard-welch':           ['dick welch', 'richard welch'],
  'cia':                     [],   // too broad, leave empty so we don't match every paragraph
  'fci-loretto':             ['loretto'],
  'hummus':                  ['hummus'],
  'section-702':             ['section 702', '702'],
  'yellowcake-niger-forgery':['yellowcake', 'yellow cake', 'niger uranium', 'niger', 'nishair'],
};

// Default alias rule for slugs we haven't hand-mapped: split the slug into
// words and use the joined form as the single alias. Catches simple cases.
function defaultAliasesFor(slug) {
  return [slug.replace(/-/g, ' ')];
}

// ---- Load articles and their existing citations ----------------------------
const articles = {};
for (const f of readdirSync(ARTICLES).filter(x => x.endsWith('.mdx'))) {
  const slug = f.replace(/\.mdx$/, '');
  const raw = readFileSync(`${ARTICLES}/${f}`, 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  let fm; try { fm = yaml.load(fmMatch[1]); } catch { continue; }
  const body = raw.slice(fmMatch[0].length);
  // Citations: collect every <Cite s="..." t="..." /> in the body
  const cites = [...body.matchAll(/<Cite\s+s=["']([^"']+)["']\s+t=["']([^"']+)["']/g)]
    .map(m => ({ source: m[1], t: m[2] }));
  const citedSources = new Set(cites.map(c => c.source));

  // Aliases: start with hand-map; fall back to default; always include title words
  const aliasList = (ALIASES[slug] && ALIASES[slug].length > 0)
    ? ALIASES[slug].slice()
    : defaultAliasesFor(slug);
  if (fm.title) {
    aliasList.push(fm.title);
    // Also try last word of title (often the surname) — but skip generic
    // common nouns that would match every paragraph.
    const STOP_LAST = new Set([
      'case','program','principle','system','division','scenario','agency',
      'service','center','plot','massacre','uprising','war','attack','cycle',
      'route','order','technique','operation','cell','review','policy','code',
      'department','office','committee','court','foundation','treaty','act',
      'law','rule','memo','cable','tower','base','facility','prison','mosque',
      'bank','field','road','highway','liberation','assassination','invasion',
      'meeting','hotel','company','corporation','union',
    ]);
    const titleWords = String(fm.title).split(/\s+/);
    if (titleWords.length >= 2) {
      const last = titleWords[titleWords.length - 1].toLowerCase();
      if (!STOP_LAST.has(last)) aliasList.push(titleWords[titleWords.length - 1]);
    }
  }
  // Skip the "cia" alias entirely — too noisy
  if (slug === 'cia') continue;
  // Filter to substantive aliases — drop anything < 4 chars (too noisy)
  const aliases = [...new Set(aliasList.map(a => String(a).toLowerCase().trim()).filter(a => a.length >= 4))];

  articles[slug] = { title: fm.title, aliases, citedSources, cites };
}

// ---- Load source paragraphs ------------------------------------------------
function loadSourceParagraphs(slug) {
  const path = `${SOURCES}/${slug}.md`;
  const raw = readFileSync(path, 'utf8');
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '');
  // Each paragraph starts with [hh:mm:ss] or [mm:ss]
  const paras = [];
  let cur = null;
  for (const line of body.split('\n')) {
    const m = line.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/);
    if (m) {
      if (cur) paras.push(cur);
      cur = { t: m[1], text: m[2] };
    } else if (cur && line.trim()) {
      cur.text += ' ' + line.trim();
    }
  }
  if (cur) paras.push(cur);
  return paras;
}

const sourceCache = {};
for (const f of readdirSync(SOURCES).filter(x => x.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  sourceCache[slug] = loadSourceParagraphs(slug);
}

// ---- Search every source for every article's aliases -----------------------
const index = {};
for (const [slug, art] of Object.entries(articles)) {
  if (art.aliases.length === 0) continue;
  const aliasPatterns = art.aliases.map(a =>
    new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  );
  const allMentions = [];
  for (const [sourceSlug, paras] of Object.entries(sourceCache)) {
    for (const p of paras) {
      const hit = aliasPatterns.some(rx => rx.test(p.text));
      if (!hit) continue;
      // Snippet: paragraph text, capped at 400 chars
      const snippet = p.text.length > 400 ? p.text.slice(0, 400) + '…' : p.text;
      allMentions.push({ source: sourceSlug, timestamp: p.t, snippet });
    }
  }
  const cited = allMentions.filter(m => art.citedSources.has(m.source));
  const uncited = allMentions.filter(m => !art.citedSources.has(m.source));
  index[slug] = {
    title: art.title,
    aliases: art.aliases,
    total_mentions: allMentions.length,
    cited_sources_count: art.citedSources.size,
    uncited_mention_count: uncited.length,
    uncited_sources: [...new Set(uncited.map(m => m.source))],
    uncited_mentions: uncited,
  };
}

writeFileSync('.kir-mentions-index.json', JSON.stringify(index, null, 2));

// ---- Report ----------------------------------------------------------------
const slugs = Object.keys(index).sort((a, b) =>
  index[b].uncited_mention_count - index[a].uncited_mention_count
);

console.log(`\nWrote .kir-mentions-index.json — ${slugs.length} articles indexed.\n`);
console.log(`Top 25 articles by uncited mention count:\n`);
console.log(`${'slug'.padEnd(36)} ${'uncited'.padStart(8)} ${'cited srcs'.padStart(11)} ${'uncited srcs'.padStart(14)}`);
console.log('-'.repeat(75));
for (const slug of slugs.slice(0, 25)) {
  const e = index[slug];
  console.log(
    `${slug.padEnd(36)} ${String(e.uncited_mention_count).padStart(8)} ${String(e.cited_sources_count).padStart(11)} ${String(e.uncited_sources.length).padStart(14)}`
  );
}

// Distribution histogram
const buckets = { '0': 0, '1-2': 0, '3-5': 0, '6-10': 0, '11+': 0 };
for (const e of Object.values(index)) {
  const n = e.uncited_mention_count;
  if (n === 0) buckets['0']++;
  else if (n <= 2) buckets['1-2']++;
  else if (n <= 5) buckets['3-5']++;
  else if (n <= 10) buckets['6-10']++;
  else buckets['11+']++;
}
console.log(`\nUncited-mention distribution across ${Object.keys(index).length} articles:`);
for (const [bucket, count] of Object.entries(buckets)) {
  console.log(`  ${bucket.padEnd(6)} ${count}`);
}
