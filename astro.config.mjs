// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// NOTE: Keep this `site` value in sync with src/config.ts -> SITE.url.
// If you add a custom domain later, change it in BOTH places.
const SITE_URL = 'https://harifinds.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Fully static site -> deployable to Cloudflare Pages, output goes to /dist
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Inline small stylesheets for faster first paint (better Lighthouse score)
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      // The 404 page should never appear in the sitemap.
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
