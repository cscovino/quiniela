import { render, screen } from '@testing-library/react';

import { Input } from './Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="Required field" />);
    expect(screen.getByText('Required field')).toHaveClass('input__helper--error');
  });

  it('renders with helper text', () => {
    render(<Input helperText="Must be at least 8 characters" />);
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('applies error variant class', () => {
    render(<Input variant="error" />);
    expect(screen.getByRole('textbox')).toHaveClass('input--error');
  });

  it('applies success variant class', () => {
    render(<Input variant="success" />);
    expect(screen.getByRole('textbox')).toHaveClass('input--success');
  });

  it('generates id when not provided', () => {
    const { container } = render(<Input label="Test" />);
    const input = container.querySelector('input');
    const label = container.querySelector('label');
    expect(input?.id).toBe(label?.htmlFor);
  });

  it('uses provided id', () => {
    render(<Input id="custom-id" label="Test" />);
    expect(screen.getByLabelText('Test')).toHaveAttribute('id', 'custom-id');
  });
});
