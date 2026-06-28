import type { TeamStanding } from '@app-types/firestore';
import type { Locale } from '@utils/i18n';

/**
 * Baked (build-time, immutable after the deadline) predictions for the
 * non-match bet types. Joined client-side with live results to color them.
 */
export interface PredictedGroup {
  groupId: string;
  /** Predicted finishing order as team IDs (index 0 = 1st place). */
  positions: string[];
}

export interface PredictedFinalPhase {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

export interface PredictedBestPlayers {
  bestScorer: string;
  bestGoalkeeper: string;
}

/** Live results used to color the predictions. Empty until matches resolve. */
export interface PredictionResults {
  /** teamId (lowercase) → FIFA code, for flags. */
  teams: Map<string, string>;
  /** groupId → actual standings (with points, goal diff, etc.). Absent until the group ends. */
  groupStandings: Map<string, TeamStanding[]>;
  /** groupId → raw group name. */
  groupNames: Map<string, string>;
  finalStandings: PredictedFinalPhase | null;
  bestPlayers: { topScorer: string; bestGoalkeeper: string } | null;
  /** groupId → whether 1st/2nd positions are finalized for that group. */
  groupPointsCalculated: Map<string, boolean>;
  /** Whether top-8 third-place teams are finalized (all groups finished). */
  isThirdPlaceDecided: boolean;
}

// ── Display views (what RankingRow renders) ────────────────────────────────

export interface PredictedTeamCell {
  fifaCode: string;
  /** 1-based finishing slot. */
  position: number;
  /** true = exact slot correct, 'partial' = qualified but wrong slot, false = wrong/missed, null = no result yet. */
  correct: boolean | 'partial' | null;
}

export interface GroupPredictionView {
  groupId: string;
  label: string;
  teams: PredictedTeamCell[];
  finished: boolean;
}

export interface FinalPhasePredictionView {
  positions: PredictedTeamCell[];
}

export interface BestPlayerCell {
  name: string;
  correct: boolean | null;
}

export interface BestPlayersPredictionView {
  scorer: BestPlayerCell;
  goalkeeper: BestPlayerCell;
}

function fifaCodeOf(teamId: string, teams: Map<string, string>): string {
  return teams.get(teamId.toLowerCase()) ?? teamId.toUpperCase();
}

function localizeGroupName(name: string, locale: Locale): string {
  return locale === 'es' ? name.replace(/^Group\b/i, 'Grupo') : name;
}

/**
 * Mirror of the server's best-player name normalization
 * (functions/src/calculateBestPlayerResults.ts): lowercase, trim, strip
 * diacritics, drop non-alphanumerics except spaces. Keep these in sync.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks
    .replace(/[^a-z0-9\s]/g, ''); // strip non-alphanumeric except spaces
}

/**
 * Mirror of the server's `fuzzyMatch`: true when either normalized name contains
 * the other, or when their surnames (last word, > 2 chars) match exactly. Kept
 * in sync so the displayed correctness matches how points were actually scored.
 */
function fuzzyMatch(predicted: string, actual: string): boolean {
  const normalizedPredicted = normalizeName(predicted);
  const normalizedActual = normalizeName(actual);

  if (!normalizedPredicted || !normalizedActual) return false;

  if (
    normalizedPredicted.includes(normalizedActual) ||
    normalizedActual.includes(normalizedPredicted)
  ) {
    return true;
  }

  const predictedWords = normalizedPredicted.split(/\s+/).filter(Boolean);
  const actualWords = normalizedActual.split(/\s+/).filter(Boolean);
  const predictedSurname = predictedWords[predictedWords.length - 1];
  const actualSurname = actualWords[actualWords.length - 1];

  return (
    !!predictedSurname &&
    !!actualSurname &&
    predictedSurname.length > 2 &&
    predictedSurname === actualSurname
  );
}

/**
 * Build the group-stage prediction views. Each team cell is correct when the
 * predicted team occupies that exact slot in the actual standings; `partial`
 * when the team qualified (top 2 or best 8 third-place) but in the wrong slot;
 * `null` until the group's standings exist.
 */
export function buildGroupPredictions(
  predicted: PredictedGroup[],
  results: PredictionResults,
  locale: Locale,
): GroupPredictionView[] {
  const qualifiedThirdPlace = computeBest8ThirdPlace(results.groupStandings);
  return [...predicted]
    .sort((a, b) => a.groupId.localeCompare(b.groupId))
    .map((group) => {
      const actual = results.groupStandings.get(group.groupId);
      const pointsCalculated = results.groupPointsCalculated.get(group.groupId) ?? false;
      return {
        groupId: group.groupId,
        label: localizeGroupName(results.groupNames.get(group.groupId) ?? group.groupId, locale),
        finished: pointsCalculated,
        teams: group.positions.map((teamId, i) => ({
          fifaCode: fifaCodeOf(teamId, results.teams),
          position: i + 1,
          correct: computeGroupCellCorrect(
            teamId,
            i,
            actual!,
            qualifiedThirdPlace,
            pointsCalculated,
            results.isThirdPlaceDecided,
          ),
        })),
      };
    });
}

/** Number of qualifying positions per group (top 2 advance to knockout). */
const QUALIFYING_SIZE = 2;
/** Number of best third-place teams that qualify. */
const THIRD_PLACE_QUALIFY_SIZE = 8;

function computeBest8ThirdPlace(groupStandings: Map<string, TeamStanding[]>): Set<string> {
  const thirdPlaceRecords: Array<{
    teamId: string;
    points: number;
    goalDifference: number;
    goalsFor: number;
  }> = [];

  for (const standings of groupStandings.values()) {
    if (standings.length >= 3 && standings[2]) {
      const third = standings[2];
      thirdPlaceRecords.push({
        teamId: third.teamId,
        points: third.points ?? 0,
        goalDifference: third.goalDifference ?? 0,
        goalsFor: third.goalsFor ?? 0,
      });
    }
  }

  thirdPlaceRecords.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return new Set(
    thirdPlaceRecords.slice(0, THIRD_PLACE_QUALIFY_SIZE).map((r) => r.teamId.toUpperCase()),
  );
}

function computeGroupCellCorrect(
  teamId: string,
  predictedIndex: number,
  actual: TeamStanding[],
  qualifiedThirdPlace: Set<string>,
  pointsCalculated: boolean,
  isThirdPlaceDecided: boolean,
): boolean | 'partial' | null {
  if (!actual) return null;
  const teamStanding = actual.find((s) => s.teamId.toLowerCase() === teamId.toLowerCase());
  if (!teamStanding) return false;
  const actualIndex = actual.indexOf(teamStanding);
  if (actualIndex === -1) return false;

  // 1st and 2nd positions: colors only when pointsCalculated
  if (predictedIndex < QUALIFYING_SIZE) {
    if (!pointsCalculated) return null;
    if (actualIndex === predictedIndex) return true;
    // Team is in a qualifying position but wrong slot
    if (actualIndex < QUALIFYING_SIZE) return 'partial';
    // Team is 3rd but might qualify via best-8-thirds - only color when third place is decided
    if (qualifiedThirdPlace.has(teamStanding.teamId.toUpperCase())) {
      return isThirdPlaceDecided ? 'partial' : null;
    }
    return false;
  }
  // 3rd position: points are only awarded when the actual team classified
  // (i.e. finished 3rd AND made the top-8-thirds). Coloring is gated on
  // isThirdPlaceDecided so we don't reveal a not-yet-final result.
  if (predictedIndex === 2) {
    if (!isThirdPlaceDecided) return null;
    if (actualIndex === predictedIndex) {
      return qualifiedThirdPlace.has(teamStanding.teamId.toUpperCase()) ? true : false;
    }
    if (actualIndex < QUALIFYING_SIZE) return 'partial';
    return false;
  }
  // 4th position: never colored (no points for 4th place)
  if (predictedIndex === 3) {
    return null;
  }
  return null;
}

/**
 * Build the final-four prediction view. Each slot is correct when the predicted
 * team matches the actual team in that exact slot; `null` until final standings
 * exist.
 */
export function buildFinalPhasePrediction(
  predicted: PredictedFinalPhase | null | undefined,
  results: PredictionResults,
): FinalPhasePredictionView | null {
  if (!predicted) return null;
  const actual = results.finalStandings;
  const slots: Array<keyof PredictedFinalPhase> = ['first', 'second', 'third', 'fourth'];
  return {
    positions: slots.map((slot, i) => ({
      fifaCode: fifaCodeOf(predicted[slot], results.teams),
      position: i + 1,
      correct: actual ? actual[slot]?.toLowerCase() === predicted[slot]?.toLowerCase() : null,
    })),
  };
}

/**
 * Build the best-players prediction view. Each pick is correct on the same
 * fuzzy name match the server uses to award points; `null` until the result is
 * published.
 */
export function buildBestPlayersPrediction(
  predicted: PredictedBestPlayers | null | undefined,
  results: PredictionResults,
): BestPlayersPredictionView | null {
  if (!predicted) return null;
  const actual = results.bestPlayers;
  return {
    scorer: {
      name: predicted.bestScorer,
      correct: actual ? fuzzyMatch(predicted.bestScorer, actual.topScorer) : null,
    },
    goalkeeper: {
      name: predicted.bestGoalkeeper,
      correct: actual ? fuzzyMatch(predicted.bestGoalkeeper, actual.bestGoalkeeper) : null,
    },
  };
}
