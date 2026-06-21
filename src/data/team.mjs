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
    description: 'Polls YouTube and podcast feeds every six hours, looking for new uploads on channels that have hosted John Kiriakou before. No LLM — pure rule-based filtering. Hands new leads to the Patroller.',
    handoffTo: 'npp',
  },
  {
    key: 'npp',
    name: 'New Page Patroller',
    shortLabel: 'New Page Patrol',
    role: 'Triage',
    color: '#5a9',
    chair: { col: 2, row: 5 },
    description: 'Triages every new lead: is John actually speaking in this video, or is it a news clip about him? Off-corpus leads are archived; on-corpus leads move to vetting. Runs every fifteen minutes.',
    handoffTo: 'source-auth',
  },
  {
    key: 'source-auth',
    name: 'Source Authentication Clerk',
    shortLabel: 'Source Auth',
    role: 'Vetting',
    color: '#888',
    chair: { col: 2, row: 8 },
    description: 'When a clip appears on a channel never seen before, the Clerk verifies the venue is legitimate — a real long-form interview show, not a reupload farm — and adds it to the trusted list of fishing grounds.',
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
    description: 'Pulls the original audio with yt-dlp, fetches the English auto-captions, normalizes the VTT into a paragraph-timestamped source file, and strips sponsor reads to a sidecar. One of three parallel scribes.',
    handoffTo: 'cataloger-1',
  },
  {
    key: 'scribe-2',
    name: 'Scribe (Second Desk)',
    shortLabel: 'Scribe 2',
    role: 'Transcription',
    color: '#b85',
    chair: { col: 11, row: 2 },
    description: 'Second of the three transcribers. Transcription is the slowest stage in the pipeline, so the workload is spread across three parallel desks pulling captions in parallel.',
    handoffTo: 'cataloger-2',
  },
  {
    key: 'scribe-3',
    name: 'Scribe (Third Desk)',
    shortLabel: 'Scribe 3',
    role: 'Transcription',
    color: '#b85',
    chair: { col: 15, row: 2 },
    description: 'Third of the three transcribers. Captions in, normalized source markdown out. No LLM use — entirely deterministic plumbing.',
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
    description: 'Reads the freshly normalized transcript in segments and extracts atomic claims: one verbatim quote, one timestamp, one target article slug, one MDX patch. Routes each claim to the right article in one structured LLM call.',
    handoffTo: 'reviewer',
  },
  {
    key: 'cataloger-2',
    name: 'Cataloger-Editor (Second Desk)',
    shortLabel: 'Cataloger 2',
    role: 'Claim Extraction',
    color: '#963',
    chair: { col: 12, row: 5 },
    description: 'Second cataloger desk. The merged Cataloger-Editor role does what was previously two separate stages — claim extraction and article routing — in one Cerebras call, halving the LLM cost on the hottest path.',
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
    description: 'Runs every proposed claim through the grounding stack: verbatim quote must appear in the source VTT; timestamp must round-trip to a real cue; channel must be on the trusted list; voice contamination is forbidden; biographical claims about Kiriakou himself quarantine forever.',
    handoffTo: 'coordinator',
  },
  {
    key: 'coordinator',
    name: 'WikiProject Coordinator',
    shortLabel: 'Coordinator',
    role: 'Publishing',
    color: '#36c',
    chair: { col: 12, row: 8 },
    description: 'The only writer in the bureau. Collects every passed claim from the truth store, groups them by article, runs the scaffolder, audits the result, and commits the changes to git. Runs sequentially — never in parallel — to keep the repo from racing with itself.',
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
    description: 'Re-mines existing transcripts with stricter prompts to catch the subtler claims that the first pass missed — hedges, asides, throwaway names. Quiet during backfill; busy afterwards.',
    handoffTo: 'reviewer',
  },
  {
    key: 'enricher',
    name: 'Cross-Source Enricher',
    shortLabel: 'Enricher',
    role: 'Steady-State',
    color: '#693',
    chair: { col: 19, row: 5 },
    description: 'For every article, checks the mentions index: does each cross-source mention of this subject have a citation here? Drafts enrichment patches to close the gaps.',
    handoffTo: 'reviewer',
  },
  {
    key: 'weaver',
    name: 'Article Weaver',
    shortLabel: 'Weaver',
    role: 'Cohesion',
    color: '#c63',
    chair: { col: 19, row: 8 },
    description: 'Once a day, picks the article most cluttered with stub sections from cumulative enrichment, and reweaves it into a coherent encyclopedic tapestry under a small spine of headers. Preserves every quote and citation verbatim.',
    handoffTo: 'coordinator',
  },
  {
    key: 'indexer',
    name: 'Indexer',
    shortLabel: 'Indexer',
    role: 'Publishing',
    color: '#888',
    chair: { col: 16, row: 8 },
    description: 'After each cycle, rebuilds the search index, the date-pointer index, and the mentions graph. Pure code, runs in seconds.',
    handoffTo: null,
  },
];

export const BOT_BY_KEY = Object.fromEntries(BOTS.map(b => [b.key, b]));
