import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, '../phase2'),
    },
  },
  server: {
    fs: {
      allow: ['..'],   // allow reading files outside website/ root (phase2/)
    },
  },
})
