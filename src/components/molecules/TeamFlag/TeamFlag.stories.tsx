import type { Meta, StoryObj } from '@storybook/react-vite';

import { TeamFlag } from './TeamFlag';

const meta = {
  component: TeamFlag,
  tags: ['ai-generated'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    fifaCode: { control: 'text' },
    name: { control: 'text' },
    showName: { control: 'boolean' },
  },
} satisfies Meta<typeof TeamFlag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Argentina: Story = { args: { fifaCode: 'ARG', name: 'Argentina', showName: true } };
export const Brazil: Story = { args: { fifaCode: 'BRA', name: 'Brazil', showName: true } };
export const France: Story = { args: { fifaCode: 'FRA', name: 'France', showName: true } };
export const England: Story = { args: { fifaCode: 'ENG', name: 'England', showName: true } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <TeamFlag fifaCode="ARG" size="sm" />
      <TeamFlag fifaCode="ARG" size="md" />
      <TeamFlag fifaCode="ARG" size="lg" />
    </div>
  ),
};

export const AllFlags: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '16px',
      }}
    >
      {[
        'ARG',
        'BRA',
        'FRA',
        'ENG',
        'ESP',
        'GER',
        'ITA',
        'POR',
        'NED',
        'BEL',
        'CRO',
        'URU',
        'COL',
        'JPN',
        'KOR',
        'USA',
        'MEX',
        'CAN',
        'MAR',
        'SEN',
      ].map((code) => (
        <div
          key={code}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <TeamFlag fifaCode={code} size="md" />
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-pixel)',
              color: 'var(--text-secondary)',
            }}
          >
            {code}
          </span>
        </div>
      ))}
    </div>
  ),
};
