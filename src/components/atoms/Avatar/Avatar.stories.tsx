import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta = {
  component: Avatar,
  tags: ['ai-generated'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithName: Story = { args: { name: 'John Doe' } };
export const WithImage: Story = { args: { src: 'https://i.pravatar.cc/150?img=1', alt: 'User' } };
export const Empty: Story = { args: {} };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Avatar size="xs" name="XS" />
      <Avatar size="sm" name="SM" />
      <Avatar size="md" name="MD" />
      <Avatar size="lg" name="LG" />
      <Avatar size="xl" name="XL" />
    </div>
  ),
};
