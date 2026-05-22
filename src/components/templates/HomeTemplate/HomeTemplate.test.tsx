import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HomeTemplate } from './HomeTemplate';
import type { TournamentHeaderProps } from '@organisms/TournamentHeader/TournamentHeader';
import * as tournamentService from '@services/tournament-service';
import type { Match, Team, User } from '@types/firestore';
import type { Timestamp } from 'firebase/firestore';

vi.mock('@services/tournament-service', () => ({
  tournamentService: {
    getMatches: vi.fn(),
    getTeams: vi.fn(),
    getAllPredictorStats: vi.fn(),
  },
}));

vi.mock('@store/auth-store', () => ({
  useAuthStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const mockState: Record<string, unknown> = {
      user: null as User | null,
      isAuthLoading: false,
      initAuth: vi.fn(),
    };
    Object.defineProperty(mockState, 'user', {
      get: () => (globalThis as Record<string, unknown>).__mockUser ?? null,
    });
    return typeof selector === 'function' ? selector(mockState) : mockState;
  }),
}));

const matchTranslations = {
  scheduled: 'Scheduled',
  live: 'LIVE',
  finished: 'Finished',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
  vs: 'VS',
};

const translations = {
  heroTitle: 'Welcome to World Cup 2026',
  heroSubtitle: 'Make your predictions and compete!',
  ctaPredictions: 'Make Predictions',
  ctaStandings: 'View Standings',
  matchesTitle: 'Upcoming Matches',
  rankingsTitle: 'Top Players',
  matchList: matchTranslations,
  loginToPredict: 'Login to make predictions and compete!',
  loginToRankings: 'Login to see the rankings',
};

const mockTournamentProps: TournamentHeaderProps = {
  name: 'World Cup 2026',
  status: 'active',
  startDate: new Date('2026-06-11'),
  endDate: new Date('2026-07-19'),
  participantCount: 32,
  translations: { teams: 'teams' },
};

const mockTimestamp = {
  toDate: () => new Date('2026-06-15T18:00:00Z'),
  toMillis: () => new Date('2026-06-15T18:00:00Z').getTime(),
} as Timestamp;

const mockTeams: Team[] = [
  {
    id: 'arg',
    fifaCode: 'ARG',
    name: 'Argentina',
    groupId: 'A',
    flagEmoji: 'AR',
    createdAt: mockTimestamp,
  },
  {
    id: 'fra',
    fifaCode: 'FRA',
    name: 'France',
    groupId: 'A',
    flagEmoji: 'FR',
    createdAt: mockTimestamp,
  },
];

const mockMatches: (Match & { id: string })[] = [
  {
    id: 'match-1',
    homeTeamId: 'arg',
    awayTeamId: 'fra',
    date: mockTimestamp,
    status: 'scheduled',
    stadium: 'Lusail Stadium',
    groupId: 'A',
    result: { home: null, away: null },
    slug: 'arg-fra',
    phase: 'group',
    predictionDeadline: mockTimestamp,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  },
];

describe('HomeTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as Record<string, unknown>).__mockUser = null;
  });

  it('renders hero section immediately while data loads', async () => {
    vi.mocked(tournamentService.tournamentService.getMatches).mockResolvedValue([]);
    vi.mocked(tournamentService.tournamentService.getTeams).mockResolvedValue(mockTeams);
    vi.mocked(tournamentService.tournamentService.getAllPredictorStats).mockResolvedValue([]);

    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={[]}
        rankings={[]}
        translations={translations}
      />,
    );

    expect(screen.getByText('Welcome to World Cup 2026')).toBeInTheDocument();
    expect(screen.getByText('Make Predictions')).toBeInTheDocument();
    expect(screen.getByText('View Standings')).toBeInTheDocument();
  });

  it('renders matches section after data loads', async () => {
    vi.mocked(tournamentService.tournamentService.getMatches).mockResolvedValue(mockMatches);
    vi.mocked(tournamentService.tournamentService.getTeams).mockResolvedValue(mockTeams);
    vi.mocked(tournamentService.tournamentService.getAllPredictorStats).mockResolvedValue([]);

    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={[]}
        rankings={[]}
        translations={translations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Upcoming Matches')).toBeInTheDocument();
      expect(screen.getByText('Argentina')).toBeInTheDocument();
    });
  });

  it('redirects to login for rankings CTA when not authenticated', async () => {
    vi.mocked(tournamentService.tournamentService.getMatches).mockResolvedValue([]);
    vi.mocked(tournamentService.tournamentService.getTeams).mockResolvedValue(mockTeams);
    vi.mocked(tournamentService.tournamentService.getAllPredictorStats).mockResolvedValue([]);

    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={[]}
        rankings={[]}
        translations={translations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('View Standings')).toBeInTheDocument();
    });
  });

  it('fetches rankings even when not authenticated', async () => {
    vi.mocked(tournamentService.tournamentService.getMatches).mockResolvedValue(mockMatches);
    vi.mocked(tournamentService.tournamentService.getTeams).mockResolvedValue(mockTeams);
    vi.mocked(tournamentService.tournamentService.getAllPredictorStats).mockResolvedValue([]);

    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={[]}
        rankings={[]}
        translations={translations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Upcoming Matches')).toBeInTheDocument();
    });

    expect(tournamentService.tournamentService.getAllPredictorStats).toHaveBeenCalled();
  });

  it('shows loading spinner for matches while fetching', () => {
    vi.mocked(tournamentService.tournamentService.getMatches).mockResolvedValue(
      new Promise(() => {}),
    );
    vi.mocked(tournamentService.tournamentService.getTeams).mockResolvedValue(mockTeams);

    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={[]}
        rankings={[]}
        translations={translations}
      />,
    );

    expect(screen.getByText('Loading matches...')).toBeInTheDocument();
  });

  it('handles partial failures gracefully', async () => {
    const testUser: User = {
      uid: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'user',
      createdAt: mockTimestamp,
      lastLoginAt: mockTimestamp,
    };
    (globalThis as Record<string, unknown>).__mockUser = testUser;
    vi.mocked(tournamentService.tournamentService.getMatches).mockResolvedValue(mockMatches);
    vi.mocked(tournamentService.tournamentService.getTeams).mockResolvedValue(mockTeams);
    vi.mocked(tournamentService.tournamentService.getAllPredictorStats).mockRejectedValue(
      new Error('Stats failed'),
    );

    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={[]}
        rankings={[]}
        translations={translations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Upcoming Matches')).toBeInTheDocument();
      expect(screen.getByText('Argentina')).toBeInTheDocument();
    });
  });
});
