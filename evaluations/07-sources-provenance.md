# Panel Evaluation — Expert #7: Sources & Provenance

*Domain: Audio/video supply chain — captions, fallbacks, fingerprinting, archive.org resilience, VTT archive integrity*
*Date: 2026-06-23*

---

## Executive Summary

- **The raw VTT archive is critically under-populated.** 59 normalized sources exist; only 18 (30%) have a raw VTT in `sources/raw/`. The other 40 sources were ingested against temporary files that were discarded — they cite real transcripts but the receipts are gone. This is the highest-priority provenance issue in the corpus today.
- **The Scribe worker's fallback chain is a stub.** It implements Tier 1 auto-CC (`--sub-lang en`) only. `en-orig` preference, manual subs, faster-whisper, and Podcast Index are all specified in `YT-ACQUISITION.md` but unbuilt. YT-ACQUISITION.md itself is a brainstorm doc, not code.
- **Deplatform risk is real and unmitigated.** RT content — Kiriakou's home for years post-2022 — is off YouTube. No archive.org diver exists. If any of the 35 raw-missing sources were from RT-adjacent channels, those transcripts are now unverifiable and potentially irreproducible.

---

## A. Provenance Health — Raw vs. Normalized Parity

### Findings

Tool built: `tools/audit-provenance.mjs` (run `node tools/audit-provenance.mjs`).

| Status | Count | Meaning |
|--------|-------|---------|
| BACKED | 18 | Normalized source has a raw VTT in `sources/raw/` |
| MISSING | 35 | No raw VTT on disk — provenance unverifiable |
| CODEX | 3 | Raw VTT exists but stranded in `"codex articles/"` staging dir |
| RAW-ONLY | 0 | No orphaned raw VTTs (good) |

**Coverage: 18/59 = 30.5%** of normalized sources are verifiably backed by an immutable raw VTT.

### Root cause

The 35 MISSING sources were ingested against temporary filenames (`caps_XYZ.en.vtt`, `captions.en.vtt`, `captions_dialogue.en.vtt`) in working directories outside `sources/raw/`. These temp files were not moved to the archive after normalization. The `source_file:` frontmatter field records the original temp filename, confirming the VTT existed at ingest time but was not preserved.

### CODEX cases (3 sources, 2 video IDs)

Three sources reference VTTs currently sitting in `"codex articles/"` subdirectories:
- `XwBMKwt14IU` — Tucker Carlson CIA torture / MK Ultra / 9-11 (2025-06-04)
- `mpYOPBtKvrk` — FFN Jeff Dornik / Swamp's Holy Mess (2026-05-19), two normalized files referencing the same VTT

These are recoverable without yt-dlp — just move the files:
```bash
cp "KiriPedia/codex articles/2025-06-04-tucker-carlson-cia-torture-mk-ultra-911-XwBMKwt14IU/captions.en.vtt" \
   "KiriPedia/sources/raw/20250604-XwBMKwt14IU.en.vtt"
cp "KiriPedia/codex articles/2026-05-19-ffn-jeff-dornik-swamps-holy-mess-mpYOPBtKvrk/captions.en.vtt" \
   "KiriPedia/sources/raw/20260519-mpYOPBtKvrk.en.vtt"
```

### Action to close the gap

For the 35 MISSING sources, re-download the raw VTTs:
```bash
# All 35 video IDs, run serially with rate limiting:
for VID in BDrLxPNedMo fBPY2lIgDjQ dfYnLqYEnfw d8paaOJyEaU PsnKclNopDU \
           mXSeAgvz3Yk VYOU2nBDfYA XIyrvsi1nTw rQD9soOOCf8 KJiQayzsB6Y \
           4qFZKC6Eaes yUNoJ32eLBc Jh0s0SBE7a0 lL3hLxeEA1E aXOks4MD-YI \
           Vdbi6wUsDV4 0IOQcOyTdPg UxFHq1qwbSo fGfCnX_ZpQ8 8QL0KvdzMzk \
           xurIn4RlhkM Dztm-FpDC0s 5Ulb8-Qox14 k1RTHWlQT1k Q6VUFJeNf1A \
           PfVLIxhuDHc Ary1gIbaOTc Fn-yCYLhjo0 4QAt4VKGxEY S3aYb4j6XAc \
           wypS_uplYDQ ajGvcmcdVJ4 RXjcBoplc_c mq2VC8s15Yk; do
  yt-dlp --write-auto-sub --sub-lang en-orig --skip-download \
    --output "sources/raw/%(upload_date)s-%(id)s.%(ext)s" \
    --sleep-requests 2 --sleep-interval 3 \
    "https://www.youtube.com/watch?v=${VID}"
done
```

