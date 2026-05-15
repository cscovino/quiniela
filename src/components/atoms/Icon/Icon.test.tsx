import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders the correct emoji', () => {
    render(<Icon name="football" />);
    expect(screen.getByRole('img')).toHaveTextContent('⚽');
  });

  it('applies custom size', () => {
    render(<Icon name="trophy" size={32} />);
    expect(screen.getByRole('img')).toHaveStyle({ fontSize: '32px' });
  });

  it('applies custom color', () => {
    render(<Icon name="star" color="#ffc107" />);
    expect(screen.getByRole('img')).toHaveStyle({ color: '#ffc107' });
  });

  it('merges custom className', () => {
    render(<Icon name="user" className="custom" />);
    expect(screen.getByRole('img')).toHaveClass('custom');
  });
});
