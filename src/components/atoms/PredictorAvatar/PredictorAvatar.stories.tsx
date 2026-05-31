import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Timestamp } from 'firebase/firestore';

import type { Predictor } from '@app-types/firestore';

import { PredictorAvatar } from './PredictorAvatar';

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

// Tier-1: predictor.pixelArt present — uses explicit seed + options
export const WithPixelArt: Story = {
  args: {
    predictor: makePredictor({
      pixelArt: { seed: 'custom-seed', options: {} },
    }),
  },
};

// Tier-2: no pixelArt, has id — deterministic pixel-art seeded from predictor.id
export const IdSeeded: Story = {
  args: {
    predictor: makePredictor({
      id: 'user-2-default',
      name: 'Carlos',
    }),
  },
};

// Tier-3: no id — colored initial fallback
export const FallbackInitial: Story = {
  args: {
    predictor: makePredictor({
      id: '',
      name: 'Carlos',
    }),
  },
};

// Tier-3 edge: empty name renders '?'
export const EmptyName: Story = {
  args: {
    predictor: makePredictor({
      id: '',
      name: '',
    }),
  },
};

// All three sizes with id-seeded pixel-art predictors
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <PredictorAvatar predictor={makePredictor({ id: 'sm-1', name: 'Small' })} size="sm" />
      <PredictorAvatar predictor={makePredictor({ id: 'md-1', name: 'Medium' })} size="md" />
      <PredictorAvatar predictor={makePredictor({ id: 'lg-1', name: 'Large' })} size="lg" />
    </div>
  ),
};

// Tier-3 palette: 12 predictors with no id showing the FALLBACK_COLORS distribution
export const FallbackColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: 12 }, (_, i) => (
        <PredictorAvatar
          key={i}
          predictor={makePredictor({
            id: '',
            name: `User ${i + 1}`,
          })}
        />
      ))}
    </div>
  ),
};
