# Fleet — KiriPedia autonomous ingest

A fishing-fleet architecture for finding, processing, and canning Kiriakou material with minimal Opus token spend.

## Roles

- **Fleet at sea** — cron-driven trawlers (`trawlers/*.mjs`). Rule-based filtering, no LLM calls. Drops catches into `catch/YYYY-MM-DD.jsonl`.
- **Harbor Master** — a Sonnet chat opened in this repo. Reads `HARBOR-MASTER.md` to take post. Coordinates plant dispatch and surfaces suspect items to Opus.
- **Processing plant** — llm-fleet workers (`worker_fast`, `worker_longcontext`, `worker_reasoning`) called BY the Harbor Master, using the prompts in `plant/prompts/`. Operate on greenlit catches only.
- **Opus (the user)** — greenlights catches from the morning briefing, reviews the suspect queue, approves merges.

## How to use

1. **Set up cron** (optional, can run manually for now):
   ```
   0 */6 * * * cd /Volumes/EOS_DIGITAL/KiriPedia && ./fleet/trawlers/run-all.sh >> fleet/ledger/cron.log 2>&1
   ```
2. **Open a Sonnet 4.6 chat** in `/Volumes/EOS_DIGITAL/KiriPedia/`.
3. **First message**: `Read fleet/HARBOR-MASTER.md and take post.`
4. The Harbor Master will give you a morning briefing and wait for greenlight orders.

## Why this shape

- Trawlers are cheap and dumb. Title + duration + channel allowlist filters out 95% of noise with zero LLM cost.
- The catch bucket is the human-in-the-loop chokepoint, sized for ~30 seconds of attention.
- The plant only runs on greenlit work, so all expensive operations are gated by your judgment.
- Opus only sees: morning briefings, suspect queue, weekly auto-merge digests. Everything else is delegated.

## See also

- `HARBOR-MASTER.md` — standing orders, read by every Sonnet session
- `config/grounds.json` — channel + keyword allowlist (fishing grounds)
- `config/budget.json` — daily caps + escalation triggers
- `../INGEST.md` — existing manual ingest pipeline (the plant calls into this)
- `../ARTICLE-WORKFLOW.md` — binding doctrine
