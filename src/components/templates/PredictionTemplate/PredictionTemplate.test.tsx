import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PredictionTemplate } from './PredictionTemplate';
import type { NavBarProps } from '@organisms/NavBar/NavBar';

const mockNavProps: NavBarProps = {
  links: [
    { href: '/en', label: 'Home', active: false },
    { href: '/en/predictions', label: 'Predictions', active: true },
    { href: '/en/standings', label: 'Standings', active: false },
    { href: '/en/profile', label: 'Profile', active: false },
  ],
  locale: 'en',
};

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
  onSubmit: () => {},
};

describe('PredictionTemplate', () => {
  it('renders page title', () => {
    render(<PredictionTemplate navProps={mockNavProps} formProps={mockFormProps} />);
    expect(screen.getByText('Matchday Predictions')).toBeInTheDocument();
  });

  it('renders countdown when deadline provided', () => {
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    render(
      <PredictionTemplate navProps={mockNavProps} formProps={mockFormProps} deadline={deadline} />,
    );
    expect(screen.getByText('Time remaining:')).toBeInTheDocument();
  });

  it('renders prediction form', () => {
    render(<PredictionTemplate navProps={mockNavProps} formProps={mockFormProps} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('calls onSubmit with predictions', () => {
    const handleSubmit = vi.fn();
    render(
      <PredictionTemplate
        navProps={mockNavProps}
        formProps={mockFormProps}
        onSubmit={handleSubmit}
      />,
    );
    const submitButton = screen.getByText('Submit Predictions');
    submitButton.click();
    expect(handleSubmit).toHaveBeenCalled();
  });
});
