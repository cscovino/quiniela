import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchList } from './MatchList';

const mockMatches = [
  {
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'FRA', name: 'France' },
    date: new Date('2026-06-20T16:00:00Z'),
    status: 'scheduled' as const,
  },
  {
    homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
    awayTeam: { fifaCode: 'GER', name: 'Germany' },
    date: new Date('2026-06-21T16:00:00Z'),
    status: 'scheduled' as const,
  },
];

describe('MatchList', () => {
  it('renders title', () => {
    render(<MatchList matches={mockMatches} title="Group A Matches" />);
    expect(screen.getByText('Group A Matches')).toBeInTheDocument();
  });

  it('renders matches', () => {
    render(<MatchList matches={mockMatches} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('shows empty message when no matches', () => {
    render(<MatchList matches={[]} emptyMessage="No matches yet" />);
    expect(screen.getByText('No matches yet')).toBeInTheDocument();
  });

  it('calls onMatchClick when match clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<MatchList matches={mockMatches} onMatchClick={handleClick} />);

    const cards = screen.getAllByRole('button');
    await user.click(cards[0]);
    expect(handleClick).toHaveBeenCalledWith(mockMatches[0]);
  });
});
