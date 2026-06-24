#!/usr/bin/env node
// Cataloger MCP Bridge.
// Reads a JSON object {claims:[...]} from stdin (or --file) and inserts its
// claims into the botnet `claims` table for a given clip. This is the
// "last mile" used when the cataloger work is dispatched via the
// mcp__llm-fleet__worker_reasoning tool from an interactive session
// (because MCP tools cannot be called from a spawned node process).
//
// After insert, marks the clip status='catalogued'.
//
// Usage:
//   node botnet/workers/cataloger-mcp-bridge.mjs --video-id <id> --file <path>
//   cat claims.json | node botnet/workers/cataloger-mcp-bridge.mjs --video-id <id>
//
// Idempotent: re-running on the same {video_id, segment_start, claim_text}
// is a no-op (UNIQUE constraint).

import { readFileSync } from 'node:fs';
import { db, logActivity } from '../lib/db.mjs';

const args = process.argv.slice(2);
const idx = (k) => args.indexOf(k);
const VIDEO_ID = idx('--video-id') >= 0 ? args[idx('--video-id') + 1] : null;
const FILE = idx('--file') >= 0 ? args[idx('--file') + 1] : null;
const WORKER = idx('--worker') >= 0 ? args[idx('--worker') + 1] : 'cataloger-mcp-1';
const KEEP_TRIAGED = args.includes('--keep-status');
const ROLE = 'cataloger';

if (!VIDEO_ID) { console.error('--video-id required'); process.exit(2); }

let raw;
if (FILE) {
  raw = readFileSync(FILE, 'utf8');
} else {
  raw = readFileSync(0, 'utf8'); // stdin
}

// Tolerate output wrapped in ```json fences or with prose around it.
function extractJson(s) {
  const fenced = s.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced) return fenced[1];
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first >= 0 && last > first) return s.slice(first, last + 1);
  return s;
}

let obj;
try {
  obj = JSON.parse(extractJson(raw));
} catch (err) {
  console.error('Could not parse cataloger output as JSON:', err.message);
  process.exit(3);
}

const claims = Array.isArray(obj) ? obj : obj.claims;
if (!Array.isArray(claims)) {
  console.error('Expected { claims: [...] } or [...]; got:', typeof obj);
  process.exit(4);
}

const clip = db.prepare(`SELECT video_id, status, slug FROM clips WHERE video_id = ?`).get(VIDEO_ID);
if (!clip) { console.error(`No clip for video_id=${VIDEO_ID}`); process.exit(5); }

const insert = db.prepare(`
  INSERT OR IGNORE INTO claims
    (video_id, segment_start, segment_end, quote, claim_text, article_slug,
     is_new_article, is_about_kiriakou_himself, patch_kind, patch_payload, named_entities)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

logActivity({ worker: WORKER, role: ROLE, event: 'start',
              detail: `Importing ${claims.length} claims from MCP cataloger for ${clip.slug ?? VIDEO_ID}.`,
              refKind: 'clip', refId: VIDEO_ID });

let added = 0, skipped = 0, rejected = 0;
for (const c of claims) {
  // Defensive validation; downstream reviewer will do the grounding stack.
  if (!c.quote || !c.timestamp || !c.claim_text || !c.article_slug || !c.patch_kind) {
    rejected++;
    continue;
  }
  const payload = {
    kind: c.patch_kind,
    quote: c.quote,
    timestamp: c.timestamp,
    claim_text: c.claim_text,
    named_entities: c.named_entities ?? [],
  };
  const r = insert.run(
    VIDEO_ID,
    c.timestamp, c.timestamp,
    c.quote, c.claim_text, c.article_slug,
    c.is_new_article ? 1 : 0,
    c.is_about_kiriakou_himself ? 1 : 0,
    c.patch_kind,
    JSON.stringify(payload),
    JSON.stringify(c.named_entities ?? []),
  );
  if (r.changes > 0) added++; else skipped++;
}

if (!KEEP_TRIAGED) {
  db.prepare(`UPDATE clips SET status='catalogued', worker=NULL, worker_since=NULL WHERE video_id=?`)
    .run(VIDEO_ID);
}

const detail = `Imported ${added} new claims (${skipped} duplicate, ${rejected} malformed) for ${clip.slug ?? VIDEO_ID}.`;
logActivity({ worker: WORKER, role: ROLE, event: 'finish',
              detail, refKind: 'clip', refId: VIDEO_ID, handoffTo: 'reviewer' });
console.log(`[cataloger-mcp] ${detail}`);
