import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { site } from './src/config.js'

// Injects the canonical domain from src/config.js into index.html at build/dev
// time, so canonical/OG/JSON-LD URLs always match `site.siteUrl` — change the
// domain in ONE place (config.js) and everything follows.
function injectSiteUrl() {
  return {
    name: 'gp-inject-site-url',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', site.siteUrl)
    },
  }
}

export default defineConfig({
  plugins: [react(), injectSiteUrl()],
})
