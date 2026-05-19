import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: pnpm set-admin <user-id>');
  process.exit(1);
}

async function setAdminRole() {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.error(`User ${userId} not found`);
    process.exit(1);
  }

  await updateDoc(userRef, { role: 'admin' });
  console.log(`✅ User ${userId} is now an admin`);
}

setAdminRole().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
