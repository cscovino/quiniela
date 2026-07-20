import admin from 'firebase-admin';

// Cleans leaderboard rows that render a raw predictorId (see audit-ranking-names.ts):
//   ORPHAN_STATS → delete the stale stats doc (predictor no longer exists)
//   NAMELESS     → backfill predictor.name from the owning user's displayName
//   SOFT_DELETED_LEAK → left untouched (report only; shouldn't appear)
//
// Dry-run by default; pass --execute (with real credentials) or USE_FIREBASE_EMULATOR=true
// to apply. After executing, the public rankings API recomputes rank/percentile live on
// the next fetch, so removed rows simply drop off.

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

interface PredictorInfo {
  exists: boolean;
  name: string | null;
  deletedAt: unknown;
}

async function clean(): Promise<void> {
  const [predictorsSnap, statsSnap] = await Promise.all([
    db.collectionGroup('predictors').get(),
    db.collectionGroup('stats').get(),
  ]);

  const predictorMap = new Map<string, PredictorInfo>();
  predictorsSnap.forEach((doc) => {
    const parts = doc.ref.path.split('/');
    const data = doc.data() as { name?: string; deletedAt?: unknown };
    predictorMap.set(`${parts[1]}/${parts[3]}`, {
      exists: true,
      name: (data.name as string) || null,
      deletedAt: data.deletedAt ?? null,
    });
  });

  const userNameCache = new Map<string, string | null>();
  const getUserName = async (userId: string): Promise<string | null> => {
    if (userNameCache.has(userId)) return userNameCache.get(userId) ?? null;
    const snap = await db.doc(`users/${userId}`).get();
    const name = ((snap.data()?.displayName as string) || null) ?? null;
    userNameCache.set(userId, name);
    return name;
  };

  const batch = db.batch();
  let deleted = 0;
  let renamed = 0;
  let skipped = 0;

  for (const doc of statsSnap.docs) {
    const parts = doc.ref.path.split('/');
    const userId = parts[1];
    const predictorId = parts[3];
    const data = doc.data() as { tournamentId?: string; totalPoints?: number };

    if (doc.id !== TOURNAMENT_ID && data.tournamentId !== TOURNAMENT_ID) continue;

    const key = `${userId}/${predictorId}`;
    const info = predictorMap.get(key);

    // Only rows that would render the raw predictorId need cleaning.
    if (info?.name) continue;

    if (!info) {
      // ORPHAN_STATS — predictor gone; delete the leftover stats doc.
      console.log(
        `  ${DRY_RUN ? '[dry-run] would delete' : 'deleted'} ORPHAN_STATS ${predictorId} ` +
          `(${data.totalPoints || 0} pts) at ${doc.ref.path}`,
      );
      if (!DRY_RUN) batch.delete(doc.ref);
      deleted++;
      continue;
    }

    if (info.deletedAt != null) {
      console.log(`  SKIP SOFT_DELETED_LEAK ${predictorId} — investigate rankings filter`);
      skipped++;
      continue;
    }

    // NAMELESS — predictor exists; backfill name from user displayName.
    const userName = await getUserName(userId);
    if (!userName) {
      console.log(`  SKIP NAMELESS ${predictorId} — user has no displayName to backfill from`);
      skipped++;
      continue;
    }
    const predictorRef = db.doc(`users/${userId}/predictors/${predictorId}`);
    console.log(
      `  ${DRY_RUN ? '[dry-run] would rename' : 'renamed'} NAMELESS ${predictorId} → "${userName}"`,
    );
    if (!DRY_RUN) batch.set(predictorRef, { name: userName }, { merge: true });
    renamed++;
  }

  if (!DRY_RUN && (deleted > 0 || renamed > 0)) await batch.commit();

  console.log(
    `\n${DRY_RUN ? 'Would delete' : 'Deleted'} ${deleted} orphan stats, ` +
      `${DRY_RUN ? 'rename' : 'renamed'} ${renamed} nameless predictor(s); skipped ${skipped}.`,
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

  await clean();

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
