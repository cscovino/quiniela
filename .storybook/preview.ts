import type { Preview } from '@storybook/react-vite';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'card', value: '#16213e' },
        { name: 'light', value: '#f0f0f0' },
      ],
    },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      document.documentElement.setAttribute('data-theme', theme);
      return Story();
    },
  ],
};

export default preview;
