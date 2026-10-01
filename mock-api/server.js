// Local mock API server — simulates the Lambda backend for local development.
// Run: node mock-api/server.js
// Serves on http://localhost:4000

import http from 'http'
import {
  S3_BUCKETS, VPCS, SUBNETS, SECURITY_GROUPS, LOAD_BALANCERS, LAMBDA_FUNCTIONS,
  RDS_INSTANCES, DYNAMODB_TABLES, ECS_CLUSTERS, CLOUDFRONT_DISTRIBUTIONS,
  ROUTE53_ZONES, SQS_QUEUES, SNS_TOPICS, AUTO_SCALING_GROUPS,
  IAM_USERS, IAM_ROLES, CW_ALARMS, CW_DASHBOARDS, CLOUDTRAIL_EVENTS,
  CODEPIPELINES, CODEBUILD_PROJECTS, CODEDEPLOY_APPS, CODECOMMIT_REPOS, CODESTAR_CONNECTIONS,
  DOMAINS, SSL_CERTIFICATES, DNS_RECORDS,
} from '../frontend/src/data/servicesData.js'

const MOCK_SERVICES = {
  s3:          { items: S3_BUCKETS,                count: S3_BUCKETS.length },
  elb:         { items: LOAD_BALANCERS,             count: LOAD_BALANCERS.length },
  lambda:      { items: LAMBDA_FUNCTIONS,           count: LAMBDA_FUNCTIONS.length },
  rds:         { items: RDS_INSTANCES,              count: RDS_INSTANCES.length },
  dynamodb:    { items: DYNAMODB_TABLES,            count: DYNAMODB_TABLES.length },
  ecs:         { items: ECS_CLUSTERS,               count: ECS_CLUSTERS.length },
  cloudfront:  { items: CLOUDFRONT_DISTRIBUTIONS,  count: CLOUDFRONT_DISTRIBUTIONS.length },
  route53:     { items: ROUTE53_ZONES,              count: ROUTE53_ZONES.length },
  sqs:         { items: SQS_QUEUES,                 count: SQS_QUEUES.length },
  sns:         { items: SNS_TOPICS,                 count: SNS_TOPICS.length },
  autoscaling: { items: AUTO_SCALING_GROUPS,        count: AUTO_SCALING_GROUPS.length },
  vpc:         { vpcs: VPCS, subnets: SUBNETS, security_groups: SECURITY_GROUPS },
  iam:         { users: IAM_USERS, roles: IAM_ROLES },
  cloudwatch:  { alarms: CW_ALARMS, dashboards: CW_DASHBOARDS },
  cloudtrail:  { items: CLOUDTRAIL_EVENTS,         count: CLOUDTRAIL_EVENTS.length },
  domains:     { domains: DOMAINS, certificates: SSL_CERTIFICATES, dns_records: DNS_RECORDS },
  devtools:    {
    pipelines:    CODEPIPELINES,
    builds:       CODEBUILD_PROJECTS,
    deployments:  CODEDEPLOY_APPS,
    repositories: CODECOMMIT_REPOS,
    connections:  CODESTAR_CONNECTIONS,
  },
}

const PORT = 4000

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
}

