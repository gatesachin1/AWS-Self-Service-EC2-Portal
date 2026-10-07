locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ── Package Lambda source into a zip ─────────────────────────────────────
data "archive_file" "lambda_package" {
  type        = "zip"
  source_dir  = "${path.root}/../backend/lambda"
  output_path = "${path.root}/../backend/lambda_package.zip"
  excludes    = ["__pycache__", "*.pyc", "*.md", "tests"]
}

# ── CloudWatch log groups ─────────────────────────────────────────────────
module "cloudwatch" {
  source = "./modules/cloudwatch"

  name_prefix        = local.name_prefix
  log_retention_days = var.log_retention_days
}

# ── IAM role for Lambda ───────────────────────────────────────────────────
module "iam" {
  source = "./modules/iam"

  name_prefix       = local.name_prefix
  lambda_log_group_arn = module.cloudwatch.lambda_log_group_arn
}

# ── Lambda function ───────────────────────────────────────────────────────
module "lambda" {
  source = "./modules/lambda"

  name_prefix          = local.name_prefix
  lambda_package_path  = data.archive_file.lambda_package.output_path
  lambda_source_hash   = data.archive_file.lambda_package.output_base64sha256
  iam_role_arn         = module.iam.role_arn
  lambda_log_group_name = module.cloudwatch.lambda_log_group_name
  memory_mb            = var.lambda_memory_mb
  timeout_seconds      = var.lambda_timeout_seconds
  environment          = var.environment
  project_name         = var.project_name
}

# ── Frontend hosting (S3 + CloudFront) ───────────────────────────────────
module "frontend" {
  source = "./modules/frontend"

  name_prefix = local.name_prefix
  price_class = var.cloudfront_price_class
}

# ── API Gateway HTTP API ──────────────────────────────────────────────────
# CORS origins come from var.allowed_origins rather than referencing
# module.frontend directly, so the API Gateway + Lambda stack can be deployed
# (or -target'd) independently of the S3/CloudFront frontend module — e.g.
# for local development against a real backend. Once you deploy the frontend
# module, add its CloudFront domain to allowed_origins in terraform.tfvars.
module "api_gateway" {
  source = "./modules/api_gateway"

  name_prefix              = local.name_prefix
  lambda_invoke_arn        = module.lambda.invoke_arn
  lambda_function_arn      = module.lambda.function_arn
  lambda_function_name     = module.lambda.function_name
  allowed_origins          = var.allowed_origins
  access_log_group_arn     = module.cloudwatch.api_access_log_group_arn
  throttling_burst_limit   = var.throttling_burst_limit
  throttling_rate_limit    = var.throttling_rate_limit
}
