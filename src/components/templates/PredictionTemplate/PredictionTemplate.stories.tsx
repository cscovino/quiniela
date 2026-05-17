import type { Meta, StoryObj } from '@storybook/react';
import { PredictionTemplate } from './PredictionTemplate';

const meta = {
  title: 'Templates/PredictionTemplate',
  component: PredictionTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PredictionTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockFormProps = {
  matches: [
    {
      matchId: 'match-1',
      homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
      awayTeam: { fifaCode: 'FRA', name: 'France' },
      phase: 'group' as const,
      predictionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      matchId: 'match-2',
      homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
      awayTeam: { fifaCode: 'GER', name: 'Germany' },
      phase: 'group' as const,
      predictionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ],
};

export const Default: Story = {
  args: {
    formProps: mockFormProps,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
};

export const WithoutCountdown: Story = {
  args: {
    formProps: mockFormProps,
  },
};
