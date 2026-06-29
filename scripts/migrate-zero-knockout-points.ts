/**
 * Zero out knockout match points across Firestore.
 *
 * Knockout matches do not award points. This script:
 *   1. Sets points = 0 on every knockout_bets doc (user predictions preserved)
 *   2. Sets knockoutPoints = 0 on every predictor stats doc
 *
 * DRY-RUN by default. Re-run with --execute to apply changes.
 * Or point at the emulator with USE_FIREBASE_EMULATOR=true.
 */
import admin from 'firebase-admin';

const TOURNAMENT_ID = 'world-cup-2026';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
const DRY_RUN = !IS_EMULATOR && !process.argv.includes('--execute');

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId =
      process.env.PUBLIC_FIREBASE_EMULATOR_PROJECT_ID ??
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

async function zeroKnockoutBetPoints(): Promise<{ total: number; zeroed: number }> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/knockout_bets`).get();
  let zeroed = 0;
  const batch = db.batch();

  for (const doc of snap.docs) {
    const data = doc.data() as { points?: number };
    if ((data.points ?? 0) !== 0) {
      zeroed++;
      if (!DRY_RUN) batch.update(doc.ref, { points: 0 });
    }
  }

  if (!DRY_RUN && zeroed > 0) await batch.commit();
  return { total: snap.size, zeroed };
}

async function zeroKnockoutStats(): Promise<{ total: number; zeroed: number }> {
  const usersSnap = await db.collection('users').get();
  let zeroed = 0;
  let total = 0;

  for (const userDoc of usersSnap.docs) {
    const predictorsSnap = await userDoc.ref.collection('predictors').get();
    for (const predictorDoc of predictorsSnap.docs) {
      const statsRef = db
        .collection(`users/${userDoc.id}/predictors/${predictorDoc.id}/stats`)
        .doc(TOURNAMENT_ID);
      const statsDoc = await statsRef.get();
      if (!statsDoc.exists) continue;
      total++;
      const data = statsDoc.data() as { knockoutPoints?: number };
      if ((data.knockoutPoints ?? 0) !== 0) {
        zeroed++;
        if (!DRY_RUN) {
          await statsRef.set({ knockoutPoints: 0 }, { merge: true });
        }
      }
    }
  }

  return { total, zeroed };
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

  console.log('Step 1: Zero points on knockout_bets docs...\n');
  const bets = await zeroKnockoutBetPoints();
  console.log(
    `${DRY_RUN ? '[dry-run] would zero' : 'Zeroed'} ${bets.zeroed} of ${bets.total} knockout_bet doc(s) ` +
      `(${bets.zeroed === bets.total ? 'all' : bets.zeroed > 0 ? 'some' : 'none'} had non-zero points)`,
  );

  console.log('\nStep 2: Zero knockoutPoints on predictor stats docs...\n');
  const stats = await zeroKnockoutStats();
  console.log(
    `${DRY_RUN ? '[dry-run] would zero' : 'Zeroed'} ${stats.zeroed} of ${stats.total} stats doc(s) ` +
      `(${stats.zeroed === stats.total ? 'all' : stats.zeroed > 0 ? 'some' : 'none'} had knockoutPoints > 0)`,
  );

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
