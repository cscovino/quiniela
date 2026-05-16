import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StandingsTemplate } from './StandingsTemplate';
import type { NavBarProps } from '@organisms/NavBar/NavBar';

const mockNavProps: NavBarProps = {
  locale: 'es',
  theme: 'light',
  onLocaleChange: () => {},
  onThemeChange: () => {},
};

const mockGroups = [
  {
    name: 'Group A',
    standings: [
      {
        teamId: 'arg',
        teamName: 'Argentina',
        fifaCode: 'ARG',
        position: 1,
        played: 3,
        won: 2,
        drawn: 1,
        lost: 0,
        goalsFor: 5,
        goalsAgainst: 1,
        points: 7,
      },
      {
        teamId: 'fra',
        teamName: 'France',
        fifaCode: 'FRA',
        position: 2,
        played: 3,
        won: 1,
        drawn: 1,
        lost: 1,
        goalsFor: 3,
        goalsAgainst: 3,
        points: 4,
      },
    ],
  },
];

const mockRounds = [
  {
    name: 'Round of 16',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'AUS', name: 'Australia' },
        date: new Date('2026-07-01'),
        status: 'scheduled' as const,
      },
    ],
  },
];

describe('StandingsTemplate', () => {
  it('renders page title', () => {
    render(<StandingsTemplate navProps={mockNavProps} groups={mockGroups} />);
    expect(screen.getByText('Tournament Standings')).toBeInTheDocument();
  });

  it('renders group standings', () => {
    render(<StandingsTemplate navProps={mockNavProps} groups={mockGroups} />);
    expect(screen.getByText('Group Stage')).toBeInTheDocument();
    expect(screen.getByText('Group A')).toBeInTheDocument();
  });

  it('renders knockout bracket when provided', () => {
    render(
      <StandingsTemplate navProps={mockNavProps} groups={mockGroups} bracketRounds={mockRounds} />,
    );
    expect(screen.getByText('Knockout Stage')).toBeInTheDocument();
    expect(screen.getByText('Round of 16')).toBeInTheDocument();
  });

  it('does not render bracket when rounds not provided', () => {
    render(<StandingsTemplate navProps={mockNavProps} groups={mockGroups} />);
    expect(screen.queryByText('Knockout Stage')).not.toBeInTheDocument();
  });
});
