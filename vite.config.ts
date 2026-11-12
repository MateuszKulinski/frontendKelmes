import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@admin': path.resolve(__dirname, './src/views/admin'),
      '@site': path.resolve(__dirname, './src/views/site'),
      '@shared': path.resolve(__dirname, './src/views/shared'),
      '@topbar': path.resolve(__dirname, './src/views/site/layouts/components/header/topbar'),
      '@entities': path.resolve(__dirname, './src/composables/types'),
    },
  },
})