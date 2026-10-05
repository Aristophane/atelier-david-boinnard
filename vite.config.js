import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  publicDir: 'public',
  server: {
    port: 5273,
    strictPort: true,
    host: true
  },
  preview: {
    port: 5273,
    strictPort: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
