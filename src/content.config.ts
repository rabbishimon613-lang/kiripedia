import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['People', 'Agencies', 'Operations', 'Events', 'Concepts', 'Cases', 'Places']).optional(),
    categories: z.array(z.string()).optional(),
    summary: z.string().optional(),
    infobox: z.record(z.any()).optional(),
    updated: z.string().optional(),
    stub: z.boolean().optional(),
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
