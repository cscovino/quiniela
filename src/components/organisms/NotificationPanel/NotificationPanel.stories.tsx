import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationPanel } from './NotificationPanel';

const meta = {
  component: NotificationPanel,
  tags: ['ai-generated'],
} satisfies Meta<typeof NotificationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNotifications = [
  {
    id: '1',
    type: 'badge_earned' as const,
    title: 'Badge Earned!',
    message: 'You earned the On Fire badge!',
    read: false,
    createdAt: new Date('2026-06-20T16:00:00Z'),
  },
  {
    id: '2',
    type: 'result_posted' as const,
    title: 'Match Result',
    message: 'Argentina 2 - 1 France',
    read: true,
    createdAt: new Date('2026-06-20T18:00:00Z'),
  },
  {
    id: '3',
    type: 'match_start' as const,
    title: 'Match Starting Soon',
    message: 'Brazil vs Germany kicks off in 15 minutes',
    read: false,
    createdAt: new Date('2026-06-21T15:45:00Z'),
  },
  {
    id: '4',
    type: 'ranking_change' as const,
    title: 'Ranking Update',
    message: 'You moved up to #12 in the rankings!',
    read: false,
    createdAt: new Date('2026-06-21T18:30:00Z'),
  },
];

export const Default: Story = {
  args: {
    notifications: mockNotifications,
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
  },
};

export const AllRead: Story = {
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, read: true })),
  },
};
