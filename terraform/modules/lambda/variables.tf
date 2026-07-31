variable "name_prefix"               { type = string }
variable "lambda_package_path"       { type = string }
variable "lambda_source_hash"        { type = string }
variable "iam_role_arn"              { type = string }
variable "lambda_log_group_name"     { type = string }
variable "environment"               { type = string }
variable "project_name"              { type = string }

variable "memory_mb" {
  type    = number
  default = 256
}

variable "timeout_seconds" {
  type    = number
  default = 30
}
