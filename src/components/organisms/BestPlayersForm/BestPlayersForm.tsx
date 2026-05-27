import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@atoms/Button';
import { Typography } from '@atoms/Typography';

import './BestPlayersForm.css';

export interface BestPlayersFormProps {
  onSubmit: (data: { bestGoalkeeper?: string; bestScorer?: string }) => void;
  existingPrediction?: { bestGoalkeeper?: string; bestScorer?: string };
  isDisabled?: boolean;
  className?: string;
}

export const BestPlayersForm: FC<BestPlayersFormProps> = ({
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

  return (
    <div className={`best-players-form ${className}`}>
      <div className="best-players-form__fields">
        <div className="best-players-form__field">
          <Typography variant="h3">Best Goalkeeper</Typography>
          <Typography variant="small" className="best-players-form__hint">
            Enter the name of the player you think will be the best goalkeeper
          </Typography>
          <input
            type="text"
            className="best-players-form__input"
            placeholder="e.g. Emiliano Martinez"
            value={bestGoalkeeper}
            onChange={(e) => setBestGoalkeeper(e.target.value)}
            disabled={isDisabled}
          />
        </div>

        <div className="best-players-form__field">
          <Typography variant="h3">Best Scorer</Typography>
          <Typography variant="small" className="best-players-form__hint">
            Enter the name of the player you think will be the top scorer
          </Typography>
          <input
            type="text"
            className="best-players-form__input"
            placeholder="e.g. Kylian Mbappe"
            value={bestScorer}
            onChange={(e) => setBestScorer(e.target.value)}
            disabled={isDisabled}
          />
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
