import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { PhaseType } from '@app-types/firestore';
import { Badge } from '@atoms/Badge';
import { Button } from '@atoms/Button';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';
import { TeamSelector } from '@molecules/TeamSelector';
import type { GroupBetRecord } from '@utils/predictions-flow';
import { BRACKET_MAP } from '@utils/predictions-flow';

import './PredictionStepKnockoutRound.css';

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
  groupBetsByGroupId: GroupBetRecord;
  existingKnockoutBets: Set<string>;
  previousRoundPredictions: Record<string, string>;
  onSubmit: (predictions: Record<string, string>) => Promise<void>;
  isDisabled: boolean;
  translations?: {
    roundOf32?: string;
    roundOf16?: string;
    quarterfinals?: string;
    semifinals?: string;
    thirdPlace?: string;
    final?: string;
    pickWinner?: string;
    teamsTbd?: string;
    submitRound?: string;
    submitting?: string;
    allSubmitted?: string;
  };
}

const PHASE_LABELS: Record<PhaseType, string> = {
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  quarterfinals: 'Quarterfinals',
  semifinals: 'Semifinals',
  'third-place': 'Third Place',
  final: 'Final',
  group: 'Group',
};

const defaultTranslations = {
  roundOf32: 'Round of 32',
  roundOf16: 'Round of 16',
  quarterfinals: 'Quarterfinals',
  semifinals: 'Semifinals',
  thirdPlace: 'Third Place',
  final: 'Final',
  pickWinner: 'Pick the winner',
  teamsTbd: 'Teams TBD',
  submitRound: 'Submit Round',
  submitting: 'Submitting...',
  allSubmitted: 'All predictions submitted for this round',
};

function resolveTeamFromBracket(
  slot: { source: { from: string; groupId?: string; position?: number; matchSlug?: string } },
  groupBetsByGroupId: GroupBetRecord,
  knockoutBets: Record<string, string>,
): { fifaCode: string; name: string } | null {
  const source = slot.source;

  if (source.from === 'group' && source.groupId && source.position) {
    const groupPositions = groupBetsByGroupId[source.groupId];
    if (!groupPositions || groupPositions.length < source.position) {
      return null;
    }
    const teamId = groupPositions[source.position - 1];
    if (!teamId || teamId === 'TBD') return null;
    return { fifaCode: teamId.toUpperCase(), name: teamId };
  }

  if (source.from === 'winner-of' && source.matchSlug) {
    const winner = knockoutBets[source.matchSlug];
    if (!winner || winner === 'TBD') return null;
    return { fifaCode: winner.toUpperCase(), name: winner };
  }

  return null;
}

