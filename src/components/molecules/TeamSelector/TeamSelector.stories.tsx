import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TeamSelector } from './TeamSelector';

const meta = {
  component: TeamSelector,
  tags: ['ai-generated'],
} satisfies Meta<typeof TeamSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const args = {
  options: [
    { fifaCode: 'ARG', name: 'Argentina' },
    { fifaCode: 'FRA', name: 'France' },
  ],
  label: 'Pick the winner',
};

export const Default: Story = { args };

export const WithSelection: Story = {
  args: { ...args, value: 'ARG' },
};

export const Disabled: Story = {
  args: { ...args, disabled: true },
};

const InteractivePreview = () => {
  const [selected, setSelected] = useState<string>();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <TeamSelector
        options={args.options}
        value={selected}
        onChange={setSelected}
        label="Pick the winner"
      />
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
        }}
      >
        Selected: {selected || 'None'}
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractivePreview />,
};

export const ThreeWay: Story = {
  args: {
    options: [
      { fifaCode: 'BRA', name: 'Brazil' },
      { fifaCode: 'GER', name: 'Germany' },
      { fifaCode: 'ESP', name: 'Spain' },
    ],
    label: 'Pick the winner',
  },
};
