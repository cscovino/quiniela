import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = { args: { label: 'Checkbox label' } };
export const Checked: Story = { args: { label: 'Checked', defaultChecked: true } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true } };
export const WithoutLabel: Story = { args: {} };
