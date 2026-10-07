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

// ── CloudTrail ────────────────────────────────────────────────────────────────
// Shaped like the real CloudTrail LookupEvents response — event_id, resource_type,
// and access_key_id exist specifically so the Event History page's "Lookup
// attributes" filter (Event ID / Resource type / AWS access key, same as the
// real console) has real fields to search. Timestamps are generated relative
// to page-load time (not hardcoded) so the time-range filter has something
// meaningful to filter against no matter when this is viewed.
const CT_EVENT_TEMPLATES = [
  { event_name: 'ConsoleLogin',           event_source: 'signin.amazonaws.com',   resource_type: 'AWS::IAM::User',          read_only: false },
  { event_name: 'RunInstances',           event_source: 'ec2.amazonaws.com',      resource_type: 'AWS::EC2::Instance',      read_only: false },
  { event_name: 'StartInstances',         event_source: 'ec2.amazonaws.com',      resource_type: 'AWS::EC2::Instance',      read_only: false },
  { event_name: 'StopInstances',          event_source: 'ec2.amazonaws.com',      resource_type: 'AWS::EC2::Instance',      read_only: false },
  { event_name: 'TerminateInstances',     event_source: 'ec2.amazonaws.com',      resource_type: 'AWS::EC2::Instance',      read_only: false },
  { event_name: 'DescribeInstances',      event_source: 'ec2.amazonaws.com',      resource_type: 'AWS::EC2::Instance',      read_only: true  },
  { event_name: 'PutObject',              event_source: 's3.amazonaws.com',       resource_type: 'AWS::S3::Object',         read_only: false },
  { event_name: 'GetObject',              event_source: 's3.amazonaws.com',       resource_type: 'AWS::S3::Object',         read_only: true  },
  { event_name: 'DeleteObject',           event_source: 's3.amazonaws.com',       resource_type: 'AWS::S3::Object',         read_only: false },
  { event_name: 'CreateBucket',           event_source: 's3.amazonaws.com',       resource_type: 'AWS::S3::Bucket',         read_only: false },
  { event_name: 'PutBucketPolicy',        event_source: 's3.amazonaws.com',       resource_type: 'AWS::S3::Bucket',         read_only: false },
  { event_name: 'DeleteSecurityGroup',    event_source: 'ec2.amazonaws.com',      resource_type: 'AWS::EC2::SecurityGroup', read_only: false },
  { event_name: 'AssumeRole',             event_source: 'sts.amazonaws.com',      resource_type: 'AWS::IAM::Role',          read_only: false },
  { event_name: 'CreateFunction20150331', event_source: 'lambda.amazonaws.com',   resource_type: 'AWS::Lambda::Function',   read_only: false },
  { event_name: 'InvokeFunction',         event_source: 'lambda.amazonaws.com',   resource_type: 'AWS::Lambda::Function',   read_only: true  },
  { event_name: 'UpdateTable',            event_source: 'dynamodb.amazonaws.com', resource_type: 'AWS::DynamoDB::Table',    read_only: false },
  { event_name: 'DescribeDBInstances',    event_source: 'rds.amazonaws.com',      resource_type: 'AWS::RDS::DBInstance',    read_only: true  },
  { event_name: 'ListUsers',              event_source: 'iam.amazonaws.com',      resource_type: 'AWS::IAM::User',          read_only: true  },
  { event_name: 'CreateUser',             event_source: 'iam.amazonaws.com',      resource_type: 'AWS::IAM::User',          read_only: false },
  { event_name: 'AttachRolePolicy',       event_source: 'iam.amazonaws.com',      resource_type: 'AWS::IAM::Role',          read_only: false },
]

const CT_USERS = ['sachin.gate', 'priya.mehta', 'devops-ci-bot', 'terraform-admin', 'readonly-auditor', 'legacy-deploy-user']
const CT_IPS   = ['203.0.113.42', '10.0.1.45', '10.0.2.78', '198.51.100.9', '203.0.113.17', '185.220.101.7']
const CT_RESOURCE_NAMES = {
  'AWS::EC2::Instance':        ['i-0a1b2c3d4e5f6a7b8', 'i-1b2c3d4e5f6a7b8c9', 'i-2c3d4e5f6a7b8c9d0'],
  'AWS::S3::Object':           ['prod-assets-bucket-us-east-1/logo.png', 'cloudfront-logs-prod/access.log.gz'],
  'AWS::S3::Bucket':           ['prod-assets-bucket-us-east-1', 'terraform-state-backend'],
  'AWS::EC2::SecurityGroup':   ['sg-4e5f6a7b8c9d0e1f2', 'sg-0a1b2c3d4e5f6a7b8'],
  'AWS::IAM::Role':            ['GithubActionsOIDCRole', 'EC2PortalLambdaRole'],
  'AWS::IAM::User':            ['sachin.gate', 'priya.mehta', 'Root'],
  'AWS::Lambda::Function':     ['event-processor', 'ec2-portal-handler'],
  'AWS::DynamoDB::Table':      ['OrderHistory', 'Sessions'],
  'AWS::RDS::DBInstance':      ['prod-postgres-primary'],
}

