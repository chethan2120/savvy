// Client-side API request deduplication and memory cache

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds

async function fetchWithDeduplication<T>(
  key: string,
  url: string,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key);
  if (existing && now - existing.timestamp < ttlMs) {
    return existing.data as T;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: ttlMs === 0 ? 'no-store' : 'default',
      });
      if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
      }
      const data = await res.json();
      cache.set(key, { data, timestamp: Date.now() });
      return data as T;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

export async function getCachedCategories() {
  return fetchWithDeduplication<{ ok: boolean; categories: any[] }>(
    'categories',
    '/api/categories',
    0
  );
}

export async function getCachedCourses() {
  return fetchWithDeduplication<{ ok: boolean; courses: any[] }>(
    'public-courses',
    '/api/public-courses',
    0
  );
}

export async function getCachedSession() {
  return fetchWithDeduplication<{ authenticated: boolean; account: any | null }>(
    'auth-session',
    '/api/auth/session',
    10000 // 10 seconds for session
  );
}

export function invalidateApiCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
