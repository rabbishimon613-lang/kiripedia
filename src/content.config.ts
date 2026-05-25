import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['People', 'Organizations', 'Places', 'Programs', 'Tradecraft', 'Events']).optional(),
    categories: z.array(z.string()).optional(),
    summary: z.string().optional(),
    infobox: z.record(z.any()).optional(),
    updated: z.string().optional(),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/sources' }),
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
