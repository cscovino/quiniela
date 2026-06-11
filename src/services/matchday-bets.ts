import type { TodayMatchBet } from '@organisms/RankingsTable';
import type { Locale } from '@utils/i18n';

/** A single predicted score baked at build time (immutable after the deadline). */
export interface PredictedBet {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

/** Live match facts fetched at runtime and joined onto the baked predictions. */
export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  status: string;
  actualHome?: number;
  actualAway?: number;
}

/** YYYY-MM-DD key used both to group bets and to derive the matchday number. */
function dateKeyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function outcome(home: number, away: number): number {
  if (home > away) return 1;
  if (home < away) return -1;
  return 0;
}

/**
 * Build the localized matchday label, e.g. `Jor. 1 — 11 Jun` (es) / `MD 1 — 11 Jun` (en).
 * The matchday number is the 1-based ordinal of the match's calendar date among
 * all tournament dates, mirroring the Storybook "With Days" grouping.
 */
export function buildDayLabel(dateKey: string, matchday: number, locale: Locale): string {
  const prefix = locale === 'es' ? 'Jor.' : 'MD';
  const d = new Date(`${dateKey}T12:00:00Z`);
  const day = d.getUTCDate();
  const monthRaw = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
  const month = monthRaw.replace('.', '');
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  return `${prefix} ${matchday} — ${day} ${monthCap}`;
}

/**
 * Join a predictor's baked predicted scores with live match info to produce the
 * matchday-grouped bets the RankingRow renders. Correctness (isExact/isWinner)
 * is recomputed here from the live result rather than read from the (frozen) bet
 * doc, so coloring stays accurate without redeploying. Predictions for matches
 * not present in `matchInfo` are dropped.
 */
export function buildMatchdayBets(
  predicted: PredictedBet[],
  matchInfo: Map<string, MatchInfo>,
  locale: Locale,
): TodayMatchBet[] {
  // Global matchday numbering: distinct match dates sorted ascending → 1..N.
  const dateKeys = Array.from(
    new Set(Array.from(matchInfo.values(), (m) => dateKeyOf(m.date))),
  ).sort();
  const matchdayByDate = new Map(dateKeys.map((key, i) => [key, i + 1]));

  const bets: TodayMatchBet[] = [];
  for (const p of predicted) {
    const info = matchInfo.get(p.matchId);
    if (!info) continue;

    const dateKey = dateKeyOf(info.date);
    const finished =
      info.status === 'finished' && info.actualHome != null && info.actualAway != null;

    bets.push({
      matchId: p.matchId,
      homeTeam: info.homeTeam,
      awayTeam: info.awayTeam,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      status: info.status,
      date: dateKey,
      dayLabel: buildDayLabel(dateKey, matchdayByDate.get(dateKey) ?? 0, locale),
      actualHome: info.actualHome,
      actualAway: info.actualAway,
      isExact: finished ? p.homeScore === info.actualHome && p.awayScore === info.actualAway : undefined,
      isWinner: finished
        ? outcome(p.homeScore, p.awayScore) === outcome(info.actualHome!, info.actualAway!)
        : undefined,
    });
  }

  // Stable ascending order so the RankingRow renders matchdays chronologically.
  bets.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  return bets;
}
