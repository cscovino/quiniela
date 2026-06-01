/**
 * Groups point-history entries by local calendar day and sums the points
 * within each day.  The resulting Map key is the string produced by
 * `Date.prototype.toLocaleDateString()` — consistent within a single
 * browser session and already used for x-axis label formatting in the
 * PointsChart component.
 *
 * Design notes:
 * - Pure function — no side effects, no imports required.
 * - Empty input returns an empty Map naturally (no special-case needed).
 * - Does not throw; callers receive an empty Map for empty input.
 */
export function bucketByLocalDay(entries: { date: Date; points: number }[]): Map<string, number> {
  const bucket = new Map<string, number>();
  for (const entry of entries) {
    const key = entry.date.toLocaleDateString();
    bucket.set(key, (bucket.get(key) ?? 0) + entry.points);
  }
  return bucket;
}
