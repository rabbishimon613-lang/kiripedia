#!/usr/bin/env node
// Push new/changed URLs to IndexNow (Bing, Yandex, DuckDuckGo, Seznam — no
// account, no API key beyond the key file we already host at the site root).
//
// KiriPedia gains articles every morning from the intake routine, and Google's
// own discovery lag on a small site is measured in weeks. IndexNow is the one
// submission channel available to us without Search Console access, so the
// nightly SEO sweep uses it to tell the non-Google engines what changed.
//
// State lives in .kir-indexnow-state.json (gitignored): the set of URLs we've
// already submitted, so each run only sends the delta. First run sends
// everything in the sitemap.
//
//   node tools/indexnow-submit.mjs           # submit the delta
//   node tools/indexnow-submit.mjs --dry-run # show what would be sent
//   node tools/indexnow-submit.mjs --all     # resubmit every sitemap URL

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const SITE = 'https://www.kiripedia.org';
const HOST = 'www.kiripedia.org';
const KEY = 'c28430591d3d6b4a9ee7da7979b8e4a6';
const STATE = '.kir-indexnow-state.json';
const DIST = 'dist';

const dryRun = process.argv.includes('--dry-run');
const all = process.argv.includes('--all');

// Sitemap is the definition of "a URL we want indexed" — it already excludes
// the noindex utility pages and the redirect stubs.
function sitemapUrls() {
  const parts = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
  if (!parts.length) {
    console.error(`no sitemap in ${DIST}/ — run \`npm run build\` first`);
    process.exit(1);
  }
  const urls = new Set();
  for (const p of parts) {
    const xml = readFileSync(`${DIST}/${p}`, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].trim());
  }
  return [...urls].sort();
}

function loadState() {
  if (!existsSync(STATE)) return { submitted: {}, runs: [] };
  try {
    return JSON.parse(readFileSync(STATE, 'utf8'));
  } catch {
    return { submitted: {}, runs: [] };
  }
}

// A URL is worth resubmitting when its sitemap <lastmod> moved since we last
// sent it — that's exactly "new or changed since the last sweep".
function lastmodMap() {
  const parts = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
  const out = {};
  for (const p of parts) {
    const xml = readFileSync(`${DIST}/${p}`, 'utf8');
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = /<loc>([^<]+)<\/loc>/.exec(m[1]);
      const mod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1]);
      if (loc) out[loc[1].trim()] = mod ? mod[1].trim() : '';
    }
  }
  return out;
}

async function submit(chunk) {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: chunk,
  });
  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: payload,
  });
  const body = await res.text();
  return { status: res.status, body: body.slice(0, 200) };
}

const urls = sitemapUrls();
const mods = lastmodMap();
const state = loadState();

const changed = all
  ? urls
  : urls.filter((u) => state.submitted[u] !== (mods[u] ?? ''));

console.log(`sitemap     ${urls.length} urls`);
console.log(`to submit   ${changed.length}${all ? ' (--all)' : ' new or changed'}`);

if (!changed.length) {
  console.log('nothing changed since the last submission — done');
  process.exit(0);
}

if (dryRun) {
  changed.slice(0, 40).forEach((u) => console.log('   ', u));
  if (changed.length > 40) console.log(`    … and ${changed.length - 40} more`);
  process.exit(0);
}

// IndexNow caps a request at 10,000 URLs; stay well under it.
const SIZE = 2000;
let ok = 0;
for (let i = 0; i < changed.length; i += SIZE) {
  const chunk = changed.slice(i, i + SIZE);
  const r = await submit(chunk);
  console.log(`indexnow    HTTP ${r.status} for ${chunk.length} urls${r.body ? ' — ' + r.body : ''}`);
  // 200 = accepted, 202 = accepted pending key validation. Both are success.
  if (r.status === 200 || r.status === 202) {
    for (const u of chunk) state.submitted[u] = mods[u] ?? '';
    ok += chunk.length;
  }
}

state.runs.push({ at: new Date().toISOString(), submitted: ok, total: urls.length });
state.runs = state.runs.slice(-20);
writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n', 'utf8');
console.log(`recorded    ${ok} urls submitted; state in ${STATE}`);
