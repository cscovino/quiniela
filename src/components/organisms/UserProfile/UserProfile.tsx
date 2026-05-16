import React from 'react';
import { Avatar } from '@atoms/Avatar/Avatar';
import { StatCard } from '@molecules/StatCard/StatCard';
import { Typography } from '@atoms/Typography/Typography';
import { Icon, type IconName } from '@atoms/Icon/Icon';
import './UserProfile.css';

export interface BadgeEarned {
  id: string;
  name: string;
  icon: string;
  earnedAt: Date;
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
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  displayName,
  avatarUrl,
  favoriteTeam,
  stats,
  badges,
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
        <StatCard label="Total Points" value={stats.totalPoints} icon="star" />
        <StatCard label="Accuracy" value={`${Math.round(stats.accuracy * 100)}%`} icon="target" />
        <StatCard
          label="Current Streak"
          value={stats.currentStreak}
          icon="fire"
          trend={stats.currentStreak > 2 ? 'up' : 'neutral'}
        />
        <StatCard label="Best Streak" value={stats.maxStreak} icon="lightning" />
        <StatCard label="Exact Bets" value={stats.exactBets} icon="trophy" />
        <StatCard label="Rank" value={`#${stats.rank}`} icon="award" />
      </div>

      {badges.length > 0 && (
        <div className="user-profile__badges">
          <Typography variant="h4">Badges</Typography>
          <div className="user-profile__badges-list">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="user-profile__badge"
                title={`${badge.name} - earned ${badge.earnedAt.toLocaleDateString()}`}
              >
                <Icon name={badge.icon as IconName} size={24} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
