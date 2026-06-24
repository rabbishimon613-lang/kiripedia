#!/usr/bin/env node
// audit-provenance.mjs — Raw VTT ↔ normalized source parity check.
//
// For every normalized source (src/content/sources/*.md) that has a videoId
// frontmatter field, verify that a corresponding raw VTT exists in
// sources/raw/ using the canonical naming pattern:
//
//   YYYYMMDD-<videoId>.en.vtt   or   YYYYMMDD-<videoId>.en-orig.vtt
//
// Reports:
//   BACKED    — normalized source has an immutable raw VTT (good)
//   MISSING   — no raw VTT found; provenance unverifiable (bad)
//   CODEX     — raw found in 'codex articles/' staging dir, not sources/raw/
//   NO-VID    — source has no videoId field at all (phone-paste / manual)
//   RAW-ONLY  — raw VTT exists but has never been normalized (informational)
//
// Usage: node tools/audit-provenance.mjs [--json] [--missing-only]
//
// Flags:
//   --json          Emit JSON instead of human-readable table
//   --missing-only  Only print MISSING and CODEX entries

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const SOURCES_DIR = join(REPO, 'src', 'content', 'sources');
const RAW_DIR = join(REPO, 'sources', 'raw');
const CODEX_DIR = join(REPO, 'codex articles');

const args = process.argv.slice(2);
const JSON_MODE = args.includes('--json');
const MISSING_ONLY = args.includes('--missing-only');

// --- Build set of raw VTT video IDs -----------------------------------------
// Canonical filename: YYYYMMDD-<videoId>.en[-orig].vtt
// videoId can contain letters, digits, underscores, hyphens

const rawFiles = readdirSync(RAW_DIR).filter(f => f.endsWith('.vtt'));
const rawIds = new Set();
const rawIdToFile = {};
for (const f of rawFiles) {
  // Strip leading date + hyphen, then strip .en[...].vtt suffix
  const withoutDate = f.replace(/^\d{8}-/, '');
  const videoId = withoutDate.replace(/\.en(-orig)?\.vtt$/, '');
  rawIds.add(videoId);
  rawIdToFile[videoId] = f;
}

// --- Build set of codex-staged VTT videoIds ----------------------------------
// Format: codex articles/<YYYYMMDD-slug-videoId>/captions.en.vtt
// videoId is the last segment of the directory name after the last hyphen
// but note it can have internal hyphens so we match it from the norm sources.
const codexVtts = new Set();
try {
  const codexDirs = readdirSync(CODEX_DIR);
  for (const d of codexDirs) {
    // Directory names embed the videoId at the end after the last hyphen-sequence
    // but videoIds are 11 chars. Extract last 11-char token.
    const parts = d.split('-');
    // Join all parts after the date prefix (first three parts YYYY-MM-DD)
    // and check the last token that is exactly 11 chars (standard YouTube ID length).
    for (let i = parts.length - 1; i >= 3; i--) {
      if (/^[A-Za-z0-9_-]{11}$/.test(parts[i])) {
        codexVtts.add(parts[i]);
        break;
      }
    }
  }
} catch {
  // No codex articles dir
}

// --- Parse normalized source files ------------------------------------------
const sourceFiles = readdirSync(SOURCES_DIR)
  .filter(f => f.endsWith('.md') && !f.endsWith('.sponsors.md'));

const results = [];

