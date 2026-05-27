import type { Meta, StoryObj } from '@storybook/react-vite';

import { useToastStore } from '@store/toast-store';

import { ToastProvider } from './ToastProvider';

const meta = {
  component: ToastProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithToasts: Story = {
  decorators: [
    (Story) => {
      useToastStore.setState({
        toasts: [
          { id: '1', type: 'success', title: 'Saved!', message: 'Predictions saved.' },
          { id: '2', type: 'info', title: 'Info', message: 'Match starting soon.' },
          { id: '3', type: 'warning', title: 'Warning', message: 'Session expiring.' },
        ],
      });
      return <Story />;
    },
  ],
};

export const Empty: Story = {
  decorators: [
    () => {
      useToastStore.setState({ toasts: [] });
      return <ToastProvider />;
    },
  ],
};
