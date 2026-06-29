// title-from-slug: the canonical way to convert a kebab-case slug into a
// display title. Used by the Coordinator when spawning new articles and by
// the Enricher when rendering See also blocks.
//
// The naive "capitalize each word" pass mangles acronyms — "fbi" became
// "Fbi" in dozens of articles before this lived in one place. A small
// whitelist covers the acronyms that show up across Kiriakou's appearances.

const ACRONYMS = new Set([
  // Intelligence + law enforcement
  'fbi', 'cia', 'nsa', 'dhs', 'doj', 'dod', 'dia', 'nro', 'jsoc', 'nsc',
  'kgb', 'gru', 'svr', 'mi5', 'mi6', 'mossad', 'isi', 'sis', 'dea', 'atf',
  'tsa', 'oss', 'gao', 'sec', 'irs',
  // Carceral system
  'rdap', 'fci', 'mcc', 'usp', 'bop',
  // Legal frameworks (acronyms only — ndaa, fisa, foia are recognisable)
  'ndaa', 'fisa', 'foia', 'faa', 'fda',
  // Initials of well-known figures
  'rfk', 'jfk', 'fdr', 'lbj',
  // Geographies + military branches
  'us', 'usa', 'uk', 'usaf', 'usmc', 'nato', 'eu', 'un', 'idf', 'plo',
  // Universities + media outlets
  'gwu', 'mit', 'ucla', 'pbs', 'npr', 'cnn', 'msnbc', 'bbc', 'abc', 'cbs',
  'nbc', 'wsj', 'nyt', 'lat',
  // Other useful uppercase tokens
  'tv', 'scif', 'sdr',
]);
// Deliberately omitted (too ambiguous with common English words or names):
// 'ai' (Ai Weiwei), 'is' (verb), 'pa' (Pennsylvania initials clash w/ names),
// 'rt' (also "art" abbreviation), 'la' / 'ny' / 'dc' (lower-case place styles).

const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on',
  'or', 'the', 'to', 'vs', 'with', 'via', 'over',
]);

export function titleFromSlug(slug) {
  // Strip trailing 4-digit year (some slugs end with "-2026" etc.)
  const parts = slug.split('-');
  return parts.map((w, i) => {
    if (!w) return w;
    const lw = w.toLowerCase();
    if (ACRONYMS.has(lw)) return lw.toUpperCase();
    // 4-digit number → as-is
    if (/^\d+$/.test(w)) return w;
    // Roman numerals via acronym table covers I/II/III/etc.
    // Small words lowercase unless first
    if (i > 0 && SMALL_WORDS.has(lw)) return lw;
    return w[0].toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

// Read an article's actual title from its MDX frontmatter. Returns null if
// no file or no title field. Useful when you want the canonical title that
// was written into the article rather than re-deriving from the slug.
export function readArticleTitle(articlesDir, slug, readFileSync) {
  const path = `${articlesDir}/${slug}.mdx`;
  try {
    const raw = readFileSync(path, 'utf8');
    const m = raw.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
    if (m) return m[1].replace(/''/g, "'");
  } catch {}
  return null;
}
