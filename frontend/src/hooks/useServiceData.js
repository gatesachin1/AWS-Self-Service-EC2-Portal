import { useState, useEffect } from 'react'
import { getServiceData } from '../api/services'

/**
 * Fetch live AWS data when VITE_API_URL is configured, otherwise fall back
 * to the provided mock data (so local dev without a backend still works).
 *
 * For list-based services the Lambda returns { items: [...], count: N }.
 * For compound services (vpc, iam, cloudwatch, devtools) it returns the
 * object directly, e.g. { vpcs: [...], subnets: [...] }.
 * This hook normalises both: callers always receive the usable payload.
 *
 * Pass `pollMs` to re-fetch on an interval (e.g. for near-real-time views
 * like CloudTrail) — only takes effect when a live API is configured.
 */
export function useServiceData(serviceName, mockFallback, { pollMs } = {}) {
  const hasApi = !!import.meta.env.VITE_API_URL

  const [data, setData]       = useState(hasApi ? null : mockFallback)
  const [loading, setLoading] = useState(hasApi)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!hasApi) return

    let cancelled = false

    function fetchData(isFirstLoad) {
      if (isFirstLoad) setLoading(true)
      setError(null)

      getServiceData(serviceName)
        .then((body) => {
          if (cancelled) return
          // If the response has an `items` array, unwrap it (list services).
          // Otherwise return the whole body (compound services).
          setData(body.items !== undefined ? body.items : body)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err.message)
          if (isFirstLoad) setData(mockFallback)
        })
        .finally(() => {
          if (!cancelled && isFirstLoad) setLoading(false)
        })
    }

    fetchData(true)
    const interval = pollMs ? setInterval(() => fetchData(false), pollMs) : null

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [serviceName, pollMs])

  return { data: data ?? mockFallback, loading, error }
}
