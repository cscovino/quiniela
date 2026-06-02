import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PhaseType } from '@app-types/firestore';

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

const defaultProps = {
  phase: 'round-of-32' as const,
  roundMatches: [
    makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
    makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
  ],
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

  it('renders all matches', () => {
    render(<PredictionStepKnockoutRound {...defaultProps} />);
    expect(screen.getByText('Round of 32')).toBeInTheDocument();
    expect(screen.getAllByText(/arg/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/bra/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows TBD when teams are not resolved', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32')]}
      />,
    );
    expect(screen.getByText('Teams TBD')).toBeInTheDocument();
  });

  it('does not render selector for TBD matches', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32')]}
      />,
    );
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('keeps already-saved matches editable (no filtering)', () => {
    // Predictions stay editable until the deadline; a saved pick must still render
    // its match so the user can change it.
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        previousRoundPredictions={{ 'r32-m1': 'arg' }}
      />,
    );
    expect(screen.getAllByText(/arg/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders every match even when all have saved picks', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        previousRoundPredictions={{ 'r32-m1': 'arg', 'r32-m2': 'bra' }}
      />,
    );
    // No "all submitted" lock; match content still renders so it stays editable.
    expect(screen.queryByText('All predictions submitted for this round')).not.toBeInTheDocument();
    expect(screen.getByText('Round of 32')).toBeInTheDocument();
    expect(screen.getAllByText(/bra/i).length).toBeGreaterThanOrEqual(1);
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

  it.todo('renders resolved team names from resolvedMatchups prop');
  it.todo('renders TBD card when resolvedTeam is TBD');
});
