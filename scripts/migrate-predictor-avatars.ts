import admin from 'firebase-admin';

import type { Predictor } from '../src/types/firestore';
import { buildBackfillPixelArt, needsBackfill } from '../src/utils/avatar-migration';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
const args = process.argv.slice(2);
const applyMode = args.includes('--apply') || args.includes('--commit');
const DRY_RUN = !IS_EMULATOR && !applyMode;
// Positional uid: first arg that does NOT start with '--'
const uid: string | null = args.find((a) => !a.startsWith('--')) ?? null;

const BATCH_SIZE = 500;

// T-8-01: Validate uid to prevent path injection (must be non-empty alphanumeric + _ -)
if (uid !== null && !/^[a-zA-Z0-9_-]+$/.test(uid)) {
  console.error(
    `Error: Invalid uid "${uid}". Expected alphanumeric characters, underscores, or hyphens only.`,
  );
  process.exit(1);
}

// Uses the Admin SDK so writes bypass Firestore security rules.
// Mirrors scripts/migrate-knockout-schedule.ts: service-account JSON in prod,
// project id + emulator host when targeting the emulator, ADC otherwise.
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

async function main() {
  // D-02: Startup banner — always print mode so the operator knows what is happening.
  if (DRY_RUN) {
    console.log(
      '*** DRY RUN — no writes will be made. Re-run with --apply (and real ' +
        'credentials) or USE_FIREBASE_EMULATOR=true to apply changes. ***\n',
    );
  } else if (!IS_EMULATOR) {
    console.log('*** APPLY MODE against PRODUCTION Firestore — writes WILL be made. ***\n');
  } else {
    console.log('*** APPLY MODE against Firestore Emulator. ***\n');
  }

  // D-03: Print scope.
  if (uid) {
    console.log(`Scope: users/${uid}/predictors`);
  } else {
    console.log("Scope: collectionGroup('predictors')");
  }

  // Build query: scoped or full collectionGroup scan.
  const query = uid
    ? db.collection(`users/${uid}/predictors`)
    : db.collectionGroup('predictors');

  const snapshot = await query.get();

  // Classify docs.
  const toMigrate: admin.firestore.DocumentReference[] = [];
  let alreadyHas = 0;

  for (const doc of snapshot.docs) {
    if (needsBackfill(doc.data() as Pick<Predictor, 'pixelArt'>)) {
      toMigrate.push(doc.ref);
    } else {
      alreadyHas++;
    }
  }

  console.log(
    `Total: ${snapshot.size} | Would migrate: ${toMigrate.length} | Already has pixelArt: ${alreadyHas}`,
  );

  // Dry-run or nothing to do — exit without writes.
  if (DRY_RUN || toMigrate.length === 0) {
    console.log('\nDone');
    return;
  }

  // Batched write phase — chunk into ≤500-op batches (Firestore hard limit).
  let batchCount = 0;
  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const chunk = toMigrate.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const ref of chunk) {
      // batch.update adds ONLY pixelArt — all other fields (avatar, avatarUrl, etc.) untouched (D-01/D-02).
      batch.update(ref, { pixelArt: buildBackfillPixelArt(ref.id) });
    }
    await batch.commit();
    batchCount++;
  }

  console.log(`Migrated: ${toMigrate.length} | Batches committed: ${batchCount}`);
  console.log('\nDone');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