// ── In-memory instance store ──────────────────────────────────────────────
let instances = [
  {
    instance_id: 'i-0a1b2c3d4e5f6a7b8',
    instance_name: 'web-server-prod-01',
    instance_type: 't3.medium',
    state: 'running',
    ami_id: 'ami-0abcdef1234567890',
    private_ip: '10.0.1.45',
    public_ip: '54.210.12.34',
    launch_time: '2024-11-15T08:23:11Z',
    availability_zone: 'us-east-1a',
    vpc_id: 'vpc-0a1b2c3d4e5f6a7b8',
    subnet_id: 'subnet-0a1b2c3d4e5f6a7b',
    key_name: 'prod-keypair-us-east-1',
    environment: 'production',
    owner: 'team-platform',
    project: 'ecommerce',
  },
  {
    instance_id: 'i-1b2c3d4e5f6a7b8c9',
    instance_name: 'api-server-prod-01',
    instance_type: 'm5.large',
    state: 'running',
    ami_id: 'ami-0b1e234f5678abcde',
    private_ip: '10.0.2.78',
    public_ip: '18.235.67.89',
    launch_time: '2024-11-10T14:05:33Z',
    availability_zone: 'us-east-1b',
    vpc_id: 'vpc-0a1b2c3d4e5f6a7b8',
    subnet_id: 'subnet-1b2c3d4e5f6a7b8c',
    key_name: 'prod-keypair-us-east-1',
    environment: 'production',
    owner: 'team-api',
    project: 'ecommerce',
  },
  {
    instance_id: 'i-2c3d4e5f6a7b8c9d0',
    instance_name: 'db-server-prod-01',
    instance_type: 'r5.large',
    state: 'stopped',
    ami_id: 'ami-0abcdef1234567890',
    private_ip: '10.0.11.12',
    public_ip: null,
    launch_time: '2024-10-28T09:11:47Z',
    availability_zone: 'us-east-1a',
    vpc_id: 'vpc-0a1b2c3d4e5f6a7b8',
    subnet_id: 'subnet-2c3d4e5f6a7b8c9d',
    key_name: 'prod-keypair-us-east-1',
    environment: 'production',
    owner: 'team-data',
    project: 'ecommerce',
  },
  {
    instance_id: 'i-3d4e5f6a7b8c9d0e1',
    instance_name: 'web-server-staging-01',
    instance_type: 't3.small',
    state: 'running',
    ami_id: 'ami-0b1e234f5678abcde',
    private_ip: '10.1.1.23',
    public_ip: '34.230.45.67',
    launch_time: '2024-11-20T11:44:22Z',
    availability_zone: 'us-east-1c',
    vpc_id: 'vpc-1b2c3d4e5f6a7b8c9',
    subnet_id: 'subnet-0a1b2c3d4e5f6a7b',
    key_name: 'staging-keypair',
    environment: 'staging',
    owner: 'team-platform',
    project: 'ecommerce',
  },
  {
    instance_id: 'i-4e5f6a7b8c9d0e1f2',
    instance_name: 'bastion-host-01',
    instance_type: 't3.micro',
    state: 'running',
    ami_id: 'ami-0abcdef1234567890',
    private_ip: '10.0.1.10',
    public_ip: '52.91.234.56',
    launch_time: '2024-09-05T07:00:00Z',
    availability_zone: 'us-east-1a',
    vpc_id: 'vpc-0a1b2c3d4e5f6a7b8',
    subnet_id: 'subnet-0a1b2c3d4e5f6a7b',
    key_name: 'bastion-keypair',
    environment: 'shared',
    owner: 'team-infra',
    project: 'infrastructure',
  },
  {
    instance_id: 'i-5f6a7b8c9d0e1f2a3',
    instance_name: 'dev-workstation-01',
    instance_type: 't3.large',
    state: 'stopped',
    ami_id: 'ami-0c1d2345e6789abcd',
    private_ip: '10.2.1.55',
    public_ip: null,
    launch_time: '2024-11-18T15:30:00Z',
    availability_zone: 'us-east-1b',
    vpc_id: 'vpc-2c3d4e5f6a7b8c9d0',
    subnet_id: 'subnet-3d4e5f6a7b8c9d0e',
    key_name: 'dev-keypair-us-east-1',
    environment: 'dev',
    owner: 'sachin.gate',
    project: 'internal-tools',
  },
  {
    instance_id: 'i-6a7b8c9d0e1f2a3b4',
    instance_name: 'ci-runner-dev-01',
    instance_type: 't3.medium',
    state: 'terminated',
    ami_id: 'ami-0b1e234f5678abcde',
    private_ip: null,
    public_ip: null,
    launch_time: '2024-11-01T09:00:00Z',
    availability_zone: 'us-east-1a',
    vpc_id: 'vpc-2c3d4e5f6a7b8c9d0',
    subnet_id: null,
    key_name: 'dev-keypair-us-east-1',
    environment: 'dev',
    owner: 'team-ci',
    project: 'ci-cd',
  },
  {
    instance_id: 'i-7b8c9d0e1f2a3b4c5',
    instance_name: 'analytics-server-01',
    instance_type: 'c5.xlarge',
    state: 'running',
    ami_id: 'ami-0d2e3456f789abcde',
    private_ip: '10.0.12.88',
    public_ip: null,
    launch_time: '2024-11-12T13:20:00Z',
    availability_zone: 'us-east-1c',
    vpc_id: 'vpc-0a1b2c3d4e5f6a7b8',
    subnet_id: 'subnet-4e5f6a7b8c9d0e1f',
    key_name: 'prod-keypair-us-east-1',
    environment: 'production',
    owner: 'team-data',
    project: 'analytics',
  },
]

