import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HomeTemplate } from './HomeTemplate';
import type { TournamentHeaderProps } from '@organisms/TournamentHeader/TournamentHeader';
import * as tournamentService from '@services/tournament-service';
import type { Match, Team, PredictorStats } from '@types/firestore';
import type { Timestamp } from 'firebase/firestore';

vi.mock('@services/tournament-service', () => ({
  tournamentService: {
    getMatches: vi.fn(),
    getTeams: vi.fn(),
    getAllPredictorStats: vi.fn(),
  },
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
};

const mockTournamentProps: TournamentHeaderProps = {
  name: 'World Cup 2026',
  status: 'active',
  startDate: new Date('2026-06-11'),
  endDate: new Date('2026-07-19'),
  participantCount: 32,
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
    flagEmoji: '🇦🇷',
    createdAt: mockTimestamp,
  },
  {
    id: 'fra',
    fifaCode: 'FRA',
    name: 'France',
    groupId: 'A',
    flagEmoji: '🇫🇷',
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

const mockRankings: (PredictorStats & { userId: string; predictorId: string })[] = [
  {
    id: 'stats-1',
    userId: 'user-1',
    predictorId: 'predictor-1',
    totalPoints: 150,
    accuracy: 0.75,
    currentStreak: 5,
    correctPredictions: 10,
    totalPredictions: 15,
    exactResults: 2,
  },
  {
    id: 'stats-2',
    userId: 'user-2',
    predictorId: 'predictor-2',
    totalPoints: 142,
    accuracy: 0.72,
    currentStreak: 3,
    correctPredictions: 9,
    totalPredictions: 14,
    exactResults: 1,
  },
];

describe('HomeTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tournament header', async () => {
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
      expect(screen.getByText('World Cup 2026')).toBeInTheDocument();
    });
  });

  it('renders matches section', async () => {
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

  it('renders rankings section', async () => {
    vi.mocked(tournamentService.tournamentService.getMatches).mockResolvedValue([]);
    vi.mocked(tournamentService.tournamentService.getTeams).mockResolvedValue(mockTeams);
    vi.mocked(tournamentService.tournamentService.getAllPredictorStats).mockResolvedValue(
      mockRankings,
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
      expect(screen.getByText('Top Players')).toBeInTheDocument();
    });
    expect(screen.getByText('150')).toBeInTheDocument();
  });
});
