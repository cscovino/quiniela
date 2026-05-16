import type { Meta, StoryObj } from '@storybook/react';
import { ProfileTemplate } from './ProfileTemplate';

const meta = {
  title: 'Templates/ProfileTemplate',
  component: ProfileTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNavProps = {
  locale: 'en' as const,
  theme: 'light' as const,
  onLocaleChange: () => {},
  onThemeChange: () => {},
  isLoggedIn: true,
};

const mockUserProfile = {
  displayName: 'Carlos',
  avatarUrl: '/avatars/carlos.png',
  favoriteTeam: 'Argentina',
  stats: {
    totalPoints: 480,
    exactBets: 12,
    accuracy: 67,
    currentStreak: 3,
    maxStreak: 5,
    rank: 3,
  },
  badges: [
    { id: 'badge-1', name: 'First Prediction', icon: 'star', earnedAt: new Date('2026-06-11') },
    { id: 'badge-2', name: 'Streak Master', icon: 'fire', earnedAt: new Date('2026-06-15') },
    { id: 'badge-3', name: 'Top 3', icon: 'trophy', earnedAt: new Date('2026-06-20') },
  ],
};

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'badge_earned' as const,
    title: 'Badge Earned',
    message: 'You earned 10 points!',
    read: false,
    createdAt: new Date('2026-06-15T10:00:00Z'),
  },
  {
    id: 'notif-2',
    type: 'match_start' as const,
    title: 'Match Starting',
    message: 'New matchday available!',
    read: true,
    createdAt: new Date('2026-06-16T08:00:00Z'),
  },
];

export const Default: Story = {
  args: {
    navProps: mockNavProps,
    userProfile: mockUserProfile,
  },
};

export const WithNotifications: Story = {
  args: {
    navProps: mockNavProps,
    userProfile: mockUserProfile,
    notifications: mockNotifications,
  },
};

export const DarkMode: Story = {
  args: {
    navProps: {
      ...mockNavProps,
      theme: 'dark' as const,
    },
    userProfile: mockUserProfile,
    notifications: mockNotifications,
  },
};
