# KiriPedia — Infrastructure & Keys Reference

_Last updated 2026-06-23. Authoritative source for hosting decisions, key allocation, and cost. Update after any infra change._

---

## Where the team runs today

| Component | Where | Status |
|---|---|---|
| **Botnet loop** | HF Space `zerocool69/kiripedia` (free CPU basic, 16GB) | Running 24/7 |
| **GH Actions cron** | Disabled — schedule: block commented out in `botnet-cycle.yml` | Workflow_dispatch only |
| **finalize-ingest** | GH Actions — triggers on `.mdx` push | Active |
| **x-poster** | GH Actions — 8 slots/day cron | Active |
| **KiriPedia site** | Vercel free tier — auto-deploys on push to main | Live |
| **Pixel office** | Localhost 5178 — not yet embedded in Astro site | Local only |

### HF Space keep-alive
A cron-job.org ping hits `/health` on the Space every 6h to prevent 48h idle pause. The Space exposes port 7860.

---

## Loop cycle timing

- `LOOP_SLEEP_MS` = 300000 (5 minutes between cycles) per default in `loop.mjs`
- `CYCLE_TIMEOUT_MS` = 900000 (15 min watchdog per cycle)
- Effective cycles/day: ~288 (5-min sleep) but rate-limited in practice by LLM keys and discovery state

---

## Key allocation — actual state (as of 2026-06-23)

Source: `~/.claude/skills/keyring/registry.json`

| Key ID | Provider | Owner | Status | Notes |
|---|---|---|---|---|
| cerebras-1 | Cerebras | llm-fleet | untested | Original fleet key; value is a placeholder in registry (read from llm-fleet .env) |
| cerebras-2 | Cerebras | **kiripedia** | hot | Allocated 2026-06-21 |
| cerebras-3 | Cerebras | **kiripedia** | hot | Allocated 2026-06-21 |
| cerebras-4 | Cerebras | **kiripedia** | hot | Allocated 2026-06-21 |
| cerebras-5 | Cerebras | **kiripedia** | hot | Allocated 2026-06-21 |
| groq-1 | Groq | **kiripedia** | untested | Shared from fleet |
| groq-2 | Groq | **kiripedia** | untested | Shared from fleet |
| groq-3 | Groq | llm-fleet | untested | Stays with fleet |
| openrouter-1..5 | OpenRouter | llm-fleet | untested | Not used by KiriPedia |
| tavily-1..5 | Tavily | llm-fleet | untested | Share 1 key when Acquisitions Librarian is built |
| exa-1..5 | Exa | llm-fleet | untested | Share 1 key for Archive Diver if needed |
| anthropic-1 | Anthropic | trading | untested | DO NOT use for bots |
| anthropic-2 | Anthropic | dev_yitzach | untested | DO NOT use for bots |

### Recommended vs actual (BOTNET-HANDOFF §5 plan)

| Recommended | Actual | Gap |
|---|---|---|
| cerebras-2,3,4 → Catalogers + Reviewers | cerebras-2,3,4 → kiripedia | **Aligned** — all 4 earmarked keys allocated |
| cerebras-5 → Copy Editors | cerebras-5 → kiripedia | **Aligned** |
| groq-1,2 → Scribes | groq-1,2 → kiripedia | **Aligned** |
| groq-3 → llm-fleet | groq-3 → llm-fleet | **Aligned** |
| openrouter × 3 → Patroller fast | openrouter-1..5 → llm-fleet | **Drifted** — NPP uses Groq (worker_fast) not OpenRouter; OR keys unused by KiriPedia |
| tavily × 1 → Acquisitions Librarian | Not allocated to KiriPedia | **Not built yet** — allocate when Channel Crawler + Acquisitions role is live |
| YouTube Data API × 1 → Recent Changes | Not provisioned | **Missing** — needed for channel-based discovery |

**Drift summary:** OpenRouter is unused by KiriPedia (NPP uses Groq which is fine). Tavily and YouTube Data API are the only genuinely missing keys; neither is blocking today because discovery is dead for a different reason (broken search API). YouTube Data API needs to be provisioned before `recent-changes` can be resurrected as a channel-based crawler.

