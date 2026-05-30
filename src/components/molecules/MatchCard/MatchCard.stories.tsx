import type { Meta, StoryObj } from '@storybook/react-vite';

import { MatchCard } from './MatchCard';

const translations = {
  scheduled: 'Scheduled',
  live: 'LIVE',
  finished: 'Finished',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
  vs: 'VS',
};

const meta = {
  component: MatchCard,
  tags: ['ai-generated'],
  argTypes: {
    status: {
      control: 'select',
      options: ['scheduled', 'live', 'finished', 'postponed', 'cancelled'],
    },
  },
} satisfies Meta<typeof MatchCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const args = {
  homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
  awayTeam: { fifaCode: 'FRA', name: 'France' },
  date: new Date('2026-06-20T16:00:00Z'),
  stadium: 'Azteca Stadium',
  phase: 'Group A',
  translations,
};

export const Scheduled: Story = { args: { ...args, status: 'scheduled' } };
export const Live: Story = { args: { ...args, status: 'live' } };
export const Finished: Story = {
  args: { ...args, status: 'finished', result: { home: 2, away: 1 } },
};
export const Postponed: Story = { args: { ...args, status: 'postponed' } };
export const Cancelled: Story = { args: { ...args, status: 'cancelled' } };

// Knockout match whose teams aren't decided yet — shows formatted slot labels.
export const UndecidedKnockout: Story = {
  args: {
    ...args,
    status: 'scheduled',
    phase: 'Round of 32',
    homeTeam: { fifaCode: 'TBD', name: 'TBD' },
    awayTeam: { fifaCode: 'TBD', name: 'TBD' },
    homePlaceholder: '1A',
    awayPlaceholder: '3C/D/E',
  },
};

export const UndecidedProgression: Story = {
  args: {
    ...args,
    status: 'scheduled',
    phase: 'Final',
    homeTeam: { fifaCode: 'TBD', name: 'TBD' },
    awayTeam: { fifaCode: 'TBD', name: 'TBD' },
    homePlaceholder: 'W-SF-1',
    awayPlaceholder: 'W-SF-2',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}
    >
      <MatchCard {...args} status="scheduled" />
      <MatchCard {...args} status="live" />
      <MatchCard {...args} status="finished" result={{ home: 2, away: 1 }} />
      <MatchCard {...args} status="postponed" />
      <MatchCard {...args} status="cancelled" />
    </div>
  ),
};
