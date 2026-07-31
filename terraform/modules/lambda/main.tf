resource "aws_lambda_function" "ec2_handler" {
  function_name    = "${var.name_prefix}-handler"
  role             = var.iam_role_arn
  handler          = "ec2_handler.lambda_handler"
  runtime          = "python3.13"
  filename         = var.lambda_package_path
  source_code_hash = var.lambda_source_hash
  memory_size      = var.memory_mb
  timeout          = var.timeout_seconds
  description      = "EC2 Self-Service Portal backend handler"

  environment {
    variables = {
      ENVIRONMENT       = var.environment
      PROJECT_NAME      = var.project_name
      LOG_LEVEL         = "INFO"
      # Referencing the log group name creates an implicit Terraform dependency
      CW_LOG_GROUP_NAME = var.lambda_log_group_name
    }
  }

  tracing_config {
    mode = "Active"   # X-Ray active tracing
  }
}
