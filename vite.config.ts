import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  base: '/ForgeOfWorlds/', // GitHub Pages repository name

  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // import.meta.dirname (Node 20.11+) en lugar de __dirname, que no existe
      // en módulos ESM (este proyecto es "type": "module").
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
