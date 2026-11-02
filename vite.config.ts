import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is injected at build time so the same source works on a domain root
// or on a GitHub Pages project path (VITE_BASE=/repo-name/).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1800,
  },
})
