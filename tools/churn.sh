#!/usr/bin/env bash
# KiriPedia video-intake churn driver.
# Usage: tools/churn.sh <type: youtube|url|audio>
# Mechanical ingest only: fetch -> normalize -> ad-strip (via normalize-vtt.mjs) -> progress.
# Idempotent + resumable via .kir-intake-progress.tsv and corpus videoId dedup.
set -u
cd "$(dirname "$0")/.." || exit 1

TYPE_FILTER="${1:?usage: churn.sh <youtube|url|audio>}"
X="${X:-25}"
# BRANCH/PUSH are overridable so an orchestrated run (e.g. the 7am routine) can own its own
# single commit + single deploy instead of having the driver push mid-run. PUSH=0 → fetch and
# normalize only; leave the tree dirty for the caller to commit.
BRANCH="${BRANCH:-kiriakou-intake-churn}"
PUSH="${PUSH:-1}"
WORK="${WORK:-.kir-worklist.tsv}"
PROG=".kir-intake-progress.tsv"
FAIL=".kir-intake-failures.log"
RAWDIR="sources/raw"
SRCDIR="src/content/sources"
WQUEUE=".kir-whisper-queue.tsv"
TMP="/private/tmp/claude-502/-Volumes-EOS-DIGITAL/e1bb8236-b780-4f49-828b-421f942f6bba/scratchpad/churn-${TYPE_FILTER}"
mkdir -p "$TMP" "$RAWDIR"
touch "$PROG" "$FAIL" "$WQUEUE"

