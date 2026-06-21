import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://alignd.care',
  integrations: [
    // Keep the internal design-system reference out of the public sitemap.
    sitemap({ filter: (page) => !page.includes('/design-system') }),
  ],
  output: 'static',
});
