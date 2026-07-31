variable "name_prefix" {
  description = "Resource name prefix"
  type        = string
}

variable "log_retention_days" {
  description = "Log retention in days"
  type        = number
  default     = 14
}
