# Intake run complete — 2026-07 sweep

**All 45 sources processed.** Started from `KIRIAKOU-NEW-VIDS-2026-07-28.md`
(see PART 4 there for why the batch was 45 and not the 131 originally intaken).

## Final numbers

| | |
|---|---|
| Videos originally intaken | 131 |
| Dropped as re-uploads / internal duplicates | 86 |
| Dropped after reading — not Kiriakou sources | 13 |
| **Real sources kept** | **32** |
| Articles created | 24 |
| Articles substantially expanded | 14 |

## The 13 dropped after reading

Under single-source doctrine, canon is Kiriakou's own spoken words. These carried none.

**Nine guest-hosted Deep Focus episodes (June–July 2026)** — hosted by Richard Wolff,
Matt Hoh and Arin Menone. Across 64,000 words Kiriakou is never mentioned and never
speaks. These are other people's programmes on his channel.

**Four secondary sources** — `blackfiles` (narrated documentary, zero first-person),
`liberty-vault` ×2 (reaction videos talking over his clips; the June one is built on the
Theo Von interview already in the corpus), `interests-align` (Kubrick conspiracy show,
names him once).

## Three sources read that yielded nothing new

Not dropped — he is present — but everything citable was already covered:
- JK Report / Richard Wolff (07-07) — his part is scene-setting on tariffs
- JK Report / Nick Bryant (07-13) — host framing; Epstein material already in the corpus
- Covert Operations Insight (05-17) — the Aug 2 1990 Oval Office briefing and the
  Habash/PFLP exchange are already in `john-kiriakou`, `ahmed-khatib`, `george-habash`

## Articles created (24)

strait-of-hormuz · olof-palme-assassination · jd-vance · 2026-iran-war ·
cia-culture-of-lying · congressional-intelligence-oversight · christian-zionism · india ·
fbi-manufactured-terrorism-cases · cameo · oman · decapitation-strikes ·
2026-iran-war-economic-shock · field-loadout · cia-big-tech-revolving-door ·
cia-feeder-schools · kiriakou-writing-process · 2028-presidential-field · kashmir ·
beirut · publications-review-board · kiriakou-father-and-grandfather ·
iranian-sleeper-cells · trump-glorification-and-the-iran-war ·
venezuela-regime-change-2026 · deep-state

## Articles expanded (14)

lindsey-graham (375→~2,400) · yemen (~1,040→~2,600) · cia-sexpionage (~430→~1,700) ·
the-intercept (420→~1,300) · jeffrey-sterling · tulsi-gabbard · iran-nuclear-assessment ·
osama-bin-laden · fci-loretto · aafia-siddiqui · steven-lalas · greek-intelligence-service ·
curveball · vladimir-putin · tucker-carlson · remains-of-the-day-book ·
principals-committee-meeting

## Data-quality fixes made along the way

- **`afia-sadiki` → `aafia-siddiqui`** — the article carried the auto-caption's phonetic
  spelling as its title and slug while already linking the correct Wikipedia and Wikidata
  entries, making a named-entity page unfindable under the subject's real name.
- **`steven-lawless-case` → `steven-lalas`** — same class of error. Verified against
  external reporting before renaming. A sentence-length discrepancy between his tellings
  and the contemporaneous record is now flagged in the article rather than resolved
  silently.
- Both old slugs redirect in `astro.config.mjs`.
- **Citation audit** — every `<Cite s="...">` in the corpus is now validated against the
  source collection. Found and fixed one placeholder introduced during this run and three
  long-standing dangling cites in `abu-zubaydah.mdx`. Corpus is at zero dangling citations.

## Standing hazards for the next run

- **DeProgram transcripts have no reliable speaker markers.** Two-host show; long stretches
  are Ted Rall. Only cite where the speaker is unambiguous — he is addressed by name and
  answers, or the content is first-person agency experience. The 2026-03-31 Knesset
  death-penalty material was left uncited for exactly this reason.
- **Replayed clips are not new findings.** The Colin Powell / "we killed the janitor" story
  in Briefing Room Ep. 3 is Kiriakou reacting to a fan's re-post of his own old clip.
- **Check who is hosting before intaking a Deep Focus episode.** The channel runs
  guest-host months.
- **Sweep the corpus for more phonetic-name corruptions.** Two found in two sessions, both
  on named-entity pages. Worth a systematic pass: compare article titles against their own
  `wikipedia:` frontmatter values.

## Recommended next

The phonetic-name sweep above. Then: Briefing Room publishes Tuesdays and Thursdays, so
this gap reopens twice a week — add `youtube.com/@realjohnkiriakou` to a standing watch.

Build gate `npm run build` → `Total: 0 bugs`. Deploy `vercel build --prod --yes` then
`vercel deploy --prebuilt --prod`. Manual only.
