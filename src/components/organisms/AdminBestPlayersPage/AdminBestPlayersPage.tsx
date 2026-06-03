import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@atoms/Button';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';
import { setBestPlayersResult } from '@services/admin-service';
import { getDb } from '@services/firebase';
import { useAuthStore } from '@store/auth-store';
import { getLoginRoute } from '@utils/i18n';

import './AdminBestPlayersPage.css';

import { TOURNAMENT_ID } from '@/config/tournament';

export const AdminBestPlayersPage: FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const [topScorer, setTopScorer] = useState('');
  const [bestGoalkeeper, setBestGoalkeeper] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [predictorCount, setPredictorCount] = useState<number>(0);

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

    const fetchData = async () => {
      try {
        // Fetch existing best player results
        const ref = doc(getDb(), 'tournaments', TOURNAMENT_ID, 'best_players_results', 'actual');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.topScorer) setTopScorer(data.topScorer);
          if (data.bestGoalkeeper) setBestGoalkeeper(data.bestGoalkeeper);
        }

        // Fetch predictor count
        const betsRef = collection(getDb(), 'tournaments', TOURNAMENT_ID, 'best_players_bets');
        const betsSnap = await getDocs(betsRef);
        setPredictorCount(betsSnap.size);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load best player data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthLoading]);

  const handleSubmit = async () => {
    if (!topScorer && !bestGoalkeeper) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await setBestPlayersResult(TOURNAMENT_ID, topScorer, bestGoalkeeper);
      setSuccess('Best player results saved. Scoring has been triggered.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save best player results. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading) {
    return <Typography variant="body">Verifying access...</Typography>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return <Typography variant="body">Loading best player data...</Typography>;
  }

  return (
    <div className="admin-best-players-page">
      <Typography variant="h2" className="admin-best-players-page__title">
        Admin - Best Players
      </Typography>

      {predictorCount > 0 && (
        <Typography variant="small" className="admin-best-players-page__predictor-count">
          {predictorCount} predictor(s) have submitted best-player predictions.
        </Typography>
      )}

      {success && (
        <Typography variant="body" className="admin-best-players-page__success">
          {success}
        </Typography>
      )}

      {error && (
        <div className="admin-best-players-page__error-wrapper">
          <Typography variant="body" className="admin-best-players-page__error">
            Error: {error}
          </Typography>
          <Button variant="secondary" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="admin-best-players-page__card">
        <div className="admin-best-players-page__fields">
          <div className="admin-best-players-page__field">
            <Typography variant="h3">Top Scorer</Typography>
            <Typography variant="small" className="admin-best-players-page__hint">
              Enter the name of the tournament&apos;s top scorer
            </Typography>
            <input
              type="text"
              className="admin-best-players-page__input"
              placeholder="e.g. Kylian Mbappé"
              value={topScorer}
              onChange={(e) => setTopScorer(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="admin-best-players-page__field">
            <Typography variant="h3">Best Goalkeeper</Typography>
            <Typography variant="small" className="admin-best-players-page__hint">
              Enter the name of the tournament&apos;s best goalkeeper
            </Typography>
            <input
              type="text"
              className="admin-best-players-page__input"
              placeholder="e.g. Emiliano Martínez"
              value={bestGoalkeeper}
              onChange={(e) => setBestGoalkeeper(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="admin-best-players-page__actions">
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSaving || (!topScorer && !bestGoalkeeper)}
          >
            {isSaving ? <Spinner size="sm" /> : null}
            Save Best Players
          </Button>
        </div>
      </div>
    </div>
  );
};
