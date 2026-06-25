import type { FC, ReactNode } from 'react';

import { getBadgeDefinition, getBadgeName } from '@app-types/badges';
import type { AvatarOptions, Predictor } from '@app-types/firestore';
import type { IconName } from '@atoms/Icon';
import { Icon } from '@atoms/Icon';
import type { PixelArtName } from '@atoms/PixelArt';
import { PixelArt } from '@atoms/PixelArt';
import { PredictorAvatar } from '@atoms/PredictorAvatar';
import { Tooltip } from '@atoms/Tooltip';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';
import type { TodayMatchBet } from '@organisms/RankingsTable';
import type {
  BestPlayerCell,
  BestPlayersPredictionView,
  FinalPhasePredictionView,
  GroupPredictionView,
  PredictedTeamCell,
} from '@services/predictor-predictions';

import './RankingRow.css';

export interface RankingRowProps {
  position: number;
  predictorId?: string;
  pixelArt?: { seed: string; options: AvatarOptions } | null;
  displayName: string;
  points: number;
  accuracy: number;
  streak: number;
  exactMatches?: number;
  bestStreak?: number;
  badges?: Record<string, string>;
  rankChange?: 'up' | 'down' | 'same';
  todayMatchBets?: TodayMatchBet[];
  /** Group-standings predictions with correctness, shown after the match results. */
  groupPredictions?: GroupPredictionView[];
  /** Final-four prediction with correctness, shown after the group predictions. */
  finalPhasePrediction?: FinalPhasePredictionView | null;
  /** Best-players prediction with correctness, shown last in the strip. */
  bestPlayersPrediction?: BestPlayersPredictionView | null;
  isCurrentUser?: boolean;
  favouriteTeamId?: string;
  locale?: 'en' | 'es';
  className?: string;
  /**
   * When false, the per-day match-predictions strip is never rendered, even if
   * `todayMatchBets` are provided. Used to gate the predictions feature until
   * the tournament has started. Defaults to true.
   */
  showMatchPredictions?: boolean;
  /**
   * Shows a placeholder in the predictions strip while the baked predicted
   * scores are still being joined with live match info, so the row fills in
   * rather than flashing prediction-less. Ignored unless `showMatchPredictions`.
   * Defaults to false.
   */
  predictionsLoading?: boolean;
  /**
   * Shows skeleton placeholders for the stats (points, accuracy, streak) while
   * data is being loaded. Defaults to false.
   */
  pointsLoading?: boolean;
  /**
   * Marks this row as the top-of-list row used as a tour target. When true, the
   * row's sub-elements expose `data-tour` hooks that the product tour uses to
   * highlight each column. Defaults to false.
   */
  isFirst?: boolean;
}

function groupBetsByDay(
  bets: TodayMatchBet[],
): { date: string; label: string; finished: boolean; bets: TodayMatchBet[] }[] {
  const groups = new Map<
    string,
    { date: string; label: string; finished: boolean; bets: TodayMatchBet[] }
  >();
  for (const bet of bets) {
    const key = bet.date || 'other';
    const existing = groups.get(key) || {
      date: key,
      label: bet.dayLabel || key,
      finished: true,
      bets: [],
    };
    existing.bets.push(bet);
    if (bet.status !== 'finished') existing.finished = false;
    groups.set(key, existing);
  }

  const today = new Date().toISOString().slice(0, 10);

  return Array.from(groups.values()).sort((a, b) => {
    const aIsToday = a.date === today;
    const bIsToday = b.date === today;
    const aIsPast = a.date < today;
    const bIsPast = b.date < today;
    const aIsFuture = a.date > today;
    const bIsFuture = b.date > today;

    if (aIsToday && !bIsToday) return -1;
    if (bIsToday && !aIsToday) return 1;

    if (aIsFuture && bIsPast) return -1;
    if (bIsFuture && aIsPast) return 1;

    if (aIsFuture && bIsFuture) return a.date.localeCompare(b.date);
    if (aIsPast && bIsPast) return a.date.localeCompare(b.date);

    return 0;
  });
}

