import { useState, useMemo } from 'react'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import ConfirmModal from '../components/ui/ConfirmModal'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useInstances } from '../hooks/useInstances'

const FILTERS = ['all', 'running', 'stopped', 'pending', 'terminated']

const CONFIRM_CFG = {
  start:     { title: 'Start Instance',     msg: (n) => `Start "${n}"?`,                                      danger: false, label: 'Start'     },
  stop:      { title: 'Stop Instance',      msg: (n) => `Stop "${n}"? Running processes will be interrupted.`, danger: false, label: 'Stop'      },
  reboot:    { title: 'Reboot Instance',    msg: (n) => `Reboot "${n}"? The instance will restart.`,           danger: false, label: 'Reboot'    },
  terminate: { title: 'Terminate Instance', msg: (n) => `Permanently terminate "${n}"? This cannot be undone.`, danger: true, label: 'Terminate' },
}

function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function Th({ children, onClick, sorted }) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${onClick ? 'cursor-pointer hover:text-gray-900 dark:hover:text-white select-none' : ''}`}
    >
      <span className="flex items-center gap-1">
        {children}
        {sorted === 'asc' && <span>↑</span>}
        {sorted === 'desc' && <span>↓</span>}
      </span>
    </th>
  )
}

export default function ManageInstances() {
  const { instances, loading, actionLoading, error, refresh, performAction } = useInstances()

  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [sortKey, setSortKey] = useState('launch_time')
  const [sortDir, setSortDir] = useState('desc')
  const [modal,   setModal]   = useState(null) // { action, instanceId, instanceName }
  const [modalLoading, setModalLoading] = useState(false)

  // ── Sort ──
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  // ── Filter + search ──
  const displayed = useMemo(() => {
    let list = instances
    if (filter !== 'all') list = list.filter((i) => i.state === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((i) =>
        i.instance_id.toLowerCase().includes(q) ||
        (i.instance_name || '').toLowerCase().includes(q) ||
        (i.instance_type || '').toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return list
  }, [instances, filter, search, sortKey, sortDir])

  const openModal = (action, inst) =>
    setModal({ action, instanceId: inst.instance_id, instanceName: inst.instance_name || inst.instance_id })

  const handleConfirm = async () => {
    if (!modal) return
    setModalLoading(true)
    await performAction(modal.action, modal.instanceId, modal.instanceName)
    setModalLoading(false)
    setModal(null)
  }

  const cfg = modal ? CONFIRM_CFG[modal.action] : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Instances</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${displayed.length} of ${instances.length} instances · us-east-1`}
          </p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto gap-1.5"
        >
          {loading ? <Spinner size="sm" /> : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          )}
          Refresh
        </button>
      </div>

      <ErrorBanner message={error} onRetry={refresh} />

      {/* Filters */}
      <div className="aws-card px-4 py-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, type…"
            className="aws-input pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors capitalize
                ${filter === f
                  ? 'bg-aws-orange border-aws-orange text-white'
                  : 'bg-white dark:bg-aws-navy-lt border-gray-300 dark:border-aws-border text-gray-600 dark:text-gray-300 hover:border-aws-orange hover:text-aws-orange'
                }`}
            >
              {f === 'all' ? 'All States' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="aws-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy">
                    <Th onClick={() => toggleSort('instance_name')} sorted={sortKey === 'instance_name' ? sortDir : null}>Name</Th>
                    <Th onClick={() => toggleSort('instance_id')}   sorted={sortKey === 'instance_id'   ? sortDir : null}>Instance ID</Th>
                    <Th onClick={() => toggleSort('state')}         sorted={sortKey === 'state'         ? sortDir : null}>State</Th>
                    <Th>AMI</Th>
                    <Th onClick={() => toggleSort('instance_type')} sorted={sortKey === 'instance_type' ? sortDir : null}>Type</Th>
                    <Th>Private IP</Th>
                    <Th>Public IP</Th>
                    <Th onClick={() => toggleSort('launch_time')}   sorted={sortKey === 'launch_time'   ? sortDir : null}>Launch Time</Th>
                    <Th>AZ</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-aws-border">
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                        No instances match your filters.
                      </td>
                    </tr>
                  ) : (
                    displayed.map((inst) => (
                      <InstanceRow
                        key={inst.instance_id}
                        inst={inst}
                        acting={actionLoading === inst.instance_id}
                        onAction={openModal}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy flex justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>Showing {displayed.length} / {instances.length}</span>
              <span>Refreshed at {new Date().toLocaleTimeString()}</span>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={!!modal}
        title={cfg?.title ?? ''}
        message={cfg ? cfg.msg(modal?.instanceName ?? '') : ''}
        confirmLabel={cfg?.label}
        danger={cfg?.danger}
        loading={modalLoading}
        onConfirm={handleConfirm}
        onCancel={() => { if (!modalLoading) setModal(null) }}
      />
    </div>
  )
}

function InstanceRow({ inst, acting, onAction }) {
  const terminated = inst.state === 'terminated'
  const running    = inst.state === 'running'
  const stopped    = inst.state === 'stopped'

  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-aws-navy-lt transition-colors ${terminated ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        <div className="flex items-center gap-2">
          {acting && <Spinner size="sm" />}
          {inst.instance_name || <span className="text-gray-400 italic">unnamed</span>}
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-aws-orange whitespace-nowrap">{inst.instance_id}</td>
      <td className="px-4 py-3 whitespace-nowrap"><Badge state={inst.state} /></td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">{inst.ami_id}</td>
      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{inst.instance_type}</td>
      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{inst.private_ip || '—'}</td>
      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{inst.public_ip || '—'}</td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(inst.launch_time)}</td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{inst.availability_zone || '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onAction('start',  inst)} disabled={acting || !stopped}    className="btn-action text-green-600 dark:text-green-400">▶ Start</button>
          <button onClick={() => onAction('stop',   inst)} disabled={acting || !running}    className="btn-action text-yellow-600 dark:text-yellow-400">■ Stop</button>
          <button onClick={() => onAction('reboot', inst)} disabled={acting || !running}    className="btn-action text-blue-600 dark:text-blue-400">↻ Reboot</button>
          <button onClick={() => onAction('terminate', inst)} disabled={acting || terminated} className="btn-danger !text-xs !py-1.5 !px-2.5">Terminate</button>
        </div>
      </td>
    </tr>
  )
}
