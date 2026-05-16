import type { Meta, StoryObj } from '@storybook/react-vite';
import { CountdownTimer } from './CountdownTimer';

const meta = {
  component: CountdownTimer,
  tags: ['ai-generated'],
} satisfies Meta<typeof CountdownTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000);
const pastDate = new Date(Date.now() - 60000);

export const Active: Story = {
  args: {
    targetDate: futureDate,
    label: 'Match starts in',
  },
};

export const Expired: Story = {
  args: {
    targetDate: pastDate,
    label: 'Prediction deadline',
    expiredText: 'Deadline passed',
  },
};

export const NoLabel: Story = {
  args: {
    targetDate: futureDate,
  },
};
