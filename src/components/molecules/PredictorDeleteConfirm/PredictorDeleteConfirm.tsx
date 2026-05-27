import type { FC } from 'react';
import { useState } from 'react';

import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Typography } from '@atoms/Typography';

import './PredictorDeleteConfirm.css';

export interface PredictorDeleteConfirmProps {
  predictorName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  translations?: {
    title?: string;
    confirmText?: string;
    typeName?: string;
    placeholder?: string;
    confirmButton?: string;
    cancelButton?: string;
  };
}

const t = {
  title: 'Delete prediction',
  confirmText:
    'This will permanently delete all predictions for this predictor. This action cannot be undone.',
  typeName: 'Type the name to confirm',
  placeholder: 'Enter predictor name',
  confirmButton: 'Delete',
  cancelButton: 'Cancel',
};

export const PredictorDeleteConfirm: FC<PredictorDeleteConfirmProps> = ({
  predictorName,
  onConfirm,
  onCancel,
  isSubmitting = false,
  translations = {},
}) => {
  const labels = { ...t, ...translations };
  const [inputValue, setInputValue] = useState('');
  const isConfirmed = inputValue.trim() === predictorName;

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    await onConfirm();
  };

  return (
    <div
      className="predictor-delete-confirm"
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
    >
      <div className="predictor-delete-confirm__content">
        <Typography variant="h3">{labels.title}</Typography>
        <Typography variant="body">{labels.confirmText}</Typography>

        <div className="predictor-delete-confirm__field">
          <label htmlFor="delete-confirm-input" className="predictor-delete-confirm__label">
            {labels.typeName}
          </label>
          <Typography variant="body" className="predictor-delete-confirm__name">
            <strong>{predictorName}</strong>
          </Typography>
          <Input
            id="delete-confirm-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={labels.placeholder}
            aria-label={labels.typeName}
          />
        </div>

        <div className="predictor-delete-confirm__actions">
          <Button
            variant="danger"
            onClick={handleConfirm}
            isDisabled={!isConfirmed || isSubmitting}
          >
            {labels.confirmButton}
          </Button>
          <Button variant="secondary" onClick={onCancel} isDisabled={isSubmitting}>
            {labels.cancelButton}
          </Button>
        </div>
      </div>
    </div>
  );
};
