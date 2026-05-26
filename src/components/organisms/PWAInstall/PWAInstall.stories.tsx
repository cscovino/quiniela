import type { Meta, StoryObj } from '@storybook/react-vite';
import { PWAInstall } from './PWAInstall';

const meta = {
  component: PWAInstall,
  tags: ['autodocs'],
} satisfies Meta<typeof PWAInstall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
  decorators: [
    (Story) => {
      localStorage.removeItem('pwa-install-dismissed');
      return <Story />;
    },
  ],
};

export const Hidden: Story = {
  decorators: [
    (Story) => {
      localStorage.setItem('pwa-install-dismissed', 'true');
      return <Story />;
    },
  ],
};