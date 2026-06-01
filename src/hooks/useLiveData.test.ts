import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAllCache, invalidateCache, useLiveData } from './useLiveData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRankings(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: i, name: `Player ${i}` }));
}

const CACHE_KEY = 'test-rankings';

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useLiveData', () => {
  beforeEach(() => {
    clearAllCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test 1: cache-hit path settles loading=false
   *
   * The bug: cache-hit early-return calls setData but NOT setLoading(false).
   * To observe this with a fresh hook (loading starts false), we must drive
   * loading to true FIRST by switching from a cache-miss key to a cache-warm
   * key.  When cacheKey changes:
   *   1. The previous effect cleanup runs (cancels old fetch — but loading is
   *      still true because setLoading(false) only fires inside the fetch
   *      resolution, which is now cancelled).
   *   2. The new effect fires, cache hit, setData called, bare return.
   *      Without the fix, setLoading(false) is never called — loading stays true.
   */
  describe('Test 1: cache-hit path settles loading=false', () => {
    it('sets loading=false on cache-hit even when loading was true before the key change', async () => {
      const warmData = makeRankings(5);

      // Pre-warm cache for CACHE_KEY by letting a first hook instance settle
      const fetcherWarm = vi.fn().mockResolvedValue(warmData);
      const { unmount: unmountWarm } = renderHook(() => useLiveData(CACHE_KEY, fetcherWarm, []));
      await waitFor(() => expect(fetcherWarm).toHaveBeenCalledTimes(1));
      unmountWarm();

      // Now render a new hook instance that starts on a DIFFERENT (cold) key
      // with a never-resolving fetcher so loading stays true
      const neverResolves = vi.fn(() => new Promise<never>(() => {}));
      const { result, rerender } = renderHook(
        ({ cacheKey }: { cacheKey: string }) =>
          useLiveData(cacheKey, neverResolves, makeRankings(0)),
        { initialProps: { cacheKey: 'cold-key' } },
      );

      // loading must go true (fetching cold-key — never resolves)
      await waitFor(() => expect(result.current.loading).toBe(true));

      // Switch cacheKey to the pre-warmed key — cache hit should settle loading
      await act(async () => {
        rerender({ cacheKey: CACHE_KEY });
      });

      // loading MUST be false — cache-hit branch must call setLoading(false)
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toEqual(warmData);
    });
  });

  /**
   * Test 2: empty-array branch settles data=initialData
   *
   * The bug: when fetcher resolves [] and initialData is non-empty, the branch
   * calls setLoading(false) but never calls setData — so if an earlier setData
   * call had changed data to something else, data would not revert to initialData.
   *
   * We trigger this by:
   *   1. Rendering on KEY_A → staleData is set into component state.
   *   2. Switching to KEY_B (cold) with a fetcher that returns [].
   *      Since data is still staleData from KEY_A, and setData(initialData) is
   *      missing in the broken code, data stays as staleData instead of
   *      reverting to initialData.
   */
  describe('Test 2: empty-array branch settles data=initialData', () => {
    it('resets data to initialData (not stale data from a prior key) when fetcher resolves []', async () => {
      const initialData = makeRankings(3);
      const staleData = makeRankings(7);
      const KEY_A = 'key-stale';
      const KEY_B = 'key-empty';

      // Fetchers
      const fetcherStale = vi.fn().mockResolvedValue(staleData);
      const fetcherEmpty = vi.fn().mockResolvedValue([]);

      // First render on KEY_A — data becomes staleData
      const { result, rerender } = renderHook(
        ({ cacheKey, fetcher }: { cacheKey: string; fetcher: () => Promise<unknown> }) =>
          useLiveData(cacheKey, fetcher, initialData),
        { initialProps: { cacheKey: KEY_A, fetcher: fetcherStale } },
      );

      // Wait for staleData to settle into component state
      await waitFor(() => expect(result.current.data).toEqual(staleData));
      expect(result.current.loading).toBe(false);

      // Switch to KEY_B with a fetcher that returns [] — triggers empty-array branch
      // (KEY_B is cold — not in cache — so the effect will fetch and hit the branch)
      await act(async () => {
        rerender({ cacheKey: KEY_B, fetcher: fetcherEmpty });
      });

      // Wait for loading to settle
      await waitFor(() => expect(result.current.loading).toBe(false));

      // data MUST be initialData — empty-array branch must call setData(initialData)
      // Without the fix, data stays as staleData (makeRankings(7)) from the prior render
      expect(result.current.data).toEqual(initialData);
    });
  });

  /**
   * Test 3: normal fetch path (regression guard)
   *
   * When fetcher resolves with a non-empty array, data is updated and loading=false.
   */
  describe('Test 3: normal fetch path (regression guard)', () => {
    it('updates data and settles loading=false when fetcher resolves with non-empty data', async () => {
      const initialData = makeRankings(0);
      const freshData = makeRankings(5);
      const fetcher = vi.fn().mockResolvedValue(freshData);

      const { result } = renderHook(() => useLiveData(CACHE_KEY, fetcher, initialData));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual(freshData);
      expect(result.current.error).toBeNull();
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Test 4: effect deps array — no re-fetch on fetcher reference change
   *
   * useEffect dependency array must be [cacheKey] only. Changing the fetcher
   * reference between renders with a stable cacheKey must NOT re-fire the effect.
   */
  describe('Test 4: effect deps array — no re-fetch on fetcher reference change', () => {
    it('does NOT re-fire the effect when fetcher reference changes between renders (stable cacheKey)', async () => {
      const initialData = makeRankings(0);
      const freshData = makeRankings(5);

      const fetcher1 = vi.fn().mockResolvedValue(freshData);
      const fetcher2 = vi.fn().mockResolvedValue(makeRankings(99));

      const { result, rerender } = renderHook(
        ({ fetcher }: { fetcher: () => Promise<typeof freshData> }) =>
          useLiveData(CACHE_KEY, fetcher, initialData),
        { initialProps: { fetcher: fetcher1 } },
      );

      // Wait for first fetch
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(fetcher1).toHaveBeenCalledTimes(1);

      // Re-render with a different fetcher reference but SAME cacheKey
      await act(async () => {
        rerender({ fetcher: fetcher2 });
      });

      // fetcher2 must NOT have been called — deps array is [cacheKey] only
      expect(fetcher2).not.toHaveBeenCalled();
      // data should still reflect the first fetch result (from cache now)
      expect(result.current.data).toEqual(freshData);
    });
  });

  /**
   * API stability: invalidateCache and clearAllCache exports must remain.
   */
  describe('invalidateCache / clearAllCache exports (API stability)', () => {
    it('invalidateCache removes a specific key from cache', async () => {
      const initialData = makeRankings(0);
      const freshData = makeRankings(5);
      const fetcher = vi.fn().mockResolvedValue(freshData);

      // Populate cache
      const { unmount } = renderHook(() => useLiveData(CACHE_KEY, fetcher, initialData));
      await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
      unmount();

      // Invalidate
      invalidateCache(CACHE_KEY);

      // Next render should fetch again
      const fetcher2 = vi.fn().mockResolvedValue(freshData);
      const { result } = renderHook(() => useLiveData(CACHE_KEY, fetcher2, initialData));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });

    it('clearAllCache removes all cache entries', async () => {
      const initialData = makeRankings(0);
      const freshData = makeRankings(5);
      const fetcher = vi.fn().mockResolvedValue(freshData);

      // Populate cache
      const { unmount } = renderHook(() => useLiveData('key-a', fetcher, initialData));
      await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
      unmount();

      clearAllCache();

      // Next render should fetch again
      const fetcher2 = vi.fn().mockResolvedValue(freshData);
      const { result } = renderHook(() => useLiveData('key-a', fetcher2, initialData));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });
  });
});
