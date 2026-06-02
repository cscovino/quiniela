import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FinalPhaseForm } from './FinalPhaseForm';

const mockTeams = [
  { fifaCode: 'BRA', name: 'Brazil' },
  { fifaCode: 'ARG', name: 'Argentina' },
  { fifaCode: 'FRA', name: 'France' },
  { fifaCode: 'GER', name: 'Germany' },
];

describe('FinalPhaseForm', () => {
  it('renders without crashing', () => {
    render(<FinalPhaseForm teams={mockTeams} onSubmit={vi.fn()} />);
  });

  it('derivedPrefill seeds empty selects', () => {
    render(
      <FinalPhaseForm
        teams={mockTeams}
        onSubmit={vi.fn()}
        derivedPrefill={{ first: 'BRA', second: 'ARG', third: 'FRA', fourth: 'GER' }}
      />,
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('BRA');
    expect(selects[1]).toHaveValue('ARG');
    expect(selects[2]).toHaveValue('FRA');
    expect(selects[3]).toHaveValue('GER');
  });

  it('saved existingPrediction wins over derivedPrefill', () => {
    render(
      <FinalPhaseForm
        teams={mockTeams}
        onSubmit={vi.fn()}
        existingPrediction={{ first: 'ARG', second: 'FRA', third: 'GER', fourth: 'BRA' }}
        derivedPrefill={{ first: 'BRA', second: 'ARG', third: 'FRA', fourth: 'GER' }}
      />,
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('ARG');
    expect(selects[1]).toHaveValue('FRA');
    expect(selects[2]).toHaveValue('GER');
    expect(selects[3]).toHaveValue('BRA');
  });

  it('derivedPrefill TBD fields are ignored', () => {
    render(
      <FinalPhaseForm
        teams={mockTeams}
        onSubmit={vi.fn()}
        derivedPrefill={{ first: 'TBD', second: 'ARG', third: 'FRA', fourth: 'GER' }}
      />,
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('');
    expect(selects[1]).toHaveValue('ARG');
  });
});
