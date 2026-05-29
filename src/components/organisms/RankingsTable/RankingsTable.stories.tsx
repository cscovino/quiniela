import type { Meta, StoryObj } from '@storybook/react-vite';

import { RankingsTable } from './RankingsTable';

const meta = {
  component: RankingsTable,
  tags: ['ai-generated'],
} satisfies Meta<typeof RankingsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRankings = [
  {
    userId: 'user-1',
    displayName: 'Carlos',
    points: 120,
    accuracy: 85,
    streak: 7,
    badges: { 'first-blood': '2026-05-01', 'on-fire': '2026-05-15' },
    rankChange: 'up' as const,
    predictionsCount: 4,
  },
  {
    userId: 'user-2',
    displayName: 'Maria',
    points: 98,
    accuracy: 78,
    streak: 4,
    badges: { consistent: '2026-05-10' },
    rankChange: 'same' as const,
    predictionsCount: 3,
  },
  {
    userId: 'user-3',
    displayName: 'Juan',
    points: 87,
    accuracy: 72,
    streak: 2,
    rankChange: 'down' as const,
    predictionsCount: 1,
  },
  {
    userId: 'user-4',
    displayName: 'Ana',
    points: 65,
    accuracy: 65,
    streak: 0,
    predictionsCount: 0,
  },
  {
    userId: 'user-5',
    displayName: 'Pedro',
    points: 45,
    accuracy: 55,
    streak: 1,
    predictionsCount: 2,
  },
];

export const Default: Story = {
  args: {
    rankings: mockRankings,
    currentUserId: 'user-3',
  },
};

export const WithPagination: Story = {
  args: {
    rankings: mockRankings,
    currentUserId: 'user-3',
    page: 2,
    totalPages: 5,
  },
};

export const Empty: Story = {
  args: {
    rankings: [],
  },
};
