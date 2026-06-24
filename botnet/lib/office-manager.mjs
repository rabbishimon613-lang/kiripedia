// office-manager: runtime broker for LLM provider/model selection.
//
// Owns the messy stuff so workers don't have to:
//   - source keys from llm-fleet/.env at module load (no shell env needed)
//   - capability table: which provider×model supports json_schema, ctx limits
//   - per-role best-pick with fallback chain
//   - schema rewriting: Groq strict mode demands additionalProperties:false
//     + required:[<all keys>] on every object node. We add them defensively.
//   - per-key health: 3 401/403 in a row = dead for the day
//   - per-model health: 1 confirmed 400 (unsupported feature) = unsupported
//   - daily ledger at botnet/data/office-ledger.jsonl; soft cap from
//     fleet/config/budget.json
//   - state cached on disk (botnet/data/office-state.json) ~30 min
//   - routing log at fleet/ledger/office.log
//
// Exports: worker_reasoning, worker_longcontext, worker_fast — same signature
// as fleet-client. Plus probeAll() for the worker.

import {
  existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const BOTNET_ROOT = join(HERE, '..');
const DATA_DIR = join(BOTNET_ROOT, 'data');
const STATE_PATH = join(DATA_DIR, 'office-state.json');
const LEDGER_PATH = join(DATA_DIR, 'office-ledger.jsonl');
const LOG_DIR = join(REPO_ROOT, 'fleet', 'ledger');
const LOG_PATH = join(LOG_DIR, 'office.log');
const BUDGET_PATH = join(REPO_ROOT, 'fleet', 'config', 'budget.json');
// llm-fleet lives as a sibling of KiriPedia under /Volumes/EOS_DIGITAL
const FLEET_ENV_PATH = join(REPO_ROOT, '..', 'llm-fleet', '.env');

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(LOG_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Source keys from llm-fleet/.env if not in process.env yet
// ---------------------------------------------------------------------------
function loadEnvFile() {
  if (!existsSync(FLEET_ENV_PATH)) return;
  try {
    const text = readFileSync(FLEET_ENV_PATH, 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (process.env[k]) continue;
      const v = vRaw.replace(/^["']|["']$/g, '');
      process.env[k] = v;
    }
  } catch {}
}
loadEnvFile();

const GROQ_KEYS = (process.env.GROQ_API_KEYS || process.env.GROQ_KEYS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const CEREBRAS_KEYS = (process.env.CEREBRAS_API_KEYS || process.env.CEREBRAS_KEYS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

// ---------------------------------------------------------------------------
// Capability table — edit this freely as the provider landscape shifts.
// strict_json_schema: model accepts response_format=json_schema
// requires_additional_properties_false: schema must set it on every object
// ---------------------------------------------------------------------------
const PROVIDERS = [
  // ---- Groq (working) ----
  {
    id: 'groq:gpt-oss-120b',
    provider: 'groq',
    model: 'openai/gpt-oss-120b',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    ctx: 131000,
    json_schema: true,
    requires_strict_schema: true,
    roles: { reasoning: 1, longcontext: 2, fast: 3 },
  },
  {
    id: 'groq:gpt-oss-20b',
    provider: 'groq',
    model: 'openai/gpt-oss-20b',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    ctx: 131000,
    json_schema: true,
    requires_strict_schema: true,
    roles: { reasoning: 4, longcontext: 4, fast: 1 },
  },
  {
    id: 'groq:llama-4-scout',
    provider: 'groq',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    ctx: 131000,
    json_schema: true,
    requires_strict_schema: true,
    // Scout is solid for long context + structured; lower number = higher priority
    roles: { reasoning: 5, longcontext: 1, fast: 4 },
  },
  // ---- Groq (no structured output — text only fallback) ----
  {
    id: 'groq:llama-3.3-70b',
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    ctx: 131000,
    json_schema: false,
    requires_strict_schema: false,
    roles: { reasoning: 99, longcontext: 99, fast: 99 }, // last-resort text only
  },
  // ---- Cerebras (currently dead — keys 403) ----
  {
    id: 'cerebras:qwen-3-coder',
    provider: 'cerebras',
    model: 'qwen-3-coder-480b',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    ctx: 32000,
    json_schema: true,
    requires_strict_schema: false,
    roles: { reasoning: 10, longcontext: 10, fast: 10 }, // de-prioritized until refresh
  },
];

const PROVIDER_KEYS = {
  groq: GROQ_KEYS,
  cerebras: CEREBRAS_KEYS,
};

// Per-token cost estimates (USD per 1M tokens, rough). Used only for ledger
// soft cap reporting; free tier today so estimates are mostly $0.
const COST_TABLE = {
  'groq:gpt-oss-120b':    { in: 0.15, out: 0.60 },
  'groq:gpt-oss-20b':     { in: 0.10, out: 0.40 },
  'groq:kimi-k2':         { in: 0.30, out: 1.00 },
  'groq:llama-4-scout':   { in: 0.20, out: 0.60 },
  'groq:llama-3.3-70b':   { in: 0.30, out: 0.60 },
  'cerebras:qwen-3-coder':{ in: 0.10, out: 0.40 },
};

// ---------------------------------------------------------------------------
// State: persisted on disk, refreshed every ~30 min
// ---------------------------------------------------------------------------
const STATE_TTL_MS = 30 * 60 * 1000;

function todayStr() { return new Date().toISOString().slice(0, 10); }

function readState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    const s = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
    if (!s.day || s.day !== todayStr()) return null; // daily reset
    return s;
  } catch { return null; }
}

function writeState(s) {
  try { writeFileSync(STATE_PATH, JSON.stringify(s, null, 2)); } catch {}
}

let state = readState() || freshState();

function freshState() {
  return {
    day: todayStr(),
    updated_at: 0,
    dead_keys: {},          // "groq:0" -> { reason, since }
    dead_key_streak: {},    // "groq:0" -> consecutive auth-fail count
    unsupported_models: {}, // "groq:llama-3.3-70b" -> { reason, since }
    last_probe: null,
    cost_today: 0,
    calls_today: 0,
  };
}

function isStateFresh() {
  return state && (Date.now() - (state.updated_at || 0) < STATE_TTL_MS);
}

// ---------------------------------------------------------------------------
// Budget
// ---------------------------------------------------------------------------
function loadSoftCap() {
  try {
    const b = JSON.parse(readFileSync(BUDGET_PATH, 'utf8'));
    // Reuse the daily hard-stop count as our soft-cap on call count.
    return {
      maxCalls: b.tripwires?.daily_fleet_calls_hard_stop_at ?? 800,
      maxCostUsd: b.tripwires?.daily_cost_usd_hard_stop_at ?? 5.0,
    };
  } catch {
    return { maxCalls: 800, maxCostUsd: 5.0 };
  }
}
const BUDGET = loadSoftCap();

function recordLedger(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  try { appendFileSync(LEDGER_PATH, line + '\n'); } catch {}
  state.calls_today = (state.calls_today || 0) + 1;
  state.cost_today = (state.cost_today || 0) + (entry.cost_estimate || 0);
}

function overBudget() {
  return state.calls_today >= BUDGET.maxCalls || state.cost_today >= BUDGET.maxCostUsd;
}

// ---------------------------------------------------------------------------
// Routing log
// ---------------------------------------------------------------------------
function routeLog(obj) {
  try {
    appendFileSync(LOG_PATH, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n');
  } catch {}
}

// ---------------------------------------------------------------------------
// Schema rewriter — Groq strict mode requires additionalProperties:false
// and required listing every property on EVERY object node.
// ---------------------------------------------------------------------------
function strictifySchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  // Deep clone
  const out = JSON.parse(JSON.stringify(schema));
  walkStrict(out);
  return out;
}

function walkStrict(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const c of node) walkStrict(c); return; }

  if (node.type === 'object' || (node.properties && !node.type)) {
    if (node.additionalProperties === undefined) node.additionalProperties = false;
    if (node.properties && typeof node.properties === 'object') {
      const keys = Object.keys(node.properties);
      // Groq strict insists every property is in required[]
      node.required = keys;
      for (const k of keys) walkStrict(node.properties[k]);
    }
  }
  if (node.type === 'array' && node.items) walkStrict(node.items);
  if (node.items && typeof node.items === 'object') walkStrict(node.items);
  if (node.anyOf) for (const c of node.anyOf) walkStrict(c);
  if (node.oneOf) for (const c of node.oneOf) walkStrict(c);
  if (node.allOf) for (const c of node.allOf) walkStrict(c);
}

// ---------------------------------------------------------------------------
// Key picker — round-robin within a provider, skipping dead keys
// ---------------------------------------------------------------------------
const cursors = { groq: 0, cerebras: 0 };

function pickKey(provider) {
  const keys = PROVIDER_KEYS[provider] || [];
  if (keys.length === 0) return null;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = cursors[provider]++ % keys.length;
    const id = `${provider}:${idx}`;
    if (!state.dead_keys[id]) return { key: keys[idx], id };
  }
  return null;
}

function markKeyAuthFail(keyId, reason) {
  state.dead_key_streak[keyId] = (state.dead_key_streak[keyId] || 0) + 1;
  if (state.dead_key_streak[keyId] >= 3) {
    state.dead_keys[keyId] = { reason, since: new Date().toISOString() };
  }
  writeState(state);
}

function markKeySuccess(keyId) {
  if (state.dead_key_streak[keyId]) {
    delete state.dead_key_streak[keyId];
    writeState(state);
  }
}

function markModelUnsupported(modelId, reason) {
  state.unsupported_models[modelId] = { reason, since: new Date().toISOString() };
  writeState(state);
}

// ---------------------------------------------------------------------------
// Provider×model availability for a role
// ---------------------------------------------------------------------------
function candidatesFor(role, { needSchema }) {
  const list = PROVIDERS
    .filter(p => p.roles[role] != null)
    .filter(p => (PROVIDER_KEYS[p.provider] || []).length > 0)
    .filter(p => !state.unsupported_models[p.id])
    .filter(p => {
      const allKeys = PROVIDER_KEYS[p.provider] || [];
      const alive = allKeys.some((_, idx) => !state.dead_keys[`${p.provider}:${idx}`]);
      return alive;
    })
    .filter(p => !needSchema || p.json_schema);
  list.sort((a, b) => a.roles[role] - b.roles[role]);
  return list;
}

// ---------------------------------------------------------------------------
// One HTTP call
// ---------------------------------------------------------------------------
async function callModel({ candidate, system, user, schema, maxTokens }) {
  const keyPick = pickKey(candidate.provider);
  if (!keyPick) throw Object.assign(new Error('no key'), { status: 401 });

  const body = {
    model: candidate.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: maxTokens,
    temperature: 0.2,
  };
  if (schema && candidate.json_schema) {
    const finalSchema = candidate.requires_strict_schema ? strictifySchema(schema) : schema;
    body.response_format = {
      type: 'json_schema',
      json_schema: { name: 'response', strict: true, schema: finalSchema },
    };
  }

  const res = await fetch(candidate.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${keyPick.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = Object.assign(
      new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`),
      { status: res.status, body: text, keyId: keyPick.id },
    );
    throw err;
  }
  const json = await res.json();
  markKeySuccess(keyPick.id);
  const msg = json.choices?.[0]?.message || {};
  // gpt-oss reasoning models return {content, reasoning}; if reasoning ate all
  // the budget, content can be empty. Fall back to reasoning text for non-JSON.
  let content = msg.content;
  if (!content && !schema && msg.reasoning) content = msg.reasoning;
  if (!content) throw new Error('Empty response');

  // Rough token estimate from usage if present, else from char counts
  const usage = json.usage || {};
  const inTok = usage.prompt_tokens || Math.ceil((system.length + user.length) / 4);
  const outTok = usage.completion_tokens || Math.ceil(content.length / 4);
  const cost = COST_TABLE[candidate.id]
    ? (inTok * COST_TABLE[candidate.id].in + outTok * COST_TABLE[candidate.id].out) / 1_000_000
    : 0;

  recordLedger({
    provider: candidate.provider, model: candidate.model, id: candidate.id,
    in_tokens: inTok, out_tokens: outTok, cost_estimate: cost, key: keyPick.id,
  });

  return schema ? JSON.parse(content) : content;
}

// ---------------------------------------------------------------------------
// Generic dispatch with fallback
// ---------------------------------------------------------------------------
async function dispatch(role, { system, user, schema, maxTokens = 2048 }) {
  if (overBudget()) {
    routeLog({ role, event: 'budget_block', calls: state.calls_today, cost: state.cost_today });
    return { error: 'budget_exhausted', calls_today: state.calls_today, cost_today: state.cost_today };
  }

  const needSchema = !!schema;
  const cands = candidatesFor(role, { needSchema });
  if (cands.length === 0) {
    routeLog({ role, event: 'no_provider', needSchema });
    return { error: 'no provider available', role };
  }

  let lastErr;
  for (const cand of cands) {
    try {
      routeLog({ role, event: 'try', model: cand.id });
      const out = await callModel({ candidate: cand, system, user, schema, maxTokens });
      routeLog({ role, event: 'ok', model: cand.id });
      writeState(state);
      return out;
    } catch (err) {
      lastErr = err;
      const status = err.status;
      const msg = (err.body || err.message || '').slice(0, 200);
      routeLog({ role, event: 'fail', model: cand.id, status, msg });

      if (status === 401 || status === 403) {
        if (err.keyId) markKeyAuthFail(err.keyId, `${status} ${msg}`);
        continue;
      }
      if (status === 400) {
        // unsupported feature (schema/strict-mode/etc) — model out for the day
        markModelUnsupported(cand.id, `400: ${msg}`);
        continue;
      }
      if (status === 404 || status === 429 || (status >= 500 && status < 600)) {
        continue;
      }
      // Unknown error — try next candidate too
      continue;
    }
  }
  writeState(state);
  return { error: 'all providers failed', detail: (lastErr && lastErr.message || '').slice(0, 200) };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function worker_reasoning({ system, user, schema, maxTokens = 4096 }) {
  return dispatch('reasoning', { system, user, schema, maxTokens });
}

export async function worker_longcontext({ system, user, schema, maxTokens = 4096 }) {
  return dispatch('longcontext', { system, user, schema, maxTokens });
}

export async function worker_fast({ system, user, schema, maxTokens = 1024 }) {
  return dispatch('fast', { system, user, schema, maxTokens });
}

// ---------------------------------------------------------------------------
// Health probe — tiny call per provider×model×key sample
// ---------------------------------------------------------------------------
export async function probeAll() {
  state = freshState();
  state.updated_at = Date.now();
  const results = [];

  for (const cand of PROVIDERS) {
    const keys = PROVIDER_KEYS[cand.provider] || [];
    if (keys.length === 0) {
      results.push({ id: cand.id, status: 'no_keys' });
      continue;
    }
    // Probe with the first not-yet-dead key
    try {
      const out = await callModel({
        candidate: cand,
        system: 'You are a health probe. Reply with exactly: ok',
        user: 'ok?',
        schema: null,
        maxTokens: 256, // reasoning models need headroom or content comes back empty
      });
      results.push({ id: cand.id, status: 'ok', sample: String(out).slice(0, 20) });
    } catch (err) {
      const status = err.status || 0;
      if (status === 401 || status === 403) {
        if (err.keyId) markKeyAuthFail(err.keyId, `probe ${status}`);
      }
      if (status === 400) {
        // text probe shouldn't 400 — note but don't mark unsupported
      }
      results.push({ id: cand.id, status: 'fail', code: status, msg: (err.message || '').slice(0, 120) });
    }
  }
  state.last_probe = { at: new Date().toISOString(), results };
  writeState(state);
  return { day: state.day, providers: results, dead_keys: state.dead_keys, unsupported_models: state.unsupported_models };
}

export function getState() { return state; }
