export const AMI_OPTIONS = [
  { value: 'ami-0abcdef1234567890', label: 'Amazon Linux 2023 AMI (ami-0abcdef1234567890)' },
  { value: 'ami-0b1e234f5678abcde', label: 'Ubuntu Server 22.04 LTS (ami-0b1e234f5678abcde)' },
  { value: 'ami-0c1d2345e6789abcd', label: 'Windows Server 2022 Base (ami-0c1d2345e6789abcd)' },
  { value: 'ami-0d2e3456f789abcde', label: 'Red Hat Enterprise Linux 9 (ami-0d2e3456f789abcde)' },
  { value: 'ami-0e3f4567a890bcdef', label: 'SUSE Linux Enterprise Server 15 (ami-0e3f4567a890bcdef)' },
  { value: 'ami-0f4a5678b901cdef0', label: 'Debian GNU/Linux 12 (ami-0f4a5678b901cdef0)' },
]

export const INSTANCE_TYPES = [
  { value: 't3.micro',   label: 't3.micro   — 2 vCPU | 1 GiB RAM' },
  { value: 't3.small',   label: 't3.small   — 2 vCPU | 2 GiB RAM' },
  { value: 't3.medium',  label: 't3.medium  — 2 vCPU | 4 GiB RAM' },
  { value: 't3.large',   label: 't3.large   — 2 vCPU | 8 GiB RAM' },
  { value: 'm5.large',   label: 'm5.large   — 2 vCPU | 8 GiB RAM' },
  { value: 'm5.xlarge',  label: 'm5.xlarge  — 4 vCPU | 16 GiB RAM' },
  { value: 'm5.2xlarge', label: 'm5.2xlarge — 8 vCPU | 32 GiB RAM' },
  { value: 'c5.large',   label: 'c5.large   — 2 vCPU | 4 GiB RAM' },
  { value: 'c5.xlarge',  label: 'c5.xlarge  — 4 vCPU | 8 GiB RAM' },
  { value: 'r5.large',   label: 'r5.large   — 2 vCPU | 16 GiB RAM' },
]

export const KEY_PAIRS = [
  { value: 'dev-keypair-us-east-1',  label: 'dev-keypair-us-east-1' },
  { value: 'prod-keypair-us-east-1', label: 'prod-keypair-us-east-1' },
  { value: 'staging-keypair',        label: 'staging-keypair' },
  { value: 'bastion-keypair',        label: 'bastion-keypair' },
]

export const VPC_OPTIONS = [
  { value: 'vpc-0a1b2c3d4e5f6a7b8', label: 'vpc-0a1b2c3d4e5f6a7b8 | 10.0.0.0/16 (Production)' },
  { value: 'vpc-1b2c3d4e5f6a7b8c9', label: 'vpc-1b2c3d4e5f6a7b8c9 | 10.1.0.0/16 (Staging)' },
  { value: 'vpc-2c3d4e5f6a7b8c9d0', label: 'vpc-2c3d4e5f6a7b8c9d0 | 10.2.0.0/16 (Development)' },
  { value: 'vpc-3d4e5f6a7b8c9d0e1', label: 'vpc-3d4e5f6a7b8c9d0e1 | 172.16.0.0/16 (Shared Services)' },
]

export const SUBNET_OPTIONS = [
  { value: 'subnet-0a1b2c3d4e5f6a7b', label: 'subnet-0a1b2c3d4e5f6a7b | us-east-1a | 10.0.1.0/24 (Public)' },
  { value: 'subnet-1b2c3d4e5f6a7b8c', label: 'subnet-1b2c3d4e5f6a7b8c | us-east-1b | 10.0.2.0/24 (Public)' },
  { value: 'subnet-2c3d4e5f6a7b8c9d', label: 'subnet-2c3d4e5f6a7b8c9d | us-east-1a | 10.0.11.0/24 (Private)' },
  { value: 'subnet-3d4e5f6a7b8c9d0e', label: 'subnet-3d4e5f6a7b8c9d0e | us-east-1b | 10.0.12.0/24 (Private)' },
  { value: 'subnet-4e5f6a7b8c9d0e1f', label: 'subnet-4e5f6a7b8c9d0e1f | us-east-1c | 10.0.13.0/24 (Private)' },
]

export const SECURITY_GROUPS = [
  { value: 'sg-0a1b2c3d4e5f6a7b8', label: 'sg-0a1b2c3d4e5f6a7b8 | default' },
  { value: 'sg-1b2c3d4e5f6a7b8c9', label: 'sg-1b2c3d4e5f6a7b8c9 | web-tier-sg' },
  { value: 'sg-2c3d4e5f6a7b8c9d0', label: 'sg-2c3d4e5f6a7b8c9d0 | app-tier-sg' },
  { value: 'sg-3d4e5f6a7b8c9d0e1', label: 'sg-3d4e5f6a7b8c9d0e1 | db-tier-sg' },
  { value: 'sg-4e5f6a7b8c9d0e1f2', label: 'sg-4e5f6a7b8c9d0e1f2 | bastion-sg' },
]

