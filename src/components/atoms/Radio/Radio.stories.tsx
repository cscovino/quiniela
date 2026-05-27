import type { Meta, StoryObj } from '@storybook/react-vite';

import { Radio } from './Radio';

const meta = {
  component: Radio,
  tags: ['ai-generated'],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Radio option', name: 'demo' } };
export const Checked: Story = { args: { label: 'Selected', name: 'demo', defaultChecked: true } };
export const Disabled: Story = { args: { label: 'Disabled', name: 'demo', disabled: true } };

export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Radio label="Option A" name="group" defaultChecked />
      <Radio label="Option B" name="group" />
      <Radio label="Option C" name="group" />
    </div>
  ),
};
