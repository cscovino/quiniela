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
});
