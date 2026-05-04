variable "env" {
  type        = string
  description = "Environment name (dev|stg|prod)."
}

variable "zone_id" {
  type        = string
  description = "Route53 hosted zone ID used for DNS validation records. Empty disables DNS validation (cert plan will hang at ISSUED)."
  default     = ""
}

variable "alb_domain_name" {
  type        = string
  description = "Primary FQDN for the ALB certificate (e.g. `api.dev.work-manager.molcube.com`). Empty disables ALB cert."
  default     = ""
}

variable "alb_subject_alternative_names" {
  type        = list(string)
  description = "Additional SANs for the ALB certificate (regional)."
  default     = []
}

variable "cloudfront_domain_name" {
  type        = string
  description = "Primary FQDN for the CloudFront cert (must be in us-east-1). Empty disables CloudFront cert."
  default     = ""
}

variable "cloudfront_subject_alternative_names" {
  type        = list(string)
  description = "Additional SANs for the CloudFront certificate (us-east-1)."
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
