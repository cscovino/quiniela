import type { Meta, StoryObj } from '@storybook/react-vite';

import { RankingsTable } from './RankingsTable';

const meta = {
  component: RankingsTable,
  tags: ['ai-generated'],
} satisfies Meta<typeof RankingsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRankings = [
  {
    userId: 'user-1',
    displayName: 'Carlos',
    points: 120,
    accuracy: 85,
    streak: 7,
    badges: { 'first-blood': '2026-05-01', 'on-fire': '2026-05-15' },
    rankChange: 'up' as const,
  },
  {
    userId: 'user-2',
    displayName: 'Maria',
    points: 98,
    accuracy: 78,
    streak: 4,
    badges: { consistent: '2026-05-10' },
    rankChange: 'same' as const,
  },
  {
    userId: 'user-3',
    displayName: 'Juan',
    points: 87,
    accuracy: 72,
    streak: 2,
    rankChange: 'down' as const,
  },
  {
    userId: 'user-4',
    displayName: 'Ana',
    points: 65,
    accuracy: 65,
    streak: 0,
  },
  {
    userId: 'user-5',
    displayName: 'Pedro',
    points: 45,
    accuracy: 55,
    streak: 1,
  },
];

export const Default: Story = {
  args: {
    rankings: mockRankings,
    currentUserId: 'user-3',
  },
};

export const WithPagination: Story = {
  args: {
    rankings: mockRankings,
    currentUserId: 'user-3',
    page: 2,
    totalPages: 5,
  },
};

export const Empty: Story = {
  args: {
    rankings: [],
  },
};

const mockTodayBets = [
  {
    matchId: 'match-1',
    homeTeam: 'ARG',
    awayTeam: 'BRA',
    homeScore: 2,
    awayScore: 1,
    status: 'scheduled' as const,
  },
  {
    matchId: 'match-2',
    homeTeam: 'GER',
    awayTeam: 'ESP',
    homeScore: 1,
    awayScore: 0,
    status: 'scheduled' as const,
  },
  {
    matchId: 'match-3',
    homeTeam: 'FRA',
    awayTeam: 'ENG',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled' as const,
  },
];

const mockTodayBetsWithResults = [
  {
    matchId: 'match-1',
    homeTeam: 'ARG',
    awayTeam: 'BRA',
    homeScore: 2,
    awayScore: 1,
    status: 'finished' as const,
    actualHome: 2,
    actualAway: 1,
    isExact: true,
    isWinner: true,
  },
  {
    matchId: 'match-2',
    homeTeam: 'GER',
    awayTeam: 'ESP',
    homeScore: 1,
    awayScore: 0,
    status: 'finished' as const,
    actualHome: 1,
    actualAway: 1,
    isExact: false,
    isWinner: true,
  },
  {
    matchId: 'match-3',
    homeTeam: 'FRA',
    awayTeam: 'ENG',
    homeScore: 1,
    awayScore: 2,
    status: 'finished' as const,
    actualHome: 0,
    actualAway: 1,
    isExact: false,
    isWinner: false,
  },
];

export const WithTodayPredictions: Story = {
  args: {
    rankings: mockRankings.map((r, i) => ({
      ...r,
      todayMatchBets: mockTodayBets.map((bet) => ({
        ...bet,
        homeScore: bet.homeScore + i,
        awayScore: bet.awayScore + (i % 2),
      })),
      todayPoints: i * 3,
    })),
  },
};

export const WithFinishedResults: Story = {
  args: {
    rankings: mockRankings.map((r, i) => ({
      ...r,
      todayMatchBets: mockTodayBetsWithResults.map((bet) => ({
        ...bet,
        homeScore: bet.homeScore + (i % 3 === 0 ? 1 : 0),
      })),
      todayPoints: i === 0 ? 5 : i === 1 ? 3 : 0,
    })),
    currentUserId: 'user-2',
  },
};
