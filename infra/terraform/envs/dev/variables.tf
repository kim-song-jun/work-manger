variable "region" {
  type        = string
  description = "AWS region for all regional resources."
  default     = "ap-northeast-2"
}

variable "alert_emails" {
  type        = list(string)
  description = "Email subscribers for the SNS ops alerts topic."
  default     = []
}

variable "spa_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for the SPA assets."
}

variable "spa_domain_aliases" {
  type        = list(string)
  description = "CloudFront alternate domain names. Leave empty to skip custom domain."
  default     = []
}

variable "spa_acm_certificate_arn" {
  type        = string
  description = "ACM cert ARN in us-east-1 for the SPA aliases. Empty disables aliases."
  default     = ""
}

variable "alb_acm_certificate_arn" {
  type        = string
  description = "ACM cert ARN in the ALB's region for the HTTPS listener. Empty leaves listener unconfigured."
  default     = ""
}

variable "route53_zone_name" {
  type        = string
  description = "Hosted zone domain (e.g. dev.work-manager.molcube.com). Empty skips DNS."
  default     = ""
}

variable "api_record_name" {
  type        = string
  description = "FQDN of the API record (e.g. api.dev.work-manager.molcube.com). Empty skips."
  default     = ""
}

variable "image_api" {
  type        = string
  description = "Container image URI for api/ws/worker/beat (single Django image)."
}
