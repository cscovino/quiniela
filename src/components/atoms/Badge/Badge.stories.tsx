import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'accent', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Primary: Story = { args: { children: 'Primary' } };
export const Accent: Story = { args: { children: '⭐ Featured' } };
export const Success: Story = { args: { children: '✓ Verified' } };
export const Warning: Story = { args: { children: '⚠ Warning' } };
export const Error: Story = { args: { children: '✕ Error' } };
export const Info: Story = { args: { children: 'ℹ Info' } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};
