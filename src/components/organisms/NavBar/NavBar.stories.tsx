import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { NavBar } from './NavBar';
import { useAuthStore } from '@store/auth-store';

const meta = {
  component: NavBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    locale: { control: 'select', options: ['en', 'es'] },
    notificationCount: { control: 'number' },
  },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTranslations = {
  brandLabel: 'Quiniela',
  login: 'Login',
  logout: 'Logout',
  makePredictions: 'Make Predictions',
  switchLocale: 'Switch language',
  toggleTheme: 'Toggle theme',
  toggleMenu: 'Toggle menu',
  notifications: 'Notifications',
};

const defaultLinks = [
  { href: '/es', label: 'Home', active: true },
  { href: '/es/torneo', label: 'Tournament', active: false },
  { href: '/es/clasificacion', label: 'Rankings', active: false },
  { href: '/es/perfil', label: 'Profile', active: false },
];

export const DesktopLoggedOut: Story = {
  args: {
    links: defaultLinks,
    locale: 'en',
    translations: defaultTranslations,
  },
};

export const DesktopLoggedIn: Story = {
  args: {
    links: defaultLinks,
    locale: 'en',
    notificationCount: 0,
    translations: defaultTranslations,
  },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        user: { uid: 'test-uid', email: 'carlos@example.com', displayName: 'Carlos' },
        isAuthLoading: false,
      });
      return <Story />;
    },
  ],
};

export const MobileMenuClosed: Story = {
  parameters: { viewport: { defaultDevice: 'iphone12' } },
  args: {
    links: defaultLinks,
    locale: 'en',
    translations: defaultTranslations,
  },
};

export const MobileMenuOpen: Story = {
  parameters: { viewport: { defaultDevice: 'iphone12' } },
  args: {
    links: defaultLinks,
    locale: 'en',
    translations: defaultTranslations,
  },
  decorators: [
    (Story) => {
      const NavBarWrapper = () => {
        const [open, setOpen] = React.useState(false);
        return (
          <>
            <button onClick={() => setOpen(true)}>Open Menu</button>
            {open && <Story />}
          </>
        );
      };
      return <NavBarWrapper />;
    },
  ],
};

export const WithNotifications: Story = {
  args: {
    links: defaultLinks,
    locale: 'en',
    notificationCount: 3,
    translations: defaultTranslations,
  },
};

export const AdminLink: Story = {
  args: {
    links: defaultLinks,
    locale: 'en',
    translations: defaultTranslations,
    adminLink: { href: '/admin/matches', label: 'Admin', active: false },
  },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        user: { uid: 'admin-uid', email: 'admin@example.com', displayName: 'Admin', role: 'admin' },
        isAuthLoading: false,
      });
      return <Story />;
    },
  ],
};