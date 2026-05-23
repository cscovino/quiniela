import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: pnpm set-admin <user-id>');
  process.exit(1);
}

async function setAdminRole() {
  const setUserRole = httpsCallable(functions, 'setUserRole');

  try {
    const result = await setUserRole({ uid: userId, role: 'admin' });
    console.log(`✅ User ${userId} is now an admin`);
    console.log('Result:', result.data);
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

setAdminRole().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
