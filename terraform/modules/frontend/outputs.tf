output "bucket_name" {
  description = "S3 bucket name — upload frontend/dist/ contents here"
  value       = aws_s3_bucket.frontend.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.frontend.arn
}

output "cloudfront_domain" {
  description = "HTTPS URL of the deployed portal"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_id" {
  description = "CloudFront distribution ID — needed to invalidate cache after deploy"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
