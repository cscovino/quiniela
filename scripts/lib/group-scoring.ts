export interface TeamStanding {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface ScoreBreakdown {
  position: number;
  predicted: string;
  actual: string | undefined;
  isExact: boolean;
  isActuallyClassified: boolean;
  isPredictedAsClassified: boolean;
  pointsAwarded: number;
  reason: string;
}

export interface ScoreResult {
  points: number;
  exactMatches: number;
  wrongPositionMatches: number;
  exactQualified: number;
  breakdown: ScoreBreakdown[];
}

export type ScoringPhase = 'positions-1-and-2' | 'position-3' | 'all';

export interface AllGroupStandings {
  [groupId: string]: TeamStanding[];
}

export const SCORING_POINTS = {
  EXACT_POSITION: 3,
  QUALIFIED: 1,
} as const;

export function getTop8ThirdPlaceTeamIds(
  allGroupStandings: AllGroupStandings,
): Set<string> {
  const thirdPlaceRecords: Array<{
    teamId: string;
    points: number;
    goalDifference: number;
    goalsFor: number;
  }> = [];

  for (const standings of Object.values(allGroupStandings)) {
    if (!standings || standings.length < 3) continue;
    const third = standings[2];
    thirdPlaceRecords.push({
      teamId: third.teamId,
      points: third.points,
      goalDifference: third.goalDifference,
      goalsFor: third.goalsFor,
    });
  }

  thirdPlaceRecords.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const top8 = new Set<string>();
  for (let i = 0; i < Math.min(8, thirdPlaceRecords.length); i++) {
    top8.add(thirdPlaceRecords[i].teamId.toUpperCase());
  }
  return top8;
}

export function buildActualClassifiedSet(
  standings: TeamStanding[],
  phase: ScoringPhase,
  allGroupStandings?: AllGroupStandings,
): Set<string> {
  const actualClassified = new Set<string>();
  if (standings[0]?.teamId) actualClassified.add(standings[0].teamId.toUpperCase());
  if (standings[1]?.teamId) actualClassified.add(standings[1].teamId.toUpperCase());

  if (phase !== 'positions-1-and-2') {
    if (allGroupStandings) {
      const top8Third = getTop8ThirdPlaceTeamIds(allGroupStandings);
      for (const teamId of top8Third) actualClassified.add(teamId);
    } else if (standings[2]?.teamId) {
      actualClassified.add(standings[2].teamId.toUpperCase());
    }
  }

  return actualClassified;
}

export function scoreGroupBet(
  positions: string[],
  standings: TeamStanding[],
  phase: ScoringPhase = 'all',
  allGroupStandings?: AllGroupStandings,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  predictedClassifiedTeamIds: string[] = [],
): Omit<ScoreResult, 'breakdown'> {
  if (!standings || standings.length === 0) {
    return { points: 0, exactMatches: 0, wrongPositionMatches: 0, exactQualified: 0 };
  }

  const actualClassified = buildActualClassifiedSet(standings, phase, allGroupStandings);
  const maxPosition = phase === 'positions-1-and-2' ? 2 : 3;
  const startPosition = phase === 'position-3' ? 2 : 0;

  let points = 0;
  let exactMatches = 0;
  let wrongPositionMatches = 0;
  let exactQualified = 0;

  for (let i = startPosition; i < positions.length && i < maxPosition; i++) {
    const predictedTeam = positions[i]?.toUpperCase();
    const actualTeamAtPosition = standings[i]?.teamId?.toUpperCase();
    const isActuallyClassified = predictedTeam ? actualClassified.has(predictedTeam) : false;
    const isPredictedAsClassified = i < 2 || (i === 2 && !!predictedTeam);

    if (predictedTeam && predictedTeam === actualTeamAtPosition) {
      points += SCORING_POINTS.EXACT_POSITION;
      exactMatches++;
    } else if (isPredictedAsClassified && isActuallyClassified) {
      points += SCORING_POINTS.QUALIFIED;
      wrongPositionMatches++;
    }

    if (isActuallyClassified) exactQualified++;
  }

  return { points, exactMatches, wrongPositionMatches, exactQualified };
}

export function scoreGroupBetWithBreakdown(
  positions: string[],
  standings: TeamStanding[],
  phase: ScoringPhase = 'all',
  allGroupStandings?: AllGroupStandings,
  predictedClassifiedTeamIds: string[] = [],
): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];

  if (!standings || standings.length === 0) {
    return { points: 0, exactMatches: 0, wrongPositionMatches: 0, exactQualified: 0, breakdown };
  }

  const actualClassified = buildActualClassifiedSet(standings, phase, allGroupStandings);
  const maxPosition = phase === 'positions-1-and-2' ? 2 : 3;
  const startPosition = phase === 'position-3' ? 2 : 0;

  let points = 0;
  let exactMatches = 0;
  let wrongPositionMatches = 0;
  let exactQualified = 0;

  for (let i = startPosition; i < positions.length && i < maxPosition; i++) {
    const predictedTeam = positions[i]?.toUpperCase();
    const actualTeamAtPosition = standings[i]?.teamId?.toUpperCase();
    const isActuallyClassified = predictedTeam ? actualClassified.has(predictedTeam) : false;
    const isPredictedAsClassified = i < 2 || (i === 2 && !!predictedTeam);

    let pointsAwarded = 0;
    let reason: string;
    let isExact = false;

    if (predictedTeam && predictedTeam === actualTeamAtPosition) {
      points += SCORING_POINTS.EXACT_POSITION;
      pointsAwarded = SCORING_POINTS.EXACT_POSITION;
      exactMatches++;
      isExact = true;
      reason = 'EXACT — predicted team matches actual position';
    } else if (isPredictedAsClassified && isActuallyClassified) {
      points += SCORING_POINTS.QUALIFIED;
      pointsAwarded = SCORING_POINTS.QUALIFIED;
      wrongPositionMatches++;
      reason = `QUALIFIED — predicted in top 3 (pos ${i + 1}) AND actually classified, but wrong position`;
    } else if (!isActuallyClassified) {
      reason = `NOT CLASSIFIED — predicted team finished outside top qualifiers`;
    } else if (!isPredictedAsClassified) {
      reason = `NOT PREDICTED — team not in predictor's top 3`;
    } else {
      reason = `NO POINTS — no matching condition`;
    }

    if (isActuallyClassified) exactQualified++;

    breakdown.push({
      position: i + 1,
      predicted: predictedTeam || '(empty)',
      actual: actualTeamAtPosition,
      isExact,
      isActuallyClassified,
      isPredictedAsClassified,
      pointsAwarded,
      reason,
    });
  }

  return { points, exactMatches, wrongPositionMatches, exactQualified, breakdown };
}

export function computeClassifiedTeamIds(
  positions: string[],
  top8ThirdPlaceTeamIds: Set<string>,
): string[] {
  const upper = (positions || []).map((p) => p.toUpperCase());
  const classified: string[] = [];
  if (upper[0]) classified.push(upper[0]);
  if (upper[1]) classified.push(upper[1]);
  if (upper[2] && top8ThirdPlaceTeamIds.has(upper[2])) classified.push(upper[2]);
  return classified;
}

export function buildCompleteActualClassifiedSet(
  allGroupStandings: AllGroupStandings,
  top8ThirdPlaceTeamIds: Set<string>,
): { set: Set<string>; byGroup: Record<string, string[]> } {
  const set = new Set<string>();
  const byGroup: Record<string, string[]> = {};
  for (const [gid, st] of Object.entries(allGroupStandings)) {
    if (!st || st.length < 2) continue;
    byGroup[gid] = [st[0].teamId.toUpperCase(), st[1].teamId.toUpperCase()];
    set.add(byGroup[gid][0]);
    set.add(byGroup[gid][1]);
  }
  for (const t of top8ThirdPlaceTeamIds) set.add(t);
  return { set, byGroup };
}
