import type { Locale } from './i18n';

/**
 * Formats a knockout placeholder slot code into human-readable text for the
 * given locale. These codes live on match documents (`tbdHome`/`tbdAway`) until
 * the actual teams are resolved. Recognized shapes:
 *
 *   "1A"        → "1st Group A"   / "1º Grupo A"
 *   "3C/D/E"    → "3rd C/D/E"     / "3º C/D/E"     (best third-placed teams)
 *   "W-R32-1"   → "Winner R32-1"  / "Ganador R32-1"
 *   "L-SF-1"    → "Loser SF-1"    / "Perdedor SF-1"
 *
 * Unknown codes are returned verbatim so nothing is ever swallowed.
 */

const FRAGMENTS: Record<Locale, { group: string; winner: string; loser: string }> = {
  en: { group: 'Group', winner: 'Winner', loser: 'Loser' },
  es: { group: 'Grupo', winner: 'Ganador', loser: 'Perdedor' },
};

function ordinal(position: string, locale: Locale): string {
  if (locale === 'es') return `${position}º`;
  const suffix = position === '1' ? 'st' : position === '2' ? 'nd' : 'rd';
  return `${position}${suffix}`;
}

export function formatKnockoutSlot(code: string | undefined, locale: Locale = 'en'): string {
  if (!code) return '';
  const t = FRAGMENTS[locale] ?? FRAGMENTS.en;

  // Single group leader, e.g. "1A", "2B", "3L".
  const single = code.match(/^([123])([A-Z])$/);
  if (single) return `${ordinal(single[1], locale)} ${t.group} ${single[2]}`;

  // Third-placed team from a set of groups, e.g. "3C/D/E".
  const multi = code.match(/^([123])([A-Z](?:\/[A-Z])+)$/);
  if (multi) return `${ordinal(multi[1], locale)} ${multi[2]}`;

  // Winner-of / loser-of a prior match, e.g. "W-R32-1", "L-SF-2".
  const progression = code.match(/^([WL])-(.+)$/);
  if (progression) {
    const label = progression[1] === 'W' ? t.winner : t.loser;
    return `${label} ${progression[2]}`;
  }

  return code;
}
