import type { FC } from 'react';

import type { AvatarOptions } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { PixelArt } from '@atoms/PixelArt';
import { Typography } from '@atoms/Typography';
import { RankingRow } from '@molecules/RankingRow';
import type {
  BestPlayersPredictionView,
  FinalPhasePredictionView,
  GroupPredictionView,
  PredictedBestPlayers,
  PredictedFinalPhase,
  PredictedGroup,
} from '@services/predictor-predictions';

import './RankingsTable.css';

export interface TodayMatchBet {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  date?: string;
  dayLabel?: string;
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
  /**
   * Predicted scores baked at build time (immutable once predictions lock at the
   * tournament start). The client joins these with live match results to produce
   * `todayMatchBets`, so the static deploy never needs the (changing) results.
   */
  predictedBets?: Array<{ matchId: string; homeScore: number; awayScore: number }>;
  /** Baked group-standings predictions (one entry per group). Joined client-side. */
  predictedGroups?: PredictedGroup[];
  /** Baked final-four prediction. Joined client-side. */
  predictedFinalPhase?: PredictedFinalPhase;
  /** Baked best-players prediction. Joined client-side. */
  predictedBestPlayers?: PredictedBestPlayers;
  /** Built group-standings views with correctness (set by the client after join). */
  groupPredictions?: GroupPredictionView[];
  /** Built final-four view with correctness (set by the client after join). */
  finalPhasePrediction?: FinalPhasePredictionView | null;
  /** Built best-players view with correctness (set by the client after join). */
  bestPlayersPrediction?: BestPlayersPredictionView | null;
  favouriteTeamId?: string;
}

/** Whether a row has any baked prediction worth showing a loading placeholder for. */
function hasBakedPredictions(entry: RankingEntry): boolean {
  return (
    (entry.predictedBets?.length ?? 0) > 0 ||
    (entry.predictedGroups?.length ?? 0) > 0 ||
    entry.predictedFinalPhase != null ||
    entry.predictedBestPlayers != null
  );
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
  /**
   * Gates the per-day match-predictions strip on every row. When false, no row
   * renders match predictions regardless of their `todayMatchBets`. Defaults to
   * true. Set false to hide the feature until the tournament has started.
   */
  showMatchPredictions?: boolean;
  /**
   * Shows the per-row predictions placeholder while the bets are still being
   * joined with live match info. Applied only to rows that have baked
   * predictions, so bet-less predictors don't flash a placeholder. Defaults to
   * false.
   */
  predictionsLoading?: boolean;
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
  showMatchPredictions = true,
  predictionsLoading = false,
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
            groupPredictions={entry.groupPredictions}
            finalPhasePrediction={entry.finalPhasePrediction}
            bestPlayersPrediction={entry.bestPlayersPrediction}
            isCurrentUser={entry.userId === currentUserId}
            favouriteTeamId={entry.favouriteTeamId}
            locale={locale}
            isFirst={index === 0}
            showMatchPredictions={showMatchPredictions}
            predictionsLoading={predictionsLoading && hasBakedPredictions(entry)}
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
