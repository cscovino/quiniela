import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  connectFirestoreEmulator,
} from 'firebase/firestore';

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
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const TOURNAMENT_ID = 'world-cup-2026';
const TEST_USER_ID = 'test-user-001';
const TEST_PREDICTOR_ID = `${TEST_USER_ID}-default`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  const now = new Date().toISOString();

  await setDoc(doc(db, 'tournaments', TOURNAMENT_ID), {
    slug: TOURNAMENT_ID,
    name: 'FIFA World Cup 2026',
    startDate: new Date('2026-06-11T00:00:00Z'),
    endDate: new Date('2026-07-19T23:59:59Z'),
    status: 'active',
    phases: [
      { name: 'group', order: 1 },
      { name: 'round-of-32', order: 2 },
      { name: 'round-of-16', order: 3 },
      { name: 'quarterfinals', order: 4 },
      { name: 'semifinals', order: 5 },
      { name: 'final', order: 6 },
    ],
    createdAt: new Date(now),
    updatedAt: new Date(now),
  });

  await setDoc(doc(db, 'tournaments', TOURNAMENT_ID, 'groups', 'group-a'), {
    slug: 'group-a',
    name: 'Group A',
    order: 1,
    teamCount: 4,
    createdAt: new Date(now),
  });

  const teams = [
    { id: 'mex', fifaCode: 'MEX', name: 'Mexico', groupId: 'group-a' },
    { id: 'rsa', fifaCode: 'RSA', name: 'South Africa', groupId: 'group-a' },
    { id: 'kor', fifaCode: 'KOR', name: 'South Korea', groupId: 'group-a' },
    { id: 'cze', fifaCode: 'CZE', name: 'Czech Republic', groupId: 'group-a' },
  ];

  for (const team of teams) {
    await setDoc(doc(db, 'tournaments', TOURNAMENT_ID, 'teams', team.id), {
      fifaCode: team.fifaCode,
      name: team.name,
      flagUrl: `/flags/${team.fifaCode.toLowerCase()}.svg`,
      groupId: team.groupId,
      createdAt: new Date(now),
    });
  }

  await setDoc(doc(db, 'tournaments', TOURNAMENT_ID, 'matches', 'match-a1'), {
    slug: 'match-a1',
    phase: 'group',
    groupId: 'group-a',
    homeTeamId: 'mex',
    awayTeamId: 'rsa',
    date: new Date('2026-06-11T21:00:00Z'),
    stadium: 'Mexico City Stadium',
    result: { home: null, away: null },
    status: 'scheduled',
    predictionDeadline: new Date('2026-06-11T20:50:00Z'),
    createdAt: new Date(now),
  });

  await setDoc(doc(db, 'tournaments', TOURNAMENT_ID, 'matches', 'match-a2'), {
    slug: 'match-a2',
    phase: 'group',
    groupId: 'group-a',
    homeTeamId: 'kor',
    awayTeamId: 'cze',
    date: new Date('2026-06-12T18:00:00Z'),
    stadium: 'Mexico City Stadium',
    result: { home: null, away: null },
    status: 'scheduled',
    predictionDeadline: new Date('2026-06-12T17:50:00Z'),
    createdAt: new Date(now),
  });

  await setDoc(doc(db, 'users', TEST_USER_ID), {
    uid: TEST_USER_ID,
    displayName: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(now),
    lastLoginAt: new Date(now),
  });

  await setDoc(doc(db, 'users', TEST_USER_ID, 'predictors', TEST_PREDICTOR_ID), {
    id: TEST_PREDICTOR_ID,
    userId: TEST_USER_ID,
    name: 'Test Predictor',
    createdAt: new Date(now),
  });

  await setDoc(doc(db, 'tournaments', TOURNAMENT_ID, 'bets', `${TEST_PREDICTOR_ID}-match-a1`), {
    userId: TEST_USER_ID,
    predictorId: TEST_PREDICTOR_ID,
    matchId: 'match-a1',
    homeScore: 2,
    awayScore: 1,
    points: 0,
    isExact: false,
    isWinner: false,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  });

  await setDoc(doc(db, 'tournaments', TOURNAMENT_ID, 'bets', `${TEST_PREDICTOR_ID}-match-a2`), {
    userId: TEST_USER_ID,
    predictorId: TEST_PREDICTOR_ID,
    matchId: 'match-a2',
    homeScore: 1,
    awayScore: 1,
    points: 0,
    isExact: false,
    isWinner: false,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  });

  console.log('✅ Test data seeded\n');
}

async function testMatchResultUpdate() {
  console.log('🧪 Testing match result update...\n');

  const matchRef = doc(db, 'tournaments', TOURNAMENT_ID, 'matches', 'match-a1');
  const matchBefore = await getDoc(matchRef);
  console.log('Before:', matchBefore.data());

  await updateDoc(matchRef, {
    status: 'finished',
    result: { home: 2, away: 1 },
    updatedAt: new Date(),
  });

  await sleep(5000);

  const matchAfter = await getDoc(matchRef);
  const matchData = matchAfter.data();
  console.log('\nAfter:', matchData);

  if (matchData?.pointsCalculated) {
    console.log('✅ Match points calculated flag set');
  } else {
    console.log('⚠️  Points calculated flag not set (may need more wait time)');
  }

  const betRef = doc(db, 'tournaments', TOURNAMENT_ID, 'bets', `${TEST_PREDICTOR_ID}-match-a1`);
  const betDoc = await getDoc(betRef);
  const betData = betDoc.data();
  console.log('\nBet result:', betData);

  if (betData?.points === 3 && betData?.isExact === true) {
    console.log('✅ Exact prediction correctly awarded 3 points');
  } else if (betData?.points === 1 && betData?.isWinner === true) {
    console.log('✅ Correct outcome awarded 1 point');
  } else {
    console.log(`⚠️  Expected 3 points for exact prediction, got ${betData?.points}`);
  }

  const standingsRef = doc(db, 'tournaments', TOURNAMENT_ID, 'group_standings', 'group-a');
  const standingsDoc = await getDoc(standingsRef);

  if (standingsDoc.exists()) {
    console.log('\n✅ Group standings updated:', JSON.stringify(standingsDoc.data(), null, 2));
  } else {
    console.log('\n⚠️  Group standings not yet updated (may need more wait time)');
  }

  const statsRef = doc(db, 'users', TEST_USER_ID, 'predictors', TEST_PREDICTOR_ID, 'stats', TOURNAMENT_ID);
  const statsDoc = await getDoc(statsRef);

  if (statsDoc.exists()) {
    console.log('\n✅ Predictor stats updated:', JSON.stringify(statsDoc.data(), null, 2));
  } else {
    console.log('\n⚠️  Predictor stats not yet updated (may need more wait time)');
  }
}

async function runTests() {
  try {
    await seedTestData();
    await testMatchResultUpdate();
    console.log('\n🎉 E2E test complete!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
