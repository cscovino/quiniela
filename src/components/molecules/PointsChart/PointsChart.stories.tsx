import type { Meta, StoryObj } from '@storybook/react-vite';

import { type PointEntry, PointsChart } from './PointsChart';

const meta = {
  component: PointsChart,
  tags: ['autodocs'],
} satisfies Meta<typeof PointsChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const translations = {
  title: 'Points History',
  noData: 'No data available',
  points: 'Points',
  matches: 'Matches',
};

const predictor1Data: PointEntry[] = [
  { date: new Date('2026-06-12'), points: 5, cumulative: 5 },
  { date: new Date('2026-06-14'), points: 3, cumulative: 8 },
  { date: new Date('2026-06-16'), points: 7, cumulative: 15 },
  { date: new Date('2026-06-18'), points: 9, cumulative: 24 },
  { date: new Date('2026-06-20'), points: 11, cumulative: 35 },
];

const predictor2Data: PointEntry[] = [
  { date: new Date('2026-06-12'), points: 8, cumulative: 8 },
  { date: new Date('2026-06-14'), points: 4, cumulative: 12 },
  { date: new Date('2026-06-16'), points: 10, cumulative: 22 },
  { date: new Date('2026-06-18'), points: 6, cumulative: 28 },
  { date: new Date('2026-06-20'), points: 7, cumulative: 35 },
];

export const WithData: Story = {
  args: {
    series: [
      { id: 'pred-1', name: 'Predictor One', color: '#FF6B6B', data: predictor1Data },
      { id: 'pred-2', name: 'Predictor Two', color: '#4ECDC4', data: predictor2Data },
    ],
    translations,
  },
};

export const SinglePredictor: Story = {
  args: {
    series: [{ id: 'pred-1', name: 'My Predictor', color: '#45B7D1', data: predictor1Data }],
    translations,
  },
};

export const Empty: Story = {
  args: {
    series: [],
    translations,
  },
};

export const RisingTrend: Story = {
  args: {
    series: [
      {
        id: 'pred-1',
        name: 'Rising Star',
        color: '#A29BFE',
        data: [
          { date: new Date('2026-06-10'), points: 2, cumulative: 2 },
          { date: new Date('2026-06-11'), points: 3, cumulative: 5 },
          { date: new Date('2026-06-12'), points: 4, cumulative: 9 },
          { date: new Date('2026-06-13'), points: 5, cumulative: 14 },
          { date: new Date('2026-06-14'), points: 6, cumulative: 20 },
          { date: new Date('2026-06-15'), points: 7, cumulative: 27 },
        ],
      },
    ],
    translations,
  },
};
