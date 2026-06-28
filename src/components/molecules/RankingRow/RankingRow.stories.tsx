import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TodayMatchBet } from '@organisms/RankingsTable';
import type {
  BestPlayersPredictionView,
  FinalPhasePredictionView,
  GroupPredictionView,
} from '@services/predictor-predictions';

import { RankingRow } from './RankingRow';

const meta = {
  component: RankingRow,
  tags: ['ai-generated'],
} satisfies Meta<typeof RankingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPlace: Story = {
  args: {
    position: 1,
    displayName: 'Carlos',
    points: 120,
    accuracy: 85,
    streak: 7,
    badges: { 'first-blood': '2026-05-01', 'on-fire': '2026-05-15' },
    rankChange: 'up',
  },
};

export const CurrentUser: Story = {
  args: {
    position: 5,
    displayName: 'You',
    points: 45,
    accuracy: 67,
    streak: 3,
    isCurrentUser: true,
    rankChange: 'down',
  },
};

export const FullTable: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <RankingRow
        position={1}
        displayName="Maria"
        points={120}
        accuracy={85}
        streak={7}
        badges={{ 'first-blood': '2026-05-01', 'on-fire': '2026-05-15' }}
        rankChange="up"
      />
      <RankingRow
        position={2}
        displayName="Juan"
        points={98}
        accuracy={78}
        streak={4}
        badges={{ consistent: '2026-05-10' }}
        rankChange="same"
      />
      <RankingRow
        position={3}
        displayName="Pedro"
        points={87}
        accuracy={72}
        streak={2}
        rankChange="down"
      />
      <RankingRow position={4} displayName="Ana" points={65} accuracy={65} streak={0} />
      <RankingRow
        position={5}
        displayName="You"
        points={45}
        accuracy={67}
        streak={3}
        isCurrentUser
        rankChange="up"
      />
    </div>
  ),
};

// ─── Grouped by match day ────────────────────────────────────────────

const dayBets: TodayMatchBet[] = [
  {
    matchId: 'd1a',
    homeTeam: 'ARG',
    awayTeam: 'BRA',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    actualHome: 2,
    actualAway: 1,
    isExact: true,
    isWinner: true,
    date: '2026-06-11',
    dayLabel: 'Jor. 1 — 11 Jun',
  },
  {
    matchId: 'd1b',
    homeTeam: 'GER',
    awayTeam: 'ESP',
    homeScore: 1,
    awayScore: 0,
    status: 'finished',
    actualHome: 1,
    actualAway: 1,
    isExact: false,
    isWinner: true,
    date: '2026-06-11',
    dayLabel: 'Jor. 1 — 11 Jun',
  },
  {
    matchId: 'd1c',
    homeTeam: 'FRA',
    awayTeam: 'ENG',
    homeScore: 0,
    awayScore: 2,
    status: 'finished',
    actualHome: 0,
    actualAway: 1,
    isExact: false,
    isWinner: false,
    date: '2026-06-11',
    dayLabel: 'Jor. 1 — 11 Jun',
  },
  {
    matchId: 'd2a',
    homeTeam: 'MEX',
    awayTeam: 'USA',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    actualHome: 2,
    actualAway: 1,
    isExact: true,
    isWinner: true,
    date: '2026-06-15',
    dayLabel: 'Jor. 2 — 15 Jun',
  },
  {
    matchId: 'd2b',
    homeTeam: 'NED',
    awayTeam: 'POR',
    homeScore: 2,
    awayScore: 2,
    status: 'finished',
    actualHome: 2,
    actualAway: 2,
    isExact: true,
    isWinner: true,
    date: '2026-06-15',
    dayLabel: 'Jor. 2 — 15 Jun',
  },
  {
    matchId: 'd3a',
    homeTeam: 'ESP',
    awayTeam: 'CRO',
    homeScore: 3,
    awayScore: 0,
    status: 'scheduled',
    date: '2026-06-19',
    dayLabel: 'Jor. 3 — 19 Jun',
  },
  {
    matchId: 'd3b',
    homeTeam: 'ENG',
    awayTeam: 'ITA',
    homeScore: 1,
    awayScore: 1,
    status: 'scheduled',
    date: '2026-06-19',
    dayLabel: 'Jor. 3 — 19 Jun',
  },
  {
    matchId: 'd4a',
    homeTeam: 'ARG',
    awayTeam: 'NED',
    homeScore: 1,
    awayScore: 0,
    status: 'scheduled',
    date: '2026-06-23',
    dayLabel: 'Jor. 4 — 23 Jun',
  },
];

