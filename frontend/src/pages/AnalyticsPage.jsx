import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts'
import {
  COST_TREND, RESOURCE_HEALTH_TREND,
  S3_BUCKETS, LAMBDA_FUNCTIONS, RDS_INSTANCES, DYNAMODB_TABLES, ECS_CLUSTERS,
  LOAD_BALANCERS, CLOUDFRONT_DISTRIBUTIONS, SQS_QUEUES, SNS_TOPICS, AUTO_SCALING_GROUPS,
  CW_ALARMS, DOMAINS,
} from '../data/servicesData'
import { useInstanceHealth } from '../hooks/useInstanceHealth'
import Spinner from '../components/ui/Spinner'

const COST_COLORS = {
  EC2:    '#4F6EF7',
  S3:     '#22C55E',
  RDS:    '#818CF8',
  Lambda: '#F59E0B',
  Other:  '#94A3B8',
}

const RESOURCE_DISTRIBUTION = [
  { name: 'EC2',            value: 8,                               color: '#4F6EF7' },
  { name: 'S3',              value: S3_BUCKETS.length,               color: '#22C55E' },
  { name: 'Lambda',          value: LAMBDA_FUNCTIONS.length,         color: '#F59E0B' },
  { name: 'RDS',             value: RDS_INSTANCES.length,            color: '#818CF8' },
  { name: 'DynamoDB',        value: DYNAMODB_TABLES.length,          color: '#06B6D4' },
  { name: 'ECS',             value: ECS_CLUSTERS.length,             color: '#14B8A6' },
  { name: 'Load Balancers',  value: LOAD_BALANCERS.length,           color: '#8B5CF6' },
  { name: 'CloudFront',      value: CLOUDFRONT_DISTRIBUTIONS.length, color: '#A855F7' },
  { name: 'SQS / SNS',       value: SQS_QUEUES.length + SNS_TOPICS.length, color: '#F59E0B' },
  { name: 'Auto Scaling',    value: AUTO_SCALING_GROUPS.length,      color: '#84CC16' },
]

const TOTAL_RESOURCES = RESOURCE_DISTRIBUTION.reduce((s, r) => s + r.value, 0)
const LATEST_MONTH = COST_TREND[COST_TREND.length - 1]
const PREV_MONTH    = COST_TREND[COST_TREND.length - 2]
const LATEST_TOTAL  = Object.keys(COST_COLORS).reduce((s, k) => s + LATEST_MONTH[k], 0)
const PREV_TOTAL     = Object.keys(COST_COLORS).reduce((s, k) => s + PREV_MONTH[k], 0)
const COST_DELTA_PCT = (((LATEST_TOTAL - PREV_TOTAL) / PREV_TOTAL) * 100).toFixed(1)

const ACTIVE_ALARMS = CW_ALARMS.filter(a => a.state === 'ALARM').length

