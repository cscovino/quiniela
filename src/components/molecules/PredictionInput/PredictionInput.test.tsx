import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PredictionInput } from './PredictionInput';

describe('PredictionInput', () => {
  it('renders team names', () => {
    render(<PredictionInput homeTeamName="Argentina" awayTeamName="France" onChange={() => {}} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('calls onChange with correct scores', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <PredictionInput homeTeamName="Argentina" awayTeamName="France" onChange={handleChange} />,
    );

    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '3');

    expect(handleChange).toHaveBeenCalledWith(3, 0);
  });

  it('disables inputs when disabled prop is true', () => {
    render(
      <PredictionInput
        homeTeamName="Argentina"
        awayTeamName="France"
        onChange={() => {}}
        disabled
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('shows initial scores', () => {
    render(
      <PredictionInput
        homeTeamName="Argentina"
        awayTeamName="France"
        homeScore={2}
        awayScore={1}
        onChange={() => {}}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('2');
    expect(inputs[1]).toHaveValue('1');
  });
});
