import admin from 'firebase-admin';

import {
  buildCompleteActualClassifiedSet,
  computeClassifiedTeamIds,
  getTop8ThirdPlaceTeamIds,
  scoreGroupBetWithBreakdown,
  type AllGroupStandings,
  type ScoreResult,
  type TeamStanding,
} from './lib/group-scoring';

const TOURNAMENT_ID_FLAG = '--tournament';
function parseTournamentId(): string {
  const idx = process.argv.indexOf(TOURNAMENT_ID_FLAG);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return 'world-cup-2026';
}

const TOURNAMENT_ID = parseTournamentId();
const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
const DRY_RUN = !IS_EMULATOR && !process.argv.includes('--execute');
const AUDIT_ONLY = process.argv.includes('--audit');

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId =
      process.env.PUBLIC_FIREBASE_PROJECT_ID ??
      process.env.FIREBASE_PROJECT_ID ??
      'demo-quiniela';
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

interface GroupBetDoc {
  userId: string;
  predictorId: string;
  groupId: string;
  positions?: string[];
  classifiedTeamIds?: string[];
  points?: number;
}

function printGroupStandings(allGroupStandings: AllGroupStandings): void {
  console.log('\n┌─── ACTUAL GROUP STANDINGS ───');
  for (const [groupId, standings] of Object.entries(allGroupStandings).sort()) {
    const top3 = standings
      .slice(0, 3)
      .map((s, i) => `${i + 1}.${s.teamId}`)
      .join('  ');
    console.log(`│  ${groupId.padEnd(10)} → ${top3}`);
  }
  console.log('└──────────────────────────────────────────────────────────\n');
}

async function loadGroupStandings(): Promise<AllGroupStandings> {
  const standingsSnap = await db
    .collection(`tournaments/${TOURNAMENT_ID}/group_standings`)
    .get();

  const allGroupStandings: AllGroupStandings = {};
  for (const doc of standingsSnap.docs) {
    const data = doc.data() as { standings?: TeamStanding[] };
    if (data.standings && data.standings.length > 0) {
      allGroupStandings[doc.id] = data.standings;
    }
  }
  return allGroupStandings;
}

function formatBreakdown(result: ScoreResult): string {
  const lines: string[] = [];
  for (const b of result.breakdown) {
    const ptsStr = b.pointsAwarded > 0 ? `+${b.pointsAwarded}` : ' 0';
    const marker = b.isExact ? '✓' : b.pointsAwarded > 0 ? '~' : '·';
    lines.push(
      `    ${marker} Pos ${b.position}: predicted=${b.predicted.padEnd(4)} actual=${(b.actual ?? '—').padEnd(4)} → ${ptsStr} pts — ${b.reason}`,
    );
  }
  return lines.join('\n');
}

