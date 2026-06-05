import admin from 'firebase-admin';

let app: admin.app.App | null = null;

// `astro dev` doesn't export `.env` into `process.env` (Vite injects into
// `import.meta.env` instead), so the SSR fetch path silently falls through to
// applicationDefault and fails with "Unable to detect a Project Id". Fall back
// to `import.meta.env` so `pnpm dev` works without a shell wrapper.
function readEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
  return viteEnv?.[key];
}

export function getFirebaseAdmin() {
  if (!app) {
    if (admin.apps.length === 0) {
      const serviceAccountJson = readEnv('FIREBASE_SERVICE_ACCOUNT');
      if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else if (readEnv('FUNCTIONS_EMULATOR') === 'true') {
        app = admin.initializeApp({
          projectId: readEnv('FIREBASE_PROJECT_ID'),
        });
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
        process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
      } else {
        app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      }
    } else {
      app = admin.apps[0];
    }
  }
  return app;
}

export function getAuth() {
  const admin = getFirebaseAdmin();
  if (!admin) throw new Error('Firebase admin not initialized');
  return admin.auth();
}

export function getFirestore() {
  const admin = getFirebaseAdmin();
  if (!admin) throw new Error('Firebase admin not initialized');
  return admin.firestore();
}
