import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

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

  it.todo('derivedPrefill seeds empty selects');
  it.todo('saved existingPrediction wins over derivedPrefill');
  it.todo('derivedPrefill TBD fields are ignored');
});
