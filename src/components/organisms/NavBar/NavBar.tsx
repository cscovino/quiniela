import React from 'react';
import { Button } from '@atoms/Button/Button';
import { Icon } from '@atoms/Icon/Icon';
import { Typography } from '@atoms/Typography/Typography';
import './NavBar.css';

export interface NavBarProps {
  locale: 'en' | 'es';
  theme: 'dark' | 'light';
  onLocaleChange: (locale: 'en' | 'es') => void;
  onThemeChange: (theme: 'dark' | 'light') => void;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  notificationCount?: number;
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = ({
  locale,
  theme,
  onLocaleChange,
  onThemeChange,
  isLoggedIn = false,
  onLogin,
  onLogout,
  notificationCount = 0,
  className = '',
}) => {
  return (
    <nav className={`nav-bar ${className}`}>
      <div className="nav-bar__brand">
        <Icon name="football" size={24} />
        <Typography variant="h3">QUINIELA</Typography>
      </div>

      <div className="nav-bar__actions">
        <div className="nav-bar__group">
          <button
            className={`nav-bar__btn ${locale === 'es' ? 'nav-bar__btn--active' : ''}`}
            onClick={() => onLocaleChange('es')}
            aria-label="Switch to Spanish"
          >
            ES
          </button>
          <button
            className={`nav-bar__btn ${locale === 'en' ? 'nav-bar__btn--active' : ''}`}
            onClick={() => onLocaleChange('en')}
            aria-label="Switch to English"
          >
            EN
          </button>
        </div>

        <button
          className="nav-bar__btn nav-bar__btn--icon"
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <Icon name={theme === 'dark' ? 'star' : 'star'} size={18} />
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
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={onLogin}>
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};
