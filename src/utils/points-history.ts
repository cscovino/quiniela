/**
 * Groups point-history entries by local calendar day and sums the points
 * within each day.  The resulting Map key is a locale-independent ISO
 * date string in YYYY-MM-DD format built from the local year/month/day
 * components so that the key is stable across all browser locales and
 * can be safely re-parsed by the chart without ambiguity.
 *
 * Design notes:
 * - Pure function — no side effects, no imports required.
 * - Empty input returns an empty Map naturally (no special-case needed).
 * - Does not throw; callers receive an empty Map for empty input.
 * - Uses local date components (not UTC) so the bucket matches the day
 *   the user's browser shows, regardless of timezone.
 */
export function bucketByLocalDay(entries: { date: Date; points: number }[]): Map<string, number> {
  const bucket = new Map<string, number>();
  for (const entry of entries) {
    const d = entry.date;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    bucket.set(key, (bucket.get(key) ?? 0) + entry.points);
  }
  return bucket;
}
