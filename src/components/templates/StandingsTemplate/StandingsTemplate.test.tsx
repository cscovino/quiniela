import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StandingsTemplate } from './StandingsTemplate';

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
    ],
  },
];

describe('StandingsTemplate', () => {
  it('renders group standings', () => {
    render(<StandingsTemplate groups={mockGroups} />);
    expect(screen.getByText('Tournament Standings')).toBeInTheDocument();
    expect(screen.getByText('Group Stage')).toBeInTheDocument();
    expect(screen.getAllByText('Argentina').length).toBeGreaterThan(0);
  });

  it('renders bracket when provided', () => {
    const mockBracketRounds = [
      {
        name: 'Round of 32',
        matches: [
          {
            matchId: 'ko-1',
            homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
            awayTeam: { fifaCode: 'FRA', name: 'France' },
            date: new Date('2026-07-01T18:00:00Z'),
            status: 'scheduled' as const,
          },
        ],
      },
    ];
    render(<StandingsTemplate groups={mockGroups} bracketRounds={mockBracketRounds} />);
    expect(screen.getByText('Knockout Stage')).toBeInTheDocument();
  });
});
