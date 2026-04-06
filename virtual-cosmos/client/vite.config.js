import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Why Vite?
// - Instant HMR (Hot Module Replacement) — critical for fast canvas dev iteration
// - Native ESM — works perfectly with PixiJS tree-shaking
// - No webpack config hell (KISS)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the backend — avoids CORS during development (DRY: one origin)
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:4000', ws: true, changeOrigin: true },
    },
  },
});
