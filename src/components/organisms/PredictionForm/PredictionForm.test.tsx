import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PredictionForm } from './PredictionForm';

const mockMatches = [
  {
    matchId: 'match-1',
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'FRA', name: 'France' },
    phase: 'group' as const,
    predictionDeadline: new Date(Date.now() + 3600000),
  },
  {
    matchId: 'match-2',
    homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
    awayTeam: { fifaCode: 'GER', name: 'Germany' },
    phase: 'knockout' as const,
    predictionDeadline: new Date(Date.now() + 3600000),
  },
];

describe('PredictionForm', () => {
  it('renders match predictions', () => {
    render(<PredictionForm matches={mockMatches} onSubmit={() => {}} />);
    expect(screen.getByText('Argentina vs France')).toBeInTheDocument();
    expect(screen.getByText('Brazil vs Germany')).toBeInTheDocument();
  });

  it('shows submit button', () => {
    render(<PredictionForm matches={mockMatches} onSubmit={() => {}} />);
    expect(screen.getByText('Submit Predictions')).toBeInTheDocument();
  });

  it('calls onSubmit with predictions', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<PredictionForm matches={mockMatches} onSubmit={handleSubmit} />);

    const submitBtn = screen.getByText('Submit Predictions');
    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('shows empty state when no matches', () => {
    render(<PredictionForm matches={[]} onSubmit={() => {}} />);
    expect(screen.getByText('No matches available for prediction')).toBeInTheDocument();
  });

  it('disables form when isDisabled is true', () => {
    render(<PredictionForm matches={mockMatches} onSubmit={() => {}} isDisabled />);
    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
