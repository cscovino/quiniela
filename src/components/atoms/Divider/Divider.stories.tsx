import type { Meta, StoryObj } from '@storybook/react-vite';

import { Divider } from './Divider';

const meta = {
  component: Divider,
  tags: ['ai-generated'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

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
