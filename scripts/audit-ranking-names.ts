import admin from 'firebase-admin';

// Read-only audit of leaderboard display names. Reproduces the rankings API's
// name resolution (functions/src/api/rankings.ts) to find every entry that
// falls back to showing the raw predictorId, and classifies WHY so we can clean
// the right things:
//   ORPHAN_STATS      — stats doc with no predictor doc (deleted predictor;
//                       deleteDoc leaves the stats subcollection behind)
//   NAMELESS          — predictor doc exists but has empty/missing name
//   SOFT_DELETED_LEAK — predictor has deletedAt but still shows (shouldn't happen)

const TOURNAMENT_ID = 'world-cup-2026';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';

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

async function main() {
  console.log(`Auditing leaderboard names for ${TOURNAMENT_ID}\n`);

  const [predictorsSnap, statsSnap] = await Promise.all([
    db.collectionGroup('predictors').get(),
    db.collectionGroup('stats').get(),
  ]);

  // Map predictors by `${userId}/${predictorId}`.
  const predictorMap = new Map<string, PredictorInfo>();
  predictorsSnap.forEach((doc) => {
    const parts = doc.ref.path.split('/');
    const key = `${parts[1]}/${parts[3]}`;
    const data = doc.data() as { name?: string; deletedAt?: unknown };
    predictorMap.set(key, {
      exists: true,
      name: (data.name as string) || null,
      deletedAt: data.deletedAt ?? null,
    });
  });

  // User displayName candidates for repair.
  const userNameCache = new Map<string, string | null>();
  const getUserName = async (userId: string): Promise<string | null> => {
    if (userNameCache.has(userId)) return userNameCache.get(userId) ?? null;
    const snap = await db.doc(`users/${userId}`).get();
    const name = ((snap.data()?.displayName as string) || null) ?? null;
    userNameCache.set(userId, name);
    return name;
  };

  const bad: Array<{
    key: string;
    userId: string;
    predictorId: string;
    totalPoints: number;
    classification: string;
    userDisplayName: string | null;
  }> = [];

  let totalForTournament = 0;

  for (const doc of statsSnap.docs) {
    const parts = doc.ref.path.split('/');
    const userId = parts[1];
    const predictorId = parts[3];
    const data = doc.data() as { tournamentId?: string; totalPoints?: number };

    // Stats docs are keyed by tournamentId; only audit this tournament.
    if (doc.id !== TOURNAMENT_ID && data.tournamentId !== TOURNAMENT_ID) continue;
    totalForTournament++;

    const key = `${userId}/${predictorId}`;
    const info = predictorMap.get(key);

    // Reproduce the API's fallback: displayName = predictor.name || predictorId.
    const resolvedName = info?.name || predictorId;
    const isBad = !info?.name; // would render the raw predictorId

    if (!isBad) continue;

    let classification: string;
    if (!info) classification = 'ORPHAN_STATS';
    else if (info.deletedAt != null) classification = 'SOFT_DELETED_LEAK';
    else classification = 'NAMELESS';

    bad.push({
      key,
      userId,
      predictorId,
      totalPoints: data.totalPoints || 0,
      classification,
      userDisplayName: await getUserName(userId),
    });

    void resolvedName;
  }

  bad.sort((a, b) => b.totalPoints - a.totalPoints);

  console.log(`Scanned ${totalForTournament} stats doc(s) for ${TOURNAMENT_ID}.`);
  console.log(`Found ${bad.length} entry(ies) rendering a raw predictorId:\n`);

  const byClass: Record<string, number> = {};
  for (const b of bad) {
    byClass[b.classification] = (byClass[b.classification] ?? 0) + 1;
    console.log(
      `  [${b.classification}] ${b.predictorId} — ${b.totalPoints} pts — ` +
        `user displayName: ${b.userDisplayName ? `"${b.userDisplayName}"` : '(none)'}`,
    );
  }

  console.log('\nSummary by classification:');
  for (const [cls, n] of Object.entries(byClass)) console.log(`  ${cls}: ${n}`);

  console.log(
    '\nSuggested cleaning:\n' +
      '  ORPHAN_STATS      → delete the stale stats doc (predictor no longer exists)\n' +
      '  NAMELESS          → backfill predictor.name (from user displayName above)\n' +
      '  SOFT_DELETED_LEAK → investigate: should already be filtered out of rankings',
  );
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
