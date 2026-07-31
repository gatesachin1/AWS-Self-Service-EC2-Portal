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
 */
export function useServiceData(serviceName, mockFallback) {
  const hasApi = !!import.meta.env.VITE_API_URL

  const [data, setData]       = useState(hasApi ? null : mockFallback)
  const [loading, setLoading] = useState(hasApi)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!hasApi) return

    let cancelled = false
    setLoading(true)
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
        setData(mockFallback)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [serviceName])

  return { data: data ?? mockFallback, loading, error }
}
