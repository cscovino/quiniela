import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
import { SkeletonRankings } from '@molecules/SkeletonRankings';
import {
  buildRankingsTour,
  RANKINGS_TOUR_ID,
  type RankingsTourTranslations,
  useProductTour,
} from '@organisms/ProductTour';
import { RankingsTable, type RankingsTableProps } from '@organisms/RankingsTable';
import {
  fetchLiveRankings,
  fetchMatchInfoMap,
  fetchPredictionResults,
} from '@services/live-data-service';
import { buildMatchdayBets } from '@services/matchday-bets';
import {
  buildBestPlayersPrediction,
  buildFinalPhasePrediction,
  buildGroupPredictions,
} from '@services/predictor-predictions';

import './LiveRankings.css';

/** URL query param that forces the match-predictions strip on for testing in prod. */
const PREVIEW_PARAM = 'previewRankings';

export interface LiveRankingsProps
  extends Omit<RankingsTableProps, 'rankings' | 'showMatchPredictions'> {
  initialRankings: RankingsTableProps['rankings'];
  /**
   * Tournament start as an ISO string. The per-day match-predictions strip stays
   * hidden until this moment passes. Override for prod testing with the
   * `?previewRankings=1` query param. Omitted → treated as not started yet.
   */
  tournamentStartDate?: string;
  /** i18n strings for the guided tour. Falls back to English when omitted. */
  tour?: Partial<RankingsTourTranslations> & {
    buttonLabel?: string;
    buttonAriaLabel?: string;
    nextButton?: string;
    previousButton?: string;
    doneButton?: string;
    progressText?: string;
  };
}

const DEFAULT_TOUR_BUTTONS = {
  buttonLabel: 'Tour',
  buttonAriaLabel: 'Start guided tour of the rankings',
  nextButton: 'Next',
  previousButton: 'Back',
  doneButton: 'Got it!',
  progressText: 'Step {{current}} of {{total}}',
};

const DEFAULT_TOUR: RankingsTourTranslations = {
  boardTitle: 'The leaderboard',
  boardDescription:
    'Every predictor is sorted from top to bottom. The higher you climb, the better your tournament picks are paying off.',
  positionTitle: 'Your rank',
  positionDescription:
    'The big number on the left is your position. The small arrow shows whether you moved up, down, or stayed put.',
  userTitle: 'Predictor & favorite team',
  userDescription:
    'The pixel avatar, the display name, and the small flag are your predictor. The flag is your favorite team.',
  badgesTitle: 'Earned badges',
  badgesDescription:
    'Tiny icons below the name are badges you earned for milestones. Hover to read each one.',
  pointsTitle: 'Total points',
  pointsDescription:
    'The star icon and number are your lifetime points. The more accurate your predictions, the faster this grows.',
  todayTitle: 'Points earned today',
  todayDescription: "The lightning bolt shows the points you earned in today's matches.",
  accuracyTitle: 'Accuracy',
  accuracyDescription:
    'The target icon is the percentage of your finished predictions that were correct.',
  streakTitle: 'Current streak',
  streakDescription:
    'The flame icon is the number of correct predictions in a row. Keep it going to climb the board.',
  matchesTitle: "Today's match predictions",
  matchesDescription:
    "Each pair of flags is one of today's matches with the score you predicted. Green = exact, yellow = winner, red = miss.",
};

