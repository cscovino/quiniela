import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScoreDisplay } from './ScoreDisplay';

const meta = {
  component: ScoreDisplay,
  tags: ['ai-generated'],
} satisfies Meta<typeof ScoreDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoPoints: Story = {
  args: { homeScore: 2, awayScore: 1 },
};

export const ExactPrediction: Story = {
  args: { homeScore: 2, awayScore: 1, pointsEarned: 3, isExact: true },
};

export const CorrectWinner: Story = {
  args: { homeScore: 2, awayScore: 1, pointsEarned: 1, isWinner: true },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <ScoreDisplay homeScore={0} awayScore={0} />
      <ScoreDisplay homeScore={2} awayScore={1} pointsEarned={3} isExact />
      <ScoreDisplay homeScore={1} awayScore={1} pointsEarned={1} isWinner />
      <ScoreDisplay homeScore={3} awayScore={0} pointsEarned={0} />
    </div>
  ),
};
