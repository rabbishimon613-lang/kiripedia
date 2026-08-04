// Astro integration: normalize every internal link in the built HTML to end
// with a trailing slash.
//
// Why this exists. Canonical tags, JSON-LD `url`/`mainEntityOfPage` and the
// sitemap have always emitted the slash form (`/wiki/hummus/`), but every link
// the site actually renders — nav, breadcrumbs, category lists, and the ~10k
// wikilinks inside article bodies — pointed at the slash-less form. Google
// therefore discovered, crawled and stored BOTH URLs for the whole corpus:
// Search Console showed /wiki/hummus/ at 347 impressions sitting next to
// /wiki/hummus at 257, and 340 URLs parked under "Alternate page with proper
// canonical". Canonical was doing its job, but the site was paying twice for
// every page in crawl budget and splitting its own ranking signals in half.
// The same split was visible in the internal-link report, where
// /category/procedures (1,467 links) and /category/people/ (1,466) were
// counted as different pages.
//
// Fixing this at the template level would mean editing every .astro href and
// every MDX body link, and would silently regress the first time someone typed
// a link without the slash. Rewriting the emitted HTML once, at the end of the
// build, is one mechanism with total coverage.
//
// Pairs with `trailingSlash: true` in vercel.json, which 308s the slash-less
// form at the edge so already-indexed URLs and inbound links consolidate too.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

// Left alone: protocol-relative and absolute URLs, anchors, queries, mailto/
// tel, and anything that looks like a file (/og.png, /rss.xml, /llms.txt).
const SKIP_PREFIX = /^(https?:|\/\/|#|\?|mailto:|tel:|data:)/i;

function normalize(href) {
  if (!href || SKIP_PREFIX.test(href)) return href;
  if (!href.startsWith('/')) return href;              // relative — leave it
  // Split off #fragment / ?query so the slash lands on the path, not after it.
  const m = /^([^?#]*)([?#].*)?$/.exec(href);
  let path = m[1];
  const rest = m[2] ?? '';
  if (!path || path.endsWith('/')) return href;
  if (extname(path)) return href;                       // /og.png, /sitemap.xml
  return `${path}/${rest}`;
}

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (extname(e.name) === '.html') yield p;
  }
}

export default function trailingSlashLinks() {
  return {
    name: 'kiripedia:trailing-slash-links',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let files = 0;
        let rewritten = 0;
        for await (const file of htmlFiles(dir.pathname)) {
          const html = await readFile(file, 'utf8');
          let n = 0;
          const out = html.replace(/href="([^"]*)"/g, (whole, href) => {
            const fixed = normalize(href);
            if (fixed === href) return whole;
            n++;
            return `href="${fixed}"`;
          });
          files++;
          if (n) {
            rewritten += n;
            await writeFile(file, out);
          }
        }
        logger.info(`trailing slashes: ${rewritten} links normalized across ${files} pages`);
      },
    },
  };
}
