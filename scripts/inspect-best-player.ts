import admin from 'firebase-admin';

// Read-only diagnostic for a single predictor's best-player bet and totals.
// Usage: pnpm inspect:best-player -- <predictorId>
//   e.g. pnpm inspect:best-player -- 1780839013781

const TOURNAMENT_ID = 'world-cup-2026';
const CORRECT_POINTS = 5;

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId =
      process.env.PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID ?? 'demo-quiniela';
    console.log(`Connected to Firebase Emulator (${process.env.FIRESTORE_EMULATOR_HOST})`);
    return admin.initializeApp({ projectId });
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  console.warn(
    'WARNING: FIREBASE_SERVICE_ACCOUNT not set — falling back to Application Default Credentials.',
  );
  return admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore(initAdmin());

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

function fuzzyMatch(predicted: string, actual: string): boolean {
  const np = normalizeName(predicted ?? '');
  const na = normalizeName(actual ?? '');
  if (!np || !na) return false;
  if (np.includes(na) || na.includes(np)) return true;
  const pw = np.split(/\s+/).filter(Boolean);
  const aw = na.split(/\s+/).filter(Boolean);
  const ps = pw[pw.length - 1];
  const as = aw[aw.length - 1];
  return Boolean(ps && as && ps.length > 2 && ps === as);
}

async function main() {
  // predictorId is the composite `${userId}-${timestamp}` (also the bet doc ID).
  const predictorId = process.argv.slice(2).find((a) => !a.startsWith('-'));
  if (!predictorId) {
    console.error(
      'Pass a predictorId, e.g. pnpm inspect:best-player -- TYTrOtOgBAcHVICyrL44oZWYvW82-1780839013781',
    );
    process.exit(1);
  }

  console.log(`Inspecting predictor ${predictorId} in ${TOURNAMENT_ID}\n`);

  // Actual result
  const resultSnap = await db
    .doc(`tournaments/${TOURNAMENT_ID}/best_players_results/actual`)
    .get();
  const result = resultSnap.exists ? resultSnap.data() : null;
  console.log('best_players_results/actual:', result ?? '(missing)');

  // The bet
  const betSnap = await db
    .doc(`tournaments/${TOURNAMENT_ID}/best_players_bets/${predictorId}`)
    .get();
  if (!betSnap.exists) {
    console.log(`\nNo best_players_bets/${predictorId} document — this predictor never submitted.`);
    return;
  }
  const bet = betSnap.data() as {
    userId?: string;
    predictorId?: string;
    bestScorer?: string;
    bestGoalkeeper?: string;
    points?: number;
  };

  // Fall back to deriving userId from the composite predictorId when the bet
  // doc is missing the userId field (e.g. written by set-best-player-bet.ts).
  const derivedUserId =
    predictorId.lastIndexOf('-') > 0 ? predictorId.slice(0, predictorId.lastIndexOf('-')) : null;
  const effectiveUserId = bet.userId ?? derivedUserId ?? undefined;
  if (!bet.userId) {
    console.log(
      `\n⚠ bet.userId is missing — derived "${derivedUserId}" from the doc ID. ` +
        'This bet is orphaned from recompute-predictor-totals (no predictorId field).',
    );
  }

  const predictorSnap = effectiveUserId
    ? await db.doc(`users/${effectiveUserId}/predictors/${predictorId}`).get()
    : null;
  const predictorName = (predictorSnap?.data()?.name as string | undefined) ?? '(unnamed)';
  console.log(`\nPredictor name: "${predictorName}"`);

  console.log(`\nbest_players_bets/${predictorId}:`, {
    userId: bet.userId,
    predictorId: bet.predictorId,
    bestScorer: bet.bestScorer,
    bestGoalkeeper: bet.bestGoalkeeper,
    points: bet.points,
  });

  // Recompute what the score SHOULD be
  const topScorer = (result?.topScorer as string) ?? '';
  const bestGoalkeeper = (result?.bestGoalkeeper as string) ?? '';
  const scorerHit = topScorer ? fuzzyMatch(bet.bestScorer ?? '', topScorer) : false;
  const gkHit = bestGoalkeeper ? fuzzyMatch(bet.bestGoalkeeper ?? '', bestGoalkeeper) : false;
  const expected = (scorerHit ? CORRECT_POINTS : 0) + (gkHit ? CORRECT_POINTS : 0);
  console.log(
    `\nExpected points: ${expected}  ` +
      `[scorer "${bet.bestScorer}" vs "${topScorer}" = ${scorerHit}, ` +
      `gk "${bet.bestGoalkeeper}" vs "${bestGoalkeeper}" = ${gkHit}]`,
  );
  console.log(`Stored bet.points: ${bet.points ?? 0}  ${expected === (bet.points ?? 0) ? '(match)' : '(MISMATCH — bet needs re-scoring)'}`);

  // The stats doc (totals)
  const userId = effectiveUserId;
  if (userId) {
    const statsSnap = await db
      .doc(`users/${userId}/predictors/${predictorId}/stats/${TOURNAMENT_ID}`)
      .get();
    if (statsSnap.exists) {
      const s = statsSnap.data() ?? {};
      console.log(`\nstats/${TOURNAMENT_ID}:`, {
        totalPoints: s.totalPoints,
        matchPoints: s.matchPoints,
        groupPoints: s.groupPoints,
        knockoutPoints: s.knockoutPoints,
        finalFourPoints: s.finalFourPoints,
        bestPlayerPoints: s.bestPlayerPoints,
      });
      const bpp = (s.bestPlayerPoints as number | undefined) ?? 0;
      console.log(
        `\nbestPlayerPoints in stats: ${bpp}  ` +
          `${bpp === (bet.points ?? 0) ? '(match)' : '(MISMATCH — totals need recompute)'}`,
      );
    } else {
      console.log(`\nNo stats/${TOURNAMENT_ID} doc for this predictor.`);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
