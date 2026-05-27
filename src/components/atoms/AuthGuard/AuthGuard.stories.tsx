import type { Meta, StoryObj } from '@storybook/react-vite';

import { useAuthStore } from '@store/auth-store';

import { AuthGuard } from './AuthGuard';

const meta = {
  component: AuthGuard,
  tags: ['autodocs'],
} satisfies Meta<typeof AuthGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isAuthLoading: true, user: null });
      return (
        <AuthGuard loadingMessage="Verifying access...">
          <div>Protected content</div>
        </AuthGuard>
      );
    },
  ],
};

export const Locked: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isAuthLoading: false, user: null });
      return (
        <AuthGuard loginUrl="/es/login" message="Login required to continue">
          <div>Protected content</div>
        </AuthGuard>
      );
    },
  ],
};

export const Authenticated: Story = {
  decorators: [
    () => {
      useAuthStore.setState({
        user: { uid: 'test-uid', email: 'user@test.com' },
        isAuthLoading: false,
      });
      return (
        <AuthGuard>
          <div style={{ padding: '1rem' }}>Protected content</div>
        </AuthGuard>
      );
    },
  ],
};

export const CustomMessage: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isAuthLoading: false, user: null });
      return (
        <AuthGuard loginUrl="/en/login" message="Please sign in to access predictions">
          <div>Protected content</div>
        </AuthGuard>
      );
    },
  ],
};
