/**
 * Canonical schedule for the 32 knockout matches — sourced from ESPN's live schedule
 * (which mirrors FIFA's official broadcast). Times are EDT (UTC-4) converted to UTC.
 *
 * Convention used by ESPN: all match times are displayed in US Eastern Time (EDT, UTC-4),
 * regardless of venue location. Conversion: EDT time + 4 hours = UTC.
 *
 * For seed-fallback entries (ESPN page did not show these matches — page caps visible
 * date range), the seed values from seed-tournament.ts:954-1313 are used unchanged.
 */

export const STADIUMS: Record<string, string> = {
  'dallas-stadium': 'Dallas Stadium',
  'houston-stadium': 'Houston Stadium',
  'atlanta-stadium': 'Atlanta Stadium',
  'boston-stadium': 'Boston Stadium',
  'ny-nj-stadium': 'New York New Jersey Stadium',
  'la-stadium': 'Los Angeles Stadium',
  'sf-bay-area-stadium': 'San Francisco Bay Area Stadium',
  'bc-place-vancouver': 'BC Place Vancouver',
  'estadio-monterrey': 'Estadio Monterrey',
  'estadio-guadalajara': 'Estadio Guadalajara',
  'toronto-stadium': 'Toronto Stadium',
  'mexico-city-stadium': 'Mexico City Stadium',
  'miami-stadium': 'Miami Stadium',
  'kansas-city-stadium': 'Kansas City Stadium',
  'seattle-stadium': 'Seattle Stadium',
  'philadelphia-stadium': 'Philadelphia Stadium',
};

export interface KnockoutFix {
  slug: string;
  date: string; // ISO 8601 UTC, e.g. '2026-06-29T17:00:00Z'
  stadium: string; // display name, matches Firestore shape
  source: 'espn' | 'seed-fallback';
}

