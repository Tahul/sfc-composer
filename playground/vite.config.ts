import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['path-browserify', '@vue/language-service', 'monaco-editor-core'],
  },
  build: {
    minify: false,
    outDir: resolve(__dirname, './out'),
  },
  resolve: {
    alias: {
      'sfc-composer': resolve(__dirname, '../src/index.ts'),
      'path': 'path-browserify',
    },
  },
  plugins: [vue()],
})
