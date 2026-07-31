import { useState, useEffect } from 'react'
import { getResources } from '../api/ec2'

const EMPTY = {
  vpcs: [], subnets: [], security_groups: [],
  key_pairs: [], iam_instance_profiles: [], availability_zones: [],
}

export function useResources() {
  const [resources, setResources] = useState(EMPTY)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getResources()
      .then((data) => { if (!cancelled) setResources({ ...EMPTY, ...data }) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { resources, loading, error }
}
