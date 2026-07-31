output "portal_url" {
  description = "Live portal URL (CloudFront HTTPS)"
  value       = module.frontend.cloudfront_domain
}

output "s3_bucket_name" {
  description = "S3 bucket — upload frontend/dist/ contents here after building"
  value       = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — used for cache invalidation after deploy"
  value       = module.frontend.cloudfront_id
}

output "api_gateway_url" {
  description = "HTTP API invoke URL — set this as VITE_API_URL in the frontend .env"
  value       = module.api_gateway.api_url
}

output "api_gateway_id" {
  description = "API Gateway API ID"
  value       = module.api_gateway.api_id
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.lambda.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = module.lambda.function_arn
}

output "iam_role_arn" {
  description = "IAM execution role ARN"
  value       = module.iam.role_arn
}

output "lambda_log_group_name" {
  description = "CloudWatch log group for Lambda"
  value       = module.cloudwatch.lambda_log_group_name
}

output "api_access_log_group_name" {
  description = "CloudWatch log group for API Gateway access logs"
  value       = module.cloudwatch.api_access_log_group_name
}
