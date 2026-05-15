import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@atoms': resolve(__dirname, './src/components/atoms'),
      '@molecules': resolve(__dirname, './src/components/molecules'),
      '@organisms': resolve(__dirname, './src/components/organisms'),
      '@templates': resolve(__dirname, './src/components/templates'),
      '@layouts': resolve(__dirname, './src/layouts'),
      '@styles': resolve(__dirname, './src/styles'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@store': resolve(__dirname, './src/store'),
      '@services': resolve(__dirname, './src/services'),
      '@types': resolve(__dirname, './src/types'),
      '@locales': resolve(__dirname, './src/locales'),
    },
  },
});
