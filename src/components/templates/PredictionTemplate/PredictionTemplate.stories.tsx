import type { Meta, StoryObj } from '@storybook/react';
import { PredictionTemplate } from './PredictionTemplate';

const meta = {
  title: 'Templates/PredictionTemplate',
  component: PredictionTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PredictionTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNavProps = {
  links: [
    { href: '/en', label: 'Home', active: false },
    { href: '/en/predictions', label: 'Predictions', active: true },
    { href: '/en/standings', label: 'Standings', active: false },
    { href: '/en/profile', label: 'Profile', active: false },
  ],
  locale: 'en' as const,
};

const mockFormProps = {
  matches: [
    {
      matchId: 'match-1',
      homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
      awayTeam: { fifaCode: 'FRA', name: 'France' },
      phase: 'group' as const,
      predictionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      matchId: 'match-2',
      homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
      awayTeam: { fifaCode: 'GER', name: 'Germany' },
      phase: 'group' as const,
      predictionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      matchId: 'match-3',
      homeTeam: { fifaCode: 'ESP', name: 'Spain' },
      awayTeam: { fifaCode: 'ITA', name: 'Italy' },
      phase: 'group' as const,
      predictionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ],
  onSubmit: () => {},
};

export const Default: Story = {
  args: {
    navProps: mockNavProps,
    formProps: mockFormProps,
  },
};

export const WithCountdown: Story = {
  args: {
    navProps: mockNavProps,
    formProps: mockFormProps,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
};

export const DarkMode: Story = {
  args: {
    navProps: {
      ...mockNavProps,
      theme: 'dark' as const,
    },
    formProps: mockFormProps,
  },
};
