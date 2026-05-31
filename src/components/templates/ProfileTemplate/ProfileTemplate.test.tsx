/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { predictorService } from '@services/predictor-service';
import { tournamentService } from '@services/tournament-service';

import { ProfileTemplate } from './ProfileTemplate';

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

vi.mock('@services/predictor-service', () => ({
  predictorService: {
    getUserPredictors: vi.fn(),
    getUserPredictorsWithStats: vi.fn(),
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
  yourPredictors: 'Your Predictors',
  selectPredictor: 'Select a predictor',
};

const mockUser = {
  uid: 'user-1',
  displayName: 'Carlos',
  email: 'carlos@example.com',
  avatarUrl: '/avatars/carlos.png',
};

const mockPredictor = {
  id: 'user-1-default',
  userId: 'user-1',
  name: 'Tigre FC',
  avatar: undefined,
  createdAt: {} as any,
};

describe('ProfileTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location for navigation tests
    delete (window as any).location;
    (window as any).location = { href: '' };
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

  it('renders profile when authenticated and shows predictor name (PROF-hdr)', async () => {
    mockAuthState.user = mockUser;
    mockAuthState.isAuthLoading = false;

    vi.mocked(predictorService.getUserPredictors).mockResolvedValue([mockPredictor]);
    vi.mocked(predictorService.getUserPredictorsWithStats).mockResolvedValue([
      { ...mockPredictor, stats: undefined, progress: { groupsSubmitted: 0, totalGroups: 8 } },
    ] as any);

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
    // Header shows predictor name, not user.displayName
    await waitFor(() => {
      const matches = screen.getAllByText('Tigre FC');
      expect(matches.length).toBeGreaterThan(0);
      // The h2 header specifically shows the predictor name
      const h2Match = matches.find((el) => el.tagName === 'H2');
      expect(h2Match).toBeInTheDocument();
    });
  });

  it('onSelect does not navigate (PROF-select)', async () => {
    mockAuthState.user = mockUser;
    mockAuthState.isAuthLoading = false;

    const pred1 = { ...mockPredictor, id: 'user-1-default', name: 'Tigre FC' };
    const pred2 = { id: 'pred-42', userId: 'user-1', name: 'León', avatar: undefined, createdAt: {} as any };

    vi.mocked(predictorService.getUserPredictors).mockResolvedValue([pred1, pred2]);
    vi.mocked(predictorService.getUserPredictorsWithStats).mockResolvedValue([
      { ...pred1, stats: undefined, progress: { groupsSubmitted: 0, totalGroups: 8 } },
      { ...pred2, stats: undefined, progress: { groupsSubmitted: 0, totalGroups: 8 } },
    ] as any);

    vi.mocked(tournamentService.getPredictorStats).mockResolvedValue({
      totalPoints: 0,
      exactBets: 0,
      accuracy: 0,
      currentStreak: 0,
      maxStreak: 0,
      badgesAwarded: {},
      pointsHistory: [],
    } as any);

    vi.mocked(tournamentService.getAllPredictorStats).mockResolvedValue([]);

    render(<ProfileTemplate translations={translations} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Wait for predictor list to appear and click a card
    await waitFor(() => {
      expect(screen.getByText('León')).toBeInTheDocument();
    });

    const leonCard = screen.getByText('León').closest('[role="button"]');
    if (leonCard) fireEvent.click(leonCard);

    // No navigation should occur
    expect((window as any).location.href).toBe('');
    // Profile header is still in the document
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('onEdit uses the clicked predictor id (PROF-edit)', async () => {
    mockAuthState.user = mockUser;
    mockAuthState.isAuthLoading = false;

    const pred1 = { ...mockPredictor, id: 'user-1-default', name: 'Tigre FC' };
    const pred2 = { id: 'pred-42', userId: 'user-1', name: 'León', avatar: undefined, createdAt: {} as any };

    vi.mocked(predictorService.getUserPredictors).mockResolvedValue([pred1, pred2]);
    vi.mocked(predictorService.getUserPredictorsWithStats).mockResolvedValue([
      { ...pred1, stats: undefined, progress: { groupsSubmitted: 0, totalGroups: 8 } },
      { ...pred2, stats: undefined, progress: { groupsSubmitted: 0, totalGroups: 8 } },
    ] as any);

    vi.mocked(tournamentService.getPredictorStats).mockResolvedValue({
      totalPoints: 0,
      exactBets: 0,
      accuracy: 0,
      currentStreak: 0,
      maxStreak: 0,
      badgesAwarded: {},
      pointsHistory: [],
    } as any);

    vi.mocked(tournamentService.getAllPredictorStats).mockResolvedValue([]);

    render(<ProfileTemplate translations={translations} locale="en" />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Wait for both predictor cards to render
    await waitFor(() => {
      expect(screen.getByText('León')).toBeInTheDocument();
    });

    // Find the edit button for "León" (pred-42) and click it
    // Edit buttons are within each predictor card
    const leonCard = screen.getByText('León').closest('[role="button"]')?.parentElement;
    const editButtons = leonCard
      ? leonCard.querySelectorAll('button')
      : document.querySelectorAll('button');
    // The edit button is the first action button on the León card
    const editBtn = Array.from(editButtons).find((btn) =>
      btn.getAttribute('aria-label')?.includes('León'),
    );
    if (editBtn) fireEvent.click(editBtn);

    // Navigation uses the clicked predictor id 'pred-42', not 'user-1-default'
    expect((window as any).location.href).toContain('pred-42');
    expect((window as any).location.href).not.toContain('user-1-default');
  });
});
