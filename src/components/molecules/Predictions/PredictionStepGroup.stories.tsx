import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Timestamp } from 'firebase/firestore';

import type { MatchWithId } from '@utils/predictions-flow';

import { PredictionStepGroup } from './PredictionStepGroup';

const makeMatch = (id: string, home: string, away: string): MatchWithId => ({
  id,
  slug: id,
  groupId: 'A',
  phase: 'group',
  homeTeamId: home,
  awayTeamId: away,
  date: { toDate: () => new Date() } as Timestamp,
  stadium: 'Test Stadium',
  result: { home: null, away: null },
  status: 'scheduled',
  predictionDeadline: { toDate: () => new Date(Date.now() + 86400000) } as Timestamp,
  createdAt: { toDate: () => new Date() } as Timestamp,
  updatedAt: { toDate: () => new Date() } as Timestamp,
});

const groupA = {
  slug: 'A',
  name: 'Group A',
  teams: [
    { fifaCode: 'ARG', name: 'Argentina' },
    { fifaCode: 'BRA', name: 'Brazil' },
    { fifaCode: 'GER', name: 'Germany' },
    { fifaCode: 'FRA', name: 'France' },
  ],
};

const teamsMap = {
  arg: { fifaCode: 'ARG', name: 'Argentina' },
  bra: { fifaCode: 'BRA', name: 'Brazil' },
  ger: { fifaCode: 'GER', name: 'Germany' },
  fra: { fifaCode: 'FRA', name: 'France' },
};

const groupMatches: MatchWithId[] = [
  makeMatch('m1', 'arg', 'bra'),
  makeMatch('m2', 'ger', 'fra'),
  makeMatch('m3', 'arg', 'ger'),
  makeMatch('m4', 'bra', 'fra'),
  makeMatch('m5', 'arg', 'fra'),
  makeMatch('m6', 'bra', 'ger'),
];

const meta = {
  component: PredictionStepGroup,
  tags: ['ai-generated'],
  argTypes: {
    onSubmit: { action: 'submit' },
  },
} satisfies Meta<typeof PredictionStepGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    group: groupA,
    groupMatches: [],
    teamsMap,
    existingMatchBets: new Set(),
    existingGroupBet: null,
    isDisabled: false,
    locale: 'en',
  },
};

export const Partial: Story = {
  args: {
    group: groupA,
    groupMatches,
    teamsMap,
    existingMatchBets: new Set(['m1', 'm2']),
    existingGroupBet: null,
    isDisabled: false,
    locale: 'en',
  },
};

export const AllFilled: Story = {
  args: {
    group: groupA,
    groupMatches,
    teamsMap,
    existingMatchBets: new Set(),
    existingGroupBet: null,
    isDisabled: false,
    locale: 'en',
  },
  parameters: {
    chromatic: { disableSnapshot: false },
  },
};

export const ClassificationSubmitted: Story = {
  args: {
    group: groupA,
    groupMatches,
    teamsMap,
    existingMatchBets: new Set(),
    existingGroupBet: ['arg', 'fra', 'ger', 'bra'],
    isDisabled: false,
    locale: 'en',
  },
};

export const Disabled: Story = {
  args: {
    group: groupA,
    groupMatches,
    teamsMap,
    existingMatchBets: new Set(),
    existingGroupBet: null,
    isDisabled: true,
    locale: 'en',
  },
};
