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

export const WithData: Story = {
  args: {
    data: [
      { date: new Date('2026-06-12'), points: 5, cumulative: 5 },
      { date: new Date('2026-06-13'), points: 8, cumulative: 13 },
      { date: new Date('2026-06-14'), points: 3, cumulative: 16 },
      { date: new Date('2026-06-15'), points: 10, cumulative: 26 },
      { date: new Date('2026-06-16'), points: 7, cumulative: 33 },
      { date: new Date('2026-06-17'), points: 4, cumulative: 37 },
      { date: new Date('2026-06-18'), points: 9, cumulative: 46 },
      { date: new Date('2026-06-19'), points: 6, cumulative: 52 },
      { date: new Date('2026-06-20'), points: 11, cumulative: 63 },
      { date: new Date('2026-06-21'), points: 8, cumulative: 71 },
    ] as PointEntry[],
    translations,
  },
};

export const SinglePoint: Story = {
  args: {
    data: [
      { date: new Date('2026-06-12'), points: 5, cumulative: 5 },
      { date: new Date('2026-06-13'), points: 8, cumulative: 13 },
    ] as PointEntry[],
    translations,
  },
};

export const Empty: Story = {
  args: {
    data: [] as PointEntry[],
    translations,
  },
};

export const RisingTrend: Story = {
  args: {
    data: [
      { date: new Date('2026-06-10'), points: 2, cumulative: 2 },
      { date: new Date('2026-06-11'), points: 3, cumulative: 5 },
      { date: new Date('2026-06-12'), points: 4, cumulative: 9 },
      { date: new Date('2026-06-13'), points: 5, cumulative: 14 },
      { date: new Date('2026-06-14'), points: 6, cumulative: 20 },
      { date: new Date('2026-06-15'), points: 7, cumulative: 27 },
    ] as PointEntry[],
    translations,
  },
};
