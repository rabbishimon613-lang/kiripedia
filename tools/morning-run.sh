#!/usr/bin/env bash
# KiriPedia morning intake — mechanical half. Discovery → captions → normalized sources.
#
# Deliberately does NOT write articles, commit, or deploy: the routine agent does that once,
# at the end, after it has read the new transcripts. See MORNING-ROUTINE.md.
#
# Usage: bash tools/morning-run.sh [--since YYYYMMDD] [--limit N] [--min-minutes M]
#
# Exit code is always 0 on a completed sweep, including "found nothing" — a quiet morning is
# not a failure. Non-zero only if the repo isn't where we think it is.
set -u
cd "$(dirname "$0")/.." || exit 1

LIMIT=40
MIN_MINUTES=45
SINCE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --since) SINCE="$2"; shift 2 ;;
    --limit) LIMIT="$2"; shift 2 ;;
    --min-minutes) MIN_MINUTES="$2"; shift 2 ;;
    *) echo "unknown arg: $1"; exit 1 ;;
  esac
done

RUNDIR=".kir-morning"
mkdir -p "$RUNDIR"
STAMP=$(date +%Y-%m-%d)
WORKLIST="$RUNDIR/worklist-$STAMP.tsv"
MANIFEST="$RUNDIR/new-sources-$STAMP.txt"
LOG="$RUNDIR/run-$STAMP.log"

wordcount(){ cat src/content/articles/*.mdx 2>/dev/null | wc -w | tr -d ' '; }
# Real transcripts only — churn.sh drops a "<slug>.sponsors.md" sidecar next to each source
# holding the stripped ad paragraphs. Those are not sources and must never reach the manifest.
list_sources(){ ls src/content/sources/*.md 2>/dev/null | grep -v '\.sponsors\.md$'; }

{
echo "=== KiriPedia morning run $STAMP $(date +%H:%M) ==="
echo "branch: $(git branch --show-current)"
WORDS_BEFORE=$(wordcount)
SRC_BEFORE=$(list_sources | wc -l | tr -d ' ')
echo "before: $SRC_BEFORE sources, $WORDS_BEFORE article words"
echo "$WORDS_BEFORE" > "$RUNDIR/words-before-$STAMP.txt"

# Snapshot existing sources so we can diff for what's genuinely new this morning.
list_sources | sort > "$RUNDIR/.sources-before"

# ---- 1. Discovery -----------------------------------------------------------
echo
echo "--- discovery ---"
SINCE_ARG=""
[ -n "$SINCE" ] && SINCE_ARG="--since $SINCE"
node tools/find-new-kiriakou-videos.mjs \
  --limit "$LIMIT" --min-minutes "$MIN_MINUTES" $SINCE_ARG \
  --tsv "$WORKLIST" 2>&1 || echo "[warn] discovery errored; continuing with whatever it wrote"

CANDS=0
[ -f "$WORKLIST" ] && CANDS=$(( $(wc -l < "$WORKLIST") - 1 ))
[ "$CANDS" -lt 0 ] && CANDS=0
echo "candidates: $CANDS"

# ---- 2. Captions + normalize ------------------------------------------------
# DEFER_WHISPER=1: caption-less videos go to .kir-whisper-queue.tsv for the separate audio
# routine instead of stalling the morning behind a 60-minute transcription.
# PUSH=0 + X=9999: no commits, no pushes — the agent owns the single commit and single deploy.
if [ "$CANDS" -gt 0 ]; then
  echo
  echo "--- fetch + normalize ---"
  WORK="$WORKLIST" DEFER_WHISPER=1 PUSH=0 X=9999 bash tools/churn.sh youtube 2>&1 \
    || echo "[warn] churn exited non-zero; keeping whatever it produced"
fi

# ---- 3. Manifest of new sources --------------------------------------------
list_sources | sort > "$RUNDIR/.sources-after"
comm -13 "$RUNDIR/.sources-before" "$RUNDIR/.sources-after" > "$MANIFEST"
NEW=$(wc -l < "$MANIFEST" | tr -d ' ')

# ---- 4. Carry-over: transcripts nobody ever wrote from ----------------------
# A source can land mechanically and then never get mined (interrupted run, crash, a morning
# that ran out of road). Those transcripts are pure unwritten words sitting on disk, so the
# manifest picks up the 5 most recent uncited ones too. Bounded at 5 so day one doesn't
# inherit a hundred-item backlog.
CITED="$RUNDIR/.cited-slugs"
grep -oh 'Cite s="[^"]*"' src/content/articles/*.mdx 2>/dev/null \
  | sed -E 's/Cite s="([^"]*)"/\1/' | sort -u > "$CITED"
CARRY=0
while read -r f; do
  slug=$(basename "$f" .md)
  grep -qxF "$slug" "$CITED" && continue
  grep -qxF "$f" "$MANIFEST" && continue
  echo "$f" >> "$MANIFEST"
  CARRY=$((CARRY+1))
  [ "$CARRY" -ge 5 ] && break
done < <(list_sources | sort -r)
[ "$CARRY" -gt 0 ] && echo "carry-over (fetched earlier, never written from): $CARRY"

echo
echo "--- result ---"
echo "new sources: $NEW (+ $CARRY carry-over)"
[ -s "$MANIFEST" ] && cat "$MANIFEST"
DEFERRED=$(wc -l < .kir-whisper-queue.tsv 2>/dev/null | tr -d ' ' || echo 0)
echo "whisper queue depth (for the audio routine): $DEFERRED"
echo "manifest: $MANIFEST"
echo "=== mechanical half done $(date +%H:%M) ==="
} 2>&1 | tee "$LOG"

exit 0
