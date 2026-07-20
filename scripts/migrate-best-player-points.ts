import admin from 'firebase-admin';

const TOURNAMENT_ID = 'world-cup-2026';

// Must match SCORING.BEST_PLAYER.CORRECT in functions/src/scoring.ts (SCORE-03).
const CORRECT_POINTS = 5;

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

// -- Fuzzy matching (copied verbatim from functions/src/calculateBestPlayerResults.ts
//    so this migration produces identical results to the Cloud Function trigger) --

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .replace(/[^a-z0-9\s]/g, ''); // strip non-alphanumeric except spaces
}

function fuzzyMatch(predicted: string, actual: string): boolean {
  const normalizedPredicted = normalizeName(predicted ?? '');
  const normalizedActual = normalizeName(actual ?? '');

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

  return Boolean(
    predictedSurname &&
      actualSurname &&
      predictedSurname.length > 2 &&
      predictedSurname === actualSurname,
  );
}

interface ResultDoc {
  topScorer?: string;
  bestGoalkeeper?: string;
}

async function getPredictorName(userId?: string, predictorId?: string): Promise<string> {
  if (!userId || !predictorId) return '(unknown)';
  const snap = await db.doc(`users/${userId}/predictors/${predictorId}`).get();
  return (snap.data()?.name as string | undefined) ?? '(unnamed)';
}

async function migrateBestPlayerPoints(): Promise<void> {
  // 1. Load the actual result the admin saved.
  const resultRef = db.doc(`tournaments/${TOURNAMENT_ID}/best_players_results/actual`);
  const resultSnap = await resultRef.get();

  if (!resultSnap.exists) {
    console.error(
      `No best_players_results/actual document found for ${TOURNAMENT_ID}. ` +
        'Save the actual top scorer / best goalkeeper from the admin page first.',
    );
    process.exit(1);
  }

  const { topScorer = '', bestGoalkeeper = '' } = resultSnap.data() as ResultDoc;
  console.log(`Actual result — topScorer: "${topScorer}", bestGoalkeeper: "${bestGoalkeeper}"\n`);

  if (!topScorer && !bestGoalkeeper) {
    console.error('Actual result has neither topScorer nor bestGoalkeeper — nothing to score.');
    process.exit(1);
  }

  // 2. Score every bet.
  const betsSnap = await db.collection(`tournaments/${TOURNAMENT_ID}/best_players_bets`).get();
  console.log(`Found ${betsSnap.size} best_players_bets\n`);

  if (betsSnap.empty) {
    console.log('No bets to score.');
    return;
  }

  const batch = db.batch();
  let changedCount = 0;
  let totalPointsAwarded = 0;

  for (const betDoc of betsSnap.docs) {
    const bet = betDoc.data() as {
      userId?: string;
      predictorId?: string;
      bestScorer?: string;
      bestGoalkeeper?: string;
      points?: number;
    };

    const name = await getPredictorName(bet.userId, bet.predictorId ?? betDoc.id);

    const scorerHit = topScorer ? fuzzyMatch(bet.bestScorer ?? '', topScorer) : false;
    const gkHit = bestGoalkeeper ? fuzzyMatch(bet.bestGoalkeeper ?? '', bestGoalkeeper) : false;
    const newPoints = (scorerHit ? CORRECT_POINTS : 0) + (gkHit ? CORRECT_POINTS : 0);
    const oldPoints = typeof bet.points === 'number' ? bet.points : 0;

    totalPointsAwarded += newPoints;
    const changed = oldPoints !== newPoints;
    if (changed) changedCount++;

    const marker = changed ? (DRY_RUN ? '[dry-run] would set' : 'set') : 'ok';
    console.log(
      `  ${marker} "${name}" (${bet.predictorId ?? betDoc.id}): ${oldPoints} → ${newPoints} ` +
        `[scorer "${bet.bestScorer ?? ''}"=${scorerHit}, gk "${bet.bestGoalkeeper ?? ''}"=${gkHit}]`,
    );

    if (!DRY_RUN && changed) {
      batch.update(betDoc.ref, {
        points: newPoints,
        scoredAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  if (!DRY_RUN && changedCount > 0) {
    await batch.commit();
  }

  console.log(
    `\n${DRY_RUN ? 'Would update' : 'Updated'} ${changedCount}/${betsSnap.size} bet(s). ` +
      `Total best-player points across all bets: ${totalPointsAwarded}.`,
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

  await migrateBestPlayerPoints();

  console.log(
    '\nNext: run `pnpm migrate:totals:execute` to fold the new best-player points into ' +
      'each predictor\'s totalPoints, then recompute ranks.',
  );
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
