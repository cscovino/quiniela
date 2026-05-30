import type { FC } from 'react';

import { getBadgeDefinition, getBadgeName } from '@app-types/badges';
import { Avatar } from '@atoms/Avatar';
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
  avatarUrl?: string;
  avatar?: { bgColor: string; emoji: string };
  displayName: string;
  points: number;
  todayPoints?: number;
  accuracy: number;
  streak: number;
  badges?: Record<string, string>;
  rankChange?: 'up' | 'down' | 'same';
  predictionsCount?: number;
  todayMatchBets?: TodayMatchBet[];
  isCurrentUser?: boolean;
  locale?: 'en' | 'es';
  className?: string;
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
  { points: string; today: string; accuracy: string; streak: string; predictions: string }
> = {
  en: {
    points: 'Total points',
    today: "Today's points",
    accuracy: 'Accuracy',
    streak: 'Current streak',
    predictions: 'Upcoming predictions',
  },
  es: {
    points: 'Puntos totales',
    today: 'Puntos de hoy',
    accuracy: 'Precisión',
    streak: 'Racha actual',
    predictions: 'Predicciones próximas',
  },
};

export const RankingRow: FC<RankingRowProps> = ({
  position,
  avatarUrl,
  avatar,
  displayName,
  points,
  todayPoints,
  accuracy,
  streak,
  badges,
  rankChange,
  predictionsCount,
  todayMatchBets,
  isCurrentUser = false,
  locale = 'en',
  className = '',
}) => {
  const predictorLike = avatar ? { id: displayName, name: displayName, avatar } : undefined;
  const statLabels = STAT_LABELS[locale];

  const earnedBadges = badges
    ? Object.keys(badges)
        .map((id) => getBadgeDefinition(id))
        .filter(Boolean)
    : [];

  return (
    <div className={`ranking-row ${isCurrentUser ? 'ranking-row--current' : ''} ${className}`}>
      <div className="ranking-row__position">
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

      <div className="ranking-row__user">
        {predictorLike ? (
          <PredictorAvatar predictor={predictorLike} size="sm" />
        ) : (
          <Avatar src={avatarUrl} name={displayName} size="sm" />
        )}
        <div className="ranking-row__user-text">
          <Typography variant="small" className="ranking-row__name">
            {displayName}
          </Typography>
          {earnedBadges.length > 0 && (
            <div className="ranking-row__badges">
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

      <div className="ranking-row__stats">
        <Tooltip className="ranking-row__stat" content={statLabels.points} position="top">
          <Icon name="star" size={14} />
          <Typography variant="small">{points}</Typography>
        </Tooltip>
        {todayPoints != null && (
          <Tooltip
            className="ranking-row__stat ranking-row__stat--today"
            content={statLabels.today}
            position="top"
          >
            <Icon name="zap" size={14} />
            <Typography variant="small">+{todayPoints}</Typography>
          </Tooltip>
        )}
        <Tooltip className="ranking-row__stat" content={statLabels.accuracy} position="top">
          <Icon name="target" size={14} />
          <Typography variant="small">{accuracy}%</Typography>
        </Tooltip>
        {streak > 0 && (
          <Tooltip className="ranking-row__stat" content={statLabels.streak} position="top">
            <Icon name="fire" size={14} />
            <Typography variant="small">{streak}</Typography>
          </Tooltip>
        )}
        {predictionsCount != null && (
          <Tooltip className="ranking-row__stat" content={statLabels.predictions} position="top">
            <Icon name="clock" size={14} />
            <Typography variant="small">{predictionsCount}</Typography>
          </Tooltip>
        )}
      </div>

      {todayMatchBets && todayMatchBets.length > 0 && (
        <div className="ranking-row__match-predictions">
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
