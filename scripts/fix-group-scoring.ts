/**
 * Fix group betting scores by recalculating and updating from standings.
 *
 * Usage:
 *   pnpm fix:group-scoring                    # Dry run (default)
 *   pnpm fix:group-scoring --execute          # Apply fixes to production
 *   pnpm fix:group-scoring -- <predictorId>   # Fix specific predictor (dry run)
 *   pnpm fix:group-scoring --execute -- <predictorId>  # Fix specific predictor
 *
 * Examples:
 *   pnpm fix:group-scoring                    # Dry run all bets
 *   pnpm fix:group-scoring --execute          # Apply all fixes
 *   pnpm fix:group-scoring -- SWH4KUSREbQ8sDJPWO5T8r3jrHy1-1781042690042  # Single predictor dry run
 *   pnpm fix:group-scoring --execute -- SWH4KUSREbQ8sDJPWO5T8r3jrHy1-1781042690042  # Single predictor fix
 */

import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const TOURNAMENT_ID = 'world-cup-2026';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
const DRY_RUN = !IS_EMULATOR && !process.argv.includes('--execute');

const QUALIFYING_SIZE = 2;
const THIRD_PLACE_QUALIFY_SIZE = 8;

interface TeamStanding {
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

interface GroupStandingsData {
  groupId: string;
  lastUpdated: admin.firestore.Timestamp;
  standings: TeamStanding[];
  pointsCalculated?: boolean;
}

interface GroupBetData {
  userId: string;
  predictorId: string;
  groupId: string;
  positions: string[];
  points: number;
  exactQualified?: number;
  thirdPlaceScored?: boolean;
  scoredAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface AllGroupStandings {
  [groupId: string]: TeamStanding[];
}

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-quiniela';
    console.log(`Connected to Firebase Emulator (${process.env.FIRESTORE_EMULATOR_HOST})`);
    return admin.initializeApp({ projectId });
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  console.warn(
    'WARNING: FIREBASE_SERVICE_ACCOUNT not set — falling back to Application Default Credentials.',
  );
  return admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore(initAdmin());

function getTop8ThirdPlaceTeamIds(allGroupStandings: AllGroupStandings): Set<string> {
  const thirdPlaceRecords: Array<{
    teamId: string;
    points: number;
    goalDifference: number;
    goalsFor: number;
  }> = [];

  for (const standings of Object.values(allGroupStandings)) {
    if (standings.length < 3) continue;
    const third = standings[2];
    if (!third) continue;
    thirdPlaceRecords.push({
      teamId: third.teamId,
      points: third.points ?? 0,
      goalDifference: third.goalDifference ?? 0,
      goalsFor: third.goalsFor ?? 0,
    });
  }

  thirdPlaceRecords.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const top8 = new Set<string>();
  for (let i = 0; i < Math.min(THIRD_PLACE_QUALIFY_SIZE, thirdPlaceRecords.length); i++) {
    top8.add(thirdPlaceRecords[i].teamId.toUpperCase());
  }
  return top8;
}

type ScoringPhase = 'positions-1-and-2' | 'position-3' | 'all';

const SCORING = {
  GROUP: {
    EXACT_POSITION: 3,
    QUALIFIED: 1,
  },
} as const;

function scoreGroupBet(
  positions: string[],
  standings: TeamStanding[],
  phase: ScoringPhase = 'all',
  allGroupStandings?: AllGroupStandings,
): { points: number; exactMatches: number; wrongPositionMatches: number; exactQualified: number } {
  let points = 0;
  let exactMatches = 0;
  let wrongPositionMatches = 0;
  let exactQualified = 0;

  const qualifiedTeamIds = new Set<string>();

  if (phase === 'positions-1-and-2') {
    qualifiedTeamIds.add(standings[0]?.teamId?.toUpperCase() ?? '');
    qualifiedTeamIds.add(standings[1]?.teamId?.toUpperCase() ?? '');
  } else {
    qualifiedTeamIds.add(standings[0]?.teamId?.toUpperCase() ?? '');
    qualifiedTeamIds.add(standings[1]?.teamId?.toUpperCase() ?? '');
    if (allGroupStandings) {
      const top8Third = getTop8ThirdPlaceTeamIds(allGroupStandings);
      for (const teamId of top8Third) {
        qualifiedTeamIds.add(teamId);
      }
    } else {
      qualifiedTeamIds.add(standings[2]?.teamId?.toUpperCase() ?? '');
    }
  }

  const maxPosition = phase === 'positions-1-and-2' ? 2 : 3;

  for (let i = 0; i < positions.length && i < maxPosition; i++) {
    const predictedTeam = positions[i];
    const actualTeamAtPosition = standings[i]?.teamId;

    if (predictedTeam?.toUpperCase() === actualTeamAtPosition?.toUpperCase()) {
      points += SCORING.GROUP.EXACT_POSITION;
      exactMatches++;
    } else if (
      i < 2 &&
      actualTeamAtPosition &&
      standings.some((s) => s.teamId?.toUpperCase() === predictedTeam?.toUpperCase())
    ) {
      points += SCORING.GROUP.QUALIFIED;
      wrongPositionMatches++;
    } else if (i === 2 && qualifiedTeamIds.has(predictedTeam?.toUpperCase())) {
      if (
        actualTeamAtPosition &&
        standings.some((s) => s.teamId?.toUpperCase() === predictedTeam?.toUpperCase())
      ) {
        points += SCORING.GROUP.QUALIFIED;
        wrongPositionMatches++;
      }
    }
    if (qualifiedTeamIds.has(predictedTeam?.toUpperCase())) {
      exactQualified++;
    }
  }

  return { points, exactMatches, wrongPositionMatches, exactQualified };
}

interface FixCandidate {
  betId: string;
  predictorId: string;
  userId: string;
  groupId: string;
  storedPoints: number;
  storedExactQualified: number;
  expectedPoints: number;
  expectedExactQualified: number;
}

async function getFixCandidates(predictorId?: string): Promise<FixCandidate[]> {
  console.log('Fetching group standings...\n');
  const standingsSnap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).get();

