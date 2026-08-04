import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import trailingSlashLinks from './tools/astro-trailing-slash.mjs';
import { readFileSync } from 'node:fs';

// Real per-article modified dates (last git commit), so the sitemap advertises
// genuine freshness per URL instead of stamping the whole corpus "changed
// today" on every deploy — the same distrust signal we already stripped from
// JSON-LD dateModified. Fail soft to an empty map if the file is missing.
let articleDates = {};
try {
  articleDates = JSON.parse(readFileSync(new URL('./src/data/article-dates.json', import.meta.url), 'utf8'));
} catch { /* keep {} — falls back to build-time lastmod below */ }

export default defineConfig({
  site: 'https://www.kiripedia.org',
  // One canonical URL shape for the whole site. Canonical tags, JSON-LD and the
  // sitemap already used the slash form; the links did not, so Google indexed
  // both and split every page's signals. See tools/astro-trailing-slash.mjs.
  trailingSlash: 'always',
  redirects: {
    // 2026-07-08 video-intake run: merged/typo slugs folded into canonical entries.
    '/wiki/hunter-biden-laptop-letter': '/wiki/hunter-biden-laptop/',
    '/wiki/avril-haynes': '/wiki/avril-haines/',
    '/wiki/kiriakou-recruitment-attempts': '/wiki/recruitment-attempts-on-kiriakou/',
    '/wiki/abraxas-corporation': '/wiki/arrais-corporation/',
    '/wiki/cia-france-rift-1990s': '/wiki/dgse/',
    '/wiki/robert-jackson-federal-prosecutor-speech': '/wiki/pick-the-man-principle/',
    '/wiki/bahrain-dole-campaign-solicitation': '/wiki/david-ransom/',
    // Auto-caption phonetic spellings corrected to the real names (2026-07-29/30).
    // Each was verified against the article's own wikipedia: frontmatter.
    '/wiki/afia-sadiki': '/wiki/aafia-siddiqui/',
    '/wiki/steven-lawless-case': '/wiki/steven-lalas/',
    '/wiki/bruce-fine': '/wiki/bruce-fein/',
    '/wiki/brian-kelly': '/wiki/brian-kelley/',
    '/wiki/sarah-jane-moore': '/wiki/sara-jane-moore/',
    '/wiki/khaled-el-masri': '/wiki/khalid-el-masri/',
    // Duplicate article merged (same Wikidata Q2422025).
    '/wiki/tom-drake': '/wiki/thomas-drake/',
    // Duplicate/typo articles merged into their canonical entries.
    '/wiki/gerald-post': '/wiki/jerome-post/',
    '/wiki/dashti-leyli': '/wiki/dasht-i-leili-massacre/',
    '/wiki/daniel-hail': '/wiki/daniel-hale/',
    '/wiki/russell-tark': '/wiki/russell-targ/',
    '/wiki/steven-saunders': '/wiki/stephen-saunders/',
    '/wiki/intercept': '/wiki/the-intercept/',
    // Wave 1 facet folds (2026-07-05): child sub-articles folded into canonical parents.
    '/wiki/abdul-rashid-dostum': '/wiki/general-dostum/',
    '/wiki/abu-zubaydah-capture': '/wiki/abu-zubaydah/',
    '/wiki/three-saudi-princes': '/wiki/saudi-princes-and-9-11/',
    '/wiki/taliban-origin-benazir': '/wiki/benazir-bhutto/',
    '/wiki/bin-laden-tora-bora-escape': '/wiki/tora-bora/',
    '/wiki/chelsea-manning-emergence': '/wiki/chelsea-manning/',
    '/wiki/daniel-domscheit-berg-wikileaks': '/wiki/daniel-domscheit-berg/',
    '/wiki/julian-assange-political-prisoner': '/wiki/julian-assange/',
    '/wiki/julian-assange-secure-drop': '/wiki/julian-assange/',
    '/wiki/julian-assange-wikileaks-role': '/wiki/julian-assange/',
    '/wiki/church-committee-mk-ultra-investigation': '/wiki/church-committee/',
    '/wiki/cia-insiders-guide-to-lying-and-lie-detection': '/wiki/lie-detection/',
    '/wiki/eric-swallwell-fbi-documents': '/wiki/eric-swallwell/',
    '/wiki/pam-bondi-eric-swallwell': '/wiki/eric-swallwell/',
    '/wiki/pam-bondi-epstein-scandal': '/wiki/pam-bondi/',
    '/wiki/espionage-act-whistleblower-cases': '/wiki/espionage-act/',
    '/wiki/federal-whistleblower-protection-act': '/wiki/whistleblower-protection-act/',
    '/wiki/hypnosis-operation-walk-in': '/wiki/walk-in/',
    '/wiki/john-brennan-tuesday-morning-kill-list': '/wiki/john-brennan/',
    '/wiki/john-kiriakou-whistleblower-advice': '/wiki/john-kiriakou/',
    '/wiki/ray-mcgovern-vault-7': '/wiki/vault-7/',
    '/wiki/thin-thread-stellar-wind': '/wiki/thin-thread/',
    '/wiki/vault-7-revelations': '/wiki/vault-7/',
    // Wave 3 mini-merge (2026-07-05): WikiLeaks stubs subsumed by wikileaks-as-a-system.
    '/wiki/wikileaks-and-trump': '/wiki/wikileaks-as-a-system/',
    '/wiki/wikileaks-arab-spring': '/wiki/wikileaks-as-a-system/',
    '/wiki/wikileaks-ngo-transformation': '/wiki/wikileaks-as-a-system/',
    '/wiki/wikileaks-post-2010': '/wiki/wikileaks-as-a-system/',
    // Fold: duplicate spelling of Anwar al-Awlaki.
    '/wiki/anoir-alaki': '/wiki/anwar-al-awlaki/',
  },
  integrations: [
    mdx(),
    trailingSlashLinks(),
    sitemap({
      // Keep thin/utility pages out of the sitemap: don't advertise the
      // robots-blocked /search, the /random redirect endpoint, or low-value
      // maintenance/index pages. These are also noindex'd at the page level.
      filter: (page) =>
        !/\/(search|random|needs-image|on-this-day|recent-changes|special\/all-pages)\/?$/.test(page),
      // Articles and stable browse pages get higher priority + weekly cadence.
      // Date-driven pages (on-this-day, sources/X) get daily.
      changefreq: 'weekly',
      priority: 0.7,
      // No blanket `lastmod: new Date()`. A build-time stamp is a lie for every
      // page whose content did not change, and it had a concrete cost: the
      // nightly IndexNow sweep diffs on lastmod, so 876 unchanged URLs were
      // being resubmitted to Bing/Yandex on every single deploy. Each branch
      // below sets a real date where one exists and deletes lastmod where none
      // does — omitting it is valid sitemap XML and reads as "unknown" rather
      // than as "changed just now".
      serialize(item) {
        delete item.lastmod;
        if (item.url.includes('/wiki/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
          // Stamp the article's real last-commit date, not the build time.
          const slug = item.url.replace(/.*\/wiki\//, '').replace(/\/$/, '');
          const mod = articleDates[slug]?.modified;
          if (mod) item.lastmod = new Date(`${mod}T00:00:00Z`).toISOString();
        } else if (item.url.includes('/sources/')) {
          // Source pages are immutable transcripts: the publication date in the
          // slug is the only date they will ever have.
          item.priority = 0.6;
          item.changefreq = 'yearly';
          const d = /\/sources\/(\d{4}-\d{2}-\d{2})/.exec(item.url);
          if (d) item.lastmod = new Date(`${d[1]}T00:00:00Z`).toISOString();
        } else if (item.url.endsWith('www.kiripedia.org/')) {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.includes('/on-this-day') || item.url.includes('/sources')) {
          item.priority = 0.6;
          item.changefreq = 'daily';
        } else if (item.url.includes('/category/')) {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        }
        return item;
      },
    }),
  ],
});
