import React, { useEffect, useState } from 'react';
import { Icon } from '@atoms/Icon/Icon';
import { useAuthStore } from '@store/auth-store';
import { initAuth } from '@services/auth-bootstrap';
import { getHomeRoute, getLoginRoute, getOtherLocale, getRoute } from '@utils/i18n';
import './NavBar.css';

export interface NavLink {
  href: string;
  label: string;
  active: boolean;
}

export interface NavBarTranslations {
  brandLabel: string;
  login: string;
  logout: string;
  makePredictions: string;
  switchLocale: string;
  toggleTheme: string;
  toggleMenu: string;
  notifications: string;
}

export interface NavBarProps {
  links: NavLink[];
  adminLink?: NavLink;
  locale: 'en' | 'es';
  notificationCount?: number;
  translations: NavBarTranslations;
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = ({
  links,
  adminLink,
  locale,
  notificationCount = 0,
  translations,
  className = '',
}) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const userDisplayName = user?.displayName || user?.email || '';

  const otherLocale = getOtherLocale(locale);
  const otherLocaleLabel = otherLocale.toUpperCase();
  const otherLocaleHref = getHomeRoute(otherLocale);
  const loginHref = getLoginRoute(locale);
  const predictionsHref = getRoute(locale, 'predictions');
  const homeHref = getHomeRoute(locale);

  const closeMenu = () => setMenuOpen(false);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // storage unavailable
    }
  };

  const handleLogout = () => {
    closeMenu();
    void logout();
  };

  return (
    <nav className={`nav-bar ${className}`}>
      <a href={homeHref} className="nav-bar__brand">
        <Icon name="football" size={24} />
        <span className="nav-bar__title">{translations.brandLabel}</span>
      </a>

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
        {adminLink && isAdmin && (
          <a
            href={adminLink.href}
            className={`nav-bar__link ${adminLink.active ? 'nav-bar__link--active' : ''}`}
          >
            {adminLink.label}
          </a>
        )}
      </div>

      <div className="nav-bar__actions">
        <a
          href={otherLocaleHref}
          className={`nav-bar__btn ${locale === 'es' ? 'nav-bar__btn--active' : ''}`}
          aria-label={translations.switchLocale}
        >
          {otherLocaleLabel}
        </a>

        <button
          type="button"
          className="nav-bar__btn nav-bar__btn--icon"
          onClick={toggleTheme}
          aria-label={translations.toggleTheme}
        >
          <Icon name="star" size={18} />
        </button>

        {notificationCount > 0 && (
          <button
            type="button"
            className="nav-bar__btn nav-bar__btn--icon nav-bar__btn--notification"
            aria-label={translations.notifications}
          >
            <Icon name="bell" size={18} />
            <span className="nav-bar__badge">{notificationCount}</span>
          </button>
        )}

        {isLoggedIn ? (
          <div className="nav-bar__group nav-bar__group--desktop">
            <Icon name="user" size={18} />
            <span className="nav-bar__username">{userDisplayName}</span>
            <button type="button" className="nav-bar__logout" onClick={handleLogout}>
              {translations.logout}
            </button>
          </div>
        ) : (
          <a href={loginHref} className="nav-bar__group--desktop">
            <span className="nav-bar__login-btn">{translations.login}</span>
          </a>
        )}

        <button
          type="button"
          className="nav-bar__btn nav-bar__btn--icon nav-bar__hamburger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={translations.toggleMenu}
          aria-expanded={menuOpen}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
        </button>
      </div>

      <div
        className={`nav-bar__mobile-menu ${menuOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
      >
        <div className="nav-bar__mobile-content">
          {isLoggedIn && (
            <>
              <div className="nav-bar__mobile-cta">
                <a href={predictionsHref} onClick={closeMenu}>
                  <span className="nav-bar__cta-btn">{translations.makePredictions}</span>
                </a>
              </div>
              <div className="nav-bar__mobile-user">
                <Icon name="user" size={18} />
                <span>{userDisplayName}</span>
                <button type="button" className="nav-bar__logout-btn" onClick={handleLogout}>
                  {translations.logout}
                </button>
              </div>
            </>
          )}

          <div className="nav-bar__mobile-links">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-bar__mobile-link ${link.active ? 'nav-bar__mobile-link--active' : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
          </div>

          {!isLoggedIn && (
            <div className="nav-bar__mobile-cta">
              <a href={loginHref} onClick={closeMenu}>
                <span className="nav-bar__cta-btn">{translations.login}</span>
              </a>
            </div>
          )}

          {adminLink && isAdmin && (
            <a
              href={adminLink.href}
              className="nav-bar__mobile-link nav-bar__mobile-link--admin"
              onClick={closeMenu}
            >
              {adminLink.label}
            </a>
          )}

          <div className="nav-bar__mobile-footer">
            <span className="nav-bar__tournament-name">FIFA World Cup 2026</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
