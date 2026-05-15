import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Atoms/Typography',
  component: Typography,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="body">Body text - readable content</Typography>
      <Typography variant="small">Small text - secondary information</Typography>
      <Typography variant="caption">Caption text - pixel font</Typography>
    </div>
  ),
};
