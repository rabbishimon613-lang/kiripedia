#!/usr/bin/env node
// Coordinator. THE ONLY WRITER. Single-threaded by design.
//
// 1. Pulls passed claims from SQLite, groups by (source clip → article).
// 2. Builds one scaffolder spec per source clip.
// 3. Runs scaffold-articles.mjs (existing, no LLM).
// 4. Runs audit-frontmatter + audit-wikilinks.
// 5. If clean: git add + commit (push later from GH Actions).
// 6. Marks claims as 'merged' in DB and bumps clip to 'published'.
//
// Run: node botnet/workers/coordinator.mjs [--push] [--dry-run]

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { db, logActivity } from '../lib/db.mjs';
import { bumpHash } from '../lib/hash.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const SCAFFOLDER = join(REPO_ROOT, 'tools', 'scaffold-articles.mjs');
const AUDIT_FM = join(REPO_ROOT, 'tools', 'audit-frontmatter.mjs');
const AUDIT_WL = join(REPO_ROOT, 'tools', 'audit-wikilinks.mjs');

const args = process.argv.slice(2);
const PUSH = args.includes('--push');
const DRY = args.includes('--dry-run');

const WORKER = 'coordinator';
const ROLE = 'coordinator';

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: 'Collecting passed claims for filing.' });

const cycle = db.prepare(`INSERT INTO cycles DEFAULT VALUES`).run();
const cycleId = cycle.lastInsertRowid;

// 1. Collect all passed claims grouped by source clip.
const claims = db.prepare(`
  SELECT c.*, cl.slug AS clip_slug
  FROM claims c
  JOIN clips cl ON cl.video_id = c.video_id
  WHERE c.status IN ('passed', 'passed_low')
  ORDER BY c.video_id, c.article_slug, c.id
`).all();

if (claims.length === 0) {
  db.prepare(`UPDATE cycles SET ended_at=datetime('now'), status='committed', claims_merged=0 WHERE id=?`)
    .run(cycleId);
  logActivity({ worker: WORKER, role: ROLE, event: 'idle', detail: 'Checked the inbox — no passed claims waiting to file.' });
  console.log('[coordinator] no claims to merge.');
  process.exit(0);
}

// 2. Group: { videoId → { slug → spec } }
const byClip = new Map();
for (const c of claims) {
  if (!byClip.has(c.video_id)) byClip.set(c.video_id, { slug: c.clip_slug, articles: new Map() });
  const grp = byClip.get(c.video_id);

  if (!grp.articles.has(c.article_slug)) {
    grp.articles.set(c.article_slug, {
      isNew: c.is_new_article === 1,
      bodyChunks: [],
      eventsAppend: [],
      dykAppend: [],
      claimIds: [],
      entities: new Set(),
    });
  }
  const a = grp.articles.get(c.article_slug);
  a.claimIds.push(c.id);
  const payload = JSON.parse(c.patch_payload);
  for (const e of (JSON.parse(c.named_entities || '[]'))) a.entities.add(e);

  const citeTag = `<Cite t="${payload.timestamp}" />`;
  const disputedPrefix = c.confidence < 90 ? '{{disputed}} ' : '';

  if (c.patch_kind === 'events_append') {
    a.eventsAppend.push({ date: payload.timestamp_date || null, description: `${payload.claim_text} ${citeTag}` });
  } else if (c.patch_kind === 'dyk_append') {
    a.dykAppend.push(payload.claim_text);
  } else {
    a.bodyChunks.push(`${disputedPrefix}${payload.claim_text} ${citeTag}`);
  }
}

let totalMerged = 0;
let touchedArticles = new Set();

