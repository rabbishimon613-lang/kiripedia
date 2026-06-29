#!/usr/bin/env node
// Article Weaver. Picks the thinnest article (fewest paragraphs / smallest
// file) that also has rich corpus coverage (mention count above threshold),
// then rewrites it from stub-grade into Wikipedia-style sectional narrative
// using existing transcript material.
//
// LLM-optional: skips cleanly if no Cerebras/Groq keys.
//
// Run: node botnet/workers/weaver.mjs [--batch N]

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logActivity } from '../lib/db.mjs';
import { worker_longcontext } from '../lib/fleet-client.mjs';
import { lastWorked, markWorked } from '../lib/last-worked.mjs';
import { arg, intArg } from '../lib/argv.mjs';
import { marchingOrdersFor } from '../lib/marching-orders.mjs';
import { drainBriefs } from '../lib/brief-runner.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const ARTICLES_DIR = join(REPO_ROOT, 'src', 'content', 'articles');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');

const WORKER = arg('--worker', 'weaver-1');
const ROLE = 'weaver';
const BATCH = intArg('--batch', 1);

const humanize = s => s.replace(/-\d{4}$/, '').split('-').map(w => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
// Lowered from 8 → 1: with ~798k transcript words spread across ~63
// transcripts, even a single grep hit means there's corpus material to draw
// on. The old threshold rejected most stubs from ever being woven.
const MENTION_THRESHOLD = 1;
const COOLDOWN_SEC = 60 * 60; // 1h — June–July push, every stub deserves another shot
// Per panel verdict: Weaver scoped to true stubs only; Reweaver owns the
// 800-2500w "pile of rags" band.
const MAX_SIZE = parseInt(process.env.WEAVER_MAX_SIZE) || 4000; // ~800 words

function shellQuote(s) {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function mentionCount(slug) {
  const terms = slug.split('-').filter(t => t.length >= 4);
  if (terms.length === 0) return 0;
  let total = 0;
  for (const term of terms) {
    try {
      const out = execSync(
        `grep -ric ${shellQuote(term)} ${shellQuote(SOURCES_DIR)} || true`,
        { encoding: 'utf8' }
      ).trim();
      const n = parseInt(out, 10);
      if (!Number.isNaN(n)) total += n;
    } catch { /* non-fatal */ }
  }
  return total;
}

function pickArticle(exclude = new Set()) {
  const nowSec = Math.floor(Date.now() / 1000);
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));
  const candidates = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    if (exclude.has(slug)) continue;
    if (nowSec - lastWorked(slug, ROLE) < COOLDOWN_SEC) continue;
    const path = join(ARTICLES_DIR, f);
    let size;
    try { size = statSync(path).size; } catch { continue; }
    if (size > MAX_SIZE) continue; // Reweaver's territory
    const mentions = mentionCount(slug);
    if (mentions < MENTION_THRESHOLD) continue;
    candidates.push({ slug, path, size, mentions });
  }
  // Smallest stub first (biggest growth potential); high mention count breaks ties.
  candidates.sort((a, b) => a.size - b.size || b.mentions - a.mentions);
  return candidates[0] || null;
}

