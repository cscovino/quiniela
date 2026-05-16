import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavBar } from './NavBar';

describe('NavBar', () => {
  it('renders brand name', () => {
    render(<NavBar locale="en" theme="dark" onLocaleChange={() => {}} onThemeChange={() => {}} />);
    expect(screen.getByText('QUINIELA')).toBeInTheDocument();
  });

  it('shows locale buttons', () => {
    render(<NavBar locale="en" theme="dark" onLocaleChange={() => {}} onThemeChange={() => {}} />);
    expect(screen.getByText('ES')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('highlights active locale', () => {
    render(<NavBar locale="es" theme="dark" onLocaleChange={() => {}} onThemeChange={() => {}} />);
    const esBtn = screen.getByText('ES').closest('button');
    const enBtn = screen.getByText('EN').closest('button');
    expect(esBtn).toHaveClass('nav-bar__btn--active');
    expect(enBtn).not.toHaveClass('nav-bar__btn--active');
  });

  it('calls onLocaleChange when locale button clicked', async () => {
    const user = userEvent.setup();
    const handleLocaleChange = vi.fn();
    render(
      <NavBar
        locale="en"
        theme="dark"
        onLocaleChange={handleLocaleChange}
        onThemeChange={() => {}}
      />,
    );

    await user.click(screen.getByText('ES'));
    expect(handleLocaleChange).toHaveBeenCalledWith('es');
  });

  it('calls onThemeChange when theme button clicked', async () => {
    const user = userEvent.setup();
    const handleThemeChange = vi.fn();
    render(
      <NavBar
        locale="en"
        theme="dark"
        onLocaleChange={() => {}}
        onThemeChange={handleThemeChange}
      />,
    );

    const themeBtn = screen.getByLabelText('Switch to light theme');
    await user.click(themeBtn);
    expect(handleThemeChange).toHaveBeenCalledWith('light');
  });

  it('shows login button when not logged in', () => {
    render(
      <NavBar
        locale="en"
        theme="dark"
        onLocaleChange={() => {}}
        onThemeChange={() => {}}
        isLoggedIn={false}
      />,
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows logout button when logged in', () => {
    render(
      <NavBar
        locale="en"
        theme="dark"
        onLocaleChange={() => {}}
        onThemeChange={() => {}}
        isLoggedIn
      />,
    );
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows notification badge when count > 0', () => {
    render(
      <NavBar
        locale="en"
        theme="dark"
        onLocaleChange={() => {}}
        onThemeChange={() => {}}
        notificationCount={3}
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides notification badge when count is 0', () => {
    render(
      <NavBar
        locale="en"
        theme="dark"
        onLocaleChange={() => {}}
        onThemeChange={() => {}}
        notificationCount={0}
      />,
    );
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
