import React, { useState } from 'react';
import { Button } from '@atoms/Button/Button';
import { Icon } from '@atoms/Icon/Icon';
import { Typography } from '@atoms/Typography/Typography';
import { useAuthStore } from '@store/auth-store';
import './NavBar.css';

export interface NavLinks {
  href: string;
  label: string;
  active: boolean;
}

export interface NavBarProps {
  links: NavLinks[];
  locale: 'en' | 'es';
  notificationCount?: number;
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = ({
  links,
  locale,
  notificationCount = 0,
  className = '',
}) => {
  const { user, logout, initAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch {
      // Error handled by store
    }
  };

  const otherLocale = locale === 'en' ? 'es' : 'en';
  const otherLocaleLabel = locale === 'en' ? 'ES' : 'EN';
  const otherLocaleHref = locale === 'en' ? '/' : '/en';
  const loginHref = locale === 'en' ? '/en/login' : '/login';
  const predictionsHref = locale === 'en' ? '/en/predictions' : '/predicciones';

  return (
    <nav className={`nav-bar ${className}`}>
      <div className="nav-bar__brand">
        <Icon name="football" size={24} />
        <Typography variant="h3" className="nav-bar__title">
          QUINIELA
        </Typography>
      </div>

      <div className="nav-bar__links">
        {user &&
          links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-bar__link ${link.active ? 'nav-bar__link--active' : ''}`}
            >
              {link.label}
            </a>
          ))}
      </div>

      <div className="nav-bar__actions">
        <a
          href={otherLocaleHref}
          className={`nav-bar__btn ${locale === 'es' ? 'nav-bar__btn--active' : ''}`}
          aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Spanish'}`}
        >
          {otherLocaleLabel}
        </a>

        <button
          className="nav-bar__btn nav-bar__btn--icon"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
        >
          <Icon name="star" size={18} />
        </button>

        {notificationCount > 0 && (
          <button
            className="nav-bar__btn nav-bar__btn--icon nav-bar__btn--notification"
            aria-label="Notifications"
          >
            <Icon name="bell" size={18} />
            <span className="nav-bar__badge">{notificationCount}</span>
          </button>
        )}

        {user ? (
          <>
            <div className="nav-bar__group nav-bar__group--desktop">
              {user.role === 'admin' && (
                <a href="/en/admin/matches" className="nav-bar__link">
                  Admin
                </a>
              )}
              <Icon name="user" size={18} />
              <Typography variant="small" className="nav-bar__username">
                {user.displayName}
              </Typography>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            <button
              className="nav-bar__btn nav-bar__btn--icon nav-bar__hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={20} />
            </button>
          </>
        ) : (
          <a href={loginHref}>
            <Button variant="primary" size="sm">
              Login
            </Button>
          </a>
        )}
      </div>

      {user && mobileMenuOpen && (
        <div className="nav-bar__mobile-menu">
          <div className="nav-bar__mobile-links">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-bar__mobile-link ${link.active ? 'nav-bar__mobile-link--active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {user.role === 'admin' && (
              <a
                href="/en/admin/matches"
                className="nav-bar__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </a>
            )}
          </div>

          <div className="nav-bar__mobile-user">
            <Icon name="user" size={18} />
            <Typography variant="small">{user.displayName}</Typography>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="nav-bar__mobile-cta">
            <a href={predictionsHref} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md">
                {locale === 'en' ? 'Make Predictions' : 'Hacer Predicciones'}
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
