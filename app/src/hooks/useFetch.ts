import { useEffect, useState, type DependencyList } from 'react'

/**
 * Hook simple para fetch async. Maneja loading + data + error.
 * No es un cache global (para eso meteríamos react-query); aquí cada página
 * dispara su propia query al montar.
 */
export function useFetch<T>(
  fn: () => Promise<T>,
  deps: DependencyList = [],
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fn()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, error, refetch: () => setTick((t) => t + 1) }
}
