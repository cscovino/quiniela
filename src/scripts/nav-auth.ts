import { useAuthStore } from '@store/auth-store';
import { initAuth, getCachedAuthUid } from '@services/auth-bootstrap';

const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const hamburgerOpen = hamburgerBtn?.querySelector('.hamburger-open');
const hamburgerClose = hamburgerBtn?.querySelector('.hamburger-close');

hamburgerBtn?.addEventListener('click', () => {
  const isOpen = mobileMenu?.style.display !== 'none';
  if (mobileMenu) {
    mobileMenu.style.display = isOpen ? 'none' : 'block';
  }
  hamburgerBtn.setAttribute('aria-expanded', String(!isOpen));
  if (hamburgerOpen && hamburgerClose) {
    hamburgerOpen.style.display = isOpen ? 'block' : 'none';
    hamburgerClose.style.display = isOpen ? 'none' : 'block';
  }
});

document.querySelectorAll('[data-close-menu]').forEach((link) => {
  link.addEventListener('click', () => {
    if (mobileMenu) {
      mobileMenu.style.display = 'none';
    }
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    if (hamburgerOpen && hamburgerClose) {
      hamburgerOpen.style.display = 'block';
      hamburgerClose.style.display = 'none';
    }
  });
});

themeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Auth visibility toggling
const links = document.querySelector('[data-auth-links]');
const desktopUser = document.querySelector('[data-auth-desktop]');
const desktopLogin = document.querySelector('[data-auth-login]');
const mobileLinks = document.querySelector('[data-auth-mobile-links]');
const mobileUser = document.querySelector('[data-auth-mobile-user]');
const mobileCta = document.querySelector('[data-auth-mobile-cta]');
const mobileLoginCta = document.querySelector('[data-auth-mobile-login-cta]');
const usernameEls = document.querySelectorAll('[data-auth-username], [data-auth-mobile-username]');

function render(user) {
  // Public links: always visible
  if (links) links.style.display = '';
  if (mobileLinks) mobileLinks.style.display = '';

  if (user) {
    if (desktopUser) desktopUser.style.display = '';
    if (desktopLogin) desktopLogin.style.display = 'none';
    if (mobileUser) mobileUser.style.display = '';
    if (mobileCta) mobileCta.style.display = '';
    if (mobileLoginCta) mobileLoginCta.style.display = 'none';
    usernameEls.forEach((el) => {
      el.textContent = user.displayName || user.email || '';
    });
  } else {
    if (desktopUser) desktopUser.style.display = 'none';
    if (desktopLogin) desktopLogin.style.display = '';
    if (mobileUser) mobileUser.style.display = 'none';
    if (mobileCta) mobileCta.style.display = 'none';
    if (mobileLoginCta) mobileLoginCta.style.display = '';
  }
}

// Use localStorage hint for instant initial render
const cachedUid = getCachedAuthUid();
const cachedUser = useAuthStore.getState().user;
render(cachedUser || (cachedUid ? { uid: cachedUid, displayName: '', email: '' } : null));

// Subscribe to auth state changes
useAuthStore.subscribe((state) => render(state.user));

// Logout buttons
document
  .getElementById('logout-btn')
  ?.addEventListener('click', () => useAuthStore.getState().logout());
document
  .getElementById('mobile-logout-btn')
  ?.addEventListener('click', () => useAuthStore.getState().logout());

// Kick off the single auth bootstrap (idempotent)
initAuth();
