import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const _pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const APP_VERSION: string = _pkg.version;

// 插件：构建时从 package.json 生成 version 文件
function generateVersionFile() {
  return {
    name: 'generate-version-file',
    writeBundle() {
      const outDir = resolve(__dirname, 'dist');
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'version'), APP_VERSION, 'utf-8');
      console.log(`\x1b[32m✓\x1b[0m Generated version file: ${APP_VERSION}`);
    }
  };
}

export default defineConfig({
  server: {
    open: true,
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1600
  },
  preview: {
    open: true,
    host: true
  },
  define: {
    global: 'window',
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(APP_VERSION),
  },
  resolve: {
    alias: {
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs'
    }
  },
  plugins: [react(), viteTsconfigPaths(), generateVersionFile()]
});