async function auditBets(allGroupStandings: AllGroupStandings): Promise<number> {
  const top8Third = getTop8ThirdPlaceTeamIds(allGroupStandings);
  console.log(`\n┌─── TOP 8 THIRD-PLACE TEAMS (qualifying via matrix) ───`);
  const thirdList = Array.from(top8Third).sort();
  for (let i = 0; i < thirdList.length; i++) {
    console.log(`│  ${i + 1}. ${thirdList[i]}`);
  }
  console.log('└──────────────────────────────────────────────────────────\n');

  const actualClassified = new Set<string>();
  const actualByGroup: Record<string, string[]> = {};
  for (const [gid, st] of Object.entries(allGroupStandings).sort()) {
    actualByGroup[gid] = [st[0].teamId.toUpperCase(), st[1].teamId.toUpperCase()];
    actualClassified.add(st[0].teamId.toUpperCase());
    actualClassified.add(st[1].teamId.toUpperCase());
  }
  for (const t of top8Third) actualClassified.add(t);

  console.log(`┌─── COMPLETE ACTUAL CLASSIFIED SET (${actualClassified.size} teams) ───`);
  console.log(`│  Top 1-2 per group (24 teams — always classified):`);
  for (const [gid, teams] of Object.entries(actualByGroup)) {
    console.log(`│    ${gid.padEnd(10)} ${teams[0]}, ${teams[1]}`);
  }
  console.log(`│  Top 8 third-place (8 teams — via matrix):`);
  for (const t of Array.from(top8Third).sort()) {
    console.log(`│    ${t}`);
  }
  console.log(`└──────────────────────────────────────────────────────────\n`);

  const betsSnap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_bets`).get();
  console.log(`Found ${betsSnap.size} group bets to audit\n`);

  let totalPoints = 0;
  let totalExactMatches = 0;
  let totalWrongPos = 0;
  let totalExactQualified = 0;
  let audited = 0;
  let betsWithDelta = 0;
  let totalDelta = 0;

  for (const betDoc of betsSnap.docs) {
    const data = betDoc.data() as GroupBetDoc;
    const positions = (data.positions || []).map((p) => p.toUpperCase());
    if (positions.length < 2) continue;

    const classifiedTeamIds = computeClassifiedTeamIds(positions, top8Third);
    const standings = allGroupStandings[data.groupId];
    if (!standings || standings.length === 0) {
      console.log(
        `  [${betDoc.id}] group=${data.groupId} predictor=${data.predictorId} — NO STANDINGS`,
      );
      continue;
    }

    const result = scoreGroupBetWithBreakdown(
      positions,
      standings,
      'all',
      allGroupStandings,
      classifiedTeamIds,
    );

    audited++;
    totalPoints += result.points;
    totalExactMatches += result.exactMatches;
    totalWrongPos += result.wrongPositionMatches;
    totalExactQualified += result.exactQualified;

    const stored = data.points ?? 0;
    const delta = stored - result.points;
    if (delta !== 0) betsWithDelta++;
    totalDelta += Math.abs(delta);
    const flag = delta !== 0 ? ' ⚠️  DELTA' : '';

    const predictedSet = new Set(classifiedTeamIds);
    const predictedButNotActual = classifiedTeamIds.filter((t) => !actualClassified.has(t));
    const actualButNotPredictedInGroup = standings
      .slice(0, 3)
      .map((s) => s.teamId.toUpperCase())
      .filter((t) => !predictedSet.has(t));

    console.log(
      `─── ${betDoc.id} (group=${data.groupId}, predictor=${data.predictorId}) — points stored=${stored} new=${result.points}${flag}`,
    );
    console.log(`    positions:      ${positions.join(', ')}`);
    console.log(`    predicted classified:  ${classifiedTeamIds.join(', ') || '(none)'}`);
    if (predictedButNotActual.length > 0) {
      console.log(
        `    ⚠ predicted but NOT actually classified: ${predictedButNotActual.join(', ')}`,
      );
    }
    if (actualButNotPredictedInGroup.length > 0) {
      console.log(
        `    → actually classified but NOT predicted:    ${actualButNotPredictedInGroup.join(', ')}`,
      );
    }
    console.log(`    breakdown:`);
    console.log(formatBreakdown(result));
    console.log(
      `    totals: ${result.exactMatches} exact, ${result.wrongPositionMatches} wrong-pos, ${result.exactQualified} qualified, ${result.points} pts\n`,
    );
  }

  console.log(`\n┌─── AUDIT SUMMARY ───`);
  console.log(`│  Bets audited:           ${audited}`);
  console.log(`│  Bets with stored delta: ${betsWithDelta} (out of ${audited})`);
  console.log(`│  Total |delta|:          ${totalDelta} pts`);
  console.log(`│  New total points:       ${totalPoints}`);
  console.log(`│  Total exact matches:    ${totalExactMatches}`);
  console.log(`│  Total wrong-pos:        ${totalWrongPos}`);
  console.log(`│  Total qualified:        ${totalExactQualified}`);
  console.log('└─────────────────────\n');

  return audited;
}

async function backfillClassifiedTeamIds(
  allGroupStandings: AllGroupStandings,
): Promise<number> {
  const top8Third = getTop8ThirdPlaceTeamIds(allGroupStandings);
  const betsSnap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_bets`).get();
  console.log(`  Found ${betsSnap.size} group bets`);

  if (DRY_RUN) {
    let wouldUpdate = 0;
    for (const betDoc of betsSnap.docs) {
      const data = betDoc.data() as GroupBetDoc;
      const positions = (data.positions || []).map((p) => p.toUpperCase());
      if (positions.length < 2) continue;

      const classifiedTeamIds = computeClassifiedTeamIds(positions, top8Third);
      const current = (data.classifiedTeamIds || []).map((t) => t.toUpperCase()).sort();
      const next = classifiedTeamIds.slice().sort();
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        wouldUpdate++;
        console.log(
          `  [dry-run] ${betDoc.id}: ${JSON.stringify(current)} → ${JSON.stringify(next)}`,
        );
      }
    }
    console.log(`  [dry-run] Would update ${wouldUpdate} bets`);
    return 0;
  }

  const batchSize = 500;
  let batch = db.batch();
  let count = 0;
  let updated = 0;

  for (const betDoc of betsSnap.docs) {
    const data = betDoc.data() as GroupBetDoc;
    const positions = (data.positions || []).map((p) => p.toUpperCase());
    if (positions.length < 2) continue;

    const classifiedTeamIds = computeClassifiedTeamIds(positions, top8Third);
    const current = (data.classifiedTeamIds || []).map((t) => t.toUpperCase()).sort();
    const next = classifiedTeamIds.slice().sort();

    if (JSON.stringify(current) !== JSON.stringify(next)) {
      batch.update(betDoc.ref, { classifiedTeamIds });
      updated++;
      count++;
    }

    if (count >= batchSize) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`  Updated ${updated} bets with classifiedTeamIds`);
  return updated;
}

