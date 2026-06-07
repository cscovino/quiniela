import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PredictionInput } from './PredictionInput';

describe('PredictionInput', () => {
  it('renders two score inputs', () => {
    render(<PredictionInput onChange={() => {}} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
  });

  it('calls onChange with correct scores when both fields are filled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<PredictionInput onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '3');
    await user.type(inputs[1], '0');

    expect(handleChange).toHaveBeenCalledWith(3, 0);
  });

  it('disables inputs when disabled prop is true', () => {
    render(<PredictionInput onChange={() => {}} disabled />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('shows initial scores', () => {
    render(<PredictionInput homeScore={2} awayScore={1} onChange={() => {}} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('2');
    expect(inputs[1]).toHaveValue('1');
  });

  it('shows empty inputs when no scores are provided', () => {
    render(<PredictionInput onChange={() => {}} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('');
    expect(inputs[1]).toHaveValue('');
  });

  it('allows clearing the input and retyping a new value', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<PredictionInput homeScore={5} awayScore={2} onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    expect(inputs[0]).toHaveValue('');

    await user.type(inputs[0], '7');
    expect(handleChange).toHaveBeenLastCalledWith(7, 2);
    expect(inputs[0]).toHaveValue('7');
  });

  it('preserves in-progress single-field input when props update (regression)', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { rerender } = render(<PredictionInput onChange={handleChange} />);

    // User types ONLY into home; away is still empty, so onChange has not fired
    // and the parent has no record of the typed value.
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '3');
    expect(inputs[0]).toHaveValue('3');
    expect(inputs[1]).toHaveValue('');

    // An external update arrives (e.g., sibling step submitted). The local
    // typed value must NOT be clobbered just because the prop equals ''.
    rerender(
      <PredictionInput homeScore={undefined} awayScore={undefined} onChange={handleChange} />,
    );
    expect(inputs[0]).toHaveValue('3');
    expect(inputs[1]).toHaveValue('');
  });

  it('preserves both fields once user has typed, even if props revert to undefined', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { rerender } = render(
      <PredictionInput homeScore={2} awayScore={1} onChange={handleChange} />,
    );

    // User clears both fields (intentionally).
    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    await user.clear(inputs[1]);
    expect(inputs[0]).toHaveValue('');
    expect(inputs[1]).toHaveValue('');

    // Rerender with the original scores; the user-emptied state wins.
    rerender(<PredictionInput homeScore={2} awayScore={1} onChange={handleChange} />);
    expect(inputs[0]).toHaveValue('');
    expect(inputs[1]).toHaveValue('');
  });
});
