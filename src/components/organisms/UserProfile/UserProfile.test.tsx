import { render, screen } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';

import type { Predictor } from '@app-types/firestore';

import { UserProfile } from './UserProfile';

const translations = {
  totalPoints: 'Total Points',
  accuracy: 'Accuracy',
  currentStreak: 'Current Streak',
  bestStreak: 'Best Streak',
  exactBets: 'Exact Bets',
  rank: 'Rank',
  badges: 'Badges',
  lockedBadges: 'Locked Badges',
};

const mockPredictor: Predictor = {
  id: 'pred-1',
  userId: 'user-1',
  name: 'Carlos Enrique',
  avatar: undefined,
  createdAt: Timestamp.fromDate(new Date('2026-01-01')),
};

const mockProps = {
  predictor: mockPredictor,
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
    { id: '1', name: 'On Fire', icon: 'fire' as const, earnedAt: new Date('2026-06-20') },
    { id: '2', name: 'First Blood', icon: 'trophy' as const, earnedAt: new Date('2026-06-19') },
  ],
  translations,
};

describe('UserProfile', () => {
  it('renders predictor name in h2 (PROF-hdr)', () => {
    render(<UserProfile {...mockProps} />);
    expect(screen.getByText('Carlos Enrique')).toBeInTheDocument();
  });

  it('renders without crashing when predictor is null (PROF-hdr null)', () => {
    // Should not throw; h2 with empty content exists
    expect(() => render(<UserProfile {...mockProps} predictor={null} />)).not.toThrow();
    expect(screen.queryByText('Carlos Enrique')).not.toBeInTheDocument();
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
