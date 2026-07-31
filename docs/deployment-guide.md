# Deployment Guide

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| AWS CLI | 2.x, configured with `aws configure` |
| Terraform | 1.7.0+ |
| Node.js | 18+ |
| Python | 3.11+ (for running tests) |

The IAM user/role running Terraform must have permissions to create Lambda, API Gateway, IAM roles/policies, and CloudWatch resources.

---

## Step 1 — Run unit tests

```bash
cd backend
pip install pytest
pytest tests/ -v
```

All tests must pass before deploying.

---

## Step 2 — Deploy infrastructure (Terraform)

```bash
cd terraform

# Initialise providers and modules
terraform init

# Copy example vars and edit
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: set aws_region, project_name, environment

# Preview changes
terraform plan

# Deploy
terraform apply
```

On success Terraform prints the API Gateway URL:

```
Outputs:
  api_gateway_url = "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com"
```

---

## Step 3 — Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
```

Paste the exact URL from `terraform output api_gateway_url`.

---

## Step 4 — Run the frontend locally

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Step 5 — Build for production

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

Host `dist/` on S3 + CloudFront, Amplify, or any static host.

---

## Teardown

```bash
cd terraform
terraform destroy
```

This removes the Lambda, API Gateway, IAM roles, and CloudWatch log groups. EC2 instances launched through the portal are **not** destroyed automatically — terminate them first through the portal or AWS Console.

---

## Environment variables reference

| Variable | Where set | Description |
|----------|-----------|-------------|
| `VITE_API_URL` | `frontend/.env` | API Gateway invoke URL |
| `AWS_REGION` | Lambda runtime | Set automatically by Lambda |
| `LOG_LEVEL` | Lambda env (Terraform) | `INFO` or `DEBUG` |