function renderPrediction(bet: TodayMatchBet): ReactNode {
  const isFinished = bet.status === 'finished';
  const isCorrect = bet.isExact;
  const isPartial = !isCorrect && bet.isWinner;
  let resultClass = '';
  if (isFinished && isCorrect) resultClass = 'ranking-row__match-prediction--correct';
  else if (isFinished && isPartial) resultClass = 'ranking-row__match-prediction--partial';
  else if (isFinished) resultClass = 'ranking-row__match-prediction--wrong';

  return (
    <span
      key={bet.matchId}
      className={`ranking-row__match-prediction ${resultClass}`}
      title={`${bet.homeTeam} vs ${bet.awayTeam}${isFinished ? ` — actual: ${bet.actualHome}-${bet.actualAway}` : ''}`}
    >
      <TeamFlag fifaCode={bet.homeTeam} size="sm" />
      <span className="ranking-row__match-score">
        {bet.homeScore}-{bet.awayScore}
      </span>
      <TeamFlag fifaCode={bet.awayTeam} size="sm" />
    </span>
  );
}

function renderMatchdayBlocks(bets: TodayMatchBet[]): ReactNode {
  const hasDates = bets.some((b) => b.date);
  if (!hasDates) {
    return bets.map(renderPrediction);
  }

  const groups = groupBetsByDay(bets);
  return groups.map(({ date, label, finished, bets: dayBets }) => (
    <div key={date} className="ranking-row__day-group">
      <Typography
        variant="caption"
        className={`ranking-row__day-label ${finished ? 'ranking-row__day-label--done' : ''}`}
      >
        {finished && <span className="ranking-row__day-check">✓</span>}
        {label}
      </Typography>
      <div className="ranking-row__day-bets">{dayBets.map(renderPrediction)}</div>
    </div>
  ));
}

function cellResultClass(correct: boolean | 'partial' | null): string {
  if (correct === true) return 'ranking-row__pos-cell--correct';
  if (correct === 'partial') return 'ranking-row__pos-cell--partial';
  if (correct === false) return 'ranking-row__pos-cell--wrong';
  return '';
}

function renderTeamCell(cell: PredictedTeamCell, isGroupFinished: boolean): ReactNode {
  const positionClass =
    isGroupFinished && (cell.position === 1 || cell.position === 2 || cell.position === 4)
      ? ` ranking-row__pos-ordinal--${cell.position}`
      : '';
  return (
    <span
      key={cell.position}
      className={`ranking-row__pos-cell${isGroupFinished ? ' ranking-row__pos-cell--finished' : ''} ${cellResultClass(cell.correct)}`}
      title={`${cell.position}°`}
    >
      <TeamFlag fifaCode={cell.fifaCode} size="sm" />
      <span className={`ranking-row__pos-ordinal${positionClass}`}>{cell.position}°</span>
    </span>
  );
}

function renderGroupBlocks(groups: GroupPredictionView[]): ReactNode {
  return groups.map((group) => (
    <div key={`grp-${group.groupId}`} className="ranking-row__day-group">
      <Typography variant="caption" className="ranking-row__day-label">
        {group.label}
      </Typography>
      <div className="ranking-row__day-bets">
        {group.teams.map((cell) => renderTeamCell(cell, group.finished))}
      </div>
    </div>
  ));
}

function renderFinalPhaseBlock(view: FinalPhasePredictionView, label: string): ReactNode {
  return (
    <div className="ranking-row__day-group">
      <Typography variant="caption" className="ranking-row__day-label">
        {label}
      </Typography>
      <div className="ranking-row__day-bets">{view.positions.map(renderTeamCell)}</div>
    </div>
  );
}

function renderBestPlayerChip(cell: BestPlayerCell, role: string): ReactNode {
  let resultClass = '';
  if (cell.correct === true) resultClass = 'ranking-row__player-chip--correct';
  else if (cell.correct === false) resultClass = 'ranking-row__player-chip--wrong';
  return (
    <span className={`ranking-row__player-chip ${resultClass}`} title={`${role}: ${cell.name}`}>
      <span className="ranking-row__player-role">{role}</span>
      <span className="ranking-row__player-name">{cell.name}</span>
    </span>
  );
}

