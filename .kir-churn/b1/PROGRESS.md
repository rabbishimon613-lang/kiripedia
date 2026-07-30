# Batch 1 progress — unwritten-ledger churn

**Method: sequential, no sub-agents.** (Locked 2026-07-30 — see the no-agent-fanout rule in
MORNING-ROUTINE.md §3 and KIRIPEDIA-VIDEO-INTAKE-PLAYBOOK.md §2.)

Per transcript: read fully → findings TSV in this dir → weave existing articles by Edit
(never `body_append` stacking) → new articles via `tools/scaffold-articles.mjs`.

## Recurring trap found in this batch

**Julian Dorey publishes hour-long CLIPS of his full episodes as separate videos**, and the
corpus already has several. Before writing from a long Dorey episode, check which time window
is already mined:

- `2025-11-18-nuclear-war-vault-7-mossad-in-iran` = full ep #356 (3h17m)
  - `2026-01-16-julian-dorey-french-intelligence` = clip of **1:47:41 → 2:47:38**
  - `2025-11-19-julian-dorey-vault-7` = clip of **2:16:48 → 3:17:00**
  - So only **00:00 → 1:47:41 was unmined.**

Check with: `grep -rl "<clip-slug>" src/content/articles/`

## Scaffolder gotcha (cost a bad file, 2026-07-30)

`spec.articles` must be an **object keyed by slug**, not an array. An array makes the
scaffolder iterate `Object.entries()` over indices and write `src/content/articles/0.mdx`.

```json
{ "_defaults": {...}, "articles": { "my-slug": { "title": ..., "body": ... } } }
```

## Status

| # | slug | status |
|---|---|---|
| 1 | 2025-11-18-nuclear-war-vault-7-mossad-in-iran | **written** — 4 new, ~25 enrich |
| 2 | 2026-02-23-epstein-lies-satanic-elite-mossad | **written** — 1 new (population-decline-analysis), 17 enrich |
| 3 | 2026-04-09-finding-truth-with-harjeet-… | **rejected** — host-side reaction stream; Kiriakou never speaks, host replays clips from a Hedges interview |
| 4 | 2026-07-10-kiriakou-takes-ana-cenk-behind-the-curtain | **written** — 2 new (israeli-integration-into-us-agencies, kiriakou-and-cenk-uygur), 8 enrich. He is guest only 31:57–1:02:38; rest is TYT host content. |
| 5 | 2025-02-25-mk-ultra-usaid-overthrowing-governments | **written** — read in full. 3 new (abraham-lincoln-collection, mlk-assassination, amaryllis-fox-kennedy), 12 enrich. |
| 6 | 2026-07-08-voxera-production-official-… | **written** — read in full. 6 new (superdelegates, george-mcgovern, yalta-conference, aipac-foreign-agent-registration, 9-11-plea-agreements, truck-and-cat-in-the-hat), 11 enrich. |
| 7 | 2026-04-23-pbd-podcast-ex-cia-officer-confronted-… | pending |
| 8 | 2025-11-16-consortium-news-consortium-news | pending |
| 9 | 2022-09-20-the-roundtable-gonzalo-l-… | pending (multi-guest panel — attribution risk) |
| 10 | 2020-05-20-slow-news-day-freeassangevigil-… | pending (panel; he speaks ~16:34-19:10, 23:19-24:53, 35:46-44:03) |
| 11 | 2020-05-20-action-4-assange-action-4-assange | pending |
| 12 | 2026-07-08-covert-strategies-revealed-… | pending |
| 13 | 2026-03-20-the-jason-jones-show-… | pending |
| 14 | 2026-05-26-covert-strategies-revealed-… | pending |
| 15 | 2021-11-05-live-on-the-fly-with-randy-… | pending (he is a guest only ~39:41-51:34) |
| 16 | 2023-02-02-consortium-news-matt-taibbi-chris-hedges-… | pending (panel) |
| 17 | 2026-07-06-the-pocket-chris-griffin-… | pending |
| 18 | 2026-07-10-the-untold-stories-of-john-kiriakou | pending |
| 19 | 2026-07-17-national-security-files-… | pending |
| 20 | 2018-01-30-ian-discussions-… | **rejected** — host recap + an unrelated guest interview; Kiriakou never speaks |

## Merges done (transcript 1)

Redirects added to `astro.config.mjs`; duplicate drafts deleted:
- abraxas-corporation → arrais-corporation (auto-caption spelling of the same firm)
- cia-france-rift-1990s → dgse
- robert-jackson-federal-prosecutor-speech → pick-the-man-principle
- bahrain-dole-campaign-solicitation → david-ransom
- kiriakou-indian-pakistani-media-policy → (dropped; imran-khan already covers it)

## End-of-batch checklist

- [ ] set every ledger row status in `UNWRITTEN-LEDGER.md`
- [ ] `node tools/build-date-index.mjs`
- [ ] `npm run build` → `Total: 0 bugs`
- [ ] ONE commit, ONE push
- [ ] ONE deploy: `vercel build --prod && vercel deploy --prebuilt --prod`
- [ ] never re-enable Vercel auto-deploy; stay on branch `kiriakou-intake-churn`
