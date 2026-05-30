/**
 * Public Firebase web config, sourced from `PUBLIC_*` env vars.
 *
 * Shared by the runtime client singleton (`src/services/firebase.ts`) and the
 * build-time data fetcher (`src/lib/build-data.ts`) so the two never drift.
 * The build-time fetcher initializes this under a NAMED app to avoid colliding
 * with the default app if both run in the same JS environment.
 */
export interface PublicFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getPublicFirebaseConfig(): PublicFirebaseConfig {
  return {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  };
}
