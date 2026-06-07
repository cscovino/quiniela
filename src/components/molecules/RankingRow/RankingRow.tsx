import type { FC } from 'react';

import { getBadgeDefinition, getBadgeName } from '@app-types/badges';
import type { AvatarOptions, Predictor } from '@app-types/firestore';
import type { IconName } from '@atoms/Icon';
import { Icon } from '@atoms/Icon';
import { PredictorAvatar } from '@atoms/PredictorAvatar';
import { Tooltip } from '@atoms/Tooltip';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';
import type { TodayMatchBet } from '@organisms/RankingsTable';

import './RankingRow.css';

export interface RankingRowProps {
  position: number;
  predictorId?: string;
  pixelArt?: { seed: string; options: AvatarOptions } | null;
  displayName: string;
  points: number;
  todayPoints?: number;
  accuracy: number;
  streak: number;
  badges?: Record<string, string>;
  rankChange?: 'up' | 'down' | 'same';
  todayMatchBets?: TodayMatchBet[];
  isCurrentUser?: boolean;
  favouriteTeamId?: string;
  locale?: 'en' | 'es';
  className?: string;
  /**
   * Marks this row as the top-of-list row used as a tour target. When true, the
   * row's sub-elements expose `data-tour` hooks that the product tour uses to
   * highlight each column. Defaults to false.
   */
  isFirst?: boolean;
}

const RANK_ARROW: Record<string, IconName> = {
  up: 'chevron-up',
  down: 'chevron-down',
  same: 'chevron-right',
};

// Localized labels for the stat icons (shown as tooltips). Kept here, like the
// badge names in badges.ts, rather than threaded through the catalog.
const STAT_LABELS: Record<
  'en' | 'es',
  { points: string; today: string; accuracy: string; streak: string }
> = {
  en: {
    points: 'Total points',
    today: "Today's points",
    accuracy: 'Accuracy',
    streak: 'Current streak',
  },
  es: {
    points: 'Puntos totales',
    today: 'Puntos de hoy',
    accuracy: 'Precisión',
    streak: 'Racha actual',
  },
};

export const RankingRow: FC<RankingRowProps> = ({
  position,
  predictorId,
  pixelArt,
  displayName,
  points,
  todayPoints,
  accuracy,
  streak,
  badges,
  rankChange,
  todayMatchBets,
  isCurrentUser = false,
  favouriteTeamId,
  locale = 'en',
  className = '',
  isFirst = false,
}) => {
  const statLabels = STAT_LABELS[locale];

  const earnedBadges = badges
    ? Object.keys(badges)
        .map((id) => getBadgeDefinition(id))
        .filter(Boolean)
    : [];

  return (
    <div
      className={`ranking-row ${isCurrentUser ? 'ranking-row--current' : ''} ${className}`}
      data-tour={isFirst ? 'ranking-row' : undefined}
    >
      <div className="ranking-row__position" data-tour={isFirst ? 'ranking-position' : undefined}>
        {rankChange && (
          <span
            className={`ranking-row__rank-change ranking-row__rank-change--${rankChange}`}
            aria-label={rankChange}
          >
            <Icon name={RANK_ARROW[rankChange]} size={14} />
          </span>
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
                  <Icon name={def!.icon} size={12} />
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>

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
        {todayPoints != null && (
          <Tooltip
            className="ranking-row__stat ranking-row__stat--today"
            content={statLabels.today}
            position="top"
            data-tour={isFirst ? 'ranking-today' : undefined}
          >
            <Icon name="zap" size={14} />
            <Typography variant="small">+{todayPoints}</Typography>
          </Tooltip>
        )}
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
      </div>

      {todayMatchBets && todayMatchBets.length > 0 && (
        <div
          className="ranking-row__match-predictions"
          data-tour={isFirst ? 'ranking-matches' : undefined}
        >
          {todayMatchBets.map((bet) => {
            const isFinished = bet.status === 'finished';
            const isCorrect = bet.isExact;
            const isPartial = !isCorrect && bet.isWinner;
            let resultClass = '';
            if (isFinished && isCorrect) resultClass = 'ranking-row__match-prediction--correct';
            else if (isFinished && isPartial)
              resultClass = 'ranking-row__match-prediction--partial';
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
          })}
        </div>
      )}
    </div>
  );
};
