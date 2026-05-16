import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserProfile } from './UserProfile';

const meta = {
  component: UserProfile,
  tags: ['ai-generated'],
} satisfies Meta<typeof UserProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

const args = {
  displayName: 'Carlos Enrique',
  favoriteTeam: 'Argentina',
  stats: {
    totalPoints: 120,
    exactBets: 8,
    accuracy: 0.75,
    currentStreak: 5,
    maxStreak: 8,
    rank: 12,
  },
  badges: [
    { id: '1', name: 'On Fire', icon: 'fire', earnedAt: new Date('2026-06-20') },
    { id: '2', name: 'First Blood', icon: 'trophy', earnedAt: new Date('2026-06-19') },
    { id: '3', name: 'Consistent', icon: 'star', earnedAt: new Date('2026-06-22') },
  ],
};

export const Default: Story = { args };

export const NoBadges: Story = {
  args: { ...args, badges: [] },
};

export const NoFavoriteTeam: Story = {
  args: { ...args, favoriteTeam: undefined },
};
