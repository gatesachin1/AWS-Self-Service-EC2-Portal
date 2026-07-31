output "role_arn" {
  description = "ARN of the Lambda IAM execution role"
  value       = aws_iam_role.lambda_execution.arn
}

output "role_name" {
  description = "Name of the Lambda IAM execution role"
  value       = aws_iam_role.lambda_execution.name
}
