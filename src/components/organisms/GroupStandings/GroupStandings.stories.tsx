import type { Meta, StoryObj } from '@storybook/react-vite';

import { GroupStandings } from './GroupStandings';

const translations = {
  noGroups: 'No groups available',
  team: 'Team',
  pts: 'Pts',
  qualified: 'Qualified',
};

const meta = {
  component: GroupStandings,
  tags: ['ai-generated'],
} satisfies Meta<typeof GroupStandings>;

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
        won: 3,
        drawn: 0,
        lost: 0,
        goalsFor: 7,
        goalsAgainst: 1,
        points: 9,
      },
      {
        teamId: 'fra',
        teamName: 'France',
        fifaCode: 'FRA',
        position: 2,
        played: 3,
        won: 2,
        drawn: 0,
        lost: 1,
        goalsFor: 5,
        goalsAgainst: 2,
        points: 6,
      },
      {
        teamId: 'den',
        teamName: 'Denmark',
        fifaCode: 'DEN',
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
        teamId: 'tun',
        teamName: 'Tunisia',
        fifaCode: 'TUN',
        position: 4,
        played: 3,
        won: 0,
        drawn: 0,
        lost: 3,
        goalsFor: 1,
        goalsAgainst: 8,
        points: 0,
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
        won: 2,
        drawn: 1,
        lost: 0,
        goalsFor: 5,
        goalsAgainst: 1,
        points: 7,
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
        goalsFor: 4,
        goalsAgainst: 2,
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
        teamId: 'crc',
        teamName: 'Costa Rica',
        fifaCode: 'CRC',
        position: 4,
        played: 3,
        won: 0,
        drawn: 1,
        lost: 2,
        goalsFor: 1,
        goalsAgainst: 5,
        points: 1,
      },
    ],
  },
];

export const Default: Story = {
  args: { groups: mockGroups, translations },
};

export const Empty: Story = {
  args: { groups: [], translations },
};
