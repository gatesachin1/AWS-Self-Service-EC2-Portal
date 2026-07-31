import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/ui/StatsCard'
import Badge from '../components/ui/Badge'
import { MOCK_INSTANCES } from '../data/mockData'

const RECENT_COUNT = 5

export default function Dashboard() {
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const total      = MOCK_INSTANCES.length
    const running    = MOCK_INSTANCES.filter(i => i.state === 'running').length
    const stopped    = MOCK_INSTANCES.filter(i => i.state === 'stopped').length
    const terminated = MOCK_INSTANCES.filter(i => i.state === 'terminated').length
    return { total, running, stopped, terminated }
  }, [])

  const recent = MOCK_INSTANCES.slice(0, RECENT_COUNT)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Overview of your EC2 instances — us-east-1
          </p>
        </div>
        <button
          onClick={() => navigate('/create-instance')}
          className="aws-btn-primary self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Launch Instance
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Instances"
          value={stats.total}
          trend="Across all states"
          accent="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          icon={<ServerIcon />}
        />
        <StatsCard
          title="Running"
          value={stats.running}
          trend="Currently active"
          accent="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          icon={<PlayIcon />}
        />
        <StatsCard
          title="Stopped"
          value={stats.stopped}
          trend="Idle instances"
          accent="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
          icon={<StopIcon />}
        />
        <StatsCard
          title="Terminated"
          value={stats.terminated}
          trend="Permanently removed"
          accent="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          icon={<TrashIcon />}
        />
      </div>

      {/* Utilisation banner */}
      <div className="aws-card px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instance Utilisation</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {stats.running} / {stats.total} running
              </span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-aws-navy-border rounded-full overflow-hidden">
              <div
                className="h-full bg-aws-orange rounded-full transition-all duration-700"
                style={{ width: `${(stats.running / stats.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            <span><span className="font-semibold text-green-500">{Math.round((stats.running / stats.total) * 100)}%</span> running</span>
            <span><span className="font-semibold text-yellow-500">{Math.round((stats.stopped / stats.total) * 100)}%</span> stopped</span>
          </div>
        </div>
      </div>

      {/* Recent instances */}
      <div className="aws-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-aws-navy-border">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Instances</h2>
          <button
            onClick={() => navigate('/manage-instances')}
            className="text-sm text-aws-orange hover:text-aws-orange-dark font-medium transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-aws-navy-border bg-gray-50 dark:bg-aws-navy">
                <Th>Name</Th>
                <Th>Instance ID</Th>
                <Th>State</Th>
                <Th>Type</Th>
                <Th>AZ</Th>
                <Th>Environment</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-aws-navy-border">
              {recent.map(inst => (
                <tr
                  key={inst.id}
                  className="hover:bg-gray-50 dark:hover:bg-aws-navy-light transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{inst.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{inst.id}</td>
                  <td className="px-5 py-3"><Badge state={inst.state} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{inst.instanceType}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{inst.availabilityZone}</td>
                  <td className="px-5 py-3">
                    <EnvBadge env={inst.environment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          title="Launch Instance"
          desc="Provision a new EC2 instance with custom configuration."
          icon={<PlayIcon />}
          accent="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
          onClick={() => navigate('/create-instance')}
        />
        <QuickAction
          title="Manage Instances"
          desc="Start, stop, reboot or terminate running instances."
          icon={<ServerIcon />}
          accent="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
          onClick={() => navigate('/manage-instances')}
        />
        <QuickAction
          title="Region: us-east-1"
          desc="Northern Virginia — 3 availability zones available."
          icon={<GlobeIcon />}
          accent="text-aws-orange bg-orange-50 dark:bg-orange-900/30"
          onClick={() => {}}
        />
      </div>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  )
}

function EnvBadge({ env }) {
  const colors = {
    production: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
    staging:    'text-blue-700   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/30',
    dev:        'text-gray-700   dark:text-gray-300   bg-gray-100  dark:bg-gray-700',
    shared:     'text-teal-700   dark:text-teal-400   bg-teal-50   dark:bg-teal-900/30',
    sandbox:    'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors[env] ?? colors.dev}`}>
      {env}
    </span>
  )
}

function QuickAction({ title, desc, icon, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="aws-card p-5 text-left hover:shadow-card-hover transition-shadow duration-200 group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
        {icon}
      </div>
      <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-aws-orange transition-colors">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
    </button>
  )
}

function ServerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function StopIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
