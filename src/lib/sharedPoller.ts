'use client';

import { useSyncExternalStore } from 'react';

export interface PollerState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface SharedPoller<T> {
  refresh: () => Promise<void>;
  usePoller: () => PollerState<T>;
}

interface Options {
  intervalMs: number;
  /** Message stored in `error` when a fetch fails. Defaults to the thrown message. */
  errorMessage?: string;
}

// How long the data is kept after the last subscriber leaves. Navigating
// between pages unmounts and remounts subscribers within milliseconds, so the
// data survives that; after logout nothing is subscribed and per-user data is
// dropped, so the next user never sees the previous user's values.
const RESET_GRACE_MS = 3000;

/**
 * One timer and one in-flight request per endpoint, no matter how many
 * components use it. Polling only runs while something is subscribed, pauses
 * while the tab is hidden, and refreshes as soon as the tab is visible again.
 * Each tick is jittered a little so thousands of browsers drift apart instead
 * of hitting the server in the same instant.
 */
export function createSharedPoller<T>(
  fetcher: () => Promise<T>,
  { intervalMs, errorMessage }: Options,
): SharedPoller<T> {
  const INITIAL: PollerState<T> = { data: null, loading: true, error: null };

  let state = INITIAL;
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;
  let inflight: Promise<void> | null = null;

  const setState = (next: PollerState<T>) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  const refresh = (): Promise<void> => {
    if (inflight) return inflight;

    inflight = fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) =>
        setState({
          data: state.data,
          loading: false,
          error: errorMessage ?? (err instanceof Error ? err.message : 'Request failed.'),
        }),
      )
      .finally(() => {
        inflight = null;
      });

    return inflight;
  };

  const isHidden = () => typeof document !== 'undefined' && document.hidden;

  // Always at most one pending timer. A tick that is still awaiting its request
  // when the page unmounts and remounts would otherwise start a second chain.
  const schedule = () => {
    if (timer) clearTimeout(timer);
    const delay = intervalMs * (0.9 + Math.random() * 0.2);
    timer = setTimeout(async () => {
      timer = null;
      if (!isHidden()) await refresh();
      if (listeners.size > 0) schedule();
    }, delay);
  };

  const onVisibilityChange = () => {
    if (!isHidden() && listeners.size > 0) void refresh();
  };

  const start = () => {
    document.addEventListener('visibilitychange', onVisibilityChange);
    void refresh();
    schedule();
  };

  const stop = () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (timer) clearTimeout(timer);
    timer = null;
    resetTimer = setTimeout(() => {
      state = INITIAL;
      resetTimer = null;
    }, RESET_GRACE_MS);
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    if (listeners.size === 1) start();

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) stop();
    };
  };

  const getSnapshot = () => state;
  const getServerSnapshot = () => INITIAL;

  return {
    refresh,
    usePoller: () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot),
  };
}
