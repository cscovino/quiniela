import { render, screen } from '@testing-library/react';
import { NavBar } from './NavBar';
import { useAuthStore } from '@store/auth-store';

vi.mock('@store/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

const mockLinks = [
  { href: '/', label: 'Home', active: true },
  { href: '/predictions', label: 'Predictions', active: false },
];

const mockAuthState = {
  user: null,
  isLoading: false,
  error: null,
  logout: vi.fn(),
  initAuth: vi.fn(),
  clearError: vi.fn(),
};

describe('NavBar', () => {
  beforeEach(() => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockAuthState);
  });

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
    render(<NavBar links={mockLinks} locale="en" />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows logout button when logged in', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockAuthState,
      user: {
        uid: 'user-1',
        displayName: 'Carlos',
        email: 'carlos@test.com',
        role: 'user' as const,
      },
    });
    render(<NavBar links={mockLinks} locale="en" />);
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
