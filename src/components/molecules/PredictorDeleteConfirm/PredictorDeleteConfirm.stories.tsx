import type { Meta, StoryObj } from '@storybook/react-vite';
import { PredictorDeleteConfirm } from './PredictorDeleteConfirm';

const meta = {
  component: PredictorDeleteConfirm,
  tags: ['ai-generated'],
  argTypes: {
    onConfirm: { action: 'confirm' },
    onCancel: { action: 'cancel' },
  },
} satisfies Meta<typeof PredictorDeleteConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    predictorName: 'My Team',
  },
};

export const Submitting: Story = {
  args: {
    predictorName: 'My Team',
    isSubmitting: true,
  },
};
