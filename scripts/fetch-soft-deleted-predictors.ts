import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();

interface SoftDeletedPredictor {
  userId: string;
  predictorId: string;
  email: string;
  predictorName: string;
  deletedAt: string;
}

async function getSoftDeletedPredictors(): Promise<SoftDeletedPredictor[]> {
  const deleted: SoftDeletedPredictor[] = [];

  const usersSnap = await db.collection('users').get();

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const email = (userDoc.data().email as string | undefined) ?? '';
    const predictorsSnap = await userDoc.ref
      .collection('predictors')
      .where('deletedAt', '!=', null)
      .get();

    for (const predictorDoc of predictorsSnap.docs) {
      const data = predictorDoc.data();
      const deletedAt = data.deletedAt?.toDate?.()?.toISOString() ?? String(data.deletedAt);
      deleted.push({
        userId,
        predictorId: predictorDoc.id,
        email,
        predictorName: data.name ?? '(unnamed)',
        deletedAt,
      });
    }
  }

  return deleted;
}

async function main() {
  const csvMode = process.argv.includes('--csv');

  console.log('Fetching soft-deleted predictors...\n');

  const deleted = await getSoftDeletedPredictors();

  if (deleted.length === 0) {
    console.log('No soft-deleted predictors found.');
    return;
  }

  if (csvMode) {
    console.log('userId,email,predictorId,predictorName,deletedAt');
    for (const p of deleted.sort((a, b) => a.userId.localeCompare(b.userId))) {
      console.log([p.userId, p.email, p.predictorId, `"${p.predictorName}"`, p.deletedAt].join(','));
    }
  } else {
    console.log(`Found ${deleted.length} soft-deleted predictor(s):\n`);
    for (const p of deleted) {
      console.log(`User: ${p.userId}`);
      console.log(`  Email: ${p.email}`);
      console.log(`  Predictor: "${p.predictorName}"`);
      console.log(`  ID: ${p.predictorId}`);
      console.log(`  Deleted At: ${p.deletedAt}`);
      console.log();
    }
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
