import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-aws-navy">
      <Sidebar collapsed={collapsed} />
      <TopBar collapsed={collapsed} onToggleSidebar={() => setCollapsed(c => !c)} />

      {/* Main content — offset matches sidebar width */}
      <main
        className={`
          transition-all duration-300 pt-14
          ${collapsed ? 'pl-16' : 'pl-60'}
        `}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
