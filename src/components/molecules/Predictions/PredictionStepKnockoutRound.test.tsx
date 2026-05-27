import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PhaseType } from '@app-types/firestore';
import type { GroupBetRecord } from '@utils/predictions-flow';

import type { KnockoutRoundMatch } from './PredictionStepKnockoutRound';
import { PredictionStepKnockoutRound } from './PredictionStepKnockoutRound';

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
  E: ['ned', 'ita', 'por', 'ger'],
  F: ['bra', 'esp', 'mar', 'cro'],
  G: ['arg', 'fra', 'bel', 'ita'],
  H: ['por', 'eng', 'ger', 'ned'],
};

const defaultProps = {
  phase: 'round-of-32' as const,
  roundMatches: [
    makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
    makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
  ],
  groupBetsByGroupId: groupBets,
  existingKnockoutBets: new Set<string>(),
  previousRoundPredictions: {},
  onSubmit: vi.fn(),
  isDisabled: false,
};

describe('PredictionStepKnockoutRound', () => {
  it('renders phase label', () => {
    render(<PredictionStepKnockoutRound {...defaultProps} />);
    expect(screen.getByText('Round of 32')).toBeInTheDocument();
  });

  it('renders all unsubmitted matches', () => {
    render(<PredictionStepKnockoutRound {...defaultProps} />);
    expect(screen.getByText('Round of 32')).toBeInTheDocument();
    expect(screen.getAllByText('arg').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('bra').length).toBeGreaterThanOrEqual(1);
  });

  it('shows TBD when teams are not resolved', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32')]}
        groupBetsByGroupId={{}}
      />,
    );
    expect(screen.getByText('Teams TBD')).toBeInTheDocument();
  });

  it('does not render selector for TBD matches', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32')]}
        groupBetsByGroupId={{}}
      />,
    );
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('filters out already submitted matches', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        existingKnockoutBets={new Set(['r32-m1'])}
        previousRoundPredictions={{ 'r32-m1': 'arg' }}
      />,
    );
    expect(screen.queryByText('arg')).not.toBeInTheDocument();
  });

  it('shows submitted predictions list', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        existingKnockoutBets={new Set(['r32-m1'])}
        previousRoundPredictions={{ 'r32-m1': 'arg' }}
      />,
    );
    expect(screen.getByText('Submitted predictions:')).toBeInTheDocument();
    expect(screen.getByText('r32-m1')).toBeInTheDocument();
  });

  it('shows all submitted badge when no unsubmitted matches', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        existingKnockoutBets={new Set(['r32-m1', 'r32-m2'])}
        previousRoundPredictions={{ 'r32-m1': 'arg', 'r32-m2': 'bra' }}
      />,
    );
    expect(screen.getByText('All predictions submitted for this round')).toBeInTheDocument();
  });

  it('shows correct phase labels for different phases', () => {
    const phases: Array<{ phase: PhaseType; label: string }> = [
      { phase: 'round-of-32', label: 'Round of 32' },
      { phase: 'round-of-16', label: 'Round of 16' },
      { phase: 'quarterfinals', label: 'Quarterfinals' },
      { phase: 'semifinals', label: 'Semifinals' },
      { phase: 'third-place', label: 'Third Place' },
      { phase: 'final', label: 'Final' },
    ];

    phases.forEach(({ phase, label }) => {
      const { unmount } = render(
        <PredictionStepKnockoutRound
          {...defaultProps}
          phase={phase}
          roundMatches={[makeMatch('test', phase, 'arg', 'esp')]}
        />,
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
