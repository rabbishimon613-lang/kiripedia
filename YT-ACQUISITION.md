# YouTube Acquisition Playbook

*Companion to [TEAM-REWORK.md](TEAM-REWORK.md). Brainstorm-only — no code changes yet. 2026-06-22.*

The team can't do anything if it can't reach YouTube and pull captions. Three senior devs reviewed the current setup and the rework plan. This doc is what they agreed on.

---

## The simple picture

```
   ┌──── HF Space (yt-dlp binary, cookies in /tmp) ────┐
   │                                                  │
   │  PRIMARY PATH (works ~70% of the time)           │
   │  yt-dlp --write-auto-sub → VTT → markdown        │
   │                                                  │
   │  WHEN BLOCKED OR EMPTY:                          │
   │  → fall through to next rung                     │
   └──┬───────────────────────────────────────────────┘
      │
      ▼
   Manual uploader subs (+5–8%)
      │
      ▼
   Whisper on downloaded audio (+20%)   ← needs the bytes; needs Whisper installed
      │
      ▼
   Podcast Index RSS audio (+5–10%)     ← parallel ingest, doesn't go through YouTube
      │
      ▼
   Quarantine (<2% true loss)


   ┌──── EMERGENCY: Tailscale bridge to home Mac ─────┐
   │                                                  │
   │  If HF Space IP gets banned hard, the loop       │
   │  POSTs each yt-dlp request to a tiny FastAPI on  │
   │  the user's home Mac (residential IP), which     │
   │  runs the actual yt-dlp call and returns JSON.   │
   │                                                  │
   │  Home Mac is on Tailscale; HF Space joins the    │
   │  same tailnet via TS_AUTHKEY (HF Secret).        │
   └──────────────────────────────────────────────────┘
```

---

## 1. yt-dlp itself — get it installed right

The container has none. Once installed, here's how it should be done (the panel was unanimous):

- **Source**: download the pyinstaller binary from GitHub releases directly. Don't `apt install yt-dlp` (Debian ships months-stale; broken). Don't `pip install` (drags in pip + setuptools, ~50MB of garbage).
- **Path**: `/usr/local/bin/yt-dlp`, `chmod +x`. Single ~17MB file.
- **Pinning**: pin a known-good version (e.g. `2025.09.26`) in the Dockerfile for reproducible builds — then call `yt-dlp -U` in `entrypoint.sh` on every container start to self-heal when YouTube breaks the extractor (happens monthly).
- **ffmpeg**: **skip it.** Caption pulls use `--skip-download` and never invoke ffmpeg. Saves ~100MB on the image. Add it later only if Whisper-fallback gets wired in (Whisper needs an audio file).

**Minimal Dockerfile delta:**
```dockerfile
ARG YTDLP_VERSION=2025.09.26
RUN curl -fsSL -o /usr/local/bin/yt-dlp \
      "https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_VERSION}/yt-dlp" \
 && chmod +x /usr/local/bin/yt-dlp
```

In `entrypoint.sh`:
```bash
yt-dlp -U 2>/dev/null || echo "[entrypoint] yt-dlp self-update skipped"
```

---

## 2. YouTube *will* block the HF Space IP

The panel was unambiguous: HF Spaces run on AWS ranges YouTube has had flagged since ~2023. Shared egress with thousands of other scraping Spaces. **The block is a when, not an if.**

Failure modes to look for in logs (real names, not 429s):
- `Sign in to confirm you're not a bot. Use --cookies-from-browser or --cookies`
- `HTTP Error 403` on the player endpoint
- `Unable to extract initial player response`
- `ytsearch` returns the page HTML with the results array empty — silent degradation

**The fix that actually works:** drop a **logged-in cookies.txt** into the container. The team agreed on these rules:

- Export from a **burner Google account**, never the user's primary. YouTube ToS-bans accounts that get used from cloud IPs for media downloads (caption-only is much lower risk, but not zero).
- Cookies last **3–14 days** when used from a cloud IP. Refresh weekly.
- **Never commit cookies.txt to git** (the image is public). Inject via HF Secret → write to `/tmp/cookies.txt` at container start → `yt-dlp --cookies /tmp/cookies.txt …`.
- Add `--extractor-args "youtube:player_client=default,mweb;skip=hls,dash"` — bypasses SABR for caption + search workloads.

---

## 3. Rate-limit etiquette

For the workload (~10 ytsearch + caption pulls per cycle every 5 min, no media):

- **Serial only.** No concurrency from one IP. Concurrent calls are the #1 trigger.
- **Sleep 2–4s between calls** with jitter: `--sleep-requests 2 --sleep-interval 3 --max-sleep-interval 6`.
- Caption-only + search is **10–20× less suspicious** than media downloads because we never hit the `videoplayback` CDN.

At this cadence with fresh cookies, you can run indefinitely.

---

## 4. The fallback ladder (when CC fails)

Realistic numbers for long-form interview podcasts:

| Step | Tool | Hit rate |
|---|---|---|
| 1. Auto-CC | `yt-dlp --write-auto-sub --sub-lang en` | ~65–70% |
| 2. Manual subs | `yt-dlp --write-sub` (uploader-provided) | +5–8% |
| 3. Whisper | `faster-whisper` (int8 base.en) on `yt-dlp -x` audio | +20% |
| 4. Podcast RSS | Podcast Index audio enclosure | +5–10% |
| 5. Quarantine | — | <2% true loss |

