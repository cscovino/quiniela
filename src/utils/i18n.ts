import esCommon from '@locales/es/common.json';
import enCommon from '@locales/en/common.json';
import esAuth from '@locales/es/auth.json';
import enAuth from '@locales/en/auth.json';

export type Locale = 'en' | 'es';

export interface Translations {
  common: typeof esCommon;
  auth: typeof esAuth;
}

const translations: Record<Locale, Translations> = {
  es: {
    common: esCommon,
    auth: esAuth,
  },
  en: {
    common: enCommon,
    auth: enAuth,
  },
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function getNavLinks(locale: Locale, activeNav: string) {
  const nav = translations[locale].common.nav;
  const prefix = locale === 'en' ? '/en' : '/es';

  return [
    { href: `${prefix}/`, label: nav.home, active: activeNav === 'home' },
    {
      href: `${prefix}/tournament`,
      label: locale === 'en' ? 'Tournament' : 'Torneo',
      active: activeNav === 'tournament',
    },
    {
      href: `${prefix}/predictions`,
      label: locale === 'en' ? 'Predictions' : 'Predicciones',
      active: activeNav === 'predictions',
    },
    {
      href: `${prefix}/rankings`,
      label: locale === 'en' ? 'Rankings' : 'Clasificación',
      active: activeNav === 'rankings',
    },
    {
      href: `${prefix}/profile`,
      label: locale === 'en' ? 'Profile' : 'Perfil',
      active: activeNav === 'profile',
    },
  ];
}
