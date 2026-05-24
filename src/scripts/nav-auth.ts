import { useAuthStore } from '@store/auth-store';
import { initAuth } from '@services/auth-bootstrap';
import type { User } from '@app-types/firestore';

let authUnsubscribe: (() => void) | null = null;

function render(user: User | null, els: ReturnType<typeof queryElements>) {
  // Public links: always visible
  if (els.links) els.links.style.display = 'flex';
  if (els.mobileLinks) els.mobileLinks.style.display = 'flex';

  if (user) {
    if (els.desktopUser) els.desktopUser.style.display = 'flex';
    if (els.desktopLogin) els.desktopLogin.style.display = 'none';
    if (els.mobileUser) els.mobileUser.style.display = 'flex';
    if (els.mobileCta) els.mobileCta.style.display = 'flex';
    if (els.mobileLoginCta) els.mobileLoginCta.style.display = 'none';
    els.usernameEls.forEach((el) => {
      el.textContent = user.displayName || user.email || '';
    });
  } else {
    if (els.desktopUser) els.desktopUser.style.display = 'none';
    if (els.desktopLogin) els.desktopLogin.style.display = 'inline-block';
    if (els.mobileUser) els.mobileUser.style.display = 'none';
    if (els.mobileCta) els.mobileCta.style.display = 'none';
    if (els.mobileLoginCta) els.mobileLoginCta.style.display = 'flex';
  }
}

function queryElements() {
  return {
    hamburgerBtn: document.getElementById('hamburger-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    themeToggle: document.getElementById('theme-toggle'),
    links: document.querySelector('[data-auth-links]'),
    desktopUser: document.querySelector('[data-auth-desktop]'),
    desktopLogin: document.querySelector('[data-auth-login]'),
    mobileLinks: document.querySelector('[data-auth-mobile-links]'),
    mobileUser: document.querySelector('[data-auth-mobile-user]'),
    mobileCta: document.querySelector('[data-auth-mobile-cta]'),
    mobileLoginCta: document.querySelector('[data-auth-mobile-login-cta]'),
    usernameEls: document.querySelectorAll('[data-auth-username], [data-auth-mobile-username]'),
    logoutBtn: document.getElementById('logout-btn'),
    mobileLogoutBtn: document.getElementById('mobile-logout-btn'),
  };
}

function setup() {
  const els = queryElements();
  const hamburgerOpen = els.hamburgerBtn?.querySelector('.hamburger-open');
  const hamburgerClose = els.hamburgerBtn?.querySelector('.hamburger-close');

  // Hamburger toggle
  els.hamburgerBtn?.addEventListener('click', () => {
    const isOpen = els.mobileMenu?.style.display !== 'none';
    if (els.mobileMenu) {
      els.mobileMenu.style.display = isOpen ? 'none' : 'block';
    }
    els.hamburgerBtn!.setAttribute('aria-expanded', String(!isOpen));
    if (hamburgerOpen && hamburgerClose) {
      hamburgerOpen.style.display = isOpen ? 'block' : 'none';
      hamburgerClose.style.display = isOpen ? 'none' : 'block';
    }
  });

  // Close menu on link click
  document.querySelectorAll('[data-close-menu]').forEach((link) => {
    link.addEventListener('click', () => {
      if (els.mobileMenu) {
        els.mobileMenu.style.display = 'none';
      }
      els.hamburgerBtn?.setAttribute('aria-expanded', 'false');
      if (hamburgerOpen && hamburgerClose) {
        hamburgerOpen.style.display = 'block';
        hamburgerClose.style.display = 'none';
      }
    });
  });

  // Theme toggle
  els.themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Auth visibility: only render cached user if we have real data,
  // otherwise show neutral state until auth listener fires
  const cachedUser = useAuthStore.getState().user;
  render(cachedUser || null, els);

  // Subscribe to auth state changes
  authUnsubscribe = useAuthStore.subscribe((state) => render(state.user, els));

  // Logout buttons
  els.logoutBtn?.addEventListener('click', () => useAuthStore.getState().logout());
  els.mobileLogoutBtn?.addEventListener('click', () => useAuthStore.getState().logout());

  // Kick off the single auth bootstrap (idempotent)
  initAuth();
}

// First page load
setup();

// Re-bind after every view transition
document.addEventListener('astro:page-load', () => {
  authUnsubscribe?.();
  authUnsubscribe = null;
  setup();
});
