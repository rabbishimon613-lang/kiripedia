// Real RSS 2.0 feed. Every page's <head> advertises /rss.xml; before this it
// was a 404. Freshness feeds are a citation signal for AI search and let
// Kiriakou-followers subscribe to new/changed articles. Dependency-free
// (no @astrojs/rss) — we hand-build the XML from the articles collection and
// the git-derived date map.

import { getCollection } from 'astro:content';
import articleDates from '../data/article-dates.json';

const SITE = 'https://www.kiripedia.org';
const MAX_ITEMS = 50;

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const articles = await getCollection('articles');

  const items = articles
    .map((a) => {
      const slug = a.id.replace(/\.mdx?$/, '');
      const d = articleDates[slug] || {};
      const modified = a.data.updated || d.modified || d.published || '2025-01-01';
      return {
        slug,
        title: a.data.title,
        summary: a.data.summary || `John Kiriakou's account of ${a.data.title}.`,
        date: modified,
      };
    })
    .sort((x, y) => (y.date < x.date ? -1 : y.date > x.date ? 1 : 0))
    .slice(0, MAX_ITEMS);

  const lastBuild = new Date().toUTCString();
  const pubDate = (isoDay) => {
    const t = Date.parse(`${isoDay}T12:00:00Z`);
    return isNaN(t) ? lastBuild : new Date(t).toUTCString();
  };

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KiriPedia — recent articles</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>New and recently updated entries in the free encyclopedia of the world as seen through John Kiriakou's eyes.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items
  .map(
    (it) => `    <item>
      <title>${esc(it.title)}</title>
      <link>${SITE}/wiki/${it.slug}/</link>
      <guid isPermaLink="true">${SITE}/wiki/${it.slug}/</guid>
      <pubDate>${pubDate(it.date)}</pubDate>
      <description>${esc(it.summary)}</description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
