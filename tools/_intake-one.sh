#!/usr/bin/env bash
# Fetch YouTube auto-captions for one video and normalize into a KiriPedia source.
# Usage: _intake-one.sh <videoId> <slug> <show> <date> <title> <duration>
# Writes src/content/sources/<slug>.md  (+ .sponsors.md sidecar if any)
set -euo pipefail

VID="$1"; SLUG="$2"; SHOW="$3"; DATE="$4"; TITLE="$5"; DUR="${6:-}"
CAPDIR="/private/tmp/claude-502/-Volumes-EOS-DIGITAL/97d89401-0314-4b74-807f-7faf3234ddc4/scratchpad/caps"
mkdir -p "$CAPDIR"
OUT="src/content/sources/${SLUG}.md"

if [ -f "$OUT" ]; then echo "SKIP exists: $SLUG"; exit 0; fi

VTT="${CAPDIR}/caps_${VID}.en.vtt"
if [ ! -f "$VTT" ]; then
  yt-dlp --extractor-args "youtube:player_client=android_vr" --no-warnings \
    --skip-download --write-auto-subs --sub-lang en --sub-format vtt \
    -o "${CAPDIR}/caps_${VID}.%(ext)s" "https://www.youtube.com/watch?v=${VID}" \
    >/dev/null 2>&1 || { echo "NOCAPS $VID $SLUG"; exit 2; }
fi
if [ ! -f "$VTT" ]; then echo "NOCAPS $VID $SLUG"; exit 2; fi

node tools/normalize-vtt.mjs "$VTT" "$OUT" \
  --meta slug="$SLUG" --meta title="$TITLE" --meta show="$SHOW" \
  --meta date="$DATE" --meta url="https://www.youtube.com/watch?v=${VID}" \
  --meta videoId="$VID" --meta duration="$DUR" >/dev/null
echo "OK $SLUG"
