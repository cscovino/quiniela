import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamSelector } from './TeamSelector';

const mockOptions = [
  { fifaCode: 'ARG', name: 'Argentina' },
  { fifaCode: 'FRA', name: 'France' },
];

describe('TeamSelector', () => {
  it('renders team options', () => {
    render(<TeamSelector options={mockOptions} onChange={() => {}} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('calls onChange when a team is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TeamSelector options={mockOptions} onChange={handleChange} />);

    const options = screen.getAllByRole('radio');
    await user.click(options[0]);

    expect(handleChange).toHaveBeenCalledWith('ARG');
  });

  it('shows selected state', () => {
    render(<TeamSelector options={mockOptions} value="ARG" onChange={() => {}} />);
    const selectedOption = screen.getByText('Argentina').closest('label');
    expect(selectedOption).toHaveClass('team-selector__option--selected');
  });

  it('disables options when disabled prop is true', () => {
    render(<TeamSelector options={mockOptions} onChange={() => {}} disabled />);
    const options = screen.getAllByRole('radio');
    options.forEach((option) => {
      expect(option).toBeDisabled();
    });
  });

  it('shows label when provided', () => {
    render(<TeamSelector options={mockOptions} onChange={() => {}} label="Pick winner" />);
    expect(screen.getByText('Pick winner')).toBeInTheDocument();
  });

  it('multiple instances have unique radio group names', () => {
    const { container } = render(
      <div>
        <TeamSelector options={mockOptions} onChange={() => {}} />
        <TeamSelector options={mockOptions} onChange={() => {}} />
      </div>,
    );

    const radios = container.querySelectorAll('input[type="radio"]');
    const radioNames = Array.from(radios).map((r) => r.getAttribute('name'));

    const firstSelectorRadios = radioNames.slice(0, 2);
    const secondSelectorRadios = radioNames.slice(2, 4);

    expect(firstSelectorRadios[0]).toBe(firstSelectorRadios[1]);
    expect(secondSelectorRadios[0]).toBe(secondSelectorRadios[1]);
    expect(firstSelectorRadios[0]).not.toBe(secondSelectorRadios[0]);
  });
});
