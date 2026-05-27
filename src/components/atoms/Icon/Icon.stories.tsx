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
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
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
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <Icon name={name} size={32} />
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-pixel)',
              color: 'var(--text-secondary)',
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
      <Icon name="trophy" size={16} />
      <Icon name="trophy" size={24} />
      <Icon name="trophy" size={32} />
      <Icon name="trophy" size={48} />
    </div>
  ),
};

export const Colored: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Icon name="fire" size={32} color="var(--color-error)" />
      <Icon name="star" size={32} color="var(--color-accent-500)" />
      <Icon name="trophy" size={32} color="var(--color-primary-500)" />
      <Icon name="target" size={32} color="var(--color-info)" />
    </div>
  ),
};
