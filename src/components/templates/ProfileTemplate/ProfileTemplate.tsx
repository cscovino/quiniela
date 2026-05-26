import React, { useEffect, useState, useCallback } from 'react';
import {
  UserProfile,
  type BadgeEarned,
  type BadgeLocked,
} from '@organisms/UserProfile/UserProfile';
import { EditProfileForm } from '@molecules/EditProfileForm/EditProfileForm';
import { PointsChart } from '@molecules/PointsChart/PointsChart';
import { PredictorList, type PredictorListEntry } from '@molecules/PredictorList/PredictorList';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { Button } from '@atoms/Button/Button';
import { tournamentService } from '@services/tournament-service';
import { predictorService } from '@services/predictor-service';
import { BADGE_DEFINITIONS, getBadgeName, getBadgeDescription } from '@app-types/badges';
import { useAuthStore } from '@store/auth-store';
import { getLoginRoute, getRoute } from '@utils/i18n';
import type { Predictor, PredictorStats } from '@app-types/firestore';
import type { PointEntry } from '@molecules/PointsChart/PointsChart';
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
    favoriteTeamLabel?: string;
    favoriteTeamHint?: string;
    predictorList?: {
      newButton?: string;
      progress?: string;
      points?: string;
      edit?: string;
      delete?: string;
      empty?: string;
    };
  };
  locale?: 'en' | 'es';
  className?: string;
}

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const [loading, setLoading] = useState(!!user);
  const [stats, setStats] = useState<PredictorStats | null>(null);
  const [rank, setRank] = useState(0);
  const [badges, setBadges] = useState<BadgeEarned[]>([]);
  const [lockedBadges, setLockedBadges] = useState<BadgeLocked[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointEntry[]>([]);
  const [predictors, setPredictors] = useState<Predictor[]>([]);
  const [predictorEntries, setPredictorEntries] = useState<PredictorListEntry[]>([]);
  const [selectedPredictorId, setSelectedPredictorId] = useState<string | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [editing, setEditing] = useState(false);

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
        points: r.stats?.points,
        groupsDone: r.progress.groupsSubmitted,
        groupsTotal: r.progress.totalGroups,
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
    if (!user || !selectedPredictorId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const [statsResult, allStatsResult] = await Promise.allSettled([
          tournamentService.getPredictorStats(user.uid, selectedPredictorId),
          tournamentService.getAllPredictorStats(),
        ]);

        if (cancelled) return;

        if (statsResult.status === 'fulfilled' && statsResult.value) {
          setStats(statsResult.value);

          const earnedBadgeIds = Object.keys(statsResult.value.badgesAwarded || {});

          const earnedBadges: BadgeEarned[] = earnedBadgeIds.map((badgeId) => ({
            id: badgeId,
            name: getBadgeName(badgeId, locale),
            icon: BADGE_DEFINITIONS.find((b) => b.id === badgeId)?.icon || 'star',
            description: getBadgeDescription(badgeId, locale),
            earnedAt: new Date(statsResult.value.badgesAwarded[badgeId]),
          }));
          setBadges(earnedBadges);

          const history: PointEntry[] = (statsResult.value.pointsHistory || []).map((entry) => ({
            date: entry.timestamp.toDate(),
            points: entry.points,
            cumulative: 0,
            matchId: entry.matchId,
          }));
          setPointsHistory(history);

          const lockedBadgeDefs = BADGE_DEFINITIONS.filter((b) => !earnedBadgeIds.includes(b.id));
          const locked: BadgeLocked[] = lockedBadgeDefs.map((def) => ({
            id: def.id,
            name: def.name[locale],
            icon: def.icon,
            description: def.description[locale],
            condition: def.condition[locale],
          }));
          setLockedBadges(locked);
        }

        if (allStatsResult.status === 'fulfilled') {
          const userIndex = allStatsResult.value.findIndex(
            (s) => s.userId === user.uid && s.predictorId === selectedPredictorId,
          );
          setRank(userIndex !== -1 ? userIndex + 1 : 0);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user, selectedPredictorId, locale]);

  const handleSelectPredictor = (predictorId: string) => {
    setSelectedPredictorId(predictorId);
  };

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

  const displayStats = {
    totalPoints: stats?.totalPoints || 0,
    exactBets: stats?.exactBets || 0,
    accuracy: stats?.accuracy || 0,
    currentStreak: stats?.currentStreak || 0,
    maxStreak: stats?.maxStreak || 0,
    rank: rank || 0,
  };

  const predictionsRoute = getRoute(locale, 'predictions');

  return (
    <div className={`profile-template ${className}`}>
      <main className="profile-template__content">
        <header className="profile-template__header">
          <div className="profile-template__header-row">
            <Typography variant="h1">{translations.title}</Typography>
            {!editing && translations.editProfile && (
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
                {translations.editProfile}
              </Button>
            )}
          </div>
        </header>

        <section className="profile-template__user">
          {editing ? (
            <EditProfileForm
              translations={{
                displayNameLabel: translations.displayNameLabel || 'Display Name',
                displayNameRequired: translations.displayNameRequired || 'Display name is required',
                avatarUrlLabel: translations.avatarUrlLabel || 'Avatar URL',
                avatarUrlHint: translations.avatarUrlHint || '',
                favoriteTeamLabel: translations.favoriteTeamLabel || 'Favorite Team',
                favoriteTeamHint: translations.favoriteTeamHint || '',
                saveProfile: translations.saveProfile || 'Save Changes',
                cancelEditing: translations.cancelEditing || 'Cancel',
                saving: translations.saving || 'Saving...',
                profileSaved: translations.profileSaved || 'Profile updated',
                profileSaveError: translations.profileSaveError || 'Failed to update profile',
              }}
              onCancel={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : (
            <UserProfile
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              stats={displayStats}
              badges={badges}
              lockedBadges={lockedBadges}
              translations={{
                totalPoints: translations.totalPoints,
                accuracy: translations.accuracy,
                currentStreak: translations.currentStreak,
                bestStreak: translations.bestStreak,
                exactBets: translations.exactBets,
                rank: translations.rank,
                badges: translations.badges,
                lockedBadges: translations.lockedBadges,
              }}
            />
          )}
        </section>

        <section className="profile-template__predictors">
          <Typography variant="h2">{translations.yourPredictors}</Typography>
          <Typography variant="body">{translations.selectPredictor}</Typography>

          {entriesLoading ? (
            <div className="profile-template__loading">
              <Spinner size="md" />
            </div>
          ) : (
            <PredictorList
              predictors={predictorEntries}
              onSelect={(id) => {
                handleSelectPredictor(id);
                window.location.href = `${predictionsRoute}?predictor=${id}`;
              }}
              onEdit={() => {
                window.location.href = `${predictionsRoute}?predictor=${selectedPredictorId}`;
              }}
              onDelete={() => {}}
              onCreate={() => {
                window.location.href = predictionsRoute;
              }}
              translations={translations.predictorList}
            />
          )}
        </section>

        <section className="profile-template__points-chart">
          <PointsChart
            data={pointsHistory}
            translations={{
              title: translations.pointsChart,
              noData: translations.noPointsData,
              points: translations.points,
              matches: translations.matches,
            }}
          />
        </section>
      </main>
    </div>
  );
};
