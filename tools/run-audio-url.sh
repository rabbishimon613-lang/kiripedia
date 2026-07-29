#!/usr/bin/env bash
# Chained tail runner: wait for the youtube churn to finish (avoid concurrent git),
# then run the audio churn, then the url churn, serially. Writes DONE markers.
cd "$(dirname "$0")/.." || exit 1
MARK="/private/tmp/claude-502/-Volumes-EOS-DIGITAL/e1bb8236-b780-4f49-828b-421f942f6bba/scratchpad"

echo "[tail-runner] waiting for youtube churn to finish..."
while pgrep -f 'churn.sh youtube' >/dev/null 2>&1; do sleep 10; done
echo "[tail-runner] youtube done; starting audio at $(date -u +%H:%M:%SZ)"

bash tools/churn.sh audio > "$MARK/churn-audio.log" 2>&1
echo "AUDIO_DONE" > "$MARK/audio.done"
echo "[tail-runner] audio done; starting url at $(date -u +%H:%M:%SZ)"

bash tools/churn.sh url > "$MARK/churn-url.log" 2>&1
echo "URL_DONE" > "$MARK/url.done"
echo "[tail-runner] url done; starting deferred whisper-queue at $(date -u +%H:%M:%SZ)"

# Transcribe the caption-less YouTube videos that were deferred during the fast pass.
# First DROP the low-value junk (clip compilations, audiobook/store samples, reaction cuts) —
# these are exactly what the playbook rejects and aren't worth transcription time. Keep the rest.
# churn.sh strips a header line (tail -n +2), so give the queue one. DEFER_WHISPER unset (=0) →
# kept items get whispered, not re-deferred.
if [ -s .kir-whisper-queue.tsv ]; then
  JUNK='funny moments|🤣|😂|shorts|compilation|reaction|best of|google play books|audible|audiobook|play books|preview|sample|highlights|teaser|trailer'
  now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  grep -iE "$JUNK" .kir-whisper-queue.tsv >> "$MARK/whisperq-skipped.log" 2>/dev/null
  grep -iE "$JUNK" .kir-whisper-queue.tsv | awk -F'\t' -v n="$now" '{printf "%s\tskipped\t-\t%s\n",$2,n}' >> .kir-intake-progress.tsv
  grep -ivE "$JUNK" .kir-whisper-queue.tsv > .kir-whisper-queue.kept.tsv || true
  if [ -s .kir-whisper-queue.kept.tsv ]; then
    { printf 'type\ttarget\tminutes\tshow\ttitle\n'; cat .kir-whisper-queue.kept.tsv; } > .kir-whisper-queue.worklist.tsv
    WORK=.kir-whisper-queue.worklist.tsv bash tools/churn.sh youtube > "$MARK/churn-whisperq.log" 2>&1
  fi
fi
echo "WHISPERQ_DONE" > "$MARK/whisperq.done"

echo "[tail-runner] ALL DONE at $(date -u +%H:%M:%SZ)"
echo "ALL_DONE" > "$MARK/tail.done"
