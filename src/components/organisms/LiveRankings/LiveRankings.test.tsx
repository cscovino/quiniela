import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MatchInfo } from '@services/matchday-bets';

import { LiveRankings } from './LiveRankings';

vi.mock('@services/live-data-service', () => ({
  fetchLiveRankings: vi.fn(),
  fetchMatchInfoMap: vi.fn(),
  fetchPredictionResults: vi.fn(),
}));

vi.mock('driver.js', () => ({
  driver: vi.fn(() => ({
    drive: vi.fn(),
    destroy: vi.fn(),
    moveNext: vi.fn(),
  })),
}));

import {
  fetchLiveRankings,
  fetchMatchInfoMap,
  fetchPredictionResults,
} from '@services/live-data-service';

const mockFetch = vi.mocked(fetchLiveRankings);
const mockMatchInfo = vi.mocked(fetchMatchInfoMap);
const mockResults = vi.mocked(fetchPredictionResults);

const emptyResults = () => ({
  teams: new Map<string, string>(),
  groupStandings: new Map<string, string[]>(),
  groupNames: new Map<string, string>(),
  finalStandings: null,
  bestPlayers: null,
  groupPointsCalculated: new Map<string, boolean>(),
  isThirdPlaceDecided: false,
});

describe('LiveRankings', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockMatchInfo.mockReset();
    mockMatchInfo.mockResolvedValue(new Map());
    mockResults.mockReset();
    mockResults.mockResolvedValue(emptyResults());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows server-rendered initial data on first render (no skeleton flash)', () => {
    mockFetch.mockResolvedValue([]);

    render(
      <LiveRankings
        initialRankings={[
          {
            userId: 'u1',
            predictorId: 'p1',
            displayName: 'Carlos',
            points: 50,
            accuracy: 80,
            streak: 2,
          },
        ]}
        title="Rankings"
      />,
    );

    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.queryByText('No rankings available yet')).not.toBeInTheDocument();
  });

  it('replaces initial data with fresh fetch on mount', async () => {
    mockFetch.mockResolvedValue([
      {
        userId: 'u2',
        predictorId: 'p2',
        displayName: 'Maria',
        points: 99,
        accuracy: 90,
        streak: 5,
      },
    ]);

    render(
      <LiveRankings
        initialRankings={[
          {
            userId: 'u1',
            predictorId: 'p1',
            displayName: 'Carlos',
            points: 50,
            accuracy: 80,
            streak: 2,
          },
        ]}
        title="Rankings"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });
    expect(screen.queryByText('Carlos')).not.toBeInTheDocument();
  });

  it('keeps initial data on empty fetch (offline/empty fallback)', async () => {
    mockFetch.mockResolvedValue([]);

    render(
      <LiveRankings
        initialRankings={[
          {
            userId: 'u1',
            predictorId: 'p1',
            displayName: 'Carlos',
            points: 50,
            accuracy: 80,
            streak: 2,
          },
        ]}
        title="Rankings"
      />,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('shows skeleton only when there is no initial data and the fetch is pending', async () => {
    let resolveFetch: (value: never[]) => void = () => {};
    mockFetch.mockImplementation(
      () =>
        new Promise<never[]>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    render(<LiveRankings initialRankings={[]} title="Rankings" />);

    await waitFor(() => {
      expect(document.querySelector('.skeleton-rankings')).toBeInTheDocument();
    });

    await act(async () => {
      resolveFetch([]);
    });
  });

  describe('match-predictions tournament-start gate', () => {
    // Predicted scores are baked at build time (initialRankings); live match
    // info is fetched at runtime and joined client-side into the rendered bets.
    const withPredicted = [
      {
        userId: 'u1',
        predictorId: 'p1',
        displayName: 'Carlos',
        points: 50,
        accuracy: 80,
        streak: 2,
        predictedBets: [{ matchId: 'm1', homeScore: 2, awayScore: 0 }],
      },
    ];

    const matchInfo = () =>
      new Map([
        [
          'm1',
          {
            homeTeam: 'ARG',
            awayTeam: 'NED',
            date: new Date('2026-06-11T12:00:00.000Z'),
            status: 'scheduled',
          },
        ],
      ]);

    const PAST = '2000-01-01T00:00:00.000Z';
    const FUTURE = '2999-01-01T00:00:00.000Z';

    afterEach(() => {
      // Reset the URL so a preview override can't leak between tests.
      window.history.pushState({}, '', '/');
    });

    it('hides match predictions before the tournament starts', async () => {
      mockFetch.mockResolvedValue([]);
      mockMatchInfo.mockResolvedValue(matchInfo());

      render(
        <LiveRankings
          initialRankings={withPredicted}
          tournamentStartDate={FUTURE}
          title="Rankings"
        />,
      );

      await waitFor(() => expect(mockMatchInfo).toHaveBeenCalledTimes(1));
      expect(screen.getByText('Carlos')).toBeInTheDocument();
      expect(screen.queryByText('2-0')).not.toBeInTheDocument();
    });

    it('shows match predictions once the tournament has started', async () => {
      mockFetch.mockResolvedValue([]);
      mockMatchInfo.mockResolvedValue(matchInfo());

      render(
        <LiveRankings
          initialRankings={withPredicted}
          tournamentStartDate={PAST}
          title="Rankings"
        />,
      );

      await waitFor(() => expect(screen.getByText('2-0')).toBeInTheDocument());
    });

    it('shows match predictions before start when ?previewRankings=1 override is set', async () => {
      mockFetch.mockResolvedValue([]);
      mockMatchInfo.mockResolvedValue(matchInfo());
      window.history.pushState({}, '', '/?previewRankings=1');

      render(
        <LiveRankings
          initialRankings={withPredicted}
          tournamentStartDate={FUTURE}
          title="Rankings"
        />,
      );

      await waitFor(() => expect(screen.getByText('2-0')).toBeInTheDocument());
    });

    it('shows a loading placeholder until match info resolves, then the bets', async () => {
      mockFetch.mockResolvedValue([]);
      let resolveInfo: (info: Map<string, MatchInfo>) => void = () => {};
      mockMatchInfo.mockImplementation(
        () =>
          new Promise<Map<string, MatchInfo>>((resolve) => {
            resolveInfo = resolve;
          }),
      );

      render(
        <LiveRankings
          initialRankings={withPredicted}
          tournamentStartDate={PAST}
          title="Rankings"
        />,
      );

      // Gate open + join pending → placeholder shows, no scores yet.
      await waitFor(() =>
        expect(
          document.querySelector('.ranking-row__match-predictions--loading'),
        ).toBeInTheDocument(),
      );
      expect(screen.queryByText('2-0')).not.toBeInTheDocument();

      await act(async () => {
        resolveInfo(matchInfo());
      });

      // Join done → predictions render, placeholder gone.
      await waitFor(() => expect(screen.getByText('2-0')).toBeInTheDocument());
      expect(
        document.querySelector('.ranking-row__match-predictions--loading'),
      ).not.toBeInTheDocument();
    });
  });

  describe('group / final-four / best-player sections', () => {
    it('renders the extra prediction sections after the tournament starts', async () => {
      const withAll = [
        {
          userId: 'u1',
          predictorId: 'p1',
          displayName: 'Carlos',
          points: 0,
          accuracy: 0,
          streak: 0,
          predictedGroups: [{ groupId: 'a', positions: ['mex', 'usa', 'rsa', 'kor'] }],
          predictedFinalPhase: { first: 'arg', second: 'bra', third: 'mex', fourth: 'usa' },
          predictedBestPlayers: { bestScorer: 'Messi', bestGoalkeeper: 'Martinez' },
        },
      ];

      mockFetch.mockResolvedValue([]);
      mockResults.mockResolvedValue({
        teams: new Map([
          ['mex', 'MEX'],
          ['usa', 'USA'],
          ['rsa', 'RSA'],
          ['kor', 'KOR'],
          ['arg', 'ARG'],
          ['bra', 'BRA'],
        ]),
        groupStandings: new Map(),
        groupNames: new Map([['a', 'Group A']]),
        finalStandings: null,
        bestPlayers: null,
        groupPointsCalculated: new Map<string, boolean>(),
        isThirdPlaceDecided: false,
      });

      render(
        <LiveRankings
          initialRankings={withAll}
          tournamentStartDate="2000-01-01T00:00:00.000Z"
          title="Rankings"
        />,
      );

      // Group section (label), final-four section, and best-players picks all render.
      await waitFor(() => expect(screen.getByText('Group A')).toBeInTheDocument());
      expect(screen.getByText('Final 4')).toBeInTheDocument();
      expect(screen.getByText('Messi')).toBeInTheDocument();
      expect(screen.getByText('Martinez')).toBeInTheDocument();
    });
  });

  it('refetches on every mount (no shared cache across navigations)', async () => {
    mockFetch.mockResolvedValue([]);

    const { unmount } = render(<LiveRankings initialRankings={[]} title="Rankings" />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    unmount();

    render(<LiveRankings initialRankings={[]} title="Rankings" />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
