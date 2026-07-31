export default function StatsCard({ title, value, icon, accent, trend }) {
  return (
    <div className="aws-card p-5 flex items-start justify-between hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate">{title}</p>
        <p className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
        {trend && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{trend}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg flex-shrink-0 ml-4 ${accent}`}>
        {icon}
      </div>
    </div>
  )
}
