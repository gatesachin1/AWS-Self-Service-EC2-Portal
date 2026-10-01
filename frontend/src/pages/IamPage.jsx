import { useState } from 'react'
import ServiceTable from '../components/ui/ServiceTable'
import Spinner from '../components/ui/Spinner'
import { useServiceData } from '../hooks/useServiceData'
import { IAM_USERS, IAM_ROLES } from '../data/servicesData'

const USER_COLS = [
  { key: 'username',    label: 'Username' },
  { key: 'groups',      label: 'Groups' },
  { key: 'policies',    label: 'Inline Policies' },
  { key: 'mfa',         label: 'MFA Device' },
  { key: 'access_keys', label: 'Access Keys' },
  { key: 'last_login',  label: 'Last Sign-in' },
  { key: 'created',     label: 'Created' },
]

const ROLE_COLS = [
  { key: 'name',           label: 'Role Name' },
  { key: 'trusted_entity', label: 'Trusted Entity' },
  { key: 'policies',       label: 'Attached Policies' },
  { key: 'created',        label: 'Created' },
]

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

const MOCK = { users: IAM_USERS, roles: IAM_ROLES }

export default function IamPage() {
  const [activeTab, setActiveTab] = useState('users')
  const { data, loading, error } = useServiceData('iam', MOCK)

  const users = data?.users || []
  const roles = data?.roles || []

  const TABS = [
    { key: 'users', label: 'Users', count: users.length },
    { key: 'roles', label: 'Roles', count: roles.length },
  ]

  const mfaCount = users.filter(u => u.mfa && u.mfa !== '—').length

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
            <ShieldIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity & Access Monitoring</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Users · Roles — Global</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          Could not load live data — showing cached mock data. ({error})
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Users', value: users.length, note: `${mfaCount} with MFA` },
          { label: 'Roles', value: roles.length, note: 'Service roles' },
        ].map(({ label, value, note }) => (
          <div key={label} className="aws-card px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      <nav className="pill-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pill-tab ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
            <span className="count">{tab.count}</span>
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : (
        <>
          {activeTab === 'users' && (
            <ServiceTable title="Users" subtitle="IAM users in this account"
              columns={USER_COLS} data={users}
              badgeColumns={['mfa']}
              searchKeys={['username', 'groups']} />
          )}
          {activeTab === 'roles' && (
            <ServiceTable title="Roles" subtitle="IAM roles and their trusted entities"
              columns={ROLE_COLS} data={roles}
              codeColumns={['trusted_entity']}
              searchKeys={['name', 'trusted_entity']} />
          )}
        </>
      )}
    </div>
  )
}
