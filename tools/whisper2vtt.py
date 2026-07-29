#!/usr/bin/env python3
"""Transcribe an audio file to WebVTT using faster-whisper (small, int8, CPU)."""
import sys
from faster_whisper import WhisperModel


def fmt(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def main():
    if len(sys.argv) < 3:
        print("usage: whisper2vtt.py <audio> <out.vtt>", file=sys.stderr)
        sys.exit(1)
    audio, out = sys.argv[1], sys.argv[2]
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio, language="en", vad_filter=True)
    with open(out, "w") as f:
        f.write("WEBVTT\n\n")
        n = 0
        for seg in segments:
            text = seg.text.strip()
            if not text:
                continue
            f.write(f"{fmt(seg.start)} --> {fmt(seg.end)}\n{text}\n\n")
            n += 1
    print(f"whisper: wrote {n} cues to {out}", file=sys.stderr)


if __name__ == "__main__":
    main()
