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

// ─── Grouped by match day ───────────────────────────────────────────

const mockBetsByDay = [
  {
    matchId: 'd1a', homeTeam: 'ARG', awayTeam: 'BRA', homeScore: 2, awayScore: 1,
    status: 'finished' as const, actualHome: 2, actualAway: 1, isExact: true, isWinner: true,
    date: '2026-06-11', dayLabel: 'Jor. 1 — 11 Jun',
  },
  {
    matchId: 'd1b', homeTeam: 'GER', awayTeam: 'ESP', homeScore: 1, awayScore: 0,
    status: 'finished' as const, actualHome: 1, actualAway: 1, isExact: false, isWinner: true,
    date: '2026-06-11', dayLabel: 'Jor. 1 — 11 Jun',
  },
  {
    matchId: 'd1c', homeTeam: 'FRA', awayTeam: 'ENG', homeScore: 0, awayScore: 2,
    status: 'finished' as const, actualHome: 0, actualAway: 1, isExact: false, isWinner: false,
    date: '2026-06-11', dayLabel: 'Jor. 1 — 11 Jun',
  },
  {
    matchId: 'd2a', homeTeam: 'MEX', awayTeam: 'USA', homeScore: 2, awayScore: 1,
    status: 'finished' as const, actualHome: 2, actualAway: 1, isExact: true, isWinner: true,
    date: '2026-06-15', dayLabel: 'Jor. 2 — 15 Jun',
  },
  {
    matchId: 'd2b', homeTeam: 'NED', awayTeam: 'POR', homeScore: 2, awayScore: 2,
    status: 'finished' as const, actualHome: 2, actualAway: 2, isExact: true, isWinner: true,
    date: '2026-06-15', dayLabel: 'Jor. 2 — 15 Jun',
  },
  {
    matchId: 'd3a', homeTeam: 'ESP', awayTeam: 'CRO', homeScore: 3, awayScore: 0,
    status: 'scheduled' as const,
    date: '2026-06-19', dayLabel: 'Jor. 3 — 19 Jun',
  },
  {
    matchId: 'd3b', homeTeam: 'ENG', awayTeam: 'ITA', homeScore: 1, awayScore: 1,
    status: 'scheduled' as const,
    date: '2026-06-19', dayLabel: 'Jor. 3 — 19 Jun',
  },
  {
    matchId: 'd4a', homeTeam: 'ARG', awayTeam: 'NED', homeScore: 1, awayScore: 0,
    status: 'scheduled' as const,
    date: '2026-06-23', dayLabel: 'Jor. 4 — 23 Jun',
  },
];

export const WithDays: Story = {
  args: {
    rankings: mockRankings.map((r, i) => ({
      ...r,
      todayMatchBets: mockBetsByDay.map((bet) => ({
        ...bet,
        homeScore: bet.homeScore + (i % 2),
      })),
      todayPoints: i * 3,
    })),
    currentUserId: 'user-3',
    title: 'Rankings — Predicciones por jornada',
  },
};

export const WithDaysEnglish: Story = {
  args: {
    rankings: mockRankings.map((r, i) => ({
      ...r,
      todayMatchBets: mockBetsByDay.map((bet) => ({
        ...bet,
        dayLabel: bet.dayLabel
          .replace('Jor. 1', 'MD 1').replace('Jor. 2', 'MD 2')
          .replace('Jor. 3', 'MD 3').replace('Jor. 4', 'MD 4'),
        homeScore: bet.homeScore + (i % 2),
      })),
      todayPoints: i * 3,
    })),
    currentUserId: 'user-3',
    title: 'Rankings — Predictions by matchday',
  },
};

// ─── Group standings + final four + best players, after the match results ───

const mockGroupPredictions = [
  {
    groupId: 'a', label: 'Jor. A',
    teams: [
      { fifaCode: 'MEX', position: 1, correct: true },
      { fifaCode: 'USA', position: 2, correct: false },
      { fifaCode: 'RSA', position: 3, correct: null },
      { fifaCode: 'KOR', position: 4, correct: null },
    ],
  },
  {
    groupId: 'b', label: 'Jor. B',
    teams: [
      { fifaCode: 'ESP', position: 1, correct: true },
      { fifaCode: 'GER', position: 2, correct: true },
      { fifaCode: 'CRO', position: 3, correct: false },
      { fifaCode: 'JPN', position: 4, correct: null },
    ],
  },
];

const mockFinalPhase = {
  positions: [
    { fifaCode: 'ARG', position: 1, correct: true },
    { fifaCode: 'BRA', position: 2, correct: false },
    { fifaCode: 'FRA', position: 3, correct: null },
    { fifaCode: 'ESP', position: 4, correct: null },
  ],
};

const mockBestPlayers = {
  scorer: { name: 'Mbappé', correct: true },
  goalkeeper: { name: 'Martínez', correct: false },
};

export const WithAllPredictions: Story = {
  args: {
    rankings: mockRankings.map((r, i) => ({
      ...r,
      todayMatchBets: mockBetsByDay.map((bet) => ({ ...bet, homeScore: bet.homeScore + (i % 2) })),
      groupPredictions: mockGroupPredictions,
      finalPhasePrediction: mockFinalPhase,
      bestPlayersPrediction: mockBestPlayers,
      todayPoints: i * 3,
    })),
    currentUserId: 'user-3',
    title: 'Rankings — Todas las predicciones',
  },
};
