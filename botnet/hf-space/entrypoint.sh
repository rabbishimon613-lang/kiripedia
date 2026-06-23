#!/usr/bin/env bash
set -euo pipefail

: "${GH_PAT:?GH_PAT secret missing in HF Space settings}"
: "${CEREBRAS_KEYS:?CEREBRAS_KEYS secret missing}"
: "${GROQ_KEYS:?GROQ_KEYS secret missing}"

REPO_URL="${REPO_URL:-https://github.com/projectmamad48/KiriPedia.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
WORK_DIR="/app/repo"

AUTHED_URL="$(echo "$REPO_URL" | sed -E "s#https://#https://x-access-token:${GH_PAT}@#")"

if [ ! -d "$WORK_DIR/.git" ]; then
  echo "[entrypoint] cloning $REPO_URL ($REPO_BRANCH)"
  git clone --depth 1 --branch "$REPO_BRANCH" "$AUTHED_URL" "$WORK_DIR"
fi

cd "$WORK_DIR"
git config user.name  "kiripedia-bot"
git config user.email "bot@kiripedia.org"
git remote set-url origin "$AUTHED_URL"

npm ci --omit=dev || npm install --omit=dev

exec node /loop.mjs
