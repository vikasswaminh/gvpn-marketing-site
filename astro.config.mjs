import { defineConfig } from 'astro/config';

// Static build — outputs to dist/ which Cloudflare Pages serves directly.
// No SSR adapter needed for a content-only marketing site.
export default defineConfig({
  site: 'https://meshwg.pages.dev',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
