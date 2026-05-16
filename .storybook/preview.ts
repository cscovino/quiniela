import type { Preview } from '@storybook/react-vite';
import '../src/styles/global.css';

// Self-hosted fonts for Storybook
const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'Press Start 2P';
    src: url('/fonts/PressStart2P.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;
document.head.appendChild(style);

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
};

export default preview;
