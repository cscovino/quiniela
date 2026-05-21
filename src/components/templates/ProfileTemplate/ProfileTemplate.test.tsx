/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileTemplate } from './ProfileTemplate';
import { useAuthStore } from '@store/auth-store';
import { tournamentService } from '@services/tournament-service';

vi.mock('@store/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@services/tournament-service', () => ({
  tournamentService: {
    getPredictorStats: vi.fn(),
    getAllPredictorStats: vi.fn(),
  },
}));

vi.mock('@atoms/Icon/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

const translations = {
  title: 'My Profile',
  loading: 'Loading...',
  loginRequired: 'Please log in to view your profile',
  loginButton: 'Log In',
  totalPoints: 'Total Points',
  accuracy: 'Accuracy',
  currentStreak: 'Current Streak',
  bestStreak: 'Best Streak',
  exactBets: 'Exact Bets',
  rank: 'Rank',
  badges: 'Badges',
  lockedBadges: 'Locked Badges',
  pointsChart: 'Points Evolution',
  noPointsData: 'No data available',
  points: 'Points',
  matches: 'Matches',
};

describe('ProfileTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows login required when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthLoading: false,
      initAuth: vi.fn(),
    });

    render(<ProfileTemplate translations={translations} />);

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('shows loading spinner while auth is loading', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthLoading: true,
      initAuth: vi.fn(),
    });

    render(<ProfileTemplate translations={translations} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders profile when authenticated', async () => {
    const mockUser = {
      uid: 'user-1',
      displayName: 'Carlos',
      email: 'carlos@example.com',
      avatarUrl: '/avatars/carlos.png',
    };

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthLoading: false,
      initAuth: vi.fn(),
    });

    vi.mocked(tournamentService.getPredictorStats).mockResolvedValue({
      totalPoints: 480,
      exactBets: 12,
      accuracy: 0.67,
      currentStreak: 5,
      maxStreak: 8,
      badgesAwarded: {},
      pointsHistory: [],
    } as any);

    vi.mocked(tournamentService.getAllPredictorStats).mockResolvedValue([]);

    render(<ProfileTemplate translations={translations} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });
});
