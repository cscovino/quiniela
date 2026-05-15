import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('applies small size', () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toHaveStyle({ width: '16px', height: '16px' });
  });

  it('applies large size', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('has loading aria-label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });
});
