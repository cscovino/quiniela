import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  component: Checkbox,
  tags: ['ai-generated'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Checkbox label' } };
export const Checked: Story = { args: { label: 'Checked', defaultChecked: true } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true } };
export const WithoutLabel: Story = { args: {} };
