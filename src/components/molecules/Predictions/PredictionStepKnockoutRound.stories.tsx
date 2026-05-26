import type { Meta, StoryObj } from '@storybook/react-vite';
import { PredictionStepKnockoutRound } from './PredictionStepKnockoutRound';
import type { GroupBetRecord } from '@utils/predictions-flow';
import type { KnockoutRoundMatch } from './PredictionStepKnockoutRound';
import type { PhaseType } from '@app-types/firestore';

const makeMatch = (
  slug: string,
  phase: PhaseType,
  home?: string,
  away?: string,
): KnockoutRoundMatch => ({
  slug,
  phase,
  homeTeam: home ? { fifaCode: home.toUpperCase(), name: home } : null,
  awayTeam: away ? { fifaCode: away.toUpperCase(), name: away } : null,
  tbdHome: home ? undefined : 'TBD',
  tbdAway: away ? undefined : 'TBD',
  predictionDeadline: new Date(Date.now() + 86400000),
});

const groupBets: GroupBetRecord = {
  A: ['arg', 'fra', 'ger', 'bra'],
  B: ['bra', 'por', 'esp', 'ita'],
  C: ['esp', 'eng', 'ned', 'mar'],
  D: ['fra', 'bel', 'cro', 'den'],
};

const meta = {
  component: PredictionStepKnockoutRound,
  tags: ['ai-generated'],
  argTypes: {
    onSubmit: { action: 'submit' },
  },
} satisfies Meta<typeof PredictionStepKnockoutRound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RoundOf32: Story = {
  args: {
    phase: 'round-of-32',
    roundMatches: [
      makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
      makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
      makeMatch('r32-m3', 'round-of-32', 'esp', 'ned'),
      makeMatch('r32-m4', 'round-of-32', 'fra', 'cro'),
    ],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(),
    previousRoundPredictions: {},
    isDisabled: false,
  },
};

export const RoundOf16: Story = {
  args: {
    phase: 'round-of-16',
    roundMatches: [
      makeMatch('r16-m1', 'round-of-16', 'arg', 'bra'),
      makeMatch('r16-m2', 'round-of-16', 'esp', 'fra'),
    ],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(),
    previousRoundPredictions: {
      'r32-m1': 'arg',
      'r32-m2': 'bra',
      'r32-m3': 'esp',
      'r32-m4': 'fra',
    },
    isDisabled: false,
  },
};

export const Quarterfinals: Story = {
  args: {
    phase: 'quarterfinals',
    roundMatches: [
      makeMatch('qf-m1', 'quarterfinals', 'arg', 'fra'),
      makeMatch('qf-m2', 'quarterfinals', 'bra', 'esp'),
    ],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(),
    previousRoundPredictions: {
      'r32-m1': 'arg',
      'r32-m2': 'bra',
      'r32-m3': 'esp',
      'r32-m4': 'fra',
      'r16-m1': 'arg',
      'r16-m2': 'fra',
    },
    isDisabled: false,
  },
};

export const Semifinals: Story = {
  args: {
    phase: 'semifinals',
    roundMatches: [
      makeMatch('sf-m1', 'semifinals', 'arg', 'bra'),
      makeMatch('sf-m2', 'semifinals', 'fra', 'esp'),
    ],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(),
    previousRoundPredictions: {
      'r32-m1': 'arg',
      'r32-m2': 'bra',
      'r32-m3': 'esp',
      'r32-m4': 'fra',
      'r16-m1': 'arg',
      'r16-m2': 'fra',
      'qf-m1': 'arg',
      'qf-m2': 'bra',
    },
    isDisabled: false,
  },
};

export const Final: Story = {
  args: {
    phase: 'final',
    roundMatches: [makeMatch('final', 'final', 'arg', 'fra')],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(),
    previousRoundPredictions: {
      'r32-m1': 'arg',
      'r32-m2': 'bra',
      'r32-m3': 'esp',
      'r32-m4': 'fra',
      'r16-m1': 'arg',
      'r16-m2': 'fra',
      'qf-m1': 'arg',
      'qf-m2': 'fra',
      'sf-m1': 'arg',
      'sf-m2': 'fra',
    },
    isDisabled: false,
  },
};

export const WithTbdTeams: Story = {
  args: {
    phase: 'round-of-16',
    roundMatches: [
      makeMatch('r16-m1', 'round-of-16'),
      makeMatch('r16-m2', 'round-of-16', 'bra', 'fra'),
    ],
    groupBetsByGroupId: {},
    existingKnockoutBets: new Set(),
    previousRoundPredictions: {},
    isDisabled: false,
  },
};

export const PartiallySubmitted: Story = {
  args: {
    phase: 'round-of-32',
    roundMatches: [
      makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
      makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
      makeMatch('r32-m3', 'round-of-32', 'esp', 'ned'),
      makeMatch('r32-m4', 'round-of-32', 'fra', 'cro'),
    ],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(['r32-m1', 'r32-m2']),
    previousRoundPredictions: {
      'r32-m1': 'arg',
      'r32-m2': 'bra',
    },
    isDisabled: false,
  },
};

export const AllSubmitted: Story = {
  args: {
    phase: 'round-of-32',
    roundMatches: [
      makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
      makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
    ],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(['r32-m1', 'r32-m2']),
    previousRoundPredictions: {
      'r32-m1': 'arg',
      'r32-m2': 'bra',
    },
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    phase: 'round-of-32',
    roundMatches: [
      makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
      makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
    ],
    groupBetsByGroupId: groupBets,
    existingKnockoutBets: new Set(),
    previousRoundPredictions: {},
    isDisabled: true,
  },
};
