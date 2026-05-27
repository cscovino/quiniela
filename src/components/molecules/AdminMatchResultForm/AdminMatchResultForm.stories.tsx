import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Match } from '@app-types/firestore';

import { AdminMatchResultForm } from './AdminMatchResultForm';

const mockMatch = {
  id: 'match-123',
  slug: 'group-a-arg-vs-bra',
  homeTeamId: 'ARG',
  awayTeamId: 'BRA',
  result: { home: null as number | null, away: null as number | null },
  status: 'scheduled' as const,
  date: { toDate: () => new Date('2026-06-15T20:00:00Z') },
  stadium: 'MetLife Stadium',
  phase: 'group',
  pointsCalculated: false,
};

const meta = {
  component: AdminMatchResultForm,
  tags: ['autodocs'],
} satisfies Meta<typeof AdminMatchResultForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScheduledMatch: Story = {
  args: {
    match: mockMatch as Match & { id: string },
    onSubmit: () => {},
    onCancel: () => {},
  },
};

export const FinishedWithScores: Story = {
  args: {
    match: { ...mockMatch, status: 'finished' as const, result: { home: 2, away: 1 } } as Match & {
      id: string;
    },
    onSubmit: () => {},
    onCancel: () => {},
  },
};

export const Postponed: Story = {
  args: {
    match: { ...mockMatch, status: 'postponed' as const } as Match & { id: string },
    onSubmit: () => {},
    onCancel: () => {},
  },
};

export const ValidationError: Story = {
  args: {
    match: {
      ...mockMatch,
      status: 'finished' as const,
      result: { home: null, away: null },
    } as Match & { id: string },
    onSubmit: () => {},
    onCancel: () => {},
  },
};
