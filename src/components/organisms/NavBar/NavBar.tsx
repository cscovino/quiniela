import React, { useState } from 'react';
import { Button } from '@atoms/Button/Button';
import { Icon } from '@atoms/Icon/Icon';
import { Typography } from '@atoms/Typography/Typography';
import './NavBar.css';

export interface NavLinks {
  href: string;
  label: string;
  active: boolean;
}

export interface NavBarProps {
  links: NavLinks[];
  locale: 'en' | 'es';
  isLoggedIn?: boolean;
  notificationCount?: number;
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = ({
  links,
  locale,
  isLoggedIn = false,
  notificationCount = 0,
  className = '',
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const otherLocale = locale === 'en' ? 'es' : 'en';
  const otherLocaleLabel = locale === 'en' ? 'ES' : 'EN';
  const otherLocaleHref = locale === 'en' ? '/' : '/en';

  return (
    <nav className={`nav-bar ${className}`} data-theme={theme}>
      <div className="nav-bar__brand">
        <Icon name="football" size={24} />
        <Typography variant="h3">QUINIELA</Typography>
      </div>

      <div className="nav-bar__links">
        {links.map((link) => (
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
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
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

        {isLoggedIn ? (
          <div className="nav-bar__group">
            <Icon name="user" size={18} />
            <Button variant="secondary" size="sm">
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="sm">
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};
