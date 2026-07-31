// Mock data for every AWS service — used as fallback when VITE_API_URL is not set

// ── S3 ──────────────────────────────────────────────────────────────────────
export const S3_BUCKETS = [
  { name: 'prod-assets-bucket-us-east-1',  region: 'us-east-1', versioning: 'Enabled',   objects: 12483,  size: '234 GB',  public_access: 'Blocked', created: '2023-01-15' },
  { name: 'staging-data-archive',          region: 'us-east-1', versioning: 'Suspended',  objects: 3421,   size: '45 GB',   public_access: 'Blocked', created: '2023-03-22' },
  { name: 'dev-deployment-artifacts',      region: 'us-west-2', versioning: 'Enabled',   objects: 892,    size: '12 GB',   public_access: 'Blocked', created: '2023-02-10' },
  { name: 'cloudfront-logs-prod',          region: 'us-east-1', versioning: 'Disabled',  objects: 45230,  size: '2.1 TB',  public_access: 'Blocked', created: '2022-11-05' },
  { name: 'terraform-state-backend',       region: 'us-east-1', versioning: 'Enabled',   objects: 47,     size: '128 MB',  public_access: 'Blocked', created: '2022-08-14' },
  { name: 'data-lake-raw-ingestion',       region: 'eu-west-1', versioning: 'Enabled',   objects: 198432, size: '18.7 TB', public_access: 'Blocked', created: '2023-06-01' },
  { name: 'media-uploads-prod',            region: 'us-east-1', versioning: 'Enabled',   objects: 67820,  size: '1.4 TB',  public_access: 'Blocked', created: '2023-09-11' },
]

// ── VPC ──────────────────────────────────────────────────────────────────────
export const VPCS = [
  { id: 'vpc-0a1b2c3d4e5f6a7b8', name: 'prod-vpc',            cidr: '10.0.0.0/16',   state: 'available', subnets: 6, dns_hostnames: 'Enabled',  is_default: false, tenancy: 'Default' },
  { id: 'vpc-1b2c3d4e5f6a7b8c9', name: 'staging-vpc',         cidr: '10.1.0.0/16',   state: 'available', subnets: 4, dns_hostnames: 'Enabled',  is_default: false, tenancy: 'Default' },
  { id: 'vpc-2c3d4e5f6a7b8c9d0', name: 'dev-vpc',             cidr: '10.2.0.0/16',   state: 'available', subnets: 3, dns_hostnames: 'Enabled',  is_default: false, tenancy: 'Default' },
  { id: 'vpc-3d4e5f6a7b8c9d0e1', name: 'shared-services-vpc', cidr: '172.16.0.0/16', state: 'available', subnets: 2, dns_hostnames: 'Disabled', is_default: false, tenancy: 'Default' },
]

export const SUBNETS = [
  { id: 'subnet-0a1b2c3d4e5f6a7b', name: 'prod-public-1a',  vpc: 'prod-vpc',    cidr: '10.0.1.0/24',  az: 'us-east-1a', type: 'Public',  available_ips: 248, route_table: 'rtb-0a1b2c3d' },
  { id: 'subnet-1b2c3d4e5f6a7b8c', name: 'prod-public-1b',  vpc: 'prod-vpc',    cidr: '10.0.2.0/24',  az: 'us-east-1b', type: 'Public',  available_ips: 250, route_table: 'rtb-0a1b2c3d' },
  { id: 'subnet-2c3d4e5f6a7b8c9d', name: 'prod-private-1a', vpc: 'prod-vpc',    cidr: '10.0.11.0/24', az: 'us-east-1a', type: 'Private', available_ips: 245, route_table: 'rtb-1b2c3d4e' },
  { id: 'subnet-3d4e5f6a7b8c9d0e', name: 'prod-private-1b', vpc: 'prod-vpc',    cidr: '10.0.12.0/24', az: 'us-east-1b', type: 'Private', available_ips: 251, route_table: 'rtb-1b2c3d4e' },
  { id: 'subnet-4e5f6a7b8c9d0e1f', name: 'prod-private-1c', vpc: 'prod-vpc',    cidr: '10.0.13.0/24', az: 'us-east-1c', type: 'Private', available_ips: 253, route_table: 'rtb-1b2c3d4e' },
  { id: 'subnet-5f6a7b8c9d0e1f2a', name: 'stg-public-1a',   vpc: 'staging-vpc', cidr: '10.1.1.0/24',  az: 'us-east-1a', type: 'Public',  available_ips: 240, route_table: 'rtb-2c3d4e5f' },
]