Some of these (2018 RDAP Dan episodes, 2022 Danny Jones) may have no auto-CC available because the channel is old or the account was closed. Those will need manual subs or faster-whisper fallback.

### Going forward — enforce at ingest time

The Scribe worker must write VTTs directly to `sources/raw/YYYYMMDD-<id>.(en|en-orig).vtt` using `yt-dlp`'s `%(upload_date)s` and `%(id)s` output tokens, not temp filenames. The audit tool should be added to the CI build or run pre-commit to catch violations immediately.

---

## B. Caption Acquisition Resilience

### What scribe.mjs implements today

| Capability | Implemented |
|---|---|
| yt-dlp auto-CC (`--sub-lang en`) | Yes |
| `en-orig` preference over `en` | No — only tries `en` |
| Manual/uploader subs fallback | No |
| faster-whisper Tier 3 | No |
| Podcast Index Tier 4 | No |
| Quality gate (CER, logprob, no-speech) | No |
| `captionSource` reflects actual tier | No — always writes `auto` |

The Scribe worker today collapses to: try `en`, fail → quarantine. YT-ACQUISITION.md is a comprehensive spec that is entirely unimplemented.

### Recommended tiered fallback chain

Full spec written to `INGEST-FALLBACK.md`. Summary:

**Tier 1** — `yt-dlp --write-auto-sub --sub-lang en-orig` → fallback to `en`. ~70% hit rate. Already partially in Scribe; needs `en-orig` preference added.

**Tier 2** — `yt-dlp --write-sub --sub-lang en` (uploader manual captions). +5–8%. Pure yt-dlp flag change, no new dependency.

**Tier 3** — `faster-whisper base.en` (int8, CPU). +20%. Requires: `pip install faster-whisper`, `silero-vad`; ffmpeg for audio extraction. Only for `triaged_on` clips. Quality gate gates escalation to `small.en`. ~60–80 min CPU for a 2hr episode.

**Tier 4** — Podcast Index RSS audio enclosure (`api.podcastindex.org`). +5–10%. Free API (email registration). Parallel path, not sequential. Useful specifically for shows that cross-publish (Dr. Phil, Tucker, many podcasts have RSS feeds independent of YouTube).

**Tier 5** — Quarantine. <2% true loss.

**Minimum patch (near-term, low effort):** add `en-orig` preference + Tier 2 manual subs to `scribe.mjs`. Covers the most common case (uploader-provided captions on well-produced shows) with zero new infrastructure. Estimated 1-hour change.

---

## C. Content Fingerprinting

### Library choice

**Use `fpcalc` (Chromaprint command-line binary) for audio dedup. Drop MinHash on transcripts.**

Rationale, aligned with YT-ACQUISITION.md's own conclusion:
- MinHash on transcripts is circular: to compute the MinHash you need the transcript, which you only have after running Whisper, which is what you're trying to avoid running for duplicates. MinHash dedup on already-existing transcripts is useful for finding duplicates after the fact but is not a gate.
- `fpcalc` operates on the audio directly, before any transcription, and produces a compact 120-second chromaprint in ~3 seconds — fast enough to run as a pre-flight check before Tier 3.
- The `datasketch` Python MinHash library (the standard JS port, `minhash-js`, is unmaintained) is worth keeping as a post-hoc tool for finding duplicate sources that snuck in at different times, but not in the acquisition hot path.

**Install:** `brew install chromaprint` (macOS) or `apt install libchromaprint-tools` (Debian). Single ~5MB binary (`fpcalc`).

Tool built: `tools/fingerprint-recording.mjs`. Computes chromaprint for any audio/video file, stores to `data/fingerprints.json`, compares against existing entries.

### Thresholds

| Hamming bit-error rate | Verdict |
|---|---|
| ≤10% | DUPLICATE — same recording, different upload or re-encode |
| 10–30% | SUSPECT — likely same; flag for human review |
| >30% | Different content |

**Pre-filter before fingerprinting (cuts matrix size):**
- Duration ± 45 seconds AND
- Title fuzzy match (`rapidfuzz` in Python, `fuse.js` in JS) > 0.6 Jaccard

Without pre-filter, fingerprinting the full cross-product of ~60 sources × growing archive is tractable but grows O(n²). At 500+ sources the pre-filter matters.

### Dedup pipeline

```
New clip arrives
  → duration ± 45s pre-filter against known clips
    → if match candidates exist: fpcalc fingerprint → Hamming distance
      → ≤10%: collapse to existing recording_id, skip Scribe
      → 10–30%: flag for human, proceed tentatively
      → >30%: new recording
    → no match candidates: proceed directly to Scribe
```

