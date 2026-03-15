import path from 'node:path';

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const srcDir = path.resolve(__dirname, 'src');

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': srcDir,
      '@assets': path.resolve(srcDir, 'assets'),
      '@auth': path.resolve(srcDir, 'auth'),
      '@components': path.resolve(srcDir, 'components'),
      '@constants': path.resolve(srcDir, 'constants'),
      '@data': path.resolve(srcDir, 'data'),
      '@lib': path.resolve(srcDir, 'lib'),
      '@queries': path.resolve(srcDir, 'queries'),
      '@routes': path.resolve(srcDir, 'routes'),
      '@service': path.resolve(srcDir, 'service'),
      '@test': path.resolve(srcDir, 'test'),
      '@types': path.resolve(srcDir, 'types'),
      '@utils': path.resolve(srcDir, 'utils'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
