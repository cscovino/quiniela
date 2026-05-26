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
  tournamentName: string;
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
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const top = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, top || 0);
    }
    return () => {
      const top = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, top || 0);
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
      <a href={homeHref} className="nav-bar__brand" data-astro-prefetch>
        <Icon name="football" size={24} />
        <span className="nav-bar__title">{translations.brandLabel}</span>
      </a>

      <div className="nav-bar__links">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`nav-bar__link ${link.active ? 'nav-bar__link--active' : ''}`}
            data-astro-prefetch
          >
            {link.label}
          </a>
        ))}
        {adminLink && isAdmin && (
          <a
            href={adminLink.href}
            className={`nav-bar__link ${adminLink.active ? 'nav-bar__link--active' : ''}`}
            data-astro-prefetch
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
          data-astro-prefetch
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
          <a href={loginHref} className="nav-bar__group--desktop" data-astro-prefetch>
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
                <a href={predictionsHref} onClick={closeMenu} data-astro-prefetch>
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
                data-astro-prefetch
              >
                {link.label}
              </a>
            ))}
          </div>

          {!isLoggedIn && (
            <div className="nav-bar__mobile-cta">
              <a href={loginHref} onClick={closeMenu} data-astro-prefetch>
                <span className="nav-bar__cta-btn">{translations.login}</span>
              </a>
            </div>
          )}

          {adminLink && isAdmin && (
            <a
              href={adminLink.href}
              className="nav-bar__mobile-link nav-bar__mobile-link--admin"
              onClick={closeMenu}
              data-astro-prefetch
            >
              {adminLink.label}
            </a>
          )}

          <div className="nav-bar__mobile-footer">
            <span className="nav-bar__tournament-name">{translations.tournamentName}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
