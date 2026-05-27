import type { Meta, StoryObj } from '@storybook/react-vite';

import { type GroupForPrediction, GroupPredictionForm } from './GroupPredictionForm';

const meta = {
  component: GroupPredictionForm,
  tags: ['autodocs'],
} satisfies Meta<typeof GroupPredictionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGroups: GroupForPrediction[] = [
  {
    slug: 'group-a',
    name: 'Group A',
    teams: [
      { fifaCode: 'ARG', name: 'Argentina' },
      { fifaCode: 'BRA', name: 'Brazil' },
      { fifaCode: 'FRA', name: 'France' },
      { fifaCode: 'GER', name: 'Germany' },
    ],
  },
  {
    slug: 'group-b',
    name: 'Group B',
    teams: [
      { fifaCode: 'ESP', name: 'Spain' },
      { fifaCode: 'ENG', name: 'England' },
      { fifaCode: 'POR', name: 'Portugal' },
      { fifaCode: 'NED', name: 'Netherlands' },
    ],
  },
  {
    slug: 'group-c',
    name: 'Group C',
    teams: [
      { fifaCode: 'USA', name: 'United States' },
      { fifaCode: 'MEX', name: 'Mexico' },
      { fifaCode: 'CAN', name: 'Canada' },
      { fifaCode: 'CRC', name: 'Costa Rica' },
    ],
  },
];

export const ThreeGroups: Story = {
  args: {
    groups: mockGroups,
    onSubmit: () => {},
    existingBets: new Set(),
    isDisabled: false,
  },
};

export const OneGroupAvailable: Story = {
  args: {
    groups: mockGroups,
    onSubmit: () => {},
    existingBets: new Set(['group-a']),
    isDisabled: false,
  },
};

export const AllSubmitted: Story = {
  args: {
    groups: mockGroups,
    onSubmit: () => {},
    existingBets: new Set(['group-a', 'group-b', 'group-c']),
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    groups: mockGroups,
    onSubmit: () => {},
    existingBets: new Set(),
    isDisabled: true,
  },
};
