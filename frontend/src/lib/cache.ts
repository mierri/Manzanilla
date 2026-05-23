// Simple in-memory cache with stale-while-revalidate.
// - First call: fetches normally, stores result.
// - Subsequent calls: returns cached data IMMEDIATELY, then refreshes silently.
// - Cache expires after TTL (default 60s); expired data still serves while refreshing.

interface Entry<T> { data: T; ts: number; }

const store = new Map<string, Entry<unknown>>();
const TTL   = 60_000; // 60 seconds

export function invalidate(keyPrefix: string) {
  for (const k of store.keys()) {
    if (k.startsWith(keyPrefix)) store.delete(k);
  }
}

export function invalidateAll() {
  store.clear();
}

/**
 * Wraps a fetcher with stale-while-revalidate caching.
 * - If cached data exists (even stale): resolves immediately with that data,
 *   then revalidates silently and calls `onUpdate` with fresh data.
 * - If no cache: awaits the fetcher normally.
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  onUpdate?: (fresh: T) => void,
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;

  if (hit) {
    const isStale = Date.now() - hit.ts > TTL;
    if (isStale && onUpdate) {
      // Refresh silently in background
      fetcher().then(fresh => {
        store.set(key, { data: fresh, ts: Date.now() });
        onUpdate(fresh);
      }).catch(() => {/* silent */});
    }
    return hit.data;
  }

  // No cache — fetch and store
  const data = await fetcher();
  store.set(key, { data, ts: Date.now() });
  return data;
}
