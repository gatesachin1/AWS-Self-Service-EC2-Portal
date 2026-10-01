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