export const SECURITY_GROUPS = [
  { id: 'sg-0a1b2c3d4e5f6a7b8', name: 'web-tier-sg', vpc: 'prod-vpc', inbound: '80, 443 (0.0.0.0/0)',  outbound: 'All traffic', description: 'Web tier — HTTP/HTTPS inbound' },
  { id: 'sg-1b2c3d4e5f6a7b8c9', name: 'app-tier-sg', vpc: 'prod-vpc', inbound: '8080 (web-tier-sg)',    outbound: 'All traffic', description: 'App tier — allow from ALB' },
  { id: 'sg-2c3d4e5f6a7b8c9d0', name: 'db-tier-sg',  vpc: 'prod-vpc', inbound: '5432 (app-tier-sg)',    outbound: 'All traffic', description: 'DB tier — allow from app tier' },
  { id: 'sg-3d4e5f6a7b8c9d0e1', name: 'bastion-sg',  vpc: 'prod-vpc', inbound: '22 (10.100.0.0/16)',    outbound: 'All traffic', description: 'Bastion — SSH from VPN CIDR' },
  { id: 'sg-4e5f6a7b8c9d0e1f2', name: 'lambda-sg',   vpc: 'prod-vpc', inbound: 'None',                  outbound: 'All traffic', description: 'Lambda functions outbound' },
]

// ── Load Balancers ────────────────────────────────────────────────────────────
export const LOAD_BALANCERS = [
  { name: 'prod-web-alb',    type: 'Application', state: 'active',       scheme: 'internet-facing', vpc: 'prod-vpc',    azs: 'us-east-1a, 1b', targets: 4, dns: 'prod-web-alb-123456.us-east-1.elb.amazonaws.com',    created: '2023-01-20' },
  { name: 'prod-api-alb',    type: 'Application', state: 'active',       scheme: 'internal',        vpc: 'prod-vpc',    azs: 'us-east-1a, 1b', targets: 3, dns: 'prod-api-alb-789012.us-east-1.elb.amazonaws.com',    created: '2023-01-20' },
  { name: 'prod-db-nlb',     type: 'Network',     state: 'active',       scheme: 'internal',        vpc: 'prod-vpc',    azs: 'us-east-1a',     targets: 2, dns: 'prod-db-nlb-345678.us-east-1.elb.amazonaws.com',     created: '2023-02-05' },
  { name: 'staging-alb',     type: 'Application', state: 'active',       scheme: 'internet-facing', vpc: 'staging-vpc', azs: 'us-east-1a, 1c', targets: 2, dns: 'staging-alb-901234.us-east-1.elb.amazonaws.com',     created: '2023-04-11' },
  { name: 'dev-gateway-alb', type: 'Application', state: 'provisioning', scheme: 'internet-facing', vpc: 'dev-vpc',     azs: 'us-east-1b',     targets: 1, dns: 'dev-gateway-alb-567890.us-east-1.elb.amazonaws.com', created: '2024-11-18' },
]

// ── Lambda ────────────────────────────────────────────────────────────────────
export const LAMBDA_FUNCTIONS = [
  { name: 'ec2-portal-handler',  runtime: 'Python 3.13', memory: '256 MB',  timeout: '30s',  state: 'Active',   last_modified: '2024-11-20', handler: 'ec2_handler.lambda_handler', package_size: '1.2 MB' },
  { name: 'user-auth-service',   runtime: 'Node.js 20',  memory: '512 MB',  timeout: '10s',  state: 'Active',   last_modified: '2024-10-14', handler: 'index.handler',              package_size: '4.3 MB' },
  { name: 'image-resizer',       runtime: 'Node.js 20',  memory: '1024 MB', timeout: '60s',  state: 'Active',   last_modified: '2024-09-30', handler: 'resize.handler',             package_size: '12.1 MB'},
  { name: 'event-processor',     runtime: 'Python 3.12', memory: '256 MB',  timeout: '120s', state: 'Active',   last_modified: '2024-11-01', handler: 'processor.main',             package_size: '2.8 MB' },
  { name: 'scheduled-cleanup',   runtime: 'Python 3.12', memory: '128 MB',  timeout: '300s', state: 'Active',   last_modified: '2024-08-22', handler: 'cleanup.run',                package_size: '0.5 MB' },
  { name: 'data-sync-legacy',    runtime: 'Python 3.9',  memory: '512 MB',  timeout: '60s',  state: 'Inactive', last_modified: '2023-06-10', handler: 'sync.handler',               package_size: '8.7 MB' },
]

