import React, { useEffect, useState } from 'react';
import { AdminMatchList } from '@organisms/AdminMatchList/AdminMatchList';
import { Typography } from '@atoms/Typography/Typography';
import { Button } from '@atoms/Button/Button';
import { updateMatchResult } from '@services/admin-service';
import type { Match, MatchStatus } from '@app-types/firestore';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getDb } from '@services/firebase';
import { useAuthStore } from '@store/auth-store';
import { getLoginRoute } from '@utils/i18n';
import './AdminMatchesPage.css';

const TOURNAMENT_ID = 'world-cup-2026';

export const AdminMatchesPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const [matches, setMatches] = useState<(Match & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      window.location.href = getLoginRoute('es');
      return;
    }

    if (user.role !== 'admin') {
      window.location.href = '/';
      return;
    }

    const fetchMatches = async () => {
      try {
        const matchesRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'matches');
        const q = query(matchesRef, orderBy('date'));
        const snapshot = await getDocs(q);
        const matchesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as (Match & { id: string })[];
        setMatches(matchesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load matches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user, isAuthLoading]);

  const handleUpdateResult = async (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status: MatchStatus,
  ) => {
    try {
      await updateMatchResult(TOURNAMENT_ID, matchId, homeScore, awayScore, status);
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId ? { ...m, result: { home: homeScore, away: awayScore }, status } : m,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update result');
    }
  };

  if (isAuthLoading) {
    return <Typography variant="body">Verifying access...</Typography>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return <Typography variant="body">Loading matches...</Typography>;
  }

  if (error) {
    return (
      <div>
        <Typography variant="body" className="admin-matches-page__error">
          Error: {error}
        </Typography>
        <Button variant="secondary" size="sm" onClick={() => setError(null)}>
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-matches-page">
      <Typography variant="h2" className="admin-matches-page__title">
        Admin - Manage Matches
      </Typography>
      <AdminMatchList matches={matches} onUpdateResult={handleUpdateResult} />
    </div>
  );
};
