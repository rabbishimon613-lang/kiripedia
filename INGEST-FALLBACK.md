# KiriPedia Caption Acquisition — Tiered Fallback Chain

*Companion to INGEST.md and YT-ACQUISITION.md. Specifies what the Scribe worker does when YouTube auto-captions are absent or low-quality.*

---

## The ladder

| Tier | Method | Expected hit rate | Notes |
|------|--------|-------------------|-------|
| 1 | yt-dlp auto-CC (`en-orig` then `en`) | ~65–70% | Primary path. `en-orig` preferred — original-language track avoids re-translation artifacts. |
| 2 | yt-dlp manual/uploader subs (`--write-sub`) | +5–8% | Uploader-provided captions. Usually cleaner than auto-CC but less common on podcast-style content. |
| 3 | faster-whisper `base.en` (int8) | +20% | Local CPU transcription. Runs at ~1.5–2× realtime on 2 vCPU. A 2hr podcast ≈ 60–80 min. Only for `triaged_on` clips (not speculative crawl). |
| 4 | Podcast Index RSS audio enclosure | +5–10% | YouTube-free parallel path via `podcastindex.org`. Same `recording_id` table; add `source_type` enum. |
| 5 | Quarantine | <2% | True loss. |

End-to-end coverage at design point: **~98%**.

---

## Tier-by-tier decision logic

### Tier 1 — yt-dlp auto-CC

```bash
# Try en-orig first (avoids re-translation)
yt-dlp --write-auto-sub --sub-lang en-orig --skip-download \
  --output "sources/raw/%(upload_date)s-%(id)s.%(ext)s" \
  --cookies /tmp/cookies.txt \
  --extractor-args "youtube:player_client=default,mweb;skip=hls,dash" \
  --sleep-requests 2 --sleep-interval 3 --max-sleep-interval 6 \
  "<url>"

# Fall through to en if en-orig absent
yt-dlp --write-auto-sub --sub-lang en --skip-download \
  --output "sources/raw/%(upload_date)s-%(id)s.%(ext)s" \
  "<url>"
```

Success condition: a `.en-orig.vtt` or `.en.vtt` file lands in `sources/raw/` and has non-zero size (>2 KB).

Failure indicators (do not quarantine yet — fall to Tier 2):
- Exit code non-zero with message containing `Sign in to confirm`, `HTTP Error 403`, `Unable to extract`
- File produced but <2 KB (empty or header-only VTT)
- File absent after command exits 0 (silent failure — check with `ls`)

---

### Tier 2 — Uploader manual subs

```bash
yt-dlp --write-sub --sub-lang en --skip-download \
  --output "sources/raw/%(upload_date)s-%(id)s.%(ext)s" \
  "<url>"
```

This downloads the uploader-provided track if one exists. Some podcasts (Tucker Carlson, Dr. Phil) provide manually-authored captions — these are often higher quality than auto-CC.

Success condition: `.en.vtt` > 2 KB lands.

---

### Tier 3 — faster-whisper local transcription

Only invoked for `triaged_on` clips (clips the Scribe worker has been told to process). Not run speculatively during crawl.

**Stack:** `faster-whisper` (CTranslate2 backend), model `base.en`, `int8` quantization. VAD pre-segmentation via `silero-vad` to skip silence.

```python
from faster_whisper import WhisperModel
model = WhisperModel("base.en", device="cpu", compute_type="int8")
segments, info = model.transcribe(audio_path, vad_filter=True, language="en")
```

**Quality gate — reject the transcript if any of:**
- Character error rate vs. dictionary >12% (`pyspellchecker` on 500-word sample)
- Mean segment confidence <−1.0 (`avg_logprob`)
- >15% segments with `no_speech_prob >0.6`
- <40 words/minute sustained over 5 minutes

First quality-gate failure → retry with `small.en` (3–4× slower, use only for flagged clips). Second failure → quarantine.

**Audio acquisition for Tier 3:**
```bash
yt-dlp -x --audio-format wav --audio-quality 0 \
  --output "/tmp/%(id)s.%(ext)s" "<url>"
```

**VTT output:** Convert faster-whisper segments to VTT format before saving to `sources/raw/`. Set `captionSource: whisper-base-en` (or `whisper-small-en`) in the normalized source frontmatter.

---

### Tier 4 — Podcast Index RSS audio