// ── RDS ───────────────────────────────────────────────────────────────────────
export const RDS_INSTANCES = [
  { id: 'prod-postgres-primary',    engine: 'PostgreSQL 15.4',  class: 'db.r6g.xlarge',  status: 'available', storage: '500 GB gp3',  multi_az: 'Yes', public: 'No', created: '2022-12-01' },
  { id: 'prod-postgres-replica',    engine: 'PostgreSQL 15.4',  class: 'db.r6g.large',   status: 'available', storage: '500 GB gp3',  multi_az: 'No',  public: 'No', created: '2023-01-10' },
  { id: 'staging-mysql-01',         engine: 'MySQL 8.0.35',     class: 'db.t3.medium',   status: 'available', storage: '100 GB gp2',  multi_az: 'No',  public: 'No', created: '2023-03-15' },
  { id: 'analytics-aurora-cluster', engine: 'Aurora MySQL 3.4', class: 'db.r6g.2xlarge', status: 'available', storage: 'Auto (I/O)', multi_az: 'Yes', public: 'No', created: '2023-08-20' },
  { id: 'dev-postgres-01',          engine: 'PostgreSQL 15.4',  class: 'db.t4g.small',   status: 'available', storage: '20 GB gp2',   multi_az: 'No',  public: 'No', created: '2024-01-05' },
  { id: 'legacy-mysql-archive',     engine: 'MySQL 5.7.44',     class: 'db.t2.micro',    status: 'stopped',   storage: '50 GB gp2',   multi_az: 'No',  public: 'No', created: '2021-06-18' },
]

// ── DynamoDB ──────────────────────────────────────────────────────────────────
export const DYNAMODB_TABLES = [
  { name: 'Users',            status: 'Active',   items: 248310,  size: '1.2 GB',  read_cap: 'On-demand', write_cap: 'On-demand', streams: 'Enabled',  gsi: 2 },
  { name: 'Sessions',         status: 'Active',   items: 42193,   size: '312 MB',  read_cap: 'On-demand', write_cap: 'On-demand', streams: 'Disabled', gsi: 1 },
  { name: 'ProductCatalog',   status: 'Active',   items: 18450,   size: '245 MB',  read_cap: '100 RCU',   write_cap: '50 WCU',   streams: 'Enabled',  gsi: 3 },
  { name: 'OrderHistory',     status: 'Active',   items: 1248932, size: '8.4 GB',  read_cap: 'On-demand', write_cap: 'On-demand', streams: 'Enabled',  gsi: 2 },
  { name: 'FeatureFlags',     status: 'Active',   items: 127,     size: '2 KB',    read_cap: '5 RCU',     write_cap: '5 WCU',    streams: 'Disabled', gsi: 0 },
  { name: 'EventLog-Archive', status: 'Archived', items: 5420100, size: '42.1 GB', read_cap: '10 RCU',    write_cap: '5 WCU',    streams: 'Disabled', gsi: 0 },
]

// ── ECS ───────────────────────────────────────────────────────────────────────
export const ECS_CLUSTERS = [
  { name: 'prod-api-cluster',    status: 'ACTIVE',   services: 4, tasks_running: 12, tasks_pending: 0, container_instances: 0, launch_type: 'Fargate' },
  { name: 'prod-worker-cluster', status: 'ACTIVE',   services: 2, tasks_running: 6,  tasks_pending: 1, container_instances: 0, launch_type: 'Fargate' },
  { name: 'staging-cluster',     status: 'ACTIVE',   services: 3, tasks_running: 4,  tasks_pending: 0, container_instances: 0, launch_type: 'Fargate' },
  { name: 'dev-cluster',         status: 'ACTIVE',   services: 1, tasks_running: 1,  tasks_pending: 0, container_instances: 3, launch_type: 'EC2' },
  { name: 'batch-jobs-cluster',  status: 'INACTIVE', services: 0, tasks_running: 0,  tasks_pending: 0, container_instances: 0, launch_type: 'Fargate' },
]

