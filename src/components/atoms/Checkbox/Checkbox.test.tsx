import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('can be checked', async () => {
    render(<Checkbox label="Check me" />);
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('applies custom className', () => {
    render(<Checkbox className="custom" />);
    expect(screen.getByRole('checkbox').closest('.checkbox-wrapper')).toHaveClass('custom');
  });
});
