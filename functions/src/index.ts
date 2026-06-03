import * as admin from 'firebase-admin';

if (process.env.FUNCTIONS_EMULATOR === 'true') {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

admin.initializeApp();

const db = admin.firestore();

export { live } from './api/live';
export { rankings } from './api/rankings';
export { setUserRole } from './api/setUserRole';
export { standings } from './api/standings';
export { calculateBestPlayerResults } from './calculateBestPlayerResults';
export { calculateFinalFourResults } from './calculateFinalFourResults';
export { calculateGroupResults } from './calculateGroupResults';
export { calculateMatchResult } from './calculateMatchResult';
export { checkAndAwardBadges } from './checkAndAwardBadges';
export { deriveFinalStandings } from './deriveFinalStandings';
export { updateGroupStandings } from './updateGroupStandings';
export { updatePredictorStats } from './updatePredictorStats';

export { db };