function ctPad(n) { return String(n).padStart(2, '0') }
function ctStamp(d) {
  return `${d.getFullYear()}-${ctPad(d.getMonth() + 1)}-${ctPad(d.getDate())} ${ctPad(d.getHours())}:${ctPad(d.getMinutes())}:${ctPad(d.getSeconds())}`
}

export const CLOUDTRAIL_EVENTS = Array.from({ length: 70 }, (_, i) => {
  const tpl          = CT_EVENT_TEMPLATES[i % CT_EVENT_TEMPLATES.length]
  const minutesAgo   = Math.round(i * i * 3) // biased toward "now" — plenty of recent events, a long thin tail further back
  const eventTime    = new Date(Date.now() - minutesAgo * 60_000)
  const user         = CT_USERS[(i * 7) % CT_USERS.length]
  const names        = CT_RESOURCE_NAMES[tpl.resource_type] || ['—']
  const isCiUser     = user === 'devops-ci-bot' || user === 'terraform-admin'
  const isFailure    = i % 11 === 0
  const isDenied     = i % 23 === 0

  return {
    event_id:      `${i.toString(16).padStart(4, '0')}a1b2-c3d4-4e5f-8a9b-${(100000000000 + i).toString(16).padStart(12, '0')}`,
    event_time:    ctStamp(eventTime),
    event_name:    tpl.event_name,
    event_source:  tpl.event_source,
    username:      user,
    source_ip:     CT_IPS[(i * 3) % CT_IPS.length],
    aws_region:    'us-east-1',
    resource:      names[i % names.length],
    resource_type: tpl.resource_type,
    access_key_id: isCiUser ? `AKIA${(i * 37).toString(36).toUpperCase().padStart(12, 'X')}` : '—',
    read_only:     tpl.read_only ? 'Yes' : 'No',
    status:        isDenied ? 'AccessDenied' : isFailure ? 'Failed' : 'Success',
  }
})

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

// ── Domains & DNS ─────────────────────────────────────────────────────────────
export const DOMAINS = [
  { domain: 'elliotsystems.com',    registrar: 'Route 53',  status: 'Active',         auto_renew: 'Yes', expires: '2027-03-12', nameservers: 'Route 53',   created: '2019-03-01' },
  { domain: 'ecommerce-app.io',     registrar: 'Cloudflare', status: 'Active',         auto_renew: 'Yes', expires: '2027-01-18', nameservers: 'Cloudflare', created: '2021-07-22' },
  { domain: 'internal-tools.dev',   registrar: 'Route 53',  status: 'Active',         auto_renew: 'No',  expires: '2026-10-22', nameservers: 'Route 53',   created: '2022-02-14' },
  { domain: 'staging-api.net',      registrar: 'Namecheap', status: 'Active',         auto_renew: 'Yes', expires: '2027-06-05', nameservers: 'Cloudflare', created: '2020-09-10' },
  { domain: 'legacy-portal.com',    registrar: 'GoDaddy',   status: 'Expiring Soon',  auto_renew: 'No',  expires: '2026-10-09', nameservers: 'Route 53',   created: '2018-05-20' },
]

export const SSL_CERTIFICATES = [
  { domain: 'www.elliotsystems.com',    issuer: 'Amazon',        type: 'DV',       status: 'Issued', expires: '2027-01-15', auto_renew: 'Yes', in_use: 'CloudFront, ALB' },
  { domain: 'api.ecommerce-app.io',     issuer: "Let's Encrypt", type: 'DV',       status: 'Issued', expires: '2026-10-09', auto_renew: 'Yes', in_use: 'Cloudflare Edge' },
  { domain: '*.internal-tools.dev',     issuer: 'Amazon',        type: 'Wildcard', status: 'Issued', expires: '2026-10-22', auto_renew: 'No',  in_use: 'ALB' },
  { domain: 'staging-api.net',          issuer: 'Sectigo',       type: 'DV',       status: 'Issued', expires: '2027-03-30', auto_renew: 'Yes', in_use: 'ALB' },
  { domain: 'legacy-portal.com',        issuer: 'GoDaddy',       type: 'DV',       status: 'Expired', expires: '2026-09-18', auto_renew: 'No',  in_use: 'EC2 (nginx)' },
]

