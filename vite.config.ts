import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const _pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const APP_VERSION: string = _pkg.version;

function generateVersionFile() {
  return {
    name: 'generate-version-file',
    writeBundle() {
      const outDir = resolve(__dirname, 'dist');
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'version'), APP_VERSION, 'utf-8');
      console.log(`\x1b[32m✓\x1b[0m Generated version file: ${APP_VERSION}`);
    },
  };
}

export default defineConfig({
  server: {
    open: true,
    port: 3000,
    host: true,
    proxy: {
      // 开发态：前端 (/api/**) 经 Vite 代理转发到后端 dashboard，避免跨域。
      // 生产态前端与后端同源（:6285 托管 dist），无需代理。
      '/api': {
        target: 'http://localhost:6285',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
  preview: {
    open: true,
    host: true,
  },
  define: {
    global: 'window',
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(APP_VERSION),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [react(), tailwindcss(), viteTsconfigPaths(), generateVersionFile()],
});
