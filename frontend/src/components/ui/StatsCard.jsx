import Spinner from './Spinner'

export default function StatsCard({ title, value, trend, accent, icon, loading }) {
  return (
    <div className="aws-card p-5 flex items-start justify-between hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value ?? '—'}</span>
          )}
        </div>
        {trend && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{trend}</p>}
      </div>
      <div className={`p-2.5 rounded-lg flex-shrink-0 ml-3 ${accent}`}>{icon}</div>
    </div>
  )
}
