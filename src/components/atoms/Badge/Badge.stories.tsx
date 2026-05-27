import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const meta = {
  component: Badge,
  tags: ['ai-generated'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'accent', 'success', 'warning', 'error', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary', children: 'Primary' } };
export const Accent: Story = { args: { variant: 'accent', children: '⭐ Featured' } };
export const Success: Story = { args: { variant: 'success', children: '✓ Verified' } };
export const Warning: Story = { args: { variant: 'warning', children: '⚠ Warning' } };
export const Error: Story = { args: { variant: 'error', children: '✕ Error' } };
export const Info: Story = { args: { variant: 'info', children: 'ℹ Info' } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};
