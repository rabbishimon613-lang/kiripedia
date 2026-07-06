import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.kiripedia.org',
  redirects: {
    // Duplicate/typo articles merged into their canonical entries.
    '/wiki/dashti-leyli': '/wiki/dasht-i-leili-massacre',
    '/wiki/daniel-hail': '/wiki/daniel-hale',
    '/wiki/russell-tark': '/wiki/russell-targ',
    '/wiki/steven-saunders': '/wiki/stephen-saunders',
    '/wiki/intercept': '/wiki/the-intercept',
    // Wave 1 facet folds (2026-07-05): child sub-articles folded into canonical parents.
    '/wiki/abdul-rashid-dostum': '/wiki/general-dostum',
    '/wiki/abu-zubaydah-capture': '/wiki/abu-zubaydah',
    '/wiki/three-saudi-princes': '/wiki/abu-zubaydah',
    '/wiki/taliban-origin-benazir': '/wiki/benazir-bhutto',
    '/wiki/bin-laden-tora-bora-escape': '/wiki/tora-bora',
    '/wiki/chelsea-manning-emergence': '/wiki/chelsea-manning',
    '/wiki/daniel-domscheit-berg-wikileaks': '/wiki/daniel-domscheit-berg',
    '/wiki/julian-assange-political-prisoner': '/wiki/julian-assange',
    '/wiki/julian-assange-secure-drop': '/wiki/julian-assange',
    '/wiki/julian-assange-wikileaks-role': '/wiki/julian-assange',
    '/wiki/church-committee-mk-ultra-investigation': '/wiki/church-committee',
    '/wiki/cia-insiders-guide-to-lying-and-lie-detection': '/wiki/lie-detection',
    '/wiki/eric-swallwell-fbi-documents': '/wiki/eric-swallwell',
    '/wiki/pam-bondi-eric-swallwell': '/wiki/eric-swallwell',
    '/wiki/pam-bondi-epstein-scandal': '/wiki/pam-bondi',
    '/wiki/espionage-act-whistleblower-cases': '/wiki/espionage-act',
    '/wiki/federal-whistleblower-protection-act': '/wiki/whistleblower-protection-act',
    '/wiki/hypnosis-operation-walk-in': '/wiki/walk-in',
    '/wiki/john-brennan-tuesday-morning-kill-list': '/wiki/john-brennan',
    '/wiki/john-kiriakou-whistleblower-advice': '/wiki/john-kiriakou',
    '/wiki/ray-mcgovern-vault-7': '/wiki/vault-7',
    '/wiki/thin-thread-stellar-wind': '/wiki/thin-thread',
    '/wiki/vault-7-revelations': '/wiki/vault-7',
    // Wave 3 mini-merge (2026-07-05): WikiLeaks stubs subsumed by wikileaks-as-a-system.
    '/wiki/wikileaks-and-trump': '/wiki/wikileaks-as-a-system',
    '/wiki/wikileaks-arab-spring': '/wiki/wikileaks-as-a-system',
    '/wiki/wikileaks-ngo-transformation': '/wiki/wikileaks-as-a-system',
    '/wiki/wikileaks-post-2010': '/wiki/wikileaks-as-a-system',
  },
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
