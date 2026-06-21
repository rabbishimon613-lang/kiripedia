#!/usr/bin/env node
// Scribe. Pulls auto-captions for triaged_on clips and normalizes them.
// No LLM. Uses existing tools/normalize-vtt.mjs.
//
// Run: node botnet/workers/scribe.mjs [--worker scribe-1] [--batch N]

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, claimNextClip, releaseClip, logActivity, quarantine } from '../lib/db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const RAW_DIR = join(REPO_ROOT, 'sources', 'raw');
const SOURCES_DIR = join(REPO_ROOT, 'src', 'content', 'sources');
const NORMALIZER = join(REPO_ROOT, 'tools', 'normalize-vtt.mjs');
const SHOW_ALIASES = join(REPO_ROOT, 'tools', 'show-aliases.mjs');

const args = process.argv.slice(2);
const WORKER = args[args.indexOf('--worker') + 1] || 'scribe-1';
const ROLE = 'scribe';
const BATCH = parseInt(args[args.indexOf('--batch') + 1]) || 3;

mkdirSync(RAW_DIR, { recursive: true });

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function makeSlug(clip) {
  const date = clip.upload_date
    ? `${clip.upload_date.slice(0, 4)}-${clip.upload_date.slice(4, 6)}-${clip.upload_date.slice(6, 8)}`
    : new Date().toISOString().slice(0, 10);
  const show = slugify(clip.channel || 'unknown');
  const title = slugify(clip.title || clip.video_id);
  return `${date}-${show}-${title}`.slice(0, 80);
}

async function scribeOne(clip) {
  logActivity({ worker: WORKER, role: ROLE, event: 'start',
                detail: `Pulling ${clip.video_id}`, refKind: 'clip', refId: clip.video_id });

  const ymd = clip.upload_date || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rawStem = `${ymd}-${clip.video_id}`;
  const rawVtt = join(RAW_DIR, `${rawStem}.en.vtt`);
  const rawOrig = join(RAW_DIR, `${rawStem}.en-orig.vtt`);

  // 1. yt-dlp probe (gets accurate metadata for slug + duration)
  let meta;
  try {
    const probe = execSync(
      `yt-dlp --print "%(id)s|%(title)s|%(upload_date)s|%(duration)s|%(uploader)s" "${clip.url}"`,
      { encoding: 'utf8', timeout: 60_000 }
    ).trim();
    const [id, title, date, dur, uploader] = probe.split('|');
    meta = { id, title, upload_date: date, duration_sec: parseInt(dur) || null, uploader };
  } catch (err) {
    quarantine({ kind: 'clip', videoId: clip.video_id, reasonCode: 'yt-dlp-probe-fail',
                 reasonDetail: err.message.slice(0, 300) });
    releaseClip(clip.video_id, { newStatus: 'quarantined' });
    return false;
  }

  // Update clip with real metadata
  db.prepare(`UPDATE clips SET title=?, upload_date=?, channel=?, duration_sec=? WHERE video_id=?`)
    .run(meta.title, meta.upload_date, meta.uploader, meta.duration_sec, clip.video_id);
  clip.title = meta.title; clip.upload_date = meta.upload_date;
  clip.channel = meta.uploader; clip.duration_sec = meta.duration_sec;

  // 2. yt-dlp pull captions
  if (!existsSync(rawVtt) && !existsSync(rawOrig)) {
    try {
      execSync(
        `yt-dlp --write-auto-sub --sub-lang en --skip-download --output "${join(RAW_DIR, rawStem)}.%(ext)s" "${clip.url}"`,
        { encoding: 'utf8', timeout: 180_000 }
      );
    } catch (err) {
      quarantine({ kind: 'clip', videoId: clip.video_id, reasonCode: 'yt-dlp-caption-fail',
                   reasonDetail: err.message.slice(0, 300) });
      releaseClip(clip.video_id, { newStatus: 'quarantined' });
      return false;
    }
  }
  const vttPath = existsSync(rawVtt) ? rawVtt : (existsSync(rawOrig) ? rawOrig : null);
  if (!vttPath) {
    quarantine({ kind: 'clip', videoId: clip.video_id, reasonCode: 'no-captions' });
    releaseClip(clip.video_id, { newStatus: 'quarantined' });
    return false;
  }

  // 3. Normalize VTT to source markdown
  const slug = makeSlug(clip);
  const sourcePath = join(SOURCES_DIR, `${slug}.md`);
  if (!existsSync(sourcePath)) {
    try {
      execSync(`node ${NORMALIZER} "${vttPath}" "${sourcePath}"`,
               { encoding: 'utf8', timeout: 60_000 });
    } catch (err) {
      quarantine({ kind: 'clip', videoId: clip.video_id, reasonCode: 'normalize-fail',
                   reasonDetail: err.message.slice(0, 300) });
      releaseClip(clip.video_id, { newStatus: 'quarantined' });
      return false;
    }

    // Fix frontmatter: normalize-vtt leaves placeholders. Inject real metadata.
    let md = readFileSync(sourcePath, 'utf8');
    const fmReplace = (key, val) => {
      const re = new RegExp(`^${key}:.*$`, 'm');
      const line = `${key}: ${typeof val === 'string' && /[:'"]/.test(val) ? JSON.stringify(val) : val}`;
      md = re.test(md) ? md.replace(re, line) : md.replace(/^---\n/, `---\n${line}\n`);
    };
    fmReplace('slug', slug);
    fmReplace('title', clip.title);
    fmReplace('show', clip.channel);
    fmReplace('date', `${clip.upload_date.slice(0,4)}-${clip.upload_date.slice(4,6)}-${clip.upload_date.slice(6,8)}`);
    fmReplace('url', clip.url);
    fmReplace('videoId', clip.video_id);
    fmReplace('duration', clip.duration_sec);
    writeFileSync(sourcePath, md);

    // Canonicalize show name
    try { execSync(`node ${SHOW_ALIASES} --fix`, { cwd: REPO_ROOT, encoding: 'utf8' }); }
    catch (err) { /* non-fatal */ }
  }

  db.prepare(`UPDATE clips SET status='transcribed', slug=?, source_path=?, worker=NULL, worker_since=NULL WHERE video_id=?`)
    .run(slug, sourcePath.replace(REPO_ROOT + '/', ''), clip.video_id);

  logActivity({ worker: WORKER, role: ROLE, event: 'finish',
                detail: `Transcribed ${slug}`, refKind: 'clip', refId: clip.video_id,
                handoffTo: 'cataloger' });
  return true;
}

let ok = 0, fail = 0;
for (let i = 0; i < BATCH; i++) {
  const clip = claimNextClip({ status: 'triaged_on', worker: WORKER });
  if (!clip) break;
  const result = await scribeOne(clip);
  if (result) ok++; else fail++;
}
console.log(`[${WORKER}] transcribed=${ok} failed=${fail}`);
