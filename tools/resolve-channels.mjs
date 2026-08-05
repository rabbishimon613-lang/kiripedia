#!/usr/bin/env node
// Resolve the true publishing channel for every source, straight from YouTube.
//
// The `show:` field used to be typed by hand at ingest time, so it drifted:
// truncated at ~26 chars, five spellings of the same show, "?" when nobody
// knew. YouTube's oEmbed endpoint knows the real channel name for any public
// video, so that is the ground truth we cache here.
//
// Usage:
//   node tools/resolve-channels.mjs            # top up the cache (skips known)
//   node tools/resolve-channels.mjs --refresh  # re-fetch everything
//
// Output: tools/channel-map.json, keyed by source filename.
// Nothing in src/ is touched — run tools/show-aliases.mjs --fix to apply.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const DIR = 'src/content/sources';
const OUT = 'tools/channel-map.json';
const refresh = process.argv.includes('--refresh');
const cache = !refresh && existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};

const jobs = readdirSync(DIR)
  .filter(f => f.endsWith('.md') && !f.endsWith('.sponsors.md'))
  .map(f => {
    const head = readFileSync(`${DIR}/${f}`, 'utf8').slice(0, 1500);
    const get = k => (head.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1] || '')
      .trim().replace(/^["']|["']$/g, '');
    return { f, show: get('show'), url: get('url'), vid: get('videoId') };
  });

let done = 0, hit = 0, miss = 0;

async function worker(queue) {
  while (queue.length) {
    const j = queue.pop();
    done++;
    if (cache[j.f]?.channel) { hit++; continue; }
    // Podcast-feed sources (acast etc.) have no channel to look up.
    const u = j.vid ? `https://youtu.be/${j.vid}` : j.url;
    if (!u || !/youtu/.test(u)) { cache[j.f] = { channel: null, reason: 'not-youtube' }; miss++; continue; }
    try {
      const r = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json`,
        { signal: AbortSignal.timeout(20000) }
      );
      if (!r.ok) { cache[j.f] = { channel: null, reason: `http-${r.status}` }; miss++; continue; }
      const d = await r.json();
      cache[j.f] = { channel: d.author_name, channelUrl: d.author_url };
      hit++;
    } catch (e) {
      // Private, deleted, or rate-limited — the hand-typed show: name stands.
      cache[j.f] = { channel: null, reason: 'error:' + (e.name || e.message) };
      miss++;
    }
    if (done % 50 === 0) writeFileSync(OUT, JSON.stringify(cache, null, 1));
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: 12 }, () => worker(queue)));
writeFileSync(OUT, JSON.stringify(cache, null, 1));
console.log(`${done} sources — ${hit} resolved, ${miss} unresolved (kept as-is).`);
