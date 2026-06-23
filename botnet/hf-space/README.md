---
title: KiriPedia Botnet
emoji: 📚
colorFrom: blue
colorTo: gray
sdk: docker
pinned: false
---

# KiriPedia botnet — HF Space loop

Always-on Node loop that runs the KiriPedia botnet pipeline every ~30s and
pushes snapshot updates back to the KiriPedia GitHub repo. Lives on a free
Hugging Face Space (CPU basic, 16GB RAM, no credit card).

## One-time setup (you, in the HF web UI)

1. Go to https://huggingface.co/new-space
   - Owner: your HF account
   - Space name: `kiripedia-botnet`
   - License: any (mit is fine)
   - SDK: **Docker**
   - Visibility: **Public** (private Spaces sleep more aggressively on free tier)
   - Hardware: **CPU basic — free**

2. After the Space is created, open **Settings → Variables and secrets** and add as **Secrets**:
   - `GH_PAT` — a GitHub PAT (classic) with `repo` scope on `projectmamad48/KiriPedia`
   - `CEREBRAS_KEYS` — comma-separated Cerebras keys (same value as the GH Actions secret)
   - `GROQ_KEYS` — comma-separated Groq keys

3. Optionally add as **Variables** (not secrets):
   - `LOOP_SLEEP_MS` — default `30000`. Lower = more cycles, more LLM key burn.
   - `REPO_BRANCH` — default `main`.

4. Push the contents of this folder to the Space's git repo:
   ```bash
   cd botnet/hf-space
   git init
   git remote add space https://huggingface.co/spaces/<your-user>/kiripedia-botnet
   git add . && git commit -m "initial space"
   git push -u space main
   ```
   (HF will prompt for username + an HF access token as the password.)

5. Watch the Space build. When it's running, the public URL
   `https://<your-user>-kiripedia-botnet.hf.space/health` returns JSON.

## Keep-alive (so the Space doesn't idle-pause after 48h)

1. https://cron-job.org → free account, no CC.
2. New cron job: GET `https://<your-user>-kiripedia-botnet.hf.space/health` every 6h.
3. Done. The Space stays warm forever.

## How it works

- `Dockerfile` builds a Node 20 + git image, copies the loop + entrypoint.
- `entrypoint.sh` clones the KiriPedia repo on first run, configures git creds
  from the `GH_PAT` secret, runs `npm ci`.
- `loop.mjs` runs `botnet/run-cycle.mjs --push` continuously (sleep 30s between),
  serves `/health` on port 7860 so HF + cron-job.org can poll it.

## Operational notes

- The Space's own git repo only holds this folder. The botnet operates on a
  separate clone of KiriPedia inside the container.
- Commits land on `main` of KiriPedia (same as the GH Actions cron does now).
  Consider disabling the GH Actions cron once the Space is healthy, to avoid
  two concurrent committers racing.
- If HF flags the Space as "non-ML", reply that it's a background indexer for
  a public knowledge base. That's true and on-brand for HF.
- To pause: HF Settings → Pause Space. To resume: unpause. State is preserved
  (it lives in the GitHub repo, not the Space's disk).
