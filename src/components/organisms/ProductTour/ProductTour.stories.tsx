import type { Meta, StoryObj } from '@storybook/react';

import { ProductTour } from './ProductTour';

const meta = {
  component: ProductTour,
  title: 'Organisms/ProductTour',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProductTour>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSteps = [
  { element: '#storybook-root', title: 'Welcome', description: 'This is a demo tour step.' },
  {
    element: '#storybook-root',
    title: 'Next Step',
    description: 'Here is another step in the tour.',
  },
];

export const Default: Story = {
  args: {
    tourId: 'demo-tour',
    steps: mockSteps,
  },
};

export const WithAutoStart: Story = {
  args: {
    tourId: 'auto-start-tour',
    steps: mockSteps,
    autoStart: true,
  },
};
