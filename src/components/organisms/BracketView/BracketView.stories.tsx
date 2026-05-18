import type { Meta, StoryObj } from '@storybook/react-vite';
import { BracketView } from './BracketView';

const translations = {
  bracketNotAvailable: 'Bracket not available yet',
  match: {
    scheduled: 'Scheduled',
    live: 'LIVE',
    finished: 'Finished',
    postponed: 'Postponed',
    cancelled: 'Cancelled',
    vs: 'VS',
  },
};

const meta = {
  component: BracketView,
  tags: ['ai-generated'],
} satisfies Meta<typeof BracketView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRounds = [
  {
    name: 'Round of 16',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'AUS', name: 'Australia' },
        date: new Date('2026-07-01T16:00:00Z'),
        status: 'scheduled' as const,
      },
      {
        homeTeam: { fifaCode: 'FRA', name: 'France' },
        awayTeam: { fifaCode: 'POL', name: 'Poland' },
        date: new Date('2026-07-01T20:00:00Z'),
        status: 'scheduled' as const,
      },
      {
        homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
        awayTeam: { fifaCode: 'KOR', name: 'South Korea' },
        date: new Date('2026-07-02T16:00:00Z'),
        status: 'scheduled' as const,
      },
      {
        homeTeam: { fifaCode: 'GER', name: 'Germany' },
        awayTeam: { fifaCode: 'ESP', name: 'Spain' },
        date: new Date('2026-07-02T20:00:00Z'),
        status: 'scheduled' as const,
      },
    ],
  },
  {
    name: 'Quarterfinals',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'FRA', name: 'France' },
        date: new Date('2026-07-05T16:00:00Z'),
        status: 'scheduled' as const,
      },
      {
        homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
        awayTeam: { fifaCode: 'GER', name: 'Germany' },
        date: new Date('2026-07-05T20:00:00Z'),
        status: 'scheduled' as const,
      },
    ],
  },
  {
    name: 'Semifinals',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'BRA', name: 'Brazil' },
        date: new Date('2026-07-09T16:00:00Z'),
        status: 'scheduled' as const,
      },
    ],
  },
  {
    name: 'Final',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'FRA', name: 'France' },
        date: new Date('2026-07-15T16:00:00Z'),
        status: 'scheduled' as const,
      },
    ],
  },
];

export const Default: Story = {
  args: { rounds: mockRounds, translations },
};

export const Empty: Story = {
  args: { rounds: [], translations },
};
