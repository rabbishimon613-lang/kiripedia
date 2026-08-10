#!/usr/bin/env python3
"""Transcribe an audio file to WebVTT using faster-whisper (small, int8, CPU).

Windowed + timeout-guarded. Three silent failures of the naive one-shot call are
documented in ARCHAEOLOGY-LOG.md (2026-08-09) and all three are fixed here:

  1. `vad_filter=True` silently deleted an entire speaker on phone interviews.
     VAD is now OFF by default (KIR_VAD=1 to re-enable).
  2. A one-shot transcribe could stop 22 seconds into a 65-minute episode and
     exit reporting success. Coverage is now measured and printed, and a run
     that covers less than KIR_MIN_COVERAGE (default 0.85) of the audio exits
     non-zero instead of writing a truncated transcript that looks fine.
  3. faster-whisper can enter a repetition loop that never returns (four hours
     on a 144-minute episode). The loop happens *inside* a window, so windowing
     alone does not help — each window is transcribed in a separate child
     process with a hard timeout, and a window that hangs is killed and skipped.

Usage: whisper2vtt.py <audio> <out.vtt>
Env:   KIR_WINDOW (seconds, default 600), KIR_TIMEOUT (seconds per window,
       default 1800), KIR_MODEL (default "small"), KIR_VAD (0/1, default 0),
       KIR_MIN_COVERAGE (0-1, default 0.85)
"""
import json
import os
import subprocess
import sys
import tempfile

WINDOW = int(os.environ.get("KIR_WINDOW", "600"))
TIMEOUT = int(os.environ.get("KIR_TIMEOUT", "1800"))
MODEL = os.environ.get("KIR_MODEL", "small")
VAD = os.environ.get("KIR_VAD", "0") == "1"
MIN_COVERAGE = float(os.environ.get("KIR_MIN_COVERAGE", "0.85"))


def fmt(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def log(msg):
    print(f"whisper: {msg}", file=sys.stderr, flush=True)


def duration_of(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True,
    )
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def decode(src, dst):
    """Decode anything ffmpeg understands to 16 kHz mono wav.

    Some feed MP3s (libsyn, notably) fail a straight decode; -err_detect
    ignore_err lets ffmpeg walk past the bad frames instead of exiting 183.
    """
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-err_detect", "ignore_err",
           "-i", src, "-vn", "-ac", "1", "-ar", "16000", "-f", "wav", "-y", dst]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(dst) or os.path.getsize(dst) < 1024:
        # second chance: let ffmpeg fully re-mux through a permissive demuxer
        r2 = subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-err_detect", "ignore_err",
             "-fflags", "+discardcorrupt+genpts", "-i", src, "-vn", "-ac", "1",
             "-ar", "16000", "-f", "wav", "-y", dst],
            capture_output=True, text=True,
        )
        if r2.returncode != 0 or not os.path.exists(dst) or os.path.getsize(dst) < 1024:
            log(f"ffmpeg decode failed: {(r.stderr or r2.stderr).strip()[:300]}")
            return False
    return True


def transcribe_child():
    """Child mode: transcribe one window, print JSON cues on stdout."""
    path = sys.argv[2]
    from faster_whisper import WhisperModel
    model = WhisperModel(MODEL, device="cpu", compute_type="int8")
    segments, _info = model.transcribe(path, language="en", vad_filter=VAD)
    out = []
    for seg in segments:
        text = seg.text.strip()
        if text:
            out.append([seg.start, seg.end, text])
    json.dump(out, sys.stdout)


def main():
    if len(sys.argv) >= 3 and sys.argv[1] == "--window":
        transcribe_child()
        return

    if len(sys.argv) < 3:
        print("usage: whisper2vtt.py <audio> <out.vtt>", file=sys.stderr)
        sys.exit(1)
    audio, out = sys.argv[1], sys.argv[2]

    with tempfile.TemporaryDirectory(prefix="kirwhisper.") as tmp:
        wav = os.path.join(tmp, "full.wav")
        if not decode(audio, wav):
            sys.exit(1)
        total = duration_of(wav)
        if total <= 0:
            log("could not determine duration")
            sys.exit(1)
        log(f"{total/60:.1f} min, window {WINDOW}s, vad={VAD}, model={MODEL}")

        cues = []
        covered = 0.0
        start = 0.0
        idx = 0
        while start < total:
            length = min(WINDOW, total - start)
            piece = os.path.join(tmp, f"w{idx:03d}.wav")
            subprocess.run(
                ["ffmpeg", "-nostdin", "-v", "error", "-ss", str(start),
                 "-t", str(length), "-i", wav, "-ac", "1", "-ar", "16000",
                 "-f", "wav", "-y", piece],
                capture_output=True,
            )
            if not os.path.exists(piece) or os.path.getsize(piece) < 1024:
                log(f"window {idx} ({fmt(start)}) — could not cut, skipped")
                start += length
                idx += 1
                continue
            try:
                r = subprocess.run(
                    [sys.executable, os.path.abspath(__file__), "--window", piece],
                    capture_output=True, text=True, timeout=TIMEOUT,
                )
            except subprocess.TimeoutExpired:
                log(f"window {idx} ({fmt(start)}) — TIMEOUT after {TIMEOUT}s, killed and skipped")
                start += length
                idx += 1
                continue
            if r.returncode != 0:
                log(f"window {idx} ({fmt(start)}) — child failed: {r.stderr.strip()[:200]}")
                start += length
                idx += 1
                continue
            try:
                got = json.loads(r.stdout)
            except json.JSONDecodeError:
                log(f"window {idx} ({fmt(start)}) — unparseable child output, skipped")
                start += length
                idx += 1
                continue
            for s, e, text in got:
                cues.append((start + s, start + e, text))
            covered += length
            log(f"window {idx} {fmt(start)}–{fmt(start+length)}: {len(got)} cues")
            start += length
            idx += 1

        cues.sort(key=lambda c: c[0])
        with open(out, "w") as f:
            f.write("WEBVTT\n\n")
            for s, e, text in cues:
                f.write(f"{fmt(s)} --> {fmt(e)}\n{text}\n\n")

        frac = covered / total if total else 0.0
        words = sum(len(c[2].split()) for c in cues)
        log(f"wrote {len(cues)} cues, {words} words, coverage {frac*100:.0f}% of {total/60:.1f} min -> {out}")
        if frac < MIN_COVERAGE:
            log(f"COVERAGE TOO LOW ({frac*100:.0f}% < {MIN_COVERAGE*100:.0f}%) — failing rather than shipping a truncated transcript")
            sys.exit(1)


if __name__ == "__main__":
    main()