const RANK_ARROW: Record<string, IconName> = {
  up: 'chevron-up',
  down: 'chevron-down',
  same: 'chevron-right',
};

// Top-3 finishers get a pixel-art medal instead of the rank-change arrow.
const PODIUM_MEDAL: Record<number, PixelArtName> = {
  1: 'medal-gold',
  2: 'medal-silver',
  3: 'medal-bronze',
};

// Localized labels for the stat icons (shown as tooltips). Kept here, like the
// badge names in badges.ts, rather than threaded through the catalog.
const STAT_LABELS: Record<
  'en' | 'es',
  { points: string; accuracy: string; streak: string; exactMatches: string; bestStreak: string }
> = {
  en: {
    points: 'Total points',
    accuracy: 'Accuracy',
    streak: 'Current streak',
    exactMatches: 'Exact matches',
    bestStreak: 'Best streak',
  },
  es: {
    points: 'Puntos totales',
    accuracy: 'Precisión',
    streak: 'Racha actual',
    exactMatches: ' aciertos exactos',
    bestStreak: 'Mejor racha',
  },
};

// Localized labels for the non-match prediction sections.
const SECTION_LABELS: Record<
  'en' | 'es',
  { finalFour: string; bestPlayers: string; scorer: string; keeper: string }
> = {
  en: { finalFour: 'Final 4', bestPlayers: 'Best players', scorer: 'Scorer', keeper: 'GK' },
  es: { finalFour: 'Final 4', bestPlayers: 'Mejores', scorer: 'Goleador', keeper: 'Portero' },
};

