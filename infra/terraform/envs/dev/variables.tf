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

variable "pagerduty_endpoint_url" {
  type        = string
  description = "PagerDuty Events API URL — see README §8. Empty disables PD subscription."
  default     = ""
  sensitive   = true
}

variable "spa_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for the SPA assets. Empty → derived from pattern + account_id_short."
  default     = ""
}

variable "account_id_short" {
  type        = string
  description = "Last-6 digits of AWS account ID. Required if spa_bucket_name is empty."
  default     = ""
}

variable "spa_domain_aliases" {
  type        = list(string)
  description = "CloudFront alternate domain names. Leave empty to skip custom domain."
  default     = []
}

variable "spa_acm_certificate_arn" {
  type        = string
  description = "Fallback ACM cert ARN in us-east-1 (used only if module.acm doesn't produce one). Empty disables aliases."
  default     = ""
}

variable "alb_acm_certificate_arn" {
  type        = string
  description = "Fallback ACM cert ARN in the ALB region (used only if module.acm doesn't produce one)."
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

variable "spa_record_name" {
  type        = string
  description = "FQDN of the SPA record (e.g. app.dev.work-manager.molcube.com). Empty skips."
  default     = ""
}

variable "enable_waf" {
  type        = bool
  description = "Attach WAFv2 web ACL to the ALB. Disabled by default in dev to save cost."
  default     = false
}

variable "waf_geo_block_country_codes" {
  type        = list(string)
  description = "ISO 3166-1 alpha-2 country codes to block via WAF. Empty disables."
  default     = []
}

variable "waf_enable_bot_control" {
  type        = bool
  description = "Enable WAF bot-control managed rule set (cost impact ~$10/mo)."
  default     = false
}

variable "image_api" {
  type        = string
  description = "Container image URI for api/ws/worker/beat (single Django image)."
}
