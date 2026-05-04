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
  description = "PagerDuty Events API URL — see README §8."
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
  description = "Last-6 digits of AWS account ID."
  default     = ""
}

variable "spa_domain_aliases" {
  type        = list(string)
  description = "CloudFront alternate domain names."
  default     = []
}

variable "spa_acm_certificate_arn" {
  type        = string
  description = "Fallback ACM cert ARN in us-east-1 (used only if module.acm doesn't produce one)."
  default     = ""
}

variable "alb_acm_certificate_arn" {
  type        = string
  description = "Fallback ACM cert ARN in the ALB's region (used only if module.acm doesn't produce one)."
  default     = ""
}

variable "route53_zone_name" {
  type        = string
  description = "Hosted zone domain (e.g. stg.work-manager.molcube.com)."
  default     = ""
}

variable "api_record_name" {
  type        = string
  description = "FQDN of the API record."
  default     = ""
}

variable "spa_record_name" {
  type        = string
  description = "FQDN of the SPA record."
  default     = ""
}

variable "enable_waf" {
  type        = bool
  description = "Attach WAFv2 web ACL to the ALB."
  default     = true
}

variable "waf_geo_block_country_codes" {
  type        = list(string)
  description = "ISO 3166-1 alpha-2 country codes to block via WAF."
  default     = []
}

variable "waf_enable_bot_control" {
  type        = bool
  description = "Enable WAF bot-control managed rule set."
  default     = false
}

variable "image_api" {
  type        = string
  description = "Container image URI for api/ws/worker/beat."
}

# ──────────────────────── desktop-updates ───────────────────────────────────

variable "desktop_updates_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for the Electron desktop auto-update artifacts. Empty → derived from `workmanager-desktop-updates-<env>-<account_id_short>`."
  default     = ""
}

variable "desktop_updates_enable_cloudfront" {
  type        = bool
  description = "Front the desktop-updates bucket with CloudFront + OAC. v1: false (S3 SigV4 direct)."
  default     = false
}

variable "desktop_updates_cloudfront_aliases" {
  type        = list(string)
  description = "Optional CNAMEs for the CloudFront updates distribution."
  default     = []
}

variable "desktop_updates_acm_certificate_arn" {
  type        = string
  description = "ACM cert ARN (us-east-1) for the desktop-updates CloudFront aliases."
  default     = ""
}

variable "desktop_updates_publish_principal_arns" {
  type        = list(string)
  description = "IAM ARNs (CI runner role) allowed to PutObject into the desktop-updates bucket."
  default     = []
}
