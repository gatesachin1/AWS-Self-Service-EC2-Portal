import { useEffect, useMemo, useRef, useState } from 'react'
import ServiceTable from '../components/ui/ServiceTable'
import Spinner from '../components/ui/Spinner'
import { useServiceData } from '../hooks/useServiceData'
import { CLOUDTRAIL_EVENTS } from '../data/servicesData'

const COLUMNS = [
  { key: 'event_time',    label: 'Event time' },
  { key: 'event_name',    label: 'Event name' },
  { key: 'username',      label: 'User name' },
  { key: 'resource_type', label: 'Resource type' },
  { key: 'resource',      label: 'Resource name' },
  { key: 'event_source',  label: 'Event source' },
  { key: 'aws_region',    label: 'AWS region' },
  { key: 'read_only',     label: 'Read only' },
  { key: 'status',        label: 'Status' },
]

// Same set AWS CloudTrail's console offers — only one attribute can be
// searched at a time, matching the real LookupEvents API (it takes a single
// LookupAttribute, not an arbitrary multi-field query).
const LOOKUP_ATTRIBUTES = [
  { key: 'event_name',    label: 'Event name' },
  { key: 'event_source',  label: 'Event source' },
  { key: 'event_id',      label: 'Event ID' },
  { key: 'read_only',     label: 'Read only' },
  { key: 'resource_name', label: 'Resource name' },
  { key: 'resource_type', label: 'Resource type' },
  { key: 'username',      label: 'User name' },
  { key: 'access_key_id', label: 'AWS access key' },
]
// resource_name maps to the `resource` field on our event objects
const ATTR_FIELD = { resource_name: 'resource' }

