import { useState } from 'react'
import ServiceTable from '../components/ui/ServiceTable'
import { VPCS, SUBNETS, SECURITY_GROUPS } from '../data/servicesData'

const TABS = [
  { key: 'vpcs',   label: 'VPCs',             count: VPCS.length },
  { key: 'subnets',label: 'Subnets',           count: SUBNETS.length },
  { key: 'sgs',    label: 'Security Groups',   count: SECURITY_GROUPS.length },
]

const VPC_COLS = [
  { key: 'id',            label: 'VPC ID' },
  { key: 'name',          label: 'Name' },
  { key: 'cidr',          label: 'IPv4 CIDR' },
  { key: 'state',         label: 'State' },
  { key: 'subnets',       label: 'Subnets' },
  { key: 'dns_hostnames', label: 'DNS Hostnames' },
  { key: 'tenancy',       label: 'Tenancy' },
]

const SUBNET_COLS = [
  { key: 'id',           label: 'Subnet ID' },
  { key: 'name',         label: 'Name' },
  { key: 'vpc',          label: 'VPC' },
  { key: 'cidr',         label: 'IPv4 CIDR' },
  { key: 'az',           label: 'Availability Zone' },
  { key: 'type',         label: 'Type' },
  { key: 'available_ips',label: 'Available IPs' },
]

const SG_COLS = [
  { key: 'id',          label: 'Security Group ID' },
  { key: 'name',        label: 'Name' },
  { key: 'vpc',         label: 'VPC' },
  { key: 'inbound',     label: 'Inbound Rules' },
  { key: 'outbound',    label: 'Outbound Rules' },
  { key: 'description', label: 'Description' },
]

function NetworkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
  )
}

export default function VpcPage() {
  const [activeTab, setActiveTab] = useState('vpcs')

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <NetworkIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Virtual Private Cloud</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">VPCs · Subnets · Security Groups — us-east-1</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'VPCs',            value: VPCS.length },
          { label: 'Subnets',         value: SUBNETS.length },
          { label: 'Security Groups', value: SECURITY_GROUPS.length },
        ].map(({ label, value }) => (
          <div key={label} className="aws-card px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-aws-border">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
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

      {activeTab === 'vpcs' && (
        <ServiceTable title="VPCs" columns={VPC_COLS} data={VPCS}
          badgeColumns={['state', 'dns_hostnames']}
          codeColumns={['id', 'cidr']}
          searchKeys={['name', 'id', 'cidr']} />
      )}
      {activeTab === 'subnets' && (
        <ServiceTable title="Subnets" columns={SUBNET_COLS} data={SUBNETS}
          badgeColumns={['type']}
          codeColumns={['id', 'cidr']}
          searchKeys={['name', 'id', 'vpc', 'az']} />
      )}
      {activeTab === 'sgs' && (
        <ServiceTable title="Security Groups" columns={SG_COLS} data={SECURITY_GROUPS}
          codeColumns={['id']}
          searchKeys={['name', 'id', 'vpc']} />
      )}
    </div>
  )
}
