import type { Meta, StoryObj } from '@storybook/react';
import { HomeTemplate } from './HomeTemplate';

const meta = {
  title: 'Templates/HomeTemplate',
  component: HomeTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTournamentProps = {
  name: 'FIFA World Cup 2026',
  status: 'active' as const,
  startDate: new Date('2026-06-11'),
  endDate: new Date('2026-07-19'),
  participantCount: 48,
};

const mockMatches = [
  {
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'FRA', name: 'France' },
    date: new Date('2026-06-15T18:00:00Z'),
    status: 'scheduled' as const,
    stadium: 'Lusail Stadium',
  },
  {
    homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
    awayTeam: { fifaCode: 'GER', name: 'Germany' },
    date: new Date('2026-06-16T20:00:00Z'),
    status: 'scheduled' as const,
    stadium: 'Maracana',
  },
];

const mockRankings = [
  { position: 1, user: 'Carlos', points: 150, streak: 5 },
  { position: 2, user: 'Maria', points: 142, streak: 3 },
  { position: 3, user: 'Juan', points: 138, streak: 4 },
];

export const Default: Story = {
  args: {
    tournamentProps: mockTournamentProps,
    matches: mockMatches,
    rankings: mockRankings,
  },
};

export const EmptyState: Story = {
  args: {
    tournamentProps: mockTournamentProps,
    matches: [],
    rankings: [],
  },
};
