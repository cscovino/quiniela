import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';

import {
  diffResolution,
  type GroupStandingsData,
  type MatchResult,
  resolveAllBrackets,
} from './resolver';

const db = admin.firestore();

interface MatchData {
  slug: string;
  phase: string;
  groupId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  result: { home: number | null; away: number | null };
  penaltyResult?: { home: number; away: number } | null;
  status: string;
  pointsCalculated?: boolean;
}

interface GroupStandingsDoc extends GroupStandingsData {
  groupId: string;
  standings: MatchData extends never ? never : GroupStandingsData['standings'];
}

async function loadGroupStandings(tournamentId: string): Promise<GroupStandingsData[]> {
  const snap = await db.collection(`tournaments/${tournamentId}/group_standings`).get();
  return snap.docs.map((doc) => {
    const data = doc.data() as GroupStandingsDoc;
    return { groupId: data.groupId, standings: data.standings };
  });
}

async function loadMatches(tournamentId: string): Promise<MatchResult[]> {
  const snap = await db.collection(`tournaments/${tournamentId}/matches`).get();
  return snap.docs.map((doc) => {
    const data = doc.data() as MatchData;
    return {
      slug: data.slug,
      status: data.status,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      result: data.result,
      penaltyResult:
        (data as MatchData & { penaltyResult?: { home: number; away: number } | null })
          .penaltyResult ?? null,
    };
  });
}

export const resolveKnockoutMatches = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (_change, context) => {
    const tournamentId = context.params.tournamentId;

    functions.logger.log(`resolveKnockoutMatches: triggered for ${tournamentId}`);

    const [groupStandings, matches] = await Promise.all([
      loadGroupStandings(tournamentId),
      loadMatches(tournamentId),
    ]);

    const resolution = resolveAllBrackets(groupStandings, matches);

    if (resolution.resolved.length === 0) {
      functions.logger.log('No knockout matches resolvable yet');
      return null;
    }

    const currentMap = new Map<string, { homeTeamId: string | null; awayTeamId: string | null }>();
    for (const m of matches) {
      currentMap.set(m.slug, { homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId });
    }
    const changes = diffResolution(currentMap, resolution);

    if (changes.length === 0) {
      functions.logger.log('No new changes to apply');
      return null;
    }

    const batch = db.batch();
    for (const change of changes) {
      const ref = db.collection(`tournaments/${tournamentId}/matches`).doc(change.slug);
      const update: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (change.homeTeamId !== null) {
        update.homeTeamId = change.homeTeamId;
        update.tbdHome = FieldValue.delete();
      }
      if (change.awayTeamId !== null) {
        update.awayTeamId = change.awayTeamId;
        update.tbdAway = FieldValue.delete();
      }
      const hasAnySide = change.homeTeamId !== null || change.awayTeamId !== null;
      if (hasAnySide) update.tbd = false;
      batch.update(ref, update);
      functions.logger.log(
        `Resolved ${change.slug}: ${change.homeTeamId ?? 'TBD'} vs ${change.awayTeamId ?? 'TBD'}`,
      );
    }

    await batch.commit();
    functions.logger.log(`Applied ${changes.length} knockout match resolution(s)`);

    return null;
  });
