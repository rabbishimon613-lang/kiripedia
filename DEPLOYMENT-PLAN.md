# DEPLOYMENT PLAN — Get KiriPedia 100% off the Mac

You already have a cloud home for the research team: a free Hugging Face Space called `zerocool69/kiripedia` that was set up months ago to run the bots 24/7, and a set of GitHub Actions that handle the X auto-poster and post-write audits. The reason it feels local tonight is that you are also running the same supervisor on your laptop on top of the cloud one, which both wastes effort and risks the two committers stepping on each other. The fix is small and boring: stop the laptop process, confirm the Hugging Face Space is awake (or wake it up with a fresh push and a keep-alive ping every six hours), keep the X poster exactly where it lives now in GitHub Actions, and add a once-a-day backup of the small working database to the GitHub repo so nothing important only exists on your disk. After that, you can close the lid forever and the encyclopedia keeps writing itself.

---

## 1. Current state — what's where

| Piece | Where it actually lives right now | Cloud-native? |
|---|---|---|
| Wiki frontend (Astro static site) | Vercel project `kiripedia` (org `team_tLyHa9jVAXtV8fHKdh1kiINP`, project `prj_1ANHEWqc3P5bdj254smDC5UI0fWT`), auto-deploys on push to `main` of `github.com/rabbishimon613-lang/kiripedia` | Yes, fully cloud |
| Botnet supervisor (`run-forever.mjs`) | **TWO PLACES SIMULTANEOUSLY**: (a) HF Space `zerocool69/kiripedia` runs `botnet/hf-space/loop.mjs` → `run-cycle.mjs` continuously; (b) `node botnet/run-forever.mjs` is running on the Mac right now (PID 62682, started 1:11 AM) | (a) yes, (b) no — Mac-bound |
| Botnet workers (all 24 lanes under `botnet/workers/*`) | Same code is shipped via git pull on every cycle inside the HF Space container | Yes (when invoked from the Space) |
| SQLite DB `botnet/data/botnet.db` (4.4 MB) | **Local only — Mac disk and Space container disk separately.** Not committed to git. The Space rebuilds its own copy from scratch on each boot from git state | Semi — survives in the Space, but if the Space restarts it loses pipeline state (queues, claim grades) |
| LLM keys (Cerebras × 5, Groq × 3, Gemini, OpenRouter × 5, Tavily × 5, Exa × 5) | Master copy: `/Volumes/EOS_DIGITAL/llm-fleet/.env` on the Mac. Copies shipped into: (i) HF Space Secrets panel as `CEREBRAS_KEYS` + `GROQ_KEYS`; (ii) GitHub Actions repo secrets as `CEREBRAS_KEYS` + `GROQ_KEYS` | Master is Mac-only, but cloud copies exist |
| Git push auth from the cloud | HF Space: `GH_PAT` secret, classic PAT with `repo` scope, written as `https://x-access-token:$GH_PAT@github.com/...` in entrypoint.sh. GH Actions: builtin `GITHUB_TOKEN` for `finalize-ingest`, separate `INGEST_TOKEN` PAT secret for cross-workflow chains | Yes |
| X auto-poster | GitHub Actions `.github/workflows/x-poster.yml`, cron 8 slots/day (3-hour cadence), runs `tools/x-poster.mjs --browser` via Playwright headless Chromium with cookie auth | Yes, fully cloud |
| X bot state (`tools/x-bot-state.json`) | Committed to the repo by the workflow after each post (commit message `x-bot: update post state [skip ci]`) | Yes |
| X auth | `X_AUTH_TOKEN` + `X_CT0` cookie pair, stored as GH Actions secrets. (Code also references `X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET` for the API path — not currently used; browser/cookie path is the active one) | Yes |
| `finalize-ingest` workflow | GH Actions, triggers on `.mdx` push, runs audits + image fetch + commits derived artifacts back | Yes |
| `botnet-cycle` workflow | GH Actions, **cron commented out** (handed off to HF Space), `workflow_dispatch` only | Dormant but cloud |
| Pixel office visualization | localhost:5178 on the Mac, not deployed | Mac-only (cosmetic, not on the critical path) |

## 2. Local-dependence audit

