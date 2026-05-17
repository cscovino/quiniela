import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PredictionTemplate } from './PredictionTemplate';

const mockFormProps = {
  matches: [
    {
      matchId: 'match-1',
      homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
      awayTeam: { fifaCode: 'FRA', name: 'France' },
      phase: 'group' as const,
      predictionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ],
};

describe('PredictionTemplate', () => {
  it('renders prediction form', () => {
    render(<PredictionTemplate formProps={mockFormProps} />);
    expect(screen.getByText('Matchday Predictions')).toBeInTheDocument();
  });

  it('renders countdown when deadline provided', () => {
    render(
      <PredictionTemplate formProps={mockFormProps} deadline={new Date(Date.now() + 3600000)} />,
    );
    expect(screen.getByText('Time remaining:')).toBeInTheDocument();
  });
});
