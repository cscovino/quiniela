import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import { Tooltip } from './Tooltip';

const meta = {
  component: Tooltip,
  tags: ['ai-generated'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

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
