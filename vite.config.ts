import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // Served from https://<user>.github.io/ciso-thegame/ on GitHub Pages.
  base: process.env.GITHUB_PAGES ? '/ciso-thegame/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
