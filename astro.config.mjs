import { defineConfig } from 'astro/config'

// arc-editor is a pure admin interface — no public pages, no SSR routes.
// Static output is served via a Cloudflare Worker with an assets binding.
export default defineConfig({
  output: 'static',
})