export const LiveRankings: FC<LiveRankingsProps> = ({
  initialRankings,
  tournamentStartDate,
  tour,
  locale = 'en',
  ...rest
}) => {
  const [rankings, setRankings] = useState<RankingsTableProps['rankings']>(initialRankings);
  const [loading, setLoading] = useState(false);

  // Gate the match-predictions strip until the tournament starts. Resolved in an
  // effect (not during render) so the SSG build always emits the "hidden" markup
  // and there's no hydration mismatch; the override query param is window-only.
  const [showMatchPredictions, setShowMatchPredictions] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const override = params.get(PREVIEW_PARAM) === '1' || params.get(PREVIEW_PARAM) === 'true';
    const started =
      !!tournamentStartDate && Date.now() >= new Date(tournamentStartDate).getTime();
    setShowMatchPredictions(started || override);
  }, [tournamentStartDate]);

  const tourSteps = useMemo(() => buildRankingsTour({ ...DEFAULT_TOUR, ...tour }), [tour]);

  const productTour = useProductTour({
    tourId: RANKINGS_TOUR_ID,
    steps: tourSteps,
    buttons: {
      next: tour?.nextButton ?? DEFAULT_TOUR_BUTTONS.nextButton,
      previous: tour?.previousButton ?? DEFAULT_TOUR_BUTTONS.previousButton,
      done: tour?.doneButton ?? DEFAULT_TOUR_BUTTONS.doneButton,
      progress: tour?.progressText ?? DEFAULT_TOUR_BUTTONS.progressText,
    },
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Fetch fresh stats, live match info, and live results in parallel, then
    // join the baked predictions (from the build-time initialRankings) with the
    // live results to produce the colored views each row renders.
    Promise.all([fetchLiveRankings(), fetchMatchInfoMap(), fetchPredictionResults()])
      .then(([liveRows, matchInfo, results]) => {
        if (cancelled) return;

        // The baked predictions only exist on initialRankings (the static page);
        // the live stats rows carry none, so index them by predictorId.
        const baked = new Map(
          initialRankings.filter((r) => r.predictorId).map((r) => [r.predictorId as string, r]),
        );

        const base = liveRows.length > 0 ? liveRows : initialRankings;
        const enriched = base.map((row) => {
          const src = (row.predictorId && baked.get(row.predictorId)) || row;
          const matchBets = src.predictedBets;
          return {
            ...row,
            // Preserve the baked predictions so the per-row loading flag and any
            // later re-join keep working on the live rows too.
            predictedBets: matchBets,
            predictedGroups: src.predictedGroups,
            predictedFinalPhase: src.predictedFinalPhase,
            predictedBestPlayers: src.predictedBestPlayers,
            todayMatchBets:
              matchInfo.size > 0 && row.predictorId && matchBets
                ? buildMatchdayBets(matchBets, matchInfo, locale)
                : row.todayMatchBets,
            groupPredictions: src.predictedGroups
              ? buildGroupPredictions(src.predictedGroups, results, locale)
              : undefined,
            finalPhasePrediction: buildFinalPhasePrediction(src.predictedFinalPhase, results),
            bestPlayersPrediction: buildBestPlayersPrediction(src.predictedBestPlayers, results),
          };
        });

        setRankings(enriched);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialRankings, locale]);

  // Auto-start the tour once the leaderboard has rendered and its target
  // elements are in the DOM. Steps whose targets are missing (e.g. no
  // today's points, badges, streak, or match predictions on the first row)
  // are filtered out automatically by the hook.
  useEffect(() => {
    if (productTour.isCompleted) return;
    if (loading) return;
    if (rankings.length === 0) return;
    const timer = setTimeout(() => productTour.start(), 800);
    return () => clearTimeout(timer);
  }, [productTour, loading, rankings.length]);

  if (loading && rankings.length === 0) {
    return <SkeletonRankings />;
  }

  return (
    <div className="live-rankings">
      <header className="live-rankings__header">
        <Button
          variant="accent"
          size="sm"
          onClick={() => productTour.start()}
          aria-label={tour?.buttonAriaLabel ?? DEFAULT_TOUR_BUTTONS.buttonAriaLabel}
          className="live-rankings__tour-btn"
        >
          <Icon name="robot" size={16} />
          <span className="live-rankings__tour-btn-label">
            {tour?.buttonLabel ?? DEFAULT_TOUR_BUTTONS.buttonLabel}
          </span>
        </Button>
      </header>
      <RankingsTable
        rankings={rankings}
        showMatchPredictions={showMatchPredictions}
        predictionsLoading={showMatchPredictions && loading}
        locale={locale}
        {...rest}
      />
    </div>
  );
};
