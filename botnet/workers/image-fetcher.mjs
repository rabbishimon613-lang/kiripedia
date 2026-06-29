#!/usr/bin/env node
// Image Fetcher — walks every article without an infobox image, tries to
// fetch a lead picture from Wikipedia, wires it into the article's
// frontmatter, and flags whatever it couldn't resolve.
//
// The pipeline phase this owns: once an article has been spawned and a few
// claims have clustered into it, it's "real enough" to deserve a picture.
// Articles without one stay on a watchlist (public/needs-image.json) so
// the wiki always knows which gaps to fill.
//
// Idempotent: skips any article whose frontmatter already has an image.
// Idempotent: refreshes the watchlist on every run.
//
// Cheap: pure Wikipedia REST API calls, no LLM. Capped at ATTEMPT_LIMIT per
// run so a long backlog doesn't make a single cycle take forever.
//
// Run: node botnet/workers/image-fetcher.mjs [--limit N] [--worker image-fetcher-1]

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';
import { arg, intArg } from '../lib/argv.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const IMAGES_DIR = join(REPO_ROOT, 'public', 'images');
const CREDITS_PATH = join(IMAGES_DIR, 'credits.json');
const NEEDS_PATH = join(REPO_ROOT, 'public', 'needs-image.json');

const WORKER = arg('--worker', 'image-fetcher-1');
const ROLE = 'image-fetcher';
const ATTEMPT_LIMIT = intArg('--limit', 12);

const UA = 'KiriPediaImageFetcher/1.0 (https://kiripedia.org; bot@kiripedia.org)';

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: 'Looking for articles that grew up enough to deserve a picture.' });

const credits = existsSync(CREDITS_PATH) ? JSON.parse(readFileSync(CREDITS_PATH, 'utf8')) : {};

