import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from './ScoreDisplay';

describe('ScoreDisplay', () => {
  it('renders home and away scores', () => {
    render(<ScoreDisplay homeScore={2} awayScore={1} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows exact prediction badge', () => {
    render(<ScoreDisplay homeScore={2} awayScore={1} pointsEarned={3} isExact />);
    expect(screen.getByText('+3 EXACT!')).toBeInTheDocument();
  });

  it('shows winner badge', () => {
    render(<ScoreDisplay homeScore={2} awayScore={1} pointsEarned={1} isWinner />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('hides points when zero', () => {
    render(<ScoreDisplay homeScore={2} awayScore={1} pointsEarned={0} />);
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });
});
