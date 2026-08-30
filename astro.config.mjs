import { defineConfig } from 'astro/config';
import alpinejs  from '@astrojs/alpinejs';
import sitemap   from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://riversidegdansk.github.io/',
  integrations: [
  alpinejs(),
  sitemap({
    filter: (page) =>
      !page.includes('/privacy/') &&
      !page.includes('/terms/')
  }),
],
  image: {
    domains: ['res.cloudinary.com'],
  },
  output: 'static',
  vite: {
  server: {
    open: '/',
  },
  plugins: [tailwindcss()],
},
});
