import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@atoms/Button';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';

import './BestPlayersForm.css';

export interface BestPlayersFormProps {
  onSubmit: (data: { bestGoalkeeper?: string; bestScorer?: string }) => void;
  existingPrediction?: { bestGoalkeeper?: string; bestScorer?: string };
  isDisabled?: boolean;
  isSubmitting?: boolean;
  className?: string;
  translations?: {
    bestGoalkeeper?: string;
    bestGoalkeeperHint?: string;
    bestGoalkeeperPlaceholder?: string;
    bestScorer?: string;
    bestScorerHint?: string;
    bestScorerPlaceholder?: string;
    submit?: string;
  };
}

const defaultTranslations = {
  bestGoalkeeper: 'Best Goalkeeper',
  bestGoalkeeperHint: 'Enter the name of the player you think will be the best goalkeeper',
  bestGoalkeeperPlaceholder: 'e.g. Emiliano Martinez',
  bestScorer: 'Best Scorer',
  bestScorerHint: 'Enter the name of the player you think will be the top scorer',
  bestScorerPlaceholder: 'e.g. Kylian Mbappe',
  submit: 'Submit Best Players',
};

export const BestPlayersForm: FC<BestPlayersFormProps> = ({
  onSubmit,
  existingPrediction,
  isDisabled = false,
  isSubmitting = false,
  className = '',
  translations = {},
}) => {
  const labels = { ...defaultTranslations, ...translations };
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
          <Typography variant="h3">{labels.bestGoalkeeper}</Typography>
          <Typography variant="small" className="best-players-form__hint">
            {labels.bestGoalkeeperHint}
          </Typography>
          <input
            type="text"
            className="best-players-form__input"
            placeholder={labels.bestGoalkeeperPlaceholder}
            value={bestGoalkeeper}
            onChange={(e) => setBestGoalkeeper(e.target.value)}
            disabled={isDisabled}
          />
        </div>

        <div className="best-players-form__field">
          <Typography variant="h3">{labels.bestScorer}</Typography>
          <Typography variant="small" className="best-players-form__hint">
            {labels.bestScorerHint}
          </Typography>
          <input
            type="text"
            className="best-players-form__input"
            placeholder={labels.bestScorerPlaceholder}
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
          disabled={isDisabled || isSubmitting || (!bestGoalkeeper && !bestScorer)}
        >
          {isSubmitting ? <Spinner size="sm" /> : null}
          {labels.submit}
        </Button>
      </div>
    </div>
  );
};
