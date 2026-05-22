import type { Meta, StoryObj } from '@storybook/react-vite';
import { TournamentHeader } from './TournamentHeader';

const meta = {
  component: TournamentHeader,
  tags: ['ai-generated'],
  argTypes: {
    status: { control: 'select', options: ['draft', 'active', 'finished'] },
  },
} satisfies Meta<typeof TournamentHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const args = {
  name: 'FIFA World Cup 2026',
  startDate: new Date('2026-06-20'),
  endDate: new Date('2026-07-20'),
  participantCount: 48,
  translations: { teams: 'teams' },
};

export const Active: Story = { args: { ...args, status: 'active' } };
export const Draft: Story = { args: { ...args, status: 'draft' } };
export const Finished: Story = { args: { ...args, status: 'finished' } };

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TournamentHeader {...args} status="draft" />
      <TournamentHeader {...args} status="active" />
      <TournamentHeader {...args} status="finished" />
    </div>
  ),
};
