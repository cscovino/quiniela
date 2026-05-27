import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['ai-generated'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'accent', 'danger', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Primary', variant: 'primary' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /primary/i });
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();
  },
};

export const Secondary: Story = { args: { children: 'Secondary', variant: 'secondary' } };
export const Accent: Story = { args: { children: 'Accent', variant: 'accent' } };
export const Danger: Story = { args: { children: 'Danger', variant: 'danger' } };
export const Ghost: Story = { args: { children: 'Ghost', variant: 'ghost' } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = { args: { children: 'Loading...', isLoading: true } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };

export const CssCheck: Story = {
  args: { children: 'Accent', variant: 'accent', size: 'lg' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /accent/i });
    // Verify CSS classes are applied - proves component renders with correct styling
    await expect(button).toHaveClass('btn');
    await expect(button).toHaveClass('btn--accent');
    await expect(button).toHaveClass('btn--lg');
  },
};
