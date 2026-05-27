import type { Meta, StoryObj } from '@storybook/react-vite';

import { KnockoutBracketForm, type KnockoutMatch } from './KnockoutBracketForm';

const meta = {
  component: KnockoutBracketForm,
  tags: ['autodocs'],
} satisfies Meta<typeof KnockoutBracketForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMatches: KnockoutMatch[] = [
  {
    slug: 'ro16-1',
    phase: 'round-of-16',
    phaseLabel: 'Round of 16',
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'DEN', name: 'Denmark' },
    predictionDeadline: new Date('2026-06-28T20:00:00Z'),
  },
  {
    slug: 'ro16-2',
    phase: 'round-of-16',
    phaseLabel: 'Round of 16',
    homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
    awayTeam: { fifaCode: 'KOR', name: 'South Korea' },
    predictionDeadline: new Date('2026-06-28T20:00:00Z'),
  },
  {
    slug: 'ro16-3',
    phase: 'round-of-16',
    phaseLabel: 'Round of 16',
    homeTeam: { fifaCode: 'FRA', name: 'France' },
    awayTeam: { fifaCode: 'USA', name: 'United States' },
    predictionDeadline: new Date('2026-06-28T20:00:00Z'),
  },
  {
    slug: 'ro16-4',
    phase: 'round-of-16',
    phaseLabel: 'Round of 16',
    homeTeam: { fifaCode: 'GER', name: 'Germany' },
    awayTeam: { fifaCode: 'MEX', name: 'Mexico' },
    predictionDeadline: new Date('2026-06-28T20:00:00Z'),
  },
  {
    slug: 'qf-1',
    phase: 'quarterfinals',
    phaseLabel: 'Quarterfinals',
    homeTeam: { fifaCode: 'ESP', name: 'Spain' },
    awayTeam: { fifaCode: 'NED', name: 'Netherlands' },
    predictionDeadline: new Date('2026-07-02T20:00:00Z'),
  },
  {
    slug: 'qf-2',
    phase: 'quarterfinals',
    phaseLabel: 'Quarterfinals',
    homeTeam: { fifaCode: 'ENG', name: 'England' },
    awayTeam: { fifaCode: 'POR', name: 'Portugal' },
    predictionDeadline: new Date('2026-07-02T20:00:00Z'),
  },
];

const tbdMatch: KnockoutMatch = {
  slug: 'ro16-5',
  phase: 'round-of-16',
  phaseLabel: 'Round of 16',
  homeTeam: null,
  awayTeam: null,
  tbdHome: 'Winner A',
  tbdAway: 'Runner B',
  predictionDeadline: new Date('2026-06-28T20:00:00Z'),
};

export const MultipleRounds: Story = {
  args: {
    matches: mockMatches,
    onSubmit: () => {},
    existingBets: new Set(),
    isDisabled: false,
  },
};

export const TBDMatch: Story = {
  args: {
    matches: [tbdMatch],
    onSubmit: () => {},
    existingBets: new Set(),
    isDisabled: false,
  },
};

export const AllBetsSubmitted: Story = {
  args: {
    matches: mockMatches,
    onSubmit: () => {},
    existingBets: new Set(['ro16-1', 'ro16-2', 'ro16-3', 'ro16-4', 'qf-1', 'qf-2']),
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    matches: mockMatches,
    onSubmit: () => {},
    existingBets: new Set(),
    isDisabled: true,
  },
};
