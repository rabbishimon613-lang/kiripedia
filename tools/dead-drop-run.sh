#!/usr/bin/env bash
# Dead Drop intake — Kiriakou's own narrative podcast, audio-only.
#
# Why this exists as its own lane rather than a churn.sh worklist: every episode of a podcast
# shares one feed URL, and churn.sh dedups on the worklist target, so a multi-episode feed run
# processes the first row and silently skips the rest. Here the *episode enclosure* is the key.
#
# The morning routine is YouTube-captions-only by charter, so it structurally cannot see this
# show. Dead Drop publishes Mondays. Run this weekly, or whenever the corpus looks behind.
#
# There are no captions — every episode is whisper-transcribed on CPU, so budget roughly
# real-time-ish per episode. Nothing is committed or deployed; that stays manual.
#
# Usage: bash tools/dead-drop-run.sh [--limit N] [--dry-run]
set -u
cd "$(dirname "$0")/.." || exit 1

FEED="https://feeds.acast.com/public/shows/68e695c6d798804c9e4bbd13"
SHOW="John Kiriakou's Dead Drop"
SLUG_SHOW="dead-drop"
SRCDIR="src/content/sources"
RAWDIR="sources/raw"
PROG=".kir-intake-progress.tsv"
TMP="${TMPDIR:-/tmp}/kir-deaddrop"
LIMIT=99
DRY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --limit) LIMIT="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    *) echo "unknown arg: $1"; exit 1 ;;
  esac
done
mkdir -p "$TMP" "$RAWDIR"
touch "$PROG"

# ---- 1. Feed → missing episodes --------------------------------------------
# Dedup is by enclosure URL against the corpus's `url:` frontmatter, which is the only stable
# identity an acast episode has: titles get edited after publication, and pubDate can shift.
python3 - "$FEED" "$SRCDIR" > "$TMP/missing.tsv" <<'PY'
import re, subprocess, sys, xml.etree.ElementTree as ET
from pathlib import Path

feed, srcdir = sys.argv[1], sys.argv[2]
xml = subprocess.run(["curl", "-sL", "--max-time", "60", "-A", "Mozilla/5.0", feed],
                     capture_output=True).stdout
root = ET.fromstring(xml)

have = set()
for f in Path(srcdir).glob("*.md"):
    m = re.search(r'^url:\s*"([^"]+)"', f.read_text(encoding="utf8", errors="ignore")[:800], re.M)
    if m:
        have.add(m.group(1).split("?")[0])

MONTHS = dict(zip("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(),
                  [f"{i:02d}" for i in range(1, 13)]))

for item in root.findall(".//item"):
    enc = item.find("enclosure")
    if enc is None:
        continue
    url = enc.get("url", "").split("?")[0]
    if not url or url in have:
        continue
    title = (item.findtext("title") or "").strip()
    pub = item.findtext("pubDate") or ""
    m = re.search(r"(\d{1,2})\s+(\w{3})\s+(\d{4})", pub)
    date = f"{m.group(3)}-{MONTHS.get(m.group(2), '01')}-{int(m.group(1)):02d}" if m else "undated"
    dur = (item.findtext("{http://www.itunes.com/dtds/podcast-1.0.dtd}duration") or "").strip()
    print("\t".join([date, url, dur, title]))
PY

COUNT=$(wc -l < "$TMP/missing.tsv" | tr -d ' ')
echo "feed has $COUNT episode(s) not in the corpus"
[ "$COUNT" = 0 ] && exit 0
cut -f1,4 "$TMP/missing.tsv" | sed 's/^/  /'
if [ "$DRY" = 1 ]; then echo "(dry run — nothing fetched)"; exit 0; fi

# ---- 2. Fetch → whisper → normalize ----------------------------------------
slugify(){ echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'; }
now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }

n=0
while IFS=$'\t' read -r date url dur title; do
  [ -n "$url" ] || continue
  n=$((n+1)); [ "$n" -gt "$LIMIT" ] && break
  echo
  echo "--- [$n/$COUNT] $date  $title"

  slug="${date}-${SLUG_SHOW}-$(slugify "$title" | cut -c1-45 | sed -E 's/-+$//')"
  out="$SRCDIR/${slug}.md"
  if [ -e "$out" ]; then echo "[SKIP] $out already exists"; continue; fi

  rm -f "$TMP/ep.mp3" "$TMP/ep.vtt"
  if ! curl -sL --max-time 1800 -A "Mozilla/5.0" -o "$TMP/ep.mp3" "$url" || [ ! -s "$TMP/ep.mp3" ]; then
    echo "[FAIL] download"; printf '%s\tfailed\t-\t%s\n' "$url" "$(now)" >> "$PROG"; continue
  fi
  echo "    transcribing $(du -h "$TMP/ep.mp3" | cut -f1)..."
  if ! python3 tools/whisper2vtt.py "$TMP/ep.mp3" "$TMP/ep.vtt" 2>"$TMP/whisper.err" || [ ! -s "$TMP/ep.vtt" ]; then
    echo "[FAIL] whisper (see $TMP/whisper.err)"; printf '%s\tfailed\t-\t%s\n' "$url" "$(now)" >> "$PROG"; continue
  fi

  raw="$RAWDIR/${slug}.vtt"
  cp "$TMP/ep.vtt" "$raw"
  if node tools/normalize-vtt.mjs "$raw" "$out" \
      --meta slug="$slug" --meta title="$title" --meta show="$SHOW" \
      --meta date="$date" --meta url="$url" --meta videoId="$slug" \
      --meta duration="${dur:-0:00}" >/dev/null 2>"$TMP/normalize.err" && [ -s "$out" ]; then
    printf '%s\tdone\t%s\t%s\n' "$url" "$out" "$(now)" >> "$PROG"
    echo "[DONE] $out"
  else
    echo "[FAIL] normalize (see $TMP/normalize.err)"
    printf '%s\tfailed\t-\t%s\n' "$url" "$(now)" >> "$PROG"
  fi
done < "$TMP/missing.tsv"

echo
echo "dead-drop run complete. Nothing committed — that's yours."
