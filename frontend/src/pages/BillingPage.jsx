import { Fragment, useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import Spinner from '../components/ui/Spinner'
import { useServiceData } from '../hooks/useServiceData'
import { BILLING_DATA, BILLING_SERVICE_LABELS, billingLineItemsFor } from '../data/servicesData'

const PALETTE = ['#4F6EF7', '#22C55E', '#818CF8', '#F59E0B', '#06B6D4', '#A855F7', '#8B5CF6', '#14B8A6', '#EC4899', '#94A3B8', '#FB923C', '#84CC16']

const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
const moneyShort = (n) => `$${Math.round(n).toLocaleString()}`

function serviceLabel(key) { return BILLING_SERVICE_LABELS[key] || key }

// Sort a month's { services } object into a descending-by-cost array with
// stable colors assigned by rank — works the same whether the keys are the
// mock's short names or real Cost Explorer's full AWS service names.
function rankServices(services) {
  return Object.entries(services)
    .map(([key, amount]) => ({ key, amount }))
    .sort((a, b) => b.amount - a.amount)
    .map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))
}

function MoneyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10m-3-7.5c0-1.38 1.34-2.5 3-2.5s3 1.12 3 2.5-1.34 2.5-3 2.5-3 1.12-3 2.5 1.34 2.5 3 2.5 3-1.12 3-2.5" />
    </svg>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="aws-card px-3 py-2 text-xs shadow-lg max-w-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.filter(p => p.value > 0).map((p) => (
        <p key={p.dataKey || p.name} style={{ color: p.color || p.fill }}>
          {serviceLabel(p.name || p.dataKey)}: <span className="font-semibold">{money(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div className="aws-card px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${accent || 'text-gray-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
  )
}

