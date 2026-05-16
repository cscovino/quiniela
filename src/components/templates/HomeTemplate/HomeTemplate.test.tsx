import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeTemplate } from './HomeTemplate';
import type { NavBarProps } from '@organisms/NavBar/NavBar';
import type { TournamentHeaderProps } from '@organisms/TournamentHeader/TournamentHeader';

const mockNavProps: NavBarProps = {
  locale: 'es',
  theme: 'light',
  onLocaleChange: () => {},
  onThemeChange: () => {},
  isLoggedIn: true,
};

const mockTournamentProps: TournamentHeaderProps = {
  name: 'World Cup 2026',
  status: 'active',
  startDate: new Date('2026-06-11'),
  endDate: new Date('2026-07-19'),
  participantCount: 32,
};

const mockMatches = [
  {
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'FRA', name: 'France' },
    date: new Date('2026-06-15T18:00:00Z'),
    status: 'scheduled' as const,
    stadium: 'Lusail Stadium',
  },
];

const mockRankings = [
  { userId: 'user-1', displayName: 'Carlos', points: 120, accuracy: 75, streak: 3 },
  { userId: 'user-2', displayName: 'Maria', points: 115, accuracy: 72, streak: 2 },
];

describe('HomeTemplate', () => {
  it('renders tournament header', () => {
    render(
      <HomeTemplate
        navProps={mockNavProps}
        tournamentProps={mockTournamentProps}
        matches={mockMatches}
        rankings={mockRankings}
      />,
    );
    expect(screen.getByText('World Cup 2026')).toBeInTheDocument();
  });

  it('renders hero section with CTA buttons', () => {
    render(
      <HomeTemplate
        navProps={mockNavProps}
        tournamentProps={mockTournamentProps}
        matches={mockMatches}
        rankings={mockRankings}
      />,
    );
    expect(screen.getByText('Predict. Compet. Win.')).toBeInTheDocument();
    expect(screen.getByText('Make Predictions')).toBeInTheDocument();
    expect(screen.getByText('View Standings')).toBeInTheDocument();
  });

  it('renders matches section', () => {
    render(
      <HomeTemplate
        navProps={mockNavProps}
        tournamentProps={mockTournamentProps}
        matches={mockMatches}
        rankings={mockRankings}
      />,
    );
    expect(screen.getByText('Upcoming Matches')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });

  it('renders rankings section', () => {
    render(
      <HomeTemplate
        navProps={mockNavProps}
        tournamentProps={mockTournamentProps}
        matches={mockMatches}
        rankings={mockRankings}
      />,
    );
    expect(screen.getByText('Top Players')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });
});
