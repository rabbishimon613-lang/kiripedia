#!/usr/bin/env node
// Calendar-keeper. Pure regex + sqlite. No LLM.
//
// Two passes per invocation:
//   Lane 1: scan source transcripts for day-precise dates Kiriakou utters,
//           propose events_append claims pointing at the article whose slug
//           is the most-mentioned entity near the date.
//   Lane 3: for each source, propose an events_append claim crediting that
//           source's air date — "Kiriakou appeared on <title>" — on the
//           most-mentioned article (or john-kiriakou as fallback).
//
// Doctrine guards:
//   - Only emits claims pointing at slugs that already exist on disk.
//   - Skips dates that have no clear year in context.
//   - Skips when the article already lists an identical event.
//   - Lane 2 (historical anchors Kiriakou doesn't date himself) is OFF.
//
// Idempotent: relies on UNIQUE(video_id, segment_start, claim_text) in the
// claims table. Re-running collides harmlessly.
//
// Run: node botnet/workers/calendar-keeper.mjs

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');

const WORKER = 'calendar-keeper';
const ROLE = 'calendar-keeper';
const LANE1_CAP = 20;
const LANE3_CAP = 10;

// ---------------------------------------------------------------------------
// Article slug catalog. We also build a title-and-slug lookup so we can match
// capitalized phrases in transcript context back to a target article.
// ---------------------------------------------------------------------------
function loadArticleCatalog() {
  const slugs = new Set();
  const titleToSlug = new Map();      // lowercased title → slug
  const articleEvents = new Map();    // slug → Set of "YYYY-MM-DD::description-prefix"
  for (const f of readdirSync(ARTICLES_DIR)) {
    if (!f.endsWith('.mdx')) continue;
    const slug = f.replace(/\.mdx$/, '');
    slugs.add(slug);
    const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    const front = fm ? fm[1] : '';
    const titleMatch = front.match(/^title:\s*(.+)$/m);
    if (titleMatch) {
      const t = titleMatch[1].replace(/^["']|["']$/g, '').trim().toLowerCase();
      if (t) titleToSlug.set(t, slug);
    }
    // Parse existing events block for dedup.
    const evBlock = front.match(/^events:\n([\s\S]*?)(?=\n[a-zA-Z_]+:|$)/m);
    const events = new Set();
    if (evBlock) {
      const re = /-\s*date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?\s*\n\s*description:\s*['"]?([^\n]+)/g;
      let m;
      while ((m = re.exec(evBlock[1])) !== null) {
        events.add(`${m[1]}::${m[2].slice(0, 60)}`);
      }
    }
    articleEvents.set(slug, events);
  }
  return { slugs, titleToSlug, articleEvents };
}

// ---------------------------------------------------------------------------
// Date detection. We look for full day-precise dates with a clear year.
// Patterns:
//   YYYY-MM-DD                                 ISO
//   Month D, YYYY  /  Month Dst|nd|rd|th, YYYY English
//   D Month YYYY                               UK / spoken
//   Mon D YYYY     /  Mon D, YYYY              short
// ---------------------------------------------------------------------------
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
  sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};
const MONTH_NAMES = Object.keys(MONTHS).join('|');
const DATE_PATTERNS = [
  // ISO
  { re: /\b(\d{4})-(\d{2})-(\d{2})\b/g, kind: 'iso' },
  // "January 5, 2003" / "January 5th 2003"
  { re: new RegExp(`\\b(${MONTH_NAMES})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,)?\\s+(\\d{4})\\b`, 'gi'), kind: 'mdy' },
  // "5 January 2003" / "5th of January 2003"
  { re: new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${MONTH_NAMES})\\s+(\\d{4})\\b`, 'gi'), kind: 'dmy' },
];

function normalizeDate(match, kind) {
  let y, m, d;
  if (kind === 'iso') {
    y = parseInt(match[1], 10);
    m = parseInt(match[2], 10);
    d = parseInt(match[3], 10);
  } else if (kind === 'mdy') {
    m = MONTHS[match[1].toLowerCase()];
    d = parseInt(match[2], 10);
    y = parseInt(match[3], 10);
  } else if (kind === 'dmy') {
    d = parseInt(match[1], 10);
    m = MONTHS[match[2].toLowerCase()];
    y = parseInt(match[3], 10);
  }
  if (!y || !m || !d) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  if (y < 1900 || y > 2100) return null;
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Slug matching from a context window. Strategy:
//   1. Match exact article titles (longest-first) that appear in the window.
//   2. Match slug-form (e.g. "abu zubaydah" → "abu-zubaydah") against the
//      lowercased window.
//   3. Return the slug with the most hits in the window. Ties broken by
//      longest slug (more specific wins).
// ---------------------------------------------------------------------------
function pickSlugForWindow(window, catalog) {
  const lower = window.toLowerCase();
  const counts = new Map();
  for (const [title, slug] of catalog.titleToSlug.entries()) {
    if (title.length < 4) continue;
    let idx = 0, n = 0;
    while ((idx = lower.indexOf(title, idx)) !== -1) { n++; idx += title.length; }
    if (n > 0) counts.set(slug, (counts.get(slug) || 0) + n * 2);  // title hit weighs more
  }
  for (const slug of catalog.slugs) {
    if (slug.length < 6) continue;
    const phrase = slug.replace(/-/g, ' ');
    if (phrase.length < 6) continue;
    let idx = 0, n = 0;
    while ((idx = lower.indexOf(phrase, idx)) !== -1) { n++; idx += phrase.length; }
    if (n > 0) counts.set(slug, (counts.get(slug) || 0) + n);
  }
  if (counts.size === 0) return null;
  let best = null, bestScore = 0;
  for (const [slug, score] of counts.entries()) {
    if (score > bestScore || (score === bestScore && best && slug.length > best.length)) {
      best = slug; bestScore = score;
    }
  }
  return best;
}

// Pick a wikilinked entity for the event description. Prefers the article's
// own title in [[...]] form; falls back to the slug-derived phrase.
function wikilinkFor(slug, catalog) {
  // Find title for this slug.
  for (const [title, s] of catalog.titleToSlug.entries()) {
    if (s === slug) {
      const display = title.replace(/\b\w/g, c => c.toUpperCase());
      return `[${display}](/wiki/${slug})`;
    }
  }
  const display = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  return `[${display}](/wiki/${slug})`;
}

// ---------------------------------------------------------------------------
// Source loading. We want only sources that have a corresponding clip row
// (FK requirement on claims.video_id).
// ---------------------------------------------------------------------------
function loadSources() {
  const clipRows = db.prepare(`SELECT video_id, slug FROM clips WHERE slug IS NOT NULL`).all();
  const slugToVideoId = new Map(clipRows.map(r => [r.slug, r.video_id]));

  const out = [];
  for (const f of readdirSync(SOURCES_DIR)) {
    if (!f.endsWith('.md') || f.endsWith('.sponsors.md')) continue;
    const path = join(SOURCES_DIR, f);
    const raw = readFileSync(path, 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const front = fm[1];
    const body = raw.slice(fm[0].length);
    const slug = (front.match(/^slug:\s*["']?([^"'\n]+)/m) || [])[1];
    const title = (front.match(/^title:\s*["']?([^"'\n]+?)["']?\s*$/m) || [])[1];
    const date = (front.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m) || [])[1];
    if (!slug || !title || !date) continue;
    const videoId = slugToVideoId.get(slug);
    if (!videoId) continue;  // no clip row → can't insert claim
    out.push({ slug, title, date, body, videoId });
  }
  return out;
}

// ---------------------------------------------------------------------------
// SQL prep
// ---------------------------------------------------------------------------
const insertClaim = db.prepare(`
  INSERT OR IGNORE INTO claims
    (video_id, segment_start, segment_end, quote, claim_text, article_slug,
     is_new_article, is_about_kiriakou_himself, patch_kind, patch_payload, named_entities)
  VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'events_append', ?, ?)
`);

function insertEventClaim({ videoId, dateISO, quote, description, slug, segmentTag }) {
  const claim_text = `${dateISO} — ${description}`;
  const payload = {
    kind: 'events_append',
    quote,
    timestamp: '00:00:00',
    timestamp_date: dateISO,
    claim_text: description,
    named_entities: [slug],
  };
  // Use a segment_start that varies by lane+date so Lane 1 and Lane 3 can
  // both write to the same source without colliding, while staying idempotent
  // on re-runs (same lane + same date + same description = same row).
  const segmentStart = segmentTag;
  const r = insertClaim.run(
    videoId,
    segmentStart, segmentStart,
    quote.slice(0, 480),
    claim_text.slice(0, 480),
    slug,
    JSON.stringify(payload),
    JSON.stringify([slug]),
  );
  return r.changes > 0;
}

// ---------------------------------------------------------------------------
// Lane 1: harvest day-precise dates from transcripts.
// ---------------------------------------------------------------------------
function lane1(sources, catalog) {
  let proposals = 0;
  let sourcesTouched = 0;
  for (const src of sources) {
    if (proposals >= LANE1_CAP) break;
    let touched = false;
    const body = src.body;
    const seen = new Set();
    for (const { re, kind } of DATE_PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(body)) !== null) {
        if (proposals >= LANE1_CAP) break;
        const iso = normalizeDate(m, kind);
        if (!iso) continue;
        // Skip the source's own publication date — Lane 3 handles that.
        if (iso === src.date) continue;
        const start = Math.max(0, m.index - 100);
        const end = Math.min(body.length, m.index + m[0].length + 100);
        const window = body.slice(start, end).replace(/\s+/g, ' ').trim();
        const slug = pickSlugForWindow(window, catalog);
        if (!slug) continue;
        const dedupKey = `${src.slug}::${iso}::${slug}`;
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);
        // Skip if article already has this date.
        const existing = catalog.articleEvents.get(slug) || new Set();
        let already = false;
        for (const k of existing) { if (k.startsWith(`${iso}::`)) { already = true; break; } }
        if (already) continue;

        const link = wikilinkFor(slug, catalog);
        const description = `${link} is referenced on this date in the [${src.title}](/sources/${src.slug}) appearance.`;
        const segmentTag = `cal1-${iso}`;
        const added = insertEventClaim({
          videoId: src.videoId,
          dateISO: iso,
          quote: window,
          description,
          slug,
          segmentTag,
        });
        if (added) { proposals++; touched = true; }
      }
    }
    if (touched) sourcesTouched++;
  }
  return { proposals, sourcesTouched };
}

// ---------------------------------------------------------------------------
// Lane 3: source publication dates → events on the most-mentioned article.
// ---------------------------------------------------------------------------
function lane3(sources, catalog) {
  let proposals = 0;
  for (const src of sources) {
    if (proposals >= LANE3_CAP) break;
    // Whole body is the "window" for slug picking.
    let slug = pickSlugForWindow(src.body, catalog);
    if (!slug || !catalog.slugs.has(slug)) {
      slug = catalog.slugs.has('john-kiriakou') ? 'john-kiriakou' : null;
    }
    if (!slug) continue;

    // Skip if article already has this date.
    const existing = catalog.articleEvents.get(slug) || new Set();
    let already = false;
    for (const k of existing) {
      if (k.startsWith(`${src.date}::`) && k.toLowerCase().includes('appeared on')) {
        already = true; break;
      }
    }
    if (already) continue;

    const description = `[John Kiriakou](/wiki/john-kiriakou) appeared on [${src.title}](/sources/${src.slug}).`;
    const segmentTag = `cal3-${src.date}`;
    const quote = src.body.replace(/\s+/g, ' ').trim().slice(0, 200) || src.title;
    const added = insertEventClaim({
      videoId: src.videoId,
      dateISO: src.date,
      quote,
      description,
      slug,
      segmentTag,
    });
    if (added) proposals++;
  }
  return { proposals };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const catalog = loadArticleCatalog();
const sources = loadSources();

logActivity({
  worker: WORKER, role: ROLE, event: 'start',
  detail: `Walking the calendar across ${sources.length} sources.`,
});

const l1 = lane1(sources, catalog);
const l3 = lane3(sources, catalog);

logActivity({
  worker: WORKER, role: ROLE, event: 'finish',
  detail: `Pinned ${l1.proposals} dates to the corkboard from ${l1.sourcesTouched} sources.`,
  handoffTo: 'reviewer',
});
logActivity({
  worker: WORKER, role: ROLE, event: 'finish',
  detail: `Marked ${l3.proposals} air-dates on the calendar.`,
  handoffTo: 'reviewer',
});

console.log(`[${WORKER}] lane1=${l1.proposals} (from ${l1.sourcesTouched} sources) lane3=${l3.proposals}`);
