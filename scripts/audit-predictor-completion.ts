import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();

const TOURNAMENT_ID = 'world-cup-2026';

const EXPECTED = {
  bets: 72,
  group_bets: 12,
  final_phase_bets: 1,
  best_players_bets: 1,
} as const;

interface MissingReport {
  userId: string;
  email: string;
  predictorId: string;
  predictorName: string;
  missing: {
    bets: number;
    group_bets: number;
    final_phase_bets: boolean;
    best_players_bets: boolean;
  };
  totalMissing: number;
  completenessPercent: number;
}

async function getAllPredictors(): Promise<
  Array<{ userId: string; email: string; predictorId: string; name: string }>
> {
  const predictors: Array<{ userId: string; email: string; predictorId: string; name: string }> =
    [];

  const usersSnap = await db.collection('users').get();

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const email = (userDoc.data().email as string | undefined) ?? '';
    const predictorsSnap = await userDoc.ref.collection('predictors').get();

    for (const predictorDoc of predictorsSnap.docs) {
      predictors.push({
        userId,
        email,
        predictorId: predictorDoc.id,
        name: predictorDoc.data().name ?? '(unnamed)',
      });
    }
  }

  return predictors;
}

async function getBetsCount(predictorId: string): Promise<number> {
  const snap = await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('bets')
    .where('predictorId', '==', predictorId)
    .count()
    .get();
  return snap.data().count;
}

async function getGroupBetsCount(predictorId: string): Promise<number> {
  const snap = await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('group_bets')
    .where('predictorId', '==', predictorId)
    .count()
    .get();
  return snap.data().count;
}

async function hasFinalPhaseBet(predictorId: string): Promise<boolean> {
  const doc = await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('final_phase_bets')
    .doc(predictorId)
    .get();
  return doc.exists;
}

async function hasBestPlayersBet(predictorId: string): Promise<boolean> {
  const doc = await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('best_players_bets')
    .doc(predictorId)
    .get();
  return doc.exists;
}

async function auditPredictor(
  predictor: { userId: string; email: string; predictorId: string; name: string },
): Promise<MissingReport> {
  const [betsCount, groupBetsCount, hasFinal, hasBest] = await Promise.all([
    getBetsCount(predictor.predictorId),
    getGroupBetsCount(predictor.predictorId),
    hasFinalPhaseBet(predictor.predictorId),
    hasBestPlayersBet(predictor.predictorId),
  ]);

  const missingBets = Math.max(0, EXPECTED.bets - betsCount);
  const missingGroupBets = Math.max(0, EXPECTED.group_bets - groupBetsCount);
  const missingFinal = !hasFinal;
  const missingBest = !hasBest;

  const totalMissing = missingBets + missingGroupBets + (missingFinal ? 1 : 0) + (missingBest ? 1 : 0);
  const totalExpected = EXPECTED.bets + EXPECTED.group_bets + 1 + 1;
  const completenessPercent = Math.round(((totalExpected - totalMissing) / totalExpected) * 100);

  return {
    userId: predictor.userId,
    email: predictor.email,
    predictorId: predictor.predictorId,
    predictorName: predictor.name,
    missing: {
      bets: missingBets,
      group_bets: missingGroupBets,
      final_phase_bets: missingFinal,
      best_players_bets: missingBest,
    },
    totalMissing,
    completenessPercent,
  };
}