**`fpcalc` invocation in scribe.mjs (pre-Tier-1):**
```bash
fpcalc -raw -length 120 <audio-file>
```
For caption-only pulls where no audio file is downloaded, defer fingerprinting to a background job that downloads 2 minutes of audio (`yt-dlp -x --audio-quality 9 -o /tmp/...`), fingerprints, then deletes the audio. Net cost: ~3s fpcalc + ~20s yt-dlp audio fragment.

---

## D. Deplatform-Proofing — Archive Diver Design

### RT risk profile

RT's YouTube channel was removed in March 2022. Kiriakou hosted "Loud and Clear" on RT America for years. Any RT-origin video in the corpus (or that should be in the corpus) is unreachable via YouTube. The 2018 RDAP Dan episodes (BDrLxPNedMo, fBPY2lIgDjQ) — both currently MISSING raw VTTs — are from a pre-RT-ban period but illustrate that older channels can go dark without notice.

### Archive.org APIs

The Internet Archive exposes three useful surfaces:

**1. Availability API (lightweight check)**
```
GET https://archive.org/wayback/available?url=youtube.com/watch?v=<id>
```
Returns whether a snapshot exists. Use as a quick gate before heavier queries.

**2. Search API (Scraping API)**
```
GET https://archive.org/advancedsearch.php?q=kiriakou+subject%3A"RT+America"&output=json&rows=50
```
Returns item-level metadata (title, date, description, creator). Free, no auth required. Rate limit: ~100 req/min.

**3. Item metadata API**
```
GET https://archive.org/metadata/<identifier>
```
Returns full item metadata including all files (MP4, VTT, MP3, SRT if the archive item includes them).

**4. S3-like download API**
```
GET https://archive.org/download/<identifier>/<filename>
```
Direct file download. Items with captions often have `.srt` or `.vtt` included.

### Query strategy for RT content

```bash
# Search for Kiriakou on RT
curl "https://archive.org/advancedsearch.php?\
q=kiriakou+AND+(creator:\"RT\"+OR+creator:\"RT+America\"+OR+subject:\"RT\")\
&fl=identifier,title,date,description,creator\
&sort=date+asc&rows=100&output=json"

# Search by show name
curl "https://archive.org/advancedsearch.php?\
q=\"loud+and+clear\"+AND+kiriakou\
&rows=100&output=json"

# YouTube-archived version of a specific dead video
curl "https://archive.org/advancedsearch.php?\
q=identifier:youtube-<videoId>\
&output=json"
```

The Internet Archive also preserves YouTube videos via their YouTube channel mirroring. Search prefix: `identifier:youtube-*`. This catches videos that were on YouTube, someone archived them, and then they were deleted.

### Archive Diver worker design

New worker: `botnet/workers/archive-diver.mjs`

Responsibilities:
1. For each clip with `status='quarantined'` and `reason_code='yt-dlp-probe-fail'` or `'no-captions'`, query archive.org by videoId (YouTube ID) and channel name.
2. If an item is found: download the best available transcript (prefer `.vtt` → `.srt` → `.txt`). If no transcript: download audio and route to Tier 3 faster-whisper.
3. Set `source_type: archive_org` and `archive_url: https://archive.org/download/<id>/...` in the normalized source frontmatter.
4. For new Kiriakou content discovery: run the channel/show-name search quarterly, add newly discovered items to the clips queue with `discovered_via: archive_org`.

**Rate limit:** archive.org prefers ≤5 concurrent downloads, ≤1 req/sec on the search API.

### Citation format for dead URLs

When a source's original URL is dead (YouTube 410, RT removed), the normalized source should carry:

```yaml
url: https://www.youtube.com/watch?v=XwBMKwt14IU   # original (dead)
url_status: dead
archive_url: https://archive.org/details/youtube-XwBMKwt14IU
archive_retrieved: 2026-06-23
```

