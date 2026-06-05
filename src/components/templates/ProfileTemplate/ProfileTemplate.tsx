import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { Predictor } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';
import type { PredictorSeries } from '@molecules/PointsChart';
import { PointsChart } from '@molecules/PointsChart';
import { PredictorList, type PredictorListEntry } from '@molecules/PredictorList';
import { UserProfile } from '@organisms/UserProfile';
import { predictorService } from '@services/predictor-service';
import { tournamentService } from '@services/tournament-service';
import { useAuthStore } from '@store/auth-store';
import { getLoginRoute } from '@utils/i18n';

import './ProfileTemplate.css';

export interface ProfileTemplateProps {
  translations: {
    title: string;
    loading: string;
    loginRequired: string;
    loginButton: string;
    totalPoints: string;
    accuracy: string;
    currentStreak: string;
    bestStreak: string;
    exactBets: string;
    rank: string;
    badges: string;
    lockedBadges: string;
    pointsChart: string;
    noPointsData: string;
    points: string;
    matches: string;
    days: string;
    yourPredictors: string;
    selectPredictor: string;
    editProfile?: string;
    cancelEditing?: string;
    saveProfile?: string;
    saving?: string;
    profileSaved?: string;
    profileSaveError?: string;
    displayNameLabel?: string;
    displayNameRequired?: string;
    avatarUrlLabel?: string;
    avatarUrlHint?: string;
    predictorList?: {
      newButton?: string;
      progress?: string;
      points?: string;
      edit?: string;
      delete?: string;
      empty?: string;
      backToPredictors?: string;
      listLabel?: string;
      editPredictionsAria?: string;
      editProfileAria?: string;
      deleteAria?: string;
      editProfile?: string;
      viewAria?: string;
    };
    chartAriaLabel?: string;
    legendToggleAria?: string;
    statGrid?: {
      statPoints?: string;
      statAccuracy?: string;
      statCurrentStreak?: string;
      statBestStreak?: string;
      statExactBets?: string;
      statGroups?: string;
      statPointsAriaLabel?: string;
      statAccuracyAriaLabel?: string;
      statCurrentStreakAriaLabel?: string;
      statBestStreakAriaLabel?: string;
      statExactBetsAriaLabel?: string;
    };
  };
  locale?: 'en' | 'es';
  className?: string;
}

export const ProfileTemplate: FC<ProfileTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const [loading, setLoading] = useState(!!user);
  const [chartSeriesData, setChartSeriesData] = useState<PredictorSeries[]>([]);
  const [predictors, setPredictors] = useState<Predictor[]>([]);
  const [predictorEntries, setPredictorEntries] = useState<PredictorListEntry[]>([]);
  const [selectedPredictorId, setSelectedPredictorId] = useState<string | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadPredictors = async () => {
      try {
        const preds = await predictorService.getUserPredictors(user.uid);
        if (cancelled) return;
        setPredictors(preds);
        if (preds.length > 0 && !selectedPredictorId) {
          const def = preds.find((x) => x.id === `${user.uid}-default`);
          setSelectedPredictorId(def?.id || preds[0].id);
        }
        setLoading(false);
      } catch {
        // Silently fail
      }
    };

    loadPredictors();
    return () => {
      cancelled = true;
    };
  }, [user, selectedPredictorId]);

  const loadPredictorEntries = useCallback(async () => {
    if (!user) return;
    setEntriesLoading(true);
    try {
      const results = await predictorService.getUserPredictorsWithStats(user.uid);
      const entries: PredictorListEntry[] = results.map((r) => ({
        predictor: r,
        points: r.stats?.totalPoints,
        groupsDone: r.progress.groupsSubmitted,
        groupsTotal: r.progress.totalGroups,
        badgesAwarded: r.stats?.badgesAwarded,
        stats: r.stats ?? undefined,
      }));
      setPredictorEntries(entries);
    } catch {
      setPredictorEntries(predictors.map((p) => ({ predictor: p })));
    } finally {
      setEntriesLoading(false);
    }
  }, [user, predictors]);

  useEffect(() => {
    let cancelled = false;
    loadPredictorEntries().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [loadPredictorEntries]);

  useEffect(() => {
    if (!user || predictors.length === 0) {
      setChartSeriesData([]);
      return;
    }

    let cancelled = false;

    const fetchChartData = async () => {
      const results = await Promise.all(
        predictors.map((p) =>
          tournamentService
            .getPredictorStats(user.uid, p.id)
            .then((stats) => ({ predictor: p, stats }))
            .catch(() => ({ predictor: p, stats: null })),
        ),
      );

      if (cancelled) return;

      const seriesData: PredictorSeries[] = results
        .filter(
          (r): r is { predictor: Predictor; stats: NonNullable<typeof r.stats> } =>
            r.stats !== null && !!r.stats.pointsHistory && r.stats.pointsHistory.length > 0,
        )
        .map(({ predictor, stats }) => ({
          id: predictor.id,
          name: predictor.name,
          color: '',
          data: (stats.pointsHistory || []).map((entry) => ({
            date: entry.timestamp?.toDate?.() ?? new Date(),
            points: entry.points,
            cumulative: 0,
            matchId: entry.matchId,
          })),
        }));

      setChartSeriesData(seriesData);
    };

    fetchChartData();

    return () => {
      cancelled = true;
    };
  }, [user, predictors]);

  if (loading || isAuthLoading) {
    return (
      <div className={`profile-template ${className}`}>
        <div className="profile-template__loading">
          <Spinner size="lg" />
          <Typography variant="body">{translations.loading}</Typography>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`profile-template ${className}`}>
        <div className="profile-template__auth-required">
          <Typography variant="h1">{translations.title}</Typography>
          <Typography variant="body">{translations.loginRequired}</Typography>
          <Button href={getLoginRoute(locale)} variant="primary" size="md">
            {translations.loginButton}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-template ${className}`}>
      <main className="profile-template__content">
        <header className="profile-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <section className="profile-template__user">
          <UserProfile translations={translations} />
        </section>

        <section className="profile-template__predictors">
          <Typography variant="h2">{translations.yourPredictors}</Typography>

          {entriesLoading ? (
            <div className="profile-template__loading">
              <Spinner size="md" />
            </div>
          ) : (
            <PredictorList
              predictors={predictorEntries}
              locale={locale}
              translations={
                translations.predictorList
                  ? {
                      ...Object.fromEntries(
                        Object.entries(translations.predictorList).filter(
                          ([, v]) => v !== undefined,
                        ),
                      ),
                      statGrid: translations.statGrid,
                    }
                  : translations.statGrid
                    ? { statGrid: translations.statGrid }
                    : undefined
              }
            />
          )}
        </section>

        <section className="profile-template__points-chart">
          <PointsChart
            series={chartSeriesData}
            translations={{
              title: translations.pointsChart,
              noData: translations.noPointsData,
              points: translations.points,
              matches: translations.matches,
              days: translations.days,
              chartAriaLabel: translations.chartAriaLabel || 'Points earned per day',
              legendToggleAria: translations.legendToggleAria || 'Toggle highlight for {name}',
            }}
          />
        </section>
      </main>
    </div>
  );
};
