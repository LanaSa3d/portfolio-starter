import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from /<repo-name>/ — the deploy workflow sets VITE_BASE.
// Absolute site URL for canonical / Open Graph tags (set by the deploy workflow).
const SITE_URL = (process.env.SITE_URL || '/').replace(/\/?$/, '/');

const siteUrlPlugin = {
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
};

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), siteUrlPlugin],
  server: { port: 3000 },
  build: {
    assetsDir: 'static',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
