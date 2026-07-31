import { useState } from 'react'
import ServiceTable from '../components/ui/ServiceTable'
import Spinner from '../components/ui/Spinner'
import { useServiceData } from '../hooks/useServiceData'
import {
  CODEPIPELINES, CODEBUILD_PROJECTS, CODEDEPLOY_APPS,
  CODECOMMIT_REPOS, CODESTAR_CONNECTIONS,
} from '../data/servicesData'

const PIPELINE_COLS = [
  { key: 'name',           label: 'Pipeline Name' },
  { key: 'status',         label: 'Status' },
  { key: 'source',         label: 'Source' },
  { key: 'stages',         label: 'Stages' },
  { key: 'last_execution', label: 'Last Execution' },
]

const BUILD_COLS = [
  { key: 'name',        label: 'Project Name' },
  { key: 'source',      label: 'Source' },
  { key: 'status',      label: 'Last Status' },
  { key: 'build_time',  label: 'Build Time' },
  { key: 'environment', label: 'Environment' },
  { key: 'last_build',  label: 'Last Build' },
]

const DEPLOY_COLS = [
  { key: 'name',            label: 'Application Name' },
  { key: 'platform',        label: 'Compute Platform' },
  { key: 'groups',          label: 'Deploy Groups' },
  { key: 'last_deployment', label: 'Last Deployment' },
]

const COMMIT_COLS = [
  { key: 'name',           label: 'Repository' },
  { key: 'default_branch', label: 'Default Branch' },
  { key: 'open_prs',       label: 'Open PRs' },
  { key: 'size',           label: 'Size' },
  { key: 'last_commit',    label: 'Last Commit' },
]

const CONNECTION_COLS = [
  { key: 'name',     label: 'Connection Name' },
  { key: 'provider', label: 'Provider' },
  { key: 'status',   label: 'Status' },
  { key: 'owner',    label: 'Owner' },
  { key: 'arn',      label: 'ARN' },
]

function PipelineIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  )
}

const MOCK = {
  pipelines:    CODEPIPELINES,
  builds:       CODEBUILD_PROJECTS,
  deployments:  CODEDEPLOY_APPS,
  repositories: CODECOMMIT_REPOS,
  connections:  CODESTAR_CONNECTIONS,
}

export default function DeveloperToolsPage() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const { data, loading, error } = useServiceData('devtools', MOCK)

  const pipelines    = data?.pipelines    || []
  const builds       = data?.builds       || []
  const deployments  = data?.deployments  || []
  const repositories = data?.repositories || []
  const connections  = data?.connections  || []

  const TABS = [
    { key: 'pipeline',    label: 'CodePipeline',  count: pipelines.length },
    { key: 'build',       label: 'CodeBuild',     count: builds.length },
    { key: 'deploy',      label: 'CodeDeploy',    count: deployments.length },
    { key: 'commit',      label: 'CodeCommit',    count: repositories.length },
    { key: 'connections', label: 'Connections',   count: connections.length },
  ]

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
            <PipelineIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Tools</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          CodePipeline · CodeBuild · CodeDeploy · CodeCommit · Connections — us-east-1
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          Could not load live data — showing cached mock data. ({error})
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Pipelines',      value: pipelines.length,    ok: pipelines.filter(p => p.status === 'Succeeded').length },
          { label: 'Build Projects', value: builds.length,       ok: builds.filter(p => p.status === 'Succeeded').length },
          { label: 'Deploy Apps',    value: deployments.length,  ok: deployments.filter(p => (p.last_deployment || '').startsWith('Succeeded')).length },
          { label: 'Repositories',   value: repositories.length, ok: repositories.length },
          { label: 'Connections',    value: connections.length,  ok: connections.filter(c => c.status === 'Available').length },
        ].map(({ label, value, ok }) => (
          <div key={label} className="aws-card px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{ok} healthy</p>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200 dark:border-aws-border">
        <nav className="flex gap-1 overflow-x-auto">
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

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : (
        <div>
          {activeTab === 'pipeline' && (
            <ServiceTable title="CodePipeline" subtitle="Continuous delivery pipelines"
              columns={PIPELINE_COLS} data={pipelines}
              badgeColumns={['status']}
              searchKeys={['name', 'source']} />
          )}
          {activeTab === 'build' && (
            <ServiceTable title="CodeBuild" subtitle="Build projects"
              columns={BUILD_COLS} data={builds}
              badgeColumns={['status']}
              searchKeys={['name', 'source']} />
          )}
          {activeTab === 'deploy' && (
            <ServiceTable title="CodeDeploy" subtitle="Deployment applications"
              columns={DEPLOY_COLS} data={deployments}
              badgeColumns={['platform']}
              searchKeys={['name']} />
          )}
          {activeTab === 'commit' && (
            <ServiceTable title="CodeCommit" subtitle="Source control repositories"
              columns={COMMIT_COLS} data={repositories}
              codeColumns={['default_branch']}
              searchKeys={['name']} />
          )}
          {activeTab === 'connections' && (
            <ServiceTable title="Connections" subtitle="Third-party source control connections"
              columns={CONNECTION_COLS} data={connections}
              badgeColumns={['status', 'provider']}
              codeColumns={['arn']}
              searchKeys={['name', 'provider', 'owner']} />
          )}
        </div>
      )}
    </div>
  )
}
