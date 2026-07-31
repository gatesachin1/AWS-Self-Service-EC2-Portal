import { useTheme } from '../../context/ThemeContext'

export default function TopBar({ collapsed, onToggle }) {
  const { dark, toggle } = useTheme()

  return (
    <header
      className={`
        fixed top-0 right-0 z-20 h-14
        flex items-center justify-between px-4 gap-3
        bg-aws-squid border-b border-aws-squid-lt
        transition-all duration-300
        ${collapsed ? 'left-16' : 'left-60'}
      `}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-aws-squid-lt transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="text-aws-orange font-bold text-sm">AWS</span>
          <span className="text-gray-600">›</span>
          <span className="text-gray-300">EC2</span>
          <span className="text-gray-600">›</span>
          <span className="text-white font-medium">Self-Service Portal</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-aws-squid-lt border border-aws-border text-xs text-gray-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          us-east-1
        </span>

        <button
          onClick={toggle}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-aws-squid-lt transition-colors"
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

        <div className="flex items-center gap-2 pl-2.5 ml-1 border-l border-aws-squid-lt">
          <div className="w-7 h-7 rounded-full bg-aws-orange flex items-center justify-center text-white text-xs font-bold">
            SG
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-white">Sachin Gate</p>
            <p className="text-[10px] text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}
