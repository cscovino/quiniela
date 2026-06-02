import { fireEvent, render, screen } from '@testing-library/react';

import type { ThirdPlacedTeam } from '@app-types/prediction-steps';

import { ThirdPlaceConfirmation } from './ThirdPlaceConfirmation';

// Extend defaultTranslations with new optional keys used by the new state tests
const extendedTranslations = {
  heading: 'Third-Placed Teams Qualification',
  subtitle: 'Best 8 of 12 third-placed teams advance to Round of 32',
  advancing: 'Advancing to Round of 32',
  eliminated: 'Eliminated',
  bracketSlot: 'Match',
  adjust: 'Adjust Group Predictions',
  continue: 'Continue to Knockout',
  selectionCount: '{selected} / 8 advancing',
  toggleAdvancing: 'Click to remove from advancing',
  toggleEliminated: 'Click to add to advancing',
  maxSelected: '8 teams already selected. Deselect one to change.',
  loading: 'Loading your predictions...',
  error: 'Could not load your predictions. Please try again.',
  retry: 'Retry',
};

// 8 advancing teams (groups A–H) + 4 eliminated (groups I–L)
const mockAdvancing: ThirdPlacedTeam[] = [
  {
    rank: 1,
    teamId: 'BRA',
    teamName: 'Brazil',
    groupLetter: 'A',
    points: 6,
    goalDifference: 5,
    goalsScored: 7,
    advancing: true,
    bracketSlotLabel: 'Match 74',
    bracketMatchSlug: 'r32-m74',
  },
  {
    rank: 2,
    teamId: 'ESP',
    teamName: 'Spain',
    groupLetter: 'B',
    points: 5,
    goalDifference: 3,
    goalsScored: 5,
    advancing: true,
    bracketSlotLabel: 'Match 77',
    bracketMatchSlug: 'r32-m77',
  },
  {
    rank: 3,
    teamId: 'FRA',
    teamName: 'France',
    groupLetter: 'C',
    points: 5,
    goalDifference: 2,
    goalsScored: 4,
    advancing: true,
    bracketSlotLabel: 'Match 78',
    bracketMatchSlug: 'r32-m78',
  },
  {
    rank: 4,
    teamId: 'GER',
    teamName: 'Germany',
    groupLetter: 'D',
    points: 4,
    goalDifference: 1,
    goalsScored: 3,
    advancing: true,
    bracketSlotLabel: 'Match 79',
    bracketMatchSlug: 'r32-m79',
  },
  {
    rank: 5,
    teamId: 'ARG',
    teamName: 'Argentina',
    groupLetter: 'E',
    points: 4,
    goalDifference: 0,
    goalsScored: 2,
    advancing: true,
    bracketSlotLabel: 'Match 80',
    bracketMatchSlug: 'r32-m80',
  },
  {
    rank: 6,
    teamId: 'POR',
    teamName: 'Portugal',
    groupLetter: 'F',
    points: 4,
    goalDifference: 0,
    goalsScored: 1,
    advancing: true,
    bracketSlotLabel: 'Match 81',
    bracketMatchSlug: 'r32-m81',
  },
  {
    rank: 7,
    teamId: 'ENG',
    teamName: 'England',
    groupLetter: 'G',
    points: 3,
    goalDifference: 2,
    goalsScored: 4,
    advancing: true,
    bracketSlotLabel: 'Match 82',
    bracketMatchSlug: 'r32-m82',
  },
  {
    rank: 8,
    teamId: 'ITA',
    teamName: 'Italy',
    groupLetter: 'H',
    points: 3,
    goalDifference: 1,
    goalsScored: 3,
    advancing: true,
    bracketSlotLabel: 'Match 83',
    bracketMatchSlug: 'r32-m83',
  },
];

const mockEliminated: ThirdPlacedTeam[] = [
  {
    rank: 9,
    teamId: 'AUS',
    teamName: 'Australia',
    groupLetter: 'I',
    points: 3,
    goalDifference: -2,
    goalsScored: 3,
    advancing: false,
  },
  {
    rank: 10,
    teamId: 'CAN',
    teamName: 'Canada',
    groupLetter: 'J',
    points: 2,
    goalDifference: -3,
    goalsScored: 2,
    advancing: false,
  },
  {
    rank: 11,
    teamId: 'MEX',
    teamName: 'Mexico',
    groupLetter: 'K',
    points: 1,
    goalDifference: -4,
    goalsScored: 1,
    advancing: false,
  },
  {
    rank: 12,
    teamId: 'USA',
    teamName: 'United States',
    groupLetter: 'L',
    points: 1,
    goalDifference: -5,
    goalsScored: 1,
    advancing: false,
  },
];

