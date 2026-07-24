import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@devslab/vue-date-rail': resolve(__dirname, '../src/index.ts'),
    },
  },
  build: {
    outDir: resolve(__dirname, '../demo-dist'),
    emptyOutDir: true,
  },
});
