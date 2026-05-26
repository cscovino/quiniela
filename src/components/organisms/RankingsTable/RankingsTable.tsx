import React from 'react';
import { RankingRow } from '@molecules/RankingRow/RankingRow';
import { Typography } from '@atoms/Typography/Typography';
import { Button } from '@atoms/Button/Button';
import './RankingsTable.css';

export interface RankingEntry {
  userId: string;
  predictorId?: string;
  avatarUrl?: string;
  avatar?: { bgColor: string; emoji: string };
  displayName: string;
  points: number;
  accuracy: number;
  streak: number;
}

export interface RankingsTableProps {
  rankings: RankingEntry[];
  currentUserId?: string;
  title?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  className?: string;
}

export const RankingsTable: React.FC<RankingsTableProps> = ({
  rankings,
  currentUserId,
  title = 'Global Rankings',
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'No rankings available yet',
  className = '',
}) => {
  if (rankings.length === 0) {
    return (
      <div className={`rankings-table rankings-table--empty ${className}`}>
        <Typography variant="body">{emptyMessage}</Typography>
      </div>
    );
  }

  return (
    <div className={`rankings-table ${className}`}>
      <Typography variant="h3">{title}</Typography>

      <div className="rankings-table__list">
        {rankings.map((entry, index) => (
          <RankingRow
            key={entry.predictorId || entry.userId}
            position={(page - 1) * 20 + index + 1}
            avatarUrl={entry.avatarUrl}
            avatar={entry.avatar}
            displayName={entry.displayName}
            points={entry.points}
            accuracy={entry.accuracy}
            streak={entry.streak}
            isCurrentUser={entry.userId === currentUserId}
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
            Previous
          </Button>
          <Typography variant="small">
            Page {page} of {totalPages}
          </Typography>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
