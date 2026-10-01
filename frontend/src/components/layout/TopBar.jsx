import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function TopBar({ collapsed, onToggle }) {
  const { dark, toggle } = useTheme()
  const [search, setSearch] = useState('')

  return (
    <header
      className={`
        fixed top-0 right-0 z-20 h-14
        flex items-center justify-between px-4 gap-3
        bg-white dark:bg-aws-squid border-b border-gray-100 dark:border-aws-squid-lt
        transition-all duration-300
        ${collapsed ? 'left-16' : 'left-60'}
      `}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-aws-squid-lt transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative hidden sm:block w-full max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources, domains, logs…"
            className="w-full rounded-full border border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy-lt
                       pl-9 pr-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-aws-squid-lt border border-gray-200 dark:border-aws-border text-xs text-gray-600 dark:text-gray-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          us-east-1
        </span>

        <button
          className="relative p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-aws-squid-lt transition-colors"
          title="Notifications"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        <button
          onClick={toggle}
          className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-aws-squid-lt transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2 pl-2.5 ml-1 border-l border-gray-200 dark:border-aws-squid-lt">
          <div className="w-7 h-7 rounded-full bg-aws-orange flex items-center justify-center text-white text-xs font-bold">
            SG
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">Sachin Gate</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}
