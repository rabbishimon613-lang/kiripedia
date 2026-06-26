// The KiriPedia editorial bureau — every bot, with a full name, role,
// description, and grid position in the /meet-the-team office canvas.
//
// Grid coordinates: col/row in a (GRID_COLS × GRID_ROWS) tile floor.
// shortLabel  → drawn under the character on the canvas (must fit ~3 tiles wide)
// name        → full name in hover cards and the roster

export const GRID_COLS = 22;
export const GRID_ROWS = 12;

export const BOTS = [
  // --- Discovery + vetting (left column, vertical) -----------------------
  {
    key: 'recent-changes',
    name: 'Recent Changes Bot',
    shortLabel: 'Recent Changes',
    role: 'Discovery',
    color: '#36c',
    chair: { col: 2, row: 2 },
    description: 'Watches YouTube and podcast feeds every six hours for anything new on channels where John has appeared before. No AI involved — just a methodical checklist, flagging new uploads and passing them along.',
    handoffTo: 'npp',
  },
  {
    key: 'npp',
    name: 'New Page Patroller',
    shortLabel: 'New Page Patrol',
    role: 'Triage',
    color: '#5a9',
    chair: { col: 2, row: 5 },
    description: 'Reviews every new video that comes in and asks a simple question: is John actually speaking in this one, or is it just a news report about him? Interviews and appearances move forward; everything else is quietly set aside.',
    handoffTo: 'source-auth',
  },
  {
    key: 'source-auth',
    name: 'Source Authentication Clerk',
    shortLabel: 'Source Auth',
    role: 'Vetting',
    color: '#888',
    chair: { col: 2, row: 8 },
    description: 'When a video comes from a channel the bureau has never encountered before, this desk checks whether it is a real interview show or just someone re-uploading other people\'s content. Genuine venues get added to the trusted list; impersonators are turned away.',
    handoffTo: 'scribe-1',
  },

  // --- Scribe pool (top middle, spaced 4 cols apart) ---------------------
  {
    key: 'scribe-1',
    name: 'Scribe (First Desk)',
    shortLabel: 'Scribe 1',
    role: 'Transcription',
    color: '#b85',
    chair: { col: 7, row: 2 },
    description: 'Downloads the video, pulls the captions, and turns them into a clean, timestamped transcript — cutting out sponsor segments so the research copy contains only John speaking. One of three scribes working in parallel.',
    handoffTo: 'cataloger-1',
  },
  {
    key: 'scribe-2',
    name: 'Scribe (Second Desk)',
    shortLabel: 'Scribe 2',
    role: 'Transcription',
    color: '#b85',
    chair: { col: 11, row: 2 },
    description: 'Does the same job as the first scribe — clean transcripts in, research-ready copy out. Transcription is the slowest part of the whole operation, so three desks share the load to keep the pipeline moving.',
    handoffTo: 'cataloger-2',
  },
  {
    key: 'scribe-3',
    name: 'Scribe (Third Desk)',
    shortLabel: 'Scribe 3',
    role: 'Transcription',
    color: '#b85',
    chair: { col: 15, row: 2 },
    description: 'The third transcription desk. Like its two counterparts, it takes raw captions and produces a clean, structured transcript. No AI judgment involved — this is mechanical, reliable work done the same way every time.',
    handoffTo: 'cataloger-1',
  },

  // --- Cataloger pool (middle middle) ------------------------------------
  {
    key: 'cataloger-1',
    name: 'Cataloger-Editor (First Desk)',
    shortLabel: 'Cataloger 1',
    role: 'Claim Extraction',
    color: '#963',
    chair: { col: 8, row: 5 },
    description: 'Reads through a finished transcript and pulls out every factual claim worth keeping — noting the exact quote, the timestamp it came from, and which article on the wiki it belongs in. One of two catalogers working side by side.',
    handoffTo: 'reviewer',
  },
  {
    key: 'cataloger-2',
    name: 'Cataloger-Editor (Second Desk)',
    shortLabel: 'Cataloger 2',
    role: 'Claim Extraction',
    color: '#963',
    chair: { col: 12, row: 5 },
    description: 'The second cataloging desk, handling transcripts in parallel with the first. It does the same work — extracting claims, noting sources, deciding which article each one belongs to — so the bureau can process two transcripts at once.',
    handoffTo: 'reviewer',
  },

  // --- Reviewer + Coordinator (bottom middle) ----------------------------
  {
    key: 'reviewer',
    name: 'Grounding Reviewer',
    shortLabel: 'Reviewer',
    role: 'Verification',
    color: '#a36',
    chair: { col: 8, row: 8 },
    description: 'The bureau\'s fact-checker. Before anything reaches the wiki, this desk confirms that the quoted words actually appear in the transcript at the stated timestamp, that the source is on the trusted channel list, and that the claim is about a subject John is discussing — not a personal claim about John himself. Anything that fails goes into permanent quarantine.',
    handoffTo: 'coordinator',
  },
  {
    key: 'coordinator',
    name: 'WikiProject Coordinator',
    shortLabel: 'Coordinator',
    role: 'Publishing',
    color: '#36c',
    chair: { col: 12, row: 8 },
    description: 'The only member of the bureau that actually writes to the wiki. It gathers all the claims that have cleared review, sorts them by article, drafts the additions, and commits everything to the repository. It works alone and in sequence — never two instances at once — so there are no conflicts and the wiki is always in a clean state.',
    handoffTo: 'indexer',
  },

  // --- Steady-state pool (right column) ----------------------------------
  {
    key: 'deepener',
    name: 'Transcript Deepener',
    shortLabel: 'Deepener',
    role: 'Steady-State',
    color: '#693',
    chair: { col: 19, row: 2 },
    description: 'Goes back through transcripts that have already been cataloged and reads them again more carefully — listening for the offhand remarks, the names dropped in passing, the qualifications buried in a long answer. The first pass catches the obvious; this desk catches what the first pass missed.',
    handoffTo: 'reviewer',
  },
  {
    key: 'enricher',
    name: 'Cross-Source Enricher',
    shortLabel: 'Enricher',
    role: 'Steady-State',
    color: '#693',
    chair: { col: 19, row: 5 },
    description: 'Looks across the full body of sources and asks: every time a subject comes up in a different interview, does the article about that subject know about it? When it finds a gap — a mention with no corresponding citation — it drafts the addition.',
    handoffTo: 'reviewer',
  },
  {
    key: 'weaver',
    name: 'Article Weaver',
    shortLabel: 'Weaver',
    role: 'Cohesion',
    color: '#c63',
    chair: { col: 19, row: 8 },
    description: 'As claims accumulate, articles can become long lists of loosely connected fragments. Once a day, this desk selects the most cluttered article and rewrites its structure — turning scattered additions into a coherent narrative with clear sections. Every quote and citation is preserved exactly; only the shape of the piece changes.',
    handoffTo: 'coordinator',
  },
  {
    key: 'indexer',
    name: 'Indexer',
    shortLabel: 'Indexer',
    role: 'Publishing',
    color: '#888',
    chair: { col: 16, row: 8 },
    description: 'After every publishing cycle, updates the search index and the internal map of who mentions what across the whole wiki. Fast, quiet, runs in seconds.',
    handoffTo: null,
  },
];

export const BOT_BY_KEY = Object.fromEntries(BOTS.map(b => [b.key, b]));
