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

  it('keeps typed match scores when existingMatchValues prop later changes (BUG #2)', () => {
    // Simulates the optimistic-merge prop update on submit / predictor reload:
    // the parent passes a new existingMatchValues object, which previously re-ran the
    // [initialScores] effect and clobbered the user's in-progress edit.
    const match = makeMatch('ga-m1', 'ARG', 'BRA');
    const teamsMap = {
      ARG: { fifaCode: 'ARG', name: 'Argentina' },
      BRA: { fifaCode: 'BRA', name: 'Brazil' },
    };

    const { rerender } = render(
      <PredictionStepGroup
        {...defaultProps}
        groupMatches={[match]}
        teamsMap={teamsMap}
        existingMatchValues={{ 'ga-m1': { home: 0, away: 0 } }}
      />,
    );

    // Inputs render as text fields; first textbox = home score for ga-m1.
    const inputsBefore = screen.getAllByRole('textbox');
    const homeInput = inputsBefore[0];
    expect((homeInput as HTMLInputElement).value).toBe('0');

    // User types a home score of 3.
    fireEvent.change(homeInput, { target: { value: '3' } });
    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('3');

    // Parent re-renders the SAME mounted component with a CHANGED existingMatchValues prop.
    rerender(
      <PredictionStepGroup
        {...defaultProps}
        groupMatches={[match]}
        teamsMap={teamsMap}
        existingMatchValues={{ 'ga-m1': { home: 1, away: 1 } }}
      />,
    );

    // The typed value (3) must survive — NOT reset to the new prop value (1).
    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('3');
  });
});
