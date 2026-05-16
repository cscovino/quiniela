import { render, screen } from '@testing-library/react';
import { TournamentHeader } from './TournamentHeader';

describe('TournamentHeader', () => {
  const mockDate = new Date('2026-06-20');
  const mockEndDate = new Date('2026-07-20');

  it('renders tournament name', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
      />,
    );
    expect(screen.getByText('World Cup 2026')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
      />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows dates', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
      />,
    );
    expect(screen.getByText(/Jun 20/i)).toBeInTheDocument();
  });

  it('shows participant count when provided', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
        participantCount={128}
      />,
    );
    expect(screen.getByText('128 players')).toBeInTheDocument();
  });

  it('hides participant count when not provided', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
      />,
    );
    expect(screen.queryByText(/players/)).not.toBeInTheDocument();
  });
});
