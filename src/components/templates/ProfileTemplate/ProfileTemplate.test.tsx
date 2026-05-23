/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileTemplate } from './ProfileTemplate';
import { tournamentService } from '@services/tournament-service';

const mockAuthState = {
  user: null,
  isAuthLoading: false,
  isLoading: false,
  error: null,
  initAuth: vi.fn(),
};

vi.mock('@store/auth-store', () => ({
  useAuthStore: vi.fn((selector?: (s: any) => any) =>
    selector ? selector(mockAuthState) : mockAuthState,
  ),
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
    mockAuthState.user = null;
    mockAuthState.isAuthLoading = false;

    render(<ProfileTemplate translations={translations} />);

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('shows loading spinner while auth is loading', () => {
    mockAuthState.user = null;
    mockAuthState.isAuthLoading = true;

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

    mockAuthState.user = mockUser;
    mockAuthState.isAuthLoading = false;

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
