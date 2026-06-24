// fleet-client: HTTP wrapper around Cerebras + Groq with key rotation.
//
// Workers call one of:
//   await worker_reasoning({ system, user, schema? })   // Cerebras qwen-3-coder or llama-3.3
//   await worker_longcontext({ system, user })          // Groq llama-3.3-70b-versatile (128k)
//   await worker_fast({ system, user })                 // Groq llama-3.1-8b-instant
//
// Keys come from env vars (set by GH Actions secrets or local .env):
//   CEREBRAS_KEYS=key1,key2,key3,key4
//   GROQ_KEYS=key1,key2,key3
// Rotated round-robin per process; on 429/5xx we hop to the next key.

const CEREBRAS_KEYS = (process.env.CEREBRAS_KEYS || process.env.CEREBRAS_API_KEYS || '').split(',').filter(Boolean);
const GROQ_KEYS = (process.env.GROQ_KEYS || process.env.GROQ_API_KEYS || '').split(',').filter(Boolean);

if (CEREBRAS_KEYS.length === 0) console.warn('[fleet] WARN: no CEREBRAS_KEYS in env');
if (GROQ_KEYS.length === 0) console.warn('[fleet] WARN: no GROQ_KEYS in env');

let cerebrasCursor = 0;
let groqCursor = 0;

function nextCerebras() { return CEREBRAS_KEYS[cerebrasCursor++ % CEREBRAS_KEYS.length]; }
function nextGroq() { return GROQ_KEYS[groqCursor++ % GROQ_KEYS.length]; }

async function callOpenAICompat({ url, key, model, messages, jsonSchema, maxTokens = 4096 }) {
  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature: 0.2,
  };
  if (jsonSchema) {
    body.response_format = {
      type: 'json_schema',
      json_schema: { name: 'response', strict: true, schema: jsonSchema },
    };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`), { status: res.status });
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from model');
  return jsonSchema ? JSON.parse(content) : content;
}

async function withRotation({ keys, nextFn, attempts = 3, callFn }) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    const key = nextFn();
    try {
      return await callFn(key);
    } catch (err) {
      lastErr = err;
      const status = err.status;
      if (status === 429 || (status >= 500 && status < 600)) {
        // back off briefly then try the next key
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// --- Public API -------------------------------------------------------------

// Cerebras qwen-3-coder-480b — reasoning, structured output, ~2k tokens/sec
export async function worker_reasoning({ system, user, schema, maxTokens = 4096 }) {
  return withRotation({
    keys: CEREBRAS_KEYS,
    nextFn: nextCerebras,
    callFn: (key) => callOpenAICompat({
      url: 'https://api.cerebras.ai/v1/chat/completions',
      key,
      model: 'qwen-3-coder-480b',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      jsonSchema: schema,
      maxTokens,
    }),
  });
}

// Groq llama-3.3-70b-versatile — 128k context, for whole transcripts
export async function worker_longcontext({ system, user, schema, maxTokens = 4096 }) {
  return withRotation({
    keys: GROQ_KEYS,
    nextFn: nextGroq,
    callFn: (key) => callOpenAICompat({
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key,
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      jsonSchema: schema,
      maxTokens,
    }),
  });
}

// Groq llama-3.1-8b-instant — fast, cheap, for triage
export async function worker_fast({ system, user, schema, maxTokens = 1024 }) {
  return withRotation({
    keys: GROQ_KEYS,
    nextFn: nextGroq,
    callFn: (key) => callOpenAICompat({
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key,
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      jsonSchema: schema,
      maxTokens,
    }),
  });
}