The `<Cite>` component should render:
- If `url_status` is absent or `live`: standard YouTube deep-link (existing behavior)
- If `url_status: dead` and `archive_url` present: link to archive.org item; suppress the YouTube deep-link timestamp (archive.org doesn't support `?t=` offsets)
- If `url_status: dead` and no `archive_url`: render as plain text citation with `[archived copy unavailable]` note

This preserves citability for all 35 MISSING sources even if the original YouTube URLs become dead before raw VTTs are recovered.

---

## E. WhisperX Diarization

### When to use

WhisperX (pyannote.audio-backed speaker diarization) should be used only when:
1. Tier 1 and Tier 2 have failed (no YouTube captions at all)
2. The show has multiple speakers of similar profile (roundtable, multi-host panel)
3. The clip is `triaged_on` (never on speculative crawl — too slow)

Concrete examples in the corpus:
- RT's "Loud and Clear" (two co-hosts + Kiriakou as guest) → WhisperX warranted if no CC
- Dr. Phil single-guest format → plain faster-whisper is fine (one host, one guest, easy to follow without diarization)
- Joe Rogan → plain faster-whisper fine (Rogan's voice unmistakable; long pauses separate speakers)

### Integration

```python
import whisperx

model = whisperx.load_model("base.en", device="cpu", compute_type="int8")
result = model.transcribe(audio_file)

# Align and diarize
model_a, metadata = whisperx.load_align_model("en", device="cpu")
result = whisperx.align(result["segments"], model_a, metadata, audio_file, device="cpu")

diarize_model = whisperx.DiarizationPipeline(use_auth_token=HF_TOKEN, device="cpu")
diarize_segments = diarize_model(audio_file)
result = whisperx.assign_word_speakers(diarize_segments, result)
```

**Output processing:** identify which speaker ID is Kiriakou (usually by matching against a known 30s sample from a backed source). Tag his segments `[JK]`; tag the host `[HOST]`; leave unidentified segments `[UNK]`. During normalization, `[JK]` segments go into the main body paragraphs; `[HOST]` question segments get a lighter visual treatment (or are stripped for token efficiency — editorial call for Pedro).

**HuggingFace token requirement:** pyannote.audio speaker diarization requires accepting the model license at HuggingFace and providing an HF_TOKEN. Free. One-time. Store as HF Secret in the Space.

---

## F. Files Written This Session

| File | Purpose |
|------|---------|
| `/Volumes/EOS_DIGITAL/KiriPedia/tools/audit-provenance.mjs` | Raw VTT ↔ normalized source parity audit. Run anytime; add to CI. |
| `/Volumes/EOS_DIGITAL/KiriPedia/tools/fingerprint-recording.mjs` | Chromaprint fingerprint skeleton for a single file. Requires `brew install chromaprint`. |
| `/Volumes/EOS_DIGITAL/KiriPedia/INGEST-FALLBACK.md` | Full tiered fallback chain spec (Tiers 1–5), Scribe integration notes, raw VTT naming convention, WhisperX guidance. |
| `/Volumes/EOS_DIGITAL/KiriPedia/evaluations/07-sources-provenance.md` | This document. |

---

## G. Open Infrastructure Decisions for Pedro

**1. Raw VTT recovery sprint (high priority)**
The 35 MISSING sources are recoverable now while all 35 videos are presumably still on YouTube. If any go down before recovery, the transcripts become unverifiable. Recommend a one-time batch re-download this week using the `for VID in ...` loop in Section A.

**2. CODEX VTT move (trivial, do now)**
Three VTTs in `"codex articles/"` need two `cp` commands. Zero risk.

**3. `scribe.mjs` minimum patch (low effort, high return)**
Adding `en-orig` preference and Tier 2 manual subs is ~30 lines of code and covers the most common current failure mode. No new dependencies.

**4. `brew install chromaprint` (one command)**
Unlocks `tools/fingerprint-recording.mjs`. Until then, fingerprinting is specced but not operational. The `--check-deps` flag will confirm.

**5. Fingerprint DB bootstrapping strategy**
Should fingerprints be computed for all 18 BACKED sources retroactively? Yes — but it requires audio, and the sources were acquired caption-only (`--skip-download`). Two options:
- Download 2-minute audio clips retroactively (cheapest: `yt-dlp -x --audio-quality 9 --download-sections "*00:01:00-00:03:00"`)
- Defer fingerprinting to new ingests only (simpler, loses retrospective dedup)

**6. Archive Diver — when to build**
The Archive Diver is most urgent for RT content. If any RT episodes are in the planned ingest queue, build it before ingesting those. Otherwise, spec is ready in Section D — it's a ~200-line worker.

**7. Podcast Index API key**
Free, obtained at `podcastindex.org`. Takes 24 hours to activate. Should be registered now so Tier 4 is available when the Scribe upgrade lands.

**8. Citation format for dead URLs**
The `<Cite>` component does not currently render `url_status: dead` differently. This needs a frontend component change (Expert #6's domain), but the data model decision (add `url_status` and `archive_url` to source frontmatter) is a sources/provenance call and is decided here: **yes, add both fields**, default absent (treated as live).

**9. Naming convention enforcement**
The root cause of the 35 MISSING files is that the pipeline allowed non-canonical filenames. Adding a validation step to `audit-provenance.mjs` (or a pre-commit hook) that fails if `source_file:` in any normalized source does not match `YYYYMMDD-<videoId>.en[-orig].vtt` would prevent recurrence. Low effort.
