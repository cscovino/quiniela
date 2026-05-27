import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Timestamp } from 'firebase/firestore';

import type { Predictor } from '@app-types/firestore';

import { PredictorList } from './PredictorList';

const makePredictor = (
  id: string,
  name: string,
  avatar?: { bgColor: string; emoji: string },
): Predictor => ({
  id,
  userId: 'user-1',
  name,
  avatar,
  createdAt: new Date() as Timestamp,
});

const meta = {
  component: PredictorList,
  tags: ['ai-generated'],
  argTypes: {
    onSelect: { action: 'select' },
    onEdit: { action: 'edit' },
    onDelete: { action: 'delete' },
    onCreate: { action: 'create' },
  },
} satisfies Meta<typeof PredictorList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    predictors: [],
  },
};

export const OnePredictor: Story = {
  args: {
    predictors: [
      {
        predictor: makePredictor('p1', 'My Team', { bgColor: '#E63946', emoji: '⚽' }),
        points: 42,
        groupsDone: 3,
        groupsTotal: 12,
      },
    ],
  },
};

export const FiveMixedProgress: Story = {
  args: {
    predictors: [
      {
        predictor: makePredictor('p1', 'Argentina', { bgColor: '#A8DADC', emoji: '🇦🇷' }),
        points: 120,
        groupsDone: 12,
        groupsTotal: 12,
      },
      {
        predictor: makePredictor('p2', 'Brazil', { bgColor: '#2D6A4F', emoji: '🇧🇷' }),
        points: 85,
        groupsDone: 8,
        groupsTotal: 12,
      },
      {
        predictor: makePredictor('p3', 'France', { bgColor: '#1D3557', emoji: '🇫🇷' }),
        points: 50,
        groupsDone: 4,
        groupsTotal: 12,
      },
      {
        predictor: makePredictor('p4', 'Germany', { bgColor: '#E76F51', emoji: '🇩🇪' }),
        points: 10,
        groupsDone: 1,
        groupsTotal: 12,
      },
      {
        predictor: makePredictor('p5', 'No Avatar'),
        points: 0,
        groupsDone: 0,
        groupsTotal: 12,
      },
    ],
  },
};
