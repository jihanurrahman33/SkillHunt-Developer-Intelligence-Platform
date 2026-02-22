// Cache utility
// In-memory cache with TTL support for read-heavy data

const cache = new Map();

const CACHE_TTL = {
  DEVELOPER_LIST: 5 * 60 * 1000,    // 5 minutes
  DEVELOPER_PROFILE: 10 * 60 * 1000, // 10 minutes
  ANALYTICS: 2 * 60 * 1000,          // 2 minutes
  CAMPAIGNS: 5 * 60 * 1000,          // 5 minutes
};

export function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setInCache(key, data, ttl) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

export function invalidateCache(pattern) {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) {
      cache.delete(key);
    }
  }
}

export { CACHE_TTL };
