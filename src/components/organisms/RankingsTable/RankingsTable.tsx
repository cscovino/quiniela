import type { FC } from 'react';

import type { AvatarOptions } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { PixelArt } from '@atoms/PixelArt';
import { Typography } from '@atoms/Typography';
import { RankingRow } from '@molecules/RankingRow';

import './RankingsTable.css';

export interface TodayMatchBet {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  actualHome?: number;
  actualAway?: number;
  isExact?: boolean;
  isWinner?: boolean;
}

export interface RankingEntry {
  userId: string;
  predictorId?: string;
  avatarUrl?: string;
  avatar?: { bgColor: string; emoji: string };
  pixelArt?: { seed: string; options: AvatarOptions } | null;
  displayName: string;
  points: number;
  todayPoints?: number;
  accuracy: number;
  streak: number;
  badges?: Record<string, string>;
  rankChange?: 'up' | 'down' | 'same';
  todayMatchBets?: TodayMatchBet[];
  favouriteTeamId?: string;
}

export interface RankingsTableProps {
  rankings: RankingEntry[];
  currentUserId?: string;
  title?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: string;
  locale?: 'en' | 'es';
  className?: string;
}

export const RankingsTable: FC<RankingsTableProps> = ({
  rankings,
  currentUserId,
  title = 'Global Rankings',
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'No rankings available yet',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  pageLabel = 'Page {page} of {totalPages}',
  locale = 'en',
  className = '',
}) => {
  if (rankings.length === 0) {
    return (
      <div className={`rankings-table rankings-table--empty ${className}`}>
        <PixelArt name="podium" size={64} className="rankings-table__empty-art" animated />
        <Typography variant="body">{emptyMessage}</Typography>
      </div>
    );
  }

  return (
    <div className={`rankings-table ${className}`}>
      <Typography variant="h3">{title}</Typography>

      <div className="rankings-table__list" data-tour="rankings-list">
        {rankings.map((entry, index) => (
          <RankingRow
            key={entry.predictorId || entry.userId}
            position={(page - 1) * 20 + index + 1}
            predictorId={entry.predictorId}
            pixelArt={entry.pixelArt}
            displayName={entry.displayName}
            points={entry.points}
            todayPoints={entry.todayPoints}
            accuracy={entry.accuracy}
            streak={entry.streak}
            badges={entry.badges}
            rankChange={entry.rankChange}
            todayMatchBets={entry.todayMatchBets}
            isCurrentUser={entry.userId === currentUserId}
            favouriteTeamId={entry.favouriteTeamId}
            locale={locale}
            isFirst={index === 0}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="rankings-table__pagination">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
          >
            {previousLabel}
          </Button>
          <Typography variant="small">
            {pageLabel.replace('{page}', String(page)).replace('{totalPages}', String(totalPages))}
          </Typography>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
          >
            {nextLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
