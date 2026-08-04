#!/usr/bin/env node
// Recover real transcript content that the ad-stripper wrongly swept into a `.sponsors.md`
// sidecar, and merge it back into the canon source.
//
// Why this is needed: normalize-vtt.mjs enters "sponsor mode" on an ad cue and stays there
// until it sees an END cue OR 12 paragraphs elapse. On shows whose return cue it doesn't
// recognise — Dead Drop says "Now back to Dead Drop" mid-paragraph, which no END pattern
// matches — it runs the full 12-paragraph fuse every single time and eats the interview
// either side of each ad break. On Dead Drop S2E11 that buried 52 paragraphs, including
// Kiriakou's account of being told he will never be pardoned.
//
// The fix here is deliberately asymmetric. An ad is recognised by an explicit advertiser
// name or a naked call to action; ANYTHING ELSE is treated as transcript and goes back into
// the canon file. Over-recovering a stray ad line is a cosmetic problem. Leaving real
// testimony out of the corpus is a correctness problem, because uncited material is
// invisible to every article writer downstream.
//
// Usage:
//   node tools/unstrip-sponsors.mjs <source-slug|glob> [--dry-run]
//   node tools/unstrip-sponsors.mjs --all [--dry-run]

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const SRCDIR = 'src/content/sources';
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const targets = args.filter((a) => !a.startsWith('--'));
const ALL = args.includes('--all');

// Known advertisers + cross-promos actually seen in this corpus, plus generic CTA shapes.
// Matching ANY of these marks a paragraph as a genuine ad read.
const AD = [
  /\b(wayfair|maintainx|serval|servel|betterhelp|quince|helix|manscaped|aura|liquid iv|athletic greens|ag1|hims|hers|magic mind|cash app|stamps\.com|squarespace|shopify|surfshark|nordvpn|expressvpn|zocdoc|factor meals|hellofresh|rocket money|policygenius|shopify)\b/i,
  /\b(optimum|optimal fibers)\b.*\b(month|online|details)\b/i,
  /\bquo\b.*\b(business phone|G2|Q-U-O)\b/i,
  /\b(paramount\+|lioness)\b/i,
  /\bperimenopause\b|\bmidi\b.*\bhormones?\b/i,
  /costard\s*(and|&)\s*touchstone\.com/i,
  /just the photographer|david swanson/i,
  /\b(a dna horror story|the hall closet|sage wellness within|how not to make a movie)\b/i,
  /use (code|promo code|the code) [\w'-]+/i,
  /\b(go to|head to|visit|sign up at|try it free at|shop)\s+[\w.-]*\.com/i,
  /\b\d{3}[-. ]\d{3}[-. ]\d{4}\b/,                       // read-aloud phone numbers
  /(discount|off your first|free trial|free shipping|% off)/i,
  /this episode is (brought to you by|sponsored by)/i,
];

// Deliberately NOT an ad marker: "now back to Dead Drop". It is the return cue, so the
// paragraph carrying it is half ad and half the first sentences of the resumed episode —
// exactly the content worth recovering. Treating it as an ad cost the paragraph in which
// Kiriakou reports that his bunkmate survived the heart attack.

const isAd = (t) => AD.some((rx) => rx.test(t));

function paraSplit(body) {
  return body.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
}
const stamp = (p) => {
  const m = p.match(/^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return m[3] ? +m[1] * 3600 + +m[2] * 60 + +m[3] : +m[1] * 60 + +m[2];
};

let slugs;
if (ALL) {
  slugs = readdirSync(SRCDIR)
    .filter((f) => f.endsWith('.sponsors.md'))
    .map((f) => f.replace('.sponsors.md', ''));
} else {
  slugs = targets.map((t) => t.replace(/\.md$/, '').replace(/\.sponsors$/, ''));
}

let totalBack = 0, totalKept = 0, filesTouched = 0;

for (const slug of slugs) {
  const mainPath = `${SRCDIR}/${slug}.md`;
  const sidePath = `${SRCDIR}/${slug}.sponsors.md`;
  if (!existsSync(mainPath) || !existsSync(sidePath)) {
    console.warn(`  skip ${slug}: missing main or sidecar`);
    continue;
  }

  const mainRaw = readFileSync(mainPath, 'utf8');
  const fm = mainRaw.match(/^---\n[\s\S]*?\n---\n/);
  if (!fm) { console.warn(`  skip ${slug}: no frontmatter`); continue; }
  const mainBody = mainRaw.slice(fm[0].length);

  const sideRaw = readFileSync(sidePath, 'utf8');
  const sideParas = paraSplit(sideRaw.replace(/^#[^\n]*\n/, '')).filter((p) => p.startsWith('['));

  const recovered = sideParas.filter((p) => !isAd(p));
  const stillAds = sideParas.filter((p) => isAd(p));
  if (!recovered.length) { console.log(`  ${slug}: nothing to recover`); continue; }

  // Merge and re-sort by timestamp so the transcript reads in order again.
  const merged = [...paraSplit(mainBody), ...recovered]
    .sort((a, b) => stamp(a) - stamp(b));
  // Dedup: the same paragraph can appear in both files when an ad run was re-read.
  const seen = new Set();
  const out = merged.filter((p) => {
    const k = p.slice(0, 120);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  let newFm = fm[0]
    .replace(/^paragraphs: \d+$/m, `paragraphs: ${out.length}`)
    .replace(/^sponsor_paragraphs_stripped: \d+$/m, `sponsor_paragraphs_stripped: ${stillAds.length}`);

  console.log(`  ${slug}: +${recovered.length} recovered, ${stillAds.length} stay ads`);
  totalBack += recovered.length;
  totalKept += stillAds.length;
  filesTouched++;

  if (DRY) continue;
  writeFileSync(mainPath, newFm + out.join('\n\n') + '\n');
  writeFileSync(sidePath,
    '# Stripped sponsor / ad reads\n\n' + stillAds.join('\n\n') + (stillAds.length ? '\n' : ''));
}

console.log(`\n${filesTouched} file(s): ${totalBack} paragraphs returned to canon, ${totalKept} confirmed ads.`);
if (DRY) console.log('(dry run — nothing written)');
