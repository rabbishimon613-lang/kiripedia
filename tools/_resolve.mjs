#!/usr/bin/env node
// Resolve specific Kiriakou episodes to videoId + metadata.
// Input: JSON array of {hint, id?, query?}. For id → probe directly.
// For query → ytsearch3 and pick the longest Kiriakou-mentioning result.
// Output: TSV: status \t hint \t id \t durMin \t date \t uploader \t title
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

const known = new Set();
for (const f of readdirSync('src/content/sources').filter(x => x.endsWith('.md'))) {
  const m = readFileSync(`src/content/sources/${f}`, 'utf8').match(/^videoId:\s*['"]?([^'"\n]+)/m);
  if (m) known.add(m[1].trim());
}

const items = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const YT = '--extractor-args "youtube:player_client=android_vr" --no-warnings --sleep-requests 1';
const PRINT = '--print "%(id)s|%(title)s|%(duration)s|%(uploader)s|%(upload_date)s"';

function probe(spec) {
  const cmd = `yt-dlp ${YT} ${PRINT} --skip-download "${spec}" 2>/dev/null`;
  try { return execSync(cmd, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim().split('\n').filter(Boolean); }
  catch { return []; }
}

for (const it of items) {
  let lines = [];
  if (it.id) lines = probe(`https://www.youtube.com/watch?v=${it.id}`);
  else if (it.query) lines = probe(`ytsearch4:${it.query}`);
  // choose best: title mentions kiriakou, longest duration
  let best = null;
  for (const ln of lines) {
    const [id, title, dur, up, date] = ln.split('|');
    if (!id) continue;
    const d = parseInt(dur) || 0;
    const kir = /kiriakou|kiryaku|kiraku/i.test(title || '');
    const score = (kir ? 1e7 : 0) + d;
    if (!best || score > best.score) best = { id, title, d, up, date, kir, score };
  }
  if (!best) { console.log(`NORESULT\t${it.hint}\t-\t-\t-\t-\t-`); continue; }
  const status = known.has(best.id) ? 'KNOWN' : (best.d < 1500 ? 'SHORT' : 'NEW');
  const dm = (best.d / 60).toFixed(0);
  const dt = (best.date && best.date.length === 8) ? `${best.date.slice(0,4)}-${best.date.slice(4,6)}-${best.date.slice(6,8)}` : (best.date||'-');
  console.log(`${status}\t${it.hint}\t${best.id}\t${dm}m\t${dt}\t${best.up}\t${(best.title||'').slice(0,70)}`);
}
