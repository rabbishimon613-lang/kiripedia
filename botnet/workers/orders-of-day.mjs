#!/usr/bin/env node
// Orders of the Day. Fires once per day (2am UTC via run-forever.mjs).
// Reads the current state of the corpus — article word counts, transcript
// citation gaps, 500k-word goal — and writes a daily briefing to
// botnet/state/orders-today.json that every other worker reads at startup.
//
// No LLM needed. Pure computation. The briefing tells each worker:
//   - How far from 500k we are
//   - Which specific articles to prioritize deepening today
//   - Which transcripts are most undermined and should be prospected first
//   - Which thin articles need the most urgent attention
//
// Run: node botnet/workers/orders-of-day.mjs

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR  = join(REPO_ROOT, 'src', 'content', 'sources');
const OUT_PATH     = join(REPO_ROOT, 'botnet', 'state', 'orders-today.json');

const WORKER = 'orders-of-day';
const GOAL   = 500_000;

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function humanize(slug) {
  return slug.replace(/-\d{4}$/, '').split('-')
    .map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

// ── Article scan ────────────────────────────────────────────────────────────
const articleFiles = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
const articles = articleFiles.map(f => {
  const slug = f.replace(/\.mdx$/, '');
  let body = '';
  try { body = readFileSync(join(ARTICLES_DIR, f), 'utf8'); } catch {}
  const words = wordCount(body);
  // Count how many source transcripts it cites
  const citeMatches = body.match(/s="([^"]+)"/g) || [];
  const sourcesReferenced = new Set(citeMatches.map(m => m.replace(/s="|"/g, '')));
  return { slug, words, sourcesReferenced };
});

const totalWords = articles.reduce((s, a) => s + a.words, 0);
const gap = Math.max(0, GOAL - totalWords);

// Thin articles sorted by words ascending (smallest first)
const thinArticles = articles
  .filter(a => a.words < 400)
  .sort((a, b) => a.words - b.words)
  .slice(0, 20)
  .map(a => a.slug);

// Articles with decent content but still room to grow (200–800w)
const growthArticles = articles
  .filter(a => a.words >= 200 && a.words < 800)
  .sort((a, b) => a.words - b.words)
  .slice(0, 20)
  .map(a => a.slug);

// ── Source/transcript scan ──────────────────────────────────────────────────
const sourceFiles = readdirSync(SOURCES_DIR)
  .filter(f => f.endsWith('.md') && !f.includes('.sponsors'));

// For each transcript: word count and how many articles cite it
const citedBySlugs = new Set(articles.flatMap(a => [...a.sourcesReferenced]));
const sources = sourceFiles.map(f => {
  const slug = f.replace(/\.md$/, '');
  let body = '';
  try { body = readFileSync(join(SOURCES_DIR, f), 'utf8'); } catch {}
  const words = wordCount(body);
  // Count articles that reference this source by slug
  const citeCount = articles.filter(a => a.sourcesReferenced.has(slug)).length;
  return { slug, words, citeCount };
});

// Sort by: fewest cites first, then most words first (richest unmined)
const undermined = sources
  .filter(s => s.words >= 400)
  .sort((a, b) => a.citeCount - b.citeCount || b.words - a.words)
  .slice(0, 20)
  .map(s => s.slug);

// Also: sources with cites < 3 and lots of words — still have room
const underServed = sources
  .filter(s => s.words >= 1000 && s.citeCount < 3)
  .sort((a, b) => b.words - a.words)
  .slice(0, 10)
  .map(s => s.slug);

// ── Word-per-day math ───────────────────────────────────────────────────────
// Assume cycles run ~every 5 minutes, 288 cycles/day.
// At current pace (917 words on our best day so far) we need a rate.
const daysToGoal = gap > 0 ? Math.ceil(gap / 2000) : 0; // target 2000w/day

// ── Build orders ────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const orders = {
  date: today,
  generated_at: new Date().toISOString(),
  goal: GOAL,
  total_words: totalWords,
  gap,
  days_at_2k_per_day: daysToGoal,
  priority_transcripts: undermined,       // prospector + deepener hit these first
  growth_articles: growthArticles,        // enricher + deepener focus here
  thin_articles: thinArticles,            // weaver + reweaver fill these stubs
  under_served_transcripts: underServed,  // cataloger should re-walk these
  directive: `TODAY'S ORDERS (${today}): The bureau is at ${totalWords.toLocaleString()} words — ${gap.toLocaleString()} short of the 500k goal. Target 2,000 new words today. Priority: (1) Prospect and deepen the undermined transcripts listed in priority_transcripts. (2) Grow the thin articles in growth_articles and thin_articles using material already in the corpus. (3) Every cycle should produce real prose — if your queue is empty, re-mine the transcript shelf, do not idle.`,
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(orders, null, 2));

const summaryLine = `Bureau at ${totalWords.toLocaleString()}/${GOAL.toLocaleString()} words. Gap: ${gap.toLocaleString()}. Top targets: ${undermined.slice(0, 3).map(humanize).join(', ')}.`;
logActivity({ worker: WORKER, role: 'orders-of-day', event: 'finish', detail: summaryLine });

console.log(`[orders-of-day] ${summaryLine}`);
console.log(`[orders-of-day] wrote ${OUT_PATH}`);
