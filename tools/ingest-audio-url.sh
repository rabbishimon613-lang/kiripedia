#!/usr/bin/env bash
# Ingest one audio episode from a DIRECT media URL, with metadata supplied by hand.
#
# churn.sh's RSS path resolves an episode by fuzzy title match against a feed, which fails
# whenever the feed title carries a curly apostrophe or a prefix (three Scheer Intelligence
# episodes defeated it). When you already know the exact enclosure URL, use this instead —
# it skips resolution entirely and goes straight to fetch -> whisper -> normalize.
#
# Usage: tools/ingest-audio-url.sh <media-url> <YYYY-MM-DD> <show> <title> [minutes] [page-url]
set -u
cd "$(dirname "$0")/.." || exit 1

URL="${1:?media url}"; DATE="${2:?date}"; SHOW="${3:?show}"; TITLE="${4:?title}"
MIN="${5:-0}"; PAGE="${6:-$URL}"

SRCDIR="src/content/sources"
RAWDIR="sources/raw"
PROG=".kir-intake-progress.tsv"
TMP="$(mktemp -d /tmp/kir-audio.XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$RAWDIR" "$SRCDIR"

slugify(){ echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E "s/[’']//g; s/[^a-z0-9]+/-/g; s/^-+//; s/-+\$//"; }
now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }

TS=$(slugify "$TITLE" | cut -c1-45 | sed -E 's/-+$//')
SLUG="${DATE}-$(slugify "$SHOW")-${TS}"
OUT="$SRCDIR/${SLUG}.md"
VID="aud$(printf '%s' "$URL" | md5 | cut -c1-9)"

if [ -e "$OUT" ]; then echo "[SKIP] $OUT already exists"; exit 0; fi
if grep -rlq "\"$VID\"" "$SRCDIR"/*.md 2>/dev/null; then echo "[DUP] $VID already in corpus"; exit 0; fi

echo "[fetch] $URL"
curl -sL --max-time 1200 -A "Mozilla/5.0" -o "$TMP/ep.audio" "$URL" || { echo "[FAIL] curl"; exit 1; }
[ -s "$TMP/ep.audio" ] || { echo "[FAIL] empty download"; exit 1; }
echo "[fetch] $(du -h "$TMP/ep.audio" | cut -f1)"

echo "[whisper] $SLUG"
python3 tools/whisper2vtt.py "$TMP/ep.audio" "$TMP/ep.en.vtt" || { echo "[FAIL] whisper"; exit 1; }

RAW="$RAWDIR/${DATE//-/}-${VID}.en.vtt"
cp "$TMP/ep.en.vtt" "$RAW"

node tools/normalize-vtt.mjs "$RAW" "$OUT" \
  --meta slug="$SLUG" --meta title="$TITLE" --meta show="$SHOW" \
  --meta date="$DATE" --meta url="$PAGE" --meta videoId="$VID" \
  --meta duration="${MIN}:00" || { echo "[FAIL] normalize"; exit 1; }

printf '%s\tdone\t%s\t%s\n' "$URL" "$OUT" "$(now)" >> "$PROG"
echo "[DONE] $OUT"
