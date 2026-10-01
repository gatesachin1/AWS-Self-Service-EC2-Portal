import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )

  // Auto-collapse the sidebar when the viewport narrows past tablet width,
  // so it doesn't eat most of the screen on mobile.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = (e) => setCollapsed(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="min-h-screen bg-surface dark:bg-aws-navy">
      <Sidebar collapsed={collapsed} />
      <TopBar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className={`transition-all duration-300 pt-14 ${collapsed ? 'pl-16' : 'pl-60'}`}>
        <div className="p-6 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
