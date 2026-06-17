import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();
const TOURNAMENT_ID = 'world-cup-2026';

const PREDICTOR_ID = 'epueViy0fSdKalH8NzWP3HfBovO2-1781201147020';

interface MatchPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

const matchPredictions: MatchPrediction[] = [
  { matchId: 'match-h1', homeTeam: 'ESP', awayTeam: 'CPV', homeScore: 4, awayScore: 0 },
  { matchId: 'match-h2', homeTeam: 'KSA', awayTeam: 'URU', homeScore: 0, awayScore: 1 },
  { matchId: 'match-h3', homeTeam: 'ESP', awayTeam: 'KSA', homeScore: 2, awayScore: 1 },
  { matchId: 'match-h4', homeTeam: 'CPV', awayTeam: 'URU', homeScore: 1, awayScore: 1 },
  { matchId: 'match-h5', homeTeam: 'ESP', awayTeam: 'URU', homeScore: 0, awayScore: 1 },
  { matchId: 'match-h6', homeTeam: 'CPV', awayTeam: 'KSA', homeScore: 0, awayScore: 1 },
];

async function setMatchBets() {
  console.log('\n=== Setting Match Bets ===');
  for (const bet of matchPredictions) {
    const betId = `${PREDICTOR_ID}-${bet.matchId}`;
    const docRef = db
      .collection('tournaments')
      .doc(TOURNAMENT_ID)
      .collection('bets')
      .doc(betId);

    await docRef.set({
      predictorId: PREDICTOR_ID,
      matchId: bet.matchId,
      homeScore: bet.homeScore,
      awayScore: bet.awayScore,
      points: 0,
      isExact: false,
      isWinner: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`  ✓ ${bet.homeTeam} ${bet.homeScore} - ${bet.awayScore} ${bet.awayTeam} (${bet.matchId})`);
  }
}

async function setFinalPhaseBet() {
  console.log('\n=== Setting Final Phase Bet ===');

  const finalPhaseData = {
    predictorId: PREDICTOR_ID,
    first: 'COL',
    second: 'ARG',
    third: 'GER',
    fourth: 'FRA',
    points: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('final_phase_bets')
    .doc(PREDICTOR_ID)
    .set(finalPhaseData);

  console.log('  ✓ 1st: COL, 2nd: ARG, 3rd: GER, 4th: FRA');
}

async function setBestPlayersBet() {
  console.log('\n=== Setting Best Players Bet ===');

  await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('best_players_bets')
    .doc(PREDICTOR_ID)
    .set({
      predictorId: PREDICTOR_ID,
      bestScorer: 'Luis Diaz',
      bestGoalkeeper: 'Camilo Vargas',
      points: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log('  ✓ Best Scorer: Luis Diaz');
  console.log('  ✓ Best Goalkeeper: Camilo Vargas');
}

async function setGroupBet() {
  console.log('\n=== Setting Group H Bet ===');

  await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('group_bets')
    .doc(`${PREDICTOR_ID}_group-h`)
    .set({
      predictorId: PREDICTOR_ID,
      groupId: 'group-h',
      positions: ['URU', 'ESP', 'KSA', 'CPV'],
      points: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log('  ✓ group-h: [URU, ESP, KSA, CPV]');
}

async function main() {
  const execute = process.argv.includes('--execute');

  if (!execute) {
    console.log('DRY RUN — pass --execute to write to Firestore\n');
    console.log(`Predictor ID: ${PREDICTOR_ID}\n`);

    console.log('Match Predictions:');
    for (const bet of matchPredictions) {
      console.log(`  ${bet.homeTeam} ${bet.homeScore} - ${bet.awayScore} ${bet.awayTeam} (${bet.matchId})`);
    }

    console.log('\nFinal Phase: 1 COL, 2 ARG, 3 GER, 4 FRA');
    console.log('Best Scorer: Luis Diaz');
    console.log('Best Goalkeeper: Camilo Vargas');
    console.log('\nGroup H: [URU, ESP, KSA, CPV]');

    console.log('\n❌ No changes made. Run with --execute to write.');
    return;
  }

  console.log(`Writing predictions for predictor: ${PREDICTOR_ID}\n`);

  try {
    await setMatchBets();
    await setFinalPhaseBet();
    await setBestPlayersBet();
    await setGroupBet();

    console.log('\n✅ All predictions saved successfully!');
  } catch (err) {
    console.error('\n❌ Error writing predictions:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