const mockRankedTeams = [...mockAdvancing, ...mockEliminated];

const defaultTranslations = {
  heading: 'Third-Placed Teams Qualification',
  subtitle: 'Best 8 of 12 third-placed teams advance to Round of 32',
  advancing: 'Advancing to Round of 32',
  eliminated: 'Eliminated',
  bracketSlot: 'Match',
  adjust: 'Adjust Group Predictions',
  continue: 'Continue to Knockout',
  selectionCount: '{selected} / 8 advancing',
  toggleAdvancing: 'Click to remove from advancing',
  toggleEliminated: 'Click to add to advancing',
  maxSelected: '8 teams already selected. Deselect one to change.',
};

describe('ThirdPlaceConfirmation', () => {
  it('renders heading and subtitle', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    expect(screen.getByText('Third-Placed Teams Qualification')).toBeInTheDocument();
    expect(
      screen.getByText('Best 8 of 12 third-placed teams advance to Round of 32'),
    ).toBeInTheDocument();
  });

  it('shows all 8 advancing teams with correct data', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('(Group A)')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
    expect(screen.getByText('(Group B)')).toBeInTheDocument();
  });

  it('shows eliminated teams', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('calls onAdjust when Adjust button is clicked', () => {
    const onAdjust = vi.fn();
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={onAdjust}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Adjust Group Predictions' }));
    expect(onAdjust).toHaveBeenCalledTimes(1);
  });

  it('calls onContinue with 8 slug-form strings when Continue clicked with 8 selected', () => {
    const onContinue = vi.fn();
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={onContinue}
        translations={defaultTranslations}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue to Knockout' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    const emitted: string[] = onContinue.mock.calls[0][0];
    expect(emitted).toHaveLength(8);
    emitted.forEach((slug) => {
      expect(slug).toMatch(/^group-[a-l]$/);
    });
  });

  it('renders bracket slot labels for advancing teams', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    expect(screen.getByText(/74/)).toBeInTheDocument();
    expect(screen.getByText(/77/)).toBeInTheDocument();
  });

  it('shows correct point values', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    expect(screen.getByText(/6 pts/)).toBeInTheDocument();
    expect(screen.getAllByText(/5 pts/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3 pts/).length).toBeGreaterThanOrEqual(1);
  });

  it('toggle row changes advancing state: deselecting an advancing row disables Continue', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    // With 8 advancing, Continue should be enabled
    const continueBtn = screen.getByRole('button', { name: 'Continue to Knockout' });
    expect(continueBtn).not.toBeDisabled();

    // Click an advancing row to deselect it (aria-pressed="true")
    const advancingRows = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
    expect(advancingRows.length).toBeGreaterThan(0);
    fireEvent.click(advancingRows[0]);

    // Now only 7 are advancing, Continue should be disabled
    expect(continueBtn).toBeDisabled();
  });

  it('Continue disabled when fewer than 8 advancing', () => {
    // Build a fixture with only 7 advancing teams
    const sevenAdvancing = mockAdvancing.slice(0, 7);
    const allEliminated = [...mockAdvancing.slice(7), ...mockEliminated];
    const teamsWithSeven: ThirdPlacedTeam[] = [
      ...sevenAdvancing,
      ...allEliminated.map((t) => ({ ...t, advancing: false })),
    ];

    render(
      <ThirdPlaceConfirmation
        rankedTeams={teamsWithSeven}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    const continueBtn = screen.getByRole('button', { name: 'Continue to Knockout' });
    expect(continueBtn).toBeDisabled();
  });

  it('max 8 constraint: clicking a 9th row has no effect', () => {
    const onContinue = vi.fn();
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={onContinue}
        translations={defaultTranslations}
      />,
    );

    // With 8 already selected, click an eliminated (non-advancing) row
    const eliminatedRows = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('aria-pressed') === 'false');
    expect(eliminatedRows.length).toBeGreaterThan(0);
    fireEvent.click(eliminatedRows[0]);

    // Continue should still be enabled (still 8 selected, not 9)
    const continueBtn = screen.getByRole('button', { name: 'Continue to Knockout' });
    expect(continueBtn).not.toBeDisabled();

    // onContinue should still receive exactly 8 items
    fireEvent.click(continueBtn);
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue.mock.calls[0][0]).toHaveLength(8);
  });

  // S1 — loading state
  it('renders Spinner and loading message when isLoading=true; list is hidden', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={[]}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        isLoading={true}
        hasError={false}
        translations={extendedTranslations}
      />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading your predictions...')).toBeInTheDocument();
    expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
  });

  // S2 — error state
  it('renders error message and Retry button when hasError=true; Continue is absent', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={[]}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        isLoading={false}
        hasError={true}
        onRetry={vi.fn()}
        translations={extendedTranslations}
      />,
    );
    expect(
      screen.getByText('Could not load your predictions. Please try again.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to Knockout' })).not.toBeInTheDocument();
  });

  // S3 — Retry click calls onRetry
  it('calls onRetry exactly once when Retry button is clicked', () => {
    const onRetry = vi.fn();
    render(
      <ThirdPlaceConfirmation
        rankedTeams={[]}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        isLoading={false}
        hasError={true}
        onRetry={onRetry}
        translations={extendedTranslations}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // T1 — hasError=true: error shown, zero-point list absent, Continue absent
  it('T1: hasError=true hides zero-point ranked list and Continue button', () => {
    const zeroPointTeams: ThirdPlacedTeam[] = [
      {
        rank: 1,
        teamId: 'MEX',
        teamName: 'Mexico',
        groupLetter: 'A',
        points: 0,
        goalDifference: 0,
        goalsScored: 0,
        advancing: true,
      },
    ];
    render(
      <ThirdPlaceConfirmation
        rankedTeams={zeroPointTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        isLoading={false}
        hasError={true}
        onRetry={vi.fn()}
        translations={extendedTranslations}
      />,
    );
    // Error message present
    expect(
      screen.getByText('Could not load your predictions. Please try again.'),
    ).toBeInTheDocument();
    // Zero-point team name not rendered
    expect(screen.queryByText('Mexico')).not.toBeInTheDocument();
    // Continue button not rendered
    expect(screen.queryByRole('button', { name: 'Continue to Knockout' })).not.toBeInTheDocument();
  });

  // T2 — loaded state shows non-zero points, alphabetical fallback team absent
  it('T2: loaded state shows ranked teams with non-zero points; alphabetical fallback absent', () => {
    const realTeams: ThirdPlacedTeam[] = [
      {
        rank: 1,
        teamId: 'BRA',
        teamName: 'Brazil',
        groupLetter: 'A',
        points: 6,
        goalDifference: 5,
        goalsScored: 7,
        advancing: true,
        bracketSlotLabel: 'Match 74',
        bracketMatchSlug: 'r32-m74',
      },
      {
        rank: 2,
        teamId: 'ESP',
        teamName: 'Spain',
        groupLetter: 'B',
        points: 5,
        goalDifference: 3,
        goalsScored: 5,
        advancing: true,
        bracketSlotLabel: 'Match 77',
        bracketMatchSlug: 'r32-m77',
      },
      {
        rank: 3,
        teamId: 'FRA',
        teamName: 'France',
        groupLetter: 'C',
        points: 5,
        goalDifference: 2,
        goalsScored: 4,
        advancing: true,
      },
      {
        rank: 4,
        teamId: 'GER',
        teamName: 'Germany',
        groupLetter: 'D',
        points: 4,
        goalDifference: 1,
        goalsScored: 3,
        advancing: true,
      },
      {
        rank: 5,
        teamId: 'ARG',
        teamName: 'Argentina',
        groupLetter: 'E',
        points: 4,
        goalDifference: 0,
        goalsScored: 2,
        advancing: true,
      },
      {
        rank: 6,
        teamId: 'POR',
        teamName: 'Portugal',
        groupLetter: 'F',
        points: 4,
        goalDifference: 0,
        goalsScored: 1,
        advancing: true,
      },
      {
        rank: 7,
        teamId: 'ENG',
        teamName: 'England',
        groupLetter: 'G',
        points: 3,
        goalDifference: 2,
        goalsScored: 4,
        advancing: true,
      },
      {
        rank: 8,
        teamId: 'ITA',
        teamName: 'Italy',
        groupLetter: 'H',
        points: 3,
        goalDifference: 1,
        goalsScored: 3,
        advancing: true,
      },
    ];
    render(
      <ThirdPlaceConfirmation
        rankedTeams={realTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        isLoading={false}
        hasError={false}
        translations={extendedTranslations}
      />,
    );
    // Non-zero points visible
    expect(screen.getByText(/6 pts/)).toBeInTheDocument();
    // Alphabetical fallback team not present
    expect(screen.queryByText('Czech Republic')).not.toBeInTheDocument();
    // Ranked list is rendered
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });
});