// ── CloudFront ────────────────────────────────────────────────────────────────
export const CLOUDFRONT_DISTRIBUTIONS = [
  { id: 'E1A2B3C4D5E6F7', domain: 'assets.example.com',  status: 'Deployed',     origins: 'prod-assets-bucket', price_class: 'All',   ssl: 'Custom SSL', enabled: 'Yes' },
  { id: 'E2B3C4D5E6F7A8', domain: 'api.example.com',     status: 'Deployed',     origins: 'prod-api-alb',        price_class: 'US/EU', ssl: 'Custom SSL', enabled: 'Yes' },
  { id: 'E3C4D5E6F7A8B9', domain: 'app.example.com',     status: 'Deployed',     origins: 'prod-web-alb',        price_class: 'All',   ssl: 'Custom SSL', enabled: 'Yes' },
  { id: 'E4D5E6F7A8B9C0', domain: 'staging.example.com', status: 'In Progress',  origins: 'staging-alb',         price_class: 'US/EU', ssl: 'CloudFront', enabled: 'Yes' },
]

// ── Route 53 ──────────────────────────────────────────────────────────────────
export const ROUTE53_ZONES = [
  { id: 'Z1A2B3C4D5E6F7', name: 'example.com',          type: 'Public',  records: 24, comment: 'Primary production domain' },
  { id: 'Z2B3C4D5E6F7A8', name: 'internal.example.com', type: 'Private', records: 12, comment: 'Internal service discovery' },
  { id: 'Z3C4D5E6F7A8B9', name: 'staging.example.io',   type: 'Public',  records: 8,  comment: 'Staging environment' },
  { id: 'Z4D5E6F7A8B9C0', name: 'dev.example.io',       type: 'Public',  records: 5,  comment: 'Dev environment (ephemeral)' },
]

// ── SQS ───────────────────────────────────────────────────────────────────────
export const SQS_QUEUES = [
  { name: 'order-processing-queue',    type: 'Standard', messages_available: 0,    messages_in_flight: 3,  dlq: 'order-processing-dlq',  retention: '4 days' },
  { name: 'order-processing-dlq',      type: 'Standard', messages_available: 12,   messages_in_flight: 0,  dlq: '—',                      retention: '14 days' },
  { name: 'image-resize-queue.fifo',   type: 'FIFO',     messages_available: 47,   messages_in_flight: 5,  dlq: 'image-resize-dlq.fifo', retention: '1 day' },
  { name: 'event-notifications-queue', type: 'Standard', messages_available: 0,    messages_in_flight: 0,  dlq: '—',                      retention: '4 days' },
  { name: 'data-ingestion-queue',      type: 'Standard', messages_available: 1204, messages_in_flight: 48, dlq: 'data-ingestion-dlq',    retention: '7 days' },
]

// ── SNS ───────────────────────────────────────────────────────────────────────
export const SNS_TOPICS = [
  { name: 'prod-alerts',         type: 'Standard', subscriptions: 4, protocol: 'Email, Lambda' },
  { name: 'order-events',        type: 'Standard', subscriptions: 3, protocol: 'SQS, Lambda' },
  { name: 'user-notifications',  type: 'Standard', subscriptions: 2, protocol: 'SQS, HTTP' },
  { name: 'billing-alerts.fifo', type: 'FIFO',     subscriptions: 1, protocol: 'SQS' },
  { name: 'cloudwatch-alarms',   type: 'Standard', subscriptions: 5, protocol: 'Email, PagerDuty' },
]

// ── Auto Scaling ──────────────────────────────────────────────────────────────
export const AUTO_SCALING_GROUPS = [
  { name: 'prod-web-asg',    status: 'InService', min: 2, desired: 4, max: 10, instances: 4, health_check: 'ELB', launch_config: 'prod-web-lc-v3' },
  { name: 'prod-api-asg',    status: 'InService', min: 2, desired: 3, max: 8,  instances: 3, health_check: 'ELB', launch_config: 'prod-api-lt-v2' },
  { name: 'prod-worker-asg', status: 'InService', min: 1, desired: 2, max: 6,  instances: 2, health_check: 'EC2', launch_config: 'prod-worker-lt-v1' },
  { name: 'staging-web-asg', status: 'InService', min: 1, desired: 1, max: 4,  instances: 1, health_check: 'ELB', launch_config: 'staging-web-lt-v2' },
  { name: 'batch-proc-asg',  status: 'Suspended', min: 0, desired: 0, max: 20, instances: 0, health_check: 'EC2', launch_config: 'batch-lt-v1' },
]

