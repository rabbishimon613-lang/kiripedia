import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['People', 'Organizations', 'Places', 'Programs', 'Procedures', 'Events']).optional(),
    categories: z.array(z.string()).optional(),
    summary: z.string().optional(),
    // Optional SEO overrides. `seoTitle` replaces the <title>/OG title (H1 keeps
    // `title`); use when the search-visible title should be more descriptive
    // than the wiki headword. `deck` is a purpose-written ~150-char meta
    // description (front-loaded hook) used instead of the clamped summary.
    seoTitle: z.string().optional(),
    deck: z.string().optional(),
    // Set true to keep a thin/low-value page out of the index (robots noindex,
    // follow). Consolidation candidates get flagged here rather than deleted.
    noindex: z.boolean().optional(),
    infobox: z.record(z.any()).optional(),
    updated: z.string().optional(),
    // Optional real publish date (YYYY-MM-DD). Falls back to git history.
    published: z.string().optional(),
    // Knowledge-graph grounding: link this entity to the global web so Google
    // and LLMs can reconcile it. Emitted as schema.org `sameAs`.
    // `wikidata` accepts a full URL or a bare Q-id (e.g. "Q42").
    // `wikipedia` accepts a full URL or a bare page title.
    wikidata: z.string().optional(),
    wikipedia: z.string().optional(),
    // Auto-aggregated into the homepage "On this day" and /on-this-day page
    events: z.array(z.object({
      date: z.union([z.string(), z.date()]).transform((d) =>
        d instanceof Date ? d.toISOString().slice(0, 10) : d
      ),
      description: z.string(),
    })).optional(),
    // Auto-aggregated into the homepage "Did you know …" pool
    dyk: z.array(z.string()).optional(),
  }),
});

const sources = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/*.sponsors.md'], base: './src/content/sources' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    show: z.string(),
    date: z.union([z.string(), z.date()]).transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d)),
    url: z.string(),
    videoId: z.string().optional(),
    duration: z.string().optional(),
    captionSource: z.enum(['auto', 'manual', 'whisper']).optional(),
    paragraphs: z.number().optional(),
    source_file: z.string().optional(),
  }),
});

export const collections = { articles, sources };
