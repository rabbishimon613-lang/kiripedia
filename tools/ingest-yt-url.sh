#!/usr/bin/env bash
# Ingest one episode from any yt-dlp-supported page URL (SoundCloud, Rumble, Vimeo, …).
#
# ingest-audio-url.sh handles a DIRECT media URL. This is its sibling for pages where the
# media URL is signed/obfuscated and only yt-dlp can resolve it — SoundCloud in particular,
# whose stream URLs expire and which churn.sh misroutes to its RSS path.
#
# Usage: tools/ingest-yt-url.sh <page-url> <YYYY-MM-DD> <show> <title> [minutes]
set -u
cd "$(dirname "$0")/.." || exit 1

URL="${1:?page url}"; DATE="${2:?date}"; SHOW="${3:?show}"; TITLE="${4:?title}"; MIN="${5:-0}"

SRCDIR="src/content/sources"
RAWDIR="sources/raw"
PROG=".kir-intake-progress.tsv"
TMP="$(mktemp -d /tmp/kir-yt.XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$RAWDIR" "$SRCDIR"

slugify(){ echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E "s/[’']//g; s/[^a-z0-9]+/-/g; s/^-+//; s/-+\$//"; }
now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }

TS=$(slugify "$TITLE" | cut -c1-45 | sed -E 's/-+$//')
SLUG="${DATE}-$(slugify "$SHOW")-${TS}"
OUT="$SRCDIR/${SLUG}.md"
VID=$(yt-dlp --no-warnings --skip-download --print "%(extractor)s%(id)s" "$URL" 2>/dev/null | head -1)
[ -n "$VID" ] || VID="url$(printf '%s' "$URL" | md5 | cut -c1-9)"
VID=$(echo "$VID" | tr -cd '[:alnum:]_-' | cut -c1-24)

if [ -e "$OUT" ]; then echo "[SKIP] $OUT already exists"; exit 0; fi
if grep -rlq "\"$VID\"" "$SRCDIR"/*.md 2>/dev/null; then echo "[DUP] $VID already in corpus"; exit 0; fi

echo "[fetch] $URL"
yt-dlp --no-warnings -x --audio-format mp3 --audio-quality 5 -o "$TMP/ep.%(ext)s" "$URL" || { echo "[FAIL] yt-dlp"; exit 1; }
AUD=$(ls "$TMP"/ep.mp3 2>/dev/null | head -1)
[ -n "${AUD:-}" ] && [ -s "$AUD" ] || { echo "[FAIL] no audio downloaded"; exit 1; }
echo "[fetch] $(du -h "$AUD" | cut -f1)"

echo "[whisper] $SLUG"
python3 tools/whisper2vtt.py "$AUD" "$TMP/ep.en.vtt" || { echo "[FAIL] whisper"; exit 1; }

RAW="$RAWDIR/${DATE//-/}-${VID}.en.vtt"
cp "$TMP/ep.en.vtt" "$RAW"

node tools/normalize-vtt.mjs "$RAW" "$OUT" \
  --meta slug="$SLUG" --meta title="$TITLE" --meta show="$SHOW" \
  --meta date="$DATE" --meta url="$URL" --meta videoId="$VID" \
  --meta duration="${MIN}:00" || { echo "[FAIL] normalize"; exit 1; }

printf '%s\tdone\t%s\t%s\n' "$URL" "$OUT" "$(now)" >> "$PROG"
echo "[DONE] $OUT"
