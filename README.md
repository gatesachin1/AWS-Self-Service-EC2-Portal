# AWS Cloud Console Portal

A production-ready self-service portal for launching, managing, and monitoring resources across **23 AWS services** — built on a fully serverless stack and deployed in one command.

---

## What it does

| Capability | Details |
|---|---|
| **EC2 self-service** | Launch instances (AMI, type, subnet, SG, key pair, IAM profile, volume), start / stop / reboot / terminate |
| **Live service inventory** | View real AWS resources across 23 services — fetched live from your account via Lambda + boto3 |
| **Mock fallback** | When no API URL is configured, every page shows realistic mock data instantly (zero AWS required for local dev) |
| **One-command deploy** | `.\deploy.ps1` runs Terraform, builds the frontend, uploads to S3, and invalidates CloudFront |

---

## Services covered

| Category | Services |
|---|---|
| Compute | EC2, Lambda, ECS, Auto Scaling |
| Storage | S3 |
| Database | RDS, DynamoDB |
| Networking | VPC + Subnets + Security Groups, Load Balancers, CloudFront, Route 53 |
| Security | IAM (Users + Roles) |
| Monitoring | CloudWatch (Alarms + Dashboards) |
| Messaging | SQS, SNS |
| Developer Tools | CodePipeline, CodeBuild, CodeDeploy, CodeCommit, CodeStar Connections |

---

## Architecture

```
Browser
  │
  ▼
CloudFront (HTTPS)
  │  serves React SPA from private S3 bucket (OAC / sigv4)
  │
  ▼
API Gateway HTTP API v2
  │  8 routes — GET/POST/DELETE
  │
  ▼
Lambda  (Python 3.13 · X-Ray tracing)
  ├── ec2_handler.py      — EC2 CRUD + /resources form data
  └── services_handler.py — 15 service-category readers (lazy boto3 clients)
        │
        ▼
     boto3  →  AWS services (read-only for all non-EC2 services)
```

Infrastructure is 100% managed by Terraform (5 modules). No servers, no containers.

---

## API routes

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `GET` | `/instances` | ec2_handler | List all non-terminated EC2 instances |
| `POST` | `/instances` | ec2_handler | Launch a new EC2 instance |
| `POST` | `/instances/start` | ec2_handler | Start a stopped instance |
| `POST` | `/instances/stop` | ec2_handler | Stop a running instance |
| `POST` | `/instances/reboot` | ec2_handler | Reboot an instance |
| `DELETE` | `/instances/{instanceId}` | ec2_handler | Terminate an instance |
| `GET` | `/resources` | ec2_handler | VPCs, subnets, SGs, key pairs, IAM profiles, AZs (for launch form dropdowns) |
| `GET` | `/services/{service}` | services_handler | Live inventory for any of the 15 service categories |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS v3.4, React Router 6, React Hook Form 7, Axios, react-hot-toast |
| Backend | Python 3.13, boto3, AWS Lambda (lazy client dict — warm reuse across invocations) |
| API | AWS API Gateway HTTP API v2 (payload format 2.0), CORS configured per environment |
| IaC | Terraform 1.7+, AWS provider ~> 5.30 |
| Hosting | S3 (private bucket) + CloudFront (Origin Access Control / sigv4, IPv6, HTTPS redirect) |
| Observability | CloudWatch Logs (14-day retention), AWS X-Ray active tracing |

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| AWS CLI | v2 — configured with `aws configure` |
| Terraform | 1.7+ |
| Node.js | 18+ |
| Python | 3.11+ (for running backend unit tests) |

---

## Quick start — deploy to AWS

```powershell
# From the project root (Windows / PowerShell)
.\deploy.ps1
```

The script does everything in 5 steps:
1. Verifies AWS credentials (`aws sts get-caller-identity`)
2. `terraform init` + `terraform apply` — creates all AWS infrastructure
3. Reads the API Gateway URL from Terraform outputs
4. Builds the React frontend with the real `VITE_API_URL`
5. Syncs `frontend/dist/` to S3 (correct cache headers) and invalidates CloudFront

**Output at the end:**
```
=== Deployment complete! ===

  Portal is live at: https://xxxxxxxxxxxx.cloudfront.net
  (CloudFront propagation takes ~2-3 minutes)
```

> First deploy takes ~10-15 minutes (CloudFront distribution provisioning).
> Re-deploys take ~2-3 minutes.

---

## Manual deploy

### 1. Deploy infrastructure

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # edit region, project_name, environment
terraform init
terraform apply
# Note the api_gateway_url output value
```

### 2. Build and serve the frontend locally

```bash
cd frontend
cp .env.example .env                           # paste api_gateway_url into VITE_API_URL
npm install
npm run dev                                    # → http://localhost:3001
```

### 3. Run without AWS (mock mode)

Start the mock API server (requires Node.js, serves on port 4000):

```bash
node mock-api/server.js
```

Then in a second terminal:

```bash
cd frontend
# .env should have VITE_API_URL=http://localhost:4000
npm run dev                                    # → http://localhost:3001
```

All service pages return realistic mock data from `frontend/src/data/servicesData.js`.

### 4. Upload to S3 (production)

```bash
# HTML files — no cache
aws s3 sync frontend/dist/ s3://<bucket> --delete \
    --cache-control "no-cache, no-store, must-revalidate" \
    --exclude "*" --include "*.html"

# Hashed assets — 1-year cache
aws s3 sync frontend/dist/ s3://<bucket> --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html"

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

