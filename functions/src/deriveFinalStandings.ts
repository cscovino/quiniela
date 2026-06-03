import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

const db = admin.firestore();

// -- Types --

interface MatchData {
  slug: string;
  status: string;
  pointsCalculated?: boolean;
  homeTeamId: string | null;
  awayTeamId: string | null;
  result: { home: number | null; away: number | null };
}

interface FinalStandingsData {
  tournamentId: string;
  first?: string;
  second?: string;
  third?: string;
  fourth?: string;
  pointsCalculated?: boolean;
}

// -- Cloud Function --

/**
 * Derives actual final standings (1st/2nd/3rd/4th) from match results and writes
 * them to tournaments/{tournamentId}/final_standings/final incrementally.
 *
 * Trigger: onWrite on tournaments/{tournamentId}/matches/{matchId}
 * Slug filter: only 'final' and 'third-place' matches trigger processing
 * Status guard: only proceed when match status === 'finished'
 * Points guard: skip if pointsCalculated is true
 *
 * Incremental write logic:
 * - third-place match finished → write third (winner) and fourth (loser)
 * - final match finished → write first (winner) and second (loser)
 * - Only write first/second when both final AND third-place are finished
 * - Only write third/fourth when third-place is finished
 */
export const deriveFinalStandings = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data() as MatchData;
    const tournamentId = context.params.tournamentId;
    const matchId = context.params.matchId;

    // Slug filter: only process 'final' or 'third-place' matches
    if (after.slug !== 'final' && after.slug !== 'third-place') {
      return null;
    }

    // Status guard: only proceed when match is finished
    if (after.status !== 'finished') {
      return null;
    }

    // Match-result guard: skip if already scored
    if (after.pointsCalculated) {
      functions.logger.log(`Match ${matchId} already scored — skipping deriveFinalStandings`);
      return null;
    }

    const isThirdPlace = after.slug === 'third-place';
    const otherSlug = isThirdPlace ? 'final' : 'third-place';

    // Determine winner/loser from result
    if (after.result.home === null || after.result.away === null) {
      functions.logger.error(`Match ${matchId} finished but result is null`);
      return null;
    }

    const homeWin = after.result.home > after.result.away;
    const winnerTeamId = homeWin ? after.homeTeamId : after.awayTeamId;
    const loserTeamId = homeWin ? after.awayTeamId : after.homeTeamId;

    functions.logger.log(
      `deriveFinalStandings: ${after.slug} finished — winner: ${winnerTeamId}, loser: ${loserTeamId}`,
    );

    // Query for the other match (final or third-place)
    const otherMatchSnapshot = await db
      .collection(`tournaments/${tournamentId}/matches`)
      .where('slug', '==', otherSlug)
      .limit(1)
      .get();

    // Build the update object incrementally
    const updateData: FinalStandingsData = { tournamentId };

    if (isThirdPlace) {
      // third-place match: winner = 3rd, loser = 4th
      updateData.third = winnerTeamId as string;
      updateData.fourth = loserTeamId as string;
      functions.logger.log(`Writing third=${winnerTeamId}, fourth=${loserTeamId}`);
    } else {
      // final match: winner = 1st, loser = 2nd
      updateData.first = winnerTeamId as string;
      updateData.second = loserTeamId as string;
      functions.logger.log(`Writing first=${winnerTeamId}, second=${loserTeamId}`);
    }

    // Check if the other match is also finished (for complete first/second or third/fourth)
    let otherMatchFinished = false;
    if (!otherMatchSnapshot.empty) {
      const otherMatchData = otherMatchSnapshot.docs[0].data() as MatchData;
      otherMatchFinished = otherMatchData.status === 'finished';
      functions.logger.log(`Other match (${otherSlug}) status: ${otherMatchData.status}`);
    }

    // Write to final_standings/final with merge: true
    const finalStandingsRef = db
      .collection(`tournaments/${tournamentId}/final_standings`)
      .doc('final');

    await finalStandingsRef.set(updateData, { merge: true });
    functions.logger.log(
      `Wrote to final_standings/final: ${JSON.stringify(updateData)} (other match finished: ${otherMatchFinished})`,
    );

    return null;
  });
