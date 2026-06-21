#!/usr/bin/env node
// Source Auth Clerk. When NPP greenlights a clip on a NEW channel
// (not in grounds.json), verifies the channel and adds it to the
// trusted list. Code-only check + structured LLM second opinion.
//
// Run: node botnet/workers/source-auth.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logActivity } from '../lib/db.mjs';
import { worker_reasoning } from '../lib/fleet-client.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const GROUNDS = join(REPO_ROOT, 'fleet', 'config', 'grounds.json');

const WORKER = 'source-auth-1';
const ROLE = 'source-auth';

const grounds = JSON.parse(readFileSync(GROUNDS, 'utf8'));
const trusted = new Set(grounds.youtube.trusted_channels.map(c => c.toLowerCase()));

// Distinct channels currently producing on-corpus content but not yet trusted.
const candidates = db.prepare(`
  SELECT channel, COUNT(*) AS hits
  FROM clips
  WHERE status = 'triaged_on' AND channel IS NOT NULL
  GROUP BY channel
  ORDER BY hits DESC
`).all().filter(r => !trusted.has(r.channel.toLowerCase()));

if (candidates.length === 0) {
  logActivity({ worker: WORKER, role: ROLE, event: 'idle', detail: 'no candidates' });
  console.log('[source-auth] no candidate channels.');
  process.exit(0);
}

logActivity({ worker: WORKER, role: ROLE, event: 'start', detail: `${candidates.length} candidate channels` });

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['legitimate', 'reason'],
  properties: {
    legitimate: { type: 'boolean' },
    reason: { type: 'string', maxLength: 200 },
  },
};

const SYSTEM = `You verify whether a YouTube channel is a legitimate long-form interview/podcast venue that has hosted John Kiriakou. Reject reupload/clip farms, sock-puppet accounts, and channels whose name pattern suggests automation.`;

let added = 0;
for (const { channel, hits } of candidates.slice(0, 10)) {
  // Sample one clip title for context.
  const sample = db.prepare(`SELECT title FROM clips WHERE channel = ? AND title IS NOT NULL LIMIT 1`).get(channel);
  const user = `Channel name: ${channel}\nKiriakou-related upload count seen: ${hits}\nSample title: ${sample?.title ?? '(none)'}\n\nIs this a legitimate venue?`;

  let verdict;
  try {
    verdict = await worker_reasoning({ system: SYSTEM, user, schema: SCHEMA, maxTokens: 256 });
  } catch (err) {
    console.error(`[source-auth] error on ${channel}:`, err.message);
    continue;
  }

  if (verdict.legitimate) {
    grounds.youtube.trusted_channels.push(channel);
    trusted.add(channel.toLowerCase());
    added++;
    console.log(`[source-auth] ADDED ${channel} (${verdict.reason})`);
  } else {
    console.log(`[source-auth] rejected ${channel} (${verdict.reason})`);
  }
}

if (added > 0) {
  writeFileSync(GROUNDS, JSON.stringify(grounds, null, 2) + '\n');
}

logActivity({ worker: WORKER, role: ROLE, event: 'finish', detail: `added ${added}` });
console.log(`[source-auth] added ${added} channels.`);