---

## Key env vars for the HF Space

The Space's Secrets panel must contain:
```
GH_PAT          = GitHub PAT (classic, repo scope on projectmamad48/KiriPedia)
CEREBRAS_KEYS   = csk-...,csk-...,csk-...,csk-...   (cerebras-2 through cerebras-5)
GROQ_KEYS       = gsk-...,gsk-...                    (groq-1, groq-2)
```

The `fleet-client.mjs` reads `CEREBRAS_KEYS` and `GROQ_KEYS` as comma-separated lists and rotates them round-robin with exponential backoff on 429/5xx.

---

## Hosting decision matrix

| Phase | Recommended hosting | Reason |
|---|---|---|
| **Now (Phase 1 prep)** | HF Space (current) | Already running; free; 24/7 loop without GitHub Actions cron limits |
| **Phase 1 — Channel Crawler live** | HF Space | Same — SQLite on disk in the container, snapshot pushed to git. Works fine. |
| **Phase 2 — Embeddings + Re-Reader** | HF Space | bge-small or all-MiniLM runs on CPU; 16GB RAM is enough for ~1260 passages |
| **Phase 3 — Full 18 roles** | HF Space or $5 VPS | If HF restarts become frequent (they killed a cycle mid-git-op once per `loop.mjs` design), migrate to $5 VPS. The migration is 10 minutes: same Docker image, same env vars, systemd service instead of HF container. |
| **Trigger for VPS** | HF stuck >2×/week OR HF flags the Space as non-ML AND appeal fails | Until then HF is correct — free and adequate |

### GH Actions vs HF Space vs VPS

| | GH Actions cron | HF Space (current) | $5 VPS |
|---|---|---|---|
| Cost | $0 | $0 | $5/mo |
| Min cycle interval | ~5 min | ~30s (configurable) | ~5s (configurable) |
| Persistent SQLite | No (checkout fresh each run) | Yes (in container, backed up to git) | Yes |
| 24/7 | No (scheduled) | Yes | Yes |
| Restart resilience | Excellent (stateless) | Good (stale lock cleanup in loop.mjs) | Excellent (systemd restart) |
| Idle suspension | Yes (60d inactive repos) | Yes (48h w/o pings) | No |
| Current status | Disabled | Active | Not used |

**Verdict:** Stay on HF Space through Phase 2. Provision VPS only if HF kills cycles more than twice per week.

---

## GH Actions free-tier budget (for reference)

Public repos get unlimited GH Actions minutes. The only active workflows are:
- `finalize-ingest.yml` — triggers on article push; ~2 min per run. Low frequency.
- `x-poster.yml` — 8 runs/day × ~3 min each = ~24 min/day. Well within free tier.
- `botnet-cycle.yml` — workflow_dispatch only (cron disabled). Zero scheduled cost.

---

## Net new keys needed

Before Phase 1 can start:
1. **YouTube Data API key** — free tier, 10k units/day, enough for channel polling. Provision at https://console.cloud.google.com/. Add to GH Actions secret `YOUTUBE_API_KEY` and HF Space secret.

Before Phase 2:
2. Nothing new. Embeddings run locally on HF Space CPU.

---

## Cost model one-liner

> All LLM work runs on free Cerebras + Groq keys. All compute runs on free HF Space + GH Actions. All storage is SQLite in git. **Total monthly cost: $0 until throughput exceeds ~1000 clips/day**, which John Kiriakou will never produce.

---

## Files written by the infra layer

| File | Written by | Cadence |
|---|---|---|
| `public/botnet-snapshot.json` | `loop.mjs` (HF Space) | After every cycle |
| `public/sentry-report.json` | mouth-sentry worker | Every cycle |
| `public/prospector-queue.json` | prospector worker | Every cycle |
| `botnet/state/last-worked.json` | deepener/enricher/weaver/reweaver/prospector | After each article touch |
| `src/content/articles/*.mdx` | coordinator + weaver/reweaver | When claims merge |
| `tools/x-bot-state.json` | x-poster workflow | After each post |

---

_For key mutation, use `/keyring` commands. Never edit registry.json by hand._
