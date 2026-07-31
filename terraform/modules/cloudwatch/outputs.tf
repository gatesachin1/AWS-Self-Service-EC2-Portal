output "lambda_log_group_name" {
  value = aws_cloudwatch_log_group.lambda.name
}

output "lambda_log_group_arn" {
  value = aws_cloudwatch_log_group.lambda.arn
}

output "api_access_log_group_name" {
  value = aws_cloudwatch_log_group.api_access.name
}

output "api_access_log_group_arn" {
  value = aws_cloudwatch_log_group.api_access.arn
}