// ── IAM ───────────────────────────────────────────────────────────────────────
export const IAM_USERS = [
  { username: 'sachin.gate',        groups: 'Developers, S3ReadOnly', policies: 2, mfa: 'Virtual MFA', access_keys: 1, last_login: '2024-11-20', created: '2022-07-01' },
  { username: 'priya.mehta',        groups: 'Developers',             policies: 1, mfa: 'Virtual MFA', access_keys: 1, last_login: '2024-11-19', created: '2023-01-10' },
  { username: 'devops-ci-bot',      groups: 'CI-CD-Access',           policies: 3, mfa: '—',           access_keys: 2, last_login: '2024-11-20', created: '2022-08-15' },
  { username: 'terraform-admin',    groups: 'InfraAdmins',            policies: 1, mfa: '—',           access_keys: 1, last_login: '2024-11-18', created: '2022-08-01' },
  { username: 'readonly-auditor',   groups: 'ReadOnly',               policies: 1, mfa: 'Virtual MFA', access_keys: 0, last_login: '2024-10-30', created: '2023-04-22' },
  { username: 'legacy-deploy-user', groups: '—',                      policies: 2, mfa: '—',           access_keys: 1, last_login: '2024-05-01', created: '2021-03-10' },
]

export const IAM_ROLES = [
  { name: 'EC2PortalLambdaRole',      trusted_entity: 'lambda.amazonaws.com',            policies: 'EC2PortalPolicy, AWSXRayDaemonWriteAccess', created: '2023-01-15' },
  { name: 'ECSTaskExecutionRole',     trusted_entity: 'ecs-tasks.amazonaws.com',          policies: 'AmazonECSTaskExecutionRolePolicy',           created: '2023-01-18' },
  { name: 'EC2SSMRole',               trusted_entity: 'ec2.amazonaws.com',               policies: 'AmazonSSMManagedInstanceCore',               created: '2022-09-01' },
  { name: 'GithubActionsOIDCRole',    trusted_entity: 'token.actions.github.com',        policies: 'DeployPolicy, S3UploadPolicy',               created: '2023-06-10' },
  { name: 'RDSMonitoringRole',        trusted_entity: 'monitoring.rds.amazonaws.com',    policies: 'AmazonRDSEnhancedMonitoringRole',            created: '2022-12-01' },
  { name: 'CloudFormationDeployRole', trusted_entity: 'cloudformation.amazonaws.com',    policies: 'AdministratorAccess',                        created: '2022-07-20' },
]

// ── CloudWatch ────────────────────────────────────────────────────────────────
export const CW_ALARMS = [
  { name: 'EC2Portal-LambdaErrors',     state: 'OK',                metric: 'Errors',                    threshold: '> 5 in 60s',        actions: 'SNS:prod-alerts',    updated: '2024-11-20 08:00' },
  { name: 'RDS-CPUUtilization-High',    state: 'ALARM',             metric: 'CPUUtilization',            threshold: '> 80% for 5m',      actions: 'SNS:prod-alerts',    updated: '2024-11-20 14:32' },
  { name: 'ALB-5xxErrorRate',           state: 'OK',                metric: '5XXError',                  threshold: '> 10/min',          actions: 'SNS:prod-alerts',    updated: '2024-11-20 09:15' },
  { name: 'ECS-MemoryReservation-High', state: 'INSUFFICIENT_DATA', metric: 'MemoryReservation',         threshold: '> 85%',             actions: 'SNS:prod-alerts',    updated: '2024-11-19 18:00' },
  { name: 'Lambda-Duration-High',       state: 'OK',                metric: 'Duration',                  threshold: '> 25s avg',         actions: 'SNS:prod-alerts',    updated: '2024-11-20 06:00' },
  { name: 'DynamoDB-ConsumedRCU',       state: 'OK',                metric: 'ConsumedReadCapacityUnits', threshold: '> 90% provisioned', actions: 'SNS:billing-alerts', updated: '2024-11-18 12:00' },
  { name: 'S3-4xxErrors',               state: 'ALARM',             metric: '4xxErrors',                 threshold: '> 50/min',          actions: 'SNS:prod-alerts',    updated: '2024-11-20 15:47' },
]

export const CW_DASHBOARDS = [
  { name: 'Production-Overview', widgets: 12, region: 'us-east-1', last_updated: '2024-11-20 08:00' },
  { name: 'Lambda-Metrics',      widgets: 8,  region: 'us-east-1', last_updated: '2024-11-15 14:00' },
  { name: 'RDS-Performance',     widgets: 6,  region: 'us-east-1', last_updated: '2024-10-30 10:00' },
  { name: 'ECS-Cluster-Health',  widgets: 9,  region: 'us-east-1', last_updated: '2024-11-01 09:00' },
  { name: 'Business-KPIs',       widgets: 5,  region: 'global',    last_updated: '2024-11-18 16:00' },
]