Parallel path, not a fallback of Tier 3. Use when the video is not on YouTube at all (RT content, deleted videos, Rumble/Odysee reposts).

```bash
# Search by person
curl "https://api.podcastindex.org/api/1.0/search/byperson?q=John+Kiriakou" \
  -H "User-Agent: KiriPedia/1.0" \
  -H "X-Auth-Key: $PODCAST_INDEX_API_KEY" \
  -H "X-Auth-Date: $(date -u +%s)"
```

The response includes RSS feed URLs and audio enclosure URLs. Download the audio enclosure and run through the same Tier 3 faster-whisper pipeline.

**Key field:** `source_type: podcast_rss` in the normalized source frontmatter. No `videoId`; use the audio URL or RSS GUID as the canonical ID.

---

### Tier 5 — Quarantine

A clip goes to quarantine when all four tiers have failed, or when the quality gate fails twice. The quarantine record in the DB stores:

```json
{
  "video_id": "XYZ",
  "reason_code": "all-tiers-failed | quality-gate | no-audio",
  "reason_detail": "<error message>",
  "attempted_tiers": [1, 2, 3],
  "quarantined_at": "2026-06-23T..."
}
```

Quarantine is not permanent. When a new fallback tier is added (e.g., a community-contributed manual transcript), the quarantine list is the re-queue.

---

## Scribe worker integration

The current `botnet/workers/scribe.mjs` implements only **Tier 1** (yt-dlp auto-CC, `en` lang only). Gaps vs. this spec:

| Spec requirement | Current state |
|---|---|
| Try `en-orig` before `en` | Not implemented — always uses `en` |
| Tier 2 manual subs fallback | Not implemented |
| Tier 3 faster-whisper | Not implemented |
| Tier 4 Podcast Index | Not implemented |
| Quality gate | Not implemented |
| `captionSource` reflects actual tier used | Not implemented — always writes `auto` |

**Minimum patch for near-term reliability:** add `en-orig` preference and Tier 2 manual subs fallback. Both are pure yt-dlp flags with no new dependencies.

```js
// In scribeOne(), replace the single yt-dlp call with:
const captionAttempts = [
  `--write-auto-sub --sub-lang en-orig`,
  `--write-auto-sub --sub-lang en`,
  `--write-sub --sub-lang en`,
];
let vttPath = null;
let captionTier = null;
for (let i = 0; i < captionAttempts.length; i++) {
  execSync(`yt-dlp ${captionAttempts[i]} --skip-download \
    --output "${join(RAW_DIR, rawStem)}.%(ext)s" "${clip.url}"`, ...);
  const candidate = existsSync(rawOrig) ? rawOrig : existsSync(rawVtt) ? rawVtt : null;
  if (candidate) { vttPath = candidate; captionTier = i + 1; break; }
}
```

---

## Raw VTT naming convention (mandatory)

All VTTs must land in `sources/raw/` with the canonical name:

```
YYYYMMDD-<videoId>.en[-orig].vtt
```

- `YYYYMMDD` = upload date from yt-dlp metadata (`%(upload_date)s`)
- `<videoId>` = YouTube 11-char ID
- `.en-orig` = original-language YouTube auto track
- `.en` = translated/re-synced or uploader-provided English track

This convention is what `audit-provenance.mjs` uses to verify raw ↔ normalized parity. Non-conforming filenames (e.g., `caps_XYZ.en.vtt`, `captions.en.vtt`) break the audit and should be renamed on intake.

---

## WhisperX diarization

Use **WhisperX** (not vanilla faster-whisper) only when all three are true:

1. The episode has multiple speakers of similar gender/accent whose voices are hard to distinguish (common on politically-oriented roundtable shows)
2. The show is `triaged_on` (not speculative)
3. The Scribe has fallen to Tier 3 (auto-CC unavailable)

WhisperX adds speaker diarization via pyannote.audio. It requires a HuggingFace token (free, one-time) and adds ~50% wall-clock overhead vs. plain faster-whisper.

**Output:** speaker-tagged VTT with `[SPEAKER_00]`, `[SPEAKER_01]` prefixes on each segment. During normalization, these become paragraph-level speaker tags, preserving the identity of Kiriakou's voice as `[JK]` once the user identifies him by sample.

**Do not use WhisperX for:**
- Single-host podcast episodes (John is always the only guest)
- Auto-CC success cases (diarization is redundant if YouTube gave you clean captions)
- Speculative crawl (cost too high per-clip)