async function main() {
  if (AUDIT_ONLY) {
    console.log('*** AUDIT MODE — computing and printing scores, NO writes ***');
  } else if (DRY_RUN) {
    console.log(
      '*** DRY RUN — no writes will be made. Re-run with --execute (and real ' +
        'credentials) or USE_FIREBASE_EMULATOR=true to apply changes. ***',
    );
  } else if (!IS_EMULATOR) {
    console.log('*** EXECUTE MODE against PRODUCTION Firestore — writes WILL be made. ***');
  }
  console.log(`Tournament: ${TOURNAMENT_ID}\n`);

  const allGroupStandings = await loadGroupStandings();
  if (Object.keys(allGroupStandings).length === 0) {
    console.log(`No group_standings docs found for tournament "${TOURNAMENT_ID}" — aborting.`);
    console.log(
      `\nIf you need to target a different tournament, pass --tournament <id>. Example:`,
    );
    console.log(`  pnpm migrate:classified --tournament my-tournament-id\n`);
    return;
  }

  printGroupStandings(allGroupStandings);

  if (AUDIT_ONLY) {
    await auditBets(allGroupStandings);
    console.log('\nAudit complete. No writes performed.\n');
    return;
  }

  console.log(`[1/1] Backfilling classifiedTeamIds for ${TOURNAMENT_ID}...`);
  await backfillClassifiedTeamIds(allGroupStandings);

  console.log(
    '\nNote: Setting classifiedTeamIds triggers recalculateGroupPoints cloud function for each bet,',
  );
  console.log('which fully re-scores group bets using the new Option B logic.\n');
  console.log('Run with --audit afterwards to verify the recalculated points:\n');
  console.log(`  pnpm migrate:classified:audit${TOURNAMENT_ID === 'world-cup-2026' ? '' : ` --tournament ${TOURNAMENT_ID}`}\n`);
  console.log('Done.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
