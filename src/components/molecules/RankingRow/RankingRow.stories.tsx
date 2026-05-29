import type { Meta, StoryObj } from '@storybook/react-vite';

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
    predictionsCount: 4,
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
    predictionsCount: 2,
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
        predictionsCount={4}
      />
      <RankingRow
        position={2}
        displayName="Juan"
        points={98}
        accuracy={78}
        streak={4}
        badges={{ consistent: '2026-05-10' }}
        rankChange="same"
        predictionsCount={3}
      />
      <RankingRow
        position={3}
        displayName="Pedro"
        points={87}
        accuracy={72}
        streak={2}
        rankChange="down"
        predictionsCount={1}
      />
      <RankingRow
        position={4}
        displayName="Ana"
        points={65}
        accuracy={65}
        streak={0}
        predictionsCount={0}
      />
      <RankingRow
        position={5}
        displayName="You"
        points={45}
        accuracy={67}
        streak={3}
        isCurrentUser
        rankChange="up"
        predictionsCount={2}
      />
    </div>
  ),
};