End-to-end coverage: **~98%** of the corpus.

### Whisper notes (when we get to it)

- Use **`faster-whisper`** (CTranslate2 backend), not `whisper.cpp`. On 2 vCPU CPU, int8 `base.en` runs at ~1.5–2× realtime. A 2hr podcast = ~60–80 min CPU.
- VAD pre-segment with `silero-vad` to skip silence.
- Don't escalate to `small.en` automatically — 3–4× slower for marginal gain on clean interview audio.

### Podcast Index (parallel YouTube-free path)

- `podcastindex.org` — free API, key by email, no quota teeth.
- `/search/byperson?q=John+Kiriakou` returns every show he's been on, with RSS URLs and audio enclosures.
- Listen Notes free tier caps at 300/mo — too thin, skip.
- Pipeline integration: same `recording_id` table from the rework brief, add `source_type` enum (`youtube|podcast_rss|spotify`).

### Dedup before any LLM call

- **Primary signal**: `chromaprint` / `fpcalc` (~5MB binary). 120s audio fingerprint in ~3s. Hamming distance < 5% = same recording. Catches all 18 Joe-Rogan-clip variants regardless of title.
- **Pre-filter**: duration ± 45s + title fuzzy match (`rapidfuzz`) > 0.6. Cuts the fingerprint matrix to a tractable size.
- MinHash on transcripts is circular (needs the transcript you're trying to avoid making) — drop that idea.

### Quality gate (when to give up on a video)

Reject the transcript if **any** of:
- character error rate vs dictionary > 12% (use `pyspellchecker` on a 500-word sample)
- mean segment confidence < -1.0 (faster-whisper exposes `avg_logprob`)
- > 15% segments flagged `no_speech_prob > 0.6`
- < 40 words/minute sustained over 5 min (music or gibberish)

First failure → retry with `small.en`. Second failure → quarantine.

---

## 5. The emergency lever — Tailscale-to-home bridge

If the HF Space gets banned hard (cookies expire, IP gets flagged, captcha wall), the team is dead in the water. The panel's strong recommendation: **build this before you need it.**

**Architecture:**
- User's old Mac at home joins a Tailscale net.
- Tiny FastAPI/Express service on the Mac wraps `yt-dlp` as an HTTP endpoint: `POST /search { query, limit }` and `POST /captions { videoId }` returning JSON.
- HF Space container also joins the tailnet via `TS_AUTHKEY` (HF Secret). One-line install.
- The loop's yt-dlp calls become HTTP calls to `http://homemac:8080/…`.
- Residential IP, no YouTube block, full control.

**Cost: $0.** Mac electricity is ~$10/yr at idle. Tailscale free tier covers this. The Mac doesn't need to be 24/7 — when it's off, the HF Space falls back to direct yt-dlp (with degraded reliability).

Other fallbacks the panel ranked low:
- Cloudflare Workers as proxy: CF IPs are also burned. Doesn't help.
- Residential proxy services (BrightData etc.): $3–15/GB. Reserve for emergencies.
- Rotate to a new HF Space: same IP pool. Theatre.

---

## What this means for the team rework

This doc affects the [TEAM-REWORK.md](TEAM-REWORK.md) plan in three specific places:

1. **Phase 1's Channel Crawler depends on yt-dlp being installed and the cookies/mweb mitigation being in place.** Without those two, Phase 1 fails the same way the current `recent-changes` worker fails.
2. **The Scribe role grows.** It's not just "yt-dlp --write-auto-sub" — it's the full ladder (auto → manual → Whisper → podcast RSS → quarantine), with the quality gate. Still one worker process, just with more rungs internally.
3. **A new role appears: `Acquisition Sentry`.** Watches the success rate of yt-dlp calls. If captions-fail-rate breaches a threshold (e.g. >50% over a 30-cycle window), it (a) flips the loop to use the Tailscale bridge if available, (b) pages the user with a snapshot field `acquisition_state: degraded`. Without this watchdog, the team will silently grind in backlog mode for days before anyone notices.

---

## Suggested order of operations

When the user is ready to act on this:

1. **Add yt-dlp install + ffmpeg-free Dockerfile delta + entrypoint self-update.** ~5 min, no new infra. Unlocks the current `recent-changes` worker.
2. **Add `--extractor-args player_client=mweb`** to the existing finder. Buys time before cookies are required.
3. **Add cookies.txt via HF Secret.** Burner account, refresh weekly. Now reliability is high.
4. **Add `--sleep-requests 2 --sleep-interval 3`** rate limiting. Now we're a good citizen.
5. **Set up the Tailscale-to-home-Mac bridge.** Test it. Don't switch over yet, but have it ready.
6. **(Per TEAM-REWORK Phase 2)** Add Whisper fallback, Podcast Index parallel ingest, Acquisition Sentry, fingerprinter.

Steps 1–4 are this week's work. Step 5 is "before we need it." Step 6 is the broader rework.

---

*End of brief.*
