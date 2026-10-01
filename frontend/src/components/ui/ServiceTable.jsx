import { useState } from 'react'

const BADGE_COLORS = {
  active:            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  available:         'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  enabled:           'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  succeeded:         'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  success:           'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  deployed:          'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  inservice:         'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  ok:                'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  issued:            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  virtualmfa:        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  provisioning:      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  running:           'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'in progress':     'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  pending:           'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  suspended:         'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  'expiring soon':   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  failed:            'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  alarm:             'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  accessdenied:      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  expired:           'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  stopped:           'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  inactive:          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  disabled:          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  archived:          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  insufficient_data: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  application:       'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  network:           'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  public:            'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  private:           'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  fifo:              'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  standard:          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

function getBadgeClass(value) {
  const key = (value || '').toLowerCase().replace(/[^a-z_]/g, '').replace(/ /g, '_')
  return BADGE_COLORS[key] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}

function Badge({ value }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${getBadgeClass(value)}`}>
      {value}
    </span>
  )
}

export default function ServiceTable({
  title,
  subtitle,
  columns,
  data,
  badgeColumns = [],
  codeColumns = [],
  searchKeys = [],
  emptyMessage = 'No resources found.',
  // Optional — when provided, `data` is treated as an already-paginated slice
  // and a page-size + prev/next footer is rendered. { page, pageSize, totalCount,
  // pageSizeOptions, onPageChange, onPageSizeChange }. The built-in search box
  // above is unrelated to this — pass searchKeys only when the caller isn't
  // already filtering `data` itself (e.g. CloudTrail's lookup-attribute filter).
  pagination,
}) {
  const [search, setSearch] = useState('')

  const rows = Array.isArray(data) ? data : []

  const filtered = search.trim()
    ? rows.filter((row) =>
        searchKeys.some((k) =>
          String(row[k] ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : rows

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {searchKeys.length > 0 && (
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              className="aws-input pl-9 text-sm"
            />
          </div>
        )}
      </div>

      <div className="aws-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {pagination
              ? `${pagination.totalCount} result${pagination.totalCount !== 1 ? 's' : ''}`
              : <>{filtered.length} resource{filtered.length !== 1 ? 's' : ''}{search && ` matching "${search}"`}</>}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-aws-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-14 text-center text-sm text-gray-400 dark:text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-aws-navy-lt transition-colors">
                    {columns.map((col) => {
                      const val = row[col.key]
                      const isFirst = col === columns[0]
                      const isBadge = badgeColumns.includes(col.key)
                      const isCode = codeColumns.includes(col.key)
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 whitespace-nowrap ${
                            isFirst ? 'font-medium text-gray-900 dark:text-white' :
                            isCode  ? 'font-mono text-xs text-aws-orange' :
                            'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {col.render ? col.render(row) :
                           isBadge ? <Badge value={val ?? '—'} /> :
                           val === null || val === undefined ? '—' :
                           String(val)}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-aws-border bg-gray-50 dark:bg-aws-navy flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Rows per page</span>
              <div className="relative">
                <select
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                  className="appearance-none rounded-full border border-gray-200 dark:border-aws-border bg-white dark:bg-aws-navy-lt
                             pl-3 pr-7 py-1 text-xs font-medium text-gray-700 dark:text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-aws-orange"
                >
                  {(pagination.pageSizeOptions || [10, 20, 50]).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="tabular-nums">
                {pagination.totalCount === 0
                  ? '0 results'
                  : `${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of ${pagination.totalCount}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-action !px-2.5 !py-1"
                  aria-label="Previous page"
                >
                  ‹ Prev
                </button>
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.pageSize >= pagination.totalCount}
                  className="btn-action !px-2.5 !py-1"
                  aria-label="Next page"
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
