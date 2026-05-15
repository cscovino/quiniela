import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const WithLabel: Story = {
  args: { label: 'Username', placeholder: 'Enter username' },
};

export const WithError: Story = {
  args: { label: 'Email', error: 'Invalid email address', variant: 'error' },
};

export const WithHelperText: Story = {
  args: { label: 'Password', helperText: 'Must be at least 8 characters' },
};

export const Success: Story = {
  args: { label: 'Username', variant: 'success', defaultValue: 'valid_user' },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};
