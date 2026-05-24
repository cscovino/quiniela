import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },
  integrations: [react()],
  trailingSlash: 'never',
  image: {
    domains: ['flagicons.lipis.dev', 'flagcdn.com', 'upload.wikimedia.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.flagcdn.com',
      },
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@atoms': path.resolve('./src/components/atoms'),
        '@molecules': path.resolve('./src/components/molecules'),
        '@organisms': path.resolve('./src/components/organisms'),
        '@templates': path.resolve('./src/components/templates'),
        '@pages': path.resolve('./src/components/pages'),
        '@layouts': path.resolve('./src/layouts'),
        '@styles': path.resolve('./src/styles'),
        '@utils': path.resolve('./src/utils'),
        '@hooks': path.resolve('./src/hooks'),
        '@store': path.resolve('./src/store'),
        '@services': path.resolve('./src/services'),
        '@app-types': path.resolve('./src/types'),
        '@locales': path.resolve('./src/locales'),
        '@lib': path.resolve('./src/lib'),
      },
    },
    optimizeDeps: {
      include: ['react-dom/client'],
    },
  },
});
