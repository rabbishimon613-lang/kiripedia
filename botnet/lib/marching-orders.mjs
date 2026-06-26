// Loads MARCHING-ORDERS.md once per process and exposes a short prepend block
// for each worker's system prompt. The full file is too big to inject in
// every prompt — instead each role gets a focused 1-paragraph extract plus
// the standing directive.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PATH = join(HERE, '..', '..', 'MARCHING-ORDERS.md');
const ORDERS_PATH = join(HERE, '..', 'state', 'orders-today.json');

let cached;
function load() {
  if (cached !== undefined) return cached;
  try { cached = existsSync(PATH) ? readFileSync(PATH, 'utf8') : ''; }
  catch { cached = ''; }
  return cached;
}

let ordersCache;
function loadOrders() {
  if (ordersCache !== undefined) return ordersCache;
  try { ordersCache = existsSync(ORDERS_PATH) ? JSON.parse(readFileSync(ORDERS_PATH, 'utf8')) : null; }
  catch { ordersCache = null; }
  return ordersCache;
}

function todayOrdersBlock() {
  const o = loadOrders();
  if (!o) return '';
  const today = new Date().toISOString().slice(0, 10);
  if (o.date !== today) return ''; // stale, don't inject
  const lines = [o.directive];
  if (o.priority_transcripts?.length)
    lines.push(`TOP TRANSCRIPT TARGETS TODAY: ${o.priority_transcripts.slice(0, 8).join(', ')}`);
  if (o.growth_articles?.length)
    lines.push(`ARTICLES NEEDING GROWTH: ${o.growth_articles.slice(0, 8).join(', ')}`);
  return lines.join('\n');
}

const STANDING = `STANDING DIRECTIVE (June–July 2026): Mine the existing transcript corpus. Do not look for new sources. Deepen articles, weave the piles of enrichment into prose, and pull cross-source corroborations into articles whenever the same story appears in multiple transcripts. New articles are encouraged when the source material is already in hand.`;

const ROLE_SNIPPETS = {
  cataloger: `Second-pass mode: re-walk catalogued transcripts looking for claims the first pass missed — hedges, asides, throwaway names, parenthetical anecdotes. Target ~5 claims per transcript, not 0.`,
  deepener: `Pull the full transcript text of every clip an article cites and look for additional sentences in those transcripts that belong in the article. Subtler claims, related claims, claims about adjacent subjects mentioned in the same breath. Aim to add real sourced paragraphs, not nothing.`,
  enricher: `When the same story appears across multiple transcripts, pull all framings into the article with citations — that is the flagship enrichment pattern this month. If a subject is mentioned across multiple transcripts but has no article, create the article.`,
  weaver: `Most articles are currently a pile of enrichment patches stacked under generic H2s, not woven prose. Your job is consolidation: collapse the stub spine into a small coherent header set and produce real prose. Preserve every quote and citation verbatim.`,
  reweaver: `If an article has new enrichments since its last weave, the moment is now. The corkboard is the inbox, not a holding pen.`,
  prospector: `Re-prospect existing transcripts — walk back through clips marked transcribed or catalogued and surface material that never made it into an article.`,
  'mouth-sentry': `The bureau is producing a lot of new prose this month. Voice drift is the highest risk. Lower the bar for what counts as an issue.`,
};

export function marchingOrdersFor(role) {
  const snippet = ROLE_SNIPPETS[role] || '';
  const daily = todayOrdersBlock();
  const base = snippet ? `${STANDING}\n\nFOR YOUR ROLE: ${snippet}` : STANDING;
  return daily ? `${base}\n\n${daily}` : base;
}

export function fullMarchingOrders() {
  return load();
}
