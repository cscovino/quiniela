import React, { useEffect, useState } from 'react';
import { UserProfile, type BadgeEarned } from '@organisms/UserProfile/UserProfile';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { Button } from '@atoms/Button/Button';
import { tournamentService } from '@services/tournament-service';
import { useAuthStore } from '@store/auth-store';
import type { PredictorStats } from '@types/firestore';
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
  };
  locale?: 'en' | 'es';
  className?: string;
}

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const { user, initAuth, isAuthLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PredictorStats | null>(null);
  const [rank, setRank] = useState(0);
  const [badges, setBadges] = useState<BadgeEarned[]>([]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

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

          const earnedBadges: BadgeEarned[] = Object.entries(
            statsResult.value.badgesAwarded || {},
          ).map(([badgeId, dateStr]) => ({
            id: badgeId,
            name: badgeId
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
            icon: 'star',
            earnedAt: new Date(dateStr),
          }));
          setBadges(earnedBadges);
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
  }, [user]);

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
          <a href={locale === 'en' ? '/en/login' : '/login'}>
            <Button variant="primary" size="md">
              {translations.loginButton}
            </Button>
          </a>
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
            translations={{
              totalPoints: translations.totalPoints,
              accuracy: translations.accuracy,
              currentStreak: translations.currentStreak,
              bestStreak: translations.bestStreak,
              exactBets: translations.exactBets,
              rank: translations.rank,
              badges: translations.badges,
            }}
          />
        </section>
      </main>
    </div>
  );
};
