import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import ServiceTable from '../components/ui/ServiceTable'
import Spinner from '../components/ui/Spinner'
import { useServiceData } from '../hooks/useServiceData'
import {
  DOMAINS, SSL_CERTIFICATES, DNS_RECORDS,
  CF_SERIES_BY_RANGE, CF_SUMMARY_BY_RANGE, CF_DOMAIN_SHARE,
  CF_TRAFFIC_BY_COUNTRY, CF_STATUS_CODES, CF_TOP_PATHS, CF_BOT_TRAFFIC,
} from '../data/servicesData'

const CF_ORANGE = '#F6821F'

function daysUntil(dateStr) {
  const target = new Date(dateStr + 'T00:00:00Z')
  const now = new Date()
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - todayUtc) / 86_400_000)
}

function ExpiryBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  let cls, label
  if (days < 0)       { cls = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';          label = `Expired ${Math.abs(days)}d ago` }
  else if (days <= 14) { cls = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';          label = `${days}d left` }
  else if (days <= 30) { cls = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';  label = `${days}d left` }
  else                  { cls = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'; label = `${days}d left` }
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{label}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500">{dateStr}</span>
    </div>
  )
}

function ProxiedCell({ value }) {
  const on = value === 'Yes'
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${on ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}`}>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.5 10.5c-.17 0-.34.01-.5.03A5.5 5.5 0 008 11.5c0 .17.01.34.03.5H6.5a3.5 3.5 0 000 7h12a4 4 0 000-8z" />
      </svg>
      {on ? 'Proxied' : 'DNS only'}
    </span>
  )
}

const DOMAIN_COLS = [
  { key: 'domain',      label: 'Domain' },
  { key: 'registrar',   label: 'Registrar' },
  { key: 'status',      label: 'Status' },
  { key: 'auto_renew',  label: 'Auto-renew' },
  { key: 'expires',     label: 'Expires', render: (row) => <ExpiryBadge dateStr={row.expires} /> },
  { key: 'nameservers', label: 'Nameservers' },
  { key: 'created',     label: 'Registered' },
]

const SSL_COLS = [
  { key: 'domain',     label: 'Domain / Certificate' },
  { key: 'issuer',     label: 'Issuer' },
  { key: 'type',       label: 'Type' },
  { key: 'expires',     label: 'Expires', render: (row) => <ExpiryBadge dateStr={row.expires} /> },
  { key: 'auto_renew', label: 'Auto-renew' },
  { key: 'in_use',     label: 'In Use By' },
]

const DNS_COLS = [
  { key: 'domain',  label: 'Domain' },
  { key: 'type',    label: 'Type' },
  { key: 'name',    label: 'Name' },
  { key: 'value',   label: 'Value' },
  { key: 'ttl',     label: 'TTL' },
  { key: 'proxied', label: 'Proxy Status', render: (row) => <ProxiedCell value={row.proxied} /> },
]

function DomainsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" />
      <path strokeLinecap="round" d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
    </svg>
  )
}

function CloudIcon({ className = 'w-4 h-4', style }) {
  return (
    <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.5 10.5c-.17 0-.34.01-.5.03A5.5 5.5 0 008 11.5c0 .17.01.34.03.5H6.5a3.5 3.5 0 000 7h12a4 4 0 000-8z" />
    </svg>
  )
}

const MOCK = { domains: DOMAINS, certificates: SSL_CERTIFICATES, dns_records: DNS_RECORDS }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="aws-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey || p.name} style={{ color: p.color || p.stroke || p.fill }}>
          {p.name}: <span className="font-semibold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  )
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div className="aws-card px-4 py-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 tabular-nums ${accent || 'text-gray-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function RANGE_LABEL(r) { return { '24h': 'Last 24 Hours', '7d': 'Last 7 Days', '30d': 'Last 30 Days' }[r] }

function AnalyticsTab() {
  const [range, setRange] = useState('7d')
  const [domain, setDomain] = useState('all')

  const share = domain === 'all' ? 1 : (CF_DOMAIN_SHARE[domain] ?? 0.1)
  const baseSummary = CF_SUMMARY_BY_RANGE[range]
  const series = CF_SERIES_BY_RANGE[range].map((d) => ({
    ...d,
    requests: Math.round(d.requests * share),
    cached:   Math.round(d.cached * share),
    uncached: Math.round(d.uncached * share),
    threats:  Math.round(d.threats * share),
  }))

  const summary = {
    requests:        Math.round(baseSummary.requests * share),
    visitors:        Math.round(baseSummary.visitors * share),
    bandwidth_gb:    +(baseSummary.bandwidth_gb * share).toFixed(1),
    threats:         Math.round(baseSummary.threats * share),
    cached_pct:      baseSummary.cached_pct,
    avg_response_ms: baseSummary.avg_response_ms,
    uptime_pct:      baseSummary.uptime_pct,
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CloudIcon className="w-4 h-4" style={{ color: CF_ORANGE }} />
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="rounded-full border border-gray-200 dark:border-aws-border bg-white dark:bg-aws-navy-lt
                       px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-aws-orange"
          >
            <option value="all">All domains</option>
            {DOMAINS.map((d) => <option key={d.domain} value={d.domain}>{d.domain}</option>)}
          </select>
        </div>

        <nav className="pill-tabs">
          {['24h', '7d', '30d'].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`pill-tab ${range === r ? 'active' : ''}`}>
              {RANGE_LABEL(r)}
            </button>
          ))}
        </nav>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatTile label="Requests"        value={summary.requests.toLocaleString()} />
        <StatTile label="Unique Visitors" value={summary.visitors.toLocaleString()} />
        <StatTile label="Bandwidth"       value={`${summary.bandwidth_gb} GB`} />
        <StatTile label="Cached"          value={`${summary.cached_pct}%`} accent="text-green-600 dark:text-green-400" />
        <StatTile label="Threats Blocked" value={summary.threats.toLocaleString()} accent="text-red-500" />
        <StatTile label="Avg Response"    value={`${summary.avg_response_ms} ms`} sub={`${summary.uptime_pct}% uptime`} />
      </div>

      {/* Main traffic + threats composed chart */}
      <div className="aws-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Traffic & Threats</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cached vs uncached requests, with threats blocked overlaid — {RANGE_LABEL(range).toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full" style={{ background: '#4F6EF7' }} />Cached</span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full" style={{ background: '#C7D2FE' }} />Uncached</span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full" style={{ background: CF_ORANGE }} />Threats</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={series} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-aws-border" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
              interval={series.length > 15 ? Math.floor(series.length / 10) : 0} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area yAxisId="left" type="monotone" dataKey="cached"   name="Cached"   stackId="t" stroke="#4F6EF7" fill="#4F6EF7" fillOpacity={0.7} />
            <Area yAxisId="left" type="monotone" dataKey="uncached" name="Uncached" stackId="t" stroke="#C7D2FE" fill="#C7D2FE" fillOpacity={0.7} />
            <Line yAxisId="right" type="monotone" dataKey="threats" name="Threats blocked" stroke={CF_ORANGE} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Country + status codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="aws-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Traffic by Country</h2>
          <div className="space-y-2.5">
            {CF_TRAFFIC_BY_COUNTRY.map((c) => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-base leading-none">{c.flag}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300 w-28 flex-shrink-0 truncate">{c.country}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-aws-navy overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: CF_ORANGE }} />
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white w-10 text-right tabular-nums">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="aws-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">HTTP Status Codes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Response distribution — {RANGE_LABEL(range).toLowerCase()}</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie data={CF_STATUS_CODES} dataKey="pct" nameKey="label" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {CF_STATUS_CODES.map((s) => <Cell key={s.code} fill={s.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {CF_STATUS_CODES.map((s) => (
                <div key={s.code} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-600 dark:text-gray-300">{s.code} {s.label}</span>
                  <span className="ml-auto font-semibold text-gray-900 dark:text-white tabular-nums">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top paths + bot traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="aws-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-aws-border">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Top Requested Paths</h2>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100 dark:divide-aws-border">
              {CF_TOP_PATHS.map((p) => (
                <tr key={p.path} className="hover:bg-gray-50 dark:hover:bg-aws-navy-lt transition-colors">
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-300">{p.path}</td>
                  <td className="px-5 py-2.5 text-right text-xs text-gray-500 dark:text-gray-400 tabular-nums">{p.requests.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right text-xs font-semibold text-gray-900 dark:text-white tabular-nums w-16">{p.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="aws-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Bot vs Human Traffic</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Based on request fingerprinting</p>
          <div className="h-3 rounded-full overflow-hidden flex w-full mb-3">
            {CF_BOT_TRAFFIC.map((b) => (
              <div key={b.name} style={{ width: `${b.pct}%`, background: b.color }} title={`${b.name}: ${b.pct}%`} />
            ))}
          </div>
          <div className="space-y-2">
            {CF_BOT_TRAFFIC.map((b) => (
              <div key={b.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
                <span className="text-gray-600 dark:text-gray-300">{b.name}</span>
                <span className="ml-auto font-semibold text-gray-900 dark:text-white tabular-nums">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
        <CloudIcon className="w-3.5 h-3.5" />
        Styled after Cloudflare's Zone Analytics — this panel is demo data shaped like the real API response.
        Connect a Cloudflare API token to the backend to replace it with live traffic.
      </p>
    </div>
  )
}

export default function DomainsPage() {
  const [activeTab, setActiveTab] = useState('analytics')
  const { data, loading, error } = useServiceData('domains', MOCK)

  const domains      = data?.domains      || []
  const certificates = data?.certificates || []
  const dnsRecords   = data?.dns_records  || []

  const expiringSoon = useMemo(
    () => [...domains, ...certificates].filter(r => daysUntil(r.expires) <= 30).length,
    [domains, certificates]
  )

  const TABS = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'domains',   label: 'Domains',          count: domains.length },
    { key: 'ssl',       label: 'SSL Certificates', count: certificates.length },
    { key: 'dns',       label: 'DNS Records',      count: dnsRecords.length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: CF_ORANGE }}>
              <DomainsIcon />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Domains & DNS</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Domain registrations · SSL certificates · DNS records · edge analytics</p>
        </div>
        {expiringSoon > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {expiringSoon} expiring within 30 days
          </span>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          Could not load live data — showing cached mock data. ({error})
        </div>
      )}

      <nav className="pill-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pill-tab ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="count">{tab.count}</span>}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : (
        <>
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'domains' && (
            <ServiceTable title="Domains" subtitle="Registered domains and renewal status"
              columns={DOMAIN_COLS} data={domains}
              searchKeys={['domain', 'registrar']} />
          )}
          {activeTab === 'ssl' && (
            <ServiceTable title="SSL Certificates" subtitle="Certificate inventory and expiry tracking"
              columns={SSL_COLS} data={certificates}
              searchKeys={['domain', 'issuer', 'in_use']} />
          )}
          {activeTab === 'dns' && (
            <ServiceTable title="DNS Records" subtitle="Zone records across all tracked domains"
              columns={DNS_COLS} data={dnsRecords}
              badgeColumns={['type']}
              codeColumns={['value']}
              searchKeys={['domain', 'name', 'value', 'type']} />
          )}
        </>
      )}
    </div>
  )
}
