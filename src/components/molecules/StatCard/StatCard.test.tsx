import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Points" value={45} />);
    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<StatCard label="Streak" value={5} icon="fire" />);
    const icon = screen.getByRole('img', { name: 'fire' });
    expect(icon).toBeInTheDocument();
  });

  it('shows up trend styling', () => {
    const { container } = render(<StatCard label="Points" value={45} trend="up" />);
    const value = container.querySelector('.stat-card__value');
    expect(value).toHaveClass('stat-card__trend--up');
  });

  it('shows down trend styling', () => {
    const { container } = render(<StatCard label="Points" value={10} trend="down" />);
    const value = container.querySelector('.stat-card__value');
    expect(value).toHaveClass('stat-card__trend--down');
  });
});