  const allGroupStandings: AllGroupStandings = {};

  for (const doc of standingsSnap.docs) {
    const data = doc.data() as GroupStandingsData;
    const groupId = data.groupId ?? doc.id;
    if (data.standings && data.standings.length > 0) {
      allGroupStandings[groupId] = data.standings;
    }
  }

  const allGroupsFinished = standingsSnap.docs.every(
    (d) => (d.data() as GroupStandingsData).pointsCalculated === true,
  );

  console.log(`Groups: ${standingsSnap.docs.length}`);
  console.log(`All groups finished: ${allGroupsFinished}\n`);

  console.log('Fetching group bets...\n');
  let betsRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(`tournaments/${TOURNAMENT_ID}/group_bets`);
  if (predictorId) {
    betsRef = betsRef.where('predictorId', '==', predictorId);
    console.log(`Filtering by predictor: ${predictorId}\n`);
  }
  const betsSnap = await betsRef.get();

  if (betsSnap.empty) {
    console.log('No group bets found');
    return [];
  }

  console.log(`Found ${betsSnap.size} group bet(s)\n`);
  const candidates: FixCandidate[] = [];

  for (const betDoc of betsSnap.docs) {
    const bet = betDoc.data() as GroupBetData;
    const { groupId, positions, predictorId, userId } = bet;

    const standings = allGroupStandings[groupId];
    if (!standings || standings.length === 0) {
      console.warn(`⚠️  Skipping bet ${betDoc.id}: no standings for group ${groupId}`);
      continue;
    }

    const phase1 = scoreGroupBet(positions, standings, 'positions-1-and-2');
    const fullScore = scoreGroupBet(positions, standings, 'all', allGroupStandings);

    const storedPoints = bet.points ?? 0;
    const storedExactQualified = bet.exactQualified ?? 0;

    let expectedPoints: number;
    let expectedExactQualified: number;

    if (allGroupsFinished) {
      expectedPoints = fullScore.points;
      expectedExactQualified = fullScore.exactQualified;
    } else {
      expectedPoints = phase1.points;
      expectedExactQualified = phase1.exactQualified;
    }

    if (expectedPoints !== storedPoints || expectedExactQualified !== storedExactQualified) {
      candidates.push({
        betId: betDoc.id,
        predictorId,
        userId,
        groupId,
        storedPoints,
        storedExactQualified,
        expectedPoints,
        expectedExactQualified,
      });
    }
  }