export const IAM_ROLES = [
  { value: 'EC2-SSM-Role',           label: 'EC2-SSM-Role' },
  { value: 'EC2-S3-ReadOnly',        label: 'EC2-S3-ReadOnly' },
  { value: 'EC2-CloudWatch-Agent',   label: 'EC2-CloudWatch-Agent' },
  { value: 'EC2-Full-Access',        label: 'EC2-Full-Access' },
  { value: 'EC2-DynamoDB-Access',    label: 'EC2-DynamoDB-Access' },
]

export const ENVIRONMENTS = ['dev', 'staging', 'production', 'shared', 'sandbox']

export const MOCK_INSTANCES = [
  {
    id: 'i-0a1b2c3d4e5f6a7b8',
    name: 'web-server-prod-01',
    state: 'running',
    ami: 'ami-0abcdef1234567890',
    amiName: 'Amazon Linux 2023',
    instanceType: 't3.medium',
    launchTime: '2024-11-15T08:23:11Z',
    availabilityZone: 'us-east-1a',
    environment: 'production',
    publicIp: '54.210.12.34',
    privateIp: '10.0.1.45',
  },
  {
    id: 'i-1b2c3d4e5f6a7b8c9',
    name: 'api-server-prod-01',
    state: 'running',
    ami: 'ami-0b1e234f5678abcde',
    amiName: 'Ubuntu Server 22.04',
    instanceType: 'm5.large',
    launchTime: '2024-11-10T14:05:33Z',
    availabilityZone: 'us-east-1b',
    environment: 'production',
    publicIp: '18.235.67.89',
    privateIp: '10.0.2.78',
  },
  {
    id: 'i-2c3d4e5f6a7b8c9d0',
    name: 'db-server-prod-01',
    state: 'stopped',
    ami: 'ami-0abcdef1234567890',
    amiName: 'Amazon Linux 2023',
    instanceType: 'r5.large',
    launchTime: '2024-10-28T09:11:47Z',
    availabilityZone: 'us-east-1a',
    environment: 'production',
    publicIp: null,
    privateIp: '10.0.11.12',
  },
  {
    id: 'i-3d4e5f6a7b8c9d0e1',
    name: 'web-server-staging-01',
    state: 'running',
    ami: 'ami-0b1e234f5678abcde',
    amiName: 'Ubuntu Server 22.04',
    instanceType: 't3.small',
    launchTime: '2024-11-20T11:44:22Z',
    availabilityZone: 'us-east-1c',
    environment: 'staging',
    publicIp: '34.230.45.67',
    privateIp: '10.1.1.23',
  },
  {
    id: 'i-4e5f6a7b8c9d0e1f2',
    name: 'bastion-host-01',
    state: 'running',
    ami: 'ami-0abcdef1234567890',
    amiName: 'Amazon Linux 2023',
    instanceType: 't3.micro',
    launchTime: '2024-09-05T07:00:00Z',
    availabilityZone: 'us-east-1a',
    environment: 'shared',
    publicIp: '52.91.234.56',
    privateIp: '10.0.1.10',
  },
  {
    id: 'i-5f6a7b8c9d0e1f2a3',
    name: 'dev-workstation-01',
    state: 'stopped',
    ami: 'ami-0c1d2345e6789abcd',
    amiName: 'Windows Server 2022',
    instanceType: 't3.large',
    launchTime: '2024-11-18T15:30:00Z',
    availabilityZone: 'us-east-1b',
    environment: 'dev',
    publicIp: null,
    privateIp: '10.2.1.55',
  },
  {
    id: 'i-6a7b8c9d0e1f2a3b4',
    name: 'ci-runner-dev-01',
    state: 'terminated',
    ami: 'ami-0b1e234f5678abcde',
    amiName: 'Ubuntu Server 22.04',
    instanceType: 't3.medium',
    launchTime: '2024-11-01T09:00:00Z',
    availabilityZone: 'us-east-1a',
    environment: 'dev',
    publicIp: null,
    privateIp: null,
  },
  {
    id: 'i-7b8c9d0e1f2a3b4c5',
    name: 'analytics-server-01',
    state: 'running',
    ami: 'ami-0d2e3456f789abcde',
    amiName: 'Red Hat Enterprise Linux 9',
    instanceType: 'c5.xlarge',
    launchTime: '2024-11-12T13:20:00Z',
    availabilityZone: 'us-east-1c',
    environment: 'production',
    publicIp: null,
    privateIp: '10.0.12.88',
  },
]
