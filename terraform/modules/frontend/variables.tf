variable "name_prefix" {
  description = "Resource name prefix (project-environment)"
  type        = string
}

variable "price_class" {
  description = "CloudFront price class (PriceClass_100 = US/EU, PriceClass_All = global)"
  type        = string
  default     = "PriceClass_100"
}
