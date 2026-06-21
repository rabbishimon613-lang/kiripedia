// Minimum grounding stack (3 layers). The other 9 layers are written
// later against real rejected output. Each layer returns:
//   { pass: boolean, code?: string, detail?: string }

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..');

// --- Layer 1: VTT verbatim grep -------------------------------------------
// The claim's quote MUST appear verbatim in the source transcript.
// Normalize whitespace before comparison; everything else strict.
export function layer_verbatim({ claim, sourceText }) {
  const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  if (norm(sourceText).includes(norm(claim.quote))) {
    return { pass: true };
  }
  return {
    pass: false,
    code: 'verbatim_miss',
    detail: `Quote "${claim.quote.slice(0, 80)}..." not found verbatim in ${claim.video_id}`,
  };
}

// --- Layer 5: Citation roundtrip -------------------------------------------
// The MDX patch payload must contain a <Cite t="..." /> tag whose timestamp
// roughly matches the claim's segment range. We trust the scaffolder to
// inject s= from _defaults; here we just verify t= is present.
export function layer_cite_roundtrip({ claim }) {
  const payload = typeof claim.patch_payload === 'string'
    ? JSON.parse(claim.patch_payload)
    : claim.patch_payload;
  if (!payload?.timestamp) {
    return { pass: false, code: 'cite_missing', detail: 'no timestamp on claim payload' };
  }
  // Sanity: timestamp must parse as h:mm or h:mm:ss
  if (!/^\d{1,2}:\d{2}(?::\d{2})?$/.test(payload.timestamp)) {
    return { pass: false, code: 'cite_malformed', detail: `bad timestamp: ${payload.timestamp}` };
  }
  return { pass: true };
}

// --- Layer 9: Channel provenance -------------------------------------------
// The clip's channel must be on the trusted list in grounds.json.
// (NPP enforces this earlier, but defense in depth.)
let _trustedCache = null;
function getTrusted() {
  if (_trustedCache) return _trustedCache;
  const grounds = JSON.parse(readFileSync(join(REPO_ROOT, 'fleet', 'config', 'grounds.json'), 'utf8'));
  _trustedCache = new Set(grounds.youtube.trusted_channels.map(c => c.toLowerCase()));
  return _trustedCache;
}
export function layer_channel({ clip }) {
  const trusted = getTrusted();
  if (!clip.channel) return { pass: false, code: 'channel_missing' };
  if (trusted.has(clip.channel.toLowerCase())) return { pass: true };
  return {
    pass: false,
    code: 'channel_untrusted',
    detail: `channel "${clip.channel}" not in grounds.json`,
  };
}

// --- Bio gate: doctrine non-negotiable -------------------------------------
// Biographical claims about Kiriakou himself always quarantine for now.
export function gate_bio({ claim }) {
  if (claim.is_about_kiriakou_himself) {
    return { pass: false, code: 'bio_gate', detail: 'biographical claim about Kiriakou' };
  }
  return { pass: true };
}

// --- Voice contamination: no "according to Kiriakou" in claim_text --------
const VOICE_BAN_RE = /\b(according to (john )?kiriakou|kiriakou s(ai|ay)d|kiriakou (states|claims|notes|explains))\b/i;
export function layer_voice({ claim }) {
  if (VOICE_BAN_RE.test(claim.claim_text)) {
    return { pass: false, code: 'voice_contamination',
             detail: `attribution found in: "${claim.claim_text.slice(0, 80)}..."` };
  }
  return { pass: true };
}

// --- Confidence scoring ----------------------------------------------------
// Run all layers; produce 0-100. Each pass adds a fixed weight.
const LAYERS = [
  { name: 'verbatim', fn: layer_verbatim, weight: 50, fatal: true },
  { name: 'cite_roundtrip', fn: layer_cite_roundtrip, weight: 20, fatal: true },
  { name: 'channel', fn: layer_channel, weight: 10, fatal: false },
  { name: 'voice', fn: layer_voice, weight: 10, fatal: false },
  { name: 'bio_gate', fn: gate_bio, weight: 10, fatal: true },
];

export function runGrounding({ claim, clip, sourceText }) {
  const results = {};
  let confidence = 0;
  let fatalFail = null;
  const reasons = [];

  for (const layer of LAYERS) {
    const r = layer.fn({ claim, clip, sourceText });
    results[layer.name] = r;
    if (r.pass) {
      confidence += layer.weight;
    } else {
      reasons.push(`${layer.name}: ${r.detail ?? r.code}`);
      if (layer.fatal && !fatalFail) fatalFail = r.code;
    }
  }

  return { confidence, fatalFail, results, reasons };
}
