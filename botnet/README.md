# KiriPedia botnet

Autonomous cron-driven workforce that ingests John Kiriakou's publicly-available video appearances, extracts grounded claims, and writes them to the wiki — with no human in the loop.

## Architecture (day 1, 8 bots)

```
recent-changes   →   npp   →   scribe ×3   →   cataloger-editor ×2   →   reviewer   →   coordinator   →   indexer
                ↑                                                                              ↓
        (manual seed via cli.mjs)                                                    git commit + push
```

**Truth store**: `data/botnet.db` (SQLite, WAL). Parallel workers read+write; only **coordinator** ever touches git. This kills the multi-PR race condition senior dev flagged.

**Quarantine** is the dead-letter, never an inbox. Anything that fails grounding stays in `quarantine` table forever with a reason code.

## Files

| Path | What |
|---|---|
| `lib/schema.sql` | SQLite schema (clips, claims, quarantine, activity, cycles) |
| `lib/db.mjs` | DB helpers + atomic `claimNextClip` |
| `lib/fleet-client.mjs` | HTTP wrapper for Cerebras + Groq with key rotation |
| `lib/grounding/layers.mjs` | 3-layer minimum grounding stack (verbatim, cite, channel) |
| `lib/snapshot-writer.mjs` | Emits `snapshot.json` for pixel office |
| `workers/recent-changes.mjs` | Discovery via existing `tools/find-new-kiriakou-videos.mjs` |
| `workers/npp.mjs` | On/off-corpus triage (worker_fast) |
| `workers/source-auth.mjs` | New-channel verification (worker_reasoning, rare) |
| `workers/scribe.mjs` | yt-dlp + normalize-vtt (no LLM) |
| `workers/cataloger-editor.mjs` | Claim extraction + article routing (worker_reasoning) |
| `workers/reviewer.mjs` | Grounding stack runner |
| `workers/coordinator.mjs` | THE ONLY WRITER: scaffolder → audits → commit |
| `workers/indexer.mjs` | Date + mentions indexes |
| `run-cycle.mjs` | Run the whole pipeline once |
| `cli.mjs` | Operator hooks: seed, status, quarantine, reset |

## Setup

```bash
cd /Volumes/EOS_DIGITAL/KiriPedia
npm install better-sqlite3
export CEREBRAS_KEYS=key1,key2,key3,key4    # from /keyring
export GROQ_KEYS=key1,key2,key3              # from /keyring
```

## Run a smoke test

```bash
# Seed one known clip manually, bypass discovery.
node botnet/cli.mjs seed https://youtu.be/<known-kiriakou-id>

# Run the full pipeline once.
node botnet/run-cycle.mjs --skip-discovery

# Check state.
node botnet/cli.mjs status
node botnet/cli.mjs quarantine 10
```

## What's NOT in day 1 (per senior dev review)

These are post-backfill; build in month 3 when there's something to deepen.

- **Acquisitions Librarian** (Tavily sweep) — manual CLI is enough; repeat-channel rate is high
- **Deepener** — re-mine transcripts with stricter prompts
- **Cross-Source Enricher** — mentions-index → enrichment specs
- **Tier-C Promoter** — auto-promote entities from `TODO-tier-c.md`
- **Image Gap Filler** — retry silent misses in `fetch-images.sh`
- **Weaver** — daily article re-cohesion using `article-weaving` skill
- **9 more grounding layers** — write against real rejected output, not in isolation

## Grounding stack (current state)

| # | Layer | Implemented | Notes |
|---|---|---|---|
| 1 | VTT verbatim grep | ✅ | normalize whitespace; everything else strict |
| 2 | Timestamp window | ⏳ | wait for real rejects |
| 3 | Off-corpus contamination | ⏳ | needs whitelist bootstrap + N=200 corpus |
| 4 | Discretion mirror | ⏳ | wait for real rejects |
| 5 | Citation roundtrip | ✅ | timestamp format check |
| 6 | Cross-clip restatement | ⏳ | needs richer corpus |
| 7 | Voice contamination | ✅ | regex bans "according to Kiriakou" |
| 8 | Density floor | ⏳ | |
| 9 | Channel provenance | ✅ | reads `fleet/config/grounds.json` |
| 10 | Second-pass re-extract | ⏳ | only for 70-89 band when added |
| 11 | Confidence scoring | ✅ | weighted sum |
| 12 | Bio gate | ✅ | `is_about_kiriakou_himself` → quarantine forever |

## Why not on GH Actions yet

The pipeline runs locally first. Once it's been boring for a week with no regressions, port the cron schedules into `workflows/` and move keys into Actions secrets.
