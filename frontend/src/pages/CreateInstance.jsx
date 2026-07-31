import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useResources } from '../hooks/useResources'
import { createInstance } from '../api/ec2'

// ── AMI definitions (static — fetched IDs come from user's account) ───────
const AMI_LIST = [
  { id: 'al2023',   label: 'Amazon Linux 2023',     value: '' },
  { id: 'ubuntu24', label: 'Ubuntu Server 24.04 LTS', value: '' },
  { id: 'win2025',  label: 'Windows Server 2025',    value: '' },
  { id: 'rhel9',    label: 'Red Hat Enterprise Linux 9', value: '' },
]

const INSTANCE_TYPES = [
  't3.micro', 't3.small', 't3.medium', 't3.large',
  't3.xlarge', 'm5.large', 'm5.xlarge', 'm5.2xlarge',
  'c5.large', 'c5.xlarge', 'r5.large', 'r5.xlarge',
]

// ── Sub-components ────────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div className="aws-card">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-200 dark:border-aws-border">
        <span className="text-aws-orange">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="aws-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      {error && (
        <p className="field-error">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`aws-input appearance-none pr-8 ${props.className || ''}`}>
        {children}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function CreateInstance() {
  const navigate = useNavigate()
  const { resources, loading: resLoading, error: resError } = useResources()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      instance_name:            '',
      ami_id:                   '',
      instance_type:            '',
      key_pair:                 '',
      vpc_id:                   '',
      subnet_id:                '',
      security_group_id:        '',
      iam_instance_profile:     '',
      root_volume_size:         20,
      root_volume_type:         'gp3',
      enable_public_ip:         false,
      availability_zone:        '',
      enable_detailed_monitoring: false,
      tags_env:                 '',
      tags_owner:               '',
      tags_project:             '',
    },
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    const payload = {
      instance_name:              data.instance_name.trim(),
      ami_id:                     data.ami_id,
      instance_type:              data.instance_type,
      key_pair:                   data.key_pair || undefined,
      subnet_id:                  data.subnet_id,
      security_group_id:          data.security_group_id,
      iam_instance_profile:       data.iam_instance_profile || undefined,
      root_volume_size:           Number(data.root_volume_size),
      root_volume_type:           data.root_volume_type,
      enable_public_ip:           Boolean(data.enable_public_ip),
      availability_zone:          data.availability_zone || undefined,
      enable_detailed_monitoring: Boolean(data.enable_detailed_monitoring),
      tags: {
        Environment: data.tags_env,
        Owner:       data.tags_owner,
        Project:     data.tags_project,
      },
    }

    try {
      const result = await createInstance(payload)
      toast.success(result.message || 'Instance launched successfully!', { duration: 6000 })
      reset()
      setTimeout(() => navigate('/manage-instances'), 1500)
    } catch (err) {
      toast.error(err.message, { duration: 6000 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Launch EC2 Instance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Configure and provision a new EC2 instance in us-east-1.
        </p>
      </div>

      {resError && <ErrorBanner message={`Failed to load AWS resources: ${resError}. Check your API Gateway URL and Lambda permissions.`} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">

          {/* ── Basic Configuration ── */}
          <Section title="Basic Configuration" icon={<ConfigIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Field label="Instance Name" required error={errors.instance_name?.message}>
                <input
                  {...register('instance_name', {
                    required: 'Instance name is required',
                    pattern: {
                      value: /^[a-zA-Z0-9][a-zA-Z0-9\-_.]{0,254}$/,
                      message: 'Only letters, numbers, hyphens, dots, underscores (no leading dash)',
                    },
                  })}
                  placeholder="e.g. web-server-prod-01"
                  className={`aws-input ${errors.instance_name ? 'error' : ''}`}
                />
              </Field>

              <Field label="AMI ID" required error={errors.ami_id?.message} hint="Enter the full AMI ID from your AWS account">
                <input
                  {...register('ami_id', {
                    required: 'AMI ID is required',
                    pattern: { value: /^ami-[0-9a-f]{8,17}$/, message: 'Must be a valid AMI ID (ami-xxxxxxxxxxxxxxxx)' },
                  })}
                  placeholder="ami-0abcdef1234567890"
                  className={`aws-input font-mono ${errors.ami_id ? 'error' : ''}`}
                />
              </Field>

              <Field label="Instance Type" required error={errors.instance_type?.message}>
                <Select {...register('instance_type', { required: 'Instance type is required' })} className={errors.instance_type ? 'error' : ''}>
                  <option value="">Select instance type…</option>
                  {INSTANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>

              <Field label="Key Pair">
                <Select {...register('key_pair')}>
                  <option value="">No key pair (use SSM)</option>
                  {resLoading ? (
                    <option disabled>Loading…</option>
                  ) : (
                    resources.key_pairs.map((kp) => (
                      <option key={kp.name} value={kp.name}>{kp.name} ({kp.type})</option>
                    ))
                  )}
                </Select>
              </Field>

            </div>
          </Section>

          {/* ── Network Configuration ── */}
          <Section title="Network Configuration" icon={<NetworkIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Field label="Subnet" required error={errors.subnet_id?.message}>
                <Select {...register('subnet_id', { required: 'Subnet is required' })} className={errors.subnet_id ? 'error' : ''}>
                  <option value="">Select subnet…</option>
                  {resLoading ? (
                    <option disabled>Loading…</option>
                  ) : (
                    resources.subnets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} | {s.az} | {s.cidr} {s.name !== s.id ? `(${s.name})` : ''}
                      </option>
                    ))
                  )}
                </Select>
              </Field>

              <Field label="Security Group" required error={errors.security_group_id?.message}>
                <Select {...register('security_group_id', { required: 'Security group is required' })} className={errors.security_group_id ? 'error' : ''}>
                  <option value="">Select security group…</option>
                  {resLoading ? (
                    <option disabled>Loading…</option>
                  ) : (
                    resources.security_groups.map((sg) => (
                      <option key={sg.id} value={sg.id}>{sg.id} | {sg.name}</option>
                    ))
                  )}
                </Select>
              </Field>

              <Field label="IAM Instance Profile">
                <Select {...register('iam_instance_profile')}>
                  <option value="">None</option>
                  {resLoading ? (
                    <option disabled>Loading…</option>
                  ) : (
                    resources.iam_instance_profiles.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))
                  )}
                </Select>
              </Field>

              <Field label="Availability Zone">
                <Select {...register('availability_zone')}>
                  <option value="">AWS auto-select</option>
                  {resources.availability_zones.map((az) => (
                    <option key={az} value={az}>{az}</option>
                  ))}
                </Select>
              </Field>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" {...register('enable_public_ip')} className="mt-0.5 accent-aws-orange w-4 h-4" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Public IP</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Assign a public IPv4 address on launch.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" {...register('enable_detailed_monitoring')} className="mt-0.5 accent-aws-orange w-4 h-4" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Detailed Monitoring</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">1-minute CloudWatch metric intervals (additional charges apply).</p>
                  </div>
                </label>
              </div>
            </div>
          </Section>

          {/* ── Storage ── */}
          <Section title="Storage" icon={<StorageIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Root Volume Size (GiB)" required error={errors.root_volume_size?.message}>
                <input
                  type="number"
                  {...register('root_volume_size', {
                    required: 'Volume size is required',
                    min: { value: 8,     message: 'Minimum 8 GiB' },
                    max: { value: 16384, message: 'Maximum 16384 GiB' },
                  })}
                  className={`aws-input ${errors.root_volume_size ? 'error' : ''}`}
                />
              </Field>
              <Field label="Volume Type" required>
                <Select {...register('root_volume_type')}>
                  <option value="gp3">gp3 — General Purpose SSD (recommended)</option>
                  <option value="gp2">gp2 — General Purpose SSD (previous gen)</option>
                  <option value="io1">io1 — Provisioned IOPS SSD</option>
                  <option value="io2">io2 — Provisioned IOPS SSD (durable)</option>
                </Select>
              </Field>
            </div>
          </Section>

          {/* ── Tags ── */}
          <Section title="Tags" icon={<TagIcon />}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Tags are applied to the instance and root volume.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Environment" required error={errors.tags_env?.message}>
                <Select {...register('tags_env', { required: 'Environment tag is required' })} className={errors.tags_env ? 'error' : ''}>
                  <option value="">Select…</option>
                  {['dev', 'staging', 'production', 'shared', 'sandbox'].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Owner" required error={errors.tags_owner?.message}>
                <input
                  {...register('tags_owner', { required: 'Owner tag is required' })}
                  placeholder="e.g. team-platform"
                  className={`aws-input ${errors.tags_owner ? 'error' : ''}`}
                />
              </Field>
              <Field label="Project" required error={errors.tags_project?.message}>
                <input
                  {...register('tags_project', { required: 'Project tag is required' })}
                  placeholder="e.g. ecommerce-v2"
                  className={`aws-input ${errors.tags_project ? 'error' : ''}`}
                />
              </Field>
            </div>
          </Section>

          {/* ── Actions ── */}
          <div className="aws-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Fields marked <span className="text-red-500">*</span> are required. Volumes are encrypted by default.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => reset()} className="btn-secondary" disabled={submitting}>
                Reset
              </button>
              <button type="submit" className="btn-primary min-w-[160px] justify-center" disabled={submitting}>
                {submitting ? (
                  <><Spinner size="sm" className="text-white" /> Launching…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Launch Instance</>
                )}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

function ConfigIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
}
function NetworkIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
}
function StorageIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
}
function TagIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>
}