// 3. Emit one spec per clip, run scaffolder.
for (const [videoId, grp] of byClip) {
  const spec = { _defaults: { source_slug: grp.slug }, articles: {} };

  for (const [slug, a] of grp.articles) {
    if (a.isNew) {
      const title = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
      spec.articles[slug] = {
        title,
        summary: `Per Kiriakou, ${[...a.entities].slice(0, 3).join(', ') || title}.`.slice(0, 280),
        categories: ['Concepts'],  // safe default; can be refined later
        dyk: a.dykAppend.length >= 2 ? a.dykAppend.slice(0, 4) : [
          `… that [${title}](/wiki/${slug}) features in [John Kiriakou](/wiki/john-kiriakou)'s public appearances?`,
          `… that [${title}](/wiki/${slug}) appears in the [KiriPedia](/wiki/kiripedia) corpus?`,
        ],
        body: a.bodyChunks.join('\n\n'),
      };
    } else {
      spec.articles[slug] = { _enrich: true };
      if (a.bodyChunks.length) {
        spec.articles[slug].body_append = `## From ${grp.slug}\n\n${a.bodyChunks.join('\n\n')}`;
      }
      if (a.dykAppend.length) {
        spec.articles[slug].dyk_append = a.dykAppend.map(t =>
          `… that ${t.toLowerCase().replace(/\.$/, '')} ([${grp.slug}](/sources/${grp.slug}))?`
        );
      }
      if (a.eventsAppend.length) {
        spec.articles[slug].events_append = a.eventsAppend.filter(e =>
          e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date)
        );
      }
    }
    touchedArticles.add(slug);
    totalMerged += a.claimIds.length;
  }

  const specPath = join(tmpdir(), `botnet-spec-${videoId}.json`);
  writeFileSync(specPath, JSON.stringify(spec, null, 2));

  if (DRY) {
    console.log(`[dry-run] would scaffold ${Object.keys(spec.articles).length} articles for ${grp.slug}`);
    console.log(`[dry-run] spec at ${specPath}`);
    continue;
  }

  try {
    execSync(`node ${SCAFFOLDER} ${specPath}`, { cwd: REPO_ROOT, encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    const reason = (err.stderr?.toString() || err.message).split('\n')[0].slice(0, 240);
    console.error(`[coordinator] scaffolder failed for ${grp.slug}: ${reason} — quarantining and continuing`);
    // Quarantine this clip's pending claims so we don't choke on them next cycle.
    const quarantineClaim = db.prepare(`UPDATE claims SET status='quarantined', review_notes=COALESCE(review_notes,'') || ' [coord:scaffold_fail:' || ? || ']' WHERE id=?`);
    const tx = db.transaction(() => {
      for (const [, a] of grp.articles) for (const id of a.claimIds) quarantineClaim.run(reason.slice(0, 80), id);
    });
    tx();
    continue;
  }

  // Mark claims merged for this clip.
  const mark = db.prepare(`UPDATE claims SET status='merged' WHERE id=?`);
  const bumpClip = db.prepare(`UPDATE clips SET status='published' WHERE video_id=?`);
  const tx = db.transaction(() => {
    for (const [, a] of grp.articles) for (const id of a.claimIds) mark.run(id);
    bumpClip.run(videoId);
  });
  tx();
}

if (DRY) {
  console.log(`[dry-run] would merge ${totalMerged} claims across ${touchedArticles.size} articles.`);
  process.exit(0);
}

// 4. Audits.
try {
  execSync(`node ${AUDIT_FM}`, { cwd: REPO_ROOT, stdio: 'pipe' });
  execSync(`node ${AUDIT_WL}`, { cwd: REPO_ROOT, stdio: 'pipe' });
} catch (err) {
  console.error('[coordinator] audit failed:', err.stderr?.toString() || err.message);
  db.prepare(`UPDATE cycles SET ended_at=datetime('now'), status='failed' WHERE id=?`).run(cycleId);
  process.exit(3);
}

// 5. Commit.
let sha = null;
try {
  execSync(`git add -A`, { cwd: REPO_ROOT });
  const hasChanges = execSync(`git status --porcelain`, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  if (hasChanges) {
    execSync(`git commit -m "botnet cycle ${cycleId}: ${totalMerged} claims, ${touchedArticles.size} articles"`,
             { cwd: REPO_ROOT });
    sha = execSync(`git rev-parse HEAD`, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
    if (PUSH) {
      // Push with rebase fallback. The x-bot pushes its own commits to main
      // from time to time, so a stale local can lose the push race; pulling
      // with rebase lets us catch up and try once more. If that still fails
      // we log and bail — the next cycle will try again.
      try {
        execSync(`git push`, { cwd: REPO_ROOT, stdio: 'pipe' });
      } catch (pushErr) {
        try {
          execSync(`git pull --rebase --autostash origin main`, { cwd: REPO_ROOT, stdio: 'pipe' });
          execSync(`git push`, { cwd: REPO_ROOT, stdio: 'pipe' });
        } catch (retryErr) {
          console.error('[coordinator] push still failing after rebase:', (retryErr.stderr?.toString() || retryErr.message).slice(0, 240));
        }
      }
    }
  }
} catch (err) {
  console.error('[coordinator] git failed:', err.message);
}

db.prepare(`UPDATE cycles SET ended_at=datetime('now'), status='committed',
            claims_merged=?, articles_touched=?, commit_sha=? WHERE id=?`)
  .run(totalMerged, touchedArticles.size, sha, cycleId);

// Flip the article_set_hash if anything actually changed. The hash is the
// heartbeat: stale verdicts expire and Engine 2 (Re-Reader) wakes up.
let newHash = null;
if (sha) {
  try { newHash = bumpHash(); } catch (err) { console.error('[coordinator] hash bump failed:', err.message); }
}

const hashSuffix = newHash ? ` hash→${newHash.slice(0, 8)}` : '';
logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: `Filed ${totalMerged} claims into ${touchedArticles.size} articles${sha ? ' (commit ' + sha.slice(0,7) + ').' : ' — no commit needed.'}${hashSuffix}` });
console.log(`[coordinator] merged ${totalMerged} claims into ${touchedArticles.size} articles. sha=${sha?.slice(0,7) || '(no change)'}${hashSuffix}`);
