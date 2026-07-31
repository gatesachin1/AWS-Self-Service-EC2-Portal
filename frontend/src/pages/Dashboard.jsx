import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/ui/StatsCard'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useInstances } from '../hooks/useInstances'

function ServerIcon()  { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="7" rx="1"/><rect x="2" y="14" width="20" height="7" rx="1"/><line x1="6" y1="6.5" x2="6.01" y2="6.5"/><line x1="6" y1="17.5" x2="6.01" y2="17.5"/></svg> }
function PlayIcon()    { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function StopIcon()    { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> }
function TrashIcon()   { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg> }
function RefreshIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> }

export default function Dashboard() {
  const navigate = useNavigate()
  const { instances, counts, loading, error, refresh } = useInstances()

  const recent = instances.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            EC2 instance overview — us-east-1
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="btn-secondary gap-1.5"
          >
            {loading ? <Spinner size="sm" /> : <RefreshIcon />}
            Refresh
          </button>
          <button onClick={() => navigate('/create-instance')} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
            </svg>
            Launch Instance
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={refresh} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Instances" value={counts.total}  loading={loading} trend="All states" accent="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"   icon={<ServerIcon />} />
        <StatsCard title="Running"         value={counts.running} loading={loading} trend="Active now"   accent="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" icon={<PlayIcon />}   />
        <StatsCard title="Stopped"         value={counts.stopped} loading={loading} trend="Idle"          accent="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" icon={<StopIcon />}   />
        <StatsCard title="Terminated"      value={counts.terminated} loading={loading} trend="Removed"   accent="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"         icon={<TrashIcon />}  />
      </div>

      {/* Utilisation bar */}
      {!loading && counts.total > 0 && (
        <div className="aws-card px-5 py-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Running utilisation</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              {counts.running} / {counts.total}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-aws-border rounded-full overflow-hidden">
            <div
              className="h-full bg-aws-orange rounded-full transition-all duration-700"
              style={{ width: `${(counts.running / counts.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent instances table */}
      <div className="aws-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-aws-border">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Instances</h2>
          <button
            onClick={() => navigate('/manage-instances')}
            className="text-xs font-semibold text-aws-orange hover:text-aws-orange-dk transition-colors"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <ServerIcon />
            <p className="mt-3 text-sm">No instances found.</p>
            <button onClick={() => navigate('/create-instance')} className="mt-3 btn-primary text-xs">
              Launch your first instance
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy">
                  {['Name', 'Instance ID', 'State', 'Type', 'AZ', 'Private IP'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-aws-border">
                {recent.map((i) => (
                  <tr key={i.instance_id} className="hover:bg-gray-50 dark:hover:bg-aws-navy-lt transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {i.instance_name || <span className="text-gray-400 italic">unnamed</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-aws-orange whitespace-nowrap">{i.instance_id}</td>
                    <td className="px-5 py-3"><Badge state={i.state} /></td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{i.instance_type}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{i.availability_zone}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{i.private_ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
