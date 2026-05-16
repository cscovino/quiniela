import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';

const meta = {
  component: Icon,
  tags: ['ai-generated'],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(
        [
          'football',
          'trophy',
          'star',
          'fire',
          'lightning',
          'target',
          'chart',
          'bell',
          'user',
          'flag',
          'check',
          'x',
          'clock',
          'live',
        ] as const
      ).map((name) => (
        <div
          key={name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
        >
          <Icon name={name} size={24} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-pixel)' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
      <Icon name="trophy" size={16} />
      <Icon name="trophy" size={24} />
      <Icon name="trophy" size={32} />
      <Icon name="trophy" size={48} />
    </div>
  ),
};
