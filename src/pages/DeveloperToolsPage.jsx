import { useState } from 'react'
import ServiceTable from '../components/ui/ServiceTable'
import {
  CODEPIPELINES, CODEBUILD_PROJECTS, CODEDEPLOY_APPS,
  CODECOMMIT_REPOS, CODESTAR_CONNECTIONS,
} from '../data/servicesData'

const TABS = [
  { key: 'pipeline',    label: 'CodePipeline',    count: CODEPIPELINES.length },
  { key: 'build',       label: 'CodeBuild',        count: CODEBUILD_PROJECTS.length },
  { key: 'deploy',      label: 'CodeDeploy',       count: CODEDEPLOY_APPS.length },
  { key: 'commit',      label: 'CodeCommit',       count: CODECOMMIT_REPOS.length },
  { key: 'connections', label: 'Connections',      count: CODESTAR_CONNECTIONS.length },
]

const PIPELINE_COLS = [
  { key: 'name',           label: 'Pipeline Name' },
  { key: 'status',         label: 'Status' },
  { key: 'source',         label: 'Source' },
  { key: 'stages',         label: 'Stages' },
  { key: 'last_execution', label: 'Last Execution' },
  { key: 'created',        label: 'Created' },
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
  { key: 'created',         label: 'Created' },
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
  { key: 'created',  label: 'Created' },
]

function PipelineIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  )
}

export default function DeveloperToolsPage() {
  const [activeTab, setActiveTab] = useState('pipeline')

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Pipelines',    value: CODEPIPELINES.length,       ok: CODEPIPELINES.filter(p => p.status === 'Succeeded').length },
          { label: 'Build Projects',value: CODEBUILD_PROJECTS.length, ok: CODEBUILD_PROJECTS.filter(p => p.status === 'Succeeded').length },
          { label: 'Deploy Apps',  value: CODEDEPLOY_APPS.length,     ok: CODEDEPLOY_APPS.filter(p => p.last_deployment?.startsWith('Succeeded')).length },
          { label: 'Repositories', value: CODECOMMIT_REPOS.length,    ok: CODECOMMIT_REPOS.length },
          { label: 'Connections',  value: CODESTAR_CONNECTIONS.length, ok: CODESTAR_CONNECTIONS.filter(c => c.status === 'Available').length },
        ].map(({ label, value, ok }) => (
          <div key={label} className="aws-card px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{ok} healthy</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
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
                activeTab === tab.key
                  ? 'bg-aws-orange text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'pipeline' && (
          <ServiceTable
            title="CodePipeline"
            subtitle="Continuous delivery pipelines"
            columns={PIPELINE_COLS}
            data={CODEPIPELINES}
            badgeColumns={['status']}
            searchKeys={['name', 'source']}
          />
        )}
        {activeTab === 'build' && (
          <ServiceTable
            title="CodeBuild"
            subtitle="Build projects"
            columns={BUILD_COLS}
            data={CODEBUILD_PROJECTS}
            badgeColumns={['status']}
            searchKeys={['name', 'source']}
          />
        )}
        {activeTab === 'deploy' && (
          <ServiceTable
            title="CodeDeploy"
            subtitle="Deployment applications"
            columns={DEPLOY_COLS}
            data={CODEDEPLOY_APPS}
            badgeColumns={['platform']}
            searchKeys={['name']}
          />
        )}
        {activeTab === 'commit' && (
          <ServiceTable
            title="CodeCommit"
            subtitle="Source control repositories"
            columns={COMMIT_COLS}
            data={CODECOMMIT_REPOS}
            codeColumns={['default_branch']}
            searchKeys={['name']}
          />
        )}
        {activeTab === 'connections' && (
          <ServiceTable
            title="Connections"
            subtitle="Third-party source control connections"
            columns={CONNECTION_COLS}
            data={CODESTAR_CONNECTIONS}
            badgeColumns={['status', 'provider']}
            codeColumns={['arn']}
            searchKeys={['name', 'provider', 'owner']}
          />
        )}
      </div>
    </div>
  )
}
