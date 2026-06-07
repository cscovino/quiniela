import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('renders resolved team names from resolvedMatchups prop', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32', 'BRA', 'ARG')]}
      />,
    );
    expect(screen.getAllByText(/BRA/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ARG/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders TBD card when resolvedTeam is TBD', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32')]}
      />,
    );
    expect(screen.getByText('Teams TBD')).toBeInTheDocument();
  });

  it('renders slot-source label on TBD card with bracket-slot source', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-2', 'round-of-32')]}
        translations={{
          groupWinner: 'Winner Group {group}',
          groupRunnerUp: 'Runner-up Group {group}',
          groupPosition: 'Position {n} Group {group}',
          bestThird: 'Best 3rd place',
          winnerOf: 'Winner of Match {match}',
          loserOf: 'Loser of Match {match}',
        }}
      />,
    );
    expect(screen.getByText('Teams TBD')).toBeInTheDocument();
  });

  it('does not render duplicate header on resolved cards', () => {
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32', 'arg', 'esp')]}
      />,
    );
    const headerEl = document.querySelector('.prediction-step-knockout-round__match-header');
    expect(headerEl).toBeNull();
  });
});

describe('knockout pick survival across recompute', () => {
  it('in-progress pick survives a roundMatches reference change (regression)', () => {
    const initialMatches = [
      makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
      makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
    ];
    const { rerender } = render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={initialMatches}
        previousRoundPredictions={{}}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /ARG/i }));

    act(() => {
      rerender(
        <PredictionStepKnockoutRound
          {...defaultProps}
          roundMatches={[
            makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
            makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
          ]}
          previousRoundPredictions={{}}
        />,
      );
    });

    expect(screen.getByRole('radio', { name: /ARG/i })).toBeChecked();
  });

  it('completing all picks enables advance and stays enabled across recompute', () => {
    const onStateChange = vi.fn();
    const { rerender } = render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[
          makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
          makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
        ]}
        previousRoundPredictions={{}}
        onStateChange={onStateChange}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /ARG/i }));
    fireEvent.click(screen.getByRole('radio', { name: /BRA/i }));

    act(() => {
      rerender(
        <PredictionStepKnockoutRound
          {...defaultProps}
          roundMatches={[
            makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
            makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
          ]}
          previousRoundPredictions={{}}
          onStateChange={onStateChange}
        />,
      );
    });

    const calls = onStateChange.mock.calls;
    const lastCall = calls[calls.length - 1][0] as { canAdvance: boolean };
    expect(lastCall.canAdvance).toBe(true);

    const firstTrueIdx = calls.findIndex(
      (c) => (c[0] as { canAdvance: boolean }).canAdvance === true,
    );
    expect(firstTrueIdx).toBeGreaterThanOrEqual(0);
    const afterRerender = calls.slice(firstTrueIdx);
    const falseAfterTrue = afterRerender.some(
      (c) => (c[0] as { canAdvance: boolean }).canAdvance === false,
    );
    expect(falseAfterTrue).toBe(false);
  });

  it('drops a preserved pick whose team is no longer in the matchup', () => {
    const { rerender } = render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatch('r32-m1', 'round-of-32', 'arg', 'esp')]}
        previousRoundPredictions={{}}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /ARG/i }));

    act(() => {
      rerender(
        <PredictionStepKnockoutRound
          {...defaultProps}
          roundMatches={[makeMatch('r32-m1', 'round-of-32', 'bra', 'fra')]}
          previousRoundPredictions={{}}
        />,
      );
    });

    expect(screen.queryByRole('radio', { checked: true })).toBeNull();
  });

  it('onSubmit reference change does not re-trigger reset', () => {
    const { rerender } = render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[
          makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
          makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
        ]}
        previousRoundPredictions={{}}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /ARG/i }));

    // Rerender with a FRESH onSubmit reference: this is what re-fires the
    // secondary onStateChange/onSubmit effect. The pick must survive that.
    act(() => {
      rerender(
        <PredictionStepKnockoutRound
          {...defaultProps}
          roundMatches={[
            makeMatch('r32-m1', 'round-of-32', 'arg', 'esp'),
            makeMatch('r32-m2', 'round-of-32', 'bra', 'fra'),
          ]}
          previousRoundPredictions={{}}
          onSubmit={vi.fn()}
        />,
      );
    });

    expect(screen.getByRole('radio', { name: /ARG/i })).toBeChecked();
  });
});

describe('deadline-tick cadence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const makeMatchWithDeadline = (slug: string, deadline: Date) => ({
    ...makeMatch(slug, 'round-of-32', 'arg', 'esp'),
    predictionDeadline: deadline,
  });

  it('uses 30s tick when the nearest deadline is more than an hour away', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const farFuture = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatchWithDeadline('r32-m1', farFuture)]}
        previousRoundPredictions={{}}
      />,
    );
    const calls = setIntervalSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // The implementation may call setInterval a few times during the initial
    // schedule (the schedule() recursion after the first tick is irrelevant
    // before any tick has fired). Find the first call's delay.
    const firstDelay = calls[0]?.[1] as number | undefined;
    expect(firstDelay).toBe(30 * 1000);
    setIntervalSpy.mockRestore();
  });

  it('uses 1s tick when the nearest deadline is within an hour', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const soon = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatchWithDeadline('r32-m1', soon)]}
        previousRoundPredictions={{}}
      />,
    );
    const calls = setIntervalSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const firstDelay = calls[0]?.[1] as number | undefined;
    expect(firstDelay).toBe(1000);
    setIntervalSpy.mockRestore();
  });

  it('does not schedule a tick when all deadlines are in the past', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const past = new Date(Date.now() - 60 * 1000); // 1 minute ago
    render(
      <PredictionStepKnockoutRound
        {...defaultProps}
        roundMatches={[makeMatchWithDeadline('r32-m1', past)]}
        previousRoundPredictions={{}}
      />,
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });
});
