import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src',
  base: '/jrfisioterapia/docs/',
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
