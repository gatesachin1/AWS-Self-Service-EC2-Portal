# deploy.ps1 — full deploy: Terraform backend + build frontend + upload to S3
# Run from the project root: .\deploy.ps1
# Requires: aws CLI, Terraform, Node.js — all must be in PATH

$ErrorActionPreference = "Stop"
$ROOT = $PSScriptRoot

Write-Host "`n=== AWS Cloud Console Portal — Deploy ===" -ForegroundColor Cyan

# ── 1. Check AWS credentials ──────────────────────────────────────────────────
Write-Host "`n[1/5] Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "  Account : $($identity.Account)" -ForegroundColor Green
    Write-Host "  User/Role: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "`nERROR: AWS credentials not configured or expired." -ForegroundColor Red
    Write-Host "Run one of these to fix:" -ForegroundColor Yellow
    Write-Host "  aws configure                   # IAM user access keys"
    Write-Host "  aws sso login --profile <name>  # SSO profile"
    Write-Host "  setx AWS_ACCESS_KEY_ID <key>    # environment variable"
    exit 1
}

# ── 2. Terraform apply ────────────────────────────────────────────────────────
Write-Host "`n[2/5] Running Terraform..." -ForegroundColor Yellow
Set-Location "$ROOT\terraform"

terraform init -upgrade
if ($LASTEXITCODE -ne 0) { Write-Host "terraform init failed" -ForegroundColor Red; exit 1 }

terraform apply -auto-approve
if ($LASTEXITCODE -ne 0) { Write-Host "terraform apply failed" -ForegroundColor Red; exit 1 }

# ── 3. Read Terraform outputs ─────────────────────────────────────────────────
Write-Host "`n[3/5] Reading Terraform outputs..." -ForegroundColor Yellow
$API_URL     = terraform output -raw api_gateway_url
$S3_BUCKET   = terraform output -raw s3_bucket_name
$CF_ID       = terraform output -raw cloudfront_distribution_id
$PORTAL_URL  = terraform output -raw portal_url

Write-Host "  API Gateway : $API_URL" -ForegroundColor Green
Write-Host "  S3 Bucket   : $S3_BUCKET" -ForegroundColor Green
Write-Host "  CloudFront  : $PORTAL_URL" -ForegroundColor Green

# ── 4. Build frontend ─────────────────────────────────────────────────────────
Write-Host "`n[4/5] Building frontend..." -ForegroundColor Yellow
Set-Location "$ROOT\frontend"

# Write real API URL to .env
"VITE_API_URL=$API_URL" | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 }

npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "npm run build failed" -ForegroundColor Red; exit 1 }

# ── 5. Upload to S3 + invalidate CloudFront cache ────────────────────────────
Write-Host "`n[5/5] Uploading to S3 and invalidating CloudFront cache..." -ForegroundColor Yellow

# Sync with proper cache headers
#   - HTML files: no-cache so browsers always check for updates
#   - Assets (hashed filenames): cache 1 year
aws s3 sync dist/ "s3://$S3_BUCKET" --delete `
    --cache-control "no-cache, no-store, must-revalidate" `
    --exclude "*" --include "*.html"

aws s3 sync dist/ "s3://$S3_BUCKET" --delete `
    --cache-control "public, max-age=31536000, immutable" `
    --exclude "*.html"

# Invalidate CloudFront so changes are live immediately
aws cloudfront create-invalidation `
    --distribution-id $CF_ID `
    --paths "/*" | Out-Null

Write-Host "`n=== Deployment complete! ===" -ForegroundColor Green
Write-Host "`n  Portal is live at: $PORTAL_URL" -ForegroundColor Cyan
Write-Host "  (CloudFront propagation takes ~2-3 minutes)`n"

Set-Location $ROOT
