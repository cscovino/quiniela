import admin from 'firebase-admin';

// Restores the userId / predictorId fields on best_players_bets docs that lost
// them (e.g. bets written by set-best-player-bet.ts, which does a plain .set()
// with only bestScorer/bestGoalkeeper). Without predictorId, recompute-predictor-
// totals.ts can't fold a bet's points into the predictor's totalPoints.
//
// Safe because the bet doc ID IS the predictorId, and predictorId is minted as
// `${userId}-${Date.now()}` (see src/services/predictor-service.ts). We derive
// userId from the doc ID and only write when the matching predictor doc exists.

const TOURNAMENT_ID = 'world-cup-2026';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
const DRY_RUN = !IS_EMULATOR && !process.argv.includes('--execute');

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId =
      process.env.PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID ?? 'demo-quiniela';
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

// predictorId is `${userId}-${timestamp}`; Firebase UIDs contain no hyphens, so
// the userId is everything before the last hyphen.
function deriveUserId(predictorId: string): string | null {
  const idx = predictorId.lastIndexOf('-');
  if (idx <= 0) return null;
  return predictorId.slice(0, idx);
}

async function backfill(): Promise<void> {
  const betsSnap = await db.collection(`tournaments/${TOURNAMENT_ID}/best_players_bets`).get();
  console.log(`Found ${betsSnap.size} best_players_bets\n`);

  const batch = db.batch();
  let fixed = 0;
  let skipped = 0;

  for (const betDoc of betsSnap.docs) {
    const bet = betDoc.data() as { userId?: string; predictorId?: string };
    const needsUserId = !bet.userId;
    const needsPredictorId = !bet.predictorId;

    if (!needsUserId && !needsPredictorId) continue;

    const predictorId = betDoc.id;
    const userId = deriveUserId(predictorId);

    if (!userId) {
      console.log(`  SKIP ${predictorId}: cannot derive userId from doc ID`);
      skipped++;
      continue;
    }

    // Verify the predictor actually exists before writing a link to it.
    const predictorSnap = await db.doc(`users/${userId}/predictors/${predictorId}`).get();
    if (!predictorSnap.exists) {
      console.log(
        `  SKIP ${predictorId}: no predictor doc at users/${userId}/predictors/${predictorId}`,
      );
      skipped++;
      continue;
    }
    const name = (predictorSnap.data()?.name as string | undefined) ?? '(unnamed)';

    const patch: Record<string, string> = {};
    if (needsUserId) patch.userId = userId;
    if (needsPredictorId) patch.predictorId = predictorId;

    console.log(
      `  ${DRY_RUN ? '[dry-run] would fix' : 'fixed'} "${name}" (${predictorId}): ` +
        `${Object.keys(patch).join(', ')}`,
    );

    if (!DRY_RUN) batch.set(betDoc.ref, patch, { merge: true });
    fixed++;
  }

  if (!DRY_RUN && fixed > 0) await batch.commit();

  console.log(
    `\n${DRY_RUN ? 'Would fix' : 'Fixed'} ${fixed} bet(s); skipped ${skipped}. ` +
      `${betsSnap.size - fixed - skipped} already had both fields.`,
  );
}

async function main() {
  if (DRY_RUN) {
    console.log(
      '*** DRY RUN — no writes will be made. Re-run with --execute (and real ' +
        'credentials) or USE_FIREBASE_EMULATOR=true to apply changes. ***\n',
    );
  } else if (!IS_EMULATOR) {
    console.log('*** EXECUTE MODE against PRODUCTION Firestore — writes WILL be made. ***\n');
  }

  await backfill();

  console.log(
    '\nNext: run `pnpm migrate:totals:execute` so the restored best-player points ' +
      'roll into each predictor\'s totalPoints, then recompute ranks.',
  );
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
