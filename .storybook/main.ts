import type { StorybookConfig } from '@storybook/react-vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': resolve(__dirname, '../src'),
          '@atoms': resolve(__dirname, '../src/components/atoms'),
          '@molecules': resolve(__dirname, '../src/components/molecules'),
          '@organisms': resolve(__dirname, '../src/components/organisms'),
          '@templates': resolve(__dirname, '../src/components/templates'),
          '@layouts': resolve(__dirname, '../src/layouts'),
          '@styles': resolve(__dirname, '../src/styles'),
          '@utils': resolve(__dirname, '../src/utils'),
          '@hooks': resolve(__dirname, '../src/hooks'),
          '@store': resolve(__dirname, '../src/store'),
          '@services': resolve(__dirname, '../src/services'),
          '@types': resolve(__dirname, '../src/types'),
          '@locales': resolve(__dirname, '../src/locales'),
        },
      },
    };
  },
};

export default config;
