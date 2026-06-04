import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/components/atoms/**',
        'src/components/molecules/**',
        'src/components/organisms/**',
        'src/components/templates/**',
        'src/services/**',
        'src/store/**',
        'src/utils/**',
      ],
      exclude: [
        '**/*.stories.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/node_modules/**',
        '**/__tests__/**',
        'src/**/*.d.ts',
        'src/test/**',
        'src/locales/**',
        'src/styles/**',
        'src/layouts/**',
        'src/hooks/**',
        'src/pages/**',
        'src/components/pages/**',
        'src/components/atoms/AuthGuard/**',
        'src/components/atoms/Toast/**',
        'src/components/molecules/AdminMatchResultForm/**',
        'src/components/molecules/LoginForm/**',
        'src/components/molecules/RegisterForm/**',
        'src/components/organisms/AdminMatchList/**',
        'src/components/organisms/AdminMatchesPage/**',
        'src/components/organisms/BestPlayersForm/**',
        'src/components/organisms/FinalPhaseForm/**',
        'src/components/organisms/GroupPredictionForm/**',
        'src/components/organisms/KnockoutBracketForm/**',
        'src/components/organisms/PWAInstall/**',
        'src/components/organisms/ToastProvider/**',
      ],
    },
    projects: [
      {
        test: {
          name: 'unit',
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
            '@app-types': resolve(__dirname, './src/types'),
            '@locales': resolve(__dirname, './src/locales'),
          },
        },
      },
      {
        test: {
          name: 'storybook',
          environment: 'happy-dom',
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
        plugins: [
          storybookTest({ configDir: resolve(__dirname, '.storybook') }),
        ],
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
            '@app-types': resolve(__dirname, './src/types'),
            '@locales': resolve(__dirname, './src/locales'),
          },
        },
      },
      {
        test: {
          name: 'functions',
          environment: 'node',
          // Registers the firebase-admin mock before any source module is
          // imported, so top-level `admin.firestore()` calls don't hit the real
          // SDK (which throws "default Firebase app does not exist").
          setupFiles: ['functions/src/__tests__/setup.ts'],
          include: ['functions/src/**/__tests__/**/*.test.ts'],
          globals: true,
          // @ts-expect-error: per-project `coverage` block is supported at runtime
          // by vitest workspaces but not in the public ProjectConfig type. Move to
          // top-level `test.coverage` if/when this gets typed upstream.
          coverage: {
            thresholds: { lines: 60 },
            include: ['functions/src/**'],
            exclude: ['functions/src/**/__tests__/**', 'functions/lib/**'],
          },
        },
      },
      {
        test: {
          name: 'rules',
          environment: 'node',
          include: ['firestore/__tests__/**/*.rules.test.ts'],
          globals: true,
        },
      },
    ],
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
      '@app-types': resolve(__dirname, './src/types'),
      '@locales': resolve(__dirname, './src/locales'),
    },
  },
});
