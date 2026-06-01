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

const june12 = new Date('2026-06-12T10:00:00');
const june12b = new Date('2026-06-12T22:30:00');
const june15 = new Date('2026-06-15T14:00:00');

const mockSeries = [
  {
    id: 'pred-1',
    name: 'Alpha',
    color: '#FF6B6B',
    data: [
      { date: june12, points: 5 },
      { date: june15, points: 3 },
    ],
  },
];

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
    it('renders rect elements when series has data', () => {
      const { container } = render(<PointsChart series={mockSeries} translations={translations} />);
      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(0);
    });

    it('renders no path elements', () => {
      const { container } = render(<PointsChart series={mockSeries} translations={translations} />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(0);
    });

    it('renders svg with aria-label from translations', () => {
      const { container } = render(<PointsChart series={mockSeries} translations={translations} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-label', 'Points earned per day');
    });
  });

  describe('summary row', () => {
    it('matches count shows unique days not raw entry count', () => {
      const seriesWithDuplicateDay = [
        {
          id: 'pred-1',
          name: 'Alpha',
          color: '#FF6B6B',
          data: [
            { date: june12, points: 5 },
            { date: june12b, points: 3 },
            { date: june15, points: 7 },
          ],
        },
      ];
      const { container } = render(
        <PointsChart series={seriesWithDuplicateDay} translations={translations} />,
      );
      const values = container.querySelectorAll('.points-chart__value');
      const matchesValue = values[1];
      expect(matchesValue?.textContent).toBe('2');
    });
  });
});
