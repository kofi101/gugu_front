import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

export interface AsyncState<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  reload: () => void;
}

interface Settled<T> {
  key: readonly unknown[];
  data: T | undefined;
  error: unknown;
}

const sameKey = (a: readonly unknown[] | undefined, b: readonly unknown[]) =>
  Boolean(a) && a!.length === b.length && a!.every((v, i) => Object.is(v, b[i]));

/**
 * Runs `fn` whenever deps change and exposes reload() for retry buttons.
 * `loading` is derived (settled result belongs to other deps), so no state is set synchronously in the effect.
 * While reloading, the previous data stays available to avoid layout flashes.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const key = [...deps, attempt];

  useEffect(() => {
    let active = true;
    const runKey = key;
    fnRef
      .current()
      .then((data) => {
        if (active) setSettled({ key: runKey, data, error: undefined });
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error(error);
        setSettled({ key: runKey, data: undefined, error });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, key);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);
  const current = sameKey(settled?.key, key);
  return {
    data: settled?.data,
    error: current ? settled?.error : undefined,
    loading: !current,
    reload,
  };
}
