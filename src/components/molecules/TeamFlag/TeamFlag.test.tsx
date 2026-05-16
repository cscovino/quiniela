import { render, screen } from '@testing-library/react';
import { TeamFlag } from './TeamFlag';

describe('TeamFlag', () => {
  it('renders flag with fifa code', () => {
    render(<TeamFlag fifaCode="ARG" />);
    const flag = screen.getByRole('img', { name: 'ARG flag' });
    expect(flag).toHaveClass('fi', 'fi-ar');
  });

  it('renders with team name when showName is true', () => {
    render(<TeamFlag fifaCode="BRA" name="Brazil" showName />);
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<TeamFlag fifaCode="FRA" size="lg" />);
    expect(container.firstChild).toHaveClass('team-flag--lg');
  });

  it('shows unknown flag for unmapped code', () => {
    render(<TeamFlag fifaCode="XXX" />);
    const flag = screen.getByRole('img');
    expect(flag).toHaveClass('fi-xx');
  });
});
