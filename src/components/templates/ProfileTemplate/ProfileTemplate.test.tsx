import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

const mockUserProfile = {
  displayName: 'Carlos',
  avatarUrl: '/avatars/carlos.png',
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

describe('ProfileTemplate', () => {
  it('renders user profile', () => {
    render(<ProfileTemplate userProfile={mockUserProfile} translations={translations} />);
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('renders notifications section when provided', () => {
    render(
      <ProfileTemplate
        userProfile={mockUserProfile}
        notifications={mockNotifications}
        translations={translations}
      />,
    );
    expect(screen.getAllByText(/Notifications/).length).toBeGreaterThan(0);
    expect(screen.getByText('You earned 10 points!')).toBeInTheDocument();
  });
});
