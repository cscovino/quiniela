import type { FC } from 'react';
import { useState } from 'react';

import type { Match, MatchStatus } from '@app-types/firestore';
import { Typography } from '@atoms/Typography';
import { AdminMatchResultForm } from '@molecules/AdminMatchResultForm';

import './AdminMatchList.css';

export interface AdminMatchListProps {
  matches: (Match & { id: string })[];
  onUpdateResult: (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status: MatchStatus,
    penaltyResult?: { home: number; away: number } | null,
  ) => void;
}

const PHASE_ORDER: Record<string, number> = {
  group: 1,
  'round-of-32': 2,
  'round-of-16': 3,
  quarterfinals: 4,
  semifinals: 5,
  'third-place': 6,
  final: 7,
};

export const AdminMatchList: FC<AdminMatchListProps> = ({ matches, onUpdateResult }) => {
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  const groupedByPhase = matches.reduce<Record<string, (Match & { id: string })[]>>(
    (acc, match) => {
      const phase = match.phase;
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(match);
      return acc;
    },
    {},
  );

  const sortedPhases = Object.keys(groupedByPhase).sort(
    (a, b) => (PHASE_ORDER[a] || 99) - (PHASE_ORDER[b] || 99),
  );

  return (
    <div className="admin-match-list">
      {sortedPhases.map((phase) => (
        <div key={phase} className="admin-match-list__phase">
          <Typography variant="h3" className="admin-match-list__phase-title">
            {phase.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Typography>
          <div className="admin-match-list__matches">
            {groupedByPhase[phase].map((match) => (
              <div key={match.id} className="admin-match-list__match">
                <div className="admin-match-list__match-info">
                  <Typography variant="small" className="admin-match-list__match-id">
                    {match.slug}
                  </Typography>
                  <Typography variant="body" className="admin-match-list__teams">
                    {match.homeTeamId?.toUpperCase() || 'TBD'} vs{' '}
                    {match.awayTeamId?.toUpperCase() || 'TBD'}
                  </Typography>
                  <Typography variant="small" className="admin-match-list__date">
                    {match.date.toDate().toLocaleString()}
                  </Typography>
                  <Typography variant="small" className="admin-match-list__stadium">
                    {match.stadium}
                  </Typography>
                  {match.result.home !== null && (
                    <Typography variant="body" className="admin-match-list__result">
                      Result: {match.result.home} - {match.result.away}
                    </Typography>
                  )}
                  <Typography
                    variant="small"
                    className={`admin-match-list__status admin-match-list__status--${match.status}`}
                  >
                    {match.status}
                  </Typography>
                  {match.pointsCalculated && (
                    <Typography variant="small" className="admin-match-list__points">
                      ✓ Points calculated
                    </Typography>
                  )}
                </div>
                {editingMatchId === match.id ? (
                  <AdminMatchResultForm
                    match={match}
                    onSubmit={(homeScore, awayScore, status, penaltyResult) => {
                      onUpdateResult(match.id, homeScore, awayScore, status, penaltyResult);
                      setEditingMatchId(null);
                    }}
                    onCancel={() => setEditingMatchId(null)}
                  />
                ) : (
                  <button
                    className="admin-match-list__edit-btn"
                    onClick={() => setEditingMatchId(match.id)}
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
