import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupHeader } from './GroupHeader';

const meta = {
  component: GroupHeader,
  tags: ['ai-generated'],
} satisfies Meta<typeof GroupHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockStandings = [
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
];

export const WithStandings: Story = {
  args: {
    name: 'Group A',
    standings: mockStandings,
  },
};

export const WithoutStandings: Story = {
  args: {
    name: 'Group B',
  },
};

export const AllGroups: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}
    >
      <GroupHeader name="Group A" standings={mockStandings} />
      <GroupHeader name="Group B" standings={mockStandings} />
      <GroupHeader name="Group C" />
      <GroupHeader name="Group D" />
    </div>
  ),
};
