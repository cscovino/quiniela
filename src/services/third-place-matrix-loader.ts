import type { CombinationKey, ThirdPlaceMapping } from '../data/third-place-matrix';

let cachedMatrix: Record<CombinationKey, ThirdPlaceMapping> | null = null;
let failedOnce = false;

function getUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const path = `${base}data/third-place-matrix.json`.replace(/\/+/g, '/');
  return path;
}

export async function loadThirdPlaceMatrix(): Promise<Record<CombinationKey, ThirdPlaceMapping>> {
  if (cachedMatrix) return cachedMatrix;
  if (failedOnce) return {};

  try {
    const res = await fetch(getUrl(), { cache: 'force-cache' });
    if (!res.ok) {
      failedOnce = true;
      console.warn(`Failed to load third-place matrix: ${res.status} ${res.statusText}`);
      return {};
    }

    cachedMatrix = (await res.json()) as Record<CombinationKey, ThirdPlaceMapping>;
    return cachedMatrix;
  } catch {
    failedOnce = true;
    console.warn('Failed to load third-place matrix — fetch unavailable');
    return {};
  }
}
