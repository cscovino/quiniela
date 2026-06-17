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

function parseArgs(): { predictorId: string; bestScorer?: string; bestGoalkeeper?: string } {
  const args = process.argv.slice(2);
  const predictorId = args.find((a) => !a.startsWith('--')) ?? '';
  const bestScorer = extract('bestScorer', args) ?? undefined;
  const bestGoalkeeper = extract('bestGoalkeeper', args) ?? undefined;

  return { predictorId, bestScorer, bestGoalkeeper };
}

function extract(flag: string, args: string[]): string | null {
  const idx = args.findIndex((a) => a === `--${flag}` || a.startsWith(`--${flag}=`));
  if (idx === -1) return null;
  const val = args[idx];
  if (val.includes('=')) return val.split('=')[1];
  return args[idx + 1] ?? null;
}

async function main() {
  const execute = process.argv.includes('--execute');
  const { predictorId, bestScorer, bestGoalkeeper } = parseArgs();

  if (!predictorId) {
    console.log('Usage: pnpm tsx scripts/set-best-player-bet.ts <predictorId> [--bestScorer=<name>] [--bestGoalkeeper=<name>] [--execute]');
    console.log('Example: pnpm tsx scripts/set-best-player-bet.ts abc123 --bestScorer=Ronaldo --bestGoalkeeper=Pickford --execute');
    process.exit(1);
  }

  console.log(`Predictor ID: ${predictorId}`);
  console.log(`Best Scorer: ${bestScorer ?? '(not set)'}`);
  console.log(`Best Goalkeeper: ${bestGoalkeeper ?? '(not set)'}`);
  console.log(`Doc: tournaments/${TOURNAMENT_ID}/best_players_bets/${predictorId}`);
  console.log(execute ? 'Executing...\n' : 'DRY RUN — pass --execute to write\n');

  if (!execute) return;

  const data: Record<string, string> = {};
  if (bestScorer) data.bestScorer = bestScorer;
  if (bestGoalkeeper) data.bestGoalkeeper = bestGoalkeeper;

  if (Object.keys(data).length === 0) {
    console.log('No bet data to write.');
    return;
  }

  await db
    .collection('tournaments')
    .doc(TOURNAMENT_ID)
    .collection('best_players_bets')
    .doc(predictorId)
    .set(data);

  console.log('Done.');
}

main().catch((err) => { console.error(err); process.exit(1); });
