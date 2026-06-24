#!/usr/bin/env node
// Botnet CLI — manual operator hooks.
//
//   node botnet/cli.mjs seed <url>           Add a YouTube URL as a lead
//   node botnet/cli.mjs status                Show queue counts
//   node botnet/cli.mjs quarantine [N]        Show recent quarantine entries
//   node botnet/cli.mjs reset                 DANGER: wipe the DB
//   node botnet/cli.mjs forever [...flags]    Start the nonstop supervisor

import { execSync } from 'node:child_process';
import { unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, registerLead } from './lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(HERE, 'data', 'botnet.db');

const [cmd, ...args] = process.argv.slice(2);

function probe(url) {
  const out = execSync(
    `yt-dlp --print "%(id)s|%(title)s|%(upload_date)s|%(duration)s|%(uploader)s" "${url}"`,
    { encoding: 'utf8', timeout: 60_000 }
  ).trim();
  const [id, title, date, dur, channel] = out.split('|');
  return { videoId: id, title, uploadDate: date, durationSec: parseInt(dur) || null, channel };
}

switch (cmd) {
  case 'seed': {
    const url = args[0];
    if (!url) { console.error('usage: cli.mjs seed <url>'); process.exit(1); }
    const meta = probe(url);
    const isNew = registerLead({ ...meta, url });
    // Force to triaged_on so the operator-seeded clip skips NPP
    db.prepare(`UPDATE clips SET status='triaged_on', triage_reason='manual seed' WHERE video_id=?`)
      .run(meta.videoId);
    console.log(`[seed] ${isNew ? 'added' : 'updated'} ${meta.videoId} — "${meta.title}" (${meta.channel})`);
    break;
  }
  case 'status': {
    const rows = db.prepare(`SELECT status, COUNT(*) AS n FROM clips GROUP BY status`).all();
    console.log('clips:');
    for (const r of rows) console.log(`  ${r.status.padEnd(20)} ${r.n}`);
    const cs = db.prepare(`SELECT status, COUNT(*) AS n FROM claims GROUP BY status`).all();
    console.log('claims:');
    for (const r of cs) console.log(`  ${r.status.padEnd(20)} ${r.n}`);
    const q = db.prepare(`SELECT COUNT(*) AS n FROM quarantine`).get().n;
    console.log(`quarantine: ${q}`);
    const c = db.prepare(`SELECT * FROM cycles ORDER BY id DESC LIMIT 1`).get();
    if (c) console.log(`last cycle #${c.id}: ${c.status}, ${c.claims_merged} claims, sha=${c.commit_sha?.slice(0,7) || '-'}`);
    break;
  }
  case 'quarantine': {
    const n = parseInt(args[0]) || 20;
    const rows = db.prepare(`SELECT * FROM quarantine ORDER BY id DESC LIMIT ?`).all(n);
    for (const r of rows) {
      console.log(`#${r.id} [${r.kind}] ${r.reason_code} — ${r.reason_detail?.slice(0,120) ?? ''}`);
    }
    break;
  }
  case 'forever': {
    // Exec the supervisor in-process so Ctrl-C works as expected.
    const runner = join(HERE, 'run-forever.mjs');
    const { spawnSync } = await import('node:child_process');
    const result = spawnSync('node', [runner, ...args], { stdio: 'inherit' });
    process.exit(result.status ?? 0);
    break;
  }
  case 'reset': {
    if (existsSync(DB_PATH)) { unlinkSync(DB_PATH); console.log(`[reset] removed ${DB_PATH}`); }
    if (existsSync(DB_PATH + '-wal')) unlinkSync(DB_PATH + '-wal');
    if (existsSync(DB_PATH + '-shm')) unlinkSync(DB_PATH + '-shm');
    break;
  }
  default:
    console.log('commands: seed <url> | status | quarantine [N] | reset');
}
