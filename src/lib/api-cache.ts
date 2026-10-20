/**
 * Hafif ve tipi korumalı in-memory önbellek mekanizması.
 * Sunucu tarafında sıkça okunan ve nadiren değişen verilerin (duyurular, yönetmelikler,
 * ayarlar, aktif mesai listesi) cross-region veritabanı sorgu trafiğini %90+ azaltır.
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

const globalStore = globalThis as unknown as {
  __apiCacheStore?: Map<string, CacheEntry<any>>;
};

const store = globalStore.__apiCacheStore || new Map<string, CacheEntry<any>>();
globalStore.__apiCacheStore = store;

export async function getOrSetCache<T>(
  key: string,
  ttlMs: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const entry = store.get(key);

  if (entry && now - entry.cachedAt < ttlMs) {
    return entry.data as T;
  }

  const freshData = await fetchFn();
  store.set(key, { data: freshData, cachedAt: now });
  return freshData;
}

export function invalidateCache(keyPrefix: string) {
  store.forEach((_val, key) => {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
    }
  });
}
