import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5199,
    proxy: {
      '/api': 'http://localhost:8787',
      // Published sites live under /s/<slug>/. Keep the trailing slash so this
      // prefix can't swallow the app's own /src/* module requests in dev.
      '/s/': 'http://localhost:8787',
    },
  },
})
