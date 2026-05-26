import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastContainer } from './Toast';

const meta = {
  component: ToastContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDismiss = () => {};

export const Success: Story = {
  args: {
    toasts: [
      {
        id: '1',
        type: 'success',
        title: 'Saved!',
        message: 'Your predictions have been saved.',
      },
    ],
    onDismiss: mockDismiss,
  },
};

export const Error: Story = {
  args: {
    toasts: [
      {
        id: '2',
        type: 'error',
        title: 'Error',
        message: 'Failed to save predictions. Please try again.',
      },
    ],
    onDismiss: mockDismiss,
  },
};

export const Info: Story = {
  args: {
    toasts: [
      {
        id: '3',
        type: 'info',
        title: 'Info',
        message: 'Match starts in 30 minutes.',
      },
    ],
    onDismiss: mockDismiss,
  },
};

export const Warning: Story = {
  args: {
    toasts: [
      {
        id: '4',
        type: 'warning',
        title: 'Warning',
        message: 'Your session will expire soon.',
      },
    ],
    onDismiss: mockDismiss,
  },
};

export const AllTypes: Story = {
  args: {
    toasts: [
      { id: '1', type: 'success', title: 'Success', message: 'All good!' },
      { id: '2', type: 'error', title: 'Error', message: 'Something went wrong.' },
      { id: '3', type: 'info', title: 'Info', message: 'Here is some info.' },
      { id: '4', type: 'warning', title: 'Warning', message: 'Be careful.' },
    ],
    onDismiss: mockDismiss,
  },
};

export const Empty: Story = {
  args: {
    toasts: [],
    onDismiss: mockDismiss,
  },
};

export const MultipleToasts: Story = {
  args: {
    toasts: [
      { id: '1', type: 'success', title: 'First', message: 'First toast' },
      { id: '2', type: 'info', title: 'Second', message: 'Second toast' },
      { id: '3', type: 'warning', title: 'Third', message: 'Third toast' },
    ],
    onDismiss: mockDismiss,
  },
};