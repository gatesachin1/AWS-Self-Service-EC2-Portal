import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// ── Service categories ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'compute',
    label: 'Compute',
    color: 'text-orange-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="7" rx="1"/><rect x="2" y="14" width="20" height="7" rx="1"/></svg>,
    items: [
      { to: '/manage-instances', label: 'EC2',          abbr: 'EC2',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="7" rx="1"/><rect x="2" y="14" width="20" height="7" rx="1"/></svg> },
      { to: '/lambda',           label: 'Lambda',       abbr: 'λ',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
      { to: '/ecs',              label: 'ECS',          abbr: 'ECS',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"/></svg> },
      { to: '/auto-scaling',     label: 'Auto Scaling', abbr: 'ASG',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> },
    ],
  },
  {
    key: 'storage',
    label: 'Storage',
    color: 'text-green-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"/></svg>,
    items: [
      { to: '/s3', label: 'S3 Buckets', abbr: 'S3',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"/></svg> },
    ],
  },
  {
    key: 'database',
    label: 'Database',
    color: 'text-blue-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.657-4.03 3-9 3s-9-1.343-9-3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/></svg>,
    items: [
      { to: '/rds', label: 'RDS', abbr: 'RDS',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.657-4.03 3-9 3s-9-1.343-9-3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/></svg> },
      { to: '/dynamodb', label: 'DynamoDB', abbr: 'DDB',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg> },
    ],
  },
  {
    key: 'networking',
    label: 'Networking',
    color: 'text-sky-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
    items: [
      { to: '/vpc',           label: 'VPC',            abbr: 'VPC',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg> },
      { to: '/load-balancers',label: 'Load Balancers', abbr: 'ELB',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg> },
      { to: '/cloudfront',    label: 'CloudFront',     abbr: 'CF',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
      { to: '/route53',       label: 'Route 53',       abbr: 'R53',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z"/><line x1="3" y1="12" x2="21" y2="12"/></svg> },
    ],
  },
  {
    key: 'devtools',
    label: 'Developer Tools',
    color: 'text-violet-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
    items: [
      { to: '/developer-tools', label: 'CodePipeline', abbr: 'CD',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
        note: 'Also: CodeBuild, CodeDeploy, CodeCommit, Connections' },
      { to: '/developer-tools', label: 'CodeBuild',    abbr: 'CB',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg> },
      { to: '/developer-tools', label: 'CodeDeploy',   abbr: 'DEP',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg> },
      { to: '/developer-tools', label: 'CodeCommit',   abbr: 'GIT',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" d="M12 3v6m0 6v6M3 12h6m6 0h6"/></svg> },
    ],
  },
  {
    key: 'security',
    label: 'Security',
    color: 'text-red-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    items: [
      { to: '/iam', label: 'IAM', abbr: 'IAM',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> },
    ],
  },
  {
    key: 'monitoring',
    label: 'Monitoring',
    color: 'text-pink-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    items: [
      { to: '/cloudwatch', label: 'CloudWatch', abbr: 'CW',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
    ],
  },
  {
    key: 'messaging',
    label: 'Messaging',
    color: 'text-amber-400',
    icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>,
    items: [
      { to: '/sqs', label: 'SQS', abbr: 'SQS',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
      { to: '/sns', label: 'SNS', abbr: 'SNS',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
    ],
  },
]

export default function Sidebar({ collapsed }) {
  const location = useLocation()
  const [openCats, setOpenCats] = useState(new Set(['compute']))

  const toggleCat = (key) => {
    setOpenCats((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const isCatActive = (cat) =>
    cat.items.some((item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        bg-aws-squid dark:bg-aws-navy
        border-r border-aws-squid-light dark:border-aws-navy-border
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-aws-squid-light dark:border-aws-navy-border flex-shrink-0">
        <AwsIcon />
        {!collapsed && (
          <span className="text-white font-semibold text-sm leading-tight">
            AWS<br />
            <span className="text-aws-orange">Cloud Console</span>
          </span>
        )}
      </div>

      {/* Dashboard link */}
      <div className="px-2 pt-3 pb-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
          }
          title={collapsed ? 'Dashboard' : undefined}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {!collapsed && (
          <NavLink
            to="/create-instance"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Launch EC2</span>
          </NavLink>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-aws-squid-light dark:border-aws-navy-border mb-1" />

      {/* Service categories */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
        {CATEGORIES.map((cat) => {
          const isOpen = openCats.has(cat.key)
          const catActive = isCatActive(cat)

          if (collapsed) {
            // Icon-only mode: show all service items as icons
            return cat.items
              .filter((item, i, arr) => arr.findIndex(x => x.to === item.to) === i) // dedupe devtools links
              .map((item) => (
                <NavLink
                  key={item.to + item.abbr}
                  to={item.to}
                  title={item.label}
                  className={({ isActive }) =>
                    `sidebar-item justify-center px-0 ${isActive ? 'active' : ''}`
                  }
                >
                  {item.icon}
                </NavLink>
              ))
          }

          return (
            <div key={cat.key}>
              {/* Category header */}
              <button
                onClick={() => toggleCat(cat.key)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  catActive
                    ? 'text-aws-orange'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className={cat.color}>{cat.icon}</span>
                <span className="flex-1 text-left">{cat.label}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Category items */}
              {isOpen && (
                <div className="ml-2 pl-3 border-l border-gray-700 dark:border-gray-600 space-y-0.5 mt-0.5 mb-1">
                  {cat.items.map((item, i) => {
                    // For developer-tools, dedupe entries that share the same route
                    const prevSameTo = cat.items.slice(0, i).some(x => x.to === item.to)
                    return (
                      <NavLink
                        key={item.to + item.label}
                        to={item.to}
                        className={({ isActive }) =>
                          `sidebar-item ${isActive && !prevSameTo ? 'active' : (!prevSameTo ? '' : 'opacity-70 hover:opacity-100')}`
                        }
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-aws-squid-light dark:border-aws-navy-border">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <p className="text-[11px] text-gray-500">us-east-1 · 20 services</p>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-green-400 mx-auto" title="us-east-1" />
        )}
      </div>
    </aside>
  )
}

function AwsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#FF9900" />
      <path
        d="M10 20.5c3.3 1.6 8.7 1.6 12 0M10.5 19.5s-.5-2 1-3.5c1.2-1.1 2.5-1 3 0 .5 1.5-.5 3-.5 3M21.5 19.5s.5-2-1-3.5c-1.2-1.1-2.5-1-3 0-.5 1.5.5 3 .5 3"
        stroke="white" strokeWidth="1.5" strokeLinecap="round"
      />
      <path d="M9 22l1.5-1.5M23 22l-1.5-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <text x="6" y="15" fill="white" fontSize="7" fontWeight="700" fontFamily="Arial">AWS</text>
    </svg>
  )
}