YTARGS='youtube:player_client=android_vr'
now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
slugify(){ echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'; }

# --- dedup helpers ---
already_logged(){ grep -qF -- "$1"$'\t' "$PROG"; }     # target already in progress
corpus_has(){ grep -rlq "\"$1\"" "$SRCDIR"/*.md 2>/dev/null; }  # videoId in corpus
corpus_has_file(){ grep -rl "\"$1\"" "$SRCDIR"/*.md 2>/dev/null | head -1; }
queued(){ grep -qF -- "$1"$'\t' "$WQUEUE" 2>/dev/null; }   # deferred to whisper queue

commit_count=0
success_total=$(grep -cP '\tdone\t' "$PROG" 2>/dev/null || echo 0)

checkpoint(){
  if [ "$PUSH" != 1 ]; then echo "[checkpoint] PUSH=0 — leaving $1 sources uncommitted"; return 0; fi
  git add "$SRCDIR" "$RAWDIR" "$PROG" 2>/dev/null
  git commit -q -m "intake churn: +$1 sources (running total $success_total)" 2>&1 | tail -1
  git push -q -u origin "$BRANCH" 2>&1 | tail -2
  echo "[checkpoint] pushed at total $success_total"
}

fail_item(){ # target reason
  printf '%s\tfailed\t-\t%s\n' "$1" "$(now)" >> "$PROG"
  printf '[%s] %s :: %s\n' "$(now)" "$1" "$2" >> "$FAIL"
  echo "[FAIL] $1 :: $2"
}

done_item(){ # target sourcefile
  printf '%s\tdone\t%s\t%s\n' "$1" "$2" "$(now)" >> "$PROG"
  success_total=$((success_total+1))
  commit_count=$((commit_count+1))
  echo "[DONE $success_total] $1 -> $2"
  if [ "$commit_count" -ge "$X" ]; then checkpoint "$commit_count"; commit_count=0; fi
}

# build output slug, guarding collisions
make_out(){ # date show title vid  -> echoes "slug|outpath"
  local d="$1" show="$2" title="$3" vid="$4"
  local ss ts tr slug out
  ss=$(slugify "$show")
  tr=$(echo "$title" | sed -E 's/^#?[0-9]+[[:space:]]*[—–-]*[[:space:]]*//')
  ts=$(slugify "$tr" | cut -c1-45 | sed -E 's/-+$//')
  slug="${d}-${ss}-${ts}"
  slug=$(echo "$slug" | sed -E 's/-+/-/g; s/^-+//; s/-+$//')
  out="$SRCDIR/${slug}.md"
  if [ -e "$out" ]; then slug="${slug}-${vid:0:6}"; out="$SRCDIR/${slug}.md"; fi
  echo "${slug}|${out}"
}

# ---- fetch captions; sets VTT, UPDATE_DATE, VID. rc: 0 ok / 1 no-en-subs / 2 rate-limited ----
# YouTube's android_vr client intermittently returns no subtitle file even when en captions
# exist, and occasionally 429s. So retry a few times before ever concluding "no captions" —
# false no-subs was sending captioned videos to the (slow) whisper path.
fetch_subs(){ # url
  local url="$1" rl=0 flaky=0 meta
  while :; do
    rm -f "$TMP"/dl.* 2>/dev/null
    : > "$TMP/subs.err"
    meta=$(yt-dlp --extractor-args "$YTARGS" --no-warnings --sleep-requests 1 \
        --write-auto-subs --sub-langs "en.*" --sub-format vtt --skip-download --no-simulate \
        --print "%(id)s|%(upload_date)s" -o "$TMP/dl.%(ext)s" "$url" 2>"$TMP/subs.err")
    VID=$(echo "$meta" | head -1 | cut -d'|' -f1)
    UPDATE_DATE=$(echo "$meta" | head -1 | cut -d'|' -f2)
    VTT=$(ls "$TMP"/dl.en.vtt "$TMP"/dl.en-*.vtt "$TMP"/dl.en*.vtt 2>/dev/null | head -1)
    cat "$TMP/subs.err" >> "$TMP/ytdlp.err"
    if [ -n "${VTT:-}" ] && [ -s "$VTT" ]; then return 0; fi
    if grep -qiE '429|too many requests|rate.?limit' "$TMP/subs.err"; then
      rl=$((rl+1)); [ "$rl" -ge 5 ] && return 2
      echo "[429] backoff $((rl*15))s (try $rl/5) $url"; sleep $((rl*15)); continue
    fi
    # no 429 but no VTT: likely a flaky android_vr fetch — retry a few times before giving up
    flaky=$((flaky+1)); [ "$flaky" -ge 3 ] && return 1
    echo "[retry-subs] no vtt (try $flaky/3) $url"; sleep 4; continue
  done
}

# ---- RSS path: resolve enclosure, curl mp3, whisper -> vtt; sets VTT, UPDATE_DATE, VID, SRCURL ----
fetch_rss_whisper(){ # feed_url title minutes
  local feed="$1" title="$2" mn="$3"
  rm -f "$TMP"/rss.* 2>/dev/null
  local pick mp3 pd
  pick=$(python3 tools/rss-pick.py "$feed" "$title" "$mn" 2>>"$TMP/rss.err") || return 1
  mp3=$(echo "$pick" | cut -f1); pd=$(echo "$pick" | cut -f2)
  [ -n "$mp3" ] || return 1
  SRCURL="$mp3"
  UPDATE_DATE=$(echo "$pd" | grep -qE '^[0-9]{8}$' && echo "$pd" || echo "")
  VID="rss$(printf '%s' "$mp3" | md5 2>/dev/null | cut -c1-8 || printf '%s' "$mp3" | md5sum | cut -c1-8)"
  curl -sL --max-time 900 -A "Mozilla/5.0" -o "$TMP/rss.mp3" "$mp3" || return 1
  [ -s "$TMP/rss.mp3" ] || return 1
  python3 tools/whisper2vtt.py "$TMP/rss.mp3" "$TMP/rss.en.vtt" 2>>"$TMP/whisper.err" || return 1
  VTT="$TMP/rss.en.vtt"; [ -s "$VTT" ]
}

# ---- fallback: download audio, whisper -> vtt; sets VTT, UPDATE_DATE, VID ----
fetch_audio_whisper(){ # url
  local url="$1"
  rm -f "$TMP"/au.* 2>/dev/null
  local meta
  meta=$(yt-dlp --no-warnings -x --audio-format mp3 --audio-quality 5 \
      --print "%(id)s|%(upload_date)s" --no-simulate \
      -o "$TMP/au.%(ext)s" "$url" 2>>"$TMP/ytdlp.err")
  VID=$(echo "$meta" | head -1 | cut -d'|' -f1)
  UPDATE_DATE=$(echo "$meta" | head -1 | cut -d'|' -f2)
  local mp3
  mp3=$(ls "$TMP"/au.mp3 2>/dev/null | head -1)
  [ -n "${mp3:-}" ] && [ -s "$mp3" ] || return 1
  python3 tools/whisper2vtt.py "$mp3" "$TMP/au.en.vtt" 2>>"$TMP/whisper.err" || return 1
  VTT="$TMP/au.en.vtt"
  [ -s "$VTT" ]
}

# ---------------- main loop ----------------
while IFS=$'\t' read -r type target minutes show title; do
  [ "$type" = "$TYPE_FILTER" ] || continue
  [ -n "$target" ] || continue
  if already_logged "$target"; then continue; fi
  if [ "${DEFER_WHISPER:-0}" = 1 ] && queued "$target"; then continue; fi

  # pre-dedup by target-as-videoId (youtube) against corpus
  if [ "$type" = "youtube" ] && corpus_has "$target"; then
    printf '%s\tdup\t%s\t%s\n' "$target" "$(corpus_has_file "$target" 2>/dev/null || echo -)" "$(now)" >> "$PROG"
    echo "[DUP] $target"; continue
  fi

  # resolve URL
  case "$type" in
    youtube) url="https://www.youtube.com/watch?v=${target}" ;;
    url|audio) url="$target" ;;
    *) fail_item "$target" "unknown type $type"; continue ;;
  esac

  # reject truncated/unfetchable URLs
  if printf '%s' "$url" | grep -q '…'; then fail_item "$target" "truncated URL in worklist"; continue; fi

  VID=""; UPDATE_DATE=""; VTT=""; SRCURL="$url"
  is_feed=0
  if printf '%s' "$url" | grep -qiE 'feeds?\.|/feed|\.rss|rss[0-9]?\.|/rss|simplecast|buzzsprout|captivate|megaphone|castos|libsyn|anchor\.fm|omny|podbean|acast|redcircle|spreaker|art19|substack|soundcloud|blubrry|amperwave|flightcast|studeo|fireside|sputnikglobe|itsrainmakingtime'; then is_feed=1; fi

  sleep 2   # throttle to avoid YouTube 429 rate-limiting
  if [ "$is_feed" = 1 ]; then
    if fetch_rss_whisper "$url" "${title:-}" "${minutes:-}"; then :; else
      fail_item "$target" "RSS enclosure resolve/whisper failed (see rss.err/whisper.err)"; continue; fi
  else
    fetch_subs "$url"; rc=$?
    if [ "$rc" = 0 ]; then :
    elif [ "$rc" = 2 ]; then
      fail_item "$target" "youtube 429 rate-limited after 5 retries"; sleep 60; continue
    else
      # no captions available for this item
      if [ "${DEFER_WHISPER:-0}" = 1 ] && [ "$type" = "youtube" ]; then
        # don't block the fast caption lane — shunt to the whisper queue for the slow tail
        if ! queued "$target"; then
          printf '%s\t%s\t%s\t%s\t%s\n' "$type" "$target" "${minutes:-}" "${show:-}" "${title:-}" >> "$WQUEUE"
        fi
        echo "[DEFER->whisper-queue] $target"; continue
      fi
      if fetch_audio_whisper "$url"; then :
      elif fetch_rss_whisper "$url" "${title:-}" "${minutes:-}"; then :
      else
        fail_item "$target" "no captions and audio/RSS fallback failed (see ytdlp.err/rss.err/whisper.err)"; continue
      fi
    fi
  fi

  [ -n "$VID" ] || VID="$target"
  # dedup by resolved videoId against corpus (covers url/audio path)
  if corpus_has "$VID"; then
    printf '%s\tdup\t-\t%s\n' "$target" "$(now)" >> "$PROG"; echo "[DUP resolved] $target ($VID)"; continue
  fi

  # date
  if printf '%s' "$UPDATE_DATE" | grep -qE '^[0-9]{8}$'; then
    d="${UPDATE_DATE:0:4}-${UPDATE_DATE:4:2}-${UPDATE_DATE:6:2}"
  else
    d="undated"
  fi

  IFS='|' read -r slug out < <(make_out "$d" "${show:-show}" "${title:-$VID}" "$VID")
  raw="$RAWDIR/${UPDATE_DATE:-00000000}-${VID}.en.vtt"
  cp "$VTT" "$raw"

  if [ "$type" = "youtube" ]; then urlmeta="https://youtu.be/${VID}"; else urlmeta="${SRCURL:-$url}"; fi
  if node tools/normalize-vtt.mjs "$raw" "$out" \
      --meta slug="$slug" --meta title="${title:-$VID}" --meta show="${show:-}" \
      --meta date="$d" --meta url="$urlmeta" --meta videoId="$VID" \
      --meta duration="${minutes:-0}:00" >/dev/null 2>>"$TMP/normalize.err"; then
    if [ -s "$out" ]; then done_item "$target" "$out"; else fail_item "$target" "normalize produced empty file"; fi
  else
    fail_item "$target" "normalize-vtt.mjs failed"
  fi
done < <(tail -n +2 "$WORK")

# final flush
if [ "$commit_count" -gt 0 ]; then checkpoint "$commit_count"; fi
echo "[churn:$TYPE_FILTER] loop complete."
