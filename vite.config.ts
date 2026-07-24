import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueDateRail',
      fileName: (format) => {
        if (format === 'es') return 'vue-date-rail.es.js';
        if (format === 'cjs') return 'vue-date-rail.cjs.js';
        return `vue-date-rail.${format}.js`;
      },
      formats: ['es', 'cjs'],
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    cssCodeSplit: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
