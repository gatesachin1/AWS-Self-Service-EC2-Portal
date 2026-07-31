variable "name_prefix" {
  description = "Resource name prefix (project-environment)"
  type        = string
}

variable "lambda_log_group_arn" {
  description = "ARN of the Lambda CloudWatch log group"
  type        = string
}
