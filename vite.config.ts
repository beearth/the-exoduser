import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 7000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