// Parse frontmatter just well enough to know whether image is set and grab
// title/summary for the Wikipedia search.
function readFront(path) {
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm = m[1];
  const hasImage = /^\s*image:\s*['"]?\/images\/[^'"\s]+\.(jpg|jpeg|png|webp|svg)/m.test(fm);
  const titleMatch = fm.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
  const summaryMatch = fm.match(/^summary:\s*['"]?([^\n]+?)['"]?\s*$/m);
  return {
    title: titleMatch ? titleMatch[1].replace(/''/g, "'") : null,
    summary: summaryMatch ? summaryMatch[1].replace(/''/g, "'") : '',
    hasImage,
    raw,
    fm,
  };
}

const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
const pictureless = [];
for (const f of files) {
  const slug = f.slice(0, -4);
  const path = join(ARTICLES_DIR, f);
  const front = readFront(path);
  if (!front || front.hasImage || credits[slug]) continue;
  pictureless.push({ slug, path, title: front.title || slug, summary: front.summary, raw: front.raw, fm: front.fm });
}

console.log(`[image-fetcher] ${pictureless.length} articles without an image; attempting up to ${ATTEMPT_LIMIT} this run`);

const tried = pictureless.slice(0, ATTEMPT_LIMIT);
const skipped = pictureless.slice(ATTEMPT_LIMIT);
let fetched = 0;
const stillNeedImage = [];

for (const art of tried) {
  try {
    const wiki = await findWikipedia(art.title);
    if (!wiki) {
      stillNeedImage.push({ slug: art.slug, title: art.title, reason: 'no Wikipedia page' });
      continue;
    }
    const img = await leadImage(wiki.title);
    if (!img) {
      stillNeedImage.push({ slug: art.slug, title: art.title, reason: 'Wikipedia page has no lead image', wiki: wiki.title });
      continue;
    }
    const ext = (img.source.match(/\.([a-z0-9]+)$/i) || [, 'jpg'])[1].toLowerCase();
    const dest = join(IMAGES_DIR, `${art.slug}.${ext}`);
    await downloadTo(img.source, dest);
    credits[art.slug] = {
      file: `/images/${art.slug}.${ext}`,
      credit: `Photo: ${img.artist || 'Unknown'} / ${img.license || 'See Wikimedia Commons'} via Wikimedia Commons`,
      source: img.source,
      wikipedia_title: wiki.title,
    };
    // Write the frontmatter patch immediately — same shape wire-images.mjs uses.
    patchFrontmatter(art, credits[art.slug]);
    fetched++;
    console.log(`[image-fetcher]   ${art.slug}  ← ${wiki.title}`);
  } catch (err) {
    stillNeedImage.push({ slug: art.slug, title: art.title, reason: `error: ${err.message.slice(0, 120)}` });
  }
}

// Add the untried ones to the watchlist so the page reflects the full backlog.
for (const a of skipped) stillNeedImage.push({ slug: a.slug, title: a.title, reason: 'queued' });

if (fetched > 0) writeFileSync(CREDITS_PATH, JSON.stringify(credits, null, 2));
writeFileSync(NEEDS_PATH, JSON.stringify({
  generated_at: new Date().toISOString(),
  count: stillNeedImage.length,
  articles: stillNeedImage,
}, null, 2));

logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Pictured ${fetched} more articles; ${stillNeedImage.length} still need a photo.` });
console.log(`[image-fetcher] done: fetched=${fetched}, needs_image=${stillNeedImage.length}`);

// --- helpers ---------------------------------------------------------------

async function findWikipedia(title) {
  // Resolve via direct page lookup with redirects, NOT search. Wikipedia's
  // search will happily return "1982 Lebanon War" for "Abu Nidal disruption"
  // because it's the only loosely related page indexed. Direct lookup either
  // hits the article exactly (modulo redirects) or returns nothing — that's
  // the precision we want for tagging articles with photos.
  const q = encodeURIComponent(title);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${q}&redirects=1&format=json&origin=*`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`lookup HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages || {};
  const page = Object.values(pages)[0];
  // Wikipedia signals "no such page" with pageid -1 / missing="".
  if (!page || page.missing !== undefined || page.pageid < 0) return null;
  // Require the resolved title to share at least one significant word with
  // ours so we don't accept a 1-letter common-noun redirect collision.
  const significant = (s) => new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 4));
  const a = significant(title);
  const b = significant(page.title);
  const overlap = [...a].filter(w => b.has(w)).length;
  if (overlap < 1) return null;
  return { title: page.title };
}

async function leadImage(title) {
  // PageImages → original image URL + Commons credit.
  const q = encodeURIComponent(title);
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|imageinfo&titles=${q}&piprop=original&format=json&iiprop=user|extmetadata&origin=*&redirects=1`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`pageimages HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages || {};
  const page = Object.values(pages)[0];
  const original = page?.original;
  if (!original?.source) return null;
  // Fetch image-level metadata (license, artist) from the Commons file.
  // Best-effort — if it fails we still return the image with vague credit.
  let artist = null, license = null;
  try {
    const fname = decodeURIComponent(original.source.split('/').pop()).replace(/^\d+px-/, '');
    const fres = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&titles=File:${encodeURIComponent(fname)}&iiprop=extmetadata&format=json&origin=*`,
                              { headers: { 'User-Agent': UA } });
    if (fres.ok) {
      const fdata = await fres.json();
      const fpage = Object.values(fdata?.query?.pages || {})[0];
      const meta = fpage?.imageinfo?.[0]?.extmetadata || {};
      artist = stripHtml(meta.Artist?.value || '') || null;
      license = stripHtml(meta.LicenseShortName?.value || '') || null;
    }
  } catch {}
  return { source: original.source, artist, license };
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function downloadTo(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

function patchFrontmatter(art, entry) {
  // Inject infobox.image + infobox.imageCredit. If the article already has
  // an `infobox:` block, splice into it; otherwise create one. Idempotent
  // when re-run on the same article (refuses to clobber an existing image).
  const raw = art.raw;
  const m = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return false;
  let fm = m[1];
  if (/^\s*image:\s*['"]?\/images\//m.test(fm)) return false; // already set

  const imgLine = `  image: '${entry.file}'`;
  const creditLine = `  imageCredit: '${entry.credit.replace(/'/g, "''")}'`;

  if (/^infobox:\s*$/m.test(fm)) {
    // Append into existing infobox.
    fm = fm.replace(/^infobox:\s*$/m, `infobox:\n${imgLine}\n${creditLine}`);
  } else if (/^infobox:\s*\n/m.test(fm)) {
    fm = fm.replace(/^infobox:\s*\n/m, `infobox:\n${imgLine}\n${creditLine}\n`);
  } else {
    fm = `${fm}\ninfobox:\n${imgLine}\n${creditLine}`;
  }
  writeFileSync(art.path, `---\n${fm}\n---\n${m[2]}`);
  return true;
}
