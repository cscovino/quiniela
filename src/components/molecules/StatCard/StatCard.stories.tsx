import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatCard } from './StatCard';

const meta = {
  component: StatCard,
  tags: ['ai-generated'],
  argTypes: {
    trend: { control: 'select', options: ['up', 'down', 'neutral'] },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Points: Story = {
  args: { label: 'Total Points', value: 45, icon: 'star', trend: 'up' },
};

export const Streak: Story = {
  args: { label: 'Current Streak', value: 5, icon: 'fire', trend: 'up' },
};

export const Accuracy: Story = {
  args: { label: 'Accuracy', value: '67%', icon: 'target' },
};

export const AllStats: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '16px',
      }}
    >
      <StatCard label="Total Points" value={45} icon="star" trend="up" />
      <StatCard label="Exact Bets" value={8} icon="target" />
      <StatCard label="Current Streak" value={5} icon="fire" trend="up" />
      <StatCard label="Accuracy" value="67%" icon="chart" trend="down" />
      <StatCard label="Rank" value="#12" icon="trophy" />
    </div>
  ),
};
