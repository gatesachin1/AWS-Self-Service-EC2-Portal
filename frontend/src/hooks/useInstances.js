import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  listInstances,
  startInstance,
  stopInstance,
  rebootInstance,
  terminateInstance,
} from '../api/ec2'

const ACTION_CONFIG = {
  start:     { fn: startInstance,     loadMsg: 'Starting instance…',    successKey: 'message' },
  stop:      { fn: stopInstance,      loadMsg: 'Stopping instance…',    successKey: 'message' },
  reboot:    { fn: rebootInstance,    loadMsg: 'Rebooting instance…',   successKey: 'message' },
  terminate: { fn: terminateInstance, loadMsg: 'Terminating instance…', successKey: 'message' },
}

export function useInstances(autoLoad = true) {
  const [instances, setInstances] = useState([])
  const [loading, setLoading]     = useState(false)
  const [actionLoading, setActionLoading] = useState(null) // instance_id being acted on
  const [error, setError]         = useState(null)

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await listInstances()
      setInstances(data.instances ?? [])
    } catch (err) {
      setError(err.message)
      if (!silent) toast.error(`Failed to load instances: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoLoad) refresh()
  }, [autoLoad, refresh])

  const performAction = useCallback(
    async (action, instanceId, instanceName = instanceId) => {
      const cfg = ACTION_CONFIG[action]
      if (!cfg) return

      const toastId = toast.loading(`${cfg.loadMsg} "${instanceName}"`)
      setActionLoading(instanceId)

      try {
        const result = await cfg.fn(instanceId)
        const msg = result?.[cfg.successKey] ?? `${action} successful`
        toast.success(msg, { id: toastId, duration: 4000 })
        await refresh(true)
      } catch (err) {
        toast.error(err.message, { id: toastId, duration: 5000 })
      } finally {
        setActionLoading(null)
      }
    },
    [refresh]
  )

  // Derived counts for Dashboard
  const counts = {
    total:      instances.length,
    running:    instances.filter((i) => i.state === 'running').length,
    stopped:    instances.filter((i) => i.state === 'stopped').length,
    pending:    instances.filter((i) => i.state === 'pending').length,
    terminated: instances.filter((i) => i.state === 'terminated').length,
  }

  return { instances, counts, loading, actionLoading, error, refresh, performAction }
}
