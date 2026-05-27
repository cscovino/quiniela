import { render, screen } from '@testing-library/react';

import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with value', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('calculates percentage correctly', () => {
    render(<ProgressBar value={25} max={200} showLabel />);
    expect(screen.getByText('13%')).toBeInTheDocument();
  });

  it('clamps value to 0-100 range', () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '150');

    rerender(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '-10');
  });

  it('shows label when enabled', () => {
    render(<ProgressBar value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    render(<ProgressBar value={50} variant="success" />);
    expect(screen.getByRole('progressbar').querySelector('.progress-bar__fill')).toHaveClass(
      'progress-bar__fill--success',
    );
  });

  it('applies custom className', () => {
    render(<ProgressBar value={50} className="custom" />);
    expect(screen.getByRole('progressbar')).toHaveClass('custom');
  });
});
