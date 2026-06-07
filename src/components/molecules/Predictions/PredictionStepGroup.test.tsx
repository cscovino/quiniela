import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MatchWithId } from '@utils/predictions-flow';

import type { GroupForStep, PredictionStepGroupProps } from './PredictionStepGroup';
import { PredictionStepGroup } from './PredictionStepGroup';

const mockGroup: GroupForStep = {
  slug: 'A',
  name: 'Group A',
  teams: [
    { fifaCode: 'ARG', name: 'Argentina' },
    { fifaCode: 'BRA', name: 'Brazil' },
  ],
};

const defaultProps: PredictionStepGroupProps = {
  group: mockGroup,
  groupMatches: [],
  teamsMap: {},
  existingMatchValues: {},
  existingGroupBet: null,
  onSubmit: vi.fn(),
  isDisabled: false,
  locale: 'en',
};

const makeMatch = (id: string, home: string, away: string): MatchWithId =>
  ({
    id,
    slug: id,
    groupId: 'A',
    phase: 'group',
    homeTeamId: home,
    awayTeamId: away,
    date: { toDate: () => new Date('2030-01-01') },
    stadium: 'Test Stadium',
    result: { home: null, away: null },
    status: 'scheduled',
    // Future deadline so inputs stay enabled.
    predictionDeadline: { toDate: () => new Date('2030-01-01') },
    createdAt: { toDate: () => new Date('2030-01-01') },
    updatedAt: { toDate: () => new Date('2030-01-01') },
  }) as unknown as MatchWithId;

describe('PredictionStepGroup', () => {
  it('renders without errors', () => {
    render(<PredictionStepGroup {...defaultProps} />);
    // The classification heading is always rendered regardless of groupMatches length
    expect(screen.getByText('Group Classification')).toBeInTheDocument();
  });

  it('does not render a sync-from-scores button', () => {
    render(<PredictionStepGroup {...defaultProps} />);
    // isClassificationManual starts false so the button is never shown on initial render;
    // this test documents the expected post-UX-01-fix state.
    expect(screen.queryByRole('button', { name: /sync/i })).not.toBeInTheDocument();
  });

  it('renders a select element for each team position', () => {
    render(<PredictionStepGroup {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(mockGroup.teams.length);
  });

  it('renders the classification heading', () => {
    render(<PredictionStepGroup {...defaultProps} />);
    expect(screen.getByText('Group Classification')).toBeInTheDocument();
  });

  describe('existingMatchValues handling', () => {
    const match = makeMatch('ga-m1', 'ARG', 'BRA');
    const teamsMap = {
      ARG: { fifaCode: 'ARG', name: 'Argentina' },
      BRA: { fifaCode: 'BRA', name: 'Brazil' },
    };

    it('initializes inputs from existingMatchValues on mount', () => {
      render(
        <PredictionStepGroup
          {...defaultProps}
          groupMatches={[match]}
          teamsMap={teamsMap}
          existingMatchValues={{ 'ga-m1': { home: 2, away: 1 } }}
        />,
      );
      const inputs = screen.getAllByRole('textbox');
      expect((inputs[0] as HTMLInputElement).value).toBe('2');
      expect((inputs[1] as HTMLInputElement).value).toBe('1');
    });

    it('fills inputs from existingMatchValues when they arrive after mount (async load)', () => {
      const { rerender } = render(
        <PredictionStepGroup
          {...defaultProps}
          groupMatches={[match]}
          teamsMap={teamsMap}
          existingMatchValues={{}}
        />,
      );
      expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('');

      rerender(
        <PredictionStepGroup
          {...defaultProps}
          groupMatches={[match]}
          teamsMap={teamsMap}
          existingMatchValues={{ 'ga-m1': { home: 2, away: 1 } }}
        />,
      );
      const inputs = screen.getAllByRole('textbox');
      expect((inputs[0] as HTMLInputElement).value).toBe('2');
      expect((inputs[1] as HTMLInputElement).value).toBe('1');
    });

    it('preserves user input when existingMatchValues updates (regression: inputs-reset bug)', () => {
      const { rerender } = render(
        <PredictionStepGroup
          {...defaultProps}
          groupMatches={[match]}
          teamsMap={teamsMap}
          existingMatchValues={{ 'ga-m1': { home: 0, away: 0 } }}
        />,
      );

      const homeInput = screen.getAllByRole('textbox')[0];
      fireEvent.change(homeInput, { target: { value: '3' } });
      expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('3');

      // Simulate existingMatchValues updating for any reason: refetch, post-submit
      // ripple, or sibling step re-render that flows a new prop reference.
      rerender(
        <PredictionStepGroup
          {...defaultProps}
          groupMatches={[match]}
          teamsMap={teamsMap}
          existingMatchValues={{ 'ga-m1': { home: 1, away: 1 } }}
        />,
      );

      // User's typed value (3) must NOT be overwritten by the new saved value (1).
      expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('3');
    });

    it('fills a different still-empty slot while preserving a typed one', () => {
      const match2 = makeMatch('ga-m2', 'GER', 'FRA');
      const { rerender } = render(
        <PredictionStepGroup
          {...defaultProps}
          groupMatches={[match, match2]}
          teamsMap={teamsMap}
          existingMatchValues={{}}
        />,
      );

      // User completes match 1 (both sides) so it commits to parent state.
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '3' } });
      fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: '0' } });
      expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('3');
      expect((screen.getAllByRole('textbox')[1] as HTMLInputElement).value).toBe('0');
      // match 2 is in the next pair of inputs (indexes 2-3); still empty.
      expect((screen.getAllByRole('textbox')[2] as HTMLInputElement).value).toBe('');
      expect((screen.getAllByRole('textbox')[3] as HTMLInputElement).value).toBe('');

      // Saved values arrive for both matches.
      rerender(
        <PredictionStepGroup
          {...defaultProps}
          groupMatches={[match, match2]}
          teamsMap={teamsMap}
          existingMatchValues={{
            'ga-m1': { home: 1, away: 1 },
            'ga-m2': { home: 2, away: 2 },
          }}
        />,
      );

      // match 1 keeps the user's typed value (3, 0), not the saved (1, 1).
      expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('3');
      expect((screen.getAllByRole('textbox')[1] as HTMLInputElement).value).toBe('0');
      // match 2 was empty, so it adopts the saved value.
      expect((screen.getAllByRole('textbox')[2] as HTMLInputElement).value).toBe('2');
      expect((screen.getAllByRole('textbox')[3] as HTMLInputElement).value).toBe('2');
    });
  });
});
