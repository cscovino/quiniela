import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar } from './ProgressBar';

const meta = {
  component: ProgressBar,
  tags: ['ai-generated'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'accent', 'success', 'warning', 'error'] },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: 65 } };
export const WithLabel: Story = { args: { value: 75, showLabel: true } };
export const Empty: Story = { args: { value: 0, showLabel: true } };
export const Full: Story = { args: { value: 100, showLabel: true } };

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <ProgressBar value={80} variant="primary" showLabel />
      <ProgressBar value={65} variant="accent" showLabel />
      <ProgressBar value={50} variant="success" showLabel />
      <ProgressBar value={40} variant="warning" showLabel />
      <ProgressBar value={25} variant="error" showLabel />
    </div>
  ),
};
