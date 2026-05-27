import type { FC } from 'react';

import type { Predictor } from '@app-types/firestore';
import { Badge } from '@atoms/Badge';
import { PredictorAvatar } from '@atoms/PredictorAvatar';
import { Typography } from '@atoms/Typography';

import './PredictorList.css';

export interface PredictorListEntry {
  predictor: Predictor;
  points?: number;
  groupsDone?: number;
  groupsTotal?: number;
}

export interface PredictorListProps {
  predictors: PredictorListEntry[];
  onSelect: (predictorId: string) => void;
  onEdit: (predictorId: string) => void;
  onDelete: (predictorId: string) => void;
  onCreate: () => void;
  translations?: {
    newButton?: string;
    progress?: string;
    points?: string;
    edit?: string;
    delete?: string;
    empty?: string;
  };
}

const t = {
  newButton: 'New prediction',
  progress: 'groups',
  points: 'pts',
  edit: 'Edit',
  delete: 'Delete',
  empty: 'No predictions yet',
};

export const PredictorList: FC<PredictorListProps> = ({
  predictors,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
  translations = {},
}) => {
  const labels = { ...t, ...translations };

  return (
    <div className="predictor-list" role="list" aria-label="Predictor list">
      {predictors.length === 0 && (
        <div className="predictor-list__empty">
          <Typography variant="body">{labels.empty}</Typography>
        </div>
      )}

      {predictors.map(({ predictor, points, groupsDone, groupsTotal }) => (
        <div
          key={predictor.id}
          className="predictor-list__card"
          role="button"
          tabIndex={0}
          onClick={() => onSelect(predictor.id)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(predictor.id)}
          aria-label={`Edit predictions for ${predictor.name}`}
        >
          <div className="predictor-list__card-content">
            <PredictorAvatar predictor={predictor} size="md" />
            <div className="predictor-list__card-info">
              <Typography variant="body" className="predictor-list__card-name">
                {predictor.name}
              </Typography>
              <div className="predictor-list__card-meta">
                {groupsDone != null && groupsTotal != null && (
                  <Badge variant="info">
                    {groupsDone}/{groupsTotal} {labels.progress}
                  </Badge>
                )}
                {points != null && (
                  <Badge variant="warning">
                    {points} {labels.points}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="predictor-list__card-actions">
            <button
              type="button"
              className="predictor-list__action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(predictor.id);
              }}
              aria-label={`Edit name and avatar for ${predictor.name}`}
            >
              <span className="pix pix-edit" />
              Edit Profile
            </button>
            <button
              type="button"
              className="predictor-list__action-btn predictor-list__action-btn--danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(predictor.id);
              }}
              aria-label={`Delete ${predictor.name}`}
            >
              <span className="pix pix-trash" />
              {labels.delete}
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="predictor-list__create-card"
        onClick={onCreate}
        aria-label={labels.newButton}
      >
        <span className="predictor-list__create-icon">+</span>
        <Typography variant="body">{labels.newButton}</Typography>
      </button>
    </div>
  );
};
