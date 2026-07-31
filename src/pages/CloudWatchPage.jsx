import { useState } from 'react'
import ServiceTable from '../components/ui/ServiceTable'
import { CW_ALARMS, CW_DASHBOARDS } from '../data/servicesData'

const TABS = [
  { key: 'alarms',     label: 'Alarms',     count: CW_ALARMS.length },
  { key: 'dashboards', label: 'Dashboards', count: CW_DASHBOARDS.length },
]

const ALARM_COLS = [
  { key: 'name',      label: 'Alarm Name' },
  { key: 'state',     label: 'State' },
  { key: 'metric',    label: 'Metric' },
  { key: 'threshold', label: 'Condition' },
  { key: 'actions',   label: 'Actions' },
  { key: 'updated',   label: 'Last Updated' },
]

const DASHBOARD_COLS = [
  { key: 'name',         label: 'Dashboard Name' },
  { key: 'widgets',      label: 'Widgets' },
  { key: 'region',       label: 'Region' },
  { key: 'last_updated', label: 'Last Modified' },
]

const alarmCounts = {
  ok:   CW_ALARMS.filter(a => a.state === 'OK').length,
  alarm:CW_ALARMS.filter(a => a.state === 'ALARM').length,
  insuf:CW_ALARMS.filter(a => a.state === 'INSUFFICIENT_DATA').length,
}

function MonitorIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

export default function CloudWatchPage() {
  const [activeTab, setActiveTab] = useState('alarms')

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white">
            <MonitorIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CloudWatch</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Alarms · Dashboards — us-east-1</p>
      </div>

      {/* Alarm state summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="aws-card px-4 py-3 border-l-4 border-green-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">OK</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{alarmCounts.ok}</p>
        </div>
        <div className="aws-card px-4 py-3 border-l-4 border-red-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">IN ALARM</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{alarmCounts.alarm}</p>
        </div>
        <div className="aws-card px-4 py-3 border-l-4 border-gray-400">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">INSUFFICIENT DATA</p>
          <p className="text-3xl font-bold text-gray-500 dark:text-gray-400">{alarmCounts.insuf}</p>
        </div>
      </div>

      {/* Active alarms banner */}
      {alarmCounts.alarm > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{alarmCounts.alarm} alarm{alarmCounts.alarm > 1 ? 's' : ''} in ALARM state</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {CW_ALARMS.filter(a => a.state === 'ALARM').map(a => a.name).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-aws-border">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-aws-orange text-aws-orange'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                activeTab === tab.key ? 'bg-aws-orange text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'alarms' && (
        <ServiceTable title="Alarms" subtitle="CloudWatch metric alarms"
          columns={ALARM_COLS} data={CW_ALARMS}
          badgeColumns={['state']}
          searchKeys={['name', 'metric']} />
      )}
      {activeTab === 'dashboards' && (
        <ServiceTable title="Dashboards" subtitle="CloudWatch dashboards"
          columns={DASHBOARD_COLS} data={CW_DASHBOARDS}
          searchKeys={['name', 'region']} />
      )}
    </div>
  )
}
