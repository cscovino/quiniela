/**
 * Audit group betting scores.
 *
 * Usage:
 *   pnpm audit:group-scoring                   # Audit all bets
 *   pnpm audit:group-scoring -- <predictorId>  # Audit specific predictor
 *
 * Examples:
 *   pnpm audit:group-scoring
 *   pnpm audit:group-scoring -- SWH4KUSREbQ8sDJPWO5T8r3jrHy1-1781042690042
 */

import admin from 'firebase-admin';

const TOURNAMENT_ID = 'world-cup-2026';
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

  if (process.env.USE_FIREBASE_EMULATOR === 'true') {
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

export interface AuditResult {
  betId: string;
  predictorId: string;
  userId: string;
  groupId: string;
  storedPoints: number;
  storedExactQualified: number;
  expectedPoints: number;
  expectedExactQualified: number;
  phase1Points: number;
  phase1ExactQualified: number;
  phase3Points: number;
  phase3ExactQualified: number;
  predictedPositions: string[];
  actualStandings: TeamStanding[];
  qualifiedThirdPlace: Set<string>;
  teamQualificationStatus: Record<string, { predictedPos: number; actualPos: number | null; qualified: boolean; qualifiedVia: string | null }>;
  discrepancy: 'points' | 'exactQualified' | 'none';
  groupPointsCalculated: boolean;
}

export async function auditGroupBets(predictorId?: string): Promise<AuditResult[]> {
  console.log('Fetching group standings...\n');
  const standingsSnap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).get();

  const allGroupStandings: AllGroupStandings = {};
  const groupPointsCalculatedMap = new Map<string, boolean>();

  for (const doc of standingsSnap.docs) {
    const data = doc.data() as GroupStandingsData;
    const groupId = data.groupId ?? doc.id;
    if (data.standings && data.standings.length > 0) {
      allGroupStandings[groupId] = data.standings;
    }
    groupPointsCalculatedMap.set(groupId, data.pointsCalculated ?? false);
  }

  const qualifiedThirdPlace = getTop8ThirdPlaceTeamIds(allGroupStandings);
  const allGroupsFinished = standingsSnap.docs.every(
    (d) => (d.data() as GroupStandingsData).pointsCalculated === true,
  );

  console.log(`Groups: ${standingsSnap.docs.length}`);
  console.log(`All groups finished: ${allGroupsFinished}`);
  console.log(`Qualified 3rd place teams: ${[...qualifiedThirdPlace].sort().join(', ')}\n`);

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

  const results: AuditResult[] = [];

  for (const betDoc of betsSnap.docs) {
    const bet = betDoc.data() as GroupBetData;
    const { groupId, positions, predictorId, userId } = bet;

    const standings = allGroupStandings[groupId];
    const groupFinished = groupPointsCalculatedMap.get(groupId) ?? false;

    if (!standings || standings.length === 0) {
      console.warn(`⚠️  Skipping bet ${betDoc.id}: no standings for group ${groupId}`);
      continue;
    }

    const phase1 = scoreGroupBet(positions, standings, 'positions-1-and-2');
    const phase3 = scoreGroupBet(positions, standings, 'position-3', allGroupStandings);
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

    let discrepancy: AuditResult['discrepancy'] = 'none';
    if (expectedPoints !== storedPoints) discrepancy = 'points';
    else if (expectedExactQualified !== storedExactQualified) discrepancy = 'exactQualified';

    const teamQualificationStatus: AuditResult['teamQualificationStatus'] = {};
    for (let i = 0; i < positions.length && i < 3; i++) {
      const teamId = positions[i].toUpperCase();
      const actualStanding = standings.find(s => s.teamId?.toUpperCase() === teamId);
      const actualPos = actualStanding ? standings.indexOf(actualStanding) : null;
      const qualifiedVia = qualifiedThirdPlace.has(teamId) ? 'third-place' :
                          (actualPos !== null && actualPos < QUALIFYING_SIZE) ? 'top-2' : null;

      teamQualificationStatus[teamId] = {
        predictedPos: i + 1,
        actualPos: actualPos !== null ? actualPos + 1 : null,
        qualified: qualifiedVia !== null,
        qualifiedVia,
      };
    }

    results.push({
      betId: betDoc.id,
      predictorId,
      userId,
      groupId,
      storedPoints,
      storedExactQualified,
      expectedPoints,
      expectedExactQualified,
      phase1Points: phase1.points,
      phase1ExactQualified: phase1.exactQualified,
      phase3Points: phase3.points,
      phase3ExactQualified: phase3.exactQualified,
      predictedPositions: positions,
      actualStandings: standings,
      qualifiedThirdPlace,
      teamQualificationStatus,
      discrepancy,
      groupPointsCalculated: groupFinished,
    });
  }

  return results;
}

