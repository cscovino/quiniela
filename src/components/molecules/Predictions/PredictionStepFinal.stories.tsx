import type { Meta, StoryObj } from '@storybook/react-vite';

import { PredictionStepBestPlayers, PredictionStepFinalPhase } from './PredictionStepFinal';

const meta = {
  component: PredictionStepFinalPhase,
  tags: ['autodocs'],
} satisfies Meta<typeof PredictionStepFinalPhase>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTeams = [
  { fifaCode: 'ARG', name: 'Argentina' },
  { fifaCode: 'BRA', name: 'Brazil' },
  { fifaCode: 'FRA', name: 'France' },
  { fifaCode: 'GER', name: 'Germany' },
  { fifaCode: 'ESP', name: 'Spain' },
  { fifaCode: 'ENG', name: 'England' },
  { fifaCode: 'POR', name: 'Portugal' },
  { fifaCode: 'NED', name: 'Netherlands' },
];

export const FinalPhaseWithTeams: Story = {
  render: () => (
    <PredictionStepFinalPhase
      teams={mockTeams}
      onSubmit={async () => {}}
      isDisabled={false}
      locale="en"
    />
  ),
};

export const FinalPhaseEmpty: Story = {
  render: () => (
    <PredictionStepFinalPhase teams={[]} onSubmit={async () => {}} isDisabled={false} locale="en" />
  ),
};

export const FinalPhaseWithExistingPrediction: Story = {
  render: () => (
    <PredictionStepFinalPhase
      teams={mockTeams}
      existingPrediction={{ first: 'ARG', second: 'BRA', third: 'FRA', fourth: 'GER' }}
      onSubmit={async () => {}}
      isDisabled={false}
      locale="en"
    />
  ),
};

export const FinalPhaseDisabled: Story = {
  render: () => (
    <PredictionStepFinalPhase
      teams={mockTeams}
      onSubmit={async () => {}}
      isDisabled={true}
      locale="en"
    />
  ),
};

export const BestPlayersEmpty: Story = {
  render: () => <PredictionStepBestPlayers onSubmit={async () => {}} isDisabled={false} />,
};

export const BestPlayersWithExisting: Story = {
  render: () => (
    <PredictionStepBestPlayers
      existingPrediction={{ bestGoalkeeper: 'Emiliano Martinez', bestScorer: 'Kylian Mbappe' }}
      onSubmit={async () => {}}
      isDisabled={false}
    />
  ),
};

export const BestPlayersDisabled: Story = {
  render: () => <PredictionStepBestPlayers onSubmit={async () => {}} isDisabled={true} />,
};

export const BestPlayersPartial: Story = {
  render: () => (
    <PredictionStepBestPlayers
      existingPrediction={{ bestGoalkeeper: 'Emiliano Martinez' }}
      onSubmit={async () => {}}
      isDisabled={false}
    />
  ),
};
