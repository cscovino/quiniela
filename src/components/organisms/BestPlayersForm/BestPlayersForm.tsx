import React, { useState } from 'react';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import './BestPlayersForm.css';

export interface BestPlayersFormProps {
  teams: { fifaCode: string; name: string }[];
  onSubmit: (data: { bestGoalkeeper?: string; bestScorer?: string }) => void;
  existingPrediction?: { bestGoalkeeper?: string; bestScorer?: string };
  isDisabled?: boolean;
  className?: string;
}

export const BestPlayersForm: React.FC<BestPlayersFormProps> = ({
  teams,
  onSubmit,
  existingPrediction,
  isDisabled = false,
  className = '',
}) => {
  const [bestGoalkeeper, setBestGoalkeeper] = useState(existingPrediction?.bestGoalkeeper || '');
  const [bestScorer, setBestScorer] = useState(existingPrediction?.bestScorer || '');

  const handleSubmit = () => {
    if (!bestGoalkeeper && !bestScorer) return;

    onSubmit({
      ...(bestGoalkeeper && { bestGoalkeeper }),
      ...(bestScorer && { bestScorer }),
    });
  };

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={`best-players-form ${className}`}>
      <div className="best-players-form__fields">
        <div className="best-players-form__field">
          <Typography variant="h3">Best Goalkeeper</Typography>
          <Typography variant="small" className="best-players-form__hint">
            Who will be the best goalkeeper of the tournament?
          </Typography>
          <select
            className="best-players-form__select"
            value={bestGoalkeeper}
            onChange={(e) => setBestGoalkeeper(e.target.value)}
            disabled={isDisabled}
          >
            <option value="">Select goalkeeper...</option>
            {sortedTeams.map((team) => (
              <option key={`gk-${team.fifaCode}`} value={team.fifaCode}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="best-players-form__field">
          <Typography variant="h3">Best Scorer</Typography>
          <Typography variant="small" className="best-players-form__hint">
            Who will be the top scorer of the tournament?
          </Typography>
          <select
            className="best-players-form__select"
            value={bestScorer}
            onChange={(e) => setBestScorer(e.target.value)}
            disabled={isDisabled}
          >
            <option value="">Select scorer...</option>
            {sortedTeams.map((team) => (
              <option key={`sc-${team.fifaCode}`} value={team.fifaCode}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="best-players-form__actions">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={isDisabled || (!bestGoalkeeper && !bestScorer)}
        >
          Submit Best Players
        </Button>
      </div>
    </div>
  );
};
