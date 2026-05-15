import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from './Radio';

describe('Radio', () => {
  it('renders with label', () => {
    render(<Radio label="Option 1" name="group" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('can be selected', async () => {
    render(<Radio label="Select me" name="test" />);
    const radio = screen.getByRole('radio');
    await userEvent.click(radio);
    expect(radio).toBeChecked();
  });

  it('applies custom className', () => {
    render(<Radio name="test" className="custom" />);
    expect(screen.getByRole('radio').closest('.radio-wrapper')).toHaveClass('custom');
  });
});
