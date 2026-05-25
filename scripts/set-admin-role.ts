/**
 * Grant the 'admin' (or 'user') role to a Firebase Auth user by calling the
 * `setUserRole` Cloud Function. The function enforces "only admins can call",
 * so this script signs in as an existing admin first.
 *
 * Required env vars (load via `--env-file=.env`, which `pnpm set-admin` does):
 *   PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID,
 *   PUBLIC_FIREBASE_STORAGE_BUCKET, PUBLIC_FIREBASE_MESSAGING_SENDER_ID, PUBLIC_FIREBASE_APP_ID
 *   ADMIN_EMAIL, ADMIN_PASSWORD  (credentials of an existing admin user)
 *
 * Usage:
 *   pnpm set-admin <target-user-id> [role]
 *
 *   role defaults to 'admin'. Pass 'user' to revoke admin.
 *
 * The very first admin must be created via scripts/bootstrap-first-admin.ts,
 * which uses the Admin SDK to bypass the gate.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

const userId = process.argv[2];
const role = (process.argv[3] || 'admin') as 'admin' | 'user';

if (!userId) {
  console.error('Usage: pnpm set-admin <target-user-id> [role]');
  console.error('  role defaults to "admin". Pass "user" to revoke.');
  process.exit(1);
}

if (!['admin', 'user'].includes(role)) {
  console.error(`Invalid role "${role}". Must be "admin" or "user".`);
  process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
  console.error('These must be credentials of an existing admin user.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

async function run() {
  await signInWithEmailAndPassword(auth, adminEmail!, adminPassword!);

  const setUserRole = httpsCallable<
    { uid: string; role: 'admin' | 'user' },
    { success: boolean; uid: string; role: string }
  >(functions, 'setUserRole');

  const result = await setUserRole({ uid: userId, role });

  // eslint-disable-next-line no-console
  console.log(`✓ ${userId} → role=${role}`);
  // eslint-disable-next-line no-console
  console.log('  Cloud Function response:', result.data);
  // eslint-disable-next-line no-console
  console.log('  Target user must sign out / back in to refresh their ID token.');

  await signOut(auth);
}

run().catch((err: { code?: string; message?: string }) => {
  // eslint-disable-next-line no-console
  console.error('Failed:', err.code || '', err.message || err);
  process.exit(1);
});
