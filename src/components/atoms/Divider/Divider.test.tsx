import { render, screen } from '@testing-library/react';

import { Divider } from './Divider';

describe('Divider', () => {
  it('renders horizontal divider by default', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el).toHaveClass('divider--horizontal');
  });

  it('renders vertical divider', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveClass('divider--vertical');
  });

  it('applies custom className', () => {
    render(<Divider className="custom" />);
    expect(screen.getByRole('separator')).toHaveClass('custom');
  });
});
