import { fireEvent, render, screen } from '@testing-library/react';

import type { ThirdPlacedTeam } from '@app-types/prediction-steps';

import { ThirdPlaceConfirmation } from './ThirdPlaceConfirmation';

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
];

const mockEliminated: ThirdPlacedTeam[] = [
  {
    rank: 9,
    teamId: 'AUS',
    teamName: 'Australia',
    groupLetter: 'C',
    points: 3,
    goalDifference: -2,
    goalsScored: 3,
    advancing: false,
  },
  {
    rank: 10,
    teamId: 'CAN',
    teamName: 'Canada',
    groupLetter: 'D',
    points: 2,
    goalDifference: -3,
    goalsScored: 2,
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

    expect(screen.getByText('Advancing to Round of 32')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('(Group A)')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
    expect(screen.getByText('(Group B)')).toBeInTheDocument();
  });

  it('shows eliminated section', () => {
    render(
      <ThirdPlaceConfirmation
        rankedTeams={mockRankedTeams}
        onAdjust={vi.fn()}
        onContinue={vi.fn()}
        translations={defaultTranslations}
      />,
    );

    expect(screen.getByText('Eliminated')).toBeInTheDocument();
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

  it('calls onContinue when Continue button is clicked', () => {
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
    expect(screen.getByText(/5 pts/)).toBeInTheDocument();
    expect(screen.getByText(/3 pts/)).toBeInTheDocument();
    expect(screen.getByText(/2 pts/)).toBeInTheDocument();
  });
});
