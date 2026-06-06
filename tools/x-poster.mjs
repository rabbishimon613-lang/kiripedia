#!/usr/bin/env node
// KiriPedia X (Twitter) auto-poster — v1
//
// Posts ONE item per invocation, chosen by weighted rotation across four
// post types: Did You Know, On This Day, Verbatim Quote, New Article.
//
// Design principles:
//  - Time-driven, never event-driven. Ingests/commits never trigger posts;
//    only the scheduled GitHub Action invokes this script.
//  - New-article announcements are drip-queued (max one per run) with a
//    freshness cap, so a big ingest can never flood the timeline.
//  - State (posted log, known slugs, new-article queue) lives in
//    tools/x-bot-state.json and is committed back by the workflow.
//
// Usage:
//   node tools/x-poster.mjs --dry-run     # print what it would post, post nothing
//   node tools/x-poster.mjs               # live (requires X_* env credentials)
//
// Env (live mode): X_API_KEY X_API_SECRET X_ACCESS_TOKEN X_ACCESS_SECRET

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import crypto from 'node:crypto';
import yaml from 'js-yaml';

const ROOT = new URL('..', import.meta.url).pathname;
const ARTICLES = ROOT + 'src/content/articles';
const STATE_PATH = ROOT + 'tools/x-bot-state.json';
const SITE = 'https://www.kiripedia.org';
const DRY = process.argv.includes('--dry-run');

const FRESHNESS_DAYS = 14;        // new-article queue entries older than this expire
const MAX_TWEET = 280;
const TCO = 24;                   // t.co link length (23) + 1 space/newline budget
const TEXT_BUDGET = MAX_TWEET - TCO - 2;

// Articles we never surface (sensitive / deferred topics). Empty for now.
const BLOCKLIST = new Set([]);

