import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Timestamp } from 'firebase/firestore';

import type { Predictor } from '@app-types/firestore';

import { PredictorEditor } from './PredictorEditor';

const makePredictor = (overrides: Partial<Predictor> = {}): Predictor => ({
  id: 'user-1-default',
  userId: 'user-1',
  name: 'Default',
  avatar: { bgColor: '#E63946', emoji: '⚽' },
  createdAt: new Date() as Timestamp,
  ...overrides,
});

const meta = {
  component: PredictorEditor,
  tags: ['ai-generated'],
  argTypes: {
    onSave: { action: 'save' },
    onCancel: { action: 'cancel' },
  },
} satisfies Meta<typeof PredictorEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    mode: 'create',
  },
};

export const Edit: Story = {
  args: {
    mode: 'edit',
    predictor: makePredictor(),
  },
};

export const Submitting: Story = {
  args: {
    mode: 'create',
    isSubmitting: true,
  },
};
