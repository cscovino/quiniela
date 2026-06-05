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

async function rescoreGroupBets(): Promise<number> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).get();
  if (snap.empty) {
    console.log('No group_standings docs found');
    return 0;
  }

  console.log(`Found ${snap.docs.length} group_standings docs`);

  if (DRY_RUN) {
    for (const doc of snap.docs) {
      const data = doc.data();
      console.log(`  [dry-run] would re-save group_standings/${data.groupId ?? doc.id}`);
    }
    console.log(`\n[dry-run] Would re-save ${snap.docs.length} group_standings docs`);
    return 0;
  }

  const batch = db.batch();
  let count = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    const groupId = data.groupId ?? doc.id;
    const { groupId: _drop, ...rest } = data;
    batch.set(doc.ref, rest, { merge: true });
    console.log(`  re-saving group_standings/${groupId} to fire calculateGroupResults`);
    count++;
  }
  await batch.commit();
  console.log(`\nRe-saved ${count} group_standings docs — calculateGroupResults will re-score bets`);
  return count;
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

  console.log('Re-saving group_standings to trigger calculateGroupResults re-scoring');
  await rescoreGroupBets();

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