// ── Developer Tools ───────────────────────────────────────────────────────────
export const CODEPIPELINES = [
  { name: 'ecommerce-prod-pipeline', status: 'Succeeded', source: 'CodeCommit: ecommerce-app',  last_execution: '2024-11-20 10:23', stages: 4, created: '2023-01-25' },
  { name: 'api-service-pipeline',    status: 'Succeeded', source: 'GitHub: api-service',         last_execution: '2024-11-19 15:44', stages: 3, created: '2023-02-10' },
  { name: 'infra-pipeline',          status: 'Failed',    source: 'CodeCommit: infrastructure',  last_execution: '2024-11-20 09:10', stages: 3, created: '2023-03-01' },
  { name: 'data-pipeline-etl',       status: 'Succeeded', source: 'GitHub: data-etl',            last_execution: '2024-11-18 22:00', stages: 2, created: '2023-07-15' },
  { name: 'mobile-backend-pipeline', status: 'Running',   source: 'GitHub: mobile-backend',      last_execution: '2024-11-20 16:01', stages: 4, created: '2024-01-10' },
]

export const CODEBUILD_PROJECTS = [
  { name: 'ecommerce-app-build',  source: 'CodeCommit', environment: 'aws/codebuild/standard:7.0', status: 'Succeeded',   build_time: '3m 12s', last_build: '2024-11-20 10:15' },
  { name: 'api-service-build',    source: 'GitHub',     environment: 'aws/codebuild/standard:7.0', status: 'Succeeded',   build_time: '1m 45s', last_build: '2024-11-19 15:38' },
  { name: 'infra-terraform-plan', source: 'CodeCommit', environment: 'hashicorp/terraform:1.7',    status: 'Failed',      build_time: '4m 02s', last_build: '2024-11-20 09:05' },
  { name: 'docker-image-build',   source: 'GitHub',     environment: 'aws/codebuild/standard:7.0', status: 'Succeeded',   build_time: '6m 31s', last_build: '2024-11-18 21:50' },
  { name: 'unit-test-runner',     source: 'GitHub',     environment: 'aws/codebuild/standard:7.0', status: 'In Progress', build_time: '—',      last_build: '2024-11-20 16:02' },
]

export const CODEDEPLOY_APPS = [
  { name: 'ecommerce-web-app', platform: 'EC2/On-Premises', groups: 2, last_deployment: 'Succeeded — 2024-11-20 10:28' },
  { name: 'api-service',       platform: 'EC2/On-Premises', groups: 1, last_deployment: 'Succeeded — 2024-11-19 15:50' },
  { name: 'lambda-functions',  platform: 'Lambda',          groups: 3, last_deployment: 'Succeeded — 2024-11-18 11:00' },
  { name: 'ecs-task-deploy',   platform: 'Amazon ECS',      groups: 2, last_deployment: 'Failed — 2024-11-20 09:15' },
]

export const CODECOMMIT_REPOS = [
  { name: 'ecommerce-app',   default_branch: 'main', last_commit: '2024-11-20', open_prs: 3, size: '124 MB' },
  { name: 'infrastructure',  default_branch: 'main', last_commit: '2024-11-20', open_prs: 1, size: '18 MB' },
  { name: 'api-service',     default_branch: 'main', last_commit: '2024-11-19', open_prs: 2, size: '56 MB' },
  { name: 'data-etl-jobs',   default_branch: 'main', last_commit: '2024-11-18', open_prs: 0, size: '9 MB' },
  { name: 'frontend-portal', default_branch: 'main', last_commit: '2024-11-20', open_prs: 4, size: '87 MB' },
]

export const CODESTAR_CONNECTIONS = [
  { name: 'github-org-connection', provider: 'GitHub', status: 'Available', owner: 'elliotsystems-org', arn: 'arn:aws:codeconnections:us-east-1:123456789012:connection/abc-123' },
  { name: 'github-personal',       provider: 'GitHub', status: 'Available', owner: 'sachin-gate',       arn: 'arn:aws:codeconnections:us-east-1:123456789012:connection/def-456' },
  { name: 'gitlab-enterprise',     provider: 'GitLab', status: 'Pending',   owner: 'elliot-gitlab',     arn: 'arn:aws:codeconnections:us-east-1:123456789012:connection/ghi-789' },
]
