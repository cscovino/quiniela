import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID });
  }
}

const db = admin.firestore();
const TOURNAMENT_ID = 'world-cup-2026';
const PREDICTOR_ID = 'rpHvX28zt6XmZTkWU2jCbZ6v0Sl2-1781180529529';

async function main() {
  const bets = [
    { matchId: 'match-j1', homeScore: 2, awayScore: 0 },
    { matchId: 'match-j2', homeScore: 2, awayScore: 0 },
    { matchId: 'match-j3', homeScore: 3, awayScore: 0 },
    { matchId: 'match-j4', homeScore: 1, awayScore: 1 },
    { matchId: 'match-j5', homeScore: 4, awayScore: 0 },
    { matchId: 'match-j6', homeScore: 1, awayScore: 2 },
  ];

  for (const bet of bets) {
    const docId = `${PREDICTOR_ID}-${bet.matchId}`;
    await db.collection('tournaments').doc(TOURNAMENT_ID).collection('bets').doc(docId).set({
      predictorId: PREDICTOR_ID, matchId: bet.matchId,
      homeScore: bet.homeScore, awayScore: bet.awayScore,
      points: 0, isExact: false, isWinner: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✓ Set ${docId}: ${bet.homeScore}-${bet.awayScore}`);
  }

  console.log('\n=== Group B Bet (group_bets doc) ===');
  const groupBetRef = db.collection('tournaments').doc(TOURNAMENT_ID).collection('group_bets').doc(PREDICTOR_ID);
  const groupBet = await groupBetRef.get();
  if (groupBet.exists) {
    console.log(JSON.stringify(groupBet.data(), null, 2));
  } else {
    console.log('No group_bets doc found for this predictor');
  }
}

main().catch(console.error);