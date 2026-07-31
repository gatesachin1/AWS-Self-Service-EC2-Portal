const MAP = {
  running:      { ring: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',  dot: 'bg-green-500' },
  stopped:      { ring: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  terminated:   { ring: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  pending:      { ring: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500 animate-pulse' },
  stopping:     { ring: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800', dot: 'bg-orange-500 animate-pulse' },
  'shutting-down': { ring: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', dot: 'bg-red-500 animate-pulse' },
}

const DEFAULT = { ring: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' }

export default function Badge({ state }) {
  const { ring, dot } = MAP[state?.toLowerCase()] ?? DEFAULT
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {state ?? 'unknown'}
    </span>
  )
}
