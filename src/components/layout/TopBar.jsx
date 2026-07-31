import { useTheme } from '../../context/ThemeContext'

export default function TopBar({ collapsed, onToggleSidebar }) {
  const { dark, toggle } = useTheme()

  return (
    <header
      className={`
        fixed top-0 right-0 z-20 h-14 flex items-center justify-between px-4
        bg-aws-squid dark:bg-aws-navy
        border-b border-aws-squid-light dark:border-aws-navy-border
        transition-all duration-300
        ${collapsed ? 'left-16' : 'left-60'}
      `}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-aws-squid-light dark:hover:bg-aws-navy-border transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <span className="text-aws-orange font-semibold">AWS</span>
          <ChevronRight />
          <span className="text-gray-300">EC2</span>
          <ChevronRight />
          <span className="text-white font-medium">Self-Service Portal</span>
        </div>
      </div>

      {/* Right: dark mode + region + profile */}
      <div className="flex items-center gap-2">
        {/* Region badge */}
        <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-aws-squid-light dark:bg-aws-navy-border text-xs text-gray-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          us-east-1
        </span>

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-aws-squid-light dark:hover:bg-aws-navy-border transition-colors"
          aria-label="Toggle dark mode"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications bell */}
        <button className="relative p-2 rounded-md text-gray-400 hover:text-white hover:bg-aws-squid-light dark:hover:bg-aws-navy-border transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-aws-orange rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-aws-squid-light dark:border-aws-navy-border ml-1">
          <div className="w-7 h-7 rounded-full bg-aws-orange flex items-center justify-center text-white text-xs font-bold select-none">
            SG
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-none">Sachin Gate</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Admin</p>
          </div>
          <svg className="w-3.5 h-3.5 text-gray-400 hidden md:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  )
}

function ChevronRight() {
  return (
    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