---

## Terraform configuration

| Variable | Default | Description |
|---|---|---|
| `aws_region` | `us-east-1` | AWS region for all resources |
| `project_name` | `ecc-portal` | Prefix for all resource names |
| `environment` | `dev` | `dev`, `staging`, or `prod` |
| `allowed_origins` | `["*"]` | CORS — set to your CloudFront domain in production |
| `lambda_memory_mb` | `256` | Lambda memory (128–10240 MB) |
| `lambda_timeout_seconds` | `30` | Lambda timeout (max 900s) |
| `log_retention_days` | `14` | CloudWatch log retention |
| `throttling_burst_limit` | `100` | API Gateway burst limit |
| `throttling_rate_limit` | `50` | API Gateway steady-state RPS |
| `cloudfront_price_class` | `PriceClass_100` | `PriceClass_100` (US/EU), `PriceClass_200`, or `PriceClass_All` |

---

## Project structure

```
├── backend/
│   ├── lambda/
│   │   ├── ec2_handler.py        Lambda entry point — EC2 CRUD + /resources + route dispatch
│   │   ├── services_handler.py   GET /services/{service} — 15 service-category readers
│   │   ├── utils.py              CORS headers, response helpers, tag builder, instance parser
│   │   ├── validators.py         Input validation, allowed instance types
│   │   └── requirements.txt
│   └── tests/
│       └── test_ec2_handler.py
│
├── frontend/                     Production React app (Vite + Tailwind)
│   ├── src/
│   │   ├── api/
│   │   │   ├── ec2.js            Axios client for EC2 endpoints
│   │   │   └── services.js       Axios client for /services/{service}
│   │   ├── hooks/
│   │   │   ├── useInstances.js   EC2 instance list with polling
│   │   │   ├── useResources.js   Form dropdown data (VPCs, subnets, etc.)
│   │   │   └── useServiceData.js Live fetch with mock fallback + error banner
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateInstance.jsx
│   │   │   ├── ManageInstances.jsx
│   │   │   ├── VpcPage.jsx        VPCs + Subnets + Security Groups (tabbed)
│   │   │   ├── IamPage.jsx        Users + Roles (tabbed)
│   │   │   ├── CloudWatchPage.jsx Alarms + Dashboards (tabbed)
│   │   │   ├── DeveloperToolsPage.jsx  Pipelines / Builds / Deploy / Repos / Connections
│   │   │   └── GenericService.jsx  Reusable page for list-type services
│   │   ├── components/
│   │   │   ├── layout/           Layout, Sidebar (collapsible, 8 categories), TopBar
│   │   │   └── ui/               Badge, ConfirmModal, ErrorBanner, ServiceTable, Spinner, StatsCard
│   │   └── data/
│   │       └── servicesData.js   Mock data for all 23 services (used when no API URL set)
│   ├── .env.example
│   └── vite.config.js
│
├── terraform/
│   ├── main.tf                   Wires all 5 modules together
│   ├── variables.tf
│   ├── outputs.tf                portal_url, api_gateway_url, s3_bucket_name, etc.
│   ├── terraform.tfvars.example
│   └── modules/
│       ├── api_gateway/          HTTP API v2, routes, Lambda integration, CORS, throttling
│       ├── cloudwatch/           Log groups (Lambda + API Gateway access logs)
│       ├── frontend/             S3 bucket (private) + CloudFront (OAC/sigv4, SPA routing)
│       ├── iam/                  Lambda execution role — EC2 ops + read-only for 23 services
│       └── lambda/               Lambda function, X-Ray tracing
│
├── mock-api/
│   └── server.js                 Local Express server — mirrors all API routes with mock data
│
├── src/                          Stage 1 — standalone mock UI (no AWS, runs at localhost:3000)
│
├── docs/
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── deployment-guide.md
│   └── testing-guide.md
│
├── deploy.ps1                    One-command deploy (PowerShell)
└── .gitignore
```

---

## Frontend environment variables

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `https://abc123.execute-api.us-east-1.amazonaws.com` | API Gateway invoke URL. Omit entirely to run in mock-data mode. |

Copy `.env.example` to `.env` and set this value before `npm run build`.

---

## Running tests

```bash
pip install pytest boto3
pytest backend/tests/ -v
```

---

## Teardown

```powershell
# Empty the S3 bucket first (Terraform cannot delete a non-empty bucket)
aws s3 rm s3://<bucket-name> --recursive

cd terraform
terraform destroy
```

> EC2 instances launched through the portal are **not** destroyed by `terraform destroy`. Terminate them via the portal or AWS Console first.

---

## Estimated cost

Running with default settings (`PriceClass_100`, 256 MB Lambda, 14-day logs, low traffic):

| Resource | Estimated monthly cost |
|---|---|
| Lambda | < $0.01 (free tier covers ~1M requests) |
| API Gateway | < $0.01 (free tier covers 1M calls/month for 12 months) |
| CloudFront | ~$1–2 (PriceClass_100, minimal traffic) |
| S3 | < $0.01 (static files, < 5 MB) |
| CloudWatch Logs | < $0.50 (14-day retention) |
| **Total** | **~$2–3 / month** |

Costs scale with traffic. Destroy with `terraform destroy` when not in use.

---

## Author

**Sachin Gate**
- GitHub: [@gatesachin1](https://github.com/gatesachin1)
- Email: gatesachin1112@gmail.com
