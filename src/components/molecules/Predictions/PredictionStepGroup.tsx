import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { RegisterStepState } from '@app-types/prediction-steps';
import { Button } from '@atoms/Button';
import { Typography } from '@atoms/Typography';
import { PredictionInput } from '@molecules/PredictionInput';
import { TeamFlag } from '@molecules/TeamFlag';
import type { MatchWithId, PredictionRecord, TeamInfo } from '@utils/predictions-flow';
import { calculateGroupStandings, isGroupClassificationComplete } from '@utils/predictions-flow';

import './PredictionStepGroup.css';

export interface GroupForStep {
  slug: string;
  name: string;
  teams: { fifaCode: string; name: string }[];
}

export interface PredictionStepGroupProps {
  group: GroupForStep;
  groupMatches: MatchWithId[];
  teamsMap: Record<string, TeamInfo>;
  /** Already-saved scores per match id; used to prefill the (still editable) inputs. */
  existingMatchValues: Record<string, { home: number; away: number }>;
  existingGroupBet: string[] | null;
  onSubmit: (data: {
    matchPredictions: Record<string, { home: number; away: number }>;
    classification: string[];
  }) => Promise<void>;
  isDisabled: boolean;
  locale: 'en' | 'es';
  /** When provided, the step reports its submit/validity upward and hides its own button. */
  onStateChange?: RegisterStepState;
  translations?: {
    heading?: string;
    matches?: string;
    standings?: string;
    classification?: string;
    hintFillAllMatches?: string;
    hintRankAllTeams?: string;
    team?: string;
    pts?: string;
    vs?: string;
    position?: string;
    selectOption?: string;
    submitting?: string;
    submit?: string;
    classificationSubmitted?: string;
    ordinal1?: string;
    ordinal2?: string;
    ordinal3?: string;
    ordinalOther?: string;
  };
}

const defaultTranslations = {
  heading: 'Group',
  matches: 'Match Predictions',
  standings: 'Predicted Standings',
  classification: 'Group Classification',
  hintFillAllMatches: 'Fill in all match scores to submit',
  hintRankAllTeams: 'Rank all teams with unique positions',
  team: 'Team',
  pts: 'Pts',
  vs: 'VS',
  position: 'Position',
  selectOption: 'Select',
  submitting: 'Submitting...',
  submit: 'Submit',
  classificationSubmitted: 'Classification submitted',
  ordinal1: 'st',
  ordinal2: 'nd',
  ordinal3: 'rd',
  ordinalOther: 'th',
};

