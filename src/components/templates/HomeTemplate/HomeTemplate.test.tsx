import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeTemplate } from './HomeTemplate';
import type { TournamentHeaderProps } from '@organisms/TournamentHeader/TournamentHeader';

const matchTranslations = {
  scheduled: 'Scheduled',
  live: 'LIVE',
  finished: 'Finished',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
  vs: 'VS',
};

const translations = {
  heroTitle: 'Welcome to World Cup 2026',
  heroSubtitle: 'Make your predictions and compete!',
  ctaPredictions: 'Make Predictions',
  ctaStandings: 'View Standings',
  matchesTitle: 'Upcoming Matches',
  rankingsTitle: 'Top Players',
  matchList: matchTranslations,
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
  { userId: 'user-1', displayName: 'Carlos', points: 150, accuracy: 75, streak: 5 },
  { userId: 'user-2', displayName: 'Maria', points: 142, accuracy: 72, streak: 3 },
];

describe('HomeTemplate', () => {
  it('renders tournament header', () => {
    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={mockMatches}
        rankings={mockRankings}
        translations={translations}
      />,
    );
    expect(screen.getByText('World Cup 2026')).toBeInTheDocument();
  });

  it('renders matches section', () => {
    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={mockMatches}
        rankings={mockRankings}
        translations={translations}
      />,
    );
    expect(screen.getByText('Upcoming Matches')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });

  it('renders rankings section', () => {
    render(
      <HomeTemplate
        tournamentProps={mockTournamentProps}
        matches={mockMatches}
        rankings={mockRankings}
        translations={translations}
      />,
    );
    expect(screen.getByText('Top Players')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });
});