function OverviewTab({ months }) {
  const current  = months[months.length - 1]
  const previous = months[months.length - 2]
  const deltaPct = previous?.total ? (((current.total - previous.total) / previous.total) * 100).toFixed(1) : '0.0'

  const allServiceKeys = useMemo(
    () => [...new Set(months.flatMap(m => Object.keys(m.services)))],
    [months]
  )
  const rankedCurrent = useMemo(() => rankServices(current.services), [current])

  // Flattened for the chart — avoids depending on recharts' dot-path dataKey resolution.
  const chartData = useMemo(
    () => months.map(m => ({ label: m.label, ...m.services })),
    [months]
  )

  // Top movers — biggest $ change this month vs last month, per service.
  const movers = useMemo(() => {
    if (!previous) return []
    return allServiceKeys
      .map((key) => {
        const now = current.services[key] || 0
        const prev = previous.services[key] || 0
        return { key, now, prev, delta: now - prev, pct: prev ? ((now - prev) / prev) * 100 : 0 }
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 5)
  }, [allServiceKeys, current, previous])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile label="Month-to-date spend" value={moneyShort(current.total)} sub={current.label} />
        <StatTile label="Forecasted month-end" value={current.forecastTotal ? moneyShort(current.forecastTotal) : '—'} sub="Based on current daily rate" />
        <StatTile label="Last month total" value={previous ? moneyShort(previous.total) : '—'} sub={previous?.label} />
        <StatTile
          label="Change vs last month"
          value={`${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
          accent={deltaPct > 0 ? 'text-red-500' : 'text-green-500'}
          sub="Month-to-date pace"
        />
      </div>

      <div className="aws-card p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cost Trend</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Spend by service — trailing 12 months</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-aws-border" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
            <Tooltip content={<ChartTooltip />} />
            {allServiceKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} name={key} stackId="cost"
                stroke={PALETTE[i % PALETTE.length]} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.65} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="aws-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Cost by Service</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{current.label} · {moneyShort(current.total)} total</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={rankedCurrent} dataKey="amount" nameKey="key" innerRadius={50} outerRadius={82} paddingAngle={2}>
                  {rankedCurrent.map((s) => <Cell key={s.key} fill={s.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              {rankedCurrent.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-600 dark:text-gray-300 truncate">{serviceLabel(s.key)}</span>
                  <span className="ml-auto font-semibold text-gray-900 dark:text-white tabular-nums flex-shrink-0">{moneyShort(s.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="aws-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-aws-border">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Biggest Changes</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">vs {previous?.label}</p>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100 dark:divide-aws-border">
              {movers.map((m) => (
                <tr key={m.key} className="hover:bg-gray-50 dark:hover:bg-aws-navy-lt transition-colors">
                  <td className="px-5 py-2.5 text-gray-700 dark:text-gray-300 truncate max-w-[1px]">{serviceLabel(m.key)}</td>
                  <td className="px-5 py-2.5 text-right text-xs text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap">{moneyShort(m.now)}</td>
                  <td className={`px-5 py-2.5 text-right text-xs font-semibold tabular-nums whitespace-nowrap ${m.delta > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {m.delta > 0 ? '+' : ''}{moneyShort(m.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BillsTab({ months }) {
  const [selectedKey, setSelectedKey] = useState(months[months.length - 1].key)
  const [expanded, setExpanded] = useState(new Set())

  const monthIdx = months.findIndex(m => m.key === selectedKey)
  const month = months[monthIdx]
  const previous = months[monthIdx - 1]
  const ranked = useMemo(() => rankServices(month.services), [month])

  function toggle(key) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function downloadCsv() {
    const rows = [['Service', 'Usage Type', 'Amount (USD)']]
    for (const s of ranked) {
      for (const item of billingLineItemsFor(s.key, s.amount)) {
        rows.push([serviceLabel(s.key), item.label, item.amount.toFixed(2)])
      }
    }
    rows.push(['', 'Total', month.total.toFixed(2)])
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bill-${month.key}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="aws-input appearance-none pr-9 font-semibold w-56"
          >
            {[...months].reverse().map((m) => (
              <option key={m.key} value={m.key}>{m.label}{m.isCurrent ? ' (month to date)' : ''}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button onClick={downloadCsv} className="btn-secondary gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download CSV
        </button>
      </div>

      <div className="aws-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {month.isCurrent ? 'Estimated total — month to date' : 'Total for ' + month.label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{money(month.total)}</p>
        </div>
        {previous && (
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Previous month ({previous.label})</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{money(previous.total)}</p>
          </div>
        )}
      </div>

      <div className="aws-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-aws-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Charges by Service</h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">Click a row for usage-type detail</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy">
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8" />
              <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">% of bill</th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-aws-border">
            {ranked.map((s) => {
              const isOpen = expanded.has(s.key)
              const pct = month.total ? (s.amount / month.total) * 100 : 0
              return (
                <Fragment key={s.key}>
                  <tr
                    onClick={() => toggle(s.key)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-aws-navy-lt transition-colors"
                  >
                    <td className="px-5 py-3">
                      <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="font-medium text-gray-900 dark:text-white">{serviceLabel(s.key)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-gray-500 dark:text-gray-400 tabular-nums">{pct.toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white tabular-nums">{money(s.amount)}</td>
                  </tr>
                  {isOpen && billingLineItemsFor(s.key, s.amount).map((item) => (
                    <tr key={s.key + item.label} className="bg-gray-50/60 dark:bg-aws-navy/40">
                      <td className="px-5 py-2" />
                      <td className="px-2 py-2 pl-8 font-mono text-xs text-gray-500 dark:text-gray-400">{item.label}</td>
                      <td className="px-5 py-2" />
                      <td className="px-5 py-2 text-right font-mono text-xs text-gray-500 dark:text-gray-400 tabular-nums">{money(item.amount)}</td>
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy">
              <td colSpan={3} className="px-5 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Total</td>
              <td className="px-5 py-3 text-right text-sm font-bold text-gray-900 dark:text-white tabular-nums">{money(month.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { data, loading, error } = useServiceData('billing', { months: BILLING_DATA })

  const months = data?.months || BILLING_DATA

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <MoneyIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Cost Management</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Cost Explorer · Monthly bills — us-east-1</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          Could not load live billing data — showing cached mock data. ({error})
        </div>
      )}

      <nav className="pill-tabs">
        <button onClick={() => setActiveTab('overview')} className={`pill-tab ${activeTab === 'overview' ? 'active' : ''}`}>Overview</button>
        <button onClick={() => setActiveTab('bills')} className={`pill-tab ${activeTab === 'bills' ? 'active' : ''}`}>Bills</button>
      </nav>

      {loading || !months.length ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab months={months} />}
          {activeTab === 'bills' && <BillsTab months={months} />}
        </>
      )}
    </div>
  )
}
