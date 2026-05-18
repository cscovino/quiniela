import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatchList } from './MatchList';

const translations = {
  scheduled: 'Scheduled',
  live: 'LIVE',
  finished: 'Finished',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
  vs: 'VS',
};

const meta = {
  component: MatchList,
  tags: ['ai-generated'],
} satisfies Meta<typeof MatchList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMatches = [
  {
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'FRA', name: 'France' },
    date: new Date('2026-06-20T16:00:00Z'),
    status: 'scheduled' as const,
    stadium: 'Azteca Stadium',
    phase: 'Group A',
  },
  {
    homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
    awayTeam: { fifaCode: 'GER', name: 'Germany' },
    date: new Date('2026-06-21T16:00:00Z'),
    status: 'live' as const,
    stadium: 'Maracanã',
    phase: 'Group B',
    result: { home: 1, away: 0 },
  },
  {
    homeTeam: { fifaCode: 'ESP', name: 'Spain' },
    awayTeam: { fifaCode: 'ITA', name: 'Italy' },
    date: new Date('2026-06-19T16:00:00Z'),
    status: 'finished' as const,
    stadium: 'Santiago Bernabéu',
    phase: 'Group C',
    result: { home: 2, away: 1 },
  },
];

export const WithMatches: Story = {
  args: {
    matches: mockMatches,
    title: 'Upcoming Matches',
    translations,
  },
};

export const Empty: Story = {
  args: {
    matches: [],
    title: 'Upcoming Matches',
    emptyMessage: 'No matches scheduled yet',
    translations,
  },
};

export const Interactive: Story = {
  args: {
    matches: mockMatches,
    title: 'Click a match',
    translations,
  },
};
