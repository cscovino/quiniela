import { render, screen } from '@testing-library/react';

import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('badge--primary');
  });

  it('applies custom variant', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('badge--success');
  });

  it('applies default size', () => {
    render(<Badge>Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('badge--md');
  });

  it('applies custom size', () => {
    render(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('badge--lg');
  });

  it('merges custom className', () => {
    render(<Badge className="custom">Test</Badge>);
    expect(screen.getByText('Test')).toHaveClass('custom');
  });
});
