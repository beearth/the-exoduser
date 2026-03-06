import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 7000,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
      Expires: '0',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