export const KNOCKOUT_FIX: readonly KnockoutFix[] = [
  // ── Round of 32 ──────────────────────────────────────────────────────────────
  // r32-1: South Africa vs Canada — not visible on ESPN (page date cap)
  {
    slug: 'r32-1',
    date: '2026-06-29T18:00:00Z',
    stadium: STADIUMS['dallas-stadium'],
    source: 'seed-fallback',
  },
  // r32-2: Germany vs Paraguay — ESPN Jun 29 4:30 PM EDT → 20:30 UTC
  {
    slug: 'r32-2',
    date: '2026-06-29T20:30:00Z',
    stadium: STADIUMS['boston-stadium'],
    source: 'espn',
  },
  // r32-3: Netherlands vs Morocco — ESPN Jun 29 9:00 PM EDT → 01:00 UTC Jun 30
  {
    slug: 'r32-3',
    date: '2026-06-30T01:00:00Z',
    stadium: STADIUMS['estadio-monterrey'],
    source: 'espn',
  },
  // r32-4: Brazil vs Japan — ESPN Jun 29 1:00 PM EDT → 17:00 UTC
  {
    slug: 'r32-4',
    date: '2026-06-29T17:00:00Z',
    stadium: STADIUMS['houston-stadium'],
    source: 'espn',
  },
  // r32-5: France vs Sweden — ESPN Jun 30 5:00 PM EDT → 21:00 UTC
  {
    slug: 'r32-5',
    date: '2026-06-30T21:00:00Z',
    stadium: STADIUMS['ny-nj-stadium'],
    source: 'espn',
  },
  // r32-6: 2E vs 2I — ESPN Jun 30 1:00 PM EDT → 17:00 UTC
  {
    slug: 'r32-6',
    date: '2026-06-30T17:00:00Z',
    stadium: STADIUMS['dallas-stadium'],
    source: 'espn',
  },
  // r32-7: Mexico vs Ecuador — ESPN Jun 30 9:00 PM EDT → 01:00 UTC Jul 1
  {
    slug: 'r32-7',
    date: '2026-07-01T01:00:00Z',
    stadium: STADIUMS['mexico-city-stadium'],
    source: 'espn',
  },
  // r32-8: England vs DR Congo — ESPN Jul 1 12:00 PM EDT → 16:00 UTC
  {
    slug: 'r32-8',
    date: '2026-07-01T16:00:00Z',
    stadium: STADIUMS['atlanta-stadium'],
    source: 'espn',
  },
  // r32-9: USA vs Bosnia — ESPN Jul 1 8:00 PM EDT → 00:00 UTC Jul 2
  {
    slug: 'r32-9',
    date: '2026-07-02T00:00:00Z',
    stadium: STADIUMS['sf-bay-area-stadium'],
    source: 'espn',
  },
  // r32-10: Belgium vs Senegal — ESPN Jul 1 4:00 PM EDT → 20:00 UTC
  {
    slug: 'r32-10',
    date: '2026-07-01T20:00:00Z',
    stadium: STADIUMS['seattle-stadium'],
    source: 'espn',
  },
  // r32-11: 2K vs 2L — not visible on ESPN
  {
    slug: 'r32-11',
    date: '2026-07-01T18:00:00Z',
    stadium: STADIUMS['boston-stadium'],
    source: 'seed-fallback',
  },
  // r32-12: 1H vs 2J — not visible on ESPN
  {
    slug: 'r32-12',
    date: '2026-07-01T21:00:00Z',
    stadium: STADIUMS['miami-stadium'],
    source: 'seed-fallback',
  },
  // r32-13: Switzerland vs Algeria — ESPN Jul 2 11:00 PM EDT → 03:00 UTC Jul 3
  {
    slug: 'r32-13',
    date: '2026-07-03T03:00:00Z',
    stadium: STADIUMS['bc-place-vancouver'],
    source: 'espn',
  },
  // r32-14: 1J vs 2H — not visible on ESPN
  {
    slug: 'r32-14',
    date: '2026-07-02T21:00:00Z',
    stadium: STADIUMS['seattle-stadium'],
    source: 'seed-fallback',
  },
  // r32-15: Colombia vs Ghana — ESPN Jul 3 9:30 PM EDT → 01:30 UTC Jul 4
  {
    slug: 'r32-15',
    date: '2026-07-04T01:30:00Z',
    stadium: STADIUMS['kansas-city-stadium'],
    source: 'espn',
  },
  // r32-16: 2D vs 2G — not visible on ESPN
  {
    slug: 'r32-16',
    date: '2026-07-02T21:00:00Z',
    stadium: STADIUMS['estadio-guadalajara'],
    source: 'seed-fallback',
  },

  // ── Round of 16 ───────────────────────────────────────────────────────────
  // r16-1: Canada vs R32-3 Winner — ESPN Jul 4 1:00 PM EDT → 17:00 UTC
  {
    slug: 'r16-1',
    date: '2026-07-04T17:00:00Z',
    stadium: STADIUMS['houston-stadium'],
    source: 'espn',
  },
  // r16-2: R32-5 Winner vs R32-2 Winner — ESPN Jul 4 5:00 PM EDT → 21:00 UTC
  {
    slug: 'r16-2',
    date: '2026-07-04T21:00:00Z',
    stadium: STADIUMS['philadelphia-stadium'],
    source: 'espn',
  },
  // r16-3: R32-4 Winner vs R32-6 Winner — ESPN Jul 5 4:00 PM EDT → 20:00 UTC
  {
    slug: 'r16-3',
    date: '2026-07-05T20:00:00Z',
    stadium: STADIUMS['ny-nj-stadium'],
    source: 'espn',
  },
  // r16-4: R32-7 Winner vs R32-8 Winner — ESPN Jul 5 8:00 PM EDT → 00:00 UTC Jul 6
  {
    slug: 'r16-4',
    date: '2026-07-06T00:00:00Z',
    stadium: STADIUMS['mexico-city-stadium'],
    source: 'espn',
  },
  // r16-5..r16-8: not visible on ESPN — seed values unchanged
  {
    slug: 'r16-5',
    date: '2026-07-04T18:00:00Z',
    stadium: STADIUMS['ny-nj-stadium'],
    source: 'seed-fallback',
  },
  {
    slug: 'r16-6',
    date: '2026-07-04T21:00:00Z',
    stadium: STADIUMS['philadelphia-stadium'],
    source: 'seed-fallback',
  },
  {
    slug: 'r16-7',
    date: '2026-07-05T18:00:00Z',
    stadium: STADIUMS['toronto-stadium'],
    source: 'seed-fallback',
  },
  {
    slug: 'r16-8',
    date: '2026-07-05T21:00:00Z',
    stadium: STADIUMS['la-stadium'],
    source: 'seed-fallback',
  },

  // ── Quarterfinals ────────────────────────────────────────────────────────
  {
    slug: 'qf-1',
    date: '2026-07-09T18:00:00Z',
    stadium: STADIUMS['dallas-stadium'],
    source: 'seed-fallback',
  },
  {
    slug: 'qf-2',
    date: '2026-07-09T21:00:00Z',
    stadium: STADIUMS['miami-stadium'],
    source: 'seed-fallback',
  },
  {
    slug: 'qf-3',
    date: '2026-07-10T18:00:00Z',
    stadium: STADIUMS['ny-nj-stadium'],
    source: 'seed-fallback',
  },
  {
    slug: 'qf-4',
    date: '2026-07-10T21:00:00Z',
    stadium: STADIUMS['la-stadium'],
    source: 'seed-fallback',
  },

  // ── Semifinals ───────────────────────────────────────────────────────────
  {
    slug: 'sf-1',
    date: '2026-07-13T21:00:00Z',
    stadium: STADIUMS['dallas-stadium'],
    source: 'seed-fallback',
  },
  {
    slug: 'sf-2',
    date: '2026-07-14T21:00:00Z',
    stadium: STADIUMS['atlanta-stadium'],
    source: 'seed-fallback',
  },

  // ── Third place ───────────────────────────────────────────────────────────
  {
    slug: 'third-place',
    date: '2026-07-18T21:00:00Z',
    stadium: STADIUMS['la-stadium'],
    source: 'seed-fallback',
  },

  // ── Final ────────────────────────────────────────────────────────────────
  {
    slug: 'final',
    date: '2026-07-19T21:00:00Z',
    stadium: STADIUMS['ny-nj-stadium'],
    source: 'seed-fallback',
  },
] as const;
