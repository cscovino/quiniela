import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import type { Messaging } from 'firebase/messaging';

let messaging: Messaging | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

if (typeof window !== 'undefined' && typeof ServiceWorkerRegistration !== 'undefined') {
  import('firebase/messaging')
    .then(({ getMessaging }) => {
      try {
        messaging = getMessaging(app);
      } catch {
        messaging = null;
      }
    })
    .catch(() => {
      messaging = null;
    });
}

setPersistence(auth, browserLocalPersistence).catch(() => {
  // Persistence setup failure is non-critical
});

export { messaging };
export default app;
