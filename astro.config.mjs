import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kiripedia.org',
  integrations: [
    mdx(),
    sitemap({
      // Articles and stable browse pages get higher priority + weekly cadence.
      // Date-driven pages (on-this-day, sources/X) get daily.
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url.includes('/wiki/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.endsWith('kiripedia.org/')) {
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
