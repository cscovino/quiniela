import enAdmin from '@locales/en/admin.json';
import enAuth from '@locales/en/auth.json';
import enCommon from '@locales/en/common.json';
import esAdmin from '@locales/es/admin.json';
import esAuth from '@locales/es/auth.json';
import esCommon from '@locales/es/common.json';

export type Locale = 'en' | 'es';

export interface Translations {
  common: typeof esCommon;
  auth: typeof esAuth;
  admin: typeof esAdmin;
}

const translations: Record<Locale, Translations> = {
  es: { common: esCommon, auth: esAuth, admin: esAdmin },
  en: { common: enCommon, auth: enAuth, admin: enAdmin },
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export type ActiveNav = 'home' | 'tournament' | 'predictions' | 'rankings' | 'profile' | 'admin';

export interface NavLink {
  href: string;
  label: string;
  active: boolean;
  auth: boolean;
  core: boolean;
}

const ROUTE_SLUGS: Record<Locale, Record<Exclude<ActiveNav, 'admin'>, string>> = {
  en: {
    home: '',
    tournament: 'tournament',
    predictions: 'predictions',
    rankings: 'rankings',
    profile: 'profile',
  },
  es: {
    home: '',
    tournament: 'torneo',
    predictions: 'predicciones',
    rankings: 'clasificacion',
    profile: 'perfil',
  },
};

export function getRoute(locale: Locale, nav: Exclude<ActiveNav, 'admin'>): string {
  const slug = ROUTE_SLUGS[locale][nav];
  if (!slug) return `/${locale}`;
  return `/${locale}/${slug}`;
}

export function getNavLinks(locale: Locale, activeNav: ActiveNav): NavLink[] {
  const nav = translations[locale].common.nav;
  const items: { key: Exclude<ActiveNav, 'admin'>; label: string; auth: boolean; core: boolean }[] =
    [
      { key: 'home', label: nav.home, auth: false, core: false },
      { key: 'tournament', label: nav.tournament, auth: false, core: true },
      { key: 'predictions', label: nav.predictions, auth: true, core: true },
      { key: 'rankings', label: nav.rankings, auth: true, core: true },
      { key: 'profile', label: nav.profile, auth: true, core: false },
    ];

  return items.map((item) => ({
    href: getRoute(locale, item.key),
    label: item.label,
    active: activeNav === item.key,
    auth: item.auth,
    core: item.core,
  }));
}

export function getAdminLink(locale: Locale, activeNav: ActiveNav): NavLink {
  return {
    href: '/admin/matches',
    label: translations[locale].common.nav.admin,
    active: activeNav === 'admin',
    auth: true,
    core: false,
  };
}

export function getLoginRoute(locale: Locale): string {
  return `/${locale}/login`;
}

export function getRegisterRoute(locale: Locale): string {
  return `/${locale}/register`;
}

export function getHomeRoute(locale: Locale): string {
  return `/${locale}`;
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'es' : 'en';
}

const LOCALE_CODES: Record<Locale, { dateLocale: string; ogLocale: string }> = {
  en: { dateLocale: 'en-US', ogLocale: 'en_US' },
  es: { dateLocale: 'es-ES', ogLocale: 'es_ES' },
};

export function getDateLocale(locale: Locale): string {
  return LOCALE_CODES[locale].dateLocale;
}

export function getOgLocale(locale: Locale): string {
  return LOCALE_CODES[locale].ogLocale;
}