export const RankingRow: FC<RankingRowProps> = ({
  position,
  predictorId,
  pixelArt,
  displayName,
  points,
  accuracy,
  streak,
  exactMatches,
  bestStreak,
  badges,
  rankChange,
  todayMatchBets,
  groupPredictions,
  finalPhasePrediction,
  bestPlayersPrediction,
  isCurrentUser = false,
  favouriteTeamId,
  locale = 'en',
  className = '',
  isFirst = false,
  showMatchPredictions = true,
  predictionsLoading = false,
  pointsLoading = false,
}) => {
  const statLabels = STAT_LABELS[locale];
  const sectionLabels = SECTION_LABELS[locale];

  const medalName = PODIUM_MEDAL[position];

  const earnedBadges = badges
    ? Object.keys(badges)
        .map((id) => getBadgeDefinition(id))
        .filter(Boolean)
    : [];

  const hasMatchBets = !!todayMatchBets && todayMatchBets.length > 0;
  const hasGroups = !!groupPredictions && groupPredictions.length > 0;
  const hasFinalPhase = !!finalPhasePrediction && finalPhasePrediction.positions.length > 0;
  const hasBestPlayers = !!bestPlayersPrediction;
  const hasAnyPredictions = hasMatchBets || hasGroups || hasFinalPhase || hasBestPlayers;

  return (
    <div
      className={`ranking-row ${isCurrentUser ? 'ranking-row--current' : ''} ${className}`}
      data-tour={isFirst ? 'ranking-row' : undefined}
    >
      <div className="ranking-row__position" data-tour={isFirst ? 'ranking-position' : undefined}>
        {medalName ? (
          <PixelArt name={medalName} size={22} className="ranking-row__medal" animated />
        ) : (
          rankChange && (
            <span
              className={`ranking-row__rank-change ranking-row__rank-change--${rankChange}`}
              aria-label={rankChange}
            >
              <Icon name={RANK_ARROW[rankChange]} size={14} />
            </span>
          )
        )}
        <span className={`ranking-row__position-number ranking-row__position--${position}`}>
          #{position}
        </span>
      </div>

      <div className="ranking-row__user" data-tour={isFirst ? 'ranking-user' : undefined}>
        <PredictorAvatar
          predictor={
            {
              id: predictorId ?? '',
              name: displayName,
              pixelArt: pixelArt ?? undefined,
            } as Predictor
          }
          size="lg"
        />
        <div className="ranking-row__user-text">
          <div className="ranking-row__name-block">
            <div className="ranking-row__name-scroller">
              <Typography variant="small" className="ranking-row__name">
                {displayName}
              </Typography>
            </div>
            {favouriteTeamId && (
              <TeamFlag fifaCode={favouriteTeamId} size="sm" className="ranking-row__fav-flag" />
            )}
          </div>
          {earnedBadges.length > 0 && (
            <div className="ranking-row__badges" data-tour={isFirst ? 'ranking-badges' : undefined}>
              {earnedBadges.map((def) => (
                <Tooltip
                  key={def!.id}
                  className="ranking-row__badge"
                  content={getBadgeName(def!.id, locale)}
                  position="top"
                >
                  <Icon name={def!.icon} size={18} />
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>

      {pointsLoading ? (
        <div
          className="ranking-row__stats ranking-row__stats--loading"
          data-tour={isFirst ? 'ranking-stats' : undefined}
        >
          <span className="ranking-row__stat-skeleton" />
          <span className="ranking-row__stat-skeleton" />
          <span className="ranking-row__stat-skeleton" />
        </div>
      ) : (
        <div className="ranking-row__stats" data-tour={isFirst ? 'ranking-stats' : undefined}>
          <Tooltip
            className="ranking-row__stat"
            content={statLabels.points}
            position="top"
            data-tour={isFirst ? 'ranking-points' : undefined}
          >
            <Icon name="star" size={14} />
            <Typography variant="small">{points}</Typography>
          </Tooltip>
          <Tooltip
            className="ranking-row__stat"
            content={statLabels.accuracy}
            position="top"
            data-tour={isFirst ? 'ranking-accuracy' : undefined}
          >
            <Icon name="target" size={14} />
            <Typography variant="small">{accuracy}%</Typography>
          </Tooltip>
          {streak > 0 && (
            <Tooltip
              className="ranking-row__stat"
              content={statLabels.streak}
              position="top"
              data-tour={isFirst ? 'ranking-streak' : undefined}
            >
              <Icon name="fire" size={14} />
              <Typography variant="small">{streak}</Typography>
            </Tooltip>
          )}
          {exactMatches != null && exactMatches > 0 && (
            <Tooltip className="ranking-row__stat" content={statLabels.exactMatches} position="top">
              <Icon name="check" size={14} />
              <Typography variant="small">{exactMatches}</Typography>
            </Tooltip>
          )}
          {bestStreak != null && bestStreak > 0 && (
            <Tooltip className="ranking-row__stat" content={statLabels.bestStreak} position="top">
              <Icon name="trophy" size={14} />
              <Typography variant="small">{bestStreak}</Typography>
            </Tooltip>
          )}
        </div>
      )}

      {showMatchPredictions && predictionsLoading && (
        <div
          className="ranking-row__match-predictions ranking-row__match-predictions--loading"
          aria-busy="true"
          aria-label="Loading predictions"
        >
          <span className="ranking-row__prediction-skeleton" />
          <span className="ranking-row__prediction-skeleton" />
          <span className="ranking-row__prediction-skeleton" />
        </div>
      )}

      {showMatchPredictions && !predictionsLoading && hasAnyPredictions && (
        <div
          className="ranking-row__match-predictions"
          data-tour={isFirst ? 'ranking-matches' : undefined}
        >
          <div className="ranking-row__predictions-scroll">
            {hasMatchBets && renderMatchdayBlocks(todayMatchBets!)}
            {hasGroups && renderGroupBlocks(groupPredictions!)}
            {hasFinalPhase && renderFinalPhaseBlock(finalPhasePrediction!, sectionLabels.finalFour)}
            {hasBestPlayers && (
              <div className="ranking-row__day-group">
                <Typography variant="caption" className="ranking-row__day-label">
                  {sectionLabels.bestPlayers}
                </Typography>
                <div className="ranking-row__day-bets ranking-row__player-chips">
                  {renderBestPlayerChip(bestPlayersPrediction!.scorer, sectionLabels.scorer)}
                  {renderBestPlayerChip(bestPlayersPrediction!.goalkeeper, sectionLabels.keeper)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
