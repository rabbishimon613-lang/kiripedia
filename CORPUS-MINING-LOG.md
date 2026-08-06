# Corpus mining log

Twice-daily shifts (03:00 and 15:00 local) writing new articles out of the
transcripts already in the corpus. Quota starts at 50 and falls by one each
shift; at 0 the routine deletes itself. See `CORPUS-MINING-ROUTINE.md`.

Total planned output: 1,275 articles over 50 days.

| # | when | quota | sources mined | written | notes |
|---|---|---|---|---|---|
| — | 2026-08-05 (setup) | 50 next | — | — | Routine armed. Preceding manual batches: 20 + 30 + 50 articles, all live. |
| 1 | 2026-08-06 15:00 (pm) | 50 | s2e1 Welcome to Loretto, s2e3 Circle of Friends, s2e4 With Friends Like These, s2e5 The Abyss, s2e6 Use Your Words, s2e7 Letters from Loretto, s1e17 Zain, s1e12 The Grind, s1e27 Prisoner Ex | mark-lanzalotti, frank-russo, jimmy-dimora, marlon-beard, dave-phillips, spotting-a-cia-impostor, shank-planting-incident, pete-calabrese, blue-the-guard, sewer-trout, dog-food-memo, prison-cleanliness, prison-nicknames, prison-cell-transfers, prison-foia-request, rat-and-pedophile-table, second-chance-act, seven-thousand-letters, shot-callers, pisces-prison-gang, the-stinger, chomo, nation-of-islam-at-loretto, federal-prison-security-levels, sarge-the-guard, legal-mail, bob-jones-frame-up, passing-time-at-loretto, black-box-transport, civil-confinement, cook-the-recidivist, truck-the-serial-killer, romanian-twins, merry-go-round-prank, self-destructing-terrorist-cell, ken-schaefer, astrophotographer-lawyer, rule-six-endurance, prison-depression, spongebob-shirt, two-abu-zubaydahs, abu-zubaydah-diary, syrian-bodyguard, buzzy-krongard, propane-truck-ruse, weapons-cache-map, training-foreign-intelligence-services, tiffany-stationery, greek-community-of-warren-ohio, operation-fast-and-furious | Audits clean (frontmatter 1108 files; wikilinks 0 bugs, 0 dead). LOCAL BUILD UNUSABLE: the EOS drive dropped ~8,000 source reads mid-build, so dist/wiki held only 407–690 of 1108 pages across three attempts (also with outDir on /tmp — the loss is on read, not write). Source tree verified intact (all 1108 .mdx readable). Shipped via the remote Vercel build instead and verified all 50 slugs live at 200, plus content spot-check and no regressions. Left 23 files modified by another session uncommitted. |
