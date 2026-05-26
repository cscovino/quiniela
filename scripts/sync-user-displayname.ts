import admin from 'firebase-admin';

async function run() {
  const uid = process.argv[2];
  if (!uid) {
    console.error('Usage: tsx --env-file=.env scripts/sync-user-displayname.ts <uid>');
    process.exit(1);
  }

  if (admin.apps.length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  const firestore = admin.firestore();
  const userDoc = await firestore.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    console.error(`User document ${uid} not found in Firestore`);
    process.exit(1);
  }

  const data = userDoc.data()!;
  const displayName = data.displayName as string;
  if (!displayName) {
    console.error(`No displayName found in Firestore document for ${uid}`);
    process.exit(1);
  }

  await admin.auth().updateUser(uid, { displayName });
  console.log(`✓ Updated Auth displayName for ${uid} → "${displayName}"`);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
