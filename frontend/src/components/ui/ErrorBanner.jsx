export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="aws-card border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-semibold text-red-700 dark:text-red-300 hover:underline flex-shrink-0">
          Retry
        </button>
      )}
    </div>
  )
}
