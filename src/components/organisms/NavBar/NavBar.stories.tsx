import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavBar } from './NavBar';

const meta = {
  component: NavBar,
  tags: ['ai-generated'],
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLinks = [
  { href: '/', label: 'Home', active: true },
  { href: '/predictions', label: 'Predictions', active: false },
  { href: '/standings', label: 'Standings', active: false },
  { href: '/profile', label: 'Profile', active: false },
];

export const Default: Story = {
  args: {
    links: mockLinks,
    locale: 'en',
  },
};

export const LoggedIn: Story = {
  args: {
    links: mockLinks,
    locale: 'en',
    isLoggedIn: true,
  },
};

export const WithNotifications: Story = {
  args: {
    links: mockLinks,
    locale: 'en',
    notificationCount: 5,
  },
};

export const Spanish: Story = {
  args: {
    links: [
      { href: '/', label: 'Inicio', active: true },
      { href: '/predicciones', label: 'Predicciones', active: false },
      { href: '/clasificacion', label: 'Clasificación', active: false },
      { href: '/perfil', label: 'Perfil', active: false },
    ],
    locale: 'es',
    isLoggedIn: true,
    notificationCount: 2,
  },
};
