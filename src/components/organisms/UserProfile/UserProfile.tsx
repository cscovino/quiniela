import type { FC } from 'react';

import { Avatar } from '@atoms/Avatar';
import { Icon, type IconName } from '@atoms/Icon';
import { Typography } from '@atoms/Typography';
import { StatCard } from '@molecules/StatCard';

import './UserProfile.css';

export interface BadgeEarned {
  id: string;
  name: string;
  icon: IconName;
  earnedAt: Date;
  description?: string;
}

export interface BadgeLocked {
  id: string;
  name: string;
  icon: IconName;
  description?: string;
  condition?: string;
}

export interface UserProfileProps {
  displayName: string;
  avatarUrl?: string;
  favoriteTeam?: string;
  stats: {
    totalPoints: number;
    exactBets: number;
    accuracy: number;
    currentStreak: number;
    maxStreak: number;
    rank: number;
  };
  badges: BadgeEarned[];
  lockedBadges?: BadgeLocked[];
  translations: {
    totalPoints: string;
    accuracy: string;
    currentStreak: string;
    bestStreak: string;
    exactBets: string;
    rank: string;
    badges: string;
    lockedBadges: string;
  };
  className?: string;
}

export const UserProfile: FC<UserProfileProps> = ({
  displayName,
  avatarUrl,
  favoriteTeam,
  stats,
  badges,
  lockedBadges = [],
  translations,
  className = '',
}) => {
  return (
    <div className={`user-profile ${className}`}>
      <div className="user-profile__header">
        <Avatar src={avatarUrl} name={displayName} size="lg" />
        <div className="user-profile__info">
          <Typography variant="h2">{displayName}</Typography>
          {favoriteTeam && (
            <div className="user-profile__team">
              <Icon name="flag" size={14} />
              <Typography variant="small">{favoriteTeam}</Typography>
            </div>
          )}
        </div>
      </div>

      <div className="user-profile__stats">
        <StatCard label={translations.totalPoints} value={stats.totalPoints} icon="star" />
        <StatCard
          label={translations.accuracy}
          value={`${Math.round(stats.accuracy * 100)}%`}
          icon="target"
        />
        <StatCard
          label={translations.currentStreak}
          value={stats.currentStreak}
          icon="fire"
          trend={stats.currentStreak > 2 ? 'up' : 'neutral'}
        />
        <StatCard label={translations.bestStreak} value={stats.maxStreak} icon="lightning" />
        <StatCard label={translations.exactBets} value={stats.exactBets} icon="trophy" />
        <StatCard label={translations.rank} value={`#${stats.rank}`} icon="award" />
      </div>

      {badges.length > 0 && (
        <div className="user-profile__badges">
          <Typography variant="h4">{translations.badges}</Typography>
          <div className="user-profile__badges-list">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="user-profile__badge"
                title={`${badge.name}${badge.description ? ` - ${badge.description}` : ''}`}
              >
                <Icon name={badge.icon} size={24} />
                <Typography variant="caption" className="user-profile__badge-name">
                  {badge.name}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div className="user-profile__locked-badges">
          <Typography variant="h4">{translations.lockedBadges}</Typography>
          <div className="user-profile__badges-list">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="user-profile__badge user-profile__badge--locked"
                title={`${badge.name}${badge.condition ? ` - ${badge.condition}` : ''}`}
              >
                <Icon name={badge.icon} size={24} />
                <Typography variant="caption" className="user-profile__badge-name">
                  {badge.name}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
