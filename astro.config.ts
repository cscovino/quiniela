import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: 'es',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@atoms': path.resolve('./src/components/atoms'),
        '@molecules': path.resolve('./src/components/molecules'),
        '@organisms': path.resolve('./src/components/organisms'),
        '@templates': path.resolve('./src/components/templates'),
        '@layouts': path.resolve('./src/layouts'),
        '@styles': path.resolve('./src/styles'),
        '@utils': path.resolve('./src/utils'),
        '@hooks': path.resolve('./src/hooks'),
        '@store': path.resolve('./src/store'),
        '@services': path.resolve('./src/services'),
        '@types': path.resolve('./src/types'),
        '@locales': path.resolve('./src/locales'),
      },
    },
  },
});