export const PredictionStepKnockoutRound: FC<PredictionStepKnockoutRoundProps> = ({
  phase,
  roundMatches,
  groupBetsByGroupId,
  existingKnockoutBets,
  previousRoundPredictions,
  onSubmit,
  isDisabled,
  translations = {},
}) => {
  const labels = { ...defaultTranslations, ...translations };
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phaseLabel = PHASE_LABELS[phase] || phase;

  const unsubmittedMatches = useMemo(
    () => roundMatches.filter((m) => !existingKnockoutBets.has(m.slug)),
    [roundMatches, existingKnockoutBets],
  );

  const submittedMatches = useMemo(
    () => roundMatches.filter((m) => existingKnockoutBets.has(m.slug)),
    [roundMatches, existingKnockoutBets],
  );

  const knockoutBetsRecord = useMemo(() => {
    const record: Record<string, string> = { ...previousRoundPredictions };
    existingKnockoutBets.forEach((slug) => {
      if (predictions[slug]) {
        record[slug] = predictions[slug];
      }
    });
    return record;
  }, [previousRoundPredictions, existingKnockoutBets, predictions]);

  const resolvedMatches = useMemo(() => {
    return unsubmittedMatches.map((match) => {
      const bracketEntry = BRACKET_MAP[match.slug];
      if (!bracketEntry) {
        return {
          ...match,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          tbdHome: 'TBD',
          tbdAway: 'TBD',
        };
      }

      const homeTeam = resolveTeamFromBracket(
        { source: bracketEntry.home.source },
        groupBetsByGroupId,
        knockoutBetsRecord,
      );
      const awayTeam = resolveTeamFromBracket(
        { source: bracketEntry.away.source },
        groupBetsByGroupId,
        knockoutBetsRecord,
      );

      return {
        ...match,
        homeTeam,
        awayTeam,
        tbdHome: homeTeam ? undefined : 'TBD',
        tbdAway: awayTeam ? undefined : 'TBD',
      };
    });
  }, [unsubmittedMatches, groupBetsByGroupId, knockoutBetsRecord]);

  const canSubmit = useMemo(() => {
    return Object.keys(predictions).length > 0 && !isDisabled;
  }, [predictions, isDisabled]);

  const handlePrediction = (matchSlug: string, winner: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchSlug]: winner,
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(predictions);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isMatchDisabled = (match: KnockoutRoundMatch) => {
    if (isDisabled || isSubmitting) return true;
    if (!match.homeTeam || !match.awayTeam) return true;
    if (match.predictionDeadline.getTime() <= now) return true;
    return false;
  };

  if (unsubmittedMatches.length === 0) {
    return (
      <div className="prediction-step-knockout-round prediction-step-knockout-round--empty">
        <Badge variant="success">{labels.allSubmitted}</Badge>
      </div>
    );
  }

  return (
    <div className="prediction-step-knockout-round">
      <div className="prediction-step-knockout-round__header">
        <Typography variant="h2">{phaseLabel}</Typography>
      </div>

      <div className="prediction-step-knockout-round__matches">
        {resolvedMatches.map((match) => {
          const disabled = isMatchDisabled(match);
          const hasTeams = match.homeTeam != null && match.awayTeam != null;

          return (
            <div
              key={match.slug}
              className={`prediction-step-knockout-round__match ${disabled ? 'prediction-step-knockout-round__match--disabled' : ''}`}
            >
              <div className="prediction-step-knockout-round__match-header">
                {hasTeams ? (
                  <div className="prediction-step-knockout-round__teams">
                    <div className="prediction-step-knockout-round__team">
                      <TeamFlag fifaCode={match.homeTeam!.fifaCode} size="sm" />
                      <Typography variant="small">{match.homeTeam!.name}</Typography>
                    </div>
                    <Typography variant="caption" className="prediction-step-knockout-round__vs">
                      VS
                    </Typography>
                    <div className="prediction-step-knockout-round__team">
                      <TeamFlag fifaCode={match.awayTeam!.fifaCode} size="sm" />
                      <Typography variant="small">{match.awayTeam!.name}</Typography>
                    </div>
                  </div>
                ) : (
                  <div className="prediction-step-knockout-round__tbd">
                    <Typography variant="small">
                      {match.tbdHome || 'TBD'} vs {match.tbdAway || 'TBD'}
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

              {hasTeams && (
                <TeamSelector
                  options={[match.homeTeam!, match.awayTeam!]}
                  value={predictions[match.slug]}
                  onChange={(winner) => handlePrediction(match.slug, winner)}
                  label={labels.pickWinner}
                  disabled={disabled}
                />
              )}
            </div>
          );
        })}
      </div>

      {submittedMatches.length > 0 && (
        <div className="prediction-step-knockout-round__submitted">
          <Typography variant="small">Submitted predictions:</Typography>
          <div className="prediction-step-knockout-round__submitted-list">
            {submittedMatches.map((match) => (
              <div key={match.slug} className="prediction-step-knockout-round__submitted-item">
                <Typography variant="caption">{match.slug}</Typography>
                <Badge variant="success">✓</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="prediction-step-knockout-round__actions">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? labels.submitting : labels.submitRound}
        </Button>
      </div>
    </div>
  );
};