export const SingleDay: Story = {
  args: {
    position: 1,
    displayName: 'Carlos',
    points: 120,
    accuracy: 85,
    streak: 7,
    exactMatches: 5,
    bestStreak: 12,
    todayMatchBets: dayBets.filter((b) => b.date === '2026-06-11'),
    locale: 'es',
  },
};

export const MixedDays: Story = {
  args: {
    position: 3,
    displayName: 'Maria',
    points: 98,
    accuracy: 78,
    streak: 4,
    exactMatches: 3,
    bestStreak: 9,
    todayMatchBets: dayBets,
    locale: 'es',
  },
};

export const MixedDaysEnglish: Story = {
  args: {
    position: 2,
    displayName: 'John',
    points: 110,
    accuracy: 82,
    streak: 5,
    exactMatches: 7,
    bestStreak: 15,
    todayMatchBets: dayBets.map((b) => ({
      ...b,
      dayLabel: b
        .dayLabel!.replace('Jor. 1', 'MD 1')
        .replace('Jor. 2', 'MD 2')
        .replace('Jor. 3', 'MD 3')
        .replace('Jor. 4', 'MD 4'),
    })),
    locale: 'en',
  },
};

// ─── All four prediction sections in their ranking-row order ──────────

const fullPredictions = {
  finalPhasePrediction: {
    positions: [
      { fifaCode: 'ARG', position: 1, correct: true },
      { fifaCode: 'BRA', position: 2, correct: false },
      { fifaCode: 'FRA', position: 3, correct: null },
      { fifaCode: 'ESP', position: 4, correct: null },
    ],
  } satisfies FinalPhasePredictionView,
  bestPlayersPrediction: {
    scorer: { name: 'Mbappé', correct: true },
    goalkeeper: { name: 'Martínez', correct: false },
  } satisfies BestPlayersPredictionView,
  groupPredictions: [
    {
      groupId: 'a',
      label: 'Group A',
      finished: true,
      teams: [
        { fifaCode: 'MEX', position: 1, correct: true },
        { fifaCode: 'USA', position: 2, correct: false },
        { fifaCode: 'RSA', position: 3, correct: null },
        { fifaCode: 'KOR', position: 4, correct: null },
      ],
    },
    {
      groupId: 'b',
      label: 'Group B',
      finished: true,
      teams: [
        { fifaCode: 'ESP', position: 1, correct: true },
        { fifaCode: 'GER', position: 2, correct: true },
        { fifaCode: 'CRO', position: 3, correct: false },
        { fifaCode: 'JPN', position: 4, correct: null },
      ],
    },
  ] satisfies GroupPredictionView[],
  todayMatchBets: dayBets,
};

export const FullPredictions: Story = {
  args: {
    position: 1,
    displayName: 'Carlos',
    points: 120,
    accuracy: 85,
    streak: 7,
    exactMatches: 5,
    bestStreak: 12,
    locale: 'es',
    ...fullPredictions,
  },
};

export const FullPredictionsEnglish: Story = {
  args: {
    position: 2,
    displayName: 'John',
    points: 110,
    accuracy: 82,
    streak: 5,
    exactMatches: 7,
    bestStreak: 15,
    locale: 'en',
    ...fullPredictions,
    groupPredictions: fullPredictions.groupPredictions.map((g) => ({
      ...g,
      label: g.label.replace('Group', 'Group'),
    })),
    todayMatchBets: fullPredictions.todayMatchBets.map((b) => ({
      ...b,
      dayLabel: b
        .dayLabel!.replace('Jor. 1', 'MD 1')
        .replace('Jor. 2', 'MD 2')
        .replace('Jor. 3', 'MD 3')
        .replace('Jor. 4', 'MD 4'),
    })),
  },
};
