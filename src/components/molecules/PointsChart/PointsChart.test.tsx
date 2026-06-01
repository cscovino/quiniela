import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PointsChart } from './PointsChart';

const translations = {
  title: 'Points History',
  noData: 'No data',
  points: 'Points',
  matches: 'Matches',
  chartAriaLabel: 'Points earned per day',
  legendToggleAria: 'Toggle highlight for {name}',
};

describe('PointsChart', () => {
  describe('empty state', () => {
    it('renders noData text when series is empty', () => {
      render(<PointsChart series={[]} translations={translations} />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('renders title text in empty state', () => {
      render(<PointsChart series={[]} translations={translations} />);
      expect(screen.getByText('Points History')).toBeInTheDocument();
    });
  });

  describe('bar rendering', () => {
    it.todo('renders rect elements when series has data');
    it.todo('renders no path elements');
    it.todo('svg has aria-label from translations');
  });

  describe('summary row', () => {
    it.todo('matches count shows unique days not raw entry count');
  });
});
