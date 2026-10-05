// Astro Content Collections configuration (Astro 5 syntax).
// Guides are Markdown files stored in src/content/guides/*.md
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    // Title of the listicle, e.g. "10 useful kitchen gadgets under ₹500"
    title: z.string(),
    // 1-2 sentence summary shown on the guides index and in meta tags
    description: z.string(),
    // Publish date (YYYY-MM-DD)
    date: z.coerce.date(),
    // Optional last-updated date
    updated: z.coerce.date().optional(),
    // Optional cover image path inside /public
    cover: z.string().optional(),
    // IDs of products from products.json to render as cards inside the guide
    products: z.array(z.string()).default([]),
  }),
});

export const collections = { guides };
