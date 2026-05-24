import React, { useState } from 'react';
import { Button } from '@atoms/Button/Button';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import type { Predictor } from '@app-types/firestore';
import './PredictorSelector.css';

export interface PredictorSelectorProps {
  predictors: Predictor[];
  selectedPredictorId: string | null;
  onSelectPredictor: (predictorId: string) => void;
  onCreatePredictor: (name: string) => Promise<void>;
  isLoading: boolean;
  translations: {
    title: string;
    selectPredictor: string;
    createPredictor: string;
    createButton: string;
    namePlaceholder: string;
    loading: string;
    noPredictors: string;
    getStarted: string;
  };
}

export const PredictorSelector: React.FC<PredictorSelectorProps> = ({
  predictors,
  selectedPredictorId,
  onSelectPredictor,
  onCreatePredictor,
  isLoading,
  translations,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreatePredictor(newName.trim());
      setNewName('');
      setIsCreating(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="predictor-selector">
        <div className="predictor-selector__loading">
          <Spinner size="lg" />
          <Typography variant="body">{translations.loading}</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="predictor-selector">
      <header className="predictor-selector__header">
        <Typography variant="h2">{translations.title}</Typography>
        <Typography variant="body">{translations.selectPredictor}</Typography>
      </header>

      {predictors.length > 0 && (
        <div className="predictor-selector__list">
          {predictors.map((predictor) => (
            <button
              key={predictor.id}
              className={`predictor-selector__item ${selectedPredictorId === predictor.id ? 'predictor-selector__item--selected' : ''}`}
              onClick={() => onSelectPredictor(predictor.id)}
            >
              <Typography variant="body">{predictor.name}</Typography>
            </button>
          ))}
        </div>
      )}

      {isCreating ? (
        <div className="predictor-selector__create">
          <input
            type="text"
            className="predictor-selector__input"
            placeholder={translations.namePlaceholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="predictor-selector__create-actions">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              isDisabled={isSubmitting || !newName.trim()}
            >
              {translations.createButton}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="predictor-selector__actions">
          <Button variant="secondary" size="md" onClick={() => setIsCreating(true)}>
            {translations.createPredictor}
          </Button>
        </div>
      )}
    </div>
  );
};