function printReport(reports: MissingReport[]): void {
  const totalPredictors = reports.length;
  const incomplete = reports.filter((r) => r.totalMissing > 0);
  const complete = reports.filter((r) => r.totalMissing === 0);

  console.log('\n📋 PREDICTOR COMPLETION AUDIT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Tournament: ${TOURNAMENT_ID}`);
  console.log(`Total predictors: ${totalPredictors}`);
  console.log(`Complete: ${complete.length}/${totalPredictors}`);
  console.log(`Incomplete: ${incomplete.length}/${totalPredictors}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (incomplete.length === 0) {
    console.log('\n✅ All predictors have completed all their bets!');
    return;
  }

  // Group by user
  const byUser = new Map<string, MissingReport[]>();
  for (const r of incomplete) {
    const list = byUser.get(r.userId) ?? [];
    list.push(r);
    byUser.set(r.userId, list);
  }

  console.log(`\n⚠️  ${incomplete.length} incomplete predictor(s) across ${byUser.size} user(s):\n`);

  const sortedUsers = [...byUser.entries()].sort((a, b) => {
    const aTotal = a[1].reduce((s, r) => s + r.totalMissing, 0);
    const bTotal = b[1].reduce((s, r) => s + r.totalMissing, 0);
    return bTotal - aTotal;
  });

  for (const [userId, userReports] of sortedUsers) {
    const userTotalMissing = userReports.reduce((s, r) => s + r.totalMissing, 0);
    const email = userReports[0]?.email || '(no email)';
    console.log(`👤 USER: ${userId}`);
    console.log(`   📧 ${email}`);
    console.log(`   Missing ${userTotalMissing} total bets across ${userReports.length} predictor(s):\n`);

    for (const report of userReports.sort((a, b) => a.totalMissing - b.totalMissing)) {
      const missingParts: string[] = [];
      if (report.missing.bets > 0) missingParts.push(`${report.missing.bets} match bets`);
      if (report.missing.group_bets > 0) missingParts.push(`${report.missing.group_bets} group bets`);
      if (report.missing.final_phase_bets) missingParts.push('final phase');
      if (report.missing.best_players_bets) missingParts.push('best players');

      console.log(`   📌 Predictor: "${report.predictorName}"`);
      console.log(`      ID: ${report.predictorId}`);
      console.log(`      Missing: ${missingParts.join(', ')}`);
      console.log(`      Completion: ${report.completenessPercent}%`);
      console.log();
    }
  }

  const totalMissingBets = incomplete.reduce((sum, r) => sum + r.missing.bets, 0);
  const totalMissingGroupBets = incomplete.reduce((sum, r) => sum + r.missing.group_bets, 0);
  const totalMissingFinal = incomplete.filter((r) => r.missing.final_phase_bets).length;
  const totalMissingBest = incomplete.filter((r) => r.missing.best_players_bets).length;

  console.log('📊 AGGREGATE MISSING BETS');
  console.log('─────────────────────────────────');
  console.log(`  Match bets:      ${totalMissingBets} (${Math.round((totalMissingBets / (incomplete.length * EXPECTED.bets)) * 100)}% of needed)`);
  console.log(`  Group bets:      ${totalMissingGroupBets} (${Math.round((totalMissingGroupBets / (incomplete.length * EXPECTED.group_bets)) * 100)}% of needed)`);
  console.log(`  Final phase:     ${totalMissingFinal} predictor(s)`);
  console.log(`  Best players:    ${totalMissingBest} predictor(s)`);
}

async function main() {
  const csvMode = process.argv.includes('--csv');
  const showHelp = process.argv.includes('--help');

  if (showHelp) {
    console.log(`
📋 PREDICTOR COMPLETION AUDIT
Usage: pnpm audit:completion [options]

Options:
  --csv     Output as CSV (for spreadsheets)
  --help    Show this help message

Examples:
  pnpm audit:completion            Human-readable report
  pnpm audit:completion --csv       CSV export
`);
    return;
  }

  console.log('🔍 Fetching all predictors...\n');

  const predictors = await getAllPredictors();
  console.log(`Found ${predictors.length} predictor(s)\n`);

  console.log('🔍 Auditing bet completion (this may take a moment)...\n');

  const reports = await Promise.all(predictors.map(auditPredictor));

  if (csvMode) {
    // CSV output: userId,email,predictorId,predictorName,completenessPercent,betsMissing,groupBetsMissing,missingFinal,missingBest
    console.log('userId,email,predictorId,predictorName,completenessPercent,betsMissing,groupBetsMissing,missingFinal,missingBest');
    for (const r of reports.sort((a, b) => a.userId.localeCompare(b.userId))) {
      console.log([
        r.userId,
        r.email,
        r.predictorId,
        `"${r.predictorName}"`,
        r.completenessPercent,
        r.missing.bets,
        r.missing.group_bets,
        r.missing.final_phase_bets ? 'yes' : 'no',
        r.missing.best_players_bets ? 'yes' : 'no',
      ].join(','));
    }
  } else {
    printReport(reports);
  }
}

main().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});