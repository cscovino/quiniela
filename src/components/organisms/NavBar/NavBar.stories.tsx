import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { NavBar } from './NavBar';

const meta = {
  component: NavBar,
  tags: ['ai-generated'],
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const NavBarPreview = ({
  isLoggedIn = false,
  notificationCount = 0,
}: {
  isLoggedIn?: boolean;
  notificationCount?: number;
}) => {
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
      <NavBar
        locale={locale}
        theme={theme}
        onLocaleChange={setLocale}
        onThemeChange={setTheme}
        isLoggedIn={isLoggedIn}
        notificationCount={notificationCount}
      />
      <div
        style={{ padding: '24px', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
      >
        <p>Current locale: {locale}</p>
        <p>Current theme: {theme}</p>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <NavBarPreview />,
};

export const LoggedIn: Story = {
  render: () => <NavBarPreview isLoggedIn />,
};

export const WithNotifications: Story = {
  render: () => <NavBarPreview notificationCount={5} />,
};

export const LightTheme: Story = {
  render: () => <NavBarPreview isLoggedIn notificationCount={2} />,
  parameters: {
    backgrounds: { default: 'light' },
  },
};
