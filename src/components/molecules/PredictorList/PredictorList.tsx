import type { FC } from 'react';

import { BADGE_DEFINITIONS } from '@app-types/badges';
import type { Predictor, PredictorStats } from '@app-types/firestore';
import { Button } from '@atoms/Button';
import { Icon } from '@atoms/Icon';
import { PredictorAvatar } from '@atoms/PredictorAvatar';
import { Typography } from '@atoms/Typography';

import './PredictorList.css';

export interface PredictorListEntry {
  predictor: Predictor;
  points?: number;
  groupsDone?: number;
  groupsTotal?: number;
  badgesAwarded?: Record<string, string>;
  stats?: Pick<
    PredictorStats,
    'totalPoints' | 'accuracy' | 'currentStreak' | 'maxStreak' | 'exactBets' | 'totalBets'
  >;
}

export interface PredictorListProps {
  predictors: PredictorListEntry[];
  activeId?: string;
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
    listLabel?: string;
    editPredictionsAria?: string;
    editProfileAria?: string;
    deleteAria?: string;
    editProfile?: string;
    viewAria?: string;
    statGrid?: {
      statPoints?: string;
      statAccuracy?: string;
      statCurrentStreak?: string;
      statBestStreak?: string;
      statExactBets?: string;
      statGroups?: string;
      statPointsAriaLabel?: string;
      statAccuracyAriaLabel?: string;
      statCurrentStreakAriaLabel?: string;
      statBestStreakAriaLabel?: string;
      statExactBetsAriaLabel?: string;
    };
  };
}

const t = {
  newButton: 'New prediction',
  progress: 'groups',
  points: 'pts',
  edit: 'Edit',
  delete: 'Delete',
  empty: 'No predictions yet',
  listLabel: 'Predictor list',
  editPredictionsAria: 'Edit predictions for {name}',
  editProfileAria: 'Edit name and avatar for {name}',
  deleteAria: 'Delete {name}',
  editProfile: 'Edit Profile',
};

export const PredictorList: FC<PredictorListProps> = ({
  predictors,
  activeId,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
  translations = {},
}) => {
  const labels = { ...t, ...translations };

  return (
    <div className="predictor-list" role="list" aria-label={labels.listLabel}>
      {predictors.length === 0 && (
        <div className="predictor-list__empty">
          <Typography variant="body">{labels.empty}</Typography>
        </div>
      )}

      {predictors.map(({ predictor, groupsDone, groupsTotal, badgesAwarded, stats }) => {
        const accuracyDisplay =
          (stats?.totalBets ?? 0) === 0 ? '—' : Math.round((stats?.accuracy ?? 0) * 100) + '%';

        return (
          <div
            key={predictor.id}
            className={`predictor-list__card${predictor.id === activeId ? ' predictor-list__card--active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(predictor.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(predictor.id)}
            aria-label={(labels.viewAria || labels.editPredictionsAria).replace(
              '{name}',
              predictor.name,
            )}
          >
            <div className="predictor-list__card-content">
              <PredictorAvatar predictor={predictor} size="md" />
              <div className="predictor-list__card-info">
                <Typography variant="body" className="predictor-list__card-name">
                  {predictor.name}
                </Typography>
                <div className="predictor-list__stat-grid">
                  <div className="predictor-list__stat-cell">
                    <Icon
                      name="trophy"
                      size={12}
                      color="var(--text-secondary)"
                      ariaLabel={(
                        labels.statGrid?.statPointsAriaLabel || 'Points: {value}'
                      ).replace('{value}', String(stats?.totalPoints ?? 0))}
                    />
                    <span className="predictor-list__stat-value">{stats?.totalPoints ?? 0}</span>
                    <span className="predictor-list__stat-label">
                      {labels.statGrid?.statPoints || 'Pts'}
                    </span>
                  </div>
                  <div className="predictor-list__stat-cell">
                    <Icon
                      name="target"
                      size={12}
                      color="var(--text-secondary)"
                      ariaLabel={(
                        labels.statGrid?.statAccuracyAriaLabel || 'Accuracy: {value}'
                      ).replace('{value}', accuracyDisplay)}
                    />
                    <span className="predictor-list__stat-value">{accuracyDisplay}</span>
                    <span className="predictor-list__stat-label">
                      {labels.statGrid?.statAccuracy || 'Acc'}
                    </span>
                  </div>
                  <div className="predictor-list__stat-cell">
                    <Icon
                      name="fire"
                      size={12}
                      color="var(--text-secondary)"
                      ariaLabel={(
                        labels.statGrid?.statCurrentStreakAriaLabel || 'Current streak: {value}'
                      ).replace('{value}', String(stats?.currentStreak ?? 0))}
                    />
                    <span className="predictor-list__stat-value">{stats?.currentStreak ?? 0}</span>
                    <span className="predictor-list__stat-label">
                      {labels.statGrid?.statCurrentStreak || 'Streak'}
                    </span>
                  </div>
                  <div className="predictor-list__stat-cell">
                    <Icon
                      name="crown"
                      size={12}
                      color="var(--text-secondary)"
                      ariaLabel={(
                        labels.statGrid?.statBestStreakAriaLabel || 'Best streak: {value}'
                      ).replace('{value}', String(stats?.maxStreak ?? 0))}
                    />
                    <span className="predictor-list__stat-value">{stats?.maxStreak ?? 0}</span>
                    <span className="predictor-list__stat-label">
                      {labels.statGrid?.statBestStreak || 'Best'}
                    </span>
                  </div>
                  <div className="predictor-list__stat-cell">
                    <Icon
                      name="sparkles"
                      size={12}
                      color="var(--text-secondary)"
                      ariaLabel={(
                        labels.statGrid?.statExactBetsAriaLabel || 'Exact bets: {value}'
                      ).replace('{value}', String(stats?.exactBets ?? 0))}
                    />
                    <span className="predictor-list__stat-value">{stats?.exactBets ?? 0}</span>
                    <span className="predictor-list__stat-label">
                      {labels.statGrid?.statExactBets || 'Exact'}
                    </span>
                  </div>
                  <div className="predictor-list__stat-cell">
                    <span className="predictor-list__stat-value">
                      {groupsDone != null && groupsTotal != null
                        ? `${groupsDone}/${groupsTotal}`
                        : '—/—'}
                    </span>
                    <span className="predictor-list__stat-label">
                      {labels.statGrid?.statGroups || 'Groups'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {badgesAwarded && Object.keys(badgesAwarded).length > 0 && (
              <div className="predictor-list__card-badges">
                {Object.keys(badgesAwarded).map((badgeId) => {
                  const def = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
                  return (
                    <span
                      key={badgeId}
                      className="predictor-list__badge-icon"
                      title={def?.name.en || badgeId}
                    >
                      <Icon name={def?.icon || 'star'} size={14} />
                    </span>
                  );
                })}
              </div>
            )}
            <div className="predictor-list__card-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(predictor.id);
                }}
                aria-label={labels.editProfileAria.replace('{name}', predictor.name)}
              >
                <Icon name="pen-square" size={16} />
                <span className="predictor-list__btn-label">{labels.editProfile}</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(predictor.id);
                }}
                aria-label={labels.deleteAria.replace('{name}', predictor.name)}
              >
                <Icon name="trash" size={16} />
                <span className="predictor-list__btn-label">{labels.delete}</span>
              </Button>
            </div>
          </div>
        );
      })}

      <Button variant="primary" fullWidth onClick={onCreate} aria-label={labels.newButton}>
        <Icon name="plus" size={18} /> {labels.newButton}
      </Button>
    </div>
  );
};
