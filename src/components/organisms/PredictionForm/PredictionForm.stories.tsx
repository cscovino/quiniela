import type { Meta, StoryObj } from '@storybook/react-vite';

import { PredictionForm } from './PredictionForm';

const meta = {
  component: PredictionForm,
  tags: ['ai-generated'],
} satisfies Meta<typeof PredictionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMatches = [
  {
    matchId: 'match-1',
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'FRA', name: 'France' },
    phase: 'group' as const,
    predictionDeadline: new Date(Date.now() + 3600000),
  },
  {
    matchId: 'match-2',
    homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
    awayTeam: { fifaCode: 'GER', name: 'Germany' },
    phase: 'knockout' as const,
    predictionDeadline: new Date(Date.now() + 3600000),
  },
];

export const Default: Story = {
  args: {
    matches: mockMatches,
  },
};

export const Disabled: Story = {
  args: {
    matches: mockMatches,
    isDisabled: true,
  },
};

export const Empty: Story = {
  args: {
    matches: [],
  },
};
