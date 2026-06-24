#!/usr/bin/env node
// fingerprint-recording.mjs — Compute an audio chromaprint fingerprint for a
// single recording and (optionally) compare against the existing fingerprint
// database to detect duplicate uploads.
//
// Dependency: fpcalc (the Chromaprint command-line tool)
//   macOS:  brew install chromaprint
//   Debian: apt install libchromaprint-tools
//   The binary must be on PATH.
//
// Usage:
//   node tools/fingerprint-recording.mjs <audio-or-video-file>
//   node tools/fingerprint-recording.mjs <audio-or-video-file> --compare
//   node tools/fingerprint-recording.mjs --check-deps
//
// Flags:
//   --compare     After computing fingerprint, compare against
//                 data/fingerprints.json and report near-duplicates.
//   --register    Also write the fingerprint into data/fingerprints.json
//                 (keyed by videoId derived from filename if possible).
//   --check-deps  Only check whether fpcalc is installed and exit.
//   --duration N  Seconds of audio to fingerprint (default 120; fpcalc cap).
//
// Output (stdout): JSON with fields:
//   { videoId, file, duration, fingerprint, matches: [...] }
//
// Dedup thresholds (from YT-ACQUISITION.md + Chromaprint research):
//   Hamming distance ≤ 10%   → same recording (exact duplicate, different upload)
//   Hamming distance 10–30%  → likely same, flag for human review
//   Hamming distance > 30%   → different content
//
// The fingerprint field is the raw fpcalc integer array. For Hamming distance
// we compare bit-by-bit across the packed int32 array using popcount.

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const DB_PATH = join(REPO, 'data', 'fingerprints.json');

const HAMMING_SAME = 0.10;       // ≤10% bit error → same recording
const HAMMING_SUSPECT = 0.30;    // 10–30% → suspect, review

const args = process.argv.slice(2);
const CHECK_DEPS = args.includes('--check-deps');
const COMPARE = args.includes('--compare');
const REGISTER = args.includes('--register');
const durationIdx = args.indexOf('--duration');
const DURATION = durationIdx >= 0 ? parseInt(args[durationIdx + 1]) : 120;
const inputFile = args.filter(a => !a.startsWith('--') && a !== String(DURATION))[0];

// --- Dependency check --------------------------------------------------------
function checkFpcalc() {
  const r = spawnSync('fpcalc', ['-version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    return { ok: false, version: null };
  }
  return { ok: true, version: r.stdout.trim() };
}

if (CHECK_DEPS) {
  const { ok, version } = checkFpcalc();
  if (ok) {
    console.log(`fpcalc OK: ${version}`);
    process.exit(0);
  } else {
    console.error('fpcalc NOT FOUND. Install with:');
    console.error('  macOS:  brew install chromaprint');
    console.error('  Debian: apt install libchromaprint-tools');
    process.exit(1);
  }
}

if (!inputFile) {
  console.error('Usage: node tools/fingerprint-recording.mjs <file> [--compare] [--register]');
  process.exit(1);
}

if (!existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

// --- Verify fpcalc is installed ----------------------------------------------
const dep = checkFpcalc();
if (!dep.ok) {
  console.error('ERROR: fpcalc is not installed or not on PATH.');
  console.error('Install with: brew install chromaprint   (macOS)');
  console.error('          or: apt install libchromaprint-tools  (Debian/Ubuntu)');
  process.exit(1);
}

// --- Run fpcalc --------------------------------------------------------------
// fpcalc -raw -length <N> <file> → outputs:
//   DURATION=<seconds>
//   FINGERPRINT=<comma-separated int32s>
let fpcalcOutput;
try {
  fpcalcOutput = execSync(
    `fpcalc -raw -length ${DURATION} "${inputFile}"`,
    { encoding: 'utf8', timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }
  );
} catch (err) {
  console.error(`fpcalc failed: ${err.message}`);
  process.exit(1);
}

const durationMatch = fpcalcOutput.match(/^DURATION=(\d+(?:\.\d+)?)/m);
const fpMatch = fpcalcOutput.match(/^FINGERPRINT=(.+)$/m);

if (!durationMatch || !fpMatch) {
  console.error('Could not parse fpcalc output.');
  console.error(fpcalcOutput);
  process.exit(1);
}

const audioDuration = parseFloat(durationMatch[1]);
const fingerprintInts = fpMatch[1].split(',').map(Number);

// --- Derive videoId from filename -------------------------------------------
// Canonical: YYYYMMDD-<videoId>.en[-orig].vtt or just <videoId>.mp4 etc.
// Try standard YouTube ID pattern (11 chars, alphanumeric + _-).
const fileBase = basename(inputFile);
const vidMatch = fileBase.match(/[A-Za-z0-9_-]{11}/g);
const videoId = vidMatch ? vidMatch[vidMatch.length - 1] : fileBase.replace(/\.[^.]+$/, '');

// --- Hamming distance --------------------------------------------------------
function hammingDistance(a, b) {
  const len = Math.min(a.length, b.length);
  let bits = 0;
  let totalBits = len * 32;
  for (let i = 0; i < len; i++) {
    let x = (a[i] ^ b[i]) >>> 0;
    // popcount
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    x = (x + (x >>> 4)) & 0x0f0f0f0f;
    bits += (x * 0x01010101) >>> 24;
  }
  return totalBits > 0 ? bits / totalBits : 1;
}

// --- Compare against database -----------------------------------------------
let matches = [];
let db = {};

if (COMPARE || REGISTER) {
  if (existsSync(DB_PATH)) {
    db = JSON.parse(readFileSync(DB_PATH, 'utf8'));
  }

  if (COMPARE) {
    for (const [dbVideoId, entry] of Object.entries(db)) {
      if (dbVideoId === videoId) continue;
      const dist = hammingDistance(fingerprintInts, entry.fingerprint);
      if (dist <= HAMMING_SUSPECT) {
        matches.push({
          videoId: dbVideoId,
          slug: entry.slug || null,
          hammingDistance: dist,
          verdict: dist <= HAMMING_SAME ? 'DUPLICATE' : 'SUSPECT',
        });
      }
    }
    matches.sort((a, b) => a.hammingDistance - b.hammingDistance);
  }
}

// --- Register ---------------------------------------------------------------
if (REGISTER) {
  mkdirSync(join(REPO, 'data'), { recursive: true });
  db[videoId] = {
    videoId,
    file: inputFile,
    audioDuration,
    fingerprint: fingerprintInts,
    registeredAt: new Date().toISOString(),
  };
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.error(`Registered fingerprint for ${videoId} in data/fingerprints.json`);
}

// --- Output -----------------------------------------------------------------
const result = {
  videoId,
  file: inputFile,
  audioDuration,
  fingerprintLength: fingerprintInts.length,
  // Full fingerprint stored separately; just show first 8 ints in summary
  fingerprintPreview: fingerprintInts.slice(0, 8),
  fingerprint: fingerprintInts,
  matches,
};

console.log(JSON.stringify(result, null, 2));

if (matches.length > 0) {
  console.error(`\nDuplicate detection results for ${videoId}:`);
  for (const m of matches) {
    const pct = (m.hammingDistance * 100).toFixed(1);
    console.error(`  [${m.verdict}] ${m.videoId} — ${pct}% bit error`);
  }
} else if (COMPARE) {
  console.error(`No duplicates found for ${videoId} (compared against ${Object.keys(db).length} fingerprints).`);
}
