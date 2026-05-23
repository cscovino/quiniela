import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import type { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _messaging: Messaging | null = null;
let initPromise: Promise<void> | null = null;

function ensureApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export async function initFirebase(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const a = ensureApp();
    _db = getFirestore(a);
    _auth = getAuth(a);
    await setPersistence(_auth, browserLocalPersistence).catch(() => {});
  })();
  return initPromise;
}

export function getDb(): Firestore {
  if (!_db) {
    ensureApp();
    _db = getFirestore(app!);
  }
  return _db;
}

export function getAuthInstance(): Auth {
  if (!_auth) {
    ensureApp();
    _auth = getAuth(app!);
  }
  return _auth;
}

export async function getMessagingInstance(): Promise<Messaging | null> {
  if (_messaging) return _messaging;
  try {
    const { getMessaging } = await import('firebase/messaging');
    _messaging = getMessaging(ensureApp());
    return _messaging;
  } catch {
    return null;
  }
}

export { initFirebase as default };