const RESOURCES = {
  vpcs: [
    { id: 'vpc-0a1b2c3d4e5f6a7b8', cidr: '10.0.0.0/16',   name: 'prod-vpc',           is_default: false },
    { id: 'vpc-1b2c3d4e5f6a7b8c9', cidr: '10.1.0.0/16',   name: 'staging-vpc',        is_default: false },
    { id: 'vpc-2c3d4e5f6a7b8c9d0', cidr: '10.2.0.0/16',   name: 'dev-vpc',            is_default: false },
    { id: 'vpc-3d4e5f6a7b8c9d0e1', cidr: '172.16.0.0/16', name: 'shared-services-vpc', is_default: false },
  ],
  subnets: [
    { id: 'subnet-0a1b2c3d4e5f6a7b', vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', cidr: '10.0.1.0/24',  az: 'us-east-1a', name: 'prod-public-1a',  available_ips: 248, auto_public_ip: true  },
    { id: 'subnet-1b2c3d4e5f6a7b8c', vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', cidr: '10.0.2.0/24',  az: 'us-east-1b', name: 'prod-public-1b',  available_ips: 250, auto_public_ip: true  },
    { id: 'subnet-2c3d4e5f6a7b8c9d', vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', cidr: '10.0.11.0/24', az: 'us-east-1a', name: 'prod-private-1a', available_ips: 245, auto_public_ip: false },
    { id: 'subnet-3d4e5f6a7b8c9d0e', vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', cidr: '10.0.12.0/24', az: 'us-east-1b', name: 'prod-private-1b', available_ips: 251, auto_public_ip: false },
    { id: 'subnet-4e5f6a7b8c9d0e1f', vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', cidr: '10.0.13.0/24', az: 'us-east-1c', name: 'prod-private-1c', available_ips: 253, auto_public_ip: false },
  ],
  security_groups: [
    { id: 'sg-0a1b2c3d4e5f6a7b8', name: 'default',      vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', description: 'Default VPC security group'    },
    { id: 'sg-1b2c3d4e5f6a7b8c9', name: 'web-tier-sg',  vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', description: 'Allow 80/443 inbound'           },
    { id: 'sg-2c3d4e5f6a7b8c9d0', name: 'app-tier-sg',  vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', description: 'App tier — allow 8080 from ALB' },
    { id: 'sg-3d4e5f6a7b8c9d0e1', name: 'db-tier-sg',   vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', description: 'DB tier — allow 5432 from app'  },
    { id: 'sg-4e5f6a7b8c9d0e1f2', name: 'bastion-sg',   vpc_id: 'vpc-0a1b2c3d4e5f6a7b8', description: 'Bastion — allow 22 from VPN'    },
  ],
  key_pairs: [
    { name: 'dev-keypair-us-east-1',  type: 'rsa' },
    { name: 'prod-keypair-us-east-1', type: 'rsa' },
    { name: 'staging-keypair',        type: 'ed25519' },
    { name: 'bastion-keypair',        type: 'rsa' },
  ],
  iam_instance_profiles: [
    { name: 'EC2-SSM-Role',         arn: 'arn:aws:iam::123456789012:instance-profile/EC2-SSM-Role'         },
    { name: 'EC2-S3-ReadOnly',      arn: 'arn:aws:iam::123456789012:instance-profile/EC2-S3-ReadOnly'      },
    { name: 'EC2-CloudWatch-Agent', arn: 'arn:aws:iam::123456789012:instance-profile/EC2-CloudWatch-Agent' },
    { name: 'EC2-Full-Access',      arn: 'arn:aws:iam::123456789012:instance-profile/EC2-Full-Access'      },
  ],
  availability_zones: ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d'],
}

// ── Helpers ───────────────────────────────────────────────────────────────
function send(res, status, data) {
  res.writeHead(status, CORS_HEADERS)
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')) }
      catch { resolve({}) }
    })
  })
}

function findInstance(id) {
  return instances.find((i) => i.instance_id === id)
}

function randomId() {
  return 'i-' + Array.from({ length: 17 }, () =>
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('')
}

// ── Route handlers ────────────────────────────────────────────────────────
function handleGetInstances(req, res) {
  send(res, 200, { instances, count: instances.length })
}

async function handleCreateInstance(req, res) {
  const body = await readBody(req)

  const errors = []
  if (!body.instance_name) errors.push('instance_name is required')
  if (!body.ami_id)         errors.push('ami_id is required')
  if (!body.instance_type)  errors.push('instance_type is required')
  if (!body.subnet_id)      errors.push('subnet_id is required')
  if (!body.security_group_id) errors.push('security_group_id is required')
  if (!body.tags?.Environment) errors.push('tags.Environment is required')
  if (!body.tags?.Owner)       errors.push('tags.Owner is required')
  if (!body.tags?.Project)     errors.push('tags.Project is required')

  if (errors.length) {
    return send(res, 400, { error: 'Validation failed', errors })
  }

  const now = new Date().toISOString()
  const newInstance = {
    instance_id:       randomId(),
    instance_name:     body.instance_name,
    instance_type:     body.instance_type,
    state:             'pending',
    ami_id:            body.ami_id,
    private_ip:        `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
    public_ip:         body.enable_public_ip ? `54.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}` : null,
    launch_time:       now,
    availability_zone: body.availability_zone || 'us-east-1a',
    vpc_id:            body.vpc_id || 'vpc-0a1b2c3d4e5f6a7b8',
    subnet_id:         body.subnet_id,
    key_name:          body.key_pair || null,
    environment:       body.tags.Environment,
    owner:             body.tags.Owner,
    project:           body.tags.Project,
  }

  instances.push(newInstance)

  // Transition to running after a moment
  setTimeout(() => {
    const inst = findInstance(newInstance.instance_id)
    if (inst) inst.state = 'running'
  }, 3000)

  return send(res, 201, {
    message: `Instance ${newInstance.instance_id} launched successfully`,
    instance: newInstance,
  })
}

async function handleStartInstance(req, res) {
  const { instance_id } = await readBody(req)
  if (!instance_id) return send(res, 400, { error: 'instance_id is required' })

  const inst = findInstance(instance_id)
  if (!inst) return send(res, 404, { error: `Instance ${instance_id} not found` })
  if (inst.state === 'terminated') return send(res, 400, { error: 'Cannot start a terminated instance' })

  inst.state = 'running'
  return send(res, 200, { message: `Instance ${instance_id} is running`, state: 'running' })
}

async function handleStopInstance(req, res) {
  const { instance_id } = await readBody(req)
  if (!instance_id) return send(res, 400, { error: 'instance_id is required' })

  const inst = findInstance(instance_id)
  if (!inst) return send(res, 404, { error: `Instance ${instance_id} not found` })

  inst.state = 'stopped'
  return send(res, 200, { message: `Instance ${instance_id} is stopping`, state: 'stopping' })
}

async function handleRebootInstance(req, res) {
  const { instance_id } = await readBody(req)
  if (!instance_id) return send(res, 400, { error: 'instance_id is required' })

  const inst = findInstance(instance_id)
  if (!inst) return send(res, 404, { error: `Instance ${instance_id} not found` })

  return send(res, 200, { message: `Reboot initiated for ${instance_id}` })
}

function handleTerminateInstance(res, instanceId) {
  if (!instanceId) return send(res, 400, { error: 'instance_id is required' })

  const inst = findInstance(instanceId)
  if (!inst) return send(res, 404, { error: `Instance ${instanceId} not found` })

  inst.state = 'terminated'
  inst.private_ip = null
  inst.public_ip  = null

  return send(res, 200, { message: `Instance ${instanceId} is shutting-down`, state: 'shutting-down' })
}

function handleGetResources(res) {
  send(res, 200, RESOURCES)
}

// ── Main request dispatcher ───────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const method = req.method
  const rawPath = req.url.split('?')[0]

  console.log(`[mock-api] ${method} ${rawPath}`)

  if (method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS)
    return res.end()
  }

  // GET /instances
  if (method === 'GET' && rawPath === '/instances') return handleGetInstances(req, res)

  // POST /instances
  if (method === 'POST' && rawPath === '/instances') return handleCreateInstance(req, res)

  // POST /instances/start
  if (method === 'POST' && rawPath === '/instances/start') return handleStartInstance(req, res)

  // POST /instances/stop
  if (method === 'POST' && rawPath === '/instances/stop') return handleStopInstance(req, res)

  // POST /instances/reboot
  if (method === 'POST' && rawPath === '/instances/reboot') return handleRebootInstance(req, res)

  // DELETE /instances/{id}
  const deleteMatch = rawPath.match(/^\/instances\/([^/]+)$/)
  if (method === 'DELETE' && deleteMatch) return handleTerminateInstance(res, deleteMatch[1])

  // GET /resources
  if (method === 'GET' && rawPath === '/resources') return handleGetResources(res)

  // GET /services/{service}
  const serviceMatch = rawPath.match(/^\/services\/([^/]+)$/)
  if (method === 'GET' && serviceMatch) {
    const svcName = serviceMatch[1]
    const data = MOCK_SERVICES[svcName]
    if (data) return send(res, 200, data)
    return send(res, 404, { error: `Unknown service: ${svcName}` })
  }

  send(res, 404, { error: `No route for ${method} ${rawPath}` })
})

server.listen(PORT, () => {
  console.log(`\n  Mock API running at http://localhost:${PORT}`)
  console.log('  Routes:')
  console.log('    GET    /instances')
  console.log('    POST   /instances')
  console.log('    POST   /instances/start|stop|reboot')
  console.log('    DELETE /instances/{id}')
  console.log('    GET    /resources')
  console.log('    GET    /services/{s3|elb|lambda|rds|dynamodb|ecs|cloudfront|route53}')
  console.log('    GET    /services/{sqs|sns|autoscaling|vpc|iam|cloudwatch|cloudtrail|devtools}\n')
})
