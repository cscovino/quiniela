import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
import { initAuth } from '@services/auth-bootstrap';
import { useAuthStore } from '@store/auth-store';
import { getHomeRoute, getLoginRoute, getOtherLocale } from '@utils/i18n';

import './NavBar.css';

export interface NavLink {
  href: string;
  label: string;
  active: boolean;
  auth: boolean;
  core: boolean;
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

export const NavBar: FC<NavBarProps> = ({
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
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

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

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'),
    );
    if (focusable.length === 0) return;
    focusable[0].focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    drawer.addEventListener('keydown', handleTab);
    return () => drawer.removeEventListener('keydown', handleTab);
  }, [menuOpen]);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const userDisplayName = user?.displayName || user?.email || '';

  const otherLocale = getOtherLocale(locale);
  const otherLocaleLabel = otherLocale.toUpperCase();
  const otherLocaleHref = getHomeRoute(otherLocale);
  const loginHref = getLoginRoute(locale);
  const homeHref = getHomeRoute(locale);

  const closeMenu = () => {
    setMenuOpen(false);
    hamburgerRef.current?.focus();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
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
        {links
          .filter((l) => l.core)
          .map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-bar__link ${link.active ? 'nav-bar__link--active' : ''}`}
              data-astro-prefetch
            >
              {link.label}
            </a>
          ))}
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

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label={translations.toggleTheme}
        >
          <Icon name={theme === 'dark' ? 'sparkles' : 'moon'} size={18} />
        </Button>

        {notificationCount > 0 && (
          <Button variant="ghost" size="sm" aria-label={translations.notifications}>
            <span style={{ position: 'relative' }}>
              <Icon name="bell" size={18} />
              <span className="nav-bar__badge">{notificationCount}</span>
            </span>
          </Button>
        )}

        {isLoggedIn ? (
          <div className="nav-bar__group nav-bar__group--desktop">
            <Icon name="user" size={18} />
            <span className="nav-bar__username">{userDisplayName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <Icon name="logout" size={16} /> {translations.logout}
            </Button>
          </div>
        ) : (
          <a href={loginHref} className="nav-bar__group--desktop" data-astro-prefetch>
            <Icon name="login" size={16} /> {translations.login}
          </a>
        )}

        <button
          ref={hamburgerRef}
          className="btn btn--ghost btn--sm"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={translations.toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="nav-drawer"
          type="button"
        >
          <span className="btn__content">
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </span>
        </button>
      </div>

      <div
        id="nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={translations.toggleMenu}
        className={`nav-bar__mobile-menu ${menuOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
      >
        <div className="nav-bar__mobile-content">
          {isLoggedIn && (
            <>
              <div className="nav-bar__mobile-user">
                <Icon name="user" size={18} />
                <span>{userDisplayName}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <Icon name="logout" size={16} /> {translations.logout}
                </Button>
              </div>
            </>
          )}

          <div className="nav-bar__mobile-links">
            {links.map((link) =>
              link.auth && !isLoggedIn ? null : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-bar__mobile-link ${link.active ? 'nav-bar__mobile-link--active' : ''}`}
                  onClick={closeMenu}
                  data-astro-prefetch
                >
                  {link.label}
                </a>
              ),
            )}
          </div>

          {!isLoggedIn && (
            <div className="nav-bar__mobile-cta">
              <a
                href={loginHref}
                onClick={closeMenu}
                className="nav-bar__cta-btn"
                data-astro-prefetch
              >
                <Icon name="login" size={16} /> {translations.login}
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
