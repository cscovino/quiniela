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

const mockNavProps = {
  locale: 'es' as const,
  theme: 'light' as const,
  onLocaleChange: () => {},
  onThemeChange: () => {},
  isLoggedIn: true,
};

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
        goalsAgainst: 3,
        points: 4,
      },
      {
        teamId: 'aus',
        teamName: 'Australia',
        fifaCode: 'AUS',
        position: 3,
        played: 3,
        won: 1,
        drawn: 0,
        lost: 2,
        goalsFor: 2,
        goalsAgainst: 4,
        points: 3,
      },
      {
        teamId: 'per',
        teamName: 'Peru',
        fifaCode: 'PER',
        position: 4,
        played: 3,
        won: 0,
        drawn: 2,
        lost: 1,
        goalsFor: 1,
        goalsAgainst: 3,
        points: 2,
      },
    ],
  },
  {
    name: 'Group B',
    standings: [
      {
        teamId: 'bra',
        teamName: 'Brazil',
        fifaCode: 'BRA',
        position: 1,
        played: 3,
        won: 3,
        drawn: 0,
        lost: 0,
        goalsFor: 7,
        goalsAgainst: 1,
        points: 9,
      },
      {
        teamId: 'ger',
        teamName: 'Germany',
        fifaCode: 'GER',
        position: 2,
        played: 3,
        won: 2,
        drawn: 0,
        lost: 1,
        goalsFor: 5,
        goalsAgainst: 3,
        points: 6,
      },
      {
        teamId: 'jpn',
        teamName: 'Japan',
        fifaCode: 'JPN',
        position: 3,
        played: 3,
        won: 1,
        drawn: 0,
        lost: 2,
        goalsFor: 2,
        goalsAgainst: 4,
        points: 3,
      },
      {
        teamId: 'can',
        teamName: 'Canada',
        fifaCode: 'CAN',
        position: 4,
        played: 3,
        won: 0,
        drawn: 0,
        lost: 3,
        goalsFor: 1,
        goalsAgainst: 7,
        points: 0,
      },
    ],
  },
];

const mockRounds = [
  {
    name: 'Round of 16',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'AUS', name: 'Australia' },
        date: new Date('2026-07-01'),
        status: 'scheduled' as const,
      },
      {
        homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
        awayTeam: { fifaCode: 'JPN', name: 'Japan' },
        date: new Date('2026-07-01'),
        status: 'scheduled' as const,
      },
    ],
  },
];

export const Default: Story = {
  args: {
    navProps: mockNavProps,
    groups: mockGroups,
  },
};

export const WithKnockout: Story = {
  args: {
    navProps: mockNavProps,
    groups: mockGroups,
    bracketRounds: mockRounds,
  },
};

export const DarkMode: Story = {
  args: {
    navProps: {
      ...mockNavProps,
      theme: 'dark' as const,
    },
    groups: mockGroups,
    bracketRounds: mockRounds,
  },
};
