const VARIANTS = {
  running:    'bg-green-100  dark:bg-green-900/40  text-green-700  dark:text-green-400  border-green-200  dark:border-green-800',
  stopped:    'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  terminated: 'bg-red-100    dark:bg-red-900/40    text-red-700    dark:text-red-400    border-red-200    dark:border-red-800',
  pending:    'bg-blue-100   dark:bg-blue-900/40   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-800',
  default:    'bg-gray-100   dark:bg-gray-800       text-gray-700   dark:text-gray-300   border-gray-200   dark:border-gray-700',
}

const DOTS = {
  running:    'bg-green-500',
  stopped:    'bg-yellow-500',
  terminated: 'bg-red-500',
  pending:    'bg-blue-500 animate-pulse',
  default:    'bg-gray-400',
}

export default function Badge({ state }) {
  const key = state?.toLowerCase() ?? 'default'
  const variant = VARIANTS[key] ?? VARIANTS.default
  const dot = DOTS[key] ?? DOTS.default

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${variant}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {state ?? 'Unknown'}
    </span>
  )
}