for (const f of sourceFiles) {
  const fullPath = join(SOURCES_DIR, f);
  const content = readFileSync(fullPath, 'utf8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const fm = fmMatch ? fmMatch[1] : '';

  const videoIdMatch = fm.match(/^videoId:\s*"?([A-Za-z0-9_-]+)"?/m);
  const sourceFileMatch = fm.match(/^source_file:\s*(.+)$/m);

  if (!videoIdMatch) {
    results.push({
      status: 'NO-VID',
      slug: f.replace('.md', ''),
      videoId: null,
      rawFile: null,
      sourceFile: sourceFileMatch ? sourceFileMatch[1].trim() : null,
    });
    continue;
  }

  const videoId = videoIdMatch[1];
  if (rawIds.has(videoId)) {
    results.push({
      status: 'BACKED',
      slug: f.replace('.md', ''),
      videoId,
      rawFile: rawIdToFile[videoId],
      sourceFile: sourceFileMatch ? sourceFileMatch[1].trim() : null,
    });
  } else if (codexVtts.has(videoId)) {
    results.push({
      status: 'CODEX',
      slug: f.replace('.md', ''),
      videoId,
      rawFile: null,
      note: `Raw VTT is in "codex articles/" staging dir — needs moving to sources/raw/`,
      sourceFile: sourceFileMatch ? sourceFileMatch[1].trim() : null,
    });
  } else {
    results.push({
      status: 'MISSING',
      slug: f.replace('.md', ''),
      videoId,
      rawFile: null,
      sourceFile: sourceFileMatch ? sourceFileMatch[1].trim() : null,
    });
  }
}

// --- Check for raw-only (raw VTT with no normalized source) ------------------
const normalizedIds = new Set(results.filter(r => r.videoId).map(r => r.videoId));
const rawOnlyIds = [...rawIds].filter(id => !normalizedIds.has(id));
for (const videoId of rawOnlyIds) {
  results.push({
    status: 'RAW-ONLY',
    slug: null,
    videoId,
    rawFile: rawIdToFile[videoId],
    sourceFile: null,
  });
}

// --- Emit results ------------------------------------------------------------
const filtered = MISSING_ONLY
  ? results.filter(r => r.status === 'MISSING' || r.status === 'CODEX')
  : results;

if (JSON_MODE) {
  console.log(JSON.stringify(filtered, null, 2));
} else {
  const STATUS_ORDER = ['MISSING', 'CODEX', 'RAW-ONLY', 'NO-VID', 'BACKED'];
  const sorted = [...filtered].sort((a, b) =>
    STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  const COL = { MISSING: '\x1b[31m', CODEX: '\x1b[33m', BACKED: '\x1b[32m', 'NO-VID': '\x1b[90m', 'RAW-ONLY': '\x1b[36m' };
  const RESET = '\x1b[0m';

  console.log('\nKiriPedia Provenance Audit');
  console.log('==========================\n');
  console.log('STATUS     VIDEOID        SLUG');
  console.log('------     -------        ----');
  for (const r of sorted) {
    const color = COL[r.status] || '';
    const id = r.videoId ? r.videoId.padEnd(14) : '(none)        ';
    const slug = r.slug || '(raw only)';
    console.log(`${color}${r.status.padEnd(10)}${RESET} ${id} ${slug}`);
    if (r.note) console.log(`           ^ ${r.note}`);
  }

  // Summary
  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  console.log('\nSummary:');
  for (const [status, n] of Object.entries(counts).sort()) {
    console.log(`  ${status.padEnd(10)} ${n}`);
  }
  const total = results.filter(r => r.status !== 'RAW-ONLY').length;
  const backed = counts['BACKED'] || 0;
  const pct = total > 0 ? ((backed / total) * 100).toFixed(1) : '0.0';
  console.log(`\nProvenance coverage: ${backed}/${total} normalized sources backed by raw VTT (${pct}%)`);
  if (counts['MISSING'] > 0) {
    console.log(`\nACTION NEEDED: ${counts['MISSING']} source(s) have no raw VTT on disk.`);
    console.log('Re-download with:');
    const missing = results.filter(r => r.status === 'MISSING');
    for (const r of missing.slice(0, 5)) {
      console.log(`  yt-dlp --write-auto-sub --sub-lang en-orig --skip-download \\`);
      console.log(`    --output "sources/raw/%( upload_date)s-%(id)s.%(ext)s" \\`);
      console.log(`    "https://www.youtube.com/watch?v=${r.videoId}"`);
    }
    if (missing.length > 5) console.log(`  ... and ${missing.length - 5} more`);
  }
  if (counts['CODEX'] > 0) {
    console.log(`\nACTION NEEDED: ${counts['CODEX']} VTT(s) stranded in "codex articles/" — move to sources/raw/.`);
  }
}
