import * as admin from 'firebase-admin';

if (process.env.FUNCTIONS_EMULATOR === 'true') {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

admin.initializeApp();

const db = admin.firestore();

export { calculateMatchResult } from './calculateMatchResult';
export { updateGroupStandings } from './updateGroupStandings';
export { updatePredictorStats } from './updatePredictorStats';
export { checkAndAwardBadges } from './checkAndAwardBadges';

export { standings } from './api/standings';
export { rankings } from './api/rankings';
export { live } from './api/live';

export { db };
