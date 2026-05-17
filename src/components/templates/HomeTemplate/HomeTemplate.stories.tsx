import type { Meta, StoryObj } from '@storybook/react';
import { HomeTemplate } from './HomeTemplate';

const meta = {
  title: 'Templates/HomeTemplate',
  component: HomeTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNavProps = {
  links: [
    { href: '/', label: 'Inicio', active: true },
    { href: '/predicciones', label: 'Predicciones', active: false },
    { href: '/clasificacion', label: 'Clasificación', active: false },
    { href: '/perfil', label: 'Perfil', active: false },
  ],
  locale: 'es' as const,
  notificationCount: 2,
};

const mockTournamentProps = {
  name: 'FIFA World Cup 2026',
  status: 'active' as const,
  startDate: new Date('2026-06-11'),
  endDate: new Date('2026-07-19'),
  participantCount: 48,
};

const mockMatches = [
  {
    homeTeam: { fifaCode: 'ARG', name: 'Argentina' },
    awayTeam: { fifaCode: 'FRA', name: 'France' },
    date: new Date('2026-06-15T18:00:00Z'),
    status: 'scheduled' as const,
    stadium: 'Lusail Stadium',
  },
  {
    homeTeam: { fifaCode: 'BRA', name: 'Brazil' },
    awayTeam: { fifaCode: 'GER', name: 'Germany' },
    date: new Date('2026-06-16T20:00:00Z'),
    status: 'scheduled' as const,
    stadium: 'Maracana',
  },
];

const mockRankings = [
  { userId: 'user-1', displayName: 'Carlos', points: 120, accuracy: 75, streak: 3 },
  { userId: 'user-2', displayName: 'Maria', points: 115, accuracy: 72, streak: 2 },
  { userId: 'user-3', displayName: 'Juan', points: 98, accuracy: 68, streak: 1 },
];

export const Default: Story = {
  args: {
    navProps: mockNavProps,
    tournamentProps: mockTournamentProps,
    matches: mockMatches,
    rankings: mockRankings,
  },
};

export const NotLoggedIn: Story = {
  args: {
    navProps: {
      ...mockNavProps,
      isLoggedIn: false,
    },
    tournamentProps: mockTournamentProps,
    matches: mockMatches,
    rankings: mockRankings,
  },
};

export const DarkMode: Story = {
  args: {
    navProps: {
      ...mockNavProps,
      theme: 'dark' as const,
    },
    tournamentProps: mockTournamentProps,
    matches: mockMatches,
    rankings: mockRankings,
  },
};
