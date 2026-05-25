/**
 * One-time bootstrap script to grant the FIRST admin role.
 *
 * The Cloud Function `setUserRole` requires the caller to already be an admin,
 * so it cannot mint the very first admin. This script uses the Admin SDK with
 * Application Default Credentials to bypass that gate.
 *
 * Prereqs:
 *   1. gcloud CLI installed: https://cloud.google.com/sdk/docs/install
 *   2. Authenticated: gcloud auth application-default login
 *   3. Project selected:  gcloud config set project quiniela-e840d
 *
 * Usage:
 *   tsx scripts/bootstrap-first-admin.ts <firebase-auth-uid>
 *
 * After running:
 *   - The user must sign out and back in for the new custom claim to take
 *     effect on their ID token.
 *   - From then on, `pnpm set-admin <uid>` (the existing script) can be used
 *     by this first admin to grant admin to others, once that script is fixed
 *     to sign in before calling the function.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'quiniela-e840d';

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: tsx scripts/bootstrap-first-admin.ts <firebase-auth-uid>');
  process.exit(1);
}

initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
});

async function bootstrap() {
  await getAuth().setCustomUserClaims(uid, { role: 'admin' });
  await getFirestore().doc(`users/${uid}`).set({ role: 'admin' }, { merge: true });

  // eslint-disable-next-line no-console
  console.log(`✓ Custom claim set:  role=admin on ${uid}`);
  // eslint-disable-next-line no-console
  console.log(`✓ Firestore updated: users/${uid}.role = 'admin'`);
  // eslint-disable-next-line no-console
  console.log('Sign out and back in to refresh the ID token.');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed:', err);
  process.exit(1);
});
