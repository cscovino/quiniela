export interface SlugEntry {
  slug: string;
  page: string;
  activeNav: string;
}

export interface LocaleSlugs {
  [locale: string]: SlugEntry[];
}

export const slugMap: LocaleSlugs = {
  es: [
    { slug: 'torneo', page: 'tournament', activeNav: 'tournament' },
    { slug: 'clasificacion', page: 'rankings', activeNav: 'rankings' },
    { slug: 'predicciones', page: 'predictions', activeNav: 'predictions' },
    { slug: 'perfil', page: 'profile', activeNav: 'profile' },
    { slug: 'login', page: 'login', activeNav: 'home' },
    { slug: 'register', page: 'register', activeNav: 'home' },
  ],
  en: [
    { slug: 'tournament', page: 'tournament', activeNav: 'tournament' },
    { slug: 'rankings', page: 'rankings', activeNav: 'rankings' },
    { slug: 'predictions', page: 'predictions', activeNav: 'predictions' },
    { slug: 'profile', page: 'profile', activeNav: 'profile' },
    { slug: 'login', page: 'login', activeNav: 'home' },
    { slug: 'register', page: 'register', activeNav: 'home' },
  ],
};

export function getLocalizedPaths() {
  const paths: Array<{
    params: { lang: string; slug: string };
    props: { locale: string; page: string; activeNav: string };
  }> = [];

  for (const [locale, entries] of Object.entries(slugMap)) {
    for (const entry of entries) {
      paths.push({
        params: { lang: locale, slug: entry.slug },
        props: { locale, page: entry.page, activeNav: entry.activeNav },
      });
    }
  }

  return paths;
}

export function getSlugForPage(locale: string, page: string): string | undefined {
  return slugMap[locale]?.find((e) => e.page === page)?.slug;
}
