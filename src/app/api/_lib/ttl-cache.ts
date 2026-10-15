/**
 * Wraps an async loader so that, per server instance, it runs at most once per
 * `ttlMs` window. Callers that arrive while a load is in flight share it, and a
 * failed load is never cached.
 *
 * Only for display data that is identical for every user. Never use it for a
 * check that gates an action (those must read the database directly).
 */
export function ttlCached<T>(ttlMs: number, load: () => Promise<T>): () => Promise<T> {
  let value: T | undefined;
  let hasValue = false;
  let expiresAt = 0;
  let inflight: Promise<T> | null = null;

  return () => {
    if (hasValue && expiresAt > Date.now()) return Promise.resolve(value as T);
    if (inflight) return inflight;

    inflight = load()
      .then((result) => {
        value = result;
        hasValue = true;
        expiresAt = Date.now() + ttlMs;
        return result;
      })
      .finally(() => {
        inflight = null;
      });

    return inflight;
  };
}
