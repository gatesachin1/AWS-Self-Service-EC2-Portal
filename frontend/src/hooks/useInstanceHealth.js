import { useEffect, useState } from 'react'
import { getInstanceHealth } from '../api/ec2'
import { INSTANCE_HEALTH_SEED } from '../data/servicesData'

const HISTORY_LENGTH = 15
const MOCK_TICK_MS = 15_000  // faster than real so the demo visibly updates
const REAL_POLL_MS  = 60_000 // matches AWS's actual ~1-minute status check cadence

const SEED_NAMES = Object.fromEntries(INSTANCE_HEALTH_SEED.map(s => [s.instance_id, s.instance_name]))

function simulateSample() {
  return INSTANCE_HEALTH_SEED.map((inst) => {
    const running = inst.state === 'running'
    const impaired = running && Math.random() < 0.06
    const systemStatus   = !running ? 'not-applicable' : impaired ? 'impaired' : 'ok'
    const instanceStatus = !running ? 'not-applicable' : (impaired && Math.random() < 0.5) ? 'impaired' : 'ok'
    const health = !running ? 'stopped'
      : (systemStatus === 'ok' && instanceStatus === 'ok') ? 'healthy'
      : (systemStatus === 'impaired' || instanceStatus === 'impaired') ? 'unhealthy'
      : 'degraded'
    return {
      instance_id: inst.instance_id,
      instance_name: inst.instance_name,
      state: inst.state,
      system_status: systemStatus,
      instance_status: instanceStatus,
      health,
    }
  })
}

/**
 * EC2 System + Instance status checks, polled on the same ~1-minute cadence
 * AWS itself refreshes them on. With a live API configured, real history
 * accumulates one real sample per minute as the page stays open — it never
 * fabricates past data. Without one, a local simulation ticks faster so the
 * widget is visibly live without requiring a deployed backend.
 */
export function useInstanceHealth() {
  const hasApi = !!import.meta.env.VITE_API_URL
  const [instances, setInstances] = useState(hasApi ? [] : simulateSample())
  const [history, setHistory]     = useState({})
  const [checkedAt, setCheckedAt] = useState(hasApi ? null : new Date())
  const [loading, setLoading]     = useState(hasApi)
  const [error, setError]         = useState(null)

  useEffect(() => {
    let cancelled = false

    function applySample(items) {
      if (cancelled) return
      setInstances(items)
      setCheckedAt(new Date())
      setHistory((prev) => {
        const next = { ...prev }
        for (const item of items) {
          const arr = next[item.instance_id] ? [...next[item.instance_id]] : []
          arr.push(item.health)
          if (arr.length > HISTORY_LENGTH) arr.shift()
          next[item.instance_id] = arr
        }
        return next
      })
    }

    async function tick(isFirst) {
      if (!hasApi) {
        applySample(simulateSample())
        return
      }
      try {
        const data = await getInstanceHealth()
        if (cancelled) return
        setError(null)
        applySample((data.items || []).map(i => ({ ...i, instance_name: SEED_NAMES[i.instance_id] || i.instance_id })))
      } catch (err) {
        if (cancelled) return
        setError(err.message)
        if (isFirst) applySample(simulateSample())
      } finally {
        if (isFirst && !cancelled) setLoading(false)
      }
    }

    tick(true)
    const interval = setInterval(() => tick(false), hasApi ? REAL_POLL_MS : MOCK_TICK_MS)
    return () => { cancelled = true; clearInterval(interval) }
  }, [hasApi])

  return { instances, history, checkedAt, loading, error, hasApi }
}
