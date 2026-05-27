import { render, screen } from '@testing-library/react';

import { UserProfile } from './UserProfile';

const translations = {
  totalPoints: 'Total Points',
  accuracy: 'Accuracy',
  currentStreak: 'Current Streak',
  bestStreak: 'Best Streak',
  exactBets: 'Exact Bets',
  rank: 'Rank',
  badges: 'Badges',
};

const mockProps = {
  displayName: 'Carlos Enrique',
  avatarUrl: undefined,
  favoriteTeam: 'Argentina',
  stats: {
    totalPoints: 120,
    exactBets: 8,
    accuracy: 0.75,
    currentStreak: 5,
    maxStreak: 8,
    rank: 12,
  },
  badges: [
    { id: '1', name: 'On Fire', icon: 'fire', earnedAt: new Date('2026-06-20') },
    { id: '2', name: 'First Blood', icon: 'trophy', earnedAt: new Date('2026-06-19') },
  ],
  translations,
};

describe('UserProfile', () => {
  it('renders display name', () => {
    render(<UserProfile {...mockProps} />);
    expect(screen.getByText('Carlos Enrique')).toBeInTheDocument();
  });

  it('renders favorite team', () => {
    render(<UserProfile {...mockProps} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(<UserProfile {...mockProps} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders badges', () => {
    render(<UserProfile {...mockProps} />);
    expect(screen.getByText('Badges')).toBeInTheDocument();
  });

  it('hides badges section when empty', () => {
    render(<UserProfile {...mockProps} badges={[]} />);
    expect(screen.queryByText('Badges')).not.toBeInTheDocument();
  });
});
