import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import type { Match } from '@app-types/firestore';

import { AdminMatchList } from './AdminMatchList';

const mockMatchBase = {
  slug: 'group-a-arg-vs-bra',
  homeTeamId: 'ARG',
  awayTeamId: 'BRA',
  result: { home: null as number | null, away: null as number | null },
  date: { toDate: () => new Date('2026-06-15T20:00:00Z') },
  stadium: 'MetLife Stadium',
  phase: 'group',
  pointsCalculated: false,
};

const meta = {
  component: AdminMatchList,
  tags: ['autodocs'],
} satisfies Meta<typeof AdminMatchList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedByPhase: Story = {
  args: {
    matches: [
      { ...mockMatchBase, id: 'match-1', status: 'scheduled' as const, phase: 'group' },
      {
        ...mockMatchBase,
        id: 'match-2',
        homeTeamId: 'FRA',
        awayTeamId: 'GER',
        status: 'finished' as const,
        phase: 'group',
        result: { home: 3, away: 1 },
      },
      {
        ...mockMatchBase,
        id: 'match-3',
        status: 'live' as const,
        phase: 'group',
        result: { home: 1, away: 0 },
      },
      {
        ...mockMatchBase,
        id: 'match-4',
        homeTeamId: 'ESP',
        awayTeamId: 'ENG',
        phase: 'round-of-16',
      },
      {
        ...mockMatchBase,
        id: 'match-5',
        homeTeamId: 'POR',
        awayTeamId: 'NED',
        phase: 'quarterfinals',
      },
      {
        ...mockMatchBase,
        id: 'match-6',
        homeTeamId: 'BRA',
        awayTeamId: 'CRO',
        phase: 'quarterfinals',
      },
    ] as (Match & { id: string })[],
    onUpdateResult: () => {},
  },
};

export const MixedStatuses: Story = {
  args: {
    matches: [
      { ...mockMatchBase, id: 'm1', status: 'scheduled' as const },
      { ...mockMatchBase, id: 'm2', status: 'live' as const, result: { home: 1, away: 1 } },
      { ...mockMatchBase, id: 'm3', status: 'finished' as const, result: { home: 2, away: 0 } },
      { ...mockMatchBase, id: 'm4', status: 'postponed' as const },
      { ...mockMatchBase, id: 'm5', status: 'cancelled' as const },
    ] as (Match & { id: string })[],
    onUpdateResult: () => {},
  },
};

export const WithResults: Story = {
  args: {
    matches: [
      { ...mockMatchBase, id: 'm1', status: 'finished' as const, result: { home: 2, away: 1 } },
      {
        ...mockMatchBase,
        id: 'm2',
        homeTeamId: 'FRA',
        awayTeamId: 'GER',
        status: 'finished' as const,
        result: { home: 0, away: 0 },
      },
    ] as (Match & { id: string })[],
    onUpdateResult: () => {},
  },
};

export const PointsCalculated: Story = {
  args: {
    matches: [
      {
        ...mockMatchBase,
        id: 'm1',
        status: 'finished' as const,
        result: { home: 2, away: 1 },
        pointsCalculated: true,
      },
      {
        ...mockMatchBase,
        id: 'm2',
        status: 'finished' as const,
        result: { home: 1, away: 0 },
        pointsCalculated: false,
      },
    ] as (Match & { id: string })[],
    onUpdateResult: () => {},
  },
};

export const EditingMatch: Story = {
  decorators: [
    () => {
      const [, setEditingMatchId] = useState<string | null>('match-1');
      return (
        <AdminMatchList
          matches={
            [
              { ...mockMatchBase, id: 'match-1', status: 'scheduled' as const },
              { ...mockMatchBase, id: 'match-2', status: 'scheduled' as const },
            ] as (Match & { id: string })[]
          }
          onUpdateResult={(matchId) => {
            if (matchId === 'match-1') setEditingMatchId(null);
          }}
        />
      );
    },
  ],
};