export const DNS_RECORDS = [
  { domain: 'elliotsystems.com',  type: 'A',     name: '@',       value: '76.76.21.21',                                   ttl: 'Auto', proxied: 'Yes' },
  { domain: 'elliotsystems.com',  type: 'CNAME', name: 'www',     value: 'elliotsystems.com',                              ttl: 'Auto', proxied: 'Yes' },
  { domain: 'ecommerce-app.io',   type: 'A',     name: '@',       value: '104.21.5.12',                                    ttl: '3600', proxied: 'Yes' },
  { domain: 'ecommerce-app.io',   type: 'A',     name: 'api',     value: '104.21.5.13',                                    ttl: '3600', proxied: 'Yes' },
  { domain: 'ecommerce-app.io',   type: 'MX',    name: '@',       value: 'mail.ecommerce-app.io',                          ttl: '3600', proxied: 'No' },
  { domain: 'internal-tools.dev', type: 'A',     name: '@',       value: '10.0.1.45',                                      ttl: '300',  proxied: 'No' },
  { domain: 'internal-tools.dev', type: 'TXT',   name: '@',       value: 'v=spf1 include:_spf.google.com ~all',            ttl: '3600', proxied: 'No' },
  { domain: 'staging-api.net',    type: 'CNAME', name: 'staging', value: 'staging-alb-901234.us-east-1.elb.amazonaws.com', ttl: '300',  proxied: 'No' },
  { domain: 'legacy-portal.com',  type: 'A',     name: '@',       value: '203.0.113.88',                                   ttl: '3600', proxied: 'No' },
]

// Cloudflare-style edge analytics. No Cloudflare API token is configured yet,
// so all of this stays mock-only until one is added (see the note on the
// Domains & DNS → Analytics tab) — but it's shaped exactly like the real
// Cloudflare Zone Analytics response so wiring in live data later is a
// drop-in swap, not a redesign.

