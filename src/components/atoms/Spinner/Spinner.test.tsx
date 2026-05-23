import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toHaveClass('spinner--md');
  });

  it('applies small size', () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('spinner--sm');
  });

  it('applies large size', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('spinner--lg');
  });

  it('has loading aria-label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });
});
