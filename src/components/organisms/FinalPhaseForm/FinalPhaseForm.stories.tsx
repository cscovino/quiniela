import type { Meta, StoryObj } from '@storybook/react-vite';

import { FinalPhaseForm } from './FinalPhaseForm';

const meta = {
  component: FinalPhaseForm,
  tags: ['autodocs'],
} satisfies Meta<typeof FinalPhaseForm>;

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

export const Empty: Story = {
  args: {
    teams: mockTeams,
    onSubmit: () => {},
    isDisabled: false,
  },
};

export const PartiallyFilled: Story = {
  args: {
    teams: mockTeams,
    existingPrediction: { first: 'ARG', second: 'BRA' },
    onSubmit: () => {},
    isDisabled: false,
  },
};

export const Complete: Story = {
  args: {
    teams: mockTeams,
    existingPrediction: { first: 'ARG', second: 'BRA', third: 'FRA', fourth: 'GER' },
    onSubmit: () => {},
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    teams: mockTeams,
    onSubmit: () => {},
    isDisabled: true,
  },
};

export const Submitting: Story = {
  args: {
    teams: mockTeams,
    existingPrediction: { first: 'ARG', second: 'BRA', third: 'FRA', fourth: 'GER' },
    onSubmit: () => {},
    isDisabled: false,
    isSubmitting: true,
  },
};
