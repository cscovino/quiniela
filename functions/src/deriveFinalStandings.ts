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
    const before = change.before.data() as MatchData;
    const after = change.after.data() as MatchData;
    const tournamentId = context.params.tournamentId;
    const matchId = context.params.matchId;

    functions.logger.log(
      `[deriveFinalStandings] Triggered: tournament=${tournamentId}, match=${matchId}, slug=${after.slug}, status=${after.status}, beforeStatus=${before.status}`,
    );

    // Slug filter: only process 'final' or 'third-place' matches
    if (after.slug !== 'final' && after.slug !== 'third-place') {
      functions.logger.log(
        `[deriveFinalStandings] Match ${matchId} slug='${after.slug}' not final/third-place — skipping`,
      );
      return null;
    }

    // Status guard: only proceed when match is finished
    if (after.status !== 'finished') {
      functions.logger.log(
        `[deriveFinalStandings] Match ${matchId} status='${after.status}' not finished — skipping`,
      );
      return null;
    }

    // Match-result guard: skip if already scored
    if (after.pointsCalculated) {
      functions.logger.log(`[deriveFinalStandings] Match ${matchId} already scored — skipping`);
      return null;
    }

    const isThirdPlace = after.slug === 'third-place';
    const otherSlug = isThirdPlace ? 'final' : 'third-place';

    // Determine winner/loser from result
    if (after.result.home === null || after.result.away === null) {
      functions.logger.error(`[deriveFinalStandings] Match ${matchId} finished but result is null`);
      return null;
    }

    const homeWin = after.result.home > after.result.away;
    const winnerTeamId = homeWin ? after.homeTeamId : after.awayTeamId;
    const loserTeamId = homeWin ? after.awayTeamId : after.homeTeamId;

    functions.logger.log(
      `[deriveFinalStandings] ${after.slug} finished: winner=${winnerTeamId}, loser=${loserTeamId}`,
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
      updateData.third = winnerTeamId as string;
      updateData.fourth = loserTeamId as string;
      functions.logger.log(
        `[deriveFinalStandings] Writing third=${winnerTeamId}, fourth=${loserTeamId}`,
      );
    } else {
      updateData.first = winnerTeamId as string;
      updateData.second = loserTeamId as string;
      functions.logger.log(
        `[deriveFinalStandings] Writing first=${winnerTeamId}, second=${loserTeamId}`,
      );
    }

    // Check if the other match is also finished (for complete first/second or third/fourth)
    let otherMatchFinished = false;
    if (!otherMatchSnapshot.empty) {
      const otherMatchData = otherMatchSnapshot.docs[0].data() as MatchData;
      otherMatchFinished = otherMatchData.status === 'finished';
      functions.logger.log(
        `[deriveFinalStandings] Other match (${otherSlug}) status: ${otherMatchData.status}, finished=${otherMatchFinished}`,
      );
    } else {
      functions.logger.log(`[deriveFinalStandings] No other match found with slug=${otherSlug}`);
    }

    // Write to final_standings/final with merge: true
    const finalStandingsRef = db
      .collection(`tournaments/${tournamentId}/final_standings`)
      .doc('final');

    await finalStandingsRef.set(updateData, { merge: true });
    functions.logger.log(
      `[deriveFinalStandings] Wrote to final_standings/final: ${JSON.stringify(updateData)} (otherMatchFinished=${otherMatchFinished})`,
    );

    return null;
  });
