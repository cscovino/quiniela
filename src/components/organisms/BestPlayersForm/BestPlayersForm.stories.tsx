import type { Meta, StoryObj } from '@storybook/react-vite';

import { BestPlayersForm } from './BestPlayersForm';

const meta = {
  component: BestPlayersForm,
  tags: ['autodocs'],
} satisfies Meta<typeof BestPlayersForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    onSubmit: () => {},
    isDisabled: false,
  },
};

export const Filled: Story = {
  args: {
    existingPrediction: { bestGoalkeeper: 'Emiliano Martinez', bestScorer: 'Kylian Mbappe' },
    onSubmit: () => {},
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    onSubmit: () => {},
    isDisabled: true,
  },
};

export const OnlyGoalkeeper: Story = {
  args: {
    existingPrediction: { bestGoalkeeper: 'Emiliano Martinez' },
    onSubmit: () => {},
    isDisabled: false,
  },
};

export const Submitting: Story = {
  args: {
    existingPrediction: { bestGoalkeeper: 'Emiliano Martinez', bestScorer: 'Kylian Mbappe' },
    onSubmit: () => {},
    isDisabled: false,
    isSubmitting: true,
  },
};
