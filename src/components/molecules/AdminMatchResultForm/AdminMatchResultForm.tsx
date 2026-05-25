import React, { useState } from 'react';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import type { Match, MatchStatus } from '@app-types/firestore';
import './AdminMatchResultForm.css';

export interface AdminMatchResultFormProps {
  match: Match & { id: string };
  onSubmit: (homeScore: number | null, awayScore: number | null, status: MatchStatus) => void;
  onCancel: () => void;
}

const MATCH_STATUSES: MatchStatus[] = ['scheduled', 'live', 'finished', 'postponed', 'cancelled'];

export const AdminMatchResultForm: React.FC<AdminMatchResultFormProps> = ({
  match,
  onSubmit,
  onCancel,
}) => {
  const [homeScore, setHomeScore] = useState<string>(
    match.result.home !== null ? match.result.home.toString() : '',
  );
  const [awayScore, setAwayScore] = useState<string>(
    match.result.away !== null ? match.result.away.toString() : '',
  );
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const scoresAllowed = status === 'finished' || status === 'live';

    if (!scoresAllowed) {
      onSubmit(null, null, status);
      return;
    }

    const bothEmpty = homeScore === '' && awayScore === '';
    if (status === 'finished' && bothEmpty) {
      setError('Scores are required for finished matches');
      return;
    }

    if (bothEmpty) {
      onSubmit(null, null, status);
      return;
    }

    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setError('Scores must be non-negative integers');
      return;
    }

    onSubmit(home, away, status);
  };

  return (
    <form className="admin-match-result-form" onSubmit={handleSubmit}>
      <div className="admin-match-result-form__fields">
        <div className="admin-match-result-form__status">
          <label>
            <Typography variant="small">Status</Typography>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MatchStatus)}
              className="admin-match-result-form__select"
            >
              {MATCH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(status === 'finished' || status === 'live') && (
          <div className="admin-match-result-form__scores">
            <label>
              <Typography variant="small">{match.homeTeamId?.toUpperCase() || 'Home'}</Typography>
              <input
                type="number"
                min="0"
                max="99"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="admin-match-result-form__input"
                placeholder="0"
              />
            </label>
            <label>
              <Typography variant="small">{match.awayTeamId?.toUpperCase() || 'Away'}</Typography>
              <input
                type="number"
                min="0"
                max="99"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="admin-match-result-form__input"
                placeholder="0"
              />
            </label>
          </div>
        )}
      </div>

      {error && (
        <Typography variant="small" className="admin-match-result-form__error">
          {error}
        </Typography>
      )}

      <div className="admin-match-result-form__actions">
        <Button variant="primary" size="sm" type="submit">
          Save
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
