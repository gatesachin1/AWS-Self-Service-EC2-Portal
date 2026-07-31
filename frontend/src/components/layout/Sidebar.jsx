import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const CATEGORIES = [
  {
    key: 'compute',
    label: 'Compute',
    color: 'text-orange-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />,
    items: [
      { to: '/manage-instances', label: 'EC2', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /> },
      { to: '/lambda',          label: 'Lambda',       icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /> },
      { to: '/ecs',             label: 'ECS',          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" /> },
      { to: '/auto-scaling',    label: 'Auto Scaling', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
    ],
  },
  {
    key: 'storage',
    label: 'Storage',
    color: 'text-green-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />,
    items: [
      { to: '/s3', label: 'S3 Buckets', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" /> },
    ],
  },
  {
    key: 'database',
    label: 'Database',
    color: 'text-blue-400',
    icon: <path strokeLinecap="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />,
    items: [
      { to: '/rds',      label: 'RDS',      icon: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path strokeLinecap="round" d="M21 12c0 1.657-4.03 3-9 3s-9-1.343-9-3" /><path strokeLinecap="round" d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" /></> },
      { to: '/dynamodb', label: 'DynamoDB', icon: <path strokeLinecap="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /> },
    ],
  },
  {
    key: 'networking',
    label: 'Networking',
    color: 'text-sky-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" />,
    items: [
      { to: '/vpc',            label: 'VPC',          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9" /> },
      { to: '/load-balancers', label: 'Load Balancers',icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /> },
      { to: '/cloudfront',     label: 'CloudFront',   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" /> },
      { to: '/route53',        label: 'Route 53',     icon: <><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /></> },
    ],
  },
  {
    key: 'devtools',
    label: 'Developer Tools',
    color: 'text-violet-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9" />,
    items: [
      { to: '/developer-tools', label: 'CodePipeline',  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18" /> },
      { to: '/developer-tools', label: 'CodeBuild',     icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /> },
      { to: '/developer-tools', label: 'CodeDeploy',    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /> },
      { to: '/developer-tools', label: 'CodeCommit',    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10 9a3 3 0 100 6 3 3 0 000-6zm-7 9a7 7 0 1114 0H3z" /> },
    ],
  },
  {
    key: 'security',
    label: 'Security',
    color: 'text-red-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    items: [
      { to: '/iam', label: 'IAM', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
    ],
  },
  {
    key: 'management',
    label: 'Management',
    color: 'text-pink-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    items: [
      { to: '/cloudwatch', label: 'CloudWatch', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    ],
  },
  {
    key: 'messaging',
    label: 'Messaging',
    color: 'text-amber-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    items: [
      { to: '/sqs', label: 'SQS', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
      { to: '/sns', label: 'SNS', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
    ],
  },
]

function Icon({ children }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      {children}
    </svg>
  )
}

function Chevron({ open }) {
  return (
    <svg
      className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function Sidebar({ collapsed }) {
  const location = useLocation()
  const [openCats, setOpenCats] = useState(new Set(['compute']))

  function toggleCat(key) {
    setOpenCats(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function isCatActive(cat) {
    return cat.items.some(item => location.pathname.startsWith(item.to))
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-aws-squid border-r border-aws-squid-lt transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-aws-squid-lt flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-aws-orange flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="7" rx="1" /><rect x="2" y="14" width="20" height="7" rx="1" />
          </svg>
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-white font-semibold text-xs">AWS Cloud</p>
            <p className="text-aws-orange font-bold text-xs">Console Portal</p>
          </div>
        )}
      </div>

      {/* Dashboard shortcut */}
      <div className="px-2 pt-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
          }
          title={collapsed ? 'Dashboard' : undefined}
        >
          <Icon>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </Icon>
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Create Instance */}
        <NavLink
          to="/create-instance"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
          }
          title={collapsed ? 'Create Instance' : undefined}
        >
          <Icon>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </Icon>
          {!collapsed && <span>Create Instance</span>}
        </NavLink>
      </div>

      {/* Service categories */}
      <nav className="flex-1 px-2 pt-3 overflow-y-auto space-y-0.5">
        {CATEGORIES.map((cat) => {
          const isOpen   = openCats.has(cat.key)
          const isActive = isCatActive(cat)

          return (
            <div key={cat.key}>
              {/* Category header */}
              {!collapsed ? (
                <button
                  onClick={() => toggleCat(cat.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'text-aws-orange'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon>
                    {cat.icon}
                  </Icon>
                  <span className="flex-1 text-left">{cat.label}</span>
                  <Chevron open={isOpen} />
                </button>
              ) : (
                /* Collapsed: show all icons without labels */
                <div className="py-1">
                  {cat.items.map((item) => (
                    <NavLink
                      key={item.to + item.label}
                      to={item.to}
                      className={({ isActive }) =>
                        `sidebar-link justify-center px-0 ${isActive ? 'active' : ''}`
                      }
                      title={item.label}
                    >
                      <Icon>{item.icon}</Icon>
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Items — visible when expanded and category is open */}
              {!collapsed && isOpen && (
                <div className="ml-2 mt-0.5 space-y-0.5">
                  {cat.items.map((item) => (
                    <NavLink
                      key={item.to + item.label}
                      to={item.to}
                      className={({ isActive }) =>
                        `sidebar-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <Icon>{item.icon}</Icon>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-aws-squid-lt">
        {!collapsed ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-[10px] text-gray-500">us-east-1 · 20 services</p>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-green-400 mx-auto" />
        )}
      </div>
    </aside>
  )
}
