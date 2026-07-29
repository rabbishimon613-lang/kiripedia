# Intake progress — 2026-07 sweep

Resume file. The genuinely-new sources from `KIRIAKOU-NEW-VIDS-2026-07-28.md`
(see PART 4 there for why the batch is 45 and not 131).

**Status: 21 of 45 sources processed. 41 sources now stand (4 dropped as non-sources).**

## Articles produced so far — 19

**New (13):** strait-of-hormuz · olof-palme-assassination · jd-vance · 2026-iran-war ·
cia-culture-of-lying · congressional-intelligence-oversight · christian-zionism · india ·
fbi-manufactured-terrorism-cases · cameo · oman · decapitation-strikes ·
2026-iran-war-economic-shock

**Expanded (6):** lindsey-graham (375→~2,400) · yemen (~1,040→~2,600) ·
cia-sexpionage (~430→~1,700) · jeffrey-sterling · the-intercept (420→~1,300) ·
tulsi-gabbard · iran-nuclear-assessment

## Sources processed

| Source | Yield |
|---|---|
| Briefing Room Ep. 1–5 | 7 articles |
| Tucker Carlson Network | 2 new + Sterling |
| Jay Dyer | christian-zionism |
| One Night with Steiny | the-intercept, india |
| To My Sons and Daughters | fbi-manufactured-terrorism-cases, cameo |
| DeProgram — Target Tehran | oman, iran-nuclear-assessment |
| DeProgram — Gabby Tulsi | decapitation-strikes, tulsi-gabbard |
| DeProgram — Drop Dead / Going to Ground | 2026-iran-war-economic-shock |
| DeProgram — Bidening Out / Allies / Lynching / Two More Weeks | read, no safe yield (see below) |

## DROPPED — 4 non-sources

Not Kiriakou speaking. Under single-source doctrine these are secondary sources about him.

- `blackfiles` — narrated documentary, zero first-person across 4,340 words
- `liberty-vault` ×2 — reaction videos; host plays clips and talks over them. The June
  one is built on the Theo Von interview already in the corpus, so citing it would
  double-cite the same speech
- `interests-align` — TikTok-conspiracy show about Kubrick; Kiriakou named once, never appears

## DeProgram attribution hazard — read before citing any DeProgram source

**Normalized DeProgram transcripts have no reliable speaker markers.** It is a two-host
show (Ted Rall + Kiriakou, sometimes Jamarl Thomas). Long stretches are Rall talking, and
the turn markers are stripped or inconsistent.

**Only cite a DeProgram passage when the speaker is unambiguous:**
- Rall addresses him by name and he answers ("John, who came up with that list?" → answer)
- The content is first-person CIA/agency experience only Kiriakou could have

The 2026-03-31 "Israel Legalizes Lynching" episode has strong material on the Knesset
death-penalty law, but the substantive passages cannot be safely attributed — most read as
Rall. **Left uncited rather than risk putting the co-host's words in his mouth.** Same for
the leftover portions of Bidening Out, With Allies Like These, and Two More Weeks.

## Not yet processed — 20

**The JK Report originals (8)** — genuine interviews, not re-cuts. He *hosts* these, so
guests speak; same attribution care needed:
- Clive Stafford Smith (2026-07-02)
- Inside FBI recruiting / CIA secrets (2026-07-03)
- Aaron Good (2026-07-06)
- Prof. Richard D. Wolff (2026-07-07)
- Inside CIA recruiting + prison (2026-07-08)
- Nick Bryant on Epstein (2026-07-13)
- Biggest unanswered questions about Epstein (2026-07-20)
- Jackson Hinkle (2026-07-21)

**Deep Focus, his own show (11)** — he interviews guests; lower canon density:
2026-02-03 · 02-17 · 03-03 · 06-02 · 06-09 · 06-16 · 06-23 · 06-30 · 07-07 · 07-14 ·
07-21 · 07-28

**Misc (4)**: 2026-01-13 NewsNation (verify he appears) · 2026-03-05 Paper Trail ·
2026-03-17 Paper Trail · 2026-05-17 Covert Operations Insight (canonical of its cluster)

## Method notes

- **Verify every timestamp before citing.** Replayed clips are the main trap: the Colin
  Powell / Sabri al-Douri / "we killed the janitor" story in Briefing Room Ep. 3 is Kiriakou
  reacting to a fan's re-post of his own old clip, and is already fully covered in
  `1993-bush-assassination-plot.mdx`.
- Ads are stripped to `.sponsors.md` sidecars. The DeleteMe / gold / MCG Tactical reads
  recur in every Briefing Room episode and are not canon.
- Build gate: `npm run build` to `Total: 0 bugs`.
- Deploy: `vercel build --prod --yes` then `vercel deploy --prebuilt --prod`. Manual only.
