import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standalone React SPA build (replaces the old electron-vite config).
// The production bundle is emitted into the Python package so the Flask
// backend can serve it directly.
export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  base: '/',
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  },
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'src/services/vameApi/vame_app/web'),
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 5173
  }
})
