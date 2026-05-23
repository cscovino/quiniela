import admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (!app) {
    if (admin.apps.length === 0) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else if (process.env.FUNCTIONS_EMULATOR === 'true') {
        app = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
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
  return getFirebaseAdmin().auth();
}

export function getFirestore() {
  return getFirebaseAdmin().firestore();
}
