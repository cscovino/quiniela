import admin from 'firebase-admin';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

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

const db = getFirestore();
const TOURNAMENT_ID = 'world-cup-2026';

interface StatsDoc {
  totalPoints?: number;
  exactBets?: number;
  winnerBets?: number;
  totalBets?: number;
  accuracy?: number;
  currentStreak?: number;
  maxStreak?: number;
  exactStreak?: number;
  maxExactStreak?: number;
  badgesAwarded?: Record<string, string>;
  groupQualified?: number;
  percentile?: number;
  pointsHistory?: Array<{ timestamp: admin.firestore.Timestamp; points: number; matchId: string }>;
  lastUpdated?: admin.firestore.Timestamp;
}

function checkBadgeEligibility(badgeId: string, stats: StatsDoc): boolean {
  switch (badgeId) {
    case 'first-blood':
      return (stats.exactBets ?? 0) >= 1;
    case 'back-to-back':
      return (stats.exactStreak ?? 0) >= 2;
    case 'on-fire':
      return (stats.exactStreak ?? 0) >= 3;
    case 'perfectionist':
      return (stats.exactBets ?? 0) >= 5;
    case 'almost-perfect':
      return (stats.winnerBets ?? 0) >= 12;
    case 'consistent':
      return (stats.winnerBets ?? 0) >= 20;
    case 'perfect-group':
      return (stats.groupQualified ?? 0) >= 16;
    case 'top-10':
      return (stats.percentile ?? 1) <= 0.05;
    case 'clairvoyant':
      return false;
    default:
      return false;
  }
}

async function fixBadges(): Promise<void> {
  console.log('🔧 Starting badge fix...\n');

  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('🟡 DRY RUN MODE - no changes will be made\n');
  }

  const statsQuery = await db.collectionGroup('stats').get();

  console.log(`Found ${statsQuery.size} stats documents\n`);

  let fixedCount = 0;
  let checkedCount = 0;

  for (const statsDoc of statsQuery.docs) {
    checkedCount++;

    const pathParts = statsDoc.ref.path.split('/');
    const tournamentId = pathParts[pathParts.length - 1];

    if (tournamentId !== TOURNAMENT_ID) {
      continue;
    }

    const predictorId = pathParts[3];

    const stats = statsDoc.data() as StatsDoc;
    const currentBadges = stats.badgesAwarded || {};
    const correctBadges: Record<string, string> = {};

    let hadIncorrectBadge = false;

    for (const [badgeId, awardedAt] of Object.entries(currentBadges)) {
      if (badgeId === 'clairvoyant') {
        correctBadges[badgeId] = awardedAt;
        continue;
      }

      if (checkBadgeEligibility(badgeId, stats)) {
        correctBadges[badgeId] = awardedAt;
      } else {
        console.log(
          `  ❌ ${predictorId}: removing "${badgeId}" badge (doesn't meet criteria)`,
        );
        hadIncorrectBadge = true;
      }
    }

    for (const badgeDef of [
      'first-blood',
      'back-to-back',
      'on-fire',
      'perfectionist',
      'almost-perfect',
      'consistent',
      'perfect-group',
      'top-10',
    ]) {
      if (!correctBadges[badgeDef] && checkBadgeEligibility(badgeDef, stats)) {
        correctBadges[badgeDef] = new Date().toISOString();
        console.log(
          `  ✅ ${predictorId}: awarding "${badgeDef}" badge (meets criteria)`,
        );
        hadIncorrectBadge = true;
      }
    }

    if (hadIncorrectBadge) {
      if (dryRun) {
        console.log(
          `  → Would update badges for ${predictorId}: ${Object.keys(correctBadges).join(', ') || '(none)'}\n`,
        );
      } else {
        await statsDoc.ref.update({
          badgesAwarded: correctBadges,
          lastUpdated: FieldValue.serverTimestamp(),
        });
        console.log(
          `  → Updated badges for ${predictorId}: ${Object.keys(correctBadges).join(', ') || '(none)'}\n`,
        );
      }
      fixedCount++;
    }
  }

  console.log(`\n✅ Badge fix complete!`);
  console.log(`   Checked: ${checkedCount} predictors`);
  console.log(`   Fixed: ${fixedCount} predictors`);
}

fixBadges().catch((err) => {
  console.error('❌ Badge fix failed:', err);
  process.exit(1);
});