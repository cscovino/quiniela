import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import type { Match, MatchStatus } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { Typography } from '@atoms/Typography';
import { KNOCKOUT_PHASES } from '@utils/predictions-flow';

import './AdminMatchResultForm.css';

export interface AdminMatchResultFormProps {
  match: Match & { id: string };
  onSubmit: (
    homeScore: number | null,
    awayScore: number | null,
    status: MatchStatus,
    penaltyResult?: { home: number; away: number } | null,
  ) => void;
  onCancel: () => void;
}

const MATCH_STATUSES: MatchStatus[] = ['scheduled', 'live', 'finished', 'postponed', 'cancelled'];

export const AdminMatchResultForm: FC<AdminMatchResultFormProps> = ({
  match,
  onSubmit,
  onCancel,
}) => {
  const isKnockout = (KNOCKOUT_PHASES as string[]).includes(match.phase);

  const [homeScore, setHomeScore] = useState<string>(
    match.result.home !== null ? match.result.home.toString() : '',
  );
  const [awayScore, setAwayScore] = useState<string>(
    match.result.away !== null ? match.result.away.toString() : '',
  );
  const [penaltyHomeScore, setPenaltyHomeScore] = useState<string>(
    match.penaltyResult?.home != null ? match.penaltyResult.home.toString() : '',
  );
  const [penaltyAwayScore, setPenaltyAwayScore] = useState<string>(
    match.penaltyResult?.away != null ? match.penaltyResult.away.toString() : '',
  );
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [error, setError] = useState<string | null>(null);

  const home = homeScore === '' ? null : parseInt(homeScore, 10);
  const away = awayScore === '' ? null : parseInt(awayScore, 10);
  const isDraw = home !== null && away !== null && home === away;
  const showPenalties = isKnockout && isDraw;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const scoresAllowed = status === 'finished' || status === 'live';

    if (!scoresAllowed) {
      onSubmit(null, null, status, null);
      return;
    }

    const bothEmpty = homeScore === '' && awayScore === '';
    if (status === 'finished' && bothEmpty) {
      setError('Scores are required for finished matches');
      return;
    }

    if (bothEmpty) {
      onSubmit(null, null, status, null);
      return;
    }

    const homeVal = parseInt(homeScore, 10);
    const awayVal = parseInt(awayScore, 10);

    if (isNaN(homeVal) || isNaN(awayVal) || homeVal < 0 || awayVal < 0) {
      setError('Scores must be non-negative integers');
      return;
    }

    let penaltyResult: { home: number; away: number } | null = null;
    if (showPenalties) {
      const penHome = parseInt(penaltyHomeScore, 10);
      const penAway = parseInt(penaltyAwayScore, 10);
      if (isNaN(penHome) || isNaN(penAway) || penHome < 0 || penAway < 0) {
        setError('Penalty scores must be non-negative integers');
        return;
      }
      penaltyResult = { home: penHome, away: penAway };
    }

    onSubmit(homeVal, awayVal, status, penaltyResult);
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
          <>
            <div className="admin-match-result-form__scores">
              <label>
                <Typography variant="small">{match.homeTeamId?.toUpperCase() || 'Home'}</Typography>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="99"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="admin-match-result-form__input"
                  placeholder="0"
                />
              </label>
            </div>

            {showPenalties && (
              <div className="admin-match-result-form__penalties">
                <Typography variant="small" className="admin-match-result-form__penalties-label">
                  Penalty Shootout
                </Typography>
                <div className="admin-match-result-form__scores">
                  <label>
                    <Typography variant="small">
                      {match.homeTeamId?.toUpperCase() || 'Home'}
                    </Typography>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max="99"
                      value={penaltyHomeScore}
                      onChange={(e) => setPenaltyHomeScore(e.target.value)}
                      className="admin-match-result-form__input"
                      placeholder="0"
                    />
                  </label>
                  <label>
                    <Typography variant="small">
                      {match.awayTeamId?.toUpperCase() || 'Away'}
                    </Typography>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max="99"
                      value={penaltyAwayScore}
                      onChange={(e) => setPenaltyAwayScore(e.target.value)}
                      className="admin-match-result-form__input"
                      placeholder="0"
                    />
                  </label>
                </div>
              </div>
            )}
          </>
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
