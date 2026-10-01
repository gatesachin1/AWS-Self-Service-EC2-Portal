import { useParams } from 'react-router-dom'
import ServiceTable from '../components/ui/ServiceTable'
import Spinner from '../components/ui/Spinner'
import { useServiceData } from '../hooks/useServiceData'
import {
  S3_BUCKETS, LOAD_BALANCERS, LAMBDA_FUNCTIONS, RDS_INSTANCES,
  DYNAMODB_TABLES, ECS_CLUSTERS, CLOUDFRONT_DISTRIBUTIONS,
  ROUTE53_ZONES, SQS_QUEUES, SNS_TOPICS, AUTO_SCALING_GROUPS,
} from '../data/servicesData'

const SERVICE_CONFIG = {
  s3: {
    title: 'S3', fullTitle: 'Simple Storage Service — Buckets',
    apiKey: 's3', color: 'bg-green-600',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" /></svg>,
    columns: [
      { key: 'name', label: 'Bucket Name' }, { key: 'region', label: 'Region' },
      { key: 'versioning', label: 'Versioning' }, { key: 'objects', label: 'Objects' },
      { key: 'size', label: 'Size' }, { key: 'public_access', label: 'Public Access' },
      { key: 'created', label: 'Created' },
    ],
    mockData: S3_BUCKETS,
    badgeColumns: ['versioning', 'public_access'], codeColumns: ['region'],
    searchKeys: ['name', 'region'],
  },

  'load-balancers': {
    title: 'Elastic Load Balancing', fullTitle: 'Load Balancers',
    apiKey: 'elb', color: 'bg-indigo-600',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>,
    columns: [
      { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' },
      { key: 'state', label: 'State' }, { key: 'scheme', label: 'Scheme' },
      { key: 'vpc', label: 'VPC' }, { key: 'azs', label: 'Availability Zones' },
      { key: 'targets', label: 'Targets' }, { key: 'created', label: 'Created' },
    ],
    mockData: LOAD_BALANCERS,
    badgeColumns: ['type', 'state'], codeColumns: ['vpc'],
    searchKeys: ['name', 'type', 'scheme'],
  },

  lambda: {
    title: 'Lambda', fullTitle: 'Lambda Functions',
    apiKey: 'lambda', color: 'bg-orange-500',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    columns: [
      { key: 'name', label: 'Function Name' }, { key: 'runtime', label: 'Runtime' },
      { key: 'memory', label: 'Memory' }, { key: 'timeout', label: 'Timeout' },
      { key: 'state', label: 'State' }, { key: 'package_size', label: 'Package Size' },
      { key: 'last_modified', label: 'Last Modified' },
    ],
    mockData: LAMBDA_FUNCTIONS,
    badgeColumns: ['state'], codeColumns: ['runtime'],
    searchKeys: ['name', 'runtime', 'handler'],
  },

  rds: {
    title: 'RDS', fullTitle: 'Relational Database Service — Instances',
    apiKey: 'rds', color: 'bg-blue-700',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3" /><path strokeLinecap="round" d="M21 12c0 1.657-4.03 3-9 3s-9-1.343-9-3" /><path strokeLinecap="round" d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" /></svg>,
    columns: [
      { key: 'id', label: 'DB Identifier' }, { key: 'engine', label: 'Engine' },
      { key: 'class', label: 'Instance Class' }, { key: 'status', label: 'Status' },
      { key: 'storage', label: 'Storage' }, { key: 'multi_az', label: 'Multi-AZ' },
      { key: 'public', label: 'Publicly Accessible' }, { key: 'created', label: 'Created' },
    ],
    mockData: RDS_INSTANCES,
    badgeColumns: ['status'], codeColumns: ['class'],
    searchKeys: ['id', 'engine'],
  },

  dynamodb: {
    title: 'DynamoDB', fullTitle: 'DynamoDB Tables',
    apiKey: 'dynamodb', color: 'bg-cyan-600',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    columns: [
      { key: 'name', label: 'Table Name' }, { key: 'status', label: 'Status' },
      { key: 'items', label: 'Item Count' }, { key: 'size', label: 'Table Size' },
      { key: 'read_cap', label: 'Read Capacity' }, { key: 'write_cap', label: 'Write Capacity' },
      { key: 'streams', label: 'Streams' }, { key: 'gsi', label: 'GSI' },
    ],
    mockData: DYNAMODB_TABLES,
    badgeColumns: ['status', 'streams'],
    searchKeys: ['name'],
  },

  ecs: {
    title: 'ECS', fullTitle: 'Elastic Container Service — Clusters',
    apiKey: 'ecs', color: 'bg-teal-600',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" /></svg>,
    columns: [
      { key: 'name', label: 'Cluster Name' }, { key: 'status', label: 'Status' },
      { key: 'launch_type', label: 'Launch Type' }, { key: 'services', label: 'Services' },
      { key: 'tasks_running', label: 'Tasks Running' }, { key: 'tasks_pending', label: 'Tasks Pending' },
      { key: 'container_instances', label: 'Container Instances' },
    ],
    mockData: ECS_CLUSTERS,
    badgeColumns: ['status', 'launch_type'],
    searchKeys: ['name'],
  },

  cloudfront: {
    title: 'CloudFront', fullTitle: 'CloudFront Distributions',
    apiKey: 'cloudfront', color: 'bg-purple-700',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    columns: [
      { key: 'id', label: 'Distribution ID' }, { key: 'domain', label: 'Domain / CNAME' },
      { key: 'status', label: 'Status' }, { key: 'origins', label: 'Origins' },
      { key: 'price_class', label: 'Price Class' }, { key: 'ssl', label: 'SSL Certificate' },
      { key: 'enabled', label: 'Enabled' }, { key: 'created', label: 'Created' },
    ],
    mockData: CLOUDFRONT_DISTRIBUTIONS,
    badgeColumns: ['status', 'enabled'], codeColumns: ['id'],
    searchKeys: ['id', 'domain', 'origins'],
  },

  route53: {
    title: 'Route 53', fullTitle: 'Route 53 — Hosted Zones',
    apiKey: 'route53', color: 'bg-sky-700',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" /><line x1="3" y1="12" x2="21" y2="12" /></svg>,
    columns: [
      { key: 'id', label: 'Hosted Zone ID' }, { key: 'name', label: 'Domain Name' },
      { key: 'type', label: 'Type' }, { key: 'records', label: 'Record Count' },
      { key: 'comment', label: 'Comment' }, { key: 'created', label: 'Created' },
    ],
    mockData: ROUTE53_ZONES,
    badgeColumns: ['type'], codeColumns: ['id'],
    searchKeys: ['name', 'id', 'comment'],
  },

  sqs: {
    title: 'SQS', fullTitle: 'Simple Queue Service — Queues',
    apiKey: 'sqs', color: 'bg-amber-600',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    columns: [
      { key: 'name', label: 'Queue Name' }, { key: 'type', label: 'Type' },
      { key: 'messages_available', label: 'Messages Available' },
      { key: 'messages_in_flight', label: 'Messages In-Flight' },
      { key: 'dlq', label: 'Dead Letter Queue' }, { key: 'retention', label: 'Retention Period' },
    ],
    mockData: SQS_QUEUES,
    badgeColumns: ['type'],
    searchKeys: ['name', 'type'],
  },

  sns: {
    title: 'SNS', fullTitle: 'Simple Notification Service — Topics',
    apiKey: 'sns', color: 'bg-rose-600',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    columns: [
      { key: 'name', label: 'Topic Name' }, { key: 'type', label: 'Type' },
      { key: 'subscriptions', label: 'Subscriptions' }, { key: 'protocol', label: 'Protocols' },
    ],
    mockData: SNS_TOPICS,
    badgeColumns: ['type'],
    searchKeys: ['name', 'type', 'protocol'],
  },

  'auto-scaling': {
    title: 'Auto Scaling', fullTitle: 'EC2 Auto Scaling Groups',
    apiKey: 'autoscaling', color: 'bg-lime-600',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    columns: [
      { key: 'name', label: 'Group Name' }, { key: 'status', label: 'Status' },
      { key: 'min', label: 'Min' }, { key: 'desired', label: 'Desired' },
      { key: 'max', label: 'Max' }, { key: 'instances', label: 'Instances' },
      { key: 'health_check', label: 'Health Check' }, { key: 'launch_config', label: 'Launch Template' },
    ],
    mockData: AUTO_SCALING_GROUPS,
    badgeColumns: ['status', 'health_check'],
    searchKeys: ['name', 'status'],
  },
}

export default function GenericService({ serviceKey: propKey }) {
  const { service } = useParams()
  const key = propKey || service
  const cfg = SERVICE_CONFIG[key]

  const { data, loading, error } = useServiceData(
    cfg?.apiKey || key,
    cfg?.mockData || []
  )

  if (!cfg) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <p className="text-lg font-semibold">Service not found: {key}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${cfg.color} flex items-center justify-center text-white`}>
          {cfg.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cfg.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{cfg.fullTitle}</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          Could not load live data — showing cached mock data. ({error})
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : (
        <ServiceTable
          title={cfg.fullTitle || cfg.title}
          subtitle={`${Array.isArray(data) ? data.length : 0} resources — us-east-1`}
          columns={cfg.columns}
          data={data}
          badgeColumns={cfg.badgeColumns || []}
          codeColumns={cfg.codeColumns || []}
          searchKeys={cfg.searchKeys || []}
        />
      )}
    </div>
  )
}