const SYSTEM = `${marchingOrdersFor('weaver')}

You are the Article Weaver for KiriPedia, an encyclopedic wiki built ENTIRELY from John Kiriakou's recorded public statements. You receive ONE article stub plus rich corpus excerpts. Rewrite the article into Wikipedia-style sectional narrative using ONLY material grounded in the excerpts.

—————————————————————————————————
THE VOICE (HARD RULES, NON-NEGOTIABLE)
—————————————————————————————————

1. **Encyclopedic third person, declarative.** No "according to Kiriakou," no "Kiriakou says," no "in an interview." Sourcing is invisible (the <Cite /> tag carries it). NOT "Kiriakou says Cofer Black warned…"; YES "Cofer Black, head of the CIA Counterterrorism Center, warned…"
2. **Preserve direct quotes verbatim, italicised in single asterisks.** Embed striking statements as *"like this"* or as a blockquote. Never paraphrase a quote — include it or omit it.
3. **Dense, specific prose.** Capture every named entity, date, place, dollar figure, agency. Never thin.
4. **Wikilink every proper noun on first mention** using \`[Name](/wiki/slug)\`. If you don't know the slug, leave the noun unlinked — NEVER invent a slug.
5. **Mirror Kiriakou's discretion.** Preserve his hedges ("an unnamed Middle Eastern country," "an asset called Mahmud") verbatim.

Forbidden patterns: "According to Kiriakou," "Kiriakou says," "Per John Kiriakou," "in an interview." Cut all of these.

—————————————————————————————————
STRUCTURAL RULES
—————————————————————————————————

- **Preserve EVERY existing <Cite/> tag and every italicised *"..."* quote, verbatim and unchanged.** A pass that drops a cite or a quote will be rejected.
- **Do not invent timestamps.** Every <Cite/> tag must come from the input.
- **Section spine: 3–6 H2 headers**, named for the topic of the section (e.g. "## The September 12 speech," "## The post-9/11 budget" — NEVER "## From source-slug-xyz"). No stub sub-stubs.
- **Lede paragraph**: one or two paragraphs introducing the subject, encyclopedic voice, subject wikilinked on first mention.
- **Body sections**: each H2 covers one coherent topic. Multiple paragraphs per section is normal.
- Output MUST be a complete MDX article body (no frontmatter — that stays intact).

—————————————————————————————————
EXAMPLE — well-woven article voice
—————————————————————————————————

**Cofer Black** was the head of the [Central Intelligence Agency](/wiki/cia)'s Counterterrorism Center during the September 11 attacks. He is the public face of the agency's paramilitary turn on September 12, 2001. [John Kiriakou](/wiki/john-kiriakou) describes him with personal admiration: *"I always had deep respect for Cofer. We can certainly have disagreements on policy, but man, what a patriot."*<Cite s="2025-08-31-dalton-fischer-mossad-blackwater" t="1:38:27" />

## The "flies on Bin Laden's eyeballs" quote

Black is the source of one of the canonical phrases of the post-September 11 period. At a Camp David meeting in the days immediately following the attacks, Black committed to President George W. Bush that he would *"see flies on Bin Laden's eyeballs"* when his work was done.<Cite s="2025-08-31-dalton-fischer-mossad-blackwater" t="1:38:27" />

NOTICE: third person, every proper noun wikilinked on first mention, direct quotes italicised verbatim, topic-named sections, no "Kiriakou says." Match this voice exactly.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['body'],
  properties: {
    body: { type: 'string', minLength: 200, maxLength: 30_000 },
  },
};

async function run(pick) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Pulled up ${humanize(pick.slug)} — drafting it from the transcripts.` });
  console.log(`[${WORKER}] picked ${pick.slug} (size=${pick.size}b, mentions=${pick.mentions})`);

  let orig;
  try { orig = readFileSync(pick.path, 'utf8'); } catch {
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Can't get the draft for ${humanize(pick.slug)} open.`, handoffTo: 'coordinator' });
    return;
  }

  // Split frontmatter from body so we only rewrite the body.
  const fmMatch = orig.match(/^---\n[\s\S]*?\n---\n/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  const body = fmMatch ? orig.slice(fmMatch[0].length) : orig;

  // Pull corpus excerpts.
  const slugTerm = pick.slug.split('-').filter(t => t.length >= 4)[0] || pick.slug;
  let excerpts = '';
  try {
    excerpts = execSync(
      `grep -rnB1 -A4 --include='*.md' ${shellQuote(slugTerm)} ${shellQuote(SOURCES_DIR)} | head -200 || true`,
      { encoding: 'utf8' }
    );
  } catch { /* non-fatal */ }

  let result;
  try {
    result = await worker_longcontext({
      system: SYSTEM,
      user: `EXISTING ARTICLE BODY (${pick.slug}):\n\n${body}\n\nCORPUS EXCERPTS:\n\n${excerpts.slice(0, 12_000)}`,
      schema: SCHEMA,
      maxTokens: 6000,
    });
  } catch (err) {
    console.warn(`[${WORKER}] LLM unavailable (${err.message.slice(0, 120)}); skipping weave`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Putting ${humanize(pick.slug)} back in the inbox for now.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  const newBody = (result.body || '').trim();
  if (newBody.length < body.length) {
    console.warn(`[${WORKER}] weave produced shorter body (${newBody.length} < ${body.length}); skipping write`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Threw out my draft of ${humanize(pick.slug)} — came out shorter than I started.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  // Hard preservation guard: every <Cite /> and every italicised *"..."*
  // Kiriakou quote in the original MUST appear in the rewrite. Otherwise
  // the weave is rejected and the article stays as the pile of fragments.
  // Same guard the Reweaver uses; relit 2026-06-29 after a regression on
  // surveillance-detection-route lost six direct quotes during a rewrite.
  const cites = (s) => [...s.matchAll(/<Cite\s+[^/]*\/>/g)].map(m => m[0]);
  const quotes = (s) => {
    const n = s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ');
    return [...n.matchAll(/\*"([^"]{4,})"\*/g)].map(m => m[1].trim());
  };
  const inputCites = cites(body);
  const outputCiteSet = new Set(cites(newBody));
  const missingCites = inputCites.filter(c => !outputCiteSet.has(c));
  if (missingCites.length > 0) {
    console.warn(`[${WORKER}] weave dropped ${missingCites.length}/${inputCites.length} citations; rejecting`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Threw out my draft of ${humanize(pick.slug)} — I lost ${missingCites.length} footnotes. Unacceptable.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }
  const inputQuotes = quotes(body);
  const outputQuoteSet = new Set(quotes(newBody));
  const missingQuotes = inputQuotes.filter(q => !outputQuoteSet.has(q));
  if (missingQuotes.length > 0) {
    console.warn(`[${WORKER}] weave dropped ${missingQuotes.length}/${inputQuotes.length} italicised quotes; rejecting`);
    logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                  detail: `Threw out my draft of ${humanize(pick.slug)} — I dropped ${missingQuotes.length} direct Kiriakou quotes. Unacceptable.`,
                  refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
    return;
  }

  writeFileSync(pick.path, frontmatter + newBody + '\n');

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Finished ${humanize(pick.slug)}. Grew it from ${body.length} to ${newBody.length} characters, kept every footnote and quote.`,
                refKind: 'article', refId: pick.slug, handoffTo: 'coordinator' });
  console.log(`[${WORKER}] ${pick.slug}: ${body.length} → ${newBody.length} chars, ${inputCites.length} cites + ${inputQuotes.length} quotes preserved`);
}

// PHASE 2: drain pending weaver briefs first.
// Brief scope: { kind: 'shape-redesign' | 'standard', slug }
const touched = new Set();
const briefDrain = await drainBriefs({
  role: 'weaver',
  workerId: WORKER,
  max: BATCH,
  handler: async ({ scope }) => {
    if (!scope.slug) throw new Error('brief scope missing slug');
    const path = join(ARTICLES_DIR, `${scope.slug}.mdx`);
    let size;
    try { size = statSync(path).size; } catch { throw new Error(`article not found: ${scope.slug}`); }
    const pick = { slug: scope.slug, path, size, mentions: mentionCount(scope.slug) };
    touched.add(scope.slug);
    markWorked(scope.slug, ROLE);
    await run(pick);
    return { result: { slug: scope.slug, kind: scope.kind || 'standard' }, filesChanged: [path] };
  },
});

for (let i = briefDrain.done + briefDrain.failed; i < BATCH; i++) {
  const pick = pickArticle(touched);
  if (!pick) {
    if (i === 0) {
      logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                    detail: 'Checked every stub — they all got drafted this round.',
                    handoffTo: 'coordinator' });
    }
    break;
  }
  touched.add(pick.slug);
  markWorked(pick.slug, ROLE);
  await run(pick);
}
