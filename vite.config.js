import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function vendorChunk(id) {
  if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react-vendor';
  if (/node_modules\/(@mui|@emotion|@popperjs)\//.test(id)) return 'mui';
  if (/node_modules\/(leaflet|react-leaflet|@react-leaflet)\//.test(id)) return 'maps';
  if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
  if (/node_modules\/(moment|moment-timezone|dayjs|date-fns|date-fns-tz)\//.test(id)) return 'dates';
  return undefined; // let Rollup split the rest (keeps lazy-only libs like jspdf async)
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/',
  server: {
    allowedHosts: true,
    proxy: {
      "/partner-app": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return vendorChunk(id);
          }
        },
      },
    },
  },
});