export const PredictionStepGroup: FC<PredictionStepGroupProps> = ({
  group,
  groupMatches,
  teamsMap,
  existingMatchValues,
  existingGroupBet,
  onSubmit,
  isDisabled,
  onStateChange,
  translations = {},
}) => {
  const labels = { ...defaultTranslations, ...translations };

  // Every match stays editable until the deadline; prefill from any saved bet.
  const initialScores = useMemo(() => {
    const scores: Record<string, { home: number; away: number }> = {};
    groupMatches.forEach((m) => {
      scores[m.id] = existingMatchValues[m.id] ?? { home: 0, away: 0 };
    });
    return scores;
  }, [groupMatches, existingMatchValues]);

  const [matchPredictions, setMatchPredictions] =
    useState<Record<string, { home?: number; away?: number }>>(initialScores);
  const [classification, setClassification] = useState<string[]>(
    existingGroupBet ? [...existingGroupBet] : group.teams.map((t) => t.fifaCode),
  );
  const [isClassificationManual, setIsClassificationManual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFirstRender = useRef(true);

  // Match scores seed once from initialScores via the useState initializer above. We do NOT
  // re-sync on existingMatchValues prop changes: doing so clobbered in-progress edits whenever
  // the parent re-rendered (optimistic merge on submit, Firestore reload). Fresh saved values
  // for a different predictor/group come through a remount keyed on predictor + group instead.

  useEffect(() => {
    if (existingGroupBet) setClassification([...existingGroupBet]);
  }, [existingGroupBet]);

  const allPredictions = useMemo(() => {
    const combined: PredictionRecord = {};
    for (const [id, pred] of Object.entries(matchPredictions)) {
      if (pred.home != null && pred.away != null) {
        combined[id] = { home: pred.home, away: pred.away };
      }
    }
    return combined;
  }, [matchPredictions]);

  const standings = useMemo(
    () => calculateGroupStandings(groupMatches, allPredictions, teamsMap, group.slug),
    [groupMatches, allPredictions, teamsMap, group.slug],
  );

  const allMatchesFilled = useMemo(() => {
    return groupMatches.every(
      (m) => matchPredictions[m.id]?.home != null && matchPredictions[m.id]?.away != null,
    );
  }, [groupMatches, matchPredictions]);

  const classificationComplete = useMemo(() => {
    return isGroupClassificationComplete(classification, group.teams.length);
  }, [classification, group.teams.length]);

  const standingsOrder = useMemo(() => {
    return standings.map((s) => s.teamId);
  }, [standings]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isClassificationManual) return;
    if (existingGroupBet) return;
    if (standingsOrder.length === group.teams.length && standingsOrder.every(Boolean)) {
      setClassification(standingsOrder);
    }
  }, [standingsOrder, isClassificationManual, existingGroupBet, group.teams.length]);

  const handleMatchChange = useCallback((matchId: string, home: number, away: number) => {
    setMatchPredictions((prev) => ({
      ...prev,
      [matchId]: { home, away },
    }));
  }, []);

  const handleTeamPositionChange = useCallback(
    (teamFifaCode: string, position: string) => {
      setIsClassificationManual(true);
      setClassification((prev) => {
        const next = [...prev];
        const currentPos = next.indexOf(teamFifaCode);
        if (currentPos !== -1) {
          next.splice(currentPos, 1);
        }

        const posIndex = parseInt(position, 10) - 1;
        if (!isNaN(posIndex) && posIndex >= 0 && posIndex < group.teams.length) {
          next[posIndex] = teamFifaCode;
        }

        return next;
      });
    },
    [group.teams.length],
  );

  const canSubmit = allMatchesFilled && classificationComplete;

  const buildSubmitData = useCallback(() => {
    const cleanedPredictions: Record<string, { home: number; away: number }> = {};
    for (const [id, pred] of Object.entries(matchPredictions)) {
      if (pred.home != null && pred.away != null) {
        cleanedPredictions[id] = { home: pred.home, away: pred.away };
      }
    }
    return { matchPredictions: cleanedPredictions, classification };
  }, [matchPredictions, classification]);

  // Keep the wizard's shared Next button in sync with this step's state.
  useEffect(() => {
    onStateChange?.({
      canAdvance: canSubmit && !isDisabled,
      submit: async () => {
        if (!canSubmit || isDisabled) return;
        await onSubmit(buildSubmitData());
      },
    });
  }, [canSubmit, isDisabled, onSubmit, buildSubmitData, onStateChange]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(buildSubmitData());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMatchDisabled = (matchId: string) => {
    if (isDisabled) return true;
    const match = groupMatches.find((m) => m.id === matchId);
    if (!match) return true;
    if (match.status === 'finished' || match.status === 'live') return true;
    if (match.predictionDeadline && match.predictionDeadline.toDate() < new Date()) return true;
    return false;
  };

  return (
    <div className="prediction-step-group">
      {groupMatches.length > 0 && (
        <section className="prediction-step-group__section">
          <Typography variant="h3">{labels.matches}</Typography>
          <div className="prediction-step-group__matches">
            {groupMatches.map((match) => {
              const homeTeam = match.homeTeamId
                ? teamsMap[match.homeTeamId] || {
                    fifaCode: match.homeTeamId.toUpperCase(),
                    name: match.homeTeamId,
                  }
                : { fifaCode: 'TBD', name: 'TBD' };
              const awayTeam = match.awayTeamId
                ? teamsMap[match.awayTeamId] || {
                    fifaCode: match.awayTeamId.toUpperCase(),
                    name: match.awayTeamId,
                  }
                : { fifaCode: 'TBD', name: 'TBD' };
              const disabled = isMatchDisabled(match.id);

              return (
                <div key={match.id} className="prediction-step-group__match">
                  <div className="prediction-step-group__match-teams">
                    <div className="prediction-step-group__team">
                      <TeamFlag fifaCode={homeTeam.fifaCode} size="sm" />
                      <Typography variant="small">{homeTeam.name}</Typography>
                    </div>
                    <Typography variant="caption" className="prediction-step-group__vs">
                      {labels.vs}
                    </Typography>
                    <div className="prediction-step-group__team">
                      <TeamFlag fifaCode={awayTeam.fifaCode} size="sm" />
                      <Typography variant="small">{awayTeam.name}</Typography>
                    </div>
                  </div>
                  <PredictionInput
                    homeTeamName=""
                    awayTeamName=""
                    homeScore={matchPredictions[match.id]?.home}
                    awayScore={matchPredictions[match.id]?.away}
                    onChange={(home, away) => handleMatchChange(match.id, home, away)}
                    disabled={disabled}
                  />
                </div>
              );
            })}
          </div>
          {!allMatchesFilled && groupMatches.length > 0 && (
            <Typography variant="caption" className="prediction-step-group__hint">
              {labels.hintFillAllMatches}
            </Typography>
          )}
        </section>
      )}

      {standings.length > 0 && (
        <section className="prediction-step-group__section">
          <Typography variant="h3">{labels.standings}</Typography>
          <table className="prediction-step-group__standings">
            <thead>
              <tr>
                <th>#</th>
                <th>{labels.team}</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>{labels.pts}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.teamId}>
                  <td>{i + 1}</td>
                  <td className="prediction-step-group__team-cell">
                    <TeamFlag fifaCode={s.fifaCode} size="sm" />
                    {s.fifaCode}
                  </td>
                  <td>{s.played}</td>
                  <td>{s.won}</td>
                  <td>{s.drawn}</td>
                  <td>{s.lost}</td>
                  <td>{s.goalsFor}</td>
                  <td>{s.goalsAgainst}</td>
                  <td className="prediction-step-group__pts-cell">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="prediction-step-group__section">
        <div className="prediction-step-group__classification-header">
          <Typography variant="h3">{labels.classification}</Typography>
        </div>
        <div className="prediction-step-group__classification">
          <div className="prediction-step-group__row prediction-step-group__row--header">
            <span className="prediction-step-group__col team">{labels.team}</span>
            <span className="prediction-step-group__col position">{labels.position}</span>
          </div>
          {group.teams.map((team) => {
            const currentPosition = classification.indexOf(team.fifaCode);
            const positionValue = currentPosition !== -1 ? (currentPosition + 1).toString() : '';

            return (
              <div key={team.fifaCode} className="prediction-step-group__row">
                <span className="prediction-step-group__col team">
                  <TeamFlag fifaCode={team.fifaCode} size="sm" />
                  {team.name}
                </span>
                <span className="prediction-step-group__col position">
                  <select
                    className="prediction-step-group__select"
                    value={positionValue}
                    onChange={(e) => handleTeamPositionChange(team.fifaCode, e.target.value)}
                    disabled={isDisabled}
                    aria-label={`Position for ${team.name}`}
                  >
                    <option value="">{labels.selectOption}</option>
                    {Array.from({ length: group.teams.length }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                        {i === 0
                          ? labels.ordinal1
                          : i === 1
                            ? labels.ordinal2
                            : i === 2
                              ? labels.ordinal3
                              : labels.ordinalOther}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
            );
          })}
        </div>
        {!classificationComplete && classification.length > 0 && (
          <Typography variant="caption" className="prediction-step-group__hint">
            {labels.hintRankAllTeams}
          </Typography>
        )}
      </section>

      {!onStateChange && (
        <div className="prediction-step-group__actions">
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? labels.submitting : labels.submit}
          </Button>
        </div>
      )}
    </div>
  );
};
