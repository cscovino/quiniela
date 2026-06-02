import { type FC, useEffect, useState } from 'react';

import type { ThirdPlacedTeam } from '@app-types/prediction-steps';
import { Button } from '@atoms/Button';
import { Spinner } from '@atoms/Spinner';
import { Typography } from '@atoms/Typography';

import './ThirdPlaceConfirmation.css';

export interface ThirdPlaceConfirmationProps {
  rankedTeams: ThirdPlacedTeam[];
  onAdjust: () => void;
  onContinue: (confirmedSlugs: string[]) => void;
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  translations: {
    heading: string;
    subtitle: string;
    advancing: string;
    eliminated: string;
    bracketSlot: string;
    adjust: string;
    continue: string;
    group?: string;
    pts?: string;
    pt?: string;
    selectionCount?: string;
    toggleAdvancing?: string;
    toggleEliminated?: string;
    maxSelected?: string;
    loading?: string;
    error?: string;
    retry?: string;
  };
}

const defaultTranslations = {
  heading: 'Third-Placed Teams Qualification',
  subtitle: 'Best 8 of 12 third-placed teams advance to Round of 32',
  advancing: 'Advancing to Round of 32',
  eliminated: 'Eliminated',
  bracketSlot: 'Match',
  adjust: 'Adjust Group Predictions',
  continue: 'Continue to Knockout',
  group: 'Group',
  pts: 'pts',
  pt: 'pt',
  selectionCount: '{selected} / 8 advancing',
  toggleAdvancing: 'Click to remove from advancing',
  toggleEliminated: 'Click to add to advancing',
  maxSelected: '8 teams already selected. Deselect one to change.',
  loading: 'Loading your predictions...',
  error: 'Could not load your predictions. Please try again.',
  retry: 'Retry',
};

export const ThirdPlaceConfirmation: FC<ThirdPlaceConfirmationProps> = ({
  rankedTeams,
  onAdjust,
  onContinue,
  isLoading = false,
  hasError = false,
  onRetry,
  translations,
}) => {
  const t = { ...defaultTranslations, ...translations };

  const [localAdvancingSet, setLocalAdvancingSet] = useState<Set<string>>(
    () =>
      new Set(
        rankedTeams
          .filter((team) => team.advancing)
          .map((team) => `group-${team.groupLetter.toLowerCase()}`),
      ),
  );

  useEffect(() => {
    setLocalAdvancingSet(
      new Set(
        rankedTeams
          .filter((team) => team.advancing)
          .map((team) => `group-${team.groupLetter.toLowerCase()}`),
      ),
    );
  }, [rankedTeams]);

  const handleToggle = (groupSlug: string) => {
    setLocalAdvancingSet((prev) => {
      const next = new Set(prev);
      if (next.has(groupSlug)) {
        next.delete(groupSlug);
      } else if (next.size < 8) {
        next.add(groupSlug);
      }
      return next;
    });
  };

  const selectionCountText = (t.selectionCount ?? '{selected} / 8 advancing').replace(
    '{selected}',
    String(localAdvancingSet.size),
  );

  const isComplete = localAdvancingSet.size === 8;
  const isAtMax = localAdvancingSet.size >= 8;

  return (
    <div className="third-place-confirmation">
      <div className="third-place-confirmation__header">
        <Typography variant="h2" className="third-place-confirmation__heading">
          {t.heading}
        </Typography>
        <Typography variant="body" className="third-place-confirmation__subtitle">
          {t.subtitle}
        </Typography>
      </div>

      {isLoading && (
        <div className="third-place-confirmation__loading">
          <div className="third-place-confirmation__loading-spinner">
            <Spinner size="md" />
          </div>
          <p className="third-place-confirmation__loading-label">{t.loading}</p>
        </div>
      )}

      {hasError && (
        <div className="third-place-confirmation__error" role="alert" aria-live="polite">
          <p className="third-place-confirmation__error-message">{t.error}</p>
          <Button variant="secondary" size="md" onClick={onRetry}>
            {t.retry}
          </Button>
        </div>
      )}

      {!isLoading && !hasError && (
        <>
          <div className="third-place-confirmation__counter">
            <span
              className={`third-place-confirmation__counter-chip ${
                isComplete
                  ? 'third-place-confirmation__counter-chip--complete'
                  : 'third-place-confirmation__counter-chip--incomplete'
              }`}
            >
              {selectionCountText}
            </span>
            {isAtMax && t.maxSelected && (
              <Typography variant="caption" className="third-place-confirmation__max-message">
                {t.maxSelected}
              </Typography>
            )}
          </div>

          <div className="third-place-confirmation__list">
            {rankedTeams.map((team, index) => {
              const groupSlug = `group-${team.groupLetter.toLowerCase()}`;
              const isAdvancing = localAdvancingSet.has(groupSlug);
              const isDisabledRow = !isAdvancing && isAtMax;

              return (
                <button
                  key={team.teamId}
                  type="button"
                  className={[
                    'third-place-confirmation__row',
                    isAdvancing
                      ? 'third-place-confirmation__row--advancing'
                      : 'third-place-confirmation__row--eliminated',
                    isDisabledRow ? 'third-place-confirmation__row--disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => !isDisabledRow && handleToggle(groupSlug)}
                  aria-pressed={isAdvancing}
                  aria-disabled={isDisabledRow}
                  aria-label={
                    isAdvancing
                      ? (t.toggleAdvancing ?? 'Click to remove from advancing')
                      : (t.toggleEliminated ?? 'Click to add to advancing')
                  }
                >
                  <span className="third-place-confirmation__rank">{index + 1}.</span>
                  <span className="third-place-confirmation__team-name">{team.teamName}</span>
                  <span className="third-place-confirmation__group">
                    ({t.group} {team.groupLetter})
                  </span>
                  <span
                    className={`third-place-confirmation__points ${
                      isAdvancing
                        ? 'third-place-confirmation__points--advancing'
                        : 'third-place-confirmation__points--eliminated'
                    }`}
                  >
                    {team.points} {team.points === 1 ? t.pt : t.pts}
                  </span>
                  {isAdvancing && team.bracketSlotLabel && (
                    <span className="third-place-confirmation__bracket-slot">
                      &#8594; {t.bracketSlot} {team.bracketSlotLabel.replace('Match ', '')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="third-place-confirmation__actions">
            <Button variant="ghost" size="md" onClick={onAdjust}>
              {t.adjust}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onContinue(Array.from(localAdvancingSet))}
              disabled={localAdvancingSet.size !== 8}
            >
              {t.continue}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
