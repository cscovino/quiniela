import type { CombinationKey, ThirdPlaceMapping } from '../data/third-place-matrix';

let cachedMatrix: Record<CombinationKey, ThirdPlaceMapping> | null = null;

function getUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const path = `${base}data/third-place-matrix.json`.replace(/\/+/g, '/');
  return path;
}

export async function loadThirdPlaceMatrix(): Promise<Record<CombinationKey, ThirdPlaceMapping>> {
  if (cachedMatrix) return cachedMatrix;

  // A failed load returns an empty matrix but does NOT latch — a later call
  // retries, so a single transient fetch error can't permanently disable the
  // third-place bracket for the rest of the session.
  try {
    const res = await fetch(getUrl(), { cache: 'force-cache' });
    if (!res.ok) {
      console.warn(`Failed to load third-place matrix: ${res.status} ${res.statusText}`);
      return {};
    }

    cachedMatrix = (await res.json()) as Record<CombinationKey, ThirdPlaceMapping>;
    return cachedMatrix;
  } catch {
    console.warn('Failed to load third-place matrix — fetch unavailable');
    return {};
  }
}
