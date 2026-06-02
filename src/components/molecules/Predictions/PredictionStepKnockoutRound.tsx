import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { PhaseType } from '@app-types/firestore';
import type { RegisterStepState } from '@app-types/prediction-steps';
import { Typography } from '@atoms/Typography';
import { TeamSelector } from '@molecules/TeamSelector';

import './PredictionStepKnockoutRound.css';

import { BRACKET_MAP, formatSlotSource, SlotSourceLabels } from '@/utils/predictions-flow';

export interface KnockoutRoundMatch {
  slug: string;
  phase: PhaseType;
  homeTeam: { fifaCode: string; name: string } | null;
  awayTeam: { fifaCode: string; name: string } | null;
  tbdHome?: string;
  tbdAway?: string;
  predictionDeadline: Date;
}

export interface PredictionStepKnockoutRoundProps {
  phase: PhaseType;
  roundMatches: KnockoutRoundMatch[];
  /** Slugs already saved for this round — kept for compatibility; prefill uses previousRoundPredictions. */
  existingKnockoutBets?: Set<string>;
  previousRoundPredictions: Record<string, string>;
  onSubmit: (predictions: Record<string, string>) => Promise<void>;
  isDisabled: boolean;
  /** When provided, the step reports its submit/validity to the wizard's Next button. */
  onStateChange?: RegisterStepState;
  translations?: {
    roundOf32?: string;
    roundOf16?: string;
    quarterfinals?: string;
    semifinals?: string;
    thirdPlace?: string;
    final?: string;
    group?: string;
    pickWinner?: string;
    teamsTbd?: string;
    allSubmitted?: string;
    submittedPredictions?: string;
    groupWinner?: string;
    groupRunnerUp?: string;
    groupPosition?: string;
    bestThird?: string;
    winnerOf?: string;
    loserOf?: string;
  };
}

const defaultTranslations = {
  roundOf32: 'Round of 32',
  roundOf16: 'Round of 16',
  quarterfinals: 'Quarterfinals',
  semifinals: 'Semifinals',
  thirdPlace: 'Third Place',
  final: 'Final',
  group: 'Group',
  pickWinner: 'Pick the winner',
  teamsTbd: 'Teams TBD',
  allSubmitted: 'All predictions submitted for this round',
  submittedPredictions: 'Submitted predictions:',
  groupWinner: 'Winner Group {group}',
  groupRunnerUp: 'Runner-up Group {group}',
  groupPosition: 'Position {n} Group {group}',
  bestThird: 'Best 3rd place',
  winnerOf: 'Winner of Match {match}',
  loserOf: 'Loser of Match {match}',
};

function getPhaseLabel(phase: PhaseType, labels: typeof defaultTranslations): string {
  const map: Record<PhaseType, string> = {
    'round-of-32': labels.roundOf32,
    'round-of-16': labels.roundOf16,
    quarterfinals: labels.quarterfinals,
    semifinals: labels.semifinals,
    'third-place': labels.thirdPlace,
    final: labels.final,
    group: labels.group,
  };
  return map[phase] || phase;
}

export const PredictionStepKnockoutRound: FC<PredictionStepKnockoutRoundProps> = ({
  phase,
  roundMatches,
  previousRoundPredictions,
  onSubmit,
  isDisabled,
  onStateChange,
  translations = {},
}) => {
  const labels = { ...defaultTranslations, ...translations };

  const phaseLabel = getPhaseLabel(phase, labels);

  // Prefill picks for this round from any saved bets so they stay editable.
  const initialPredictions = useMemo(() => {
    const seed: Record<string, string> = {};
    roundMatches.forEach((m) => {
      if (previousRoundPredictions[m.slug]) {
        seed[m.slug] = previousRoundPredictions[m.slug];
      }
    });
    return seed;
  }, [roundMatches, previousRoundPredictions]);

  const [predictions, setPredictions] = useState<Record<string, string>>(initialPredictions);

  useEffect(() => {
    setPredictions((prev) => {
      const merged: Record<string, string> = { ...initialPredictions };
      for (const m of roundMatches) {
        const picked = prev[m.slug];
        if (!picked) continue;
        const valid = m.homeTeam?.fifaCode === picked || m.awayTeam?.fifaCode === picked;
        if (valid) merged[m.slug] = picked;
      }
      return merged;
    });
  }, [initialPredictions, roundMatches]);

  const handlePrediction = (matchSlug: string, winner: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchSlug]: winner,
    }));
  };

  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isMatchDisabled = (match: KnockoutRoundMatch) => {
    if (isDisabled) return true;
    if (!match.homeTeam || !match.awayTeam) return true;
    if (match.predictionDeadline.getTime() <= now) return true;
    return false;
  };

  // A round can advance once every match with resolved teams has a pick.
  const canAdvance = useMemo(() => {
    const playable = roundMatches.filter((m) => m.homeTeam != null && m.awayTeam != null);
    if (playable.length === 0) return true;
    return playable.every((m) => predictions[m.slug]);
  }, [roundMatches, predictions]);

  useEffect(() => {
    onStateChange?.({
      canAdvance: canAdvance && !isDisabled,
      submit: async () => {
        if (Object.keys(predictions).length === 0) return;
        await onSubmit(predictions);
      },
    });
  }, [canAdvance, isDisabled, predictions, onSubmit, onStateChange]);

  return (
    <div className="prediction-step-knockout-round">
      <div className="prediction-step-knockout-round__header">
        <Typography variant="h2">{phaseLabel}</Typography>
      </div>

      <div className="prediction-step-knockout-round__matches">
        {roundMatches.map((match) => {
          const disabled = isMatchDisabled(match);
          const hasTeams = match.homeTeam != null && match.awayTeam != null;

          return (
            <div
              key={match.slug}
              className={`prediction-step-knockout-round__match ${disabled ? 'prediction-step-knockout-round__match--disabled' : ''}`}
            >
              {hasTeams ? (
                <TeamSelector
                  options={[match.homeTeam!, match.awayTeam!]}
                  value={predictions[match.slug]}
                  onChange={(winner) => handlePrediction(match.slug, winner)}
                  label={labels.pickWinner}
                  disabled={disabled}
                />
              ) : (
                <div className="prediction-step-knockout-round__tbd">
                  <Typography variant="small">
                    {(() => {
                      const entry = BRACKET_MAP[match.slug];
                      if (!entry) return 'TBD vs TBD';
                      const slotLabels: SlotSourceLabels = {
                        groupWinner: labels.groupWinner,
                        groupRunnerUp: labels.groupRunnerUp,
                        groupPosition: labels.groupPosition,
                        bestThird: labels.bestThird,
                        winnerOf: labels.winnerOf,
                        loserOf: labels.loserOf,
                      };
                      return `${formatSlotSource(entry.home.source, slotLabels)} vs ${formatSlotSource(entry.away.source, slotLabels)}`;
                    })()}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="prediction-step-knockout-round__tbd-label"
                  >
                    {labels.teamsTbd}
                  </Typography>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
