import { useState } from 'react'
import ServiceTable from '../components/ui/ServiceTable'
import { IAM_USERS, IAM_ROLES } from '../data/servicesData'

const TABS = [
  { key: 'users', label: 'Users', count: IAM_USERS.length },
  { key: 'roles', label: 'Roles', count: IAM_ROLES.length },
]

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

export default function IamPage() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <ShieldIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity & Access Monitoring</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Users · Roles — Global</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Users', value: IAM_USERS.length, note: `${IAM_USERS.filter(u => u.mfa !== '—').length} with MFA` },
          { label: 'Roles', value: IAM_ROLES.length, note: 'Service roles' },
        ].map(({ label, value, note }) => (
          <div key={label} className="aws-card px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{note}</p>
          </div>
        ))}
      </div>

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

      {activeTab === 'users' && (
        <ServiceTable title="Users" subtitle="IAM users in this account"
          columns={USER_COLS} data={IAM_USERS}
          badgeColumns={['mfa']}
          searchKeys={['username', 'groups']} />
      )}
      {activeTab === 'roles' && (
        <ServiceTable title="Roles" subtitle="IAM roles and their trusted entities"
          columns={ROLE_COLS} data={IAM_ROLES}
          codeColumns={['trusted_entity']}
          searchKeys={['name', 'trusted_entity']} />
      )}
    </div>
  )
}
