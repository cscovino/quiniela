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

const POINT_COLLECTIONS = [
  { field: 'matchPoints', collection: 'bets' },
  { field: 'groupPoints', collection: 'group_bets' },
  { field: 'knockoutPoints', collection: 'knockout_bets' },
  { field: 'finalFourPoints', collection: 'final_phase_bets' },
  { field: 'bestPlayerPoints', collection: 'best_players_bets' },
] as const;

/**
 * Determine which groups are NOT yet complete (some matches still unfinished).
 * Group bets in those groups should carry zero points until the group stage ends.
 */
async function getIncompleteGroups(): Promise<Set<string>> {
  const matchesSnap = await db.collection(`tournaments/${TOURNAMENT_ID}/matches`).get();
  const total = new Map<string, number>();
  const finished = new Map<string, number>();

  matchesSnap.forEach((doc) => {
    const data = doc.data() as { groupId?: string | null; phase?: string; status?: string };
    if (!data.groupId || data.phase !== 'group') return;
    total.set(data.groupId, (total.get(data.groupId) ?? 0) + 1);
    if (data.status === 'finished') {
      finished.set(data.groupId, (finished.get(data.groupId) ?? 0) + 1);
    }
  });

  const incomplete = new Set<string>();
  for (const [groupId, totalCount] of total) {
    const finishedCount = finished.get(groupId) ?? 0;
    const complete = finishedCount >= totalCount;
    console.log(
      `  group ${groupId}: ${finishedCount}/${totalCount} finished — ${complete ? 'COMPLETE' : 'incomplete'}`,
    );
    if (!complete) incomplete.add(groupId);
  }
  return incomplete;
}

async function resetIncompleteGroupBets(incomplete: Set<string>): Promise<number> {
  if (incomplete.size === 0) {
    console.log('\nNo incomplete groups have been scored — nothing to reset.');
    return 0;
  }

  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_bets`).get();
  let resetCount = 0;
  const batch = db.batch();

  snap.forEach((doc) => {
    const data = doc.data() as { groupId?: string; points?: number; exactQualified?: number };
    if (!data.groupId || !incomplete.has(data.groupId)) return;
    const hasPoints = (data.points ?? 0) !== 0 || (data.exactQualified ?? 0) !== 0;
    if (!hasPoints) return;
    resetCount++;
    if (!DRY_RUN) {
      batch.update(doc.ref, { points: 0, exactQualified: 0 });
    }
  });

  if (!DRY_RUN && resetCount > 0) await batch.commit();
  console.log(
    `\n${DRY_RUN ? '[dry-run] would zero' : 'Zeroed'} ${resetCount} prematurely-scored group bet(s) ` +
      `across ${incomplete.size} incomplete group(s).`,
  );
  return resetCount;
}

async function clearStandingsScoredFlag(incomplete: Set<string>): Promise<void> {
  for (const groupId of incomplete) {
    const ref = db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).doc(groupId);
    const doc = await ref.get();
    if (!doc.exists) continue;
    if (doc.data()?.pointsCalculated !== true) continue;
    console.log(
      `  ${DRY_RUN ? '[dry-run] would clear' : 'clearing'} pointsCalculated on group_standings/${groupId}`,
    );
    if (!DRY_RUN) await ref.set({ pointsCalculated: false }, { merge: true });
  }
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

async function recomputeAllTotals(): Promise<number> {
  const usersSnap = await db.collection('users').get();
  let changed = 0;

  for (const userDoc of usersSnap.docs) {
    const predictorsSnap = await userDoc.ref.collection('predictors').get();
    for (const predictorDoc of predictorsSnap.docs) {
      const predictorId = predictorDoc.id;
      const subtotals: Record<string, number> = {};
      let groupQualified = 0;

      for (const cat of POINT_COLLECTIONS) {
        const { points, exactQualified } = await sumCollection(
          cat.collection,
          predictorId,
          cat.field,
        );
        subtotals[cat.field] = points;
        if (cat.field === 'groupPoints') groupQualified = exactQualified;
      }
      const totalPoints = POINT_COLLECTIONS.reduce((sum, c) => sum + subtotals[c.field], 0);

      const statsRef = db
        .collection(`users/${userDoc.id}/predictors/${predictorId}/stats`)
        .doc(TOURNAMENT_ID);
      const statsDoc = await statsRef.get();
      const currentTotal = statsDoc.exists
        ? (statsDoc.data()?.totalPoints as number | undefined)
        : undefined;

      if (currentTotal !== totalPoints) {
        changed++;
        console.log(
          `  ${DRY_RUN ? '[dry-run] would set' : 'set'} "${predictorDoc.data().name ?? predictorId}": ${currentTotal ?? '∅'} → ${totalPoints}`,
        );
      }
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
    }
  }
  return changed;
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

  console.log(`Checking group completion for tournament ${TOURNAMENT_ID}...\n`);
  const incomplete = await getIncompleteGroups();

  await resetIncompleteGroupBets(incomplete);
  await clearStandingsScoredFlag(incomplete);

  console.log('\nRecomputing predictor totals from (corrected) bet points...\n');
  const changed = await recomputeAllTotals();

  console.log(`\n${DRY_RUN ? 'Would update' : 'Updated'} ${changed} predictor total(s).`);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