// ---------- helpers ----------
const slugOf = (f) => f.replace(/\.mdx?$/, '');
const stripMd = (s) => String(s || '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url) -> text
  .replace(/[*_`]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

function loadArticles() {
  const out = [];
  for (const f of readdirSync(ARTICLES).filter((x) => x.endsWith('.mdx'))) {
    const slug = slugOf(f);
    if (BLOCKLIST.has(slug)) continue;
    const raw = readFileSync(ARTICLES + '/' + f, 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) continue;
    let fm;
    try { fm = yaml.load(m[1]); } catch { continue; }
    if (!fm || !fm.title) continue;
    const body = raw.slice(m[0].length);
    out.push({ slug, title: fm.title, summary: fm.summary || '', dyk: fm.dyk || [], events: fm.events || [], body });
  }
  return out;
}

function url(slug) { return `${SITE}/wiki/${slug}`; }
function fits(text) { return text.length <= TEXT_BUDGET; }

// ---------- content pools ----------
function dykPool(articles) {
  const pool = [];
  for (const a of articles) {
    a.dyk.forEach((d, i) => {
      let t = stripMd(d).replace(/^\.\.\.\s*/, '').replace(/^…\s*/, '');
      if (!t) return;
      const text = 'Did you know ' + t;
      if (fits(text)) pool.push({ id: `dyk:${a.slug}:${i}`, type: 'dyk', text, slug: a.slug });
    });
  }
  return pool;
}

function quotePool(articles) {
  const pool = [];
  for (const a of articles) {
    // Strip JSX/HTML tags (e.g. <Cite s="..." t="..." />) BEFORE pulling quotes,
    // otherwise the s="source-slug" attributes get scraped as fake quotes.
    const clean = stripMd(a.body.replace(/<[^>]+>/g, ' '));
    const matches = clean.match(/"([^"]{45,200})"/g) || [];
    const seen = new Set();
    matches.forEach((q, i) => {
      const inner = q.slice(1, -1).trim();
      // Reject slug-like junk: must read like a sentence (>=5 words, has spaces,
      // not a bare token of word-chars/hyphens/digits).
      const words = inner.split(/\s+/);
      if (words.length < 5) return;
      if (/^[\w/.-]+$/.test(inner)) return;
      if (seen.has(inner)) return;
      seen.add(inner);
      const attrib = a.title === 'John Kiriakou'
        ? '— John Kiriakou'
        : `— per John Kiriakou, on ${a.title}`;
      const text = `"${inner}" ${attrib}`;
      if (fits(text)) pool.push({ id: `quote:${a.slug}:${i}`, type: 'quote', text, slug: a.slug });
    });
  }
  return pool;
}

function otdPool(articles) {
  const today = new Date().toISOString().slice(5, 10); // MM-DD
  const pool = [];
  for (const a of articles) {
    for (const ev of a.events) {
      const d = String(ev.date || '');
      const md = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!md || `${md[2]}-${md[3]}` !== today) continue;
      const text = `On this day in ${md[1]}: ` + stripMd(ev.description);
      if (fits(text)) pool.push({ id: `otd:${a.slug}:${d}`, type: 'otd', text, slug: a.slug });
    }
  }
  return pool;
}

function newArticlePost(entry, articles) {
  const a = articles.find((x) => x.slug === entry.slug);
  if (!a) return null;
  const text = `New on KiriPedia: ${a.title} — ${stripMd(a.summary)}`;
  const trimmed = fits(text) ? text : `New on KiriPedia: ${a.title}`;
  return { id: `new:${a.slug}`, type: 'new', text: trimmed, slug: a.slug };
}

// ---------- state ----------
function loadState() {
  if (existsSync(STATE_PATH)) return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  return { posted: [], knownSlugs: null, queue: [], lastTypes: [] };
}
function saveState(s) { writeFileSync(STATE_PATH, JSON.stringify(s, null, 2) + '\n'); }

// ---------- picker ----------
function pickItem(state, articles) {
  const postedSet = new Set(state.posted);
  const recent = state.lastTypes || [];
  const avoid = recent[recent.length - 1]; // don't repeat the immediately-previous type if alternatives exist

  // Build candidate pools (filtered to unposted)
  const candidates = {
    otd: otdPool(articles).filter((p) => !postedSet.has(p.id)),
    quote: quotePool(articles).filter((p) => !postedSet.has(p.id)),
    dyk: dykPool(articles).filter((p) => !postedSet.has(p.id)),
    new: [],
  };
  // freshest queued new article
  const fresh = (state.queue || []).filter((q) => daysSince(q.added) <= FRESHNESS_DAYS);
  if (fresh.length) {
    const np = newArticlePost(fresh[0], articles);
    if (np && !postedSet.has(np.id)) candidates.new = [np];
  }

  // weighted rotation; OTD/new only when available
  const weights = { dyk: 40, quote: 30, otd: 18, new: 18 };
  let types = Object.keys(weights).filter((t) => candidates[t].length);
  if (!types.length) { // everything posted — recycle DYK by clearing posted DYKs
    state.posted = state.posted.filter((id) => !id.startsWith('dyk:'));
    return pickItem(state, articles);
  }
  // avoid immediate repeat of same type when we have >1 option
  let pickTypes = types;
  if (avoid && types.length > 1 && types.includes(avoid)) pickTypes = types.filter((t) => t !== avoid);

  const total = pickTypes.reduce((s, t) => s + weights[t], 0);
  let r = Math.random() * total;
  let chosenType = pickTypes[0];
  for (const t of pickTypes) { r -= weights[t]; if (r <= 0) { chosenType = t; break; } }

  const arr = candidates[chosenType];
  const item = arr[Math.floor(Math.random() * arr.length)];
  return item;
}

function daysSince(iso) {
  if (!iso) return 1e9;
  return (Date.now() - new Date(iso).getTime()) / 86400000;
}

// ---------- X API (OAuth 1.0a, POST /2/tweets) ----------
async function postTweet(text) {
  const ck = process.env.X_API_KEY, cs = process.env.X_API_SECRET;
  const tk = process.env.X_ACCESS_TOKEN, ts = process.env.X_ACCESS_SECRET;
  if (!ck || !cs || !tk || !ts) throw new Error('Missing X_* credentials');
  const u = 'https://api.twitter.com/2/tweets';
  const oauth = {
    oauth_consumer_key: ck, oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1', oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: tk, oauth_version: '1.0',
  };
  // Signature base (body is JSON, not form-encoded, so only oauth params are signed)
  const params = Object.keys(oauth).sort().map((k) => `${enc(k)}=${enc(oauth[k])}`).join('&');
  const base = ['POST', enc(u), enc(params)].join('&');
  const key = `${enc(cs)}&${enc(ts)}`;
  oauth.oauth_signature = crypto.createHmac('sha1', key).update(base).digest('base64');
  const header = 'OAuth ' + Object.keys(oauth).sort().map((k) => `${enc(k)}="${enc(oauth[k])}"`).join(', ');
  const res = await fetch(u, { method: 'POST', headers: { Authorization: header, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
  if (!res.ok) throw new Error(`X API ${res.status}: ${await res.text()}`);
  return res.json();
}
const enc = (s) => encodeURIComponent(s).replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

// ---------- main ----------
(async function main() {
  const articles = loadArticles();
  const state = loadState();
  const currentSlugs = articles.map((a) => a.slug);

  // Bootstrap or detect new articles
  if (!state.knownSlugs) {
    state.knownSlugs = currentSlugs; // first run: adopt baseline, enqueue nothing
  } else {
    const known = new Set(state.knownSlugs);
    const today = new Date().toISOString();
    for (const s of currentSlugs) if (!known.has(s)) state.queue.push({ slug: s, added: today });
    state.knownSlugs = currentSlugs;
  }
  // expire stale queue entries
  state.queue = (state.queue || []).filter((q) => daysSince(q.added) <= FRESHNESS_DAYS);

  const item = pickItem(state, articles);
  if (!item) { console.log('Nothing to post.'); saveState(state); return; }

  const tweet = `${item.text}\n${url(item.slug)}`;

  if (DRY) {
    const weighted = item.text.length + 1 + 23; // X counts any link as 23
    console.log('--- DRY RUN ---');
    console.log(`type: ${item.type}  (X-weighted: ${weighted}/280)`);
    console.log(tweet);
    return; // don't mutate state in dry-run
  }

  await postTweet(tweet);
  state.posted.push(item.id);
  if (item.type === 'new') state.queue = state.queue.filter((q) => q.slug !== item.slug);
  state.lastTypes = [...(state.lastTypes || []), item.type].slice(-5);
  saveState(state);
  console.log(`Posted [${item.type}]: ${tweet}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