| Piece | Verdict |
|---|---|
| Vercel site | Cloud-native. Nothing to do. |
| HF Space loop | Cloud-native. The Space at `zerocool69/kiripedia` is the canonical 24/7 driver per `INFRA.md`. Needs a verification step (it may have idled — `loop.mjs`'s sync-to-remote means it forgets pipeline state on restart, but it keeps running). |
| `run-forever.mjs` on the Mac | **ACTIVELY LAPTOP-BOUND.** This is the process you are alarmed about. It is currently running (PID 62682) and is doing the same work as the HF Space, racing it on commits. Coordinator lane is the only git writer, but with two coordinators on two machines you will hit non-fast-forward conflicts (the Space's `loop.mjs` already has a 5-attempt rebase loop for exactly this reason). **Kill this and the Mac is no longer in the loop.** |
| Worker internals | Checked for Mac-only calls — `osascript`, `launchctl`, `mdfind`, `/Applications`, `~/Library`. **Clean.** Only two soft references found: `botnet/README.md` line 40 has a `cd /Volumes/EOS_DIGITAL/KiriPedia` example, and `botnet/lib/office-manager.mjs` line 34 has a comment mentioning `/Volumes/EOS_DIGITAL` — both are documentation, not code paths. Workers use `node`, `git`, `yt-dlp`, `npm`, `fetch`. All cross-platform. |
| `botnet.db` (SQLite, 4.4 MB) | **Semi-local.** Lives on Space container disk inside `/app/repo/botnet/data/`. NOT committed to git. If the Space restarts (HF reboots, you re-deploy, or you push a new image), the DB is rebuilt from empty and the pipeline reconstructs state from MDX articles + transcripts under git. Some state genuinely lives only in the DB: claim verdicts, work queue cursors, deepener/enricher cooldowns. Not catastrophic to lose (workers re-derive most of it from scratch), but if you ever want to "freeze" a snapshot of the team's brain, you need to back the DB up out-of-band. |
| `botnet/state/*.json` (`last-worked.json`, `orders-today.json`, `work-queue.json`) | The HF loop already commits `botnet/state/last-worked.json` back to git after each cycle. Cooldown state survives restarts. Good. |
| `forever.lock` | Local-only PID lock. Each host has its own. The Space's loop wrapper is `loop.mjs`, which doesn't use this lock (uses container = 1 process). Not a portability issue. |
| LLM keys | Cloud copies already exist (HF Space Secrets + GH Actions Secrets). The Mac `.env` is the master Pedro maintains, but the cloud hosts don't read from it. |
| Git push | HF Space uses PAT (`GH_PAT`). GH Actions uses `GITHUB_TOKEN` / `INGEST_TOKEN`. Neither path goes through the Mac. |
| X bot | Cloud-native. Runs entirely on GH Actions runners. State lives in the repo. Auth lives in GH secrets. The Mac is not involved. |
| Pixel office | localhost only. Not on critical path. Out of scope for this migration. |

**Verdict in plain English:** the only thing genuinely tying the project to your laptop tonight is the second supervisor running on it. Kill that one process and you are already cloud-only.

## 3. Cloud-only target architecture

Reuse what exists. Do not add a new host.

```
                    GitHub repo: rabbishimon613-lang/kiripedia (main)
                                       │
       ┌───────────────────────────────┼───────────────────────────────────┐
       │                               │                                   │
       ▼                               ▼                                   ▼
  Vercel kiripedia              HF Space zerocool69/kiripedia         GH Actions
  (Astro static)                (loop.mjs → run-cycle.mjs --push)     ├─ x-poster.yml (cron 8×/day)
  auto-deploys on push          24/7, free CPU basic                  ├─ finalize-ingest.yml (on mdx push)
                                pings: cron-job.org → /health/6h      └─ db-backup.yml (NEW — daily DB snapshot)
                                secrets: GH_PAT, CEREBRAS_KEYS, GROQ_KEYS
                                         (add GEMINI_KEYS for parity)
```

**Three running hosts, all free, all already wired:**
1. **Vercel** — serves the site. No change.
2. **Hugging Face Space `zerocool69/kiripedia`** — runs the supervisor loop 24/7. This replaces the Mac process. Already set up; needs a verification + a small loop-state hardening.
3. **GitHub Actions** — runs the X poster on cron, runs `finalize-ingest` on every `.mdx` push, runs a NEW daily `db-backup.yml` to commit `botnet/data/botnet.db` (or a gzipped copy) into a `botnet-db-snapshots/` branch.

**Optional additions** (only if HF Space proves unreliable):
- Fly.io free tier as a second worker host with persistent volume for `botnet.db`.
- Skip for now. HF has been running it; trust it until it breaks.

**Single-writer invariant.** The Coordinator inside `run-cycle.mjs` is the only git writer in the pipeline. With the Mac supervisor killed, the HF Space is the only Coordinator anywhere in the world. The X poster commits a different file (`tools/x-bot-state.json`) on a different cadence and rebases on conflict. No more two-laptop race.

## 4. Migration plan — concrete steps

Do these in order. Total time ~30 min, mostly waiting for HF and cron-job.org.

### 4.1. Verify the HF Space is alive

```
# Replace <user> with the HF account that owns the Space (zerocool69 per INFRA.md).
curl -fsSL https://zerocool69-kiripedia.hf.space/health
```

Expected: JSON with `lastCycleAt` recent (within `LOOP_SLEEP_MS` = 5 min by default), `stuck: false`, `cycles > 0`.

If 404 / 503 / `lastCycleAt` is hours old, jump to 4.2. If healthy, jump to 4.4.

### 4.2. Re-light the HF Space if it's idle

In the HF web UI: `huggingface.co/spaces/zerocool69/kiripedia` → Settings → **Restart Space**. Watch the build log. If the build itself is broken, redeploy:

```
cd /Volumes/EOS_DIGITAL/KiriPedia/botnet/hf-space
git init  # if not already a repo
git remote add space https://huggingface.co/spaces/zerocool69/kiripedia
git add Dockerfile entrypoint.sh loop.mjs README.md
git commit -m "redeploy"
git push -u space main  # HF username + HF write token as password
```

### 4.3. Verify Space secrets are in place

In the HF Space Settings → Variables and secrets, confirm these secrets exist (values match `/Volumes/EOS_DIGITAL/llm-fleet/.env`):

| Secret | Value source |
|---|---|
| `GH_PAT` | classic PAT, `repo` scope, owned by Pedro |
| `CEREBRAS_KEYS` | `CEREBRAS_API_KEYS` from llm-fleet/.env (comma-separated csk-... values) |
| `GROQ_KEYS` | `GROQ_API_KEYS` from llm-fleet/.env |
| `GEMINI_KEYS` | **ADD** — `GEMINI_API_KEYS` from llm-fleet/.env (fleet-client.mjs reads it; currently missing per Space README) |

To copy values from the Mac safely:
```
grep -E "^(CEREBRAS|GROQ|GEMINI)_API_KEYS=" /Volumes/EOS_DIGITAL/llm-fleet/.env
```
Paste the right-hand side of each line into the matching HF secret.

### 4.4. Set the keep-alive ping

Go to https://cron-job.org . Create a cron job:
- URL: `https://zerocool69-kiripedia.hf.space/health`
- Schedule: every 6 hours
- Method: GET

This prevents the 48-hour idle pause on HF free tier. (One-time. May already exist — INFRA.md says it does.)

### 4.5. Kill the Mac supervisor

```
# Find the PID. Currently PID 62682.
ps -ef | grep run-forever.mjs | grep -v grep

# Drain gracefully (waits up to 60s for in-flight workers):
kill -TERM 62682

# Confirm it's gone:
ps -ef | grep run-forever.mjs | grep -v grep    # should be empty
ls /Volumes/EOS_DIGITAL/KiriPedia/botnet/data/forever.lock 2>/dev/null || echo "lock cleared"
```

If the lock file lingers (rare), `rm /Volumes/EOS_DIGITAL/KiriPedia/botnet/data/forever.lock`.

### 4.6. Confirm cloud is the only committer

```
# Watch a few minutes of git history. You should see commits from
# kiripedia-bot <bot@kiripedia.org> (the HF loop) and nothing from your laptop.
cd /Volumes/EOS_DIGITAL/KiriPedia
git fetch
git log --since="1 hour ago" --pretty='%h %an %s' origin/main
```

Expected: `kiripedia-bot` commits like `botnet: update snapshot [skip ci]` continuing to land.

### 4.7. Add a daily SQLite DB snapshot to git (new workflow)

The DB is 4.4 MB; gzipped it's ~1 MB. One commit per day to a sidecar branch is cheap and gives you a recovery point.

Create `.github/workflows/db-backup.yml` (NOT done in this audit — listed for the user to add):

```yaml
name: Botnet DB snapshot
on:
  schedule:
    - cron: '0 7 * * *'   # 3am ET
  workflow_dispatch:
permissions:
  contents: write
jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Pull DB from HF Space
        run: |
          curl -fsSL "https://zerocool69-kiripedia.hf.space/db" -o botnet.db || \
          echo "skip: no /db endpoint yet"
      - name: Commit snapshot
        if: hashFiles('botnet.db') != ''
        run: |
          mkdir -p botnet/snapshots
          gzip -c botnet.db > "botnet/snapshots/$(date -u +%Y-%m-%d).db.gz"
          git config user.name "kiripedia-bot"
          git config user.email "bot@kiripedia.org"
          git add botnet/snapshots/
          git diff --staged --quiet || git commit -m "db snapshot [skip ci]"
          git push
```

This requires adding a `/db` route to `botnet/hf-space/loop.mjs` (small change, ~10 lines) that streams the SQLite file. Acceptable to defer if you don't care about DB recovery — the pipeline rebuilds.

### 4.8. Verify it's alive after migration

Five checks:

1. `curl -fsSL https://zerocool69-kiripedia.hf.space/health` returns `lastCycleAt` within last 10 min, `stuck: false`.
2. `git log origin/main --since="30 minutes ago"` shows recent `kiripedia-bot` commits.
3. `https://www.kiripedia.org/recent-changes` shows changes from after the Mac was killed.
4. GH Actions tab shows the next `x-poster` cron run firing on schedule.
5. Close your laptop lid for 15 minutes. Re-open. Re-check #1 and #2. Both should show further progress.

## 5. The X bot

**Where it runs now:** GitHub Actions runner, ephemeral Ubuntu VM, one VM per cron firing. Workflow file: `.github/workflows/x-poster.yml`. Script: `tools/x-poster.mjs`. State file: `tools/x-bot-state.json` (committed back to the repo after each post via the workflow's final step).

**Where it runs after migration:** Same place. **Already 100% cloud, already no laptop involvement.** Nothing to migrate.

**Cadence:** 8 cron slots per day at 3-hour intervals (8pm/11pm/2am/5am/8am/11am/2pm/5pm ET).

**Mechanism:** Playwright headless Chromium with cookie auth (the `--browser` flag). Free path, no X API quota burn.

**Credentials (already cloud-hosted as GH Actions repo secrets):**
- `X_AUTH_TOKEN` — the `auth_token` cookie from a logged-in X session
- `X_CT0` — the `ct0` CSRF cookie

When these cookies expire (typically every few months), Pedro re-logs into X in a browser, exports the two cookies, updates them in GitHub repo settings → Secrets → Actions. This is the ONLY recurring manual touch the X bot has — and it's not laptop-bound.

**Audit findings:**
- The bot is independent of the supervisor. They never communicate.
- The bot does not touch `botnet.db`. It reads MDX frontmatter from the repo directly.
- It commits its own state file with `[skip ci]` to avoid triggering `finalize-ingest`.
- No Mac dependencies in `tools/x-poster.mjs`.

**Risk:** if X disables cookie auth or the cookies expire while you're traveling, the bot goes dark. Workflow logs upload `tools/x-browser-error.png` as an artifact on failure, so you can see what X showed. Mitigation: keep the `X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET` API path warm in `x-poster.mjs` as a fallback (the env vars are already referenced).

## 6. Rollback

If the HF Space proves broken and you need the Mac back:

```
# Restore the laptop driver. Same command you've been running:
cd /Volumes/EOS_DIGITAL/KiriPedia
node botnet/run-forever.mjs

# To stop the HF Space race in the meantime:
# huggingface.co/spaces/zerocool69/kiripedia → Settings → Pause Space
```

The PID lock at `botnet/data/forever.lock` will prevent two Mac instances. The state in the repo is canonical — restarting on the Mac picks up exactly where the Space left off. No data loss either direction.

If the X bot stops posting after migration: it didn't move, so this rollback doesn't apply. Re-check the GH Actions tab for the latest `x-poster` run and read its log.

## 7. Open questions for Pedro

1. **Does the HF Space need a hardware upgrade?** Free CPU basic has been adequate per `INFRA.md`. If discovery (Acquisitions Librarian, YouTube Data API ingest) scales up, the 16 GB / 2 vCPU may saturate. Decide now whether to budget $9/month for HF Space CPU upgrade. Default: no, stay free.
2. **Do we want the daily DB snapshot workflow?** Adds ~30 MB/year of `.db.gz` files to the repo. Cheap, but commits forever. Default: yes, the recovery option is worth it.
3. **Should `GEMINI_KEYS` be added to the HF Space secrets?** `fleet-client.mjs` reads it but the Space README only lists Cerebras + Groq. If any worker routes to Gemini and the env var is empty, that worker silently degrades. Recommend adding.
4. **Disable the `botnet-cycle.yml` workflow_dispatch?** It's dormant (cron commented out) but a manual click could fire a third committer. Leave it as a break-glass tool or delete it.
5. **Pixel office visualization** — does it ever need to leave localhost? If yes, that's a separate migration (deploy as a Vercel preview branch). Out of scope here.
6. **X cookie rotation cadence** — set a calendar reminder, or accept that the bot will go dark for a day or two when cookies expire and you'll notice via the failure artifact.
7. **HF Space owner account** — confirm `zerocool69` is an account Pedro controls. If it's a throwaway, transfer ownership before relying on it forever.
