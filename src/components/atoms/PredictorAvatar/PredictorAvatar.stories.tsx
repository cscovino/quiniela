import type { Meta, StoryObj } from '@storybook/react-vite';
import { PredictorAvatar } from './PredictorAvatar';
import type { Predictor } from '@app-types/firestore';
import type { Timestamp } from 'firebase/firestore';

const makePredictor = (overrides: Partial<Predictor> = {}): Predictor => ({
  id: 'user-1-default',
  userId: 'user-1',
  name: 'Default',
  createdAt: new Date() as Timestamp,
  ...overrides,
});

const meta = {
  component: PredictorAvatar,
  tags: ['ai-generated'],
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof PredictorAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAvatar: Story = {
  args: {
    predictor: makePredictor({
      id: 'user-1-default',
      name: 'My Team',
      avatar: { bgColor: '#E63946', emoji: '⚽' },
    }),
  },
};

export const WithoutAvatar: Story = {
  args: {
    predictor: makePredictor({
      id: 'user-2-default',
      name: 'Carlos',
    }),
  },
};

export const LongName: Story = {
  args: {
    predictor: makePredictor({
      id: 'user-3-default',
      name: 'Very Long Predictor Name',
    }),
  },
};

export const TwoGraphemeEmoji: Story = {
  args: {
    predictor: makePredictor({
      id: 'user-4-default',
      name: 'Flag Team',
      avatar: { bgColor: '#2D6A4F', emoji: '🇦🇷' },
    }),
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <PredictorAvatar
        predictor={makePredictor({ id: 'sm-1', name: 'Small', avatar: { bgColor: '#E63946', emoji: '⚽' } })}
        size="sm"
      />
      <PredictorAvatar
        predictor={makePredictor({ id: 'md-1', name: 'Medium', avatar: { bgColor: '#2D6A4F', emoji: '🏆' } })}
        size="md"
      />
      <PredictorAvatar
        predictor={makePredictor({ id: 'lg-1', name: 'Large', avatar: { bgColor: '#F4A261', emoji: '🥅' } })}
        size="lg"
      />
    </div>
  ),
};

export const FallbackColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: 12 }, (_, i) => (
        <PredictorAvatar
          key={i}
          predictor={makePredictor({
            id: `user-${i}-default`,
            name: `User ${i + 1}`,
          })}
        />
      ))}
    </div>
  ),
};
