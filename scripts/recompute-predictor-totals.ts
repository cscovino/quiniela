import admin from 'firebase-admin';

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

// The five point categories that sum into totalPoints. Each bet collection
// stores an absolute `points` value written by its scoring function.
const CATEGORIES = [
  { field: 'matchPoints', collection: 'bets' },
  { field: 'groupPoints', collection: 'group_bets' },
  { field: 'knockoutPoints', collection: 'knockout_bets' },
  { field: 'finalFourPoints', collection: 'final_phase_bets' },
  { field: 'bestPlayerPoints', collection: 'best_players_bets' },
] as const;

interface PredictorRef {
  userId: string;
  predictorId: string;
  name: string;
}

async function getAllPredictors(): Promise<PredictorRef[]> {
  const predictors: PredictorRef[] = [];
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const predictorsSnap = await userDoc.ref.collection('predictors').get();
    for (const predictorDoc of predictorsSnap.docs) {
      predictors.push({
        userId: userDoc.id,
        predictorId: predictorDoc.id,
        name: (predictorDoc.data().name as string | undefined) ?? '(unnamed)',
      });
    }
  }
  return predictors;
}

async function sumCollection(collection: string, predictorId: string, field: string) {
  const snap = await db
    .collection(`tournaments/${TOURNAMENT_ID}/${collection}`)
    .where('predictorId', '==', predictorId)
    .get();
  let points = 0;
  let exactQualified = 0;
  snap.forEach((doc) => {
    const data = doc.data();
    if (typeof data.points === 'number') points += data.points;
    if (field === 'groupPoints' && typeof data.exactQualified === 'number') {
      exactQualified += data.exactQualified;
    }
  });
  return { points, exactQualified };
}

async function recomputeOne(p: PredictorRef): Promise<{ changed: boolean; summary: string }> {
  const subtotals: Record<string, number> = {};
  let groupQualified = 0;

  for (const cat of CATEGORIES) {
    const { points, exactQualified } = await sumCollection(
      cat.collection,
      p.predictorId,
      cat.field,
    );
    subtotals[cat.field] = points;
    if (cat.field === 'groupPoints') groupQualified = exactQualified;
  }

  const totalPoints = CATEGORIES.reduce((sum, c) => sum + subtotals[c.field], 0);

  const statsRef = db
    .collection(`users/${p.userId}/predictors/${p.predictorId}/stats`)
    .doc(TOURNAMENT_ID);
  const statsDoc = await statsRef.get();
  const currentTotal = statsDoc.exists
    ? (statsDoc.data()?.totalPoints as number | undefined)
    : undefined;

  const changed = currentTotal !== totalPoints;
  const breakdown = CATEGORIES.map((c) => `${c.field}=${subtotals[c.field]}`).join(' ');
  const summary =
    `"${p.name}" (${p.predictorId}): ${currentTotal ?? '∅'} → ${totalPoints} ` +
    `[${breakdown} groupQualified=${groupQualified}]`;

  if (!DRY_RUN) {
    await statsRef.set(
      {
        ...subtotals,
        totalPoints,
        groupQualified,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  return { changed, summary };
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

  console.log(`Recomputing predictor totals for tournament ${TOURNAMENT_ID}...\n`);

  const predictors = await getAllPredictors();
  console.log(`Found ${predictors.length} predictor(s)\n`);

  let changedCount = 0;
  for (const p of predictors) {
    const { changed, summary } = await recomputeOne(p);
    if (changed) {
      changedCount++;
      console.log(`  ${DRY_RUN ? '[dry-run] would fix' : 'fixed'} ${summary}`);
    } else {
      console.log(`  ok ${summary}`);
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Would correct' : 'Corrected'} ${changedCount}/${predictors.length} predictor total(s).`,
  );
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
