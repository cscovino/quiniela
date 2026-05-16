import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PredictionInput } from './PredictionInput';

const meta = {
  component: PredictionInput,
  tags: ['ai-generated'],
} satisfies Meta<typeof PredictionInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    homeTeamName: 'Argentina',
    awayTeamName: 'France',
  },
};

export const WithScores: Story = {
  args: {
    homeTeamName: 'Argentina',
    awayTeamName: 'France',
    homeScore: 2,
    awayScore: 1,
  },
};

export const Disabled: Story = {
  args: {
    homeTeamName: 'Argentina',
    awayTeamName: 'France',
    disabled: true,
  },
};

const InteractivePreview = () => {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <PredictionInput
        homeTeamName="Argentina"
        awayTeamName="France"
        homeScore={home}
        awayScore={away}
        onChange={(h, a) => {
          setHome(h);
          setAway(a);
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
        }}
      >
        Prediction: {home} - {away}
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractivePreview />,
};
