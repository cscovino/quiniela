import type { Meta, StoryObj } from '@storybook/react-vite';

import { useAuthStore } from '@store/auth-store';

import { AdminMatchesPage } from './AdminMatchesPage';

const meta = {
  component: AdminMatchesPage,
  tags: ['autodocs'],
} satisfies Meta<typeof AdminMatchesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingAuth: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isAuthLoading: true, user: null });
      return <AdminMatchesPage />;
    },
  ],
};

export const NotLoggedIn: Story = {
  decorators: [
    () => {
      useAuthStore.setState({ isAuthLoading: false, user: null });
      return <AdminMatchesPage />;
    },
  ],
};

export const NotAdmin: Story = {
  decorators: [
    () => {
      useAuthStore.setState({
        isAuthLoading: false,
        user: { uid: 'test', email: 'test@test.com', role: 'user' as const },
      });
      return <AdminMatchesPage />;
    },
  ],
};

export const Loaded: Story = {
  decorators: [
    () => {
      useAuthStore.setState({
        isAuthLoading: false,
        user: { uid: 'admin', email: 'admin@test.com', role: 'admin' as const },
      });
      return <AdminMatchesPage />;
    },
  ],
};