const TIME_RANGES = [
  { key: 'all', label: 'No time limit', minutes: null },
  { key: '30m', label: 'Last 30 minutes', minutes: 30 },
  { key: '1h',  label: 'Last 1 hour', minutes: 60 },
  { key: '3h',  label: 'Last 3 hours', minutes: 180 },
  { key: '12h', label: 'Last 12 hours', minutes: 720 },
  { key: '1d',  label: 'Last 1 day', minutes: 1440 },
  { key: '1w',  label: 'Last 1 week', minutes: 10080 },
  { key: '2w',  label: 'Last 2 weeks', minutes: 20160 },
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const MOCK = { items: CLOUDTRAIL_EVENTS }

// Pool used to simulate a live event tail when no backend is configured yet.
const SIM_EVENTS = [
  { event_name: 'DescribeInstances',     event_source: 'ec2.amazonaws.com',       resource_type: 'AWS::EC2::Instance',  read_only: 'Yes' },
  { event_name: 'GetObject',             event_source: 's3.amazonaws.com',        resource_type: 'AWS::S3::Object',     read_only: 'Yes' },
  { event_name: 'ListFunctions20150331', event_source: 'lambda.amazonaws.com',    resource_type: 'AWS::Lambda::Function', read_only: 'Yes' },
  { event_name: 'DescribeAlarms',        event_source: 'monitoring.amazonaws.com', resource_type: 'AWS::CloudWatch::Alarm', read_only: 'Yes' },
  { event_name: 'AssumeRole',            event_source: 'sts.amazonaws.com',       resource_type: 'AWS::IAM::Role',      read_only: 'No' },
  { event_name: 'PutLogEvents',          event_source: 'logs.amazonaws.com',      resource_type: 'AWS::Logs::LogGroup', read_only: 'No' },
]
const SIM_USERS = ['sachin.gate', 'devops-ci-bot', 'terraform-admin', 'priya.mehta', 'readonly-auditor']
const SIM_IPS   = ['10.0.1.45', '10.0.2.78', '203.0.113.17', '203.0.113.42']

function pad(n) { return String(n).padStart(2, '0') }
function nowStamp() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function simulateEvent(seq) {
  const tpl = SIM_EVENTS[Math.floor(Math.random() * SIM_EVENTS.length)]
  return {
    ...tpl,
    event_id:      `live-${Date.now()}-${seq}`,
    event_time:    nowStamp(),
    username:      SIM_USERS[Math.floor(Math.random() * SIM_USERS.length)],
    source_ip:     SIM_IPS[Math.floor(Math.random() * SIM_IPS.length)],
    aws_region:    'us-east-1',
    resource:      '—',
    access_key_id: '—',
    status:        'Success',
  }
}

function CloudTrailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function parseStamp(s) {
  // "YYYY-MM-DD HH:MM:SS" in local time, matching how the stamps are generated
  return new Date(s.replace(' ', 'T')).getTime()
}

export default function CloudTrailPage() {
  const hasApi = !!import.meta.env.VITE_API_URL
  const { data, loading, error } = useServiceData('cloudtrail', MOCK, { pollMs: 5000 })
  const [live, setLive] = useState(true)
  const [events, setEvents] = useState(data?.items || [])
  const simSeq = useRef(0)

  // Filters
  const [lookupAttr, setLookupAttr]   = useState('event_name')
  const [lookupValue, setLookupValue] = useState('')
  const [timeRange, setTimeRange]     = useState('all')

  // Pagination
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Sync from the hook whenever fresh data arrives (initial load, or a poll in live-API mode).
  useEffect(() => {
    const incoming = data?.items || data || []
    if (incoming.length) setEvents(incoming)
  }, [data])

  // Mock mode has no backend to poll yet, so simulate a live tail locally —
  // this is the "for now, test data works" path; once VITE_API_URL points at
  // the deployed API, the hook's 5s poll above takes over with real CloudTrail data.
  useEffect(() => {
    if (hasApi || !live) return
    const interval = setInterval(() => {
      simSeq.current += 1
      setEvents(prev => [simulateEvent(simSeq.current), ...prev].slice(0, 200))
    }, 4000)
    return () => clearInterval(interval)
  }, [hasApi, live, simSeq])

  // Reset to page 1 whenever a filter or page size changes.
  useEffect(() => { setPage(1) }, [lookupAttr, lookupValue, timeRange, pageSize])

  const suggestions = useMemo(() => {
    const field = ATTR_FIELD[lookupAttr] || lookupAttr
    if (['read_only', 'event_id', 'access_key_id'].includes(lookupAttr)) return []
    return [...new Set(events.map(e => e[field]).filter(Boolean))].sort()
  }, [events, lookupAttr])

  const filtered = useMemo(() => {
    let list = events

    if (lookupAttr === 'read_only') {
      if (lookupValue) list = list.filter(e => e.read_only === lookupValue)
    } else if (lookupValue.trim()) {
      const field = ATTR_FIELD[lookupAttr] || lookupAttr
      const q = lookupValue.trim().toLowerCase()
      list = list.filter(e => String(e[field] ?? '').toLowerCase().includes(q))
    }

    const range = TIME_RANGES.find(r => r.key === timeRange)
    if (range?.minutes) {
      const cutoff = Date.now() - range.minutes * 60_000
      list = list.filter(e => parseStamp(e.event_time) >= cutoff)
    }

    return list
  }, [events, lookupAttr, lookupValue, timeRange])

  const totalCount = filtered.length
  const pageCount  = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage   = Math.min(page, pageCount)
  const pageData   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const hasFilters = lookupValue.trim() !== '' || timeRange !== 'all'
  function clearFilters() {
    setLookupValue('')
    setTimeRange('all')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <CloudTrailIcon />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CloudTrail — Event history</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Account activity log — us-east-1
            {!hasApi && ' · simulated live feed (mock data)'}
          </p>
        </div>

        <button
          onClick={() => setLive(l => !l)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            live
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {live ? 'Live' : 'Paused'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          Could not load live CloudTrail data — showing cached mock data. ({error})
        </div>
      )}

      {/* Lookup attributes + time range — mirrors the AWS console's Event history filter bar */}
      <div className="aws-card p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Lookup attributes</p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative sm:w-56 flex-shrink-0">
              <select
                value={lookupAttr}
                onChange={(e) => { setLookupAttr(e.target.value); setLookupValue('') }}
                className="aws-input appearance-none pr-8"
              >
                {LOOKUP_ATTRIBUTES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {lookupAttr === 'read_only' ? (
              <div className="relative flex-1">
                <select
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  className="aws-input appearance-none pr-8"
                >
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="relative flex-1">
                <input
                  type="text"
                  list="ct-lookup-suggestions"
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  placeholder={`Enter ${LOOKUP_ATTRIBUTES.find(a => a.key === lookupAttr)?.label.toLowerCase()}…`}
                  className="aws-input"
                />
                <datalist id="ct-lookup-suggestions">
                  {suggestions.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Time range</p>
          <nav className="pill-tabs overflow-x-auto max-w-full">
            {TIME_RANGES.map((r) => (
              <button key={r.key} onClick={() => setTimeRange(r.key)} className={`pill-tab ${timeRange === r.key ? 'active' : ''}`}>
                {r.label}
              </button>
            ))}
          </nav>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-aws-border">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalCount} event{totalCount !== 1 ? 's' : ''} match{totalCount === 1 ? 'es' : ''} the current filters
            </p>
            <button onClick={clearFilters} className="text-xs font-semibold text-aws-orange hover:text-aws-orange-dk transition-colors">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : (
        <ServiceTable
          title="Events"
          subtitle={hasApi ? 'Polling CloudTrail every 5s' : 'Simulated event stream — new entries every few seconds'}
          columns={COLUMNS}
          data={pageData}
          badgeColumns={['status', 'read_only']}
          pagination={{
            page: safePage,
            pageSize,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      )}
    </div>
  )
}
