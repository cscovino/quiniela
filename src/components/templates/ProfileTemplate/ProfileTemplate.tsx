import React, { useEffect, useState } from 'react';
import {
  UserProfile,
  type BadgeEarned,
  type BadgeLocked,
} from '@organisms/UserProfile/UserProfile';
import { PointsChart } from '@molecules/PointsChart/PointsChart';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { Button } from '@atoms/Button/Button';
import { tournamentService } from '@services/tournament-service';
import { BADGE_DEFINITIONS, getBadgeName, getBadgeDescription } from '@app-types/badges';
import { useAuthStore } from '@store/auth-store';
import { getLoginRoute } from '@utils/i18n';
import type { PredictorStats } from '@app-types/firestore';
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PredictorStats | null>(null);
  const [rank, setRank] = useState(0);
  const [badges, setBadges] = useState<BadgeEarned[]>([]);
  const [lockedBadges, setLockedBadges] = useState<BadgeLocked[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointEntry[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const predictorId = `${user.uid}-default`;

    const fetchData = async () => {
      try {
        const [statsResult, allStatsResult] = await Promise.allSettled([
          tournamentService.getPredictorStats(user.uid, predictorId),
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
            (s) => s.userId === user.uid && s.predictorId === predictorId,
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
  }, [user, locale]);

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

  return (
    <div className={`profile-template ${className}`}>
      <main className="profile-template__content">
        <header className="profile-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <section className="profile-template__user">
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
