import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// Static build — outputs to dist/ which Cloudflare Pages serves directly.
// No SSR adapter needed for a content-only marketing site.
export default defineConfig({
  // Canonical hostname for sitemap / OG / robots. Custom domain is set
  // on the Cloudflare Pages project; meshwg.pages.dev still works as a
  // fallback.
  site: 'https://meshwg.com',

  output: 'static',

  build: {
    inlineStylesheets: 'auto',
  },

  integrations: [sitemap()],
});