function buildTrafficSeries(points, baseline, amplitude, threatBase) {
  return Array.from({ length: points }, (_, i) => {
    const wave     = Math.sin((i / points) * Math.PI * 2) * amplitude
    const requests = Math.round(baseline + wave + (i % 5) * baseline * 0.01)
    const cached   = Math.round(requests * (0.68 + (i % 3) * 0.03))
    const threats  = Math.round(threatBase + Math.abs(Math.sin(i * 1.3)) * threatBase * 0.8)
    return { requests, cached, uncached: requests - cached, threats }
  })
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
const DAY_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const CF_SERIES_24H = buildTrafficSeries(24, 53500, 14200, 14)
  .map((d, i) => ({ label: HOUR_LABELS[i], ...d }))
export const CF_SERIES_7D = buildTrafficSeries(7, 172000, 28000, 45)
  .map((d, i) => ({ label: DAY_LABELS[i], ...d }))
export const CF_SERIES_30D = buildTrafficSeries(30, 178000, 32000, 48)
  .map((d, i) => ({ label: `${i + 1}`, ...d }))

export const CF_SERIES_BY_RANGE = { '24h': CF_SERIES_24H, '7d': CF_SERIES_7D, '30d': CF_SERIES_30D }

export const CF_SUMMARY_BY_RANGE = {
  '24h': { requests: 1284302,  visitors: 48210,   bandwidth_gb: 48.7,   cached_pct: 76, threats: 342,  avg_response_ms: 128, uptime_pct: 99.98 },
  '7d':  { requests: 8930214,  visitors: 312480,  bandwidth_gb: 341.2,  cached_pct: 74, threats: 2104, avg_response_ms: 134, uptime_pct: 99.96 },
  '30d': { requests: 38210540, visitors: 1284200, bandwidth_gb: 1480.6, cached_pct: 73, threats: 8940, avg_response_ms: 131, uptime_pct: 99.95 },
}

// Relative traffic share per tracked domain — used to scale the "All domains"
// totals above when a single domain is selected in the Analytics filter.
export const CF_DOMAIN_SHARE = {
  'elliotsystems.com':  0.12,
  'ecommerce-app.io':   0.58,
  'internal-tools.dev': 0.06,
  'staging-api.net':    0.09,
  'legacy-portal.com':  0.15,
}

export const CF_TRAFFIC_BY_COUNTRY = [
  { country: 'United States',   flag: '🇺🇸', pct: 38 },
  { country: 'India',           flag: '🇮🇳', pct: 19 },
  { country: 'Germany',         flag: '🇩🇪', pct: 11 },
  { country: 'United Kingdom',  flag: '🇬🇧', pct: 9  },
  { country: 'Singapore',       flag: '🇸🇬', pct: 7  },
  { country: 'Brazil',          flag: '🇧🇷', pct: 6  },
  { country: 'Other',           flag: '🌐', pct: 10 },
]

export const CF_STATUS_CODES = [
  { code: '2xx', label: 'Success',      pct: 91.4, color: '#22C55E' },
  { code: '3xx', label: 'Redirect',     pct: 4.1,  color: '#4F6EF7' },
  { code: '4xx', label: 'Client Error', pct: 3.8,  color: '#F59E0B' },
  { code: '5xx', label: 'Server Error', pct: 0.7,  color: '#EF4444' },
]

export const CF_TOP_PATHS = [
  { path: '/',                     requests: 284021, pct: 22.1 },
  { path: '/api/v1/products',      requests: 198344, pct: 15.4 },
  { path: '/assets/app.js',        requests: 162908, pct: 12.7 },
  { path: '/api/v1/orders',        requests: 121553, pct: 9.5  },
  { path: '/checkout',             requests: 84210,  pct: 6.6  },
  { path: '/api/v1/auth/login',    requests: 67340,  pct: 5.2  },
]

export const CF_BOT_TRAFFIC = [
  { name: 'Human',        pct: 78, color: '#4F6EF7' },
  { name: 'Verified Bot',  pct: 15, color: '#22C55E' },
  { name: 'Likely Bot',    pct: 7,  color: '#F59E0B' },
]

// ── Analytics (org-wide infra analytics) ───────────────────────────────────────
export const COST_TREND = [
  { month: 'Apr', EC2: 1240, S3: 310, RDS: 540, Lambda: 90,  Other: 220 },
  { month: 'May', EC2: 1310, S3: 325, RDS: 540, Lambda: 110, Other: 240 },
  { month: 'Jun', EC2: 1180, S3: 340, RDS: 560, Lambda: 125, Other: 210 },
  { month: 'Jul', EC2: 1420, S3: 355, RDS: 560, Lambda: 140, Other: 260 },
  { month: 'Aug', EC2: 1390, S3: 370, RDS: 580, Lambda: 160, Other: 250 },
  { month: 'Sep', EC2: 1510, S3: 385, RDS: 600, Lambda: 175, Other: 275 },
]

export const RESOURCE_HEALTH_TREND = [
  { week: 'W1', healthy: 92, warning: 6, critical: 2 },
  { week: 'W2', healthy: 90, warning: 7, critical: 3 },
  { week: 'W3', healthy: 94, warning: 5, critical: 1 },
  { week: 'W4', healthy: 88, warning: 9, critical: 3 },
  { week: 'W5', healthy: 95, warning: 4, critical: 1 },
  { week: 'W6', healthy: 93, warning: 6, critical: 1 },
]

// ── Billing & Cost Management ──────────────────────────────────────────────────
// Shaped like AWS Cost Explorer's get_cost_and_usage response (grouped by
// SERVICE, monthly granularity) so the real backend handler (_get_billing,
// Cost Explorer API) can return the same { months: [{ month, services, total }] }
// shape without a translation layer — real AWS service names just flow
// straight through to the UI instead of these short mock keys.
export const BILLING_SERVICE_LABELS = {
  EC2:          'Amazon Elastic Compute Cloud',
  S3:           'Amazon Simple Storage Service',
  RDS:          'Amazon Relational Database Service',
  Lambda:       'AWS Lambda',
  DynamoDB:     'Amazon DynamoDB',
  CloudFront:   'Amazon CloudFront',
  ELB:          'Elastic Load Balancing',
  Route53:      'Amazon Route 53',
  DataTransfer: 'Data Transfer',
  Other:        'Other Services',
}

const BILLING_USAGE_TYPES = {
  EC2:          [{ label: 'BoxUsage:t3.medium', pct: 0.35 }, { label: 'BoxUsage:m5.large', pct: 0.30 }, { label: 'EBS:VolumeUsage.gp3', pct: 0.20 }, { label: 'DataTransfer-Out-Bytes', pct: 0.15 }],
  S3:           [{ label: 'TimedStorage-ByteHrs', pct: 0.55 }, { label: 'Requests-Tier1', pct: 0.25 }, { label: 'DataTransfer-Out-Bytes', pct: 0.20 }],
  RDS:          [{ label: 'InstanceUsage:db.r6g.large', pct: 0.60 }, { label: 'RDS:GP3-Storage', pct: 0.25 }, { label: 'RDS:Multi-AZUsage', pct: 0.15 }],
  Lambda:       [{ label: 'Lambda-GB-Second', pct: 0.65 }, { label: 'Lambda-Requests', pct: 0.35 }],
  DynamoDB:     [{ label: 'ReadCapacityUnit-Hrs', pct: 0.45 }, { label: 'WriteCapacityUnit-Hrs', pct: 0.35 }, { label: 'TimedStorage-ByteHrs', pct: 0.20 }],
  CloudFront:   [{ label: 'Requests-HTTPS', pct: 0.40 }, { label: 'DataTransfer-Out-Bytes', pct: 0.60 }],
  ELB:          [{ label: 'LoadBalancerUsage', pct: 0.70 }, { label: 'LCUUsage', pct: 0.30 }],
  Route53:      [{ label: 'HostedZone', pct: 0.30 }, { label: 'DNS-Queries', pct: 0.70 }],
  DataTransfer: [{ label: 'DataTransfer-Regional-Bytes', pct: 1.0 }],
  Other:        [{ label: 'Miscellaneous usage charges', pct: 1.0 }],
}

const BILLING_BASE_COST = { EC2: 1200, S3: 300, RDS: 520, Lambda: 95, DynamoDB: 140, CloudFront: 180, ELB: 110, Route53: 12, DataTransfer: 85, Other: 160 }

function billingLineItems(serviceKey, amount) {
  return (BILLING_USAGE_TYPES[serviceKey] || [{ label: 'Usage charges', pct: 1 }])
    .map(u => ({ label: u.label, amount: +(amount * u.pct).toFixed(2) }))
}

export const BILLING_DATA = (() => {
  const now = new Date()
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthProgress = dayOfMonth / daysInMonth

  const months = Array.from({ length: 12 }, (_, idx) => {
    // idx is chronological position: 0 = 11 months ago (oldest) .. 11 = current month
    const monthsAgo = 11 - idx
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    const growth = 1 + (idx * 0.015)
    const wobble = Math.sin(idx * 1.1) * 0.08
    const isCurrent = monthsAgo === 0

    const services = {}
    let total = 0
    for (const [key, base] of Object.entries(BILLING_BASE_COST)) {
      let amount = base * growth * (1 + wobble + ((key.length % 3) * 0.02))
      if (isCurrent) amount *= monthProgress
      amount = +amount.toFixed(2)
      services[key] = amount
      total += amount
    }

    return {
      key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      services,
      total: +total.toFixed(2),
      isCurrent,
      forecastTotal: isCurrent ? +(total / monthProgress).toFixed(2) : null,
    }
  })

  return months
})()

export function billingLineItemsFor(serviceKey, amount) {
  return billingLineItems(serviceKey, amount)
}

// ── Instance health (EC2 status checks) ─────────────────────────────────────
// Mirrors mock-api/server.js's instance list so IDs/names line up with
// Manage Instances when running against the mock backend. Used as the seed
// for Analytics' self-contained health simulation when no API is configured.
export const INSTANCE_HEALTH_SEED = [
  { instance_id: 'i-0a1b2c3d4e5f6a7b8', instance_name: 'web-server-prod-01',    state: 'running' },
  { instance_id: 'i-1b2c3d4e5f6a7b8c9', instance_name: 'api-server-prod-01',    state: 'running' },
  { instance_id: 'i-2c3d4e5f6a7b8c9d0', instance_name: 'db-server-prod-01',     state: 'stopped' },
  { instance_id: 'i-3d4e5f6a7b8c9d0e1', instance_name: 'web-server-staging-01', state: 'running' },
  { instance_id: 'i-4e5f6a7b8c9d0e1f2', instance_name: 'bastion-host-01',       state: 'running' },
  { instance_id: 'i-5f6a7b8c9d0e1f2a3', instance_name: 'dev-workstation-01',    state: 'stopped' },
  { instance_id: 'i-7b8c9d0e1f2a3b4c5', instance_name: 'analytics-server-01',   state: 'running' },
]
