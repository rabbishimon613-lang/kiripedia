#!/usr/bin/env node
// New Page Patroller. Triages leads: on-corpus vs off-corpus.
// Uses worker_fast (Groq llama-3.1-8b). Cheap, ~hundreds/hour.
//
// Run: node botnet/workers/npp.mjs [--batch N]

import { db, claimNextClip, releaseClip, logActivity } from '../lib/db.mjs';
import { worker_fast } from '../lib/fleet-client.mjs';

const WORKER = 'npp-1';
const ROLE = 'npp';
const args = process.argv.slice(2);
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 20;

const TRIAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['on_corpus', 'reason'],
  properties: {
    on_corpus: { type: 'boolean' },
    reason: { type: 'string', maxLength: 200 },
  },
};

const SYSTEM = `You triage YouTube videos for KiriPedia, a wiki about John Kiriakou.

Rules:
- ON-CORPUS = John Kiriakou is the actual speaker / guest in this video, talking at length.
- OFF-CORPUS = video is ABOUT Kiriakou but he is not in it; or he is named but never speaks; or it is a news clip; or it is under 10 minutes and likely a derivative clip.

Decide from title, channel, and duration alone. When in doubt, set on_corpus=false.`;

async function triageOne(clip) {
  const user = `Title: ${clip.title ?? '(unknown)'}\nChannel: ${clip.channel ?? '(unknown)'}\nDuration: ${clip.duration_sec ? Math.round(clip.duration_sec / 60) + ' min' : '(unknown)'}\nURL: ${clip.url}`;

  let verdict;
  try {
    verdict = await worker_fast({ system: SYSTEM, user, schema: TRIAGE_SCHEMA });
  } catch (err) {
    console.error(`[npp] error on ${clip.video_id}:`, err.message);
    releaseClip(clip.video_id); // back to queue for retry
    return null;
  }
  return verdict;
}

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: `Triaging up to ${BATCH}` });

let on = 0, off = 0, errors = 0;
for (let i = 0; i < BATCH; i++) {
  const clip = claimNextClip({ status: 'lead', worker: WORKER });
  if (!clip) break;

  // Duration shortcut: anything < 10 min, off-corpus by rule.
  if (clip.duration_sec != null && clip.duration_sec < 600) {
    db.prepare(`UPDATE clips SET status='triaged_off', triage_reason='under 10min', worker=NULL, worker_since=NULL WHERE video_id=?`)
      .run(clip.video_id);
    off++; continue;
  }

  const verdict = await triageOne(clip);
  if (!verdict) { errors++; continue; }

  if (verdict.on_corpus) {
    db.prepare(`UPDATE clips SET status='triaged_on', triage_reason=?, worker=NULL, worker_since=NULL WHERE video_id=?`)
      .run(verdict.reason, clip.video_id);
    on++;
  } else {
    db.prepare(`UPDATE clips SET status='triaged_off', triage_reason=?, worker=NULL, worker_since=NULL WHERE video_id=?`)
      .run(verdict.reason, clip.video_id);
    off++;
  }
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish', detail: `on=${on} off=${off} err=${errors}` });
console.log(`[npp] on=${on} off=${off} err=${errors}`);
