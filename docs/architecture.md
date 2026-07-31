# Architecture

## Overview

The portal is a three-tier serverless application: a static React SPA, an API Gateway HTTP API, and a Python Lambda function that calls the AWS EC2 API on behalf of the user.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               User's Browser                                │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  React SPA (Vite + Tailwind + React Router)                         │  │
│   │                                                                      │  │
│   │  /dashboard          → useInstances() → GET /instances              │  │
│   │  /create-instance    → useResources() → GET /resources              │  │
│   │                        createInstance() → POST /instances           │  │
│   │  /manage-instances   → useInstances() → CRUD via /instances         │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │  HTTPS (Axios)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API Gateway HTTP API (apigatewayv2)                      │
│                                                                             │
│   CORS configured at API level — allow_origins, allow_headers, max_age     │
│                                                                             │
│   Route table:                                                              │
│   GET    /instances           ─┐                                           │
│   POST   /instances           ─┤                                           │
│   POST   /instances/start     ─┤  Lambda proxy (payload format 2.0)       │
│   POST   /instances/stop      ─┤  routeKey in event body                  │
│   POST   /instances/reboot    ─┤                                           │
│   DELETE /instances/{id}      ─┤                                           │
│   GET    /resources           ─┘                                           │
│                                                                             │
│   Access logs → CloudWatch /aws/apigateway/{prefix}                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │  AWS_PROXY invocation
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Lambda Function (Python 3.13)                            │
│                                                                             │
│   ec2_handler.lambda_handler(event, context)                               │
│     ├── utils.py       CORS headers, response helpers, tag builder         │
│     ├── validators.py  Input validation, allowed instance types            │
│     └── ec2_handler.py Route dispatch, boto3 EC2 + IAM calls               │
│                                                                             │
│   X-Ray active tracing enabled                                             │
│   Logs to CloudWatch /aws/lambda/{prefix}-handler                          │
│   Metric filter: pattern "ERROR" → CloudWatch Alarm (>5 errors / 60s)     │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │  boto3
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
             EC2 API              IAM API           CloudWatch API
         (describe, run,      (list instance       (logs, metrics)
          start, stop,          profiles)
          reboot, terminate)
```

---

## Component breakdown

### React frontend

| File | Responsibility |
|------|---------------|
| `src/api/ec2.js` | Axios client with interceptors; one export per endpoint |
| `src/hooks/useInstances.js` | Instance list state, action dispatch, counts |
| `src/hooks/useResources.js` | Dropdown data fetch on mount |
| `src/pages/Dashboard.jsx` | Stats overview, utilisation bar, recent instances |
| `src/pages/CreateInstance.jsx` | React Hook Form + `createInstance()` API call |
| `src/pages/ManageInstances.jsx` | Sortable/filterable table + Start/Stop/Reboot/Terminate |
| `src/context/ThemeContext.jsx` | Dark/light toggle persisted to localStorage |

### Lambda backend

| File | Responsibility |
|------|---------------|
| `ec2_handler.py` | Route dispatch (`routeKey` switch), orchestrates validators + EC2 calls |
| `validators.py` | `validate_create_instance()` returns list of errors; `ALLOWED_INSTANCE_TYPES` whitelist |
| `utils.py` | `CORS_HEADERS`, `success_response()`, `error_response()`, `parse_instance()`, `build_tags()` |

### Terraform modules

```
terraform/
├── main.tf            archive_file zip + module wiring (cloudwatch → iam → lambda → api_gateway)
├── modules/
│   ├── cloudwatch/    Lambda log group, API log group, metric filter, error alarm
│   ├── iam/           Execution role, EC2 policy, CloudWatch write policy, X-Ray attachment
│   ├── lambda/        aws_lambda_function (python3.13, X-Ray active, env vars)
│   └── api_gateway/   HTTP API, integration, 7 routes, stage, Lambda permission
```

Module dependency order matters — CloudWatch must exist before IAM (so the role policy can lock down the specific log group ARN), and both must exist before Lambda.

---

## IAM permissions

The Lambda execution role is granted only what is needed:

| Action | Resource scope |
|--------|---------------|
| `ec2:DescribeInstances`, `ec2:DescribeImages`, `ec2:DescribeVpcs`, `ec2:DescribeSubnets`, `ec2:DescribeSecurityGroups`, `ec2:DescribeKeyPairs`, `ec2:DescribeAvailabilityZones` | `*` (Describe is not resource-scopeable) |
| `ec2:RunInstances` | `*` |
| `ec2:StartInstances`, `ec2:StopInstances`, `ec2:RebootInstances`, `ec2:TerminateInstances`, `ec2:CreateTags` | `arn:aws:ec2:{region}:{account}:instance/*` |
| `iam:ListInstanceProfiles` | `*` |
| `iam:PassRole` | `*` with condition `iam:PassedToService = "ec2.amazonaws.com"` |
| `logs:CreateLogStream`, `logs:PutLogEvents` | Specific log group ARN from CloudWatch module |
| X-Ray: `AWSXRayDaemonWriteAccess` | Managed policy attachment |

---

## Data flow — Create Instance

```
Browser                   API GW             Lambda                AWS EC2
  │                          │                  │                     │
  │── POST /instances ───────►                  │                     │
  │   { instance_name,       │                  │                     │
  │     ami_id, subnet_id,   │                  │                     │
  │     security_group_id,   │── invoke ────────►                     │
  │     tags, ... }          │                  │─ describe_images() ─►
  │                          │                  │◄── RootDeviceName ──│
  │                          │                  │─ run_instances() ───►
  │                          │                  │◄── instance data ───│
  │◄────────── 201 ──────────│◄── response ─────│
  │   { instance: { ... } }  │                  │
```

---

## Deployment topology

```
Developer machine
└── terraform apply
    ├── Creates Lambda function (zipped from backend/lambda/)
    ├── Creates API Gateway HTTP API
    ├── Creates CloudWatch log groups + alarm
    └── Creates IAM role with least-privilege policies

frontend/.env  ←  paste api_gateway_url from terraform output
npm run dev    →  http://localhost:3000  (development)
npm run build  →  dist/  (deploy to S3+CloudFront, Amplify, etc.)
```
