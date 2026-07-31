variable "name_prefix"            { type = string }
variable "lambda_invoke_arn"      { type = string }
variable "lambda_function_arn"    { type = string }
variable "lambda_function_name"   { type = string }
variable "access_log_group_arn"   { type = string }
variable "allowed_origins"        { type = list(string) }

variable "throttling_burst_limit" {
  type    = number
  default = 100
}

variable "throttling_rate_limit" {
  type    = number
  default = 50
}
