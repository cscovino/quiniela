import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Atoms/Divider',
  component: Divider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = { args: {} };

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', gap: '16px', height: '100px', alignItems: 'center' }}>
        <span>Left</span>
        <Story />
        <span>Right</span>
      </div>
    ),
  ],
};
