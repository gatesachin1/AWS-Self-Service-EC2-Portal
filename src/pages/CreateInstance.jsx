import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'
import {
  AMI_OPTIONS,
  INSTANCE_TYPES,
  KEY_PAIRS,
  VPC_OPTIONS,
  SUBNET_OPTIONS,
  SECURITY_GROUPS,
  IAM_ROLES,
  ENVIRONMENTS,
} from '../data/mockData'

const STORAGE_TYPES = [
  { value: 'gp3', label: 'gp3 — General Purpose SSD (recommended)' },
  { value: 'gp2', label: 'gp2 — General Purpose SSD (previous gen)' },
]

export default function CreateInstance() {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      instanceName: '',
      ami: '',
      instanceType: '',
      keyPair: '',
      vpc: '',
      subnet: '',
      securityGroup: '',
      iamRole: '',
      rootVolumeSize: 20,
      storageType: 'gp3',
      enablePublicIp: true,
      envTag: '',
      ownerTag: '',
      projectTag: '',
    },
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    // Simulate async API call
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)

    toast.success(
      `Instance "${data.instanceName}" created successfully!\nInstance ID: i-${Math.random().toString(16).slice(2, 14)}`,
      {
        duration: 5000,
        style: { background: '#166534', color: '#dcfce7', border: '1px solid #166534' },
        iconTheme: { primary: '#4ade80', secondary: '#166534' },
      }
    )
    reset()
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Launch EC2 Instance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Configure and provision a new EC2 instance in us-east-1.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">

          {/* ── Section 1: Basic Configuration ── */}
          <Section title="Basic Configuration" icon={<ConfigIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Instance Name" required error={errors.instanceName?.message}>
                <input
                  {...register('instanceName', {
                    required: 'Instance name is required',
                    pattern: { value: /^[a-zA-Z0-9_\-]+$/, message: 'Only letters, numbers, hyphens and underscores' },
                  })}
                  placeholder="e.g. web-server-prod-01"
                  className={`aws-input ${errors.instanceName ? 'ring-2 ring-red-500 border-red-400' : ''}`}
                />
              </Field>

              <Field label="Amazon Machine Image (AMI)" required error={errors.ami?.message}>
                <select {...register('ami', { required: 'AMI is required' })} className={`aws-input ${errors.ami ? 'ring-2 ring-red-500 border-red-400' : ''}`}>
                  <option value="">Select AMI…</option>
                  {AMI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Instance Type" required error={errors.instanceType?.message}>
                <select {...register('instanceType', { required: 'Instance type is required' })} className={`aws-input font-mono ${errors.instanceType ? 'ring-2 ring-red-500 border-red-400' : ''}`}>
                  <option value="">Select instance type…</option>
                  {INSTANCE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Key Pair" required error={errors.keyPair?.message}>
                <select {...register('keyPair', { required: 'Key pair is required' })} className={`aws-input ${errors.keyPair ? 'ring-2 ring-red-500 border-red-400' : ''}`}>
                  <option value="">Select key pair…</option>
                  {KEY_PAIRS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* ── Section 2: Network ── */}
          <Section title="Network Configuration" icon={<NetworkIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="VPC" required error={errors.vpc?.message}>
                <select {...register('vpc', { required: 'VPC is required' })} className={`aws-input ${errors.vpc ? 'ring-2 ring-red-500 border-red-400' : ''}`}>
                  <option value="">Select VPC…</option>
                  {VPC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Subnet" required error={errors.subnet?.message}>
                <select {...register('subnet', { required: 'Subnet is required' })} className={`aws-input ${errors.subnet ? 'ring-2 ring-red-500 border-red-400' : ''}`}>
                  <option value="">Select subnet…</option>
                  {SUBNET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="Security Group" required error={errors.securityGroup?.message}>
                <select {...register('securityGroup', { required: 'Security group is required' })} className={`aws-input ${errors.securityGroup ? 'ring-2 ring-red-500 border-red-400' : ''}`}>
                  <option value="">Select security group…</option>
                  {SECURITY_GROUPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <Field label="IAM Role" error={errors.iamRole?.message}>
                <select {...register('iamRole')} className="aws-input">
                  <option value="">None (no IAM role)</option>
                  {IAM_ROLES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <div className="md:col-span-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('enablePublicIp')}
                    className="mt-0.5 w-4 h-4 rounded accent-aws-orange cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Public IP Address</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Assign a public IPv4 address to the instance on launch.</p>
                  </div>
                </label>
              </div>
            </div>
          </Section>

          {/* ── Section 3: Storage ── */}
          <Section title="Storage" icon={<StorageIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Root Volume Size (GiB)" required error={errors.rootVolumeSize?.message}>
                <input
                  type="number"
                  {...register('rootVolumeSize', {
                    required: 'Volume size is required',
                    min: { value: 8, message: 'Minimum 8 GiB' },
                    max: { value: 16384, message: 'Maximum 16384 GiB' },
                  })}
                  placeholder="20"
                  className={`aws-input ${errors.rootVolumeSize ? 'ring-2 ring-red-500 border-red-400' : ''}`}
                />
              </Field>

              <Field label="Volume Type" required error={errors.storageType?.message}>
                <select {...register('storageType', { required: 'Storage type is required' })} className="aws-input">
                  {STORAGE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* ── Section 4: Tags ── */}
          <Section title="Tags" icon={<TagIcon />}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Tags help you categorise and manage your AWS resources.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Environment" required error={errors.envTag?.message}>
                <select {...register('envTag', { required: 'Environment tag is required' })} className={`aws-input ${errors.envTag ? 'ring-2 ring-red-500 border-red-400' : ''}`}>
                  <option value="">Select environment…</option>
                  {ENVIRONMENTS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>

              <Field label="Owner" required error={errors.ownerTag?.message}>
                <input
                  {...register('ownerTag', { required: 'Owner tag is required' })}
                  placeholder="e.g. team-platform"
                  className={`aws-input ${errors.ownerTag ? 'ring-2 ring-red-500 border-red-400' : ''}`}
                />
              </Field>

              <Field label="Project" required error={errors.projectTag?.message}>
                <input
                  {...register('projectTag', { required: 'Project tag is required' })}
                  placeholder="e.g. ecommerce-v2"
                  className={`aws-input ${errors.projectTag ? 'ring-2 ring-red-500 border-red-400' : ''}`}
                />
              </Field>
            </div>
          </Section>

          {/* ── Actions ── */}
          <div className="aws-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All required fields (<span className="text-red-500">*</span>) must be filled before launching.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="aws-btn-secondary"
                disabled={submitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="aws-btn-primary min-w-[160px] justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" label="" />
                    Launching…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Launch Instance
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="aws-card">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200 dark:border-aws-navy-border">
        <span className="text-aws-orange">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="aws-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

function ConfigIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function NetworkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
  )
}
function StorageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}
