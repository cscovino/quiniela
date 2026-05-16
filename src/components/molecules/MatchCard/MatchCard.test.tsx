import { render, screen } from '@testing-library/react';
import { MatchCard } from './MatchCard';

const mockHomeTeam = { fifaCode: 'ARG', name: 'Argentina' };
const mockAwayTeam = { fifaCode: 'FRA', name: 'France' };
const mockDate = new Date('2026-06-20T16:00:00Z');

describe('MatchCard', () => {
  it('renders home and away teams', () => {
    render(
      <MatchCard
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
        date={mockDate}
        status="scheduled"
      />,
    );
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('shows score when result is provided', () => {
    render(
      <MatchCard
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
        date={mockDate}
        status="finished"
        result={{ home: 2, away: 1 }}
      />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(
      <MatchCard homeTeam={mockHomeTeam} awayTeam={mockAwayTeam} date={mockDate} status="live" />,
    );
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('shows phase when provided', () => {
    render(
      <MatchCard
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
        date={mockDate}
        status="scheduled"
        phase="Group A"
      />,
    );
    expect(screen.getByText('GROUP A')).toBeInTheDocument();
  });

  it('shows stadium when provided', () => {
    render(
      <MatchCard
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
        date={mockDate}
        status="scheduled"
        stadium="Azteca Stadium"
      />,
    );
    expect(screen.getByText('Azteca Stadium')).toBeInTheDocument();
  });

  it('is clickable when onClick is provided', () => {
    const handleClick = vi.fn();
    render(
      <MatchCard
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
        date={mockDate}
        status="scheduled"
        onClick={handleClick}
      />,
    );
    const card = screen.getByRole('button');
    card.click();
    expect(handleClick).toHaveBeenCalled();
  });
});
