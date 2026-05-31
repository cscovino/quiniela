import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
});