function StatTile({ label, value, sub, subClass = 'text-gray-500 dark:text-gray-400' }) {
  return (
    <div className="aws-card px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
      {sub && <p className={`mt-1 text-xs ${subClass}`}>{sub}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="aws-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-semibold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  )
}

const HEALTH_STYLE = {
  healthy:   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',   label: 'Healthy' },
  degraded:  { dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',   label: 'Degraded' },
  unhealthy: { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',          label: 'Unhealthy' },
  stopped:   { dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',          label: 'Stopped' },
}

function timeAgo(date) {
  if (!date) return '—'
  const secs = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000))
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  return `${Math.round(secs / 60)}m ago`
}

function HealthDotStrip({ history = [] }) {
  const padded = Array(15 - history.length).fill(null).concat(history)
  return (
    <div className="flex items-center gap-0.5">
      {padded.map((h, i) => (
        <span
          key={i}
          className={`w-1.5 h-4 rounded-sm ${h ? HEALTH_STYLE[h]?.dot ?? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
          title={h ? HEALTH_STYLE[h]?.label : 'No data yet'}
        />
      ))}
    </div>
  )
}

function InstanceHealthSection() {
  const { instances, history, checkedAt, loading, error, hasApi } = useInstanceHealth()
  const [, forceTick] = useState(0)

  // Re-render every second just to keep the "Xs ago" label live.
  useEffect(() => {
    const id = setInterval(() => forceTick(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const counts = instances.reduce((acc, i) => {
    acc[i.health] = (acc[i.health] || 0) + 1
    return acc
  }, {})

  return (
    <div className="aws-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-aws-border flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Instance Health</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            EC2 system + instance status checks — refreshes every {hasApi ? '60s' : '15s'}
            {!hasApi && ' (simulated)'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            {Object.entries(HEALTH_STYLE).map(([key, s]) => (
              counts[key] ? (
                <span key={key} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />{counts[key]} {s.label.toLowerCase()}
                </span>
              ) : null
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {loading ? 'loading…' : `checked ${timeAgo(checkedAt)}`}
          </span>
        </div>
      </div>

      {error && (
        <div className="px-5 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-300">
          Could not load live status checks — showing simulated data. ({error})
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy">
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instance</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">System</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instance</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Health</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last {15} checks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-aws-border">
            {instances.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">No instances found.</td></tr>
            ) : instances.map((i) => {
              const style = HEALTH_STYLE[i.health] || HEALTH_STYLE.stopped
              return (
                <tr key={i.instance_id} className="hover:bg-gray-50 dark:hover:bg-aws-navy-lt transition-colors">
                  <td className="px-5 py-2.5">
                    <p className="font-medium text-gray-900 dark:text-white">{i.instance_name || i.instance_id}</p>
                    <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500">{i.instance_id}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-300 capitalize">{i.system_status}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-300 capitalize">{i.instance_status}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.badge}`}>{style.label}</span>
                  </td>
                  <td className="px-5 py-2.5"><HealthDotStrip history={history[i.instance_id]} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Org-wide infrastructure insight — cost, health, and footprint</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile label="Monthly Cost (est.)" value={`$${LATEST_TOTAL.toLocaleString()}`}
          sub={`${COST_DELTA_PCT > 0 ? '+' : ''}${COST_DELTA_PCT}% vs last month`}
          subClass={COST_DELTA_PCT > 0 ? 'text-red-500' : 'text-green-500'} />
        <StatTile label="Total Resources" value={TOTAL_RESOURCES} sub="Across 10 service categories" />
        <StatTile label="Active Alarms" value={ACTIVE_ALARMS} sub={ACTIVE_ALARMS > 0 ? 'Needs attention' : 'All clear'}
          subClass={ACTIVE_ALARMS > 0 ? 'text-red-500' : 'text-green-500'} />
        <StatTile label="Domains Tracked" value={DOMAINS.length} sub="See Domains & DNS" />
      </div>

      <InstanceHealthSection />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Cost trend */}
        <div className="aws-card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cost Trend</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Estimated monthly spend by service — last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={COST_TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-aws-border" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              {Object.entries(COST_COLORS).map(([key, color]) => (
                <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={color} fill={color} fillOpacity={0.65} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resource distribution */}
        <div className="aws-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Resource Footprint</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{TOTAL_RESOURCES} resources tracked</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={RESOURCE_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {RESOURCE_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {RESOURCE_DISTRIBUTION.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="truncate">{r.name}</span>
                <span className="ml-auto font-semibold text-gray-900 dark:text-white tabular-nums">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource health trend */}
      <div className="aws-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Resource Health Trend</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Share of resources by health status — last 6 weeks</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500" />Healthy</span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-500" />Warning</span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500" />Critical</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={RESOURCE_HEALTH_TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-aws-border" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="healthy"  stackId="h" fill="#22C55E" radius={[0, 0, 0, 0]} />
            <Bar dataKey="warning"  stackId="h" fill="#F59E0B" radius={[0, 0, 0, 0]} />
            <Bar dataKey="critical" stackId="h" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
