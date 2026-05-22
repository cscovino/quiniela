import { render, screen } from '@testing-library/react';
import { TournamentHeader } from './TournamentHeader';

describe('TournamentHeader', () => {
  const mockDate = new Date('2026-06-20');
  const mockEndDate = new Date('2026-07-20');
  const mockTranslations = { teams: 'teams' };

  it('renders tournament name', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
        translations={mockTranslations}
      />,
    );
    expect(screen.getByText('World Cup 2026')).toBeInTheDocument();
  });

  it('shows dates', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
        translations={mockTranslations}
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
        participantCount={48}
        translations={mockTranslations}
      />,
    );
    expect(screen.getByText('48 teams')).toBeInTheDocument();
  });

  it('hides participant count when not provided', () => {
    render(
      <TournamentHeader
        name="World Cup 2026"
        status="active"
        startDate={mockDate}
        endDate={mockEndDate}
        translations={mockTranslations}
      />,
    );
    expect(screen.queryByText(/teams/)).not.toBeInTheDocument();
  });
});
