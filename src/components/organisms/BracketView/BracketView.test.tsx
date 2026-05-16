import { render, screen } from '@testing-library/react';
import { BracketView } from './BracketView';

const mockRounds = [
  {
    name: 'Round of 16',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'AUS', name: 'Australia' },
        date: new Date('2026-07-01T16:00:00Z'),
        status: 'scheduled' as const,
      },
      {
        homeTeam: { fifaCode: 'FRA', name: 'France' },
        awayTeam: { fifaCode: 'POL', name: 'Poland' },
        date: new Date('2026-07-01T20:00:00Z'),
        status: 'scheduled' as const,
      },
    ],
  },
  {
    name: 'Quarterfinals',
    matches: [
      {
        homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
        awayTeam: { fifaCode: 'FRA', name: 'France' },
        date: new Date('2026-07-05T16:00:00Z'),
        status: 'scheduled' as const,
      },
    ],
  },
];

describe('BracketView', () => {
  it('renders round names', () => {
    render(<BracketView rounds={mockRounds} />);
    expect(screen.getByText('Round of 16')).toBeInTheDocument();
    expect(screen.getByText('Quarterfinals')).toBeInTheDocument();
  });

  it('renders matches', () => {
    render(<BracketView rounds={mockRounds} />);
    const argentinaElements = screen.getAllByText('Argentina');
    expect(argentinaElements.length).toBeGreaterThan(0);
  });

  it('shows empty state when no rounds', () => {
    render(<BracketView rounds={[]} />);
    expect(screen.getByText('Bracket not available yet')).toBeInTheDocument();
  });
});
