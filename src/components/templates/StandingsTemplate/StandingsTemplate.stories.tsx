import type { Meta, StoryObj } from '@storybook/react';
import { StandingsTemplate } from './StandingsTemplate';

const meta = {
  title: 'Templates/StandingsTemplate',
  component: StandingsTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StandingsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGroups = [
  {
    name: 'Group A',
    standings: [
      {
        teamId: 'arg',
        teamName: 'Argentina',
        fifaCode: 'ARG',
        position: 1,
        played: 3,
        won: 2,
        drawn: 1,
        lost: 0,
        goalsFor: 5,
        goalsAgainst: 1,
        points: 7,
      },
      {
        teamId: 'fra',
        teamName: 'France',
        fifaCode: 'FRA',
        position: 2,
        played: 3,
        won: 1,
        drawn: 1,
        lost: 1,
        goalsFor: 3,
        goalsAgainst: 2,
        points: 4,
      },
    ],
  },
];

const mockBracketRounds = [
  {
    name: 'Round of 32',
    matches: [
      {
        matchId: 'ko-1',
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'FRA', name: 'France' },
        date: new Date('2026-07-01T18:00:00Z'),
        status: 'scheduled' as const,
      },
    ],
  },
];

export const Default: Story = {
  args: {
    groups: mockGroups,
    bracketRounds: mockBracketRounds,
  },
};

export const GroupsOnly: Story = {
  args: {
    groups: mockGroups,
  },
};
