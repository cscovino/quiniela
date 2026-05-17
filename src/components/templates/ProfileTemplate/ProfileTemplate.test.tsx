import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileTemplate } from './ProfileTemplate';
import type { NavBarProps } from '@organisms/NavBar/NavBar';

const mockNavProps: NavBarProps = {
  links: [
    { href: '/en', label: 'Home', active: false },
    { href: '/en/predictions', label: 'Predictions', active: false },
    { href: '/en/standings', label: 'Standings', active: false },
    { href: '/en/profile', label: 'Profile', active: true },
  ],
  locale: 'en',
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
];

describe('ProfileTemplate', () => {
  it('renders page title', () => {
    render(<ProfileTemplate navProps={mockNavProps} userProfile={mockUserProfile} />);
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('renders user profile', () => {
    render(<ProfileTemplate navProps={mockNavProps} userProfile={mockUserProfile} />);
    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });

  it('renders notifications when provided', () => {
    render(
      <ProfileTemplate
        navProps={mockNavProps}
        userProfile={mockUserProfile}
        notifications={mockNotifications}
      />,
    );
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('You earned 10 points!')).toBeInTheDocument();
  });

  it('does not render notifications section when empty', () => {
    render(
      <ProfileTemplate navProps={mockNavProps} userProfile={mockUserProfile} notifications={[]} />,
    );
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('renders notifications section when provided', () => {
    render(
      <ProfileTemplate
        navProps={mockNavProps}
        userProfile={mockUserProfile}
        notifications={mockNotifications}
      />,
    );
    expect(screen.getByText('Notifications (1)')).toBeInTheDocument();
  });
});