  return candidates;
}

async function recomputePredictorTotals(userId: string, predictorId: string): Promise<void> {
  const statsRef = db.doc(`tournaments/${TOURNAMENT_ID}/predictors/${predictorId}/stats/global`);
  const betsSnap = await db
    .collection(`tournaments/${TOURNAMENT_ID}/group_bets`)
    .where('predictorId', '==', predictorId)
    .get();

  let groupPoints = 0;
  let groupQualified = 0;

  for (const doc of betsSnap.docs) {
    const data = doc.data();
    groupPoints += data.points ?? 0;
    groupQualified += data.exactQualified ?? 0;
  }

  await statsRef.update({
    groupPoints,
    groupQualified,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function applyFixes(candidates: FixCandidate[]): Promise<{ updated: number; errors: number }> {
  if (DRY_RUN) {
    console.log(`[dry-run] Would update ${candidates.length} bets`);
  }

  let updated = 0;
  let errors = 0;
  const batchSize = 100;

  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = db.batch();
    const batchCandidates = candidates.slice(i, i + batchSize);

    for (const candidate of batchCandidates) {
      const betRef = db.doc(`tournaments/${TOURNAMENT_ID}/group_bets/${candidate.betId}`);
      batch.update(betRef, {
        points: candidate.expectedPoints,
        exactQualified: candidate.expectedExactQualified,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    if (DRY_RUN) {
      console.log(`[dry-run] Batch ${Math.floor(i / batchSize) + 1}: would update ${batchCandidates.length} bets`);
    } else {
      try {
        await batch.commit();
        updated += batchCandidates.length;
        console.log(`Updated batch ${Math.floor(i / batchSize) + 1}: ${batchCandidates.length} bets`);
      } catch (err) {
        console.error(`Error updating batch ${Math.floor(i / batchSize) + 1}:`, err);
        errors += batchCandidates.length;
      }
    }
  }

  return { updated, errors };
}

function parseArgs(): { predictorId?: string } {
  const args = process.argv.slice(2);
  const predictorId = args.find((a) => !a.startsWith('--')) ?? undefined;
  return { predictorId };
}

async function main() {
  const { predictorId } = parseArgs();

  if (predictorId) {
    console.log(`Fixing bets for predictor: ${predictorId}\n`);
  }

  if (DRY_RUN) {
    console.log(
      '*** DRY RUN — no writes will be made. Re-run with --execute (and real ' +
        'credentials) or USE_FIREBASE_EMULATOR=true to apply changes. ***\n',
    );
  } else if (!IS_EMULATOR) {
    console.log('*** EXECUTE MODE against PRODUCTION Firestore — writes WILL be made. ***\n');
  }

  const candidates = await getFixCandidates(predictorId);

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log('FIX SUMMARY');
  console.log(`Total bets to fix: ${candidates.length}`);
  console.log('═══════════════════════════════════════════════════════════════════════');

  if (candidates.length === 0) {
    console.log('\nNo fixes needed.');
    return;
  }

  const byGroup = new Map<string, FixCandidate[]>();
  for (const c of candidates) {
    const list = byGroup.get(c.groupId) ?? [];
    list.push(c);
    byGroup.set(c.groupId, list);
  }

  console.log('\nBy group:');
  for (const [groupId, bets] of [...byGroup.entries()].sort()) {
    const totalDiff = bets.reduce((sum, c) => sum + (c.expectedPoints - c.storedPoints), 0);
    console.log(`  ${groupId}: ${bets.length} bets, total points diff: ${totalDiff >= 0 ? '+' : ''}${totalDiff}`);
  }

  console.log('\nSample fixes (first 10):');
  for (const c of candidates.slice(0, 10)) {
    const diff = c.expectedPoints - c.storedPoints;
    console.log(`  ${c.betId} (${c.groupId}): ${c.storedPoints} → ${c.expectedPoints} (${diff >= 0 ? '+' : ''}${diff})`);
  }

  if (candidates.length > 10) {
    console.log(`  ... and ${candidates.length - 10} more`);
  }

  if (!DRY_RUN) {
    console.log('\n\nApplying fixes...\n');
    const { updated, errors } = await applyFixes(candidates);
    console.log(`\nFixes applied: ${updated}, errors: ${errors}`);

    if (updated > 0) {
      console.log('\nRecomputing predictor totals...\n');

      const predictorIds = [...new Set(candidates.map(c => c.predictorId))];
      for (const predictorId of predictorIds) {
        const firstCandidate = candidates.find(c => c.predictorId === predictorId);
        if (firstCandidate) {
          try {
            await recomputePredictorTotals(firstCandidate.userId, predictorId);
            console.log(`Recomputed totals for predictor ${predictorId}`);
          } catch (err) {
            console.error(`Error recomputing totals for predictor ${predictorId}:`, err);
          }
        }
      }
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fix failed:', err);
  process.exit(1);
});