export function printResult(result: AuditResult, showDetails = true): void {
  const { betId, predictorId, groupId, storedPoints, storedExactQualified, expectedPoints, expectedExactQualified,
    phase1Points, phase1ExactQualified, phase3Points, phase3ExactQualified,
    predictedPositions, actualStandings, qualifiedThirdPlace, teamQualificationStatus, discrepancy, groupPointsCalculated } = result;

  console.log('════════════════════════════════════════════════════════════════');
  console.log(`BET: ${betId}`);
  console.log(`Predictor: ${predictorId}`);
  console.log(`Group: ${groupId} (pointsCalculated: ${groupPointsCalculated})`);
  console.log(`Discrepancy: ${discrepancy}`);
  console.log('');
  console.log('Predicted positions:');
  predictedPositions.slice(0, 4).forEach((p, i) => {
    const status = teamQualificationStatus[p.toUpperCase()];
    console.log(`  ${i + 1}°: ${p} → actual: ${status?.actualPos ?? 'NOT FOUND'} (${status?.qualified ? 'QUALIFIED via ' + status.qualifiedVia : 'NOT QUALIFIED'})`);
  });
  console.log('');
  console.log('Actual standings:');
  actualStandings.slice(0, 4).forEach((s, i) => {
    const q = qualifiedThirdPlace.has(s.teamId.toUpperCase());
    console.log(`  ${i + 1}°: ${s.teamId} (${s.points} pts) ${q ? '[QUALIFIED 3rd]' : ''}`);
  });
  console.log('');
  console.log('Scores:');
  console.log(`  Phase 1 (top 2): points=${phase1Points}, exactQualified=${phase1ExactQualified}`);
  console.log(`  Phase 3 (3rd):    points=${phase3Points}, exactQualified=${phase3ExactQualified}`);
  console.log(`  Stored:           points=${storedPoints}, exactQualified=${storedExactQualified}`);
  console.log(`  Expected:         points=${expectedPoints}, exactQualified=${expectedExactQualified}`);

  if (discrepancy !== 'none') {
    console.log(`\n❌ MISMATCH: stored vs expected`);
  }
  console.log('');
}

export function printGroupSummary(results: AuditResult[]): void {
  const byGroup = new Map<string, AuditResult[]>();
  for (const r of results) {
    const list = byGroup.get(r.groupId) ?? [];
    list.push(r);
    byGroup.set(r.groupId, list);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log('GROUP-BY-GROUP SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════════');

  for (const [groupId, bets] of [...byGroup.entries()].sort()) {
    const discrepancies = bets.filter(b => b.discrepancy !== 'none');
    const ok = bets.filter(b => b.discrepancy === 'none');
    const groupFinished = bets[0]?.groupPointsCalculated ?? false;
    console.log(`\n${groupId} (${bets.length} bets, finished: ${groupFinished}):`);
    console.log(`  ✅ OK: ${ok.length} | ❌ Discrepancies: ${discrepancies.length}`);

    if (discrepancies.length > 0 && discrepancies.length <= 10) {
      for (const d of discrepancies) {
        const diff = d.expectedPoints - d.storedPoints;
        console.log(`    - ${d.betId.slice(0, 20)}...: stored=${d.storedPoints}, expected=${d.expectedPoints} (diff=${diff >= 0 ? '+' : ''}${diff})`);
        console.log(`      Predicted: ${d.predictedPositions.slice(0, 3).join(', ')}`);
      }
    }
  }
}

function parseArgs(): { predictorId?: string } {
  const args = process.argv.slice(2);
  const predictorId = args.find((a) => !a.startsWith('--')) ?? undefined;
  return { predictorId };
}

async function main() {
  const { predictorId } = parseArgs();

  if (predictorId) {
    console.log(`Auditing predictor: ${predictorId}\n`);
  }

  const results = await auditGroupBets(predictorId);

  const discrepancies = results.filter(r => r.discrepancy !== 'none');
  const ok = results.filter(r => r.discrepancy === 'none');

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log('AUDIT SUMMARY');
  console.log(`Total bets audited: ${results.length}`);
  console.log(`✅ OK: ${ok.length}`);
  console.log(`❌ Discrepancies: ${discrepancies.length}`);
  console.log('═══════════════════════════════════════════════════════════════════════');

  printGroupSummary(results);

  if (discrepancies.length > 0) {
    console.log('\n\n═══════════════════════════════════════════════════════════════════════');
    console.log('DETAILED DISCREPANCY REPORT (first 20)');
    console.log('═══════════════════════════════════════════════════════════════════════');
    for (const result of discrepancies.slice(0, 20)) {
      printResult(result);
    }

    if (discrepancies.length > 20) {
      console.log(`... and ${discrepancies.length - 20} more discrepancies`);
    }
  }

  if (results.length === 0) {
    console.log('\nNo group bets found to audit.');
  }
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
