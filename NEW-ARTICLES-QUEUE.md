# New-articles queue (full-corpus sweep, 2026-07-12)

Method: capitalized-phrase extraction across all 826 non-sponsor transcripts in
`src/content/sources/`, distinct-source counts, filtered against all 613 pre-existing
article slugs/titles + TODO-tier-c entries, then hand-verified. Scripts in scratchpad
(extract_entities.py / filter_candidates.py / paragrep.py — paragrep prints
source-slug @ timestamp + paragraph for any regex; rebuild if lost).

## WRITTEN this pass (46) — all validated (YAML, wikilinks, cite sources) + full build passed

osama-bin-laden, george-w-bush, counterterrorism-center, bureau-of-prisons,
vladimir-putin, ray-mcgovern, freedom-of-information-act, ptsd, soviet-union,
cold-war, national-security-council, isis, kurds, world-trade-center,
aryan-brotherhood, american-psychological-association, senate-intelligence-committee,
mike-pompeo, langley, piers-morgan, watergate, jake-tapper, nobel-peace-prize,
abraham-accords, arianna-huffington, amnesty-international, human-rights-watch,
code-pink, lindsey-graham, kandahar, pricewaterhousecoopers, italians-at-loretto,
sam-adams-award, dead-drop-podcast, dead-drop, vietnam-war, martin-luther-king,
george-hw-bush, henry-kissinger, j-edgar-hoover, joe-rogan, james-bond,
muammar-gaddafi, united-food-and-commercial-workers, geneva-conventions,
covertaction-magazine, national-security-act.

Frontmatter gotcha: quote any YAML value containing `: `, starting with `"`, or
containing straight quotes — or use `summary: >-` block scalars (the fixer script
in scratchpad did this automatically).

## REMAINING — verified uncovered, enough sources (distinct-source count in parens)

Tier A (15+ sources):
- united-nations (116) — verify substance; likely mostly passing "the UN"
- world-war-ii (69)
- james-bond (48) — Hollywood-spy-trope commentary
- martin-luther-king (41)
- george-hw-bush (41) — Gulf War, loan guarantees to Israel, "last fair shake for Arabs"
- gulf-war (39) — analyst-era; satellite move, helicopter no-fly loophole
- joint-chiefs-of-staff (36) — anti-Iraq-war faction
- red-cross / icrc (36) — 2007 report; leaked portions
- hitler (34) — probably skip, generic
- gambino-crime-family — largely covered by italians-at-loretto now
- joe-rogan (30) — his #2392 appearance + commentary
- gaddafi (29) — "crazy" narrative, Libya war
- jd-vance (29)
- navy-seals (27) — bin Laden raid, Eddie Gallagher?
- marjorie-taylor-greene (26)
- prince-andrew (26) — Epstein material
- equal-employment-opportunity-act (25) — his EEO stories? verify context
- franklin-roosevelt (24)
- henry-kissinger (23) — only petrodollar-kissinger facet exists
- iron-dome (22)
- geneva-conventions (22)
- ufcw / united-food-and-commercial-workers (22) — his union job + boss profile story
- jeff-bezos (21)
- oliver-stone (21) — tweets, Putin trip, JFK
- candace-owens (20)
- northern-alliance (20)
- national-security-act (20) — 1947, fifth function
- kash-patel (19)
- mitch-mcconnell (19)
- west-point (19) — his ethics lecture; Pakistani West Point
- nation-of-islam (18) — prison gang-not-religion, Farrakhan
- house-of-martyrs (18) — AZ safe house in Peshawar (could be section of abu-zubaydah)
- ayatollah-khamenei (17)
- jared-kushner (17)
- j-edgar-hoover (17)
- berlin-wall (17)
- pearl-harbor (17)
- pulitzer-prize (17) — Risen? Hersh? verify
- arab-spring (16)
- chuck-schumer (16)
- house-intelligence-committee (16)
- mk-chickwit (15) — MK-Ultra sibling programs
- egyptian-islamic-jihad (15)
- delta-force (15)
- greek-orthodox-church (15)
- max-blumenthal (15)
- glenn-greenwald (15)
- scott-stantis (15) — verify who
- sputnik-radio (40 raw "sputnik" — his radio show years; verify vs satellite)

Tier B (8-14):
bay-of-pigs (13), tony-blair (13), margaret-thatcher (13), tommy-franks (13),
liberty-university (13, verify), covert-action-magazine (12), george-mcgovern (12),
monica-lewinsky (12), scooter-libby (11), julian-dorey (11), philip-seymour-hoffman (11),
pablo-escobar (11), iraqi-national-congress (10), lashkar-gah (10), abu-ghraib (10+,
captions mangle it), defense-intelligence-agency (10), directorate-of-science-and-technology (10),
eric-prince→covered, army-field-manual (9), chris-hedges (9), uss-abraham-lincoln (9),
mexican-mafia (9), hamid-karzai (9), yasser-arafat (10), muslim-brotherhood (8),
diego-garcia (8), adam-schiff (8), burn-notice (8), brian-becker (14), manila-chan (14),
danny-jones (22), reality-asserts-itself (8), ecuadorian-embassy (14)

Notes:
- Doctrine: cite only John's own words (hosts/other speakers don't count as canon).
- robin-hensel event has other speakers (Brad Olson) — don't cite their claims.
- "carrie" in captions = Senator Kerry. "kofheer" = Cofer Black. "george-tennant" = Tenet.
- Site is FROZEN for deploys — write articles only, no push, no vercel.
