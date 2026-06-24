#!/usr/bin/env node
// Catch Importer. Drains fleet/catch/*.jsonl records into the botnet clips
// table, bridging the Harbor Master fleet (which lands catches) and the
// botnet workforce (which transcribes/catalogs/reviews).
//
// Bridge semantics:
//   - status: 'greenlit'  -> insert as clips.status='triaged_on' (skip NPP).
//                            These have already been human-approved.
//   - status: 'trusted'   -> same as greenlit (legacy alias).
//   - status: 'fresh' + trusted:true + --auto-trust flag -> triaged_on.
//   - status: 'fresh' (untrusted) -> insert as clips.status='lead'
//                            (will need NPP triage downstream).
//   - status: 'trashed' / 'processed' / 'suspect' -> skip.
//
// Once a record is imported, its catch-file status is rewritten to
// 'imported' so we never re-import. The catch file is rewritten in place
// (status flips only — per HARBOR-MASTER.md hard rule "never delete catch
// records").
//
// Run:
//   node botnet/workers/catch-importer.mjs [--auto-trust] [--dry-run]
//   node botnet/workers/catch-importer.mjs --only <video_id> [--auto-trust]

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, registerLead, logActivity } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const CATCH_DIR = join(REPO_ROOT, 'fleet', 'catch');

const WORKER = 'catch-importer-1';
const ROLE = 'catch-importer';

const args = process.argv.slice(2);
const AUTO_TRUST = args.includes('--auto-trust');
const DRY_RUN = args.includes('--dry-run');
const ONLY_IDX = args.indexOf('--only');
const ONLY = ONLY_IDX >= 0 ? args[ONLY_IDX + 1] : null;

function catchFiles() {
  return readdirSync(CATCH_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f))
    .sort()
    .map(f => join(CATCH_DIR, f));
}

function shouldImport(rec) {
  if (ONLY && rec.video_id !== ONLY) return null;
  if (rec.catch_type !== 'youtube_longform') return null;
  switch (rec.status) {
    case 'greenlit':
    case 'trusted':
      return 'triaged_on';
    case 'fresh':
      if (rec.trusted && AUTO_TRUST) return 'triaged_on';
      if (rec.trusted) return 'lead'; // import for NPP, even if trusted
      return 'lead';
    default:
      return null; // trashed/processed/suspect/imported/etc
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: `Draining fleet/catch into clips (auto-trust=${AUTO_TRUST}${ONLY ? `, only=${ONLY}` : ''}).` });

let imported = 0, asTriaged = 0, asLead = 0, skipped = 0, alreadyHad = 0;

for (const path of catchFiles()) {
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split('\n');
  let dirty = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    let rec;
    try { rec = JSON.parse(line); } catch { continue; }
    const target = shouldImport(rec);
    if (!target) { skipped++; continue; }

    // Convert catch fields to clip fields.
    const uploadDate = rec.date ? rec.date.replace(/-/g, '') : null;
    const isNew = registerLead({
      videoId: rec.video_id,
      url: rec.url,
      channel: rec.channel,
      title: rec.title,
      uploadDate,
      durationSec: rec.duration_sec ?? null,
    });

    // Force status (registerLead is INSERT OR IGNORE; it won't move an
    // existing 'lead' clip into 'triaged_on'; do that here explicitly).
    if (!DRY_RUN) {
      if (target === 'triaged_on') {
        db.prepare(`
          UPDATE clips
             SET status='triaged_on',
                 triage_reason=COALESCE(triage_reason, 'fleet/catch import (trusted)')
           WHERE video_id=? AND status IN ('lead', 'triaged_on')
        `).run(rec.video_id);
        asTriaged++;
      } else {
        asLead++;
      }
    }

    if (isNew) imported++;
    else alreadyHad++;

    // Mark the catch record as imported so we don't reprocess.
    if (!DRY_RUN) {
      rec.status = 'imported';
      rec.imported_at = new Date().toISOString();
      rec.imported_as = target;
      lines[i] = JSON.stringify(rec);
      dirty = true;
    }
  }
  if (dirty && !DRY_RUN) writeFileSync(path, lines.join('\n'));
}

const msg = `Imported ${imported} new + refreshed ${alreadyHad} existing. ${asTriaged} jumped to triaged_on, ${asLead} parked as lead. Skipped ${skipped}.${DRY_RUN ? ' [dry-run]' : ''}`;
logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail: msg, handoffTo: asTriaged > 0 ? 'scribe' : 'npp' });
console.log(`[catch-importer] ${msg}`);
