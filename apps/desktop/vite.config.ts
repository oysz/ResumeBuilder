import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@resume-builder/core': path.resolve(__dirname, '../../packages/core/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    assetsDir: 'assets',
  },
})
