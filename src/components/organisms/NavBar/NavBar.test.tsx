import { render, screen } from '@testing-library/react';
import { NavBar } from './NavBar';

const mockLinks = [
  { href: '/', label: 'Home', active: true },
  { href: '/predictions', label: 'Predictions', active: false },
];

describe('NavBar', () => {
  it('renders brand name', () => {
    render(<NavBar links={mockLinks} locale="en" />);
    expect(screen.getByText('QUINIELA')).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    render(<NavBar links={mockLinks} locale="en" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Predictions')).toBeInTheDocument();
  });

  it('highlights active link', () => {
    render(<NavBar links={mockLinks} locale="en" />);
    const homeLink = screen.getByText('Home');
    const predictionsLink = screen.getByText('Predictions');
    expect(homeLink.closest('a')).toHaveClass('nav-bar__link--active');
    expect(predictionsLink.closest('a')).not.toHaveClass('nav-bar__link--active');
  });

  it('shows locale switch button', () => {
    render(<NavBar links={mockLinks} locale="en" />);
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('shows login button when not logged in', () => {
    render(<NavBar links={mockLinks} locale="en" isLoggedIn={false} />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows logout button when logged in', () => {
    render(<NavBar links={mockLinks} locale="en" isLoggedIn />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows notification badge when count > 0', () => {
    render(<NavBar links={mockLinks} locale="en" notificationCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides notification badge when count is 0', () => {
    render(<NavBar links={mockLinks} locale="en" notificationCount={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('has theme toggle button', () => {
    render(<NavBar links={mockLinks} locale="en" />);
    const themeBtn = screen.getByRole('button', { name: /Switch to/ });
    expect(themeBtn).toBeInTheDocument();
  });
});
