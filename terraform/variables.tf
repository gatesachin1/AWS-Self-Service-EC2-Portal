variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short project identifier — used as a prefix for all resource names"
  type        = string
  default     = "ec2-portal"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,32}$", var.project_name))
    error_message = "project_name must be 3-32 lowercase alphanumeric characters or hyphens."
  }
}

variable "environment" {
  description = "Deployment environment (dev | staging | prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "allowed_origins" {
  description = "CORS allowed origins for API Gateway (use [\"*\"] for development)"
  type        = list(string)
  default     = ["*"]
}

variable "lambda_memory_mb" {
  description = "Lambda function memory in MB (128–10240)"
  type        = number
  default     = 256

  validation {
    condition     = var.lambda_memory_mb >= 128 && var.lambda_memory_mb <= 10240
    error_message = "lambda_memory_mb must be between 128 and 10240."
  }
}

variable "lambda_timeout_seconds" {
  description = "Lambda function timeout in seconds (max 900)"
  type        = number
  default     = 30

  validation {
    condition     = var.lambda_timeout_seconds >= 1 && var.lambda_timeout_seconds <= 900
    error_message = "lambda_timeout_seconds must be between 1 and 900."
  }
}

variable "log_retention_days" {
  description = "CloudWatch log group retention in days"
  type        = number
  default     = 14

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653], var.log_retention_days)
    error_message = "log_retention_days must be a valid CloudWatch retention value."
  }
}

variable "throttling_burst_limit" {
  description = "API Gateway route burst throttling limit"
  type        = number
  default     = 100
}

variable "throttling_rate_limit" {
  description = "API Gateway route steady-state requests per second"
  type        = number
  default     = 50
}

variable "cloudfront_price_class" {
  description = "CloudFront price class — PriceClass_100 (US/EU, cheapest) or PriceClass_All (global)"
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "cloudfront_price_class must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}
