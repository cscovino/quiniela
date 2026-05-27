import type { Meta, StoryObj } from '@storybook/react';

import { ProfileTemplate } from './ProfileTemplate';

const translations = {
  title: 'My Profile',
  notificationsTitle: (count: number) => `${count} Notifications`,
  userProfile: {
    totalPoints: 'Total Points',
    accuracy: 'Accuracy',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    exactBets: 'Exact Bets',
    rank: 'Rank',
    badges: 'Badges',
  },
  notifications: {
    noNotifications: 'No notifications yet',
    notificationsHeader: (count: number) => `${count} Unread`,
    clearAll: 'Clear All',
  },
};

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

const mockUserProfile = {
  displayName: 'Carlos',
  avatarUrl: undefined,
  favoriteTeam: 'Argentina',
  stats: {
    totalPoints: 480,
    exactBets: 12,
    accuracy: 67,
    currentStreak: 5,
    maxStreak: 8,
    rank: 5,
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
    title: 'New Badge',
    message: 'You earned 10 points!',
    read: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
];

export const Default: Story = {
  args: {
    userProfile: mockUserProfile,
    notifications: mockNotifications,
    translations,
  },
};

export const WithoutNotifications: Story = {
  args: {
    userProfile: mockUserProfile,
    translations,
  },
};
