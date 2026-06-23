#!/usr/bin/env bash
set -eu

: "${GH_PAT:?GH_PAT secret missing in HF Space settings}"
: "${CEREBRAS_KEYS:?CEREBRAS_KEYS secret missing}"
: "${GROQ_KEYS:?GROQ_KEYS secret missing}"

REPO_URL="${REPO_URL:-https://github.com/rabbishimon613-lang/kiripedia.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
WORK_DIR="/app/repo"

# Use git's credential.helper "store" with a file that's not on disk anywhere
# git logs to. This keeps the PAT out of `git remote -v`, error messages, and
# any URL printed by git itself.
CRED_FILE="$(mktemp)"
chmod 600 "$CRED_FILE"
# Format: https://USER:TOKEN@host
echo "$REPO_URL" \
  | sed -E "s#https://#https://x-access-token:${GH_PAT}@#" \
  | awk -F/ '{print $1"//"$3}' \
  > "$CRED_FILE"
git config --global credential.helper "store --file=$CRED_FILE"

if [ ! -d "$WORK_DIR/.git" ]; then
  echo "[entrypoint] cloning $REPO_URL ($REPO_BRANCH)"
  git clone --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" "$WORK_DIR"
fi

cd "$WORK_DIR"
git config user.name  "kiripedia-bot"
git config user.email "bot@kiripedia.org"

# npm install with retry; native deps (better-sqlite3 etc) sometimes flake
# on first install. Don't let a transient failure crash-loop the container.
install_deps() {
  npm ci --omit=dev && return 0
  echo "[entrypoint] npm ci failed, falling back to npm install"
  npm install --omit=dev && return 0
  return 1
}
# Self-update yt-dlp on every boot. YouTube breaks the extractor monthly;
# the pinned baseline in the image may already be stale by the time the
# container starts. Failure here is non-fatal — pinned version still works.
yt-dlp -U 2>/dev/null || echo "[entrypoint] yt-dlp self-update skipped"

ATTEMPT=0
until install_deps; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ "$ATTEMPT" -ge 5 ]; then
    echo "[entrypoint] npm install failed 5x — giving up; loop will not start"
    sleep 60
    exit 1
  fi
  echo "[entrypoint] retry $ATTEMPT/5 in 15s"
  sleep 15
done

exec node /loop.mjs
