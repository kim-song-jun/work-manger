variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for the SPA assets."
}

variable "domain_aliases" {
  type        = list(string)
  description = "CloudFront alternate domain names (e.g. [\"app.work-manager.molcube.com\"]). Empty uses default CF domain only."
  default     = []
}

variable "acm_certificate_arn" {
  type        = string
  description = "ACM certificate ARN in us-east-1 for the alternate domains. Empty disables aliases / custom domain."
  default     = ""
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 hosted zone ID for the domain (creates A/AAAA aliases). Empty skips DNS creation."
  default     = ""
}

variable "price_class" {
  type        = string
  description = "CloudFront price class."
  default     = "PriceClass_200"
}

variable "log_retention_days" {
  type        = number
  description = "CloudFront real-time logs retention (only applies if log bucket is supplied)."
  default     = 30
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
