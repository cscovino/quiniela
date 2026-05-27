import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { Button } from '@atoms/Button';
import { Typography } from '@atoms/Typography';
import { TeamSelector } from '@molecules/TeamSelector';

import './KnockoutBracketForm.css';

export interface KnockoutMatch {
  slug: string;
  phase: string;
  phaseLabel: string;
  homeTeam: { fifaCode: string; name: string } | null;
  awayTeam: { fifaCode: string; name: string } | null;
  tbdHome?: string;
  tbdAway?: string;
  predictionDeadline: Date;
}

export interface KnockoutBracketFormProps {
  matches: KnockoutMatch[];
  onSubmit: (predictions: Record<string, string>) => void;
  existingBets: Set<string>;
  isDisabled?: boolean;
  className?: string;
}

export const KnockoutBracketForm: FC<KnockoutBracketFormProps> = ({
  matches,
  onSubmit,
  existingBets,
  isDisabled = false,
  className = '',
}) => {
  const [predictions, setPredictions] = useState<Record<string, string>>({});

  const availableMatches = useMemo(
    () => matches.filter((m) => !existingBets.has(m.slug)),
    [matches, existingBets],
  );

  const matchesByPhase = useMemo(() => {
    const phases = new Map<string, KnockoutMatch[]>();
    for (const match of availableMatches) {
      if (!phases.has(match.phaseLabel)) {
        phases.set(match.phaseLabel, []);
      }
      phases.get(match.phaseLabel)!.push(match);
    }
    return phases;
  }, [availableMatches]);

  const handlePrediction = (matchSlug: string, winner: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchSlug]: winner,
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(predictions).length > 0) {
      onSubmit(predictions);
    }
  };

  if (availableMatches.length === 0) {
    return (
      <div className={`knockout-bracket-form knockout-bracket-form--empty ${className}`}>
        <Typography variant="body">
          All knockout predictions have been submitted or teams are not yet determined.
        </Typography>
      </div>
    );
  }

  return (
    <div className={`knockout-bracket-form ${className}`}>
      {Array.from(matchesByPhase.entries()).map(([phaseLabel, phaseMatches]) => (
        <div key={phaseLabel} className="knockout-bracket-form__phase">
          <Typography variant="h3">{phaseLabel}</Typography>
          <div className="knockout-bracket-form__matches">
            {phaseMatches.map((match) => {
              const isTbd = !match.homeTeam || !match.awayTeam;
              const isClosed = match.predictionDeadline.getTime() <= Date.now();
              const disabled = isDisabled || isTbd || isClosed;

              return (
                <div
                  key={match.slug}
                  className={`knockout-bracket-form__match ${disabled ? 'knockout-bracket-form__match--disabled' : ''}`}
                >
                  <div className="knockout-bracket-form__match-header">
                    <Typography variant="small">
                      {match.homeTeam?.name || match.tbdHome || 'TBD'} vs{' '}
                      {match.awayTeam?.name || match.tbdAway || 'TBD'}
                    </Typography>
                    {isTbd && (
                      <Typography variant="caption" className="knockout-bracket-form__tbd">
                        Teams TBD
                      </Typography>
                    )}
                  </div>

                  {match.homeTeam && match.awayTeam && (
                    <TeamSelector
                      options={[match.homeTeam, match.awayTeam]}
                      value={predictions[match.slug]}
                      onChange={(winner) => handlePrediction(match.slug, winner)}
                      label="Pick the winner"
                      disabled={disabled}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="knockout-bracket-form__actions">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={isDisabled || Object.keys(predictions).length === 0}
        >
          Submit Bracket Predictions
        </Button>
      </div>
    </div>
  );
};
