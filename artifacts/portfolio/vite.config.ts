import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

// Opt-in local development proxy. When API_PORT is set,
// forward same-origin API paths to the API service so relative `/api` calls
// reach the API service. Preserves the browser Host header for
// cookie-authenticated requests. No effect in production.
const apiPort = process.env.API_PORT ? Number(process.env.API_PORT) : undefined;

const devProxy =
  apiPort && !Number.isNaN(apiPort) && apiPort > 0
    ? {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: false,
        },
        '/sitemap.xml': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: false,
        },
        '/robots.txt': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: false,
        },
      }
    : undefined;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    ...(devProxy ? { proxy: devProxy } : {}),
    fs: {
      strict: true,
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/uploads/**"],
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
