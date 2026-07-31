import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import ConfirmModal from '../components/ui/ConfirmModal'
import { MOCK_INSTANCES } from '../data/mockData'

const ACTION_CONFIG = {
  start:     { label: 'Start',     confirmTitle: 'Start Instance',     confirmMsg: (n) => `Start instance "${n}"?`,         danger: false, fromState: 'stopped',    toState: 'running',    toastMsg: (n) => `Instance "${n}" started successfully.`,     toastStyle: { background: '#166534', color: '#dcfce7' } },
  stop:      { label: 'Stop',      confirmTitle: 'Stop Instance',      confirmMsg: (n) => `Stop instance "${n}"? Running processes will be interrupted.`,   danger: false, fromState: 'running',    toState: 'stopped',    toastMsg: (n) => `Instance "${n}" stopped.`,                   toastStyle: { background: '#854d0e', color: '#fef9c3' } },
  reboot:    { label: 'Reboot',    confirmTitle: 'Reboot Instance',    confirmMsg: (n) => `Reboot instance "${n}"? The instance will restart.`,             danger: false, fromState: null,         toState: null,         toastMsg: (n) => `Instance "${n}" is rebooting.`,              toastStyle: { background: '#1e3a5f', color: '#dbeafe' } },
  terminate: { label: 'Terminate', confirmTitle: 'Terminate Instance', confirmMsg: (n) => `Permanently terminate "${n}"? This action cannot be undone.`,   danger: true,  fromState: null,         toState: 'terminated', toastMsg: (n) => `Instance "${n}" terminated.`,                toastStyle: { background: '#7f1d1d', color: '#fee2e2' } },
}

export default function ManageInstances() {
  const [instances, setInstances]   = useState(MOCK_INSTANCES)
  const [search, setSearch]         = useState('')
  const [filterState, setFilterState] = useState('all')
  const [loadingId, setLoadingId]   = useState(null)
  const [modal, setModal]           = useState(null) // { instanceId, action }

  const filtered = useMemo(() => {
    return instances.filter(inst => {
      const matchesSearch =
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.id.toLowerCase().includes(search.toLowerCase())
      const matchesState = filterState === 'all' || inst.state === filterState
      return matchesSearch && matchesState
    })
  }, [instances, search, filterState])

  const handleAction = (instanceId, action) => {
    const inst = instances.find(i => i.id === instanceId)
    setModal({ instanceId, action, instanceName: inst.name })
  }

  const handleConfirm = async () => {
    const { instanceId, action, instanceName } = modal
    const cfg = ACTION_CONFIG[action]
    setLoadingId(instanceId)
    setModal(null)

    await new Promise(r => setTimeout(r, 1200))

    if (cfg.toState) {
      setInstances(prev =>
        prev.map(i => i.id === instanceId ? { ...i, state: cfg.toState } : i)
      )
    }

    setLoadingId(null)
    toast.success(cfg.toastMsg(instanceName), {
      duration: 4000,
      style: cfg.toastStyle,
    })
  }

  const currentModal = modal ? ACTION_CONFIG[modal.action] : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Instances</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} instance{filtered.length !== 1 ? 's' : ''} shown · us-east-1
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {instances.filter(i => i.state === 'running').length} running
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            {instances.filter(i => i.state === 'stopped').length} stopped
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="aws-card px-4 py-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or instance ID…"
            className="aws-input pl-9"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {['all', 'running', 'stopped', 'terminated'].map(s => (
            <button
              key={s}
              onClick={() => setFilterState(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors capitalize ${
                filterState === s
                  ? 'bg-aws-orange border-aws-orange text-white'
                  : 'bg-white dark:bg-aws-navy-light border-gray-300 dark:border-aws-navy-border text-gray-600 dark:text-gray-300 hover:border-aws-orange hover:text-aws-orange'
              }`}
            >
              {s === 'all' ? 'All States' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="aws-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-aws-navy-border bg-gray-50 dark:bg-aws-navy">
                <Th>Instance Name</Th>
                <Th>Instance ID</Th>
                <Th>State</Th>
                <Th>AMI</Th>
                <Th>Instance Type</Th>
                <Th>Launch Time</Th>
                <Th>Availability Zone</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-aws-navy-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                      </svg>
                      No instances match your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(inst => (
                  <InstanceRow
                    key={inst.id}
                    inst={inst}
                    loading={loadingId === inst.id}
                    onAction={handleAction}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-aws-navy-border bg-gray-50 dark:bg-aws-navy flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Showing {filtered.length} of {instances.length} instances</span>
            <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!modal}
        title={currentModal?.confirmTitle ?? ''}
        message={currentModal ? currentModal.confirmMsg(modal?.instanceName ?? '') : ''}
        confirmLabel={currentModal?.label}
        danger={currentModal?.danger}
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
      />
    </div>
  )
}

function InstanceRow({ inst, loading, onAction }) {
  const terminated = inst.state === 'terminated'

  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-aws-navy-light transition-colors ${terminated ? 'opacity-60' : ''}`}>
      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        <div className="flex items-center gap-2">
          {loading && <Spinner size="sm" label="" />}
          {inst.name}
        </div>
      </td>
      <td className="px-5 py-3 font-mono text-xs text-aws-orange whitespace-nowrap">{inst.id}</td>
      <td className="px-5 py-3 whitespace-nowrap"><Badge state={inst.state} /></td>
      <td className="px-5 py-3 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">{inst.amiName}</td>
      <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{inst.instanceType}</td>
      <td className="px-5 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">
        {new Date(inst.launchTime).toLocaleString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </td>
      <td className="px-5 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{inst.availabilityZone}</td>
      <td className="px-5 py-3 whitespace-nowrap">
        <ActionButtons inst={inst} loading={loading} onAction={onAction} />
      </td>
    </tr>
  )
}

function ActionButtons({ inst, loading, onAction }) {
  const terminated = inst.state === 'terminated'
  const stopped    = inst.state === 'stopped'
  const running    = inst.state === 'running'

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onAction(inst.id, 'start')}
        disabled={loading || !stopped}
        className="aws-btn-action !text-green-600 dark:!text-green-400 hover:!bg-green-50 dark:hover:!bg-green-900/30"
        title="Start"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        Start
      </button>

      <button
        onClick={() => onAction(inst.id, 'stop')}
        disabled={loading || !running}
        className="aws-btn-action !text-yellow-600 dark:!text-yellow-400 hover:!bg-yellow-50 dark:hover:!bg-yellow-900/30"
        title="Stop"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
        </svg>
        Stop
      </button>

      <button
        onClick={() => onAction(inst.id, 'reboot')}
        disabled={loading || !running}
        className="aws-btn-action !text-blue-600 dark:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-900/30"
        title="Reboot"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reboot
      </button>

      <button
        onClick={() => onAction(inst.id, 'terminate')}
        disabled={loading || terminated}
        className="aws-btn-danger"
        title="Terminate"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Terminate
      </button>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  )
}
