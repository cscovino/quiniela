import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button variant="ghost">Hover me</Button>,
  },
};

export const Positions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', padding: '48px' }}>
      <Tooltip content="Top" position="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" position="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" position="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>
      <Tooltip content="Right" position="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
    </div>
  ),
};
