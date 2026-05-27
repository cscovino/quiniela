import { useEffect, useRef, useState } from 'react';

const dataCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute

export interface LiveDataResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export function useLiveData<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  initialData: T,
): LiveDataResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data as T);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetcher()
      .then((freshData) => {
        if (cancelled || !mountedRef.current) return;
        dataCache.set(cacheKey, { data: freshData, timestamp: Date.now() });
        setData(freshData);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled || !mountedRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [cacheKey]);

  return { data, loading, error };
}

export function invalidateCache(cacheKey: string): void {
  dataCache.delete(cacheKey);
}

export function clearAllCache(): void {
  dataCache.clear();